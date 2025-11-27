import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { Result, Button, Card, Typography, Space, Tag, Divider } from "antd";
import {
  CheckCircleOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const { Title, Text, Paragraph } = Typography;

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const {
    orderId,
    orders = [],
    totalAmount = 0,
    memberData,
    email,
    mobileNumber,
  } = location.state || {};

  useEffect(() => {
    // Trigger confetti animation on mount
    if (orderId) {
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
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [orderId]);

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

  if (!orderId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1E3A71 0%, #0f2847 100%)",
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
                    "linear-gradient(135deg, #1E3A71 0%, #0f2847 100%)",
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
        background: "linear-gradient(135deg, #1E3A71 0%, #0f2847 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Success Result */}
        <Card
          className="success-card"
          style={{
            borderRadius: "24px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          <div className="success-icon">
            <CheckCircleOutlined
              style={{ fontSize: "80px", color: "#52c41a" }}
            />
          </div>

          <Title
            level={1}
            className="success-title"
            style={{ marginTop: "24px", color: "#1E3A71" }}
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
              background: "linear-gradient(135deg, #1E3A71 0%, #0f2847 100%)",
              padding: "20px",
              borderRadius: "12px",
              marginTop: "24px",
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Order ID
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

        {/* Contact Information */}
        <Card
          className="success-card"
          style={{
            borderRadius: "24px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            marginBottom: "24px",
          }}
        >
          <Title level={4} style={{ marginBottom: "16px", color: "#1E3A71" }}>
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
              <Tag color="blue">{memberData?.zone}</Tag>
            </div>
          </Space>
        </Card>

        {/* Order Summary */}
        <Card
          className="success-card"
          style={{
            borderRadius: "24px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
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
            <Title level={4} style={{ margin: 0, color: "#1E3A71" }}>
              Order Summary
            </Title>
            <Text strong style={{ fontSize: "20px", color: "#1E3A71" }}>
              ₱{totalAmount}
            </Text>
          </div>

          <Divider />

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {orders.map((order, index) => (
              <div
                key={order.id || index}
                style={{
                  background: "#f5f7fa",
                  padding: "16px",
                  borderRadius: "12px",
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
                  <Space direction="vertical" size={2}>
                    <Text strong style={{ fontSize: "16px" }}>
                      {index + 1}. {order.name}
                    </Text>
                    <Text type="secondary">Size: {order.size}</Text>
                    {order.shirtNumber && (
                      <Text type="secondary">Number: {order.shirtNumber}</Text>
                    )}
                    {order.desiredNumber && (
                      <Text
                        type="secondary"
                        style={{ fontStyle: "italic", color: "#faad14" }}
                      >
                        Desired Number: {order.desiredNumber}
                      </Text>
                    )}
                  </Space>
                  <Text strong style={{ fontSize: "18px", color: "#1E3A71" }}>
                    ₱{order.price}
                  </Text>
                </div>
              </div>
            ))}
          </Space>
        </Card>

        {/* What's Next */}
        <Card
          className="success-card"
          style={{
            borderRadius: "24px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            marginBottom: "24px",
            background: "#fffbf0",
            border: "2px solid #ffd591",
          }}
        >
          <Title level={4} style={{ marginBottom: "16px", color: "#fa8c16" }}>
            📋 What's Next?
          </Title>
          <Space direction="vertical" size="small">
            <div style={{ display: "flex", alignItems: "start" }}>
              <Text style={{ marginRight: "8px" }}>✓</Text>
              <Text>Our team will review your order</Text>
            </div>
            <div style={{ display: "flex", alignItems: "start" }}>
              <Text style={{ marginRight: "8px" }}>✓</Text>
              <Text>
                If you requested a desired number, it will be reviewed for
                approval
              </Text>
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

        {/* Action Buttons */}
        <Card
          className="success-card"
          style={{
            borderRadius: "24px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
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
                    "linear-gradient(135deg, #1E3A71 0%, #0f2847 100%)",
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
                  borderColor: "#1E3A71",
                  color: "#1E3A71",
                }}
              >
                Order More Shirts
              </Button>
            </div>
          </Space>
        </Card>
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
