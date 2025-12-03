import {
  ArrowRightOutlined,
  CloseOutlined,
  DeleteOutlined,
  HomeOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useGSAP } from "@gsap/react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Form,
  Image,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { draw } from "../../hooks/useCanvas";
import {
  ADULT_SHIRT_SIZES,
  KID_SHIRT_SIZES,
  SHIRT_PRICING,
} from "../../lib/constants";
import {
  useApprovedClubs,
  useSubmitShirtOrder,
} from "../../services/requests/usePalarotary";

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
    size: "",
    sizeCategory: "adult",
    shirtNumber: "",
    price: 0,
    preview: null,
  });
  const [showSizeInfo, setShowSizeInfo] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isContactEditable, setIsContactEditable] = useState(true);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOrderData, setEditingOrderData] = useState(null);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);

  const [invoiceUrl, setInvoiceUrl] = useState(null);
  const [isOpenLink, setIsOpenLink] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  const { mutate: submitOrder, isPending: submitting } = useSubmitShirtOrder();
  const { data: clubsData, isLoading: loadingClubs } = useApprovedClubs();

  // Extract unique zones from clubs data
  const clubs = clubsData?.data || [];
  const zones = [
    ...new Set(clubs.map((club) => club.zone).filter(Boolean)),
  ].sort();

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
      // message.warning("Please validate your badge first");
      // navigate("/shirt-order");

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

    if (data?.zone) {
      setSelectedZone(data.zone);
      form.setFieldValue("zone", data.zone);
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

  const generatePreview = async (orderData, zoneOverride = null) => {
    const zone = zoneOverride || orderData.zone || selectedZone;
    if (!zone || !orderData.name) return null;

    try {
      setPreviewLoading(true);
      const preview = await draw({
        name: orderData.name,
        zone: zone,
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
          color: "#1E3A71",
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
        price: 0,
        preview: null,
      });

      form.resetFields();
      form.setFieldValue("email", email);
      form.setFieldValue("mobileNumber", mobileNumber);
      form.setFieldValue("zone", selectedZone);

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

  const handleSaveEdit = async (orderId) => {
    if (!editingOrderData) return;

    // Generate new preview with updated data
    const preview = await generatePreview(editingOrderData);

    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...editingOrderData, preview } : order
    );

    setOrders(updatedOrders);
    setEditingOrderId(null);
    setEditingOrderData(null);
    message.success("Order updated successfully!");

    // Animate save
    const cardElement =
      orderCardsRef.current[orders.findIndex((o) => o.id === orderId)];
    if (cardElement) {
      gsap.fromTo(
        cardElement,
        { backgroundColor: "#fff7e6", scale: 1.02 },
        { backgroundColor: "#fff", scale: 1, duration: 0.3 }
      );
    }
  };

  const handleCancelEdit = (orderId) => {
    setEditingOrderId(null);
    setEditingOrderData(null);

    // Animate cancel
    const cardElement =
      orderCardsRef.current[orders.findIndex((o) => o.id === orderId)];
    if (cardElement) {
      gsap.to(cardElement, {
        backgroundColor: "#fff",
        duration: 0.3,
      });
    }
  };

  const handleEditFieldChange = (field, value) => {
    if (field === "size") {
      const price = SHIRT_PRICING.sizes[value] || SHIRT_PRICING.base;
      setEditingOrderData((prev) => ({
        ...prev,
        [field]: value,
        price,
      }));
    } else {
      setEditingOrderData((prev) => ({
        ...prev,
        [field]: value,
      }));
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

  const handleCheckout = () => {
    if (orders.length === 0) {
      message.warning("Please add at least one shirt to your cart");
      return;
    }
    setShowCheckoutConfirm(true);
  };

  const handleSubmitOrder = async () => {
    const orderData = {
      qrCode: memberData?.qrCode,
      email: email,
      zone: selectedZone,
      mobileNumber: mobileNumber,
      shirtConfig: orders.map((order) => ({
        name: order.name,
        size: order.size,
        shirtNumber: order.shirtNumber,
      })),
    };

    submitOrder(orderData, {
      onSuccess: ({ data }) => {
        console.log(data);
        setShowCheckoutConfirm(false);
        message.success("Order submitted successfully!");

        // Redirect to success page
        // navigate("/palarotary/success", {
        //   state: {
        //     orderId: response.data?.orderId,
        //     orders,
        //     totalAmount: orders.reduce((sum, order) => sum + order.price, 0),
        //     memberData: memberData,
        //     email: email,
        //     mobileNumber: mobileNumber,
        //   },
        // });

        setInvoiceUrl(data?.url || data?.successUrl);
        setTimeout(() => {
          toggleOpenLink(true);
        }, 500);
      },
      onError: (error) => {
        setShowCheckoutConfirm(false);
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

  const toggleOpenLink = useCallback((value = false) => {
    if (!value) {
      setInvoiceUrl(null);
    }
    setIsOpenLink(value);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1E3A71 0%, #0f2847 100%)",
          padding: "40px 20px",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Header */}
          <div
            className="header-section"
            style={{
              textAlign: "center",
              marginBottom: "40px",
              position: "relative",
            }}
          >
            <Button
              type="default"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
              style={{
                position: "absolute",
                left: "0",
                top: "0",
                background: "white",
                borderRadius: "12px",
                fontWeight: "500",
              }}
            >
              Back to Home
            </Button>
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
          </div>

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
            <div className="form-container">
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
                  {/* Contact Information Section */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%)",
                      padding: "20px",
                      borderRadius: "12px",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <Text strong style={{ fontSize: "16px" }}>
                        Contact Information
                      </Text>
                      {/* <Button
                        type="link"
                        icon={
                          isContactEditable ? (
                            <LockOutlined />
                          ) : (
                            <EditOutlined />
                          )
                        }
                        onClick={handleEditContactToggle}
                      >
                        {isContactEditable ? "Lock" : "Edit"}
                      </Button> */}
                    </div>

                    <Form.Item
                      label={<Text strong>Email</Text>}
                      name="email"
                      rules={[
                        { required: true, message: "Please enter your email" },
                        {
                          type: "email",
                          message: "Please enter a valid email",
                        },
                      ]}
                    >
                      <Input
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label={<Text strong>Mobile Number</Text>}
                      name="mobileNumber"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your mobile number",
                        },
                        {
                          pattern: /^[0-9]{10,11}$/,
                          message: "Enter valid 10-11 digit phone number",
                        },
                      ]}
                    >
                      <Input
                        placeholder="09XXXXXXXXX"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        size="large"
                        maxLength={11}
                      />
                    </Form.Item>
                  </div>

                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%)",
                      padding: "20px",
                      borderRadius: "12px",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <Text strong style={{ fontSize: "16px" }}>
                        Shirt Information
                      </Text>
                    </div>

                    {/* Zone Selection */}
                    <Form.Item
                      label={<Text strong>Zone</Text>}
                      name="zone"
                      rules={[
                        { required: true, message: "Please select a zone" },
                      ]}
                    >
                      <Select
                        placeholder="Select zone"
                        size="large"
                        loading={loadingClubs}
                        value={selectedZone}
                        onChange={async (value) => {
                          setSelectedZone(value);
                          form.setFieldValue("zone", value);

                          // Regenerate preview if name exists
                          if (currentOrder.name) {
                            const preview = await generatePreview(
                              currentOrder,
                              value
                            );
                            setCurrentOrder((prev) => ({ ...prev, preview }));
                          }
                        }}
                        options={zones.map((zone) => ({
                          value: zone,
                          label: zone,
                        }))}
                      />
                    </Form.Item>

                    {/* Name Input */}
                    <Form.Item
                      label={<Text strong>Name (on shirt)</Text>}
                      name="name"
                      rules={[
                        { required: true, message: "Please enter the name" },
                        {
                          max: 20,
                          message: "Name cannot exceed 20 characters",
                        },
                      ]}
                      normalize={(value) => value?.toUpperCase()}
                    >
                      <Input
                        placeholder="Enter last name"
                        onChange={(e) =>
                          handleFieldChange("name", e.target.value)
                        }
                        size="large"
                        maxLength={20}
                      />
                    </Form.Item>

                    {/* Shirt Number */}
                    <Form.Item
                      label={
                        <Text strong>
                          Shirt Number <small>(00-99)</small>
                        </Text>
                      }
                      name="shirtNumber"
                      rules={[
                        {
                          required: true,
                          message: "Please select shirt number",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select shirt number"
                        size="large"
                        showSearch
                        allowClear
                        onChange={(value) =>
                          handleFieldChange("shirtNumber", value)
                        }
                        options={Array.from({ length: 100 }, (_, i) => {
                          const numberStr = String(i).padStart(2, "0");
                          return {
                            value: numberStr,
                            label: numberStr,
                          };
                        })}
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
                          const isSelected =
                            currentOrder.size === sizeOption.size;

                          return (
                            <div
                              key={sizeOption.size}
                              className={`size-option-${sizeOption.size}`}
                              onClick={() => handleSizeClick(sizeOption.size)}
                              style={{
                                cursor: "pointer",
                                padding: "12px 8px",
                                borderRadius: "8px",
                                background: isSelected ? "#1E3A71" : "#f5f5f5",
                                border: isSelected
                                  ? "none"
                                  : "1px solid #d9d9d9",
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
                                    : "#1E3A71",
                                  fontSize: "12px",
                                }}
                              >
                                ₱{price}
                              </Text>
                            </div>
                          );
                        })}
                      </div>
                    </Form.Item>
                  </div>

                  {currentOrder.price > 0 && (
                    <div
                      className="price-display"
                      style={{
                        padding: "16px",
                        background:
                          "linear-gradient(135deg, #1E3A7115 0%, #0f284715 100%)",
                        borderRadius: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <Space
                        style={{
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text strong style={{ fontSize: "18px" }}>
                          Price:
                        </Text>
                        <Text
                          strong
                          style={{ fontSize: "24px", color: "#1E3A71" }}
                        >
                          ₱{currentOrder.price}
                        </Text>
                      </Space>
                    </div>
                  )}

                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={addOrderToCart}
                    icon={<ShoppingCartOutlined />}
                    className="add-to-cart-btn"
                    style={{
                      background:
                        "linear-gradient(135deg, #1E3A71 0%, #0f2847 100%)",
                      border: "none",
                      height: "56px",
                      fontSize: "18px",
                      fontWeight: "600",
                      borderRadius: "12px",
                      boxShadow: "0 6px 20px rgba(30, 58, 113, 0.4)",
                    }}
                  >
                    Add to Cart
                  </Button>
                </Form>
              </Card>
            </div>

            {/* Live Preview */}
            <div className="preview-container">
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
                  ref={previewRef}
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
                    <Image
                      src={currentOrder.preview}
                      alt="Shirt Preview"
                      style={{
                        width: "100%",
                        maxWidth: "500px",
                        borderRadius: "12px",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                      }}
                      preview
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      <Text type="secondary" style={{ fontSize: "16px" }}>
                        Select zone and enter name to see preview
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Shopping Cart */}
          {orders.length > 0 && (
            <div ref={cartRef}>
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
                      style={{ fontSize: "24px", color: "#1E3A71" }}
                    />
                    <Title level={3} style={{ margin: 0 }}>
                      Shopping Cart
                    </Title>
                    <Badge
                      count={orders.length}
                      style={{ backgroundColor: "#1E3A71" }}
                    />
                  </Space>
                  <Title level={3} style={{ margin: 0, color: "#1E3A71" }}>
                    Total: ₱{getTotalAmount()}
                  </Title>
                </div>

                <Divider />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  {orders.map((order, index) => {
                    const isEditing = editingOrderId === order.id;
                    const displayOrder = isEditing ? editingOrderData : order;

                    return (
                      <Card
                        key={order.id}
                        ref={(el) => (orderCardsRef.current[index] = el)}
                        type="inner"
                        style={{
                          borderRadius: "12px",
                          border: isEditing
                            ? "2px solid #1E3A71"
                            : "2px solid #f0f0f0",
                        }}
                      >
                        {order.preview && (
                          // <img
                          //   src={order.preview}
                          //   alt="Order Preview"
                          //   style={{
                          //     width: "100%",
                          //     borderRadius: "8px",
                          //     marginBottom: "12px",
                          //   }}
                          // />
                          <Image
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
                          {isEditing ? (
                            <>
                              <Input
                                value={displayOrder.name}
                                onChange={(e) =>
                                  handleEditFieldChange("name", e.target.value)
                                }
                                placeholder="Name"
                                size="small"
                              />
                              <Select
                                value={displayOrder.size}
                                onChange={(value) =>
                                  handleEditFieldChange("size", value)
                                }
                                style={{ width: "100%" }}
                                size="small"
                              >
                                {(displayOrder.sizeCategory === "kid"
                                  ? KID_SHIRT_SIZES
                                  : ADULT_SHIRT_SIZES
                                ).map((s) => (
                                  <Option key={s.size} value={s.size}>
                                    {s.size}
                                  </Option>
                                ))}
                              </Select>
                              <Input
                                value={displayOrder.shirtNumber}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, "");
                                  if (value.length <= 2) {
                                    handleEditFieldChange("shirtNumber", value);
                                  }
                                }}
                                placeholder="Shirt Number"
                                maxLength={2}
                                size="small"
                              />
                            </>
                          ) : (
                            <>
                              <Text strong style={{ fontSize: "16px" }}>
                                {order.name}
                              </Text>
                              <Text type="secondary">Size: {order.size}</Text>
                              {order.shirtNumber && (
                                <Text type="secondary">
                                  Number: {order.shirtNumber}
                                </Text>
                              )}
                            </>
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
                              style={{ color: "#1E3A71", fontSize: "18px" }}
                            >
                              ₱{displayOrder.price}
                            </Text>
                            <Space>
                              {isEditing ? (
                                <>
                                  <Button
                                    type="primary"
                                    size="small"
                                    icon={<SaveOutlined />}
                                    onClick={() => handleSaveEdit(order.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={() => handleCancelEdit(order.id)}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {/* <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditOrder(order.id)}
                                >
                                  Edit
                                </Button> */}
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeOrder(order.id)}
                                  >
                                    Remove
                                  </Button>
                                </>
                              )}
                            </Space>
                          </div>
                        </Space>
                      </Card>
                    );
                  })}
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleCheckout}
                  icon={<ArrowRightOutlined />}
                  style={{
                    background:
                      "linear-gradient(135deg, #1E3A71 0%, #0f2847 100%)",
                    border: "none",
                    height: "60px",
                    fontSize: "18px",
                    fontWeight: "600",
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(30, 58, 113, 0.4)",
                  }}
                >
                  Proceed to Checkout ({orders.length}{" "}
                  {orders.length === 1 ? "item" : "items"} - ₱{getTotalAmount()}
                  )
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
                Are you sure you want to edit your email and mobile number?
                These changes will apply to all shirts in your order.
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
                    {
                      title: "Width (inches)",
                      dataIndex: "width",
                      key: "width",
                    },
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
                    {
                      title: "Width (inches)",
                      dataIndex: "width",
                      key: "width",
                    },
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

          {/* Checkout Confirmation Modal */}
          <Modal
            title={
              <div style={{ textAlign: "center" }}>
                <Title level={3} style={{ margin: 0, color: "#1E3A71" }}>
                  Confirm Your Order
                </Title>
              </div>
            }
            open={showCheckoutConfirm}
            onCancel={() => setShowCheckoutConfirm(false)}
            footer={null}
            width={700}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Contact Information */}
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "16px",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  Contact Information
                </Text>
                <div
                  style={{
                    background: "#f5f7fa",
                    padding: "16px",
                    borderRadius: "8px",
                  }}
                >
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text type="secondary">Email: </Text>
                      <Text strong>{email}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Mobile: </Text>
                      <Text strong>{mobileNumber}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Zone: </Text>
                      <Tag color="blue">{selectedZone}</Tag>
                    </div>
                  </Space>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "16px",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  Order Items ({orders.length}{" "}
                  {orders.length === 1 ? "item" : "items"})
                </Text>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    {orders.map((order, index) => (
                      <div
                        key={order.id}
                        style={{
                          background: "#f5f7fa",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #e8edf2",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                          }}
                        >
                          <Space direction="vertical" size={0}>
                            <Text strong>
                              {index + 1}. {order.name}
                            </Text>
                            <Text type="secondary" style={{ fontSize: "13px" }}>
                              Size: {order.size}
                            </Text>
                            {order.shirtNumber && (
                              <Text
                                type="secondary"
                                style={{ fontSize: "13px" }}
                              >
                                Number: {order.shirtNumber}
                              </Text>
                            )}
                          </Space>
                          <Text
                            strong
                            style={{ color: "#1E3A71", fontSize: "16px" }}
                          >
                            ₱{order.price}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </Space>
                </div>
              </div>

              {/* Total Amount */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #1E3A71 0%, #0f2847 100%)",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "16px",
                    display: "block",
                  }}
                >
                  Total Amount
                </Text>
                <Title
                  level={2}
                  style={{ color: "white", margin: "8px 0 0 0" }}
                >
                  ₱{getTotalAmount()}
                </Title>
              </div>

              {/* Action Buttons */}
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  size="large"
                  onClick={() => setShowCheckoutConfirm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={submitting}
                  onClick={handleSubmitOrder}
                  icon={<ArrowRightOutlined />}
                  style={{
                    background:
                      "linear-gradient(135deg, #1E3A71 0%, #0f2847 100%)",
                    border: "none",
                  }}
                >
                  Confirm & Submit Order
                </Button>
              </Space>
            </Space>
          </Modal>
        </div>

        {/* Responsive CSS */}
        <style jsx="true">{`
          @media (max-width: 768px) {
            .shirt-order-grid {
              grid-template-columns: 1fr !important;
            }
            .header-section {
              padding-top: 60px !important;
            }
            .header-section button {
              position: static !important;
              margin-bottom: 20px !important;
            }
          }
        `}</style>
      </div>

      <Drawer
        open={isOpenLink}
        onClose={() => toggleOpenLink(false)}
        title="PAYMENT CHANNELS"
        placement="bottom"
        height="100%"
        closeIcon={false}
        extra={
          <Button type="primary" onClick={() => toggleOpenLink(false)}>
            <CloseOutlined /> CLOSE
          </Button>
        }
        styles={{
          body: {
            padding: "0",
          },
        }}
      >
        <iframe
          className="w-full h-full"
          title="Invoice"
          src={invoiceUrl}
        ></iframe>
      </Drawer>
    </>
  );
};

export default ShirtOrdering;
