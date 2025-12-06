import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Result,
  Button,
  Card,
  Typography,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  Spin,
  Image,
} from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import { useGetTransactionInfo } from "../../services/requests/usePalarotary";
import { draw } from "../../hooks/useCanvas";

const { Title, Text, Paragraph } = Typography;

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const tn = location.search || {};
  const [itemPreviews, setItemPreviews] = useState({});
  const [previewsLoading, setPreviewsLoading] = useState(false);

  const {
    data: transactionData,
    isLoading,
    isSuccess,
  } = useGetTransactionInfo(tn);

  // Extract data from API response
  const transaction = transactionData?.data?.transaction || {};
  const attendee = transactionData?.data?.attendee || {};
  const merchandiseItems = transactionData?.data?.merchandiseItems || [];
  const totalAmount = transactionData?.data?.transaction?.totalAmount || {};

  const orderId = transaction.transactionNumber;
  const email = attendee.email;
  const mobileNumber = attendee.mobileNumber;
  const zone = attendee.zone;

  useEffect(() => {
    // Trigger confetti animation when transaction is successfully fetched
    if (isSuccess) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          zIndex: 9999,
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          zIndex: 9999,
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isSuccess]);

  // Generate previews for merchandise items
  useEffect(() => {
    const generatePreviews = async () => {
      if (!merchandiseItems || merchandiseItems.length === 0) return;

      setPreviewsLoading(true);
      const previews = {};

      for (const item of merchandiseItems) {
        try {
          // Use zone from item or fallback to attendee zone
          const itemZone = item.zone || zone;
          if (!itemZone) {
            console.warn(`No zone found for item ${item.merchandiseId}`);
            continue;
          }

          const preview = await draw({
            name: item.name || "SHIRT NAME",
            zone: itemZone,
            number: item.shirtNumber || "00",
          });
          previews[item.merchandiseId] = preview;
        } catch (error) {
          console.error(
            `Failed to generate preview for item ${item.merchandiseId}:`,
            error
          );
        }
      }

      setItemPreviews(previews);
      setPreviewsLoading(false);
    };

    if (isSuccess && merchandiseItems.length > 0) {
      generatePreviews();
    }
  }, [isSuccess, zone, merchandiseItems]);

  // GSAP animations
  useGSAP(
    () => {
      if (containerRef.current && orderId) {
        const tl = gsap.timeline();

        tl.from(".success-icon", {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(2)",
        })
          .from(
            ".success-title",
            {
              y: -30,
              opacity: 0,
              duration: 0.6,
              ease: "power3.out",
            },
            "-=0.3"
          )
          .from(
            ".success-card",
            {
              y: 50,
              opacity: 0,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.1,
            },
            "-=0.4"
          );
      }
    },
    { scope: containerRef }
  );

  const handleGoHome = () => {
    navigate("/");
  };

  const handleOrderAgain = () => {
    navigate("/shirt-order");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Card
          style={{
            maxWidth: "500px",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <Spin />
          <Title level={3} style={{ color: "#1c3c6d" }}>
            Loading your order details...
          </Title>
        </Card>
      </div>
    );
  }

  // Show error state if no transaction number or failed to fetch
  if (!tn || !orderId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Card style={{ maxWidth: "500px", borderRadius: "16px" }}>
          <Result
            status="warning"
            title="No Order Found"
            subTitle="Please complete your order first"
            extra={
              <Button
                type="primary"
                size="large"
                onClick={handleGoHome}
                icon={<HomeOutlined />}
                style={{
                  background:
                    "linear-gradient(135deg, #1c3c6d 0%, #0f2847 100%)",
                  border: "none",
                }}
              >
                Go to Home
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating background elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            borderRadius: "50%",
            background:
              i % 3 === 0
                ? `rgba(28, 60, 109, ${Math.random() * 0.06 + 0.02})`
                : i % 3 === 1
                ? `rgba(247, 165, 10, ${Math.random() * 0.06 + 0.02})`
                : `rgba(213, 72, 57, ${Math.random() * 0.06 + 0.02})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: "none",
          }}
          animate={{
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.2, 1],
            y: [0, -30, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Success Result */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            className="success-card"
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
              marginBottom: "24px",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="success-icon">
              <CheckCircleOutlined
                style={{ fontSize: "80px", color: "#f7a50a" }}
              />
            </div>

            <Title
              level={1}
              className="success-title"
              style={{ marginTop: "24px", color: "#1c3c6d" }}
            >
              Order Submitted Successfully!
            </Title>

            <Paragraph
              style={{ fontSize: "16px", color: "#666", marginTop: "16px" }}
            >
              Your custom shirt order has been received and is being processed.
            </Paragraph>

            <div
              style={{
                background: "linear-gradient(135deg, #1c3c6d 0%, #0f2847 100%)",
                padding: "20px",
                borderRadius: "12px",
                marginTop: "24px",
              }}
            >
              <Text
                style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}
              >
                Transaction Number
              </Text>
              <Title level={2} style={{ color: "white", margin: "8px 0 0 0" }}>
                {orderId}
              </Title>
            </div>

            <Paragraph
              type="secondary"
              style={{ marginTop: "24px", fontSize: "14px" }}
            >
              Please save your order ID for reference. You will be contacted
              regarding payment and delivery details.
            </Paragraph>
          </Card>
        </motion.div>

        {/* Contact Information */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card
            className="success-card"
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
              marginBottom: "24px",
            }}
          >
            <Title level={4} style={{ marginBottom: "16px", color: "#1c3c6d" }}>
              Contact Information
            </Title>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
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
                <Tag color="blue">{attendee?.zone}</Tag>
              </div>
            </Space>
          </Card>
        </motion.div> */}

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card
            className="success-card"
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
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
              <Title level={4} style={{ margin: 0, color: "#1c3c6d" }}>
                Order Summary
              </Title>
              <Text strong style={{ fontSize: "20px", color: "#1c3c6d" }}>
                ₱{totalAmount}
              </Text>
            </div>

            <Divider />
            <div className=" flex flex-wrap justify-center items-center gap-4">
              {merchandiseItems.map((item, index) => (
                <motion.div
                  key={item.merchandiseId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    style={{
                      borderRadius: "16px",
                      border: "2px solid #e8edf5",
                      overflow: "hidden",
                      height: "100%",
                    }}
                    styles={{
                      body: {
                        padding: "16px",
                      },
                    }}
                  >
                    {/* Preview Image */}
                    <div
                      style={{
                        maxWidth: "350px",
                        // height: "200px",
                        background:
                          "linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)",
                        borderRadius: "12px",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {previewsLoading ? (
                        <Spin size="large" />
                      ) : itemPreviews[item.merchandiseId] ? (
                        <Image
                          src={itemPreviews[item.merchandiseId]}
                          alt={item.name}
                          style={{
                            minWidth: "200px",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Text type="secondary">No preview available</Text>
                      )}
                    </div>

                    {/* Item Details */}
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <Text
                          strong
                          style={{
                            fontSize: "16px",
                            color: "#1c3c6d",
                          }}
                          className="uppercase"
                        >
                          {item.name}
                        </Text>
                        {/* <Tag color="blue" style={{ fontSize: "12px" }}>
                          #{index + 1}
                        </Tag> */}
                      </div>

                      <div style={{ marginTop: "8px" }}>
                        <Text
                          type="secondary"
                          style={{ fontSize: "13px", display: "block" }}
                        >
                          Size: <Text strong>{item.size}</Text>
                        </Text>

                        {item.shirtNumber && (
                          <Text
                            type="secondary"
                            style={{ fontSize: "13px", display: "block" }}
                          >
                            Number:{" "}
                            <Text strong style={{ color: "#1c3c6d" }}>
                              {item.shirtNumber}
                            </Text>
                          </Text>
                        )}

                        {item.desiredShirtNumber && (
                          <Text
                            style={{
                              fontSize: "13px",
                              fontStyle: "italic",
                              color: "#f7a50a",
                              display: "block",
                            }}
                          >
                            Desired: {item.desiredShirtNumber}
                          </Text>
                        )}
                      </div>

                      {/* <Divider style={{ margin: "12px 0" }} />

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          Price
                        </Text>
                        <Text
                          strong
                          style={{
                            fontSize: "20px",
                            color: "#d54839",
                          }}
                        >
                          ₱{item.subtotal}
                        </Text>
                      </div> */}
                    </Space>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card
            className="success-card"
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
              marginBottom: "24px",
              background: "#fffbf0",
              border: "2px solid #ffd591",
            }}
          >
            <Title level={4} style={{ marginBottom: "16px", color: "#f7a50a" }}>
              📋 What's Next?
            </Title>
            <Space direction="vertical" size="small">
              <div style={{ display: "flex", alignItems: "start" }}>
                <Text style={{ marginRight: "8px" }}>✓</Text>
                <Text>Our team will review your order</Text>
              </div>
              <div style={{ display: "flex", alignItems: "start" }}>
                <Text style={{ marginRight: "8px" }}>✓</Text>
                <Text>You will receive the receipt via email</Text>
              </div>
              <div style={{ display: "flex", alignItems: "start" }}>
                <Text style={{ marginRight: "8px" }}>✓</Text>
                <Text>
                  You will receive a confirmation call regarding delivery and
                  desired number
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "start" }}>
                <Text style={{ marginRight: "8px" }}>✓</Text>
                <Text>Your custom shirts will be prepared and shipped</Text>
              </div>
            </Space>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card
            className="success-card"
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
            }}
          >
            <Space
              direction="vertical"
              size="large"
              style={{ width: "100%", textAlign: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<HomeOutlined />}
                  onClick={handleGoHome}
                  style={{
                    background:
                      "linear-gradient(135deg, #1c3c6d 0%, #0f2847 100%)",
                    border: "none",
                    height: "56px",
                    fontSize: "16px",
                    fontWeight: "600",
                    borderRadius: "12px",
                  }}
                >
                  Go to Home
                </Button>
                <Button
                  size="large"
                  block
                  icon={<ShoppingCartOutlined />}
                  onClick={handleOrderAgain}
                  style={{
                    height: "56px",
                    fontSize: "16px",
                    fontWeight: "600",
                    borderRadius: "12px",
                    borderColor: "#1c3c6d",
                    color: "#1c3c6d",
                  }}
                >
                  Order More Shirts
                </Button>
              </div>
            </Space>
          </Card>
        </motion.div>
      </div>

      {/* Responsive CSS */}
      <style jsx="true">{`
        @media (max-width: 768px) {
          .success-icon {
            font-size: 60px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Success;
