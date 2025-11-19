import { useEffect, useRef, useState } from "react";
import {
  Card,
  Alert,
  Button,
  Statistic,
  Row,
  Col,
  List,
  Tag,
  Select,
  Result,
  Divider,
  message,
} from "antd";
import {
  ScanOutlined,
  CheckCircleOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  CameraOutlined,
  StopOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import {
  useScanQRCode,
  useAttendanceStats,
} from "../../services/requests/usePalarotary";

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  const html5QrCodeRef = useRef(null);

  const scanMutation = useScanQRCode();
  const { data: statsData, refetch: refetchStats } = useAttendanceStats();

  const stats = statsData?.data || {};

  // Get available cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Default to back camera if available
          const backCamera = devices.find((device) =>
            device.label.toLowerCase().includes("back")
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
        }
      })
      .catch((err) => {
        console.error("Error getting cameras:", err);
        message.error("Unable to access cameras");
      });
  }, []);

  // Load recent scans from stats
  useEffect(() => {
    if (stats.recent_scans) {
      setRecentScans(stats.recent_scans);
    }
  }, [stats.recent_scans]);

  const startScanning = async () => {
    if (!selectedCamera) {
      message.warning("Please select a camera");
      return;
    }

    try {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");

      await html5QrCodeRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanError
      );

      setScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      message.error("Failed to start camera");
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        setScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText) => {
    try {
      console.log("QR Code scanned:", decodedText);

      // Stop scanner temporarily to process scan
      await stopScanning();

      const response = await scanMutation.mutateAsync({
        qr_data: decodedText,
        scan_type: "check-in",
        scan_location: "Main Entrance",
      });

      if (response.success) {
        // Set scan result for display
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
      console.error("Scan error:", error);

      // Show invalid scan result
      setScanResult({
        isValid: false,
        error: error.response?.data?.message || "Invalid QR code or scan failed",
      });
    }
  };

  const onScanError = (errorMessage) => {
    // Ignore errors - they happen frequently during scanning
    console.debug("Scan error:", errorMessage);
  };

  const handleContinueScanning = () => {
    setScanResult(null);
    startScanning();
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (html5QrCodeRef.current) {
        stopScanning();
      }
    };
  }, []);

  return (
    <div
      style={{
        padding: "24px",
        background: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "24px" }}
        >
          <h1 style={{ color: "#fe0808", fontSize: "32px", marginBottom: "8px" }}>
            PALAROTARY 2025 - Event Scanner
          </h1>
          <p style={{ fontSize: "16px", color: "#666" }}>
            Scan QR codes to check in attendees
          </p>
        </motion.div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <Statistic
                  title="Total Registered"
                  value={stats.total_members || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={8}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <Statistic
                  title="Checked In Today"
                  value={stats.checked_in_today || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#fe0808" }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={8}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <Statistic
                  title="Attendance Rate"
                  value={stats.attendance_rate || 0}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Scanner Section */}
          <Col xs={24} lg={12}>
            <Card
              title="QR Code Scanner"
              style={{ marginBottom: "16px", minHeight: "600px" }}
            >
              {!scanResult ? (
                <div>
                  {/* Camera Selection */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                      Select Camera:
                    </label>
                    <Select
                      style={{ width: "100%" }}
                      value={selectedCamera}
                      onChange={setSelectedCamera}
                      disabled={scanning}
                      placeholder="Choose a camera"
                    >
                      {cameras.map((camera) => (
                        <Select.Option key={camera.id} value={camera.id}>
                          {camera.label || `Camera ${camera.id}`}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {/* Scanner Container */}
                  <div
                    id="qr-reader"
                    style={{
                      width: "100%",
                      marginBottom: "16px",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      overflow: "hidden",
                      minHeight: "350px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#000",
                    }}
                  >
                    {!scanning && (
                      <div style={{ textAlign: "center", color: "#fff" }}>
                        <ScanOutlined
                          style={{ fontSize: "64px", marginBottom: "16px" }}
                        />
                        <p>Click Start Scanner to begin</p>
                      </div>
                    )}
                  </div>

                  {/* Scanner Controls */}
                  {!scanning ? (
                    <Button
                      type="primary"
                      size="large"
                      icon={<CameraOutlined />}
                      onClick={startScanning}
                      disabled={!selectedCamera}
                      block
                      style={{ background: "#fe0808", borderColor: "#fe0808" }}
                    >
                      Start Scanner
                    </Button>
                  ) : (
                    <Button
                      type="default"
                      size="large"
                      icon={<StopOutlined />}
                      onClick={stopScanning}
                      block
                      danger
                    >
                      Stop Scanner
                    </Button>
                  )}

                  {scanMutation.isPending && (
                    <Alert
                      message="Processing scan..."
                      type="info"
                      showIcon
                      style={{ marginTop: "16px" }}
                    />
                  )}

                  {/* Instructions */}
                  <div
                    style={{
                      background: "#e6f7ff",
                      border: "1px solid #91d5ff",
                      borderRadius: "8px",
                      padding: "16px",
                      marginTop: "16px",
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: "600",
                        marginBottom: "8px",
                        color: "#0050b3",
                      }}
                    >
                      📱 Scanning Instructions:
                    </h4>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "20px",
                        fontSize: "14px",
                        color: "#096dd9",
                      }}
                    >
                      <li>Ensure good lighting for best results</li>
                      <li>Hold the QR code steady within the frame</li>
                      <li>Keep the camera 6-8 inches from the QR code</li>
                      <li>The system will automatically detect and validate</li>
                    </ul>
                  </div>
                </div>
              ) : (
                // Scan Result Display
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    {scanResult.isValid ? (
                      <Result
                        status={scanResult.alreadyCheckedIn ? "warning" : "success"}
                        icon={
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
                              }}
                            />
                          </motion.div>
                        }
                        title={
                          <span
                            style={{
                              fontSize: "24px",
                              fontWeight: "bold",
                              color: scanResult.alreadyCheckedIn
                                ? "#faad14"
                                : "#52c41a",
                            }}
                          >
                            {scanResult.alreadyCheckedIn
                              ? "Already Checked In!"
                              : "Check-in Successful!"}
                          </span>
                        }
                        subTitle={
                          scanResult.alreadyCheckedIn
                            ? "This member has already been checked in today"
                            : "Member successfully checked in for the event"
                        }
                        extra={[
                          <div
                            key="details"
                            style={{ textAlign: "left", maxWidth: "400px", margin: "0 auto" }}
                          >
                            <div
                              style={{
                                background: "#f5f5f5",
                                borderRadius: "8px",
                                padding: "16px",
                                marginBottom: "16px",
                              }}
                            >
                              <div style={{ marginBottom: "12px" }}>
                                <p
                                  style={{
                                    fontSize: "12px",
                                    color: "#666",
                                    margin: "0 0 4px 0",
                                  }}
                                >
                                  Member Name
                                </p>
                                <p
                                  style={{
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#fe0808",
                                    margin: 0,
                                  }}
                                >
                                  {scanResult.member.name}
                                </p>
                              </div>

                              <Divider style={{ margin: "12px 0" }} />

                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "12px",
                                  fontSize: "14px",
                                }}
                              >
                                <div>
                                  <p style={{ color: "#666", margin: "0 0 4px 0" }}>
                                    Badge Number
                                  </p>
                                  <p style={{ fontWeight: "600", margin: 0 }}>
                                    {scanResult.member.badge_number}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ color: "#666", margin: "0 0 4px 0" }}>
                                    Club
                                  </p>
                                  <p style={{ fontWeight: "600", margin: 0 }}>
                                    {scanResult.member.club}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ color: "#666", margin: "0 0 4px 0" }}>
                                    Zone
                                  </p>
                                  <p style={{ fontWeight: "600", margin: 0 }}>
                                    {scanResult.member.zone || "N/A"}
                                  </p>
                                </div>
                                {scanResult.member.callsign && (
                                  <div>
                                    <p style={{ color: "#666", margin: "0 0 4px 0" }}>
                                      Callsign
                                    </p>
                                    <p style={{ fontWeight: "600", margin: 0 }}>
                                      {scanResult.member.callsign}
                                    </p>
                                  </div>
                                )}
                                {scanResult.member.position && (
                                  <div style={{ gridColumn: "1 / -1" }}>
                                    <p style={{ color: "#666", margin: "0 0 4px 0" }}>
                                      Position
                                    </p>
                                    <p style={{ fontWeight: "600", margin: 0 }}>
                                      {scanResult.member.position}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <Divider style={{ margin: "12px 0" }} />

                              <div style={{ fontSize: "12px", color: "#999" }}>
                                <p style={{ margin: 0 }}>
                                  Scanned at:{" "}
                                  {new Date(
                                    scanResult.attendance.scanned_at
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>

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
                              }}
                            >
                              Continue Scanning
                            </Button>
                          </div>,
                        ]}
                      />
                    ) : (
                      <Result
                        status="error"
                        icon={
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                          </motion.div>
                        }
                        title={
                          <span
                            style={{
                              fontSize: "24px",
                              fontWeight: "bold",
                              color: "#ff4d4f",
                            }}
                          >
                            Invalid QR Code!
                          </span>
                        }
                        subTitle={scanResult.error || "This QR code is not valid"}
                        extra={[
                          <Button
                            key="retry"
                            type="primary"
                            size="large"
                            icon={<ReloadOutlined />}
                            onClick={handleContinueScanning}
                            style={{ height: "48px" }}
                          >
                            Scan Another Code
                          </Button>,
                        ]}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </Card>
          </Col>

          {/* Recent Scans */}
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card title="Recent Scans" style={{ marginBottom: "16px" }}>
                <List
                  dataSource={recentScans}
                  locale={{ emptyText: "No scans yet" }}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<UserOutlined style={{ fontSize: "24px" }} />}
                        title={item.member_name}
                        description={
                          <div>
                            <div>
                              {item.club_name}
                              {item.zone && ` (${item.zone})`}
                            </div>
                            <div style={{ fontSize: "12px", color: "#999" }}>
                              Badge: {item.badge_number}
                            </div>
                          </div>
                        }
                      />
                      <div style={{ textAlign: "right" }}>
                        <Tag color="green">{item.scan_type}</Tag>
                        <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                          {new Date(item.scanned_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>

              {/* Zone Statistics */}
              {stats.by_zone && stats.by_zone.length > 0 && (
                <Card title="Check-ins by Zone">
                  <List
                    dataSource={stats.by_zone}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.zone || "No Zone"}
                          description={`${item.count} attendees`}
                        />
                        <Tag color="blue">{item.count}</Tag>
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </motion.div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
