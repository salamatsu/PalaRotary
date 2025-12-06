import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, Upload, message, Card, Typography, Spin, Divider } from "antd";
import {
  QrCode,
  Upload as UploadIcon,
  Scan,
  ArrowRight,
  Home,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
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

  const handleScan = async () => {
    setScanning(true);
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await html5QrCode.stop();
          setScanning(false);

          // Validate and process QR code
          await validateMember(decodedText);
        },
        (error) => {
          console.warn("QR scan error:", error);
        }
      );
    } catch (error) {
      setScanning(false);
      message.error(
        "Failed to start camera. Please try uploading an image instead."
      );
      console.error("Camera error:", error);
    }
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
      const html5QrCode = new Html5Qrcode("qr-reader-upload");

      // Try to scan with more lenient settings
      const result = await html5QrCode.scanFile(file, true);
      console.log("QR code detected:", result);

      // Validate and process QR code
      await validateMember(result);
    } catch (error) {
      console.error("Upload scan error:", error);

      // Provide specific error messages based on error type
      if (error.name === "NotFoundException") {
        message.error({
          content:
            "No QR code detected in the image. Please ensure the QR code is clearly visible and try again.",
          duration: 5,
        });
      } else if (error.message?.includes("Unable to read")) {
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
            <div id="qr-reader" className="rounded-lg overflow-hidden" />
          </div>
        )}

        {!scanning && (
          <div className="flex flex-col gap-3">
            {/* <Button
              type="primary"
              size="large"
              icon={<Scan size={20} />}
              onClick={handleScan}
              disabled={loading}
              block
            >
              Scan QR Code with Camera
            </Button> */}

            <Upload
              beforeUpload={handleUpload}
              accept="image/*"
              showUploadList={false}
              disabled={loading}
              style={{ width: "100%" }}
            >
              <Button
                size="large"
                icon={<UploadIcon size={20} />}
                disabled={loading}
                block
              >
                Upload QR Code Image
              </Button>
            </Upload>

            <Button
              type="primary"
              danger
              size="large"
              icon={<Home size={20} />}
              onClick={handleBack}
              disabled={loading}
              block
              className="h-14"
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

        <div id="qr-reader-upload" className="hidden" />
      </Card>
    </div>
  );
};

export default ShirtValidation;
