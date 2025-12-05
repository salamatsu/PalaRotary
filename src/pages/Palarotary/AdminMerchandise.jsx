import {
  AppstoreOutlined,
  EyeOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Image,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { draw } from "../../hooks/useCanvas";
import {
  useGetAdminMerchandiseByZoneApi,
  useGetAdminMerchandisesStatsApi,
} from "../../services/requests/usePalarotary";

const { Title, Text } = Typography;

const ZONES = [
  "ZONE 1",
  "ZONE 2",
  "ZONE 3",
  "ZONE 4A",
  "ZONE 4B",
  "ZONE 5A",
  "ZONE 5B",
  "ZONE 6",
  "ZONE 7",
  "ZONE 8",
  "ZONE 9",
];

const AdminMerchandise = () => {
  const [selectedZone, setSelectedZone] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedNumberOrders, setSelectedNumberOrders] = useState([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data: statsData } = useGetAdminMerchandisesStatsApi();
  const { data: zoneData, isLoading: loadingZone } =
    useGetAdminMerchandiseByZoneApi(selectedZone);

  const stats = statsData?.data?.overview || {};

  // Process zone data for grid
  const processedGridData = () => {
    if (!zoneData?.allOrders) return [];

    const ordersByNumber = {};

    zoneData.allOrders.forEach((order) => {
      const num = order.shirtNumber;
      if (!ordersByNumber[num]) {
        ordersByNumber[num] = [];
      }
      ordersByNumber[num].push(order);
    });

    const gridData = [];
    for (let i = 0; i <= 99; i++) {
      const num = String(i).padStart(2, "0");
      const orders = ordersByNumber[num] || [];
      gridData.push({
        number: num,
        orders,
        hasOrders: orders.length > 0,
      });
    }

    return gridData;
  };

  // Process zone data for list
  const processedListData = () => {
    if (!zoneData?.allOrders) return [];
    return zoneData.allOrders;
  };

  const handleNumberClick = (numberData) => {
    if (numberData.hasOrders) {
      setSelectedNumber(numberData.number);
      setSelectedNumberOrders(numberData.orders);
      setDrawerOpen(true);
    }
  };

  const handleViewPreview = async (order) => {
    setPreviewData(order);
    setPreviewModalOpen(true);

    // Generate preview image
    try {
      const image = await draw({
        name: order.name,
        zone: order.zone,
        number: order.shirtNumber || "00",
      });
      setPreviewImage(image);
    } catch (error) {
      console.error("Failed to generate preview:", error);
    }
  };

  const gridData = processedGridData();
  const listData = processedListData();

  return (
    <div style={{ padding: "24px", background: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card
            style={{
              borderRadius: "16px",
              background: "#1c3c6d",
              border: "none",
            }}
          >
            <Title
              level={2}
              style={{ color: "white", margin: 0, marginBottom: 24 }}
            >
              Merchandise Orders
            </Title>
            <Row gutter={[16, 16]}>
              <Col xs={12} md={6}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "700",
                      color: "white",
                    }}
                  >
                    {stats.totalOrders || 0}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.9)" }}>
                    Total Orders
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "700",
                      color: "#ffd700",
                    }}
                  >
                    {stats.pendingOrders || 0}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.9)" }}>Pending</div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "700",
                      color: "#10b981",
                    }}
                  >
                    {stats.approvedOrders || 0}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.9)" }}>Approved</div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "700",
                      color: "#fbbf24",
                    }}
                  >
                    ₱{parseFloat(stats.totalRevenue || 0).toFixed(0)}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.9)" }}>Revenue</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card
        style={{
          borderRadius: "16px",
          marginBottom: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Space>
              <Text strong>Select Zone:</Text>
              <Select
                value={selectedZone}
                onChange={setSelectedZone}
                style={{ width: 200 }}
                size="large"
                placeholder="Choose a zone"
              >
                {ZONES.map((zone) => (
                  <Select.Option key={zone} value={zone}>
                    {zone}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space>
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode("list")}
                size="large"
              >
                List
              </Button>
              <Button
                type={viewMode === "grid" ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode("grid")}
                size="large"
              >
                Grid
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Content Area */}
      {!selectedZone ? (
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Empty
            description="Please select a zone to view orders"
            style={{ padding: "60px 0" }}
          />
        </Card>
      ) : (
        <>
          {/* Zone Stats */}
          {zoneData?.summary && (
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={6}>
                <Card
                  style={{
                    borderRadius: "12px",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                  }}
                >
                  <Statistic
                    title="Total Orders"
                    value={zoneData.summary.totalOrders}
                    valueStyle={{ color: "#0ea5e9" }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card
                  style={{
                    borderRadius: "12px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <Statistic
                    title="Unique Numbers"
                    value={zoneData.summary.uniqueShirtNumbers}
                    valueStyle={{ color: "#22c55e" }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card
                  style={{
                    borderRadius: "12px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                  }}
                >
                  <Statistic
                    title="Pending"
                    value={zoneData.summary.pendingOrders}
                    valueStyle={{ color: "#f59e0b" }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card
                  style={{
                    borderRadius: "12px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <Statistic
                    title="Paid"
                    value={zoneData.summary.paidOrders}
                    valueStyle={{ color: "#10b981" }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Title level={4} style={{ marginBottom: 16 }}>
                Orders for {selectedZone}
              </Title>
              {loadingZone ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <Spin size="large" />
                </div>
              ) : listData.length === 0 ? (
                <Empty description="No orders found" />
              ) : (
                <Row gutter={[16, 16]}>
                  {listData.map((order) => (
                    <Col xs={24} md={12} lg={8} key={order.id}>
                      <Card
                        size="small"
                        style={{
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          background: "#ffffff",
                        }}
                        hoverable
                      >
                        <Space
                          direction="vertical"
                          style={{ width: "100%" }}
                          size="small"
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Tag color="blue">{order.zone}</Tag>
                            <Tag
                              style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                padding: "4px 12px",
                              }}
                            >
                              #{order.shirtNumber}
                            </Tag>
                          </div>
                          <div>
                            <Text strong style={{ fontSize: "16px" }}>
                              {order.name}
                            </Text>
                          </div>
                          <div>
                            <Text type="secondary">Size: {order.size}</Text>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {order.email}
                            </Text>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {order.mobileNumber}
                            </Text>
                          </div>
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            block
                            onClick={() => handleViewPreview(order)}
                            style={{
                              marginTop: 8,
                              borderRadius: "8px",
                            }}
                          >
                            View Preview
                          </Button>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Title level={4} style={{ marginBottom: 16 }}>
                Shirt Numbers - {selectedZone}
              </Title>
              {loadingZone ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <Spin size="large" />
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {gridData.map((item) => (
                  <Badge
                    key={item.number}
                    count={item.orders.length > 1 ? item.orders.length : 0}
                    offset={[-5, 5]}
                  >
                    <Card
                      size="small"
                      hoverable={item.hasOrders}
                      onClick={() => handleNumberClick(item)}
                      style={{
                        borderRadius: "12px",
                        background: item.hasOrders ? "#d1fae5" : "#f3f4f6",
                        border: item.hasOrders
                          ? "2px solid #10b981"
                          : "1px solid #d1d5db",
                        cursor: item.hasOrders ? "pointer" : "default",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                        width: "100%",
                      }}
                      styles={{ body: { padding: "16px 8px" } }}
                    >
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: item.hasOrders ? "#059669" : "#9ca3af",
                        }}
                      >
                        {item.number}
                      </div>
                    </Card>
                  </Badge>
                  ))}
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Drawer - Number Details */}
      <Drawer
        title={
          <Space>
            <span>Shirt Number #{selectedNumber}</span>
            <Tag color="green">{selectedNumberOrders.length} Orders</Tag>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {selectedNumberOrders.map((order, index) => (
            <Card
              key={order.id}
              size="small"
              style={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                background: "#fafafa",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text strong style={{ fontSize: "16px" }}>
                    Order #{index + 1}
                  </Text>
                  <Tag color="blue">{order.zone}</Tag>
                </div>
                <div>
                  <Text strong>{order.name}</Text>
                </div>
                <div>
                  <Space>
                    <Tag>Size: {order.size}</Tag>
                    <Tag
                      color={
                        order.paymentStatus === "PAID" ? "green" : "orange"
                      }
                    >
                      {order.paymentStatus}
                    </Tag>
                  </Space>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {order.email}
                  </Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {order.mobileNumber}
                  </Text>
                </div>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  block
                  onClick={() => handleViewPreview(order)}
                  style={{ marginTop: 8 }}
                >
                  View Shirt Preview
                </Button>
              </Space>
            </Card>
          ))}
        </Space>
      </Drawer>

      {/* Preview Modal */}
      <Modal
        title="Shirt Preview"
        open={previewModalOpen}
        onCancel={() => {
          setPreviewModalOpen(false);
          setPreviewImage(null);
          setPreviewData(null);
        }}
        footer={null}
        width={700}
      >
        {previewData && (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Card size="small" style={{ background: "#f5f7fa" }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Name:</Text>
                  <div>
                    <Text strong>{previewData.name}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Shirt Number:</Text>
                  <div>
                    <Text strong>#{previewData.shirtNumber}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Zone:</Text>
                  <div>
                    <Tag color="blue">{previewData.zone}</Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Size:</Text>
                  <div>
                    <Tag>{previewData.size}</Tag>
                  </div>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Email:</Text>
                  <div>
                    <Text>{previewData.email}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Mobile:</Text>
                  <div>
                    <Text>{previewData.mobileNumber}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {previewImage ? (
              <div style={{ textAlign: "center" }}>
                <Image
                  src={previewImage}
                  alt="Shirt Preview"
                  style={{
                    borderRadius: "12px",
                    maxWidth: "100%",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Text type="secondary">Generating preview...</Text>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default AdminMerchandise;
