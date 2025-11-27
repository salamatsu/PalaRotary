import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Divider,
  Form,
  Image,
  Input,
  message,
  Modal,
  Radio,
  Space,
  Spin,
  Table,
  Typography,
  Tooltip,
  Tag,
} from "antd";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ADULT_SHIRT_SIZES,
  KID_SHIRT_SIZES,
  SHIRT_PRICING,
} from "../../lib/constants";
import { draw } from "../../hooks/useCanvas";
import { useSubmitShirtOrder } from "../../services/requests/usePalarotary";

const { Title, Text } = Typography;

const ShirtOrdering = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState({
    id: Date.now(),
    name: "",
    size: "",
    sizeCategory: "adult",
    shirtNumber: "",
    desiredNumber: "",
    price: 0,
    preview: null,
  });
  const [showSizeInfo, setShowSizeInfo] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isContactEditable, setIsContactEditable] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const { mutate: submitOrder, isPending: submitting } = useSubmitShirtOrder();

  // Refs for GSAP animations
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const cartRef = useRef(null);
  const orderCardsRef = useRef([]);

  // Initial animations
  useGSAP(
    () => {
      if (containerRef.current) {
        const tl = gsap.timeline();

        tl.from(".header-section", {
          y: -50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        })
          .from(
            ".form-container",
            {
              x: -100,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out",
            },
            "-=0.4"
          )
          .from(
            ".preview-container",
            {
              x: 100,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out",
            },
            "-=0.8"
          );
      }
    },
    { scope: containerRef }
  );

  useEffect(() => {
    const data = location.state?.memberData;

    if (!data) {
      message.warning("Please validate your badge first");
      navigate("/shirt-validation");
      return;
    }

    setMemberData(data);

    if (data?.email) {
      setEmail(data.email);
      form.setFieldValue("email", data.email);
    }

    if (data?.mobileNumber) {
      setMobileNumber(data.mobileNumber);
      form.setFieldValue("mobileNumber", data.mobileNumber);
    }

    if (data?.lastName) {
      setCurrentOrder((prev) => ({
        ...prev,
        name: data.lastName,
      }));
      form.setFieldValue("name", data.lastName);
    }

    const generateInitialPreview = async () => {
      if (data?.zone) {
        try {
          setPreviewLoading(true);
          const preview = await draw({
            name: "SHIRT NAME",
            zone: data.zone,
            number: "00",
          });
          setCurrentOrder((prev) => ({ ...prev, preview }));
        } catch (error) {
          console.error("Initial preview generation error:", error);
        } finally {
          setPreviewLoading(false);
        }
      }
    };

    generateInitialPreview();
  }, [location, navigate, form]);

  const generatePreview = async (orderData) => {
    if (!memberData?.zone || !orderData.name) return null;

    try {
      setPreviewLoading(true);
      const preview = await draw({
        name: orderData.name,
        zone: memberData.zone,
        number: orderData.shirtNumber || "00",
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

    if (field === "size") {
      const price = SHIRT_PRICING.sizes[value] || SHIRT_PRICING.base;
      updatedOrder.price = price;

      // Animate price change
      gsap.fromTo(
        ".price-display",
        { scale: 1.2, color: "#52c41a" },
        {
          scale: 1,
          color: "#1c3c6d",
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
        }
      );
    }

    setCurrentOrder(updatedOrder);
    form.setFieldValue(field, value);

    if (["name", "shirtNumber"].includes(field)) {
      const preview = await generatePreview(updatedOrder);
      setCurrentOrder((prev) => ({ ...prev, preview }));

      // Animate preview update
      if (previewRef.current) {
        gsap.fromTo(
          previewRef.current,
          { scale: 0.95, opacity: 0.5 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
      }
    }
  };

  const handleEditContactToggle = () => {
    if (isContactEditable) {
      setIsContactEditable(false);
    } else {
      setShowEditConfirm(true);
    }
  };

  const confirmEditContact = () => {
    setIsContactEditable(true);
    setShowEditConfirm(false);
    message.info("You can now edit email and mobile number");
  };

  const addOrderToCart = async () => {
    try {
      await form.validateFields();

      if (!currentOrder.size) {
        message.error("Please select a size");
        return;
      }

      const preview = await generatePreview(currentOrder);

      const newOrder = {
        ...currentOrder,
        id: Date.now(),
        preview,
      };

      setOrders([...orders, newOrder]);
      message.success("Shirt added to cart!");

      // Animate success
      gsap.fromTo(
        ".add-to-cart-btn",
        { scale: 0.9 },
        { scale: 1, duration: 0.3, ease: "back.out(2)" }
      );

      // Reset form
      setCurrentOrder({
        id: Date.now(),
        name: "",
        size: "",
        sizeCategory: "adult",
        shirtNumber: "",
        desiredNumber: "",
        price: 0,
        preview: null,
      });

      form.resetFields();
      form.setFieldValue("email", email);
      form.setFieldValue("mobileNumber", mobileNumber);

      // Scroll to cart with smooth animation
      if (cartRef.current) {
        gsap.to(window, {
          scrollTo: { y: cartRef.current, offsetY: 100 },
          duration: 1,
          ease: "power2.inOut",
        });
      }
    } catch (error) {
      message.error("Please fill in all required fields");
    }
  };

  const removeOrder = (orderId) => {
    const orderIndex = orders.findIndex((o) => o.id === orderId);

    // Animate removal
    if (orderCardsRef.current[orderIndex]) {
      gsap.to(orderCardsRef.current[orderIndex], {
        x: 100,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setOrders(orders.filter((order) => order.id !== orderId));
          message.info("Item removed from cart");
        },
      });
    } else {
      setOrders(orders.filter((order) => order.id !== orderId));
      message.info("Item removed from cart");
    }
  };

  const handleSubmitOrder = async () => {
    if (orders.length === 0) {
      message.warning("Please add at least one shirt to your cart");
      return;
    }

    const orderData = {
      qrCode: memberData?.qrCode,
      email: email,
      zone: memberData?.zone,
      mobileNumber: mobileNumber,
      shirtConfig: orders.map((order) => ({
        name: order.name,
        size: order.size,
        shirtNumber: order.shirtNumber,
        desiredNumber: order.desiredNumber || "",
      })),
    };

    submitOrder(orderData, {
      onSuccess: (response) => {
        message.success("Order submitted successfully!");
        navigate("/order-confirmation", {
          state: {
            orderId: response.data?.orderId,
            orders,
            totalAmount: orders.reduce((sum, order) => sum + order.price, 0),
          },
        });
      },
      onError: (error) => {
        message.error(
          error.message || "Failed to submit order. Please try again."
        );
        console.error("Order submission error:", error);
      },
    });
  };

  const getSizeOptions = () => {
    return currentOrder.sizeCategory === "kid"
      ? KID_SHIRT_SIZES
      : ADULT_SHIRT_SIZES;
  };

  const getTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.price, 0);
  };

  const handleSizeClick = (size) => {
    handleFieldChange("size", size);

    // Animate size selection
    gsap.to(`.size-option-${size}`, {
      scale: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1E3A71 0%, #1E3A71 100%)",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Compact Header */}
        <div
          className="header-section"
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          <Title
            level={2}
            style={{
              color: "white",
              marginBottom: "5px",
              fontSize: "clamp(24px, 5vw, 36px)",
            }}
          >
            🎽 Order Your Custom Shirt
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
            PALAROTARY 2026 - Design your personalized shirt
          </Text>
        </div>

        {/* Main Grid - Compact Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "20px",
            marginBottom: "20px",
          }}
          className="main-grid"
        >
          {/* Form Section */}
          <div className="form-container">
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}
              styles={{ body: { padding: "20px" } }}
            >
              <Form form={form} layout="vertical" size="small">
                {/* Contact Info - Compact */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%)",
                    padding: "12px",
                    borderRadius: "12px",
                    marginBottom: "16px",
                  }}
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
                      <Text strong style={{ fontSize: "13px" }}>
                        Contact Information
                      </Text>
                      <Button
                        type="link"
                        size="small"
                        icon={
                          isContactEditable ? (
                            <LockOutlined />
                          ) : (
                            <EditOutlined />
                          )
                        }
                        onClick={handleEditContactToggle}
                        style={{ padding: "0 8px", fontSize: "12px" }}
                      >
                        {isContactEditable ? "Lock" : "Edit"}
                      </Button>
                    </div>

                    <Input
                      prefix={
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          📧
                        </Text>
                      }
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isContactEditable}
                      size="small"
                      style={{ fontSize: "12px" }}
                    />

                    <Input
                      prefix={
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          📱
                        </Text>
                      }
                      placeholder="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      disabled={!isContactEditable}
                      size="small"
                      maxLength={11}
                      style={{ fontSize: "12px" }}
                    />

                    {memberData?.zone && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "4px",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          Zone:
                        </Text>
                        <Tag
                          color="blue"
                          style={{ fontSize: "11px", margin: 0 }}
                        >
                          {memberData.zone}
                        </Tag>
                      </div>
                    )}
                  </Space>
                </div>

                {/* Shirt Details */}
                <Title
                  level={5}
                  style={{ margin: "0 0 12px 0", fontSize: "14px" }}
                >
                  Shirt Details
                </Title>

                <Form.Item
                  label={
                    <Text style={{ fontSize: "12px" }}>Name on Shirt</Text>
                  }
                  name="name"
                  rules={[
                    { required: true, message: "Required" },
                    { max: 20, message: "Max 20 characters" },
                  ]}
                  style={{ marginBottom: "12px" }}
                >
                  <Input
                    placeholder="Last name"
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    maxLength={20}
                    style={{ fontSize: "12px" }}
                  />
                </Form.Item>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <Form.Item
                    label={
                      <Text style={{ fontSize: "12px" }}>Shirt Number</Text>
                    }
                    name="shirtNumber"
                    rules={[
                      { required: true, message: "Required" },
                      { pattern: /^[0-9]{1,2}$/, message: "00-99" },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      placeholder="00-99"
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        handleFieldChange("shirtNumber", value);
                      }}
                      onBlur={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length === 1) {
                          value = value.padStart(2, "0");
                          form.setFieldValue("shirtNumber", value);
                          handleFieldChange("shirtNumber", value);
                        }
                      }}
                      maxLength={2}
                      style={{ fontSize: "12px" }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Space size={4}>
                        <Text style={{ fontSize: "12px" }}>Desired</Text>
                        <Tooltip title="If shirt number is taken">
                          <InfoCircleOutlined style={{ fontSize: "10px" }} />
                        </Tooltip>
                      </Space>
                    }
                    name="desiredNumber"
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      placeholder="Optional"
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        handleFieldChange("desiredNumber", value);
                      }}
                      onBlur={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length === 1) {
                          value = value.padStart(2, "0");
                          form.setFieldValue("desiredNumber", value);
                          handleFieldChange("desiredNumber", value);
                        }
                      }}
                      maxLength={2}
                      style={{ fontSize: "12px" }}
                    />
                  </Form.Item>
                </div>

                {/* Category */}
                <Form.Item
                  label={<Text style={{ fontSize: "12px" }}>Category</Text>}
                  style={{ marginBottom: "12px" }}
                >
                  <Radio.Group
                    value={currentOrder.sizeCategory}
                    onChange={(e) =>
                      handleFieldChange("sizeCategory", e.target.value)
                    }
                    buttonStyle="solid"
                    style={{ width: "100%" }}
                  >
                    <Radio.Button
                      value="adult"
                      style={{
                        width: "50%",
                        textAlign: "center",
                        fontSize: "12px",
                      }}
                    >
                      Adult
                    </Radio.Button>
                    <Radio.Button
                      value="kid"
                      style={{
                        width: "50%",
                        textAlign: "center",
                        fontSize: "12px",
                      }}
                    >
                      Kids
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>

                {/* Size Selection - Grid */}
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <Text style={{ fontSize: "12px" }} strong>
                      Size
                    </Text>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setShowSizeInfo(true)}
                      style={{ padding: 0, fontSize: "11px", height: "auto" }}
                    >
                      Size Chart
                    </Button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(60px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {getSizeOptions().map((sizeOption) => {
                      const price =
                        SHIRT_PRICING.sizes[sizeOption.size] ||
                        SHIRT_PRICING.base;
                      const isSelected = currentOrder.size === sizeOption.size;

                      return (
                        <div
                          key={sizeOption.size}
                          className={`size-option-${sizeOption.size}`}
                          onClick={() => handleSizeClick(sizeOption.size)}
                          style={{
                            cursor: "pointer",
                            padding: "10px 6px",
                            borderRadius: "10px",
                            background: isSelected
                              ? "linear-gradient(135deg, #667eea 0%, #1E3A71 100%)"
                              : "#f5f5f5",
                            border: isSelected
                              ? "2px solid #667eea"
                              : "1px solid #d9d9d9",
                            textAlign: "center",
                            transition: "all 0.3s ease",
                            transform: isSelected ? "scale(1.05)" : "scale(1)",
                          }}
                        >
                          <Text
                            strong
                            style={{
                              display: "block",
                              color: isSelected ? "white" : "#333",
                              fontSize: "14px",
                            }}
                          >
                            {sizeOption.size}
                          </Text>
                          <Text
                            style={{
                              display: "block",
                              color: isSelected
                                ? "rgba(255,255,255,0.9)"
                                : "#667eea",
                              fontSize: "10px",
                            }}
                          >
                            ₱{price}
                          </Text>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price Display */}
                {currentOrder.price > 0 && (
                  <div
                    className="price-display"
                    style={{
                      padding: "12px",
                      background:
                        "linear-gradient(135deg, #667eea15 0%, #1E3A7115 100%)",
                      borderRadius: "10px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    <Text style={{ fontSize: "11px", color: "#666" }}>
                      Price
                    </Text>
                    <div>
                      <Text
                        strong
                        style={{ fontSize: "28px", color: "#667eea" }}
                      >
                        ₱{currentOrder.price}
                      </Text>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={addOrderToCart}
                  icon={<ShoppingCartOutlined />}
                  className="add-to-cart-btn"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #1E3A71 100%)",
                    border: "none",
                    height: "48px",
                    fontSize: "15px",
                    fontWeight: "600",
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                  }}
                >
                  Add to Cart
                </Button>
              </Form>
            </Card>
          </div>

          {/* Preview Section - Sticky */}
          <div className="preview-container">
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                position: "sticky",
                top: "20px",
              }}
              styles={{ body: { padding: "20px" } }}
            >
              <Title
                level={5}
                style={{ margin: "0 0 12px 0", fontSize: "14px" }}
              >
                Live Preview
              </Title>

              <div
                ref={previewRef}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "350px",
                  background:
                    "linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%)",
                  borderRadius: "12px",
                }}
              >
                {previewLoading ? (
                  <div style={{ textAlign: "center" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: "12px" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Generating...
                      </Text>
                    </div>
                  </div>
                ) : currentOrder.preview ? (
                  <Image
                    src={currentOrder.preview}
                    alt="Shirt Preview"
                    style={{
                      width: "100%",
                      maxWidth: "350px",
                      borderRadius: "12px",
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text type="secondary" style={{ fontSize: "13px" }}>
                      Fill in name to see preview
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Shopping Cart - Compact */}
        {orders.length > 0 && (
          <div ref={cartRef} className="cart-section">
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}
              styles={{ body: { padding: "20px" } }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <Space>
                  <ShoppingCartOutlined
                    style={{ fontSize: "18px", color: "#667eea" }}
                  />
                  <Title level={5} style={{ margin: 0, fontSize: "16px" }}>
                    Cart
                  </Title>
                  <Badge
                    count={orders.length}
                    style={{ backgroundColor: "#667eea" }}
                  />
                </Space>
                <Title
                  level={5}
                  style={{ margin: 0, color: "#667eea", fontSize: "18px" }}
                >
                  ₱{getTotalAmount()}
                </Title>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                {orders.map((order, index) => (
                  <Card
                    key={order.id}
                    ref={(el) => (orderCardsRef.current[index] = el)}
                    type="inner"
                    size="small"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #e8e8e8",
                    }}
                    styles={{ body: { padding: "12px" } }}
                  >
                    {order.preview && (
                      <img
                        src={order.preview}
                        alt="Order Preview"
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          marginBottom: "8px",
                        }}
                      />
                    )}

                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      <Text strong style={{ fontSize: "13px" }}>
                        {order.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "11px" }}>
                        Size: {order.size}
                      </Text>
                      {order.shirtNumber && (
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          Number: {order.shirtNumber}
                        </Text>
                      )}
                      {order.desiredNumber && (
                        <Text
                          type="secondary"
                          style={{ fontSize: "11px", fontStyle: "italic" }}
                        >
                          Desired: {order.desiredNumber}
                        </Text>
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
                          style={{ color: "#667eea", fontSize: "16px" }}
                        >
                          ₱{order.price}
                        </Text>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeOrder(order.id)}
                          style={{ fontSize: "11px" }}
                        >
                          Remove
                        </Button>
                      </div>
                    </Space>
                  </Card>
                ))}
              </div>

              <Button
                type="primary"
                size="large"
                block
                loading={submitting}
                onClick={handleSubmitOrder}
                icon={<ArrowRightOutlined />}
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #1E3A71 100%)",
                  border: "none",
                  height: "52px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                }}
              >
                Checkout ({orders.length}{" "}
                {orders.length === 1 ? "item" : "items"})
              </Button>
            </Card>
          </div>
        )}

        {/* Edit Contact Modal */}
        <Modal
          title="Edit Contact Information"
          open={showEditConfirm}
          onOk={confirmEditContact}
          onCancel={() => setShowEditConfirm(false)}
          okText="Yes, Edit"
          cancelText="Cancel"
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Text>
              Are you sure you want to edit your email and mobile number? These
              changes will apply to all shirts in your order.
            </Text>
            <div
              style={{
                background: "#fff7e6",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ffd591",
              }}
            >
              <Text strong>Current Information:</Text>
              <div style={{ marginTop: "8px" }}>
                <Text>Email: {email}</Text>
                <br />
                <Text>Mobile: {mobileNumber}</Text>
              </div>
            </div>
          </Space>
        </Modal>

        {/* Size Chart Modal */}
        <Modal
          title={<Title level={4}>Size Chart</Title>}
          open={showSizeInfo}
          onCancel={() => setShowSizeInfo(false)}
          footer={null}
          width={700}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Title level={5}>Kids Sizes</Title>
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
              <Title level={5}>Adult Sizes</Title>
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
        @media (max-width: 968px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
          .preview-container {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ShirtOrdering;
