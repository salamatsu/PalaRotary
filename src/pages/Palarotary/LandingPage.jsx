import { Button, Card, Col, Row, Typography } from "antd";
import {
  TeamOutlined,
  BankOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  LoginOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";

const { Title, Paragraph } = Typography;

export default function PalarotaryLandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{ textAlign: "center", marginBottom: "60px", color: "white" }}
        >
          <Title
            level={1}
            style={{
              color: "white",
              fontSize: "56px",
              marginBottom: "16px",
              fontWeight: "bold",
            }}
          >
            PALAROTARY 2025
          </Title>
          <Title
            level={3}
            style={{
              color: "white",
              fontWeight: "normal",
              marginBottom: "24px",
            }}
          >
            Radio Enthusiasts Convention
          </Title>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "16px 24px",
                borderRadius: "8px",
                backdropFilter: "blur(10px)",
              }}
            >
              <CalendarOutlined
                style={{ fontSize: "24px", marginRight: "8px" }}
              />
              <strong>January 25, 2026</strong>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "16px 24px",
                borderRadius: "8px",
                backdropFilter: "blur(10px)",
              }}
            >
              <ClockCircleOutlined
                style={{ fontSize: "24px", marginRight: "8px" }}
              />
              <strong>8am - 6pm</strong>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "16px 24px",
                borderRadius: "8px",
                backdropFilter: "blur(10px)",
              }}
            >
              <EnvironmentOutlined
                style={{ fontSize: "24px", marginRight: "8px" }}
              />
              <strong>Marikina Sports Center</strong>
            </div>
          </div>
        </div>

        {/* Registration Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: "40px" }}>
          <Col xs={24} md={12}>
            <Card
              hoverable
              style={{
                height: "100%",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ textAlign: "center", padding: "20px" }}>
                <BankOutlined
                  style={{
                    fontSize: "64px",
                    color: "#fe0808",
                    marginBottom: "20px",
                  }}
                />
                <Title level={2} style={{ marginBottom: "16px" }}>
                  Club Registration
                </Title>
                <Paragraph
                  style={{
                    fontSize: "16px",
                    color: "#666",
                    marginBottom: "24px",
                  }}
                >
                  Register your club for PALAROTARY 2025
                </Paragraph>

                <div
                  style={{
                    background: "#f0f2f5",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                  }}
                >
                  <Title level={4} style={{ margin: 0, color: "#fe0808" }}>
                    ₱4,000.00
                  </Title>
                  <Paragraph
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    Registration Fee per Club
                  </Paragraph>
                </div>

                <div
                  style={{
                    textAlign: "left",
                    marginBottom: "24px",
                    padding: "0 20px",
                  }}
                >
                  <Paragraph style={{ fontSize: "14px", marginBottom: "8px" }}>
                    ✓ Official club registration
                  </Paragraph>
                  <Paragraph style={{ fontSize: "14px", marginBottom: "8px" }}>
                    ✓ Upload proof of payment
                  </Paragraph>
                  <Paragraph style={{ fontSize: "14px", marginBottom: "8px" }}>
                    ✓ Admin approval process
                  </Paragraph>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => navigate("/register-club")}
                  style={{
                    background: "#fe0808",
                    borderColor: "#fe0808",
                    height: "50px",
                    fontSize: "16px",
                  }}
                >
                  Register Your Club
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              hoverable
              style={{
                height: "100%",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ textAlign: "center", padding: "20px" }}>
                <TeamOutlined
                  style={{
                    fontSize: "64px",
                    color: "#52c41a",
                    marginBottom: "20px",
                  }}
                />
                <Title level={2} style={{ marginBottom: "16px" }}>
                  Member Registration
                </Title>
                <Paragraph
                  style={{
                    fontSize: "16px",
                    color: "#666",
                    marginBottom: "24px",
                  }}
                >
                  Join as an individual member
                </Paragraph>

                <div
                  style={{
                    background: "#f6ffed",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    border: "1px solid #b7eb8f",
                  }}
                >
                  <Title level={4} style={{ margin: 0, color: "#52c41a" }}>
                    FREE
                  </Title>
                  <Paragraph
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    No registration fee for members
                  </Paragraph>
                </div>

                <div
                  style={{
                    textAlign: "left",
                    marginBottom: "24px",
                    padding: "0 20px",
                  }}
                >
                  <Paragraph style={{ fontSize: "14px", marginBottom: "8px" }}>
                    ✓ Select your registered club
                  </Paragraph>
                  <Paragraph style={{ fontSize: "14px", marginBottom: "8px" }}>
                    ✓ Fill in your information
                  </Paragraph>
                  <Paragraph style={{ fontSize: "14px", marginBottom: "8px" }}>
                    ✓ Get your digital badge instantly
                  </Paragraph>
                  <Paragraph style={{ fontSize: "14px", marginBottom: "8px" }}>
                    ✓ Badge with QR code sent via email
                  </Paragraph>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => navigate("/register-member")}
                  style={{
                    background: "#52c41a",
                    borderColor: "#52c41a",
                    height: "50px",
                    fontSize: "16px",
                  }}
                >
                  Register as Member
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Payment Information */}
        <Card style={{ marginBottom: "40px", borderRadius: "12px" }}>
          <Title
            level={3}
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            Payment Information
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div
                style={{
                  background: "#f0f2f5",
                  padding: "20px",
                  borderRadius: "8px",
                  height: "100%",
                }}
              >
                <Title level={4} style={{ marginBottom: "16px" }}>
                  🏦 BDO Bank Transfer
                </Title>
                <Paragraph style={{ margin: "8px 0", fontSize: "16px" }}>
                  <strong>Account Name:</strong>
                  <br />
                  Rotary Club of Marikina Hilltop
                </Paragraph>
                <Paragraph style={{ margin: "8px 0", fontSize: "16px" }}>
                  <strong>Account Number:</strong>
                  <br />
                  0021 5802 5770
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  background: "#f0f2f5",
                  padding: "20px",
                  borderRadius: "8px",
                  height: "100%",
                }}
              >
                <Title level={4} style={{ marginBottom: "16px" }}>
                  📱 GCash Payment
                </Title>
                <Paragraph style={{ margin: "8px 0", fontSize: "16px" }}>
                  <strong>Account Name:</strong>
                  <br />
                  Karl Marcus Montaner
                </Paragraph>
                <Paragraph style={{ margin: "8px 0", fontSize: "16px" }}>
                  <strong>Mobile Number:</strong>
                  <br />
                  0917 522 5275
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Admin Login */}
        <div style={{ textAlign: "center" }}>
          <Button
            type="default"
            size="large"
            icon={<LoginOutlined />}
            onClick={() => navigate("/admin-login")}
            style={{
              background: "white",
              borderColor: "white",
              color: "#667eea",
              height: "50px",
              padding: "0 40px",
              fontSize: "16px",
            }}
          >
            Admin Login
          </Button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "60px", color: "white" }}>
          <Paragraph
            style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}
          >
            For questions and inquiries, please contact the organizing
            committee.
          </Paragraph>
          <Paragraph
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
              marginTop: "16px",
            }}
          >
            © 2025 PALAROTARY. All rights reserved.
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
