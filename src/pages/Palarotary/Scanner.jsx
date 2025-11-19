import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  CameraOutlined,
  BarcodeOutlined,
} from "@ant-design/icons";
import { App, Button, Card, Divider, Input, Switch } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import {
  useAttendanceStats,
  useScanQRCode,
} from "../../services/requests/usePalarotary";

const Scanner = () => {
  const { message } = App.useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanMode, setScanMode] = useState("camera"); // "camera" or "input"
  const [inputValue, setInputValue] = useState("");
  const qrScannerInstance = useRef(null);
  const inputRef = useRef(null);

  const scanMutation = useScanQRCode();
  const { data: statsData, refetch: refetchStats } = useAttendanceStats();

  const stats = statsData?.data || {};

  // Auto-start scanner or focus input on mount
  useEffect(() => {
    if (scanMode === "camera") {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startCamera();
      }, 500);

      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else if (scanMode === "input" && inputRef.current) {
      // Auto-focus input
      inputRef.current.focus();
    }
  }, [scanMode]);

  // Auto-focus input after showing scan result
  useEffect(() => {
    if (scanMode === "input" && !scanResult && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
        setInputValue(""); // Clear input
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scanResult, scanMode]);

  // Initialize QR Scanner
  const startCamera = () => {
    if (qrScannerInstance.current) {
      return; // Scanner already running
    }

    try {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(onScanSuccess, onScanError);
      qrScannerInstance.current = scanner;
      setIsScanning(true);
    } catch (err) {
      console.error("Scanner initialization error:", err);
      message.error("Failed to start scanner. Please allow camera access.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (qrScannerInstance.current) {
      qrScannerInstance.current.clear().catch((err) => {
        console.error("Error clearing scanner:", err);
      });
      qrScannerInstance.current = null;
    }
    setIsScanning(false);
  };

  // Handle successful scan
  const onScanSuccess = async (decodedText) => {
    console.log("QR Code scanned:", decodedText);

    // Stop camera to prevent multiple scans
    stopCamera();

    try {
      const response = await scanMutation.mutateAsync({
        qr_data: decodedText,
        scan_type: "check-in",
        scan_location: "Main Entrance",
      });

      if (response.success) {
        setScanResult({
          member: response.data.member,
          attendance: response.data.attendance,
          isValid: true,
          alreadyCheckedIn: response.data.attendance.already_checked_in,
        });

        // Refetch stats to update dashboard
        refetchStats();
      }
    } catch (error) {
      console.error("Scan validation error:", error);
      setScanResult({
        isValid: false,
        error:
          error.response?.data?.message ||
          "Invalid QR code or member not found",
      });
    }
  };

  // Handle scan errors (silent - happens continuously while scanning)
  const onScanError = (errorMessage) => {
    // Don't log every scan error - it's too noisy
  };

  const handleContinueScanning = () => {
    setScanResult(null);
    if (scanMode === "camera") {
      // Wait for DOM to update before starting camera
      setTimeout(() => {
        startCamera();
      }, 300);
    } else if (scanMode === "input") {
      // Auto-focus input for next scan
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          setInputValue("");
        }
      }, 100);
    }
  };

  const handleScanModeChange = (checked) => {
    const newMode = checked ? "input" : "camera";
    setScanMode(newMode);
    setScanResult(null);

    if (newMode === "camera") {
      setTimeout(() => startCamera(), 300);
    } else {
      stopCamera();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleInputScan = (e) => {
    const value = e.target.value.trim();
    if (e.key === "Enter" && value) {
      // Process the scan
      onScanSuccess(value);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div style={{ padding: "12px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "12px" }}
        >
          <h1
            style={{
              color: "#fe0808",
              fontSize: "24px",
              marginBottom: "4px",
              margin: 0,
            }}
          >
            PALAROTARY 2025
          </h1>
          <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
            Event Scanner
          </p>
        </motion.div>

        {/* Scan Mode Toggle */}
        <Card style={{ marginBottom: "12px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
            <CameraOutlined style={{ fontSize: "18px", color: scanMode === "camera" ? "#fe0808" : "#999" }} />
            <Switch
              checked={scanMode === "input"}
              onChange={handleScanModeChange}
              checkedChildren="Input"
              unCheckedChildren="Camera"
            />
            <BarcodeOutlined style={{ fontSize: "18px", color: scanMode === "input" ? "#fe0808" : "#999" }} />
          </div>
          <p style={{ fontSize: "12px", color: "#999", margin: "8px 0 0 0" }}>
            {scanMode === "camera" ? "Camera Scanner Mode" : "Scanner Gun / Keyboard Input Mode"}
          </p>
        </Card>

        {/* Scanner Section */}
        <Card>
          {!scanResult ? (
            <div>
              {scanMode === "camera" ? (
                <>
                  {/* QR Scanner Container */}
                  <div
                    id="qr-reader"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  ></div>
                </>
              ) : (
                <>
                  {/* Input Scanner Mode */}
                  <div style={{ padding: "20px 0" }}>
                    <div style={{ textAlign: "center", marginBottom: "16px" }}>
                      <BarcodeOutlined style={{ fontSize: "48px", color: "#fe0808", marginBottom: "8px" }} />
                      <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                        Ready to scan with barcode scanner or keyboard input
                      </p>
                    </div>
                    <Input
                      ref={inputRef}
                      size="large"
                      placeholder="Scan QR code or enter manually..."
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyPress={handleInputScan}
                      autoFocus
                      style={{
                        fontSize: "16px",
                        textAlign: "center",
                        height: "56px",
                      }}
                    />
                    <p style={{ fontSize: "12px", color: "#999", textAlign: "center", marginTop: "12px" }}>
                      Press Enter after scanning or typing
                    </p>
                  </div>
                </>
              )}

              {scanMutation.isPending && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "12px",
                    color: "#1890ff",
                  }}
                >
                  Processing scan...
                </div>
              )}
            </div>
          ) : (
            // Scan Result Display - Compact Mobile Version
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {scanResult.isValid ? (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircleOutlined
                        style={{
                          color: scanResult.alreadyCheckedIn
                            ? "#faad14"
                            : "#52c41a",
                          fontSize: "64px",
                          marginBottom: "16px",
                        }}
                      />
                    </motion.div>

                    {/* Title */}
                    <h2
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: scanResult.alreadyCheckedIn
                          ? "#faad14"
                          : "#52c41a",
                        margin: "0 0 8px 0",
                      }}
                    >
                      {scanResult.alreadyCheckedIn
                        ? "Already Checked In!"
                        : "Check-in Successful!"}
                    </h2>

                    {/* Member Details - Compact */}
                    <div
                      style={{
                        background: "#f5f5f5",
                        borderRadius: "8px",
                        padding: "16px",
                        marginTop: "16px",
                        marginBottom: "16px",
                        textAlign: "left",
                      }}
                    >
                      {/* Name - Prominent */}
                      <div
                        style={{ marginBottom: "12px", textAlign: "center" }}
                      >
                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#fe0808",
                            margin: 0,
                            textTransform: "uppercase",
                          }}
                        >
                          {scanResult.member.name}
                        </p>
                      </div>

                      <Divider style={{ margin: "12px 0" }} />

                      {/* Badge and Club - Two Column */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                          fontSize: "13px",
                          marginBottom: "12px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              color: "#999",
                              margin: "0 0 4px 0",
                              fontSize: "11px",
                            }}
                          >
                            BADGE
                          </p>
                          <p
                            style={{
                              fontWeight: "600",
                              margin: 0,
                              color: "#000",
                            }}
                          >
                            {scanResult.member.badge_number}
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              color: "#999",
                              margin: "0 0 4px 0",
                              fontSize: "11px",
                            }}
                          >
                            CLUB
                          </p>
                          <p
                            style={{
                              fontWeight: "600",
                              margin: 0,
                              color: "#000",
                            }}
                          >
                            {scanResult.member.club}
                          </p>
                        </div>
                      </div>

                      {/* Optional Details */}
                      {(scanResult.member.callsign ||
                        scanResult.member.position) && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            fontSize: "13px",
                          }}
                        >
                          {scanResult.member.callsign && (
                            <div>
                              <p
                                style={{
                                  color: "#999",
                                  margin: "0 0 4px 0",
                                  fontSize: "11px",
                                }}
                              >
                                CALLSIGN
                              </p>
                              <p
                                style={{
                                  fontWeight: "600",
                                  margin: 0,
                                  color: "#000",
                                }}
                              >
                                {scanResult.member.callsign}
                              </p>
                            </div>
                          )}
                          {scanResult.member.position && (
                            <div>
                              <p
                                style={{
                                  color: "#999",
                                  margin: "0 0 4px 0",
                                  fontSize: "11px",
                                }}
                              >
                                POSITION
                              </p>
                              <p
                                style={{
                                  fontWeight: "600",
                                  margin: 0,
                                  color: "#000",
                                }}
                              >
                                {scanResult.member.position}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <Divider style={{ margin: "12px 0" }} />

                      {/* Timestamp */}
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          textAlign: "center",
                        }}
                      >
                        <p style={{ margin: 0 }}>
                          {new Date(
                            scanResult.attendance.scanned_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <Button
                      type="primary"
                      size="large"
                      icon={<ReloadOutlined />}
                      onClick={handleContinueScanning}
                      block
                      style={{
                        background: "#fe0808",
                        borderColor: "#fe0808",
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      Scan Next
                    </Button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    {/* Error Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CloseCircleOutlined
                        style={{
                          color: "#ff4d4f",
                          fontSize: "64px",
                          marginBottom: "16px",
                        }}
                      />
                    </motion.div>

                    {/* Title */}
                    <h2
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#ff4d4f",
                        margin: "0 0 8px 0",
                      }}
                    >
                      Invalid QR Code!
                    </h2>

                    <p style={{ color: "#666", marginBottom: "16px" }}>
                      {scanResult.error || "This QR code is not valid"}
                    </p>

                    {/* Retry Button */}
                    <Button
                      type="primary"
                      size="large"
                      icon={<ReloadOutlined />}
                      onClick={handleContinueScanning}
                      block
                      style={{
                        height: "48px",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Scanner;
