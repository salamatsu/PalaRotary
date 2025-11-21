import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, Upload, message, Card, Typography, Spin, Divider } from "antd";
import { QrCode, Upload as UploadIcon, Scan, ArrowRight } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { getMemberDetails } from "../../services/api/palarotaryApi";

const { Title, Text } = Typography;

const ShirtValidation = () => {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const validateMember = async (memberId) => {
    try {
      setLoading(true);
      const response = await getMemberDetails(memberId);

      if (response.success && response.data) {
        message.success("Badge validated successfully!");
        // Navigate to ordering page with member data
        navigate("/order-shirt", {
          state: {
            memberData: response.data
          }
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

          // Extract member ID from QR code
          try {
            const qrData = JSON.parse(decodedText);
            if (qrData.memberId) {
              await validateMember(qrData.memberId);
            } else {
              message.error("Invalid QR code format");
            }
          } catch (e) {
            message.error("Failed to read QR code");
          }
        },
        (error) => {
          console.warn("QR scan error:", error);
        }
      );
    } catch (error) {
      setScanning(false);
      message.error("Failed to start camera. Please try uploading an image instead.");
      console.error("Camera error:", error);
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    try {
      const html5QrCode = new Html5Qrcode("qr-reader-upload");

      const result = await html5QrCode.scanFile(file, false);

      // Extract member ID from QR code
      try {
        const qrData = JSON.parse(result);
        if (qrData.memberId) {
          await validateMember(qrData.memberId);
        } else {
          message.error("Invalid QR code format");
        }
      } catch (e) {
        message.error("Failed to read QR code from image");
      }
    } catch (error) {
      message.error("Failed to scan QR code from image");
      console.error("Upload scan error:", error);
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
        bypassValidation: true
      }
    });
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
          <div className="space-y-4">
            <Button
              type="primary"
              size="large"
              icon={<Scan size={20} />}
              onClick={handleScan}
              disabled={loading}
              block
              className="h-14"
            >
              Scan QR Code with Camera
            </Button>

            <Upload
              beforeUpload={handleUpload}
              accept="image/*"
              showUploadList={false}
              disabled={loading}
            >
              <Button
                size="large"
                icon={<UploadIcon size={20} />}
                disabled={loading}
                block
                className="h-14"
              >
                Upload QR Code Image
              </Button>
            </Upload>

            {loading && (
              <div className="text-center py-4">
                <Spin size="large" />
                <div className="mt-2">
                  <Text type="secondary">Validating badge...</Text>
                </div>
              </div>
            )}

            <Divider>or</Divider>

            <Button
              type="default"
              size="large"
              icon={<ArrowRight size={20} />}
              onClick={handleBypass}
              disabled={loading}
              block
              className="h-14"
            >
              Continue Without Badge
            </Button>
          </div>
        )}

        <div id="qr-reader-upload" className="hidden" />
      </Card>
    </div>
  );
};

export default ShirtValidation;
