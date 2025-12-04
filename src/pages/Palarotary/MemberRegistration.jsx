import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  QrcodeOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Typography,
  Alert,
} from "antd";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { logo2, logoBanner } from "../../assets/images/logos";
import { shirtTemplate } from "../../assets/images/Other";
import {
  useApprovedClubs,
  useRegisterMember,
} from "../../services/requests/usePalarotary";
import { imageToBase64 } from "../../utils/tobase64";

const { Paragraph } = Typography;
// {
//     "attendeeId": "KUZW80G76FL4HGW7",
//     "qrCode": "P20251MIFRH18N1126",
//     "fullName": "CHRISTOPHER DUNGARAN",
//     "firstName": "CHRISTOPHER",
//     "lastName": "DUNGARAN",
//     "email": "toopsidy0023@gmail.com",
//     "clubName": "DARK HORSE",
//     "eventId": 1,
//     "badgeUrl": "http://192.168.2.169:3000/api/v1/users/badge/KUZW80G76FL4HGW7"
// }

export default function MemberRegistration() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [badgeData, setBadgeData] = useState(null);
  const [formLoadTime] = useState(Date.now());

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const badgeRef = useRef(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const registerMember = useRegisterMember();
  const { data: clubsData, isLoading: loadingClubs } = useApprovedClubs();
  console.log(registerMember.data);
  const clubs = clubsData?.data || [];

  // Extract unique zones from clubs
  const zones = [
    ...new Set(clubs.map((club) => club.zone).filter(Boolean)),
  ].sort();

  // Filter clubs by selected zone
  const filteredClubs = selectedZone
    ? clubs.filter((club) => club.zone === selectedZone)
    : clubs;

  // Initial page load animation with GSAP
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  // Animate form fields with GSAP
  useEffect(() => {
    if (formRef.current && !registrationComplete) {
      const formItems = formRef.current.querySelectorAll(".ant-form-item");
      gsap.fromTo(
        formItems,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.05,
          delay: 0.2,
          ease: "power2.out",
        }
      );
    }
  }, [registrationComplete]);

  // Animate badge on success with GSAP
  useEffect(() => {
    if (badgeRef.current && registrationComplete) {
      const successIcon = badgeRef.current.querySelector(".success-icon");
      const badgeItems = badgeRef.current.querySelectorAll(".badge-item");
      const qrCode = badgeRef.current.querySelector(".qr-code");

      // Success icon pulse
      gsap.fromTo(
        successIcon,
        { scale: 0 },
        { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }
      );

      // Badge items fade in
      gsap.fromTo(
        badgeItems,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          delay: 0.4,
          ease: "power2.out",
        }
      );

      // QR Code zoom
      if (qrCode) {
        gsap.fromTo(
          qrCode,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.7,
            delay: 0.3,
            ease: "elastic.out(1, 0.6)",
          }
        );
      }
    }
  }, [registrationComplete, badgeData]);

  const onFinish = async (values) => {
    try {
      // Bot detection: Check honeypot fields
      if (values.captcha || values.website) {
        // Silent rejection - honeypot fields should be empty
        console.warn("Bot detected: Honeypot field filled");
        message.error("An error occurred. Please try again.");
        return;
      }

      // Bot detection: Check submission time
      const timeSinceLoad = (Date.now() - formLoadTime) / 1000; // in seconds
      if (timeSinceLoad < 3) {
        // Submission too fast (less than 3 seconds)
        console.warn("Bot detected: Submission too fast");
        message.error("Please take your time filling out the form.");
        return;
      }

      // Remove honeypot fields from payload
      const { captcha, website, ...cleanValues } = values;

      // Add static origin value "P" for pre-registered
      const payload = {
        ...cleanValues,
        origin: "P",
      };

      const response = await registerMember.mutateAsync(payload);

      // Animate form exit with GSAP
      gsap.to(formRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setBadgeData(response.data);
          setRegistrationComplete(true);
          message.success(
            "Registration successful! Check your email for your digital badge."
          );
        },
      });
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to register member"
      );
    }
  };

  const downloadQRCode = async () => {
    if (badgeData?.badgeUrl) {
      try {
        // Convert image URL to base64
        const base64Image = await imageToBase64(badgeData.badgeUrl);

        // Create download link
        const a = document.createElement("a");
        a.download = `PALAROTARY-${badgeData.qrCode}.png`;
        a.href = base64Image;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);

        message.success("QR Code downloaded!");
      } catch (error) {
        console.error("Failed to download QR code:", error);
        message.error("Failed to download QR code. Please try again.");
      }
    }
  };

  if (registrationComplete && badgeData) {
    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: "1200px" }}
        >
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div ref={badgeRef} style={{ padding: "20px" }}>
              {/* Success Header - Full Width */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <motion.div
                  className="success-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ fontSize: "40px", color: "white" }}
                  />
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#10b981",
                    marginBottom: "8px",
                  }}
                >
                  Registration Successful!
                </motion.h1>
              </div>

              {/* Two Column Layout */}
              <Row gutter={[24, 24]}>
                {/* Left Column - Digital Badge */}
                <Col xs={24} lg={12}>
                  <motion.div
                    className="badge-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      background:
                        "linear-gradient(135deg, #1e3a8a08 0%, #3b82f608 100%)",
                      padding: "20px",
                      borderRadius: "20px",
                      border: "2px solid #3b82f620",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        marginBottom: "16px",
                      }}
                    >
                      <QrcodeOutlined
                        style={{ fontSize: "24px", color: "#1e3a8a" }}
                      />
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#1e3a8a",
                        }}
                      >
                        Your Digital Badge
                      </h3>
                    </div>

                    <div
                      className="qr-code"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "20px",
                      }}
                    >
                      {badgeData?.qrCode && (
                        <motion.img
                          initial={{ rotate: -10, scale: 0.8 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            delay: 0.5,
                          }}
                          src={badgeData?.badgeUrl}
                          alt="QR Code Badge"
                          style={{
                            maxWidth: "400px",
                            // width: "220px",
                            // height: "220px",
                            // border: "3px solid #1e3a8a",
                            // borderRadius: "16px",
                            // padding: "12px",
                            // background: "white",
                            // boxShadow: "0 8px 20px rgba(30, 58, 138, 0.2)",
                          }}
                        />
                      )}
                    </div>

                    {/* <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  style={{
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "12px",
                    textAlign: "left",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    className="badge-item"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: "8px 16px",
                      fontSize: "14px",
                    }}
                  >
                    <strong style={{ color: "#475569" }}>Name:</strong>
                    <span
                      style={{ color: "#1e293b", fontWeight: "600" }}
                      className="uppercase"
                    >
                      {[badgeData?.firstName, badgeData?.lastName]
                        .join(" ")
                        ?.trim()}
                    </span>

                    <strong style={{ color: "#475569" }}>Club:</strong>
                    <span
                      style={{ color: "#1e293b", fontWeight: "600" }}
                      className="uppercase"
                    >
                      {badgeData?.clubName}
                    </span>

                    {badgeData?.companyName && (
                      <>
                        <strong style={{ color: "#475569" }}>Company:</strong>
                        <span style={{ color: "#1e293b", fontWeight: "600" }}>
                          {badgeData?.companyName}
                        </span>
                      </>
                    )}

                    {badgeData?.position && (
                      <>
                        <strong style={{ color: "#475569" }}>Position:</strong>
                        <span style={{ color: "#1e293b", fontWeight: "600" }}>
                          {badgeData?.position}
                        </span>
                      </>
                    )}
                  </div>
                </motion.div> */}

                    <motion.div
                      className="badge-item"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f615 0%, #1e3a8a15 100%)",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        color: "#1e3a8a",
                        lineHeight: "1.6",
                      }}
                    >
                      Your digital badge has been sent to your email. Present
                      this QR code at the registration desk on event day.
                    </motion.div>

                    <motion.div
                      className="badge-item"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={downloadQRCode}
                        block
                        size="large"
                        style={{
                          background:
                            "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                          border: "none",
                          height: "48px",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "16px",
                          boxShadow: "0 4px 15px rgba(30, 58, 138, 0.4)",
                        }}
                      >
                        Download QR Code
                      </Button>
                    </motion.div>
                  </motion.div>
                </Col>

                {/* Right Column - Event Details, Alert, and Shirt Advertisement */}
                <Col xs={24} lg={12}>
                  <motion.div
                    className="badge-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    style={{
                      background:
                        "linear-gradient(135deg, #fff9eb 0%, #fff3d6 100%)",
                      padding: "16px",
                      borderRadius: "16px",
                      marginBottom: "20px",
                      textAlign: "left",
                      border: "2px solid #f7a50a30",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: "#f7a50a",
                      }}
                    >
                      Event Details
                    </h3>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#1a1a2e",
                        lineHeight: "1.6",
                      }}
                    >
                      <p style={{ margin: "4px 0" }}>
                        <strong>Event:</strong>{" "}
                        {badgeData?.eventDetails?.eventName}
                      </p>
                      <p style={{ margin: "4px 0" }}>
                        <strong>Date:</strong>{" "}
                        {badgeData?.eventDetails?.eventDate}
                      </p>
                      {badgeData?.eventDetails?.location && (
                        <p style={{ margin: "4px 0" }}>
                          <strong>Time:</strong>{" "}
                          {badgeData?.eventDetails?.location}
                        </p>
                      )}
                      {badgeData?.eventDetails?.description && (
                        <p style={{ margin: "4px 0" }}>
                          <strong>Venue:</strong>{" "}
                          {badgeData?.eventDetails?.description}
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {/* Alert to download badge first */}
                  <motion.div
                    className="badge-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <Alert
                      message="Important Reminder"
                      description="Please download your digital badge before leaving this page or ordering a shirt. You'll need it for event registration!"
                      type="warning"
                      showIcon
                      style={{
                        marginBottom: "20px",
                        borderRadius: "12px",
                        border: "2px solid #f7a50a30",
                      }}
                    />
                  </motion.div>

                  {/* Shirt Ordering Advertisement */}
                  <motion.div
                    className="badge-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    <Card
                      style={{
                        borderRadius: "20px",
                        boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
                        border: "2px solid #e1e5ef",
                        overflow: "hidden",
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #f0f2f7 100%)",
                        marginBottom: "20px",
                      }}
                      styles={{
                        body: {
                          padding: "20px",
                        },
                      }}
                    >
                      <motion.div
                        style={{ textAlign: "center", marginBottom: "20px" }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.5 }}
                      >
                        <img
                          src={shirtTemplate}
                          alt="Shirt Template"
                          style={{
                            width: "100%",
                            maxWidth: "200px",
                            height: "auto",
                            margin: "0 auto",
                            borderRadius: "12px",
                            boxShadow: "0 10px 30px rgba(28, 60, 109, 0.2)",
                          }}
                        />
                      </motion.div>

                      <h3
                        style={{
                          marginBottom: "8px",
                          textAlign: "center",
                          fontSize: "22px",
                          color: "#1c3c6d",
                          fontWeight: "700",
                        }}
                      >
                        Order Customized Shirt
                      </h3>
                      <Paragraph
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          marginBottom: "16px",
                          textAlign: "center",
                        }}
                      >
                        Get your personalized PALAROTARY 2026 shirt
                      </Paragraph>

                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        animate={{
                          boxShadow: [
                            "0 4px 15px rgba(213, 72, 57, 0.2)",
                            "0 8px 25px rgba(213, 72, 57, 0.3)",
                            "0 4px 15px rgba(213, 72, 57, 0.2)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          background:
                            "linear-gradient(135deg, #fde5e320 0%, #fbcbc720 100%)",
                          padding: "16px",
                          borderRadius: "12px",
                          marginBottom: "16px",
                          border: "2px solid #d5483940",
                          textAlign: "center",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            color: "#d54839",
                            fontSize: "28px",
                            fontWeight: "700",
                          }}
                        >
                          ₱300
                        </h3>
                        <Paragraph
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "13px",
                            color: "#6b7280",
                          }}
                        >
                          All sizes - with custom name and number (00-99)
                        </Paragraph>
                      </motion.div>

                      <div style={{ marginBottom: "20px" }}>
                        {[
                          "Customize your shirt",
                          "Choose your size",
                          "Add your name and 2-digit number (00-99)",
                          "Secure online payment",
                        ].map((text, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2 + i * 0.1 }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CheckCircleOutlined
                              style={{ fontSize: "16px", color: "#d54839" }}
                            />
                            <span
                              style={{ fontSize: "14px", color: "#1a1a2e" }}
                            >
                              {text}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="primary"
                          size="large"
                          block
                          onClick={() =>
                            navigate("/order-shirt", {
                              state: {
                                memberData: registerMember.data?.data,
                              },
                            })
                          }
                          style={{
                            background:
                              "linear-gradient(135deg, #d54839 0%, #c13829 100%)",
                            border: "none",
                            height: "48px",
                            fontSize: "16px",
                            fontWeight: "600",
                            borderRadius: "12px",
                            boxShadow: "0 6px 20px rgba(213, 72, 57, 0.4)",
                          }}
                        >
                          Order Now
                        </Button>
                      </motion.div>
                    </Card>
                  </motion.div>
                </Col>
              </Row>

              {/* Register Another Member Button - Full Width */}
              <motion.div
                className="badge-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginTop: "24px" }}
              >
                <Button
                  type="default"
                  size="large"
                  onClick={() => window.location.reload()}
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "16px",
                    border: "2px solid #1e3a8a",
                    color: "#1e3a8a",
                    background: "white",
                  }}
                  block
                >
                  Register Another Member
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffffff 0%, #3b82f6 100%)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "600px" }}
      >
        <Card
          style={{
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: "16px" }}
          >
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
              style={{
                color: "#1c3c6d",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              Back to Home
            </Button>
          </motion.div>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className=" flex flex-col justify-center items-center"
            >
              <div
                style={{
                  textAlign: "center",
                  color: "#1a1a2e",
                }}
              >
                <motion.div
                  className="hero-title"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <center>
                    <img src={logo2} className=" w-full max-w-[400px]" />
                  </center>
                </motion.div>

                <motion.div
                  className="hero-subtitle"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <center>
                    <img src={logoBanner} className=" w-full max-w-[300px]" />
                  </center>
                </motion.div>
              </div>
            </motion.div>

            <h2
              style={{
                fontSize: "18px",
                color: "#1c3c6d",
                marginBottom: "4px",
                fontWeight: "700",
              }}
            >
              Member Registration
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
              January 25, 2026 • Marikina Sports Center • 8am-6pm
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{
              background:
                "linear-gradient(135deg, #fff3d615 0%, #ffe7ad15 100%)",
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              border: "2px solid #f7a50a30",
            }}
          >
            <UserAddOutlined style={{ fontSize: "20px", color: "#f7a50a" }} />
            <div>
              <strong style={{ color: "#f7a50a" }}>Free Registration</strong>
              <p style={{ margin: 0, fontSize: "13px", color: "#c68408" }}>
                Get your digital badge instantly
              </p>
            </div>
          </motion.div>

          <div ref={formRef}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              // requiredMark={false}
            >
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", color: "#333" }}>
                    Select Zone
                  </span>
                }
                name="zone"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  placeholder="Choose zone first"
                  size="large"
                  loading={loadingClubs}
                  showSearch
                  allowClear
                  style={{ borderRadius: "12px" }}
                  onChange={(value) => {
                    setSelectedZone(value);
                    // Clear club selection when zone changes
                    form.setFieldValue("clubId", undefined);
                  }}
                  options={zones.map((zone) => ({
                    value: zone,
                    label: zone,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ fontWeight: "600", color: "#333" }}>
                    Select Your Club
                  </span>
                }
                name="clubId"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  placeholder={
                    selectedZone
                      ? "Choose your registered club"
                      : "Select zone first"
                  }
                  size="large"
                  loading={loadingClubs}
                  showSearch
                  allowClear
                  disabled={!selectedZone}
                  style={{ borderRadius: "12px" }}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  options={filteredClubs.map((club) => ({
                    value: club.clubId,
                    label: club.clubName,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ fontWeight: "600", color: "#333" }}>
                    Category
                  </span>
                }
                name="category"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  placeholder="Select category"
                  size="large"
                  style={{ borderRadius: "12px" }}
                  options={[
                    { value: "Rotarian", label: "Rotarian" },
                    { value: "Spouse / Partner", label: "Spouse / Partner" },
                    { value: "Child", label: "Child" },
                    {
                      value: "Rotaract / Interact",
                      label: "Rotaract / Interact",
                    },
                  ]}
                />
              </Form.Item>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Item
                  label={
                    <span style={{ fontWeight: "600", color: "#333" }}>
                      First Name
                    </span>
                  }
                  name="firstName"
                  rules={[{ required: true, message: "Required" }]}
                  normalize={(value) => value?.toUpperCase()}
                >
                  <Input
                    placeholder="First name"
                    size="large"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: "600", color: "#333" }}>
                      Middle Name
                    </span>
                  }
                  name="middleName"
                  normalize={(value) => value?.toUpperCase()}
                >
                  <Input
                    placeholder="Middle name (optional)"
                    size="large"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: "600", color: "#333" }}>
                      Last Name
                    </span>
                  }
                  name="lastName"
                  rules={[{ required: true, message: "Required" }]}
                  normalize={(value) => value?.toUpperCase()}
                >
                  <Input
                    placeholder="Last name"
                    size="large"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span style={{ fontWeight: "600", color: "#333" }}>
                      Suffix
                    </span>
                  }
                  name="suffix"
                  normalize={(value) => value?.toUpperCase()}
                >
                  <Input
                    placeholder="Jr., Sr., III (optional)"
                    size="large"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Item>

                <Form.Item
                  style={{ gridColumn: "1 / -1" }}
                  label={
                    <span style={{ fontWeight: "600", color: "#333" }}>
                      Email Address
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Required" },
                    { type: "email", message: "Invalid email" },
                  ]}
                >
                  <Input
                    placeholder="your.email@example.com"
                    size="large"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Item>

                <Form.Item
                  style={{ gridColumn: "1 / -1" }}
                  label={
                    <span style={{ fontWeight: "600", color: "#333" }}>
                      Mobile Number
                    </span>
                  }
                  name="mobileNumber"
                  rules={[
                    { required: true, message: "Required" },
                    { pattern: /^[0-9+\-\s()]+$/, message: "Invalid" },
                  ]}
                >
                  <Input
                    placeholder="0917 123 4567"
                    size="large"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Item>
              </div>

              {/* Honeypot fields - hidden from users, visible to bots */}
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              >
                <Form.Item name="captcha">
                  <Input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    placeholder="Leave this field blank"
                  />
                </Form.Item>
                <Form.Item name="website">
                  <Input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    placeholder="Leave this field blank"
                  />
                </Form.Item>
              </div>

              <Form.Item style={{ marginTop: "8px", marginBottom: "16px" }}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={registerMember.isPending}
                    style={{
                      background:
                        "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                      border: "none",
                      height: "48px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      fontSize: "16px",
                      boxShadow: "0 4px 15px rgba(30, 58, 138, 0.4)",
                    }}
                  >
                    Register & Get Digital Badge
                  </Button>
                </motion.div>
              </Form.Item>
            </Form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                background:
                  "linear-gradient(135deg, #3b82f608 0%, #1e3a8a08 100%)",
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#1e3a8a",
                lineHeight: "1.6",
                border: "1px solid #3b82f620",
              }}
            >
              After registration, you'll receive a digital badge via email.
              Present this badge at the registration desk on event day.
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
