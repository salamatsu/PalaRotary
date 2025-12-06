import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, Upload, message, Card, Typography, Spin, Divider } from "antd";
import {
  QrCode,
  Upload as UploadIcon,
  Scan,
  ArrowRight,
  Home,
  Camera,
} from "lucide-react";
import { BrowserQRCodeReader } from "@zxing/browser";

const { Dragger } = Upload;
import { useGetVerifyQrCode } from "../../services/requests/usePalarotary";

// QR Code Format: qrCode:firstName:lastName:eventTag:origin
// - qrCode: must be exactly 18 characters
// - origin: P (preregistration) or O (onsite)
// - Total: 5 parts separated by 4 colons

const { Title, Text } = Typography;

const ShirtValidation = () => {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  const { mutateAsync: verifyQrCode } = useGetVerifyQrCode();
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Validate QR code format before API call
  const validateQrCodeFormat = (scannedValue) => {
    // Split by colon
    const parts = scannedValue.split(":");

    // Check if we have exactly 5 parts (qrCode:firstName:lastName:eventTag:origin)
    if (parts.length !== 5) {
      return {
        isValid: false,
        error:
          "Invalid QR code format. Expected format: qrCode:firstName:lastName:eventTag:origin",
      };
    }

    const [qrCode, firstName, lastName, eventTag, origin] = parts;

    // Validate qrCode length (must be 18 chars)
    if (qrCode.length !== 18) {
      return {
        isValid: false,
        error: "Invalid QR code ID. Must be exactly 18 characters.",
      };
    }

    // Validate all parts are non-empty
    if (!firstName || !lastName || !eventTag || !origin) {
      return {
        isValid: false,
        error: "QR code is incomplete. All fields are required.",
      };
    }

    // Validate origin (must be P or O)
    if (origin !== "P" && origin !== "O") {
      return {
        isValid: false,
        error:
          "Invalid origin code. Must be 'P' (preregistration) or 'O' (onsite).",
      };
    }

    return {
      isValid: true,
      data: { qrCode, firstName, lastName, eventTag, origin },
    };
  };

  const validateMember = async (qrCode) => {
    // Validate QR code format
    const validation = validateQrCodeFormat(qrCode);
    if (!validation.isValid) {
      message.error(validation.error);
      return;
    }

    try {
      setLoading(true);
      const response = await verifyQrCode(validation.data.qrCode);

      if (response.success && response.data) {
        message.success("Badge validated successfully!");
        // Navigate to ordering page with member data
        navigate("/order-shirt", {
          state: {
            memberData: response.data,
          },
        });
      } else {
        message.error("Invalid badge. Please try again.");
      }
    } catch (error) {
      message.error("Failed to validate badge. Please try again.");
      console.error("Validation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const stopScanning = () => {
    try {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (error) {
      console.warn("Error stopping scanner:", error);
    }
    setScanning(false);
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      // Initialize the QR code reader
      const codeReader = new BrowserQRCodeReader();

      // Get available video devices
      const videoInputDevices =
        await BrowserQRCodeReader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        throw new Error("No camera found on this device");
      }

      // Select back camera if available (for mobile)
      const selectedDeviceId =
        videoInputDevices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear")
        )?.deviceId || videoInputDevices[0].deviceId;

      console.log(
        "Using camera:",
        videoInputDevices.find((d) => d.deviceId === selectedDeviceId)?.label
      );

      // Start decoding from video device
      controlsRef.current = await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        async (result, error) => {
          if (result) {
            console.log("QR Code detected:", result.getText());

            // Stop scanning
            stopScanning();

            // Validate and process QR code
            await validateMember(result.getText());
          }
          if (error && error.name !== "NotFoundException") {
            console.warn("Scan error:", error);
          }
        }
      );
    } catch (error) {
      console.error("Camera error:", error);
      stopScanning();

      if (error.name === "NotAllowedError") {
        message.error({
          content:
            "Camera access denied. Please allow camera permissions in your browser settings.",
          duration: 5,
        });
      } else if (error.name === "NotFoundError") {
        message.error("No camera found on this device.");
      } else if (error.message?.includes("No camera found")) {
        message.error("No camera found on this device.");
      } else {
        message.error(
          "Failed to start camera. Please try uploading an image instead."
        );
      }
    }
  };

  const handleStopScan = () => {
    stopScanning();
  };

  const handleUpload = async (file) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      message.error("Please upload a valid image file (JPG, PNG, or WebP)");
      return false;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error(
        "Image file is too large. Please upload an image smaller than 10MB"
      );
      return false;
    }

    setLoading(true);
    try {
      console.log("Scanning file:", file.name, file.type, file.size);

      // Create a URL from the file
      const imageUrl = URL.createObjectURL(file);

      // Initialize the QR code reader
      const codeReader = new BrowserQRCodeReader();

      // Decode from image URL
      const result = await codeReader.decodeFromImageUrl(imageUrl);

      // Clean up the object URL
      URL.revokeObjectURL(imageUrl);

      console.log("QR code detected:", result.getText());

      // Validate and process QR code
      await validateMember(result.getText());
    } catch (error) {
      console.error("Upload scan error:", error);

      // Provide specific error messages based on error type
      if (error.name === "NotFoundException") {
        message.error({
          content:
            "No QR code detected in the image. Please ensure the QR code is clearly visible and try again.",
          duration: 5,
        });
      } else if (
        error.message?.includes("Unable to read") ||
        error.message?.includes("Could not load image")
      ) {
        message.error(
          "Unable to read the image file. Please try a different image format."
        );
      } else {
        message.error(
          "Failed to scan QR code from image. Please ensure the image is clear and the QR code is fully visible."
        );
      }
    } finally {
      setLoading(false);
    }

    return false; // Prevent default upload behavior
  };

  const handleBypass = () => {
    message.info("Proceeding without badge validation");
    // Navigate to ordering page without member data
    navigate("/order-shirt", {
      state: {
        memberData: null,
        bypassValidation: true,
      },
    });
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <QrCode size={48} className="text-blue-600" />
            </div>
          </div>
          <Title level={2}>Badge Verification</Title>
          <Text type="secondary">
            Scan or upload your QR code badge to continue shopping
          </Text>
        </div>

        {scanning && (
          <div className="mb-6">
            <div className="relative rounded-lg overflow-hidden mb-4 bg-black">
              <video
                ref={videoRef}
                className="w-full h-auto"
                style={{ maxHeight: "400px", objectFit: "contain" }}
              />
              {/* Overlay with darkened background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 20% 20%, 20% 80%, 80% 80%, 80% 20%, 20% 20%)",
                }}
              />

              {/* Corner brackets */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none">
                {/* Top-left corner */}
                <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-blue-500" />

                {/* Top-right corner */}
                <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-blue-500" />

                {/* Bottom-left corner */}
                <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-blue-500" />

                {/* Bottom-right corner */}
                <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-blue-500" />

                {/* Scanning animation line */}
                <div
                  className="absolute left-0 right-0 h-0.5 bg-blue-500"
                  style={{
                    top: "50%",
                    animation: "scan 3s ease-in-out infinite",
                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.8)",
                  }}
                />
              </div>
            </div>
            <Button
              type="default"
              size="large"
              onClick={handleStopScan}
              block
              danger
            >
              Stop Scanning
            </Button>

            {/* Add keyframe animation for scanning line */}
            <style>{`
              @keyframes scan {
                0%, 100% { transform: translateY(-128px); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                50% { transform: translateY(0px); }
                100% { transform: translateY(128px); opacity: 0; }
              }
            `}</style>
          </div>
        )}

        {!scanning && (
          <div className="flex flex-col gap-3">
            <Button
              type="primary"
              size="large"
              icon={<Camera size={20} />}
              onClick={handleScan}
              disabled={loading}
              block
              className="h-14"
            >
              Scan QR Code with Camera
            </Button>

            <Divider style={{ margin: "8px 0" }}>or</Divider>

            <Dragger
              beforeUpload={handleUpload}
              accept="image/*"
              showUploadList={false}
              disabled={loading}
              multiple={false}
              style={{
                background: loading ? "#f5f5f5" : "transparent",
                border: "2px dashed #d9d9d9",
              }}
            >
              <div className="py-8">
                <p className="ant-upload-drag-icon mb-3">
                  <UploadIcon size={48} className="text-blue-500 mx-auto" />
                </p>
                <p className="ant-upload-text text-base font-medium">
                  Click or drag QR code image here
                </p>
                <p className="ant-upload-hint text-gray-500">
                  Support for JPG, PNG, or WebP images
                </p>
              </div>
            </Dragger>

            <Button
              type="default"
              size="large"
              icon={<Home size={20} />}
              onClick={handleBack}
              disabled={loading}
              block
              className="h-12"
            >
              Back to Home
            </Button>

            {loading && (
              <div className="text-center py-4">
                <Spin size="large" />
                <div className="mt-2">
                  <Text type="secondary">Validating badge...</Text>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ShirtValidation;
