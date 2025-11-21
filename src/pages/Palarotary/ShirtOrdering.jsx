import {
  ArrowRightOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  ADULT_SHIRT_SIZES,
  KID_SHIRT_SIZES,
  SHIRT_PRICING,
  ZONE_INFORMATION,
} from "../../lib/constants";
import { draw } from "../../hooks/useCanvas";
import { submitShirtOrder } from "../../services/api/palarotaryApi";

const { Title, Text } = Typography;
const { Option } = Select;

const ShirtOrdering = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState({
    id: Date.now(),
    name: "",
    zone: "",
    size: "",
    sizeCategory: "adult",
    number: "",
    specialNumber: "",
    contactNumber: "",
    price: 0,
    preview: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSizeInfo, setShowSizeInfo] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const data = location.state?.memberData;
    const bypassValidation = location.state?.bypassValidation;

    if (!data && !bypassValidation) {
      message.warning("Please validate your badge first");
      navigate("/shirt-validation");
      return;
    }

    setMemberData(data);

    if (data?.mobile_number) {
      setCurrentOrder((prev) => ({
        ...prev,
        contactNumber: data.mobile_number,
      }));
      form.setFieldValue("contactNumber", data.mobile_number);
    }

    if (data?.last_name) {
      setCurrentOrder((prev) => ({
        ...prev,
        name: data.last_name,
      }));
      form.setFieldValue("name", data.last_name);
    }

    if (data?.zone) {
      setCurrentOrder((prev) => ({
        ...prev,
        zone: data.zone,
      }));
      form.setFieldValue("zone", data.zone);
    }
  }, [location, navigate, form]);

  const generatePreview = async (orderData) => {
    if (!orderData.zone || !orderData.name) return null;

    try {
      setPreviewLoading(true);
      const preview = await draw({
        name: orderData.name,
        zone: orderData.zone,
        number: orderData.number || "",
      });
      return preview;
    } catch (error) {
      console.error("Preview generation error:", error);
      return null;
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFieldChange = async (field, value) => {
    const updatedOrder = { ...currentOrder, [field]: value };

    // Update price when size changes
    if (field === "size") {
      const price = SHIRT_PRICING.sizes[value] || SHIRT_PRICING.base;
      updatedOrder.price = price;
    }

    setCurrentOrder(updatedOrder);
    form.setFieldValue(field, value);

    // Auto-generate preview when key fields change
    if (["name", "zone", "number"].includes(field)) {
      const preview = await generatePreview(updatedOrder);
      setCurrentOrder((prev) => ({ ...prev, preview }));
    }
  };

  const addOrderToCart = async () => {
    try {
      await form.validateFields();

      if (!currentOrder.size) {
        message.error("Please select a size");
        return;
      }

      // Generate final preview
      const preview = await generatePreview(currentOrder);

      const newOrder = {
        ...currentOrder,
        id: Date.now(),
        preview,
      };

      setOrders([...orders, newOrder]);
      message.success("Shirt added to cart!");

      // Reset form for new order
      const contactNumber = currentOrder.contactNumber;
      const zone = memberData?.zone || "";
      setCurrentOrder({
        id: Date.now(),
        name: "",
        zone,
        size: "",
        sizeCategory: "adult",
        number: "",
        specialNumber: "",
        contactNumber,
        price: 0,
        preview: null,
      });

      form.resetFields();
      form.setFieldValue("contactNumber", contactNumber);
      if (zone) {
        form.setFieldValue("zone", zone);
      }
    } catch (error) {
      message.error("Please fill in all required fields");
    }
  };

  const removeOrder = (orderId) => {
    setOrders(orders.filter((order) => order.id !== orderId));
    message.info("Item removed from cart");
  };

  const handleSubmitOrder = async () => {
    if (orders.length === 0) {
      message.warning("Please add at least one shirt to your cart");
      return;
    }

    try {
      setSubmitting(true);

      const orderData = {
        memberId: memberData?.id,
        orders: orders.map((order) => ({
          name: order.name,
          zone: order.zone,
          size: order.size,
          number: order.number,
          specialNumber: order.specialNumber,
          contactNumber: order.contactNumber,
          price: order.price,
        })),
        totalAmount: orders.reduce((sum, order) => sum + order.price, 0),
      };

      const response = await submitShirtOrder(orderData);

      if (response.success) {
        message.success("Order submitted successfully!");
        navigate("/order-confirmation", {
          state: {
            orderId: response.data.orderId,
            orders,
            totalAmount: orderData.totalAmount,
          },
        });
      } else {
        message.error(response.message || "Failed to submit order");
      }
    } catch (error) {
      message.error("Failed to submit order. Please try again.");
      console.error("Order submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getSizeOptions = () => {
    return currentOrder.sizeCategory === "kid"
      ? KID_SHIRT_SIZES
      : ADULT_SHIRT_SIZES;
  };

  const getZoneInfo = (zone) => {
    return ZONE_INFORMATION.find((z) => z.zone === zone);
  };

  const getTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.price, 0);
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.95 },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1c3c6d 0%, #0f2847 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "40px" }}
        >
          <Title
            level={1}
            style={{
              color: "white",
              fontSize: "clamp(32px, 6vw, 48px)",
              marginBottom: "8px",
            }}
          >
            Order Your Custom Shirt
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.95)", fontSize: "18px" }}>
            Design your personalized PALAROTARY 2026 shirt
          </Text>
        </motion.div>

        {/* Main Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            marginBottom: "40px",
          }}
          className="shirt-order-grid"
        >
          {/* Order Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              style={{
                borderRadius: "24px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              }}
            >
              <Title level={3} style={{ marginBottom: "24px" }}>
                Shirt Details
              </Title>

              <Form form={form} layout="vertical">
                {/* Zone Selection */}
                <Form.Item
                  label={<Text strong>Zone</Text>}
                  name="zone"
                  rules={[
                    { required: true, message: "Please select your zone" },
                  ]}
                >
                  <Select
                    placeholder="Select your zone"
                    onChange={(value) => handleFieldChange("zone", value)}
                    size="large"
                  >
                    {ZONE_INFORMATION.map((zone) => (
                      <Option key={zone.zone} value={zone.zone}>
                        <Space>
                          <Badge color="#1c3c6d" />
                          {zone.zone} - {zone.area} ({zone.color})
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Name Input */}
                <Form.Item
                  label={<Text strong>Name (on shirt)</Text>}
                  name="name"
                  rules={[
                    { required: true, message: "Please enter the name" },
                    { max: 20, message: "Name cannot exceed 20 characters" },
                  ]}
                >
                  <Input
                    placeholder="Enter last name"
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    size="large"
                    maxLength={20}
                  />
                </Form.Item>

                {/* Shirt Number */}
                <Form.Item
                  label={<Text strong>Shirt Number (Optional)</Text>}
                  name="number"
                >
                  <Input
                    placeholder="1-99"
                    onChange={(e) =>
                      handleFieldChange("number", e.target.value)
                    }
                    size="large"
                    maxLength={2}
                  />
                </Form.Item>

                {/* Special Number */}
                <Form.Item
                  label={<Text strong>Special Number (Requires Approval)</Text>}
                  name="specialNumber"
                >
                  <Input
                    placeholder="e.g., 00, 99"
                    onChange={(e) =>
                      handleFieldChange("specialNumber", e.target.value)
                    }
                    size="large"
                  />
                </Form.Item>

                {/* Contact Number */}
                <Form.Item
                  label={<Text strong>Contact Number</Text>}
                  name="contactNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your contact number",
                    },
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Enter valid 10-11 digit phone number",
                    },
                  ]}
                >
                  <Input
                    placeholder="09XXXXXXXXX"
                    onChange={(e) =>
                      handleFieldChange("contactNumber", e.target.value)
                    }
                    size="large"
                    maxLength={11}
                  />
                </Form.Item>

                {/* Size Category */}
                <Form.Item label={<Text strong>Category</Text>}>
                  <Radio.Group
                    value={currentOrder.sizeCategory}
                    onChange={(e) => {
                      handleFieldChange("sizeCategory", e.target.value);
                    }}
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <Radio.Button
                      value="adult"
                      style={{ width: "50%", textAlign: "center" }}
                    >
                      Adult
                    </Radio.Button>
                    <Radio.Button
                      value="kid"
                      style={{ width: "50%", textAlign: "center" }}
                    >
                      Kids
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>

                {/* Size Selection */}
                <Form.Item
                  label={
                    <Space>
                      <Text strong>Size</Text>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setShowSizeInfo(true)}
                      >
                        View Size Chart
                      </Button>
                    </Space>
                  }
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(80px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {getSizeOptions().map((sizeOption) => {
                      const price =
                        SHIRT_PRICING.sizes[sizeOption.size] ||
                        SHIRT_PRICING.base;
                      const isSelected = currentOrder.size === sizeOption.size;

                      return (
                        <motion.div
                          key={sizeOption.size}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleFieldChange("size", sizeOption.size)
                          }
                          style={{
                            cursor: "pointer",
                            padding: "12px 8px",
                            borderRadius: "8px",
                            background: isSelected ? "#1c3c6d" : "#f5f5f5",
                            border: isSelected ? "none" : "1px solid #d9d9d9",
                            textAlign: "center",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <Text
                            strong
                            style={{
                              display: "block",
                              color: isSelected ? "white" : "#333",
                              fontSize: "16px",
                            }}
                          >
                            {sizeOption.size}
                          </Text>
                          <Text
                            style={{
                              display: "block",
                              color: isSelected
                                ? "rgba(255,255,255,0.8)"
                                : "#1c3c6d",
                              fontSize: "12px",
                            }}
                          >
                            ₱{price}
                          </Text>
                        </motion.div>
                      );
                    })}
                  </div>
                </Form.Item>

                {currentOrder.price > 0 && (
                  <div
                    style={{
                      padding: "16px",
                      background:
                        "linear-gradient(135deg, #1c3c6d15 0%, #0f284715 100%)",
                      borderRadius: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text strong style={{ fontSize: "18px" }}>
                        Price:
                      </Text>
                      <Text
                        strong
                        style={{ fontSize: "24px", color: "#1c3c6d" }}
                      >
                        ₱{currentOrder.price}
                      </Text>
                    </Space>
                  </div>
                )}

                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={addOrderToCart}
                    icon={<ShoppingCartOutlined />}
                    style={{
                      background:
                        "linear-gradient(135deg, #1c3c6d 0%, #0f2847 100%)",
                      border: "none",
                      height: "56px",
                      fontSize: "18px",
                      fontWeight: "600",
                      borderRadius: "12px",
                      boxShadow: "0 6px 20px rgba(28, 60, 109, 0.4)",
                    }}
                  >
                    Add to Cart
                  </Button>
                </motion.div>
              </Form>
            </Card>
          </motion.div>

          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              style={{
                borderRadius: "24px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                minHeight: "500px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Title level={3} style={{ marginBottom: "24px" }}>
                Live Preview
              </Title>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "400px",
                }}
              >
                {previewLoading ? (
                  <div style={{ textAlign: "center" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: "16px" }}>
                      <Text type="secondary">Generating preview...</Text>
                    </div>
                  </div>
                ) : currentOrder.preview ? (
                  <div style={{ textAlign: "center" }}>
                    <motion.img
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      src={currentOrder.preview}
                      alt="Shirt Preview"
                      style={{
                        width: "100%",
                        maxWidth: "500px",
                        borderRadius: "12px",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <Text type="secondary" style={{ fontSize: "16px" }}>
                      Fill in zone and name to see preview
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Shopping Cart */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              style={{
                borderRadius: "24px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <Space>
                  <ShoppingCartOutlined
                    style={{ fontSize: "24px", color: "#1c3c6d" }}
                  />
                  <Title level={3} style={{ margin: 0 }}>
                    Shopping Cart
                  </Title>
                  <Badge
                    count={orders.length}
                    style={{ backgroundColor: "#1c3c6d" }}
                  />
                </Space>
                <Title level={3} style={{ margin: 0, color: "#1c3c6d" }}>
                  Total: ₱{getTotalAmount()}
                </Title>
              </div>

              <Divider />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                {orders.map((order) => {
                  const orderZoneInfo = getZoneInfo(order.zone);
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card
                        type="inner"
                        style={{
                          borderRadius: "12px",
                          border: "2px solid #f0f0f0",
                        }}
                      >
                        {order.preview && (
                          <img
                            src={order.preview}
                            alt="Order Preview"
                            style={{
                              width: "100%",
                              borderRadius: "8px",
                              marginBottom: "12px",
                            }}
                          />
                        )}

                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
                          <Text strong style={{ fontSize: "16px" }}>
                            {order.name}
                          </Text>
                          <Text type="secondary">
                            {order.zone} - {orderZoneInfo?.area}
                          </Text>
                          <Text type="secondary">Size: {order.size}</Text>
                          {order.number && (
                            <Text type="secondary">Number: {order.number}</Text>
                          )}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: "8px",
                            }}
                          >
                            <Text
                              strong
                              style={{ color: "#1c3c6d", fontSize: "18px" }}
                            >
                              ₱{order.price}
                            </Text>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeOrder(order.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </Space>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  onClick={handleSubmitOrder}
                  icon={<ArrowRightOutlined />}
                  style={{
                    background:
                      "linear-gradient(135deg, #1c3c6d 0%, #0f2847 100%)",
                    border: "none",
                    height: "60px",
                    fontSize: "18px",
                    fontWeight: "600",
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(28, 60, 109, 0.4)",
                  }}
                >
                  Proceed to Checkout ({orders.length}{" "}
                  {orders.length === 1 ? "item" : "items"} - ₱{getTotalAmount()}
                  )
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        )}

        {/* Size Chart Modal */}
        <Modal
          title={<Title level={3}>Size Chart</Title>}
          open={showSizeInfo}
          onCancel={() => setShowSizeInfo(false)}
          footer={null}
          width={700}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Title level={4}>Kids Sizes</Title>
              <Table
                dataSource={KID_SHIRT_SIZES}
                columns={[
                  { title: "Size", dataIndex: "size", key: "size" },
                  { title: "Width (inches)", dataIndex: "width", key: "width" },
                  {
                    title: "Length (inches)",
                    dataIndex: "length",
                    key: "length",
                  },
                  {
                    title: "Price",
                    key: "price",
                    render: (_, record) =>
                      `₱${SHIRT_PRICING.sizes[record.size]}`,
                  },
                ]}
                pagination={false}
                size="small"
                rowKey="size"
              />
            </div>
            <div>
              <Title level={4}>Adult Sizes</Title>
              <Table
                dataSource={ADULT_SHIRT_SIZES}
                columns={[
                  { title: "Size", dataIndex: "size", key: "size" },
                  { title: "Width (inches)", dataIndex: "width", key: "width" },
                  {
                    title: "Length (inches)",
                    dataIndex: "length",
                    key: "length",
                  },
                  {
                    title: "Price",
                    key: "price",
                    render: (_, record) =>
                      `₱${SHIRT_PRICING.sizes[record.size]}`,
                  },
                ]}
                pagination={false}
                size="small"
                rowKey="size"
              />
            </div>
          </Space>
        </Modal>
      </div>

      {/* Responsive CSS */}
      <style jsx="true">{`
        @media (max-width: 768px) {
          .shirt-order-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ShirtOrdering;
