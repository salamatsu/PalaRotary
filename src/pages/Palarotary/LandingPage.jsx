import { Button, Card, Col, Row, Typography, Modal, Image } from "antd";
import {
  TeamOutlined,
  BankOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  LoginOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  MobileOutlined,
  QrcodeOutlined,
  SafetyOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cloud, cloudCut, shirtTemplate } from "../../assets/images/Other";
import { logo2, logoBanner } from "../../assets/images/logos";

gsap.registerPlugin(ScrollTrigger);

const { Title, Paragraph } = Typography;

export default function PalarotaryLandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const floatingElementsRef = useRef([]);
  const cardsRef = useRef(null);
  const featuresRef = useRef(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Advanced GSAP animations on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section entrance
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        heroRef.current.querySelector(".hero-title"),
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1 }
      )
        .fromTo(
          heroRef.current.querySelector(".hero-subtitle"),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          heroRef.current.querySelectorAll(".info-badge"),
          { opacity: 0, scale: 0.8, rotationY: -90 },
          {
            opacity: 1,
            scale: 1,
            rotationY: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.5)",
          },
          "-=0.5"
        );

      // Floating elements animation
      floatingElementsRef.current.forEach((el, i) => {
        if (el) {
          gsap.to(el, {
            y: "random(-30, 30)",
            x: "random(-25, 25)",
            rotation: "random(-25, 25)",
            scale: "random(0.8, 1.2)",
            duration: "random(4, 7)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.2,
          });
        }
      });

      // Cards scroll animation
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.querySelectorAll(".registration-card"),
          {
            opacity: 0,
            y: 60,
            rotationX: -20,
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Features animation
      if (featuresRef.current) {
        gsap.fromTo(
          featuresRef.current.querySelectorAll(".feature-item"),
          {
            opacity: 0,
            x: -30,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -10,
      scale: 1.02,
      rotateY: 2,
      boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const buttonVariants = {
    rest: { scale: 1 },
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

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
      },
    },
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated floating background elements */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          ref={(el) => (floatingElementsRef.current[i] = el)}
          style={{
            position: "absolute",
            width: `${Math.random() * 120 + 60}px`,
            height: `${Math.random() * 120 + 60}px`,
            borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "20%" : "30%",
            background:
              i % 3 === 0
                ? `rgba(28, 60, 109, ${Math.random() * 0.08 + 0.02})` // Navy blue
                : i % 3 === 1
                ? `rgba(247, 165, 10, ${Math.random() * 0.08 + 0.02})` // Orange
                : `rgba(213, 72, 57, ${Math.random() * 0.08 + 0.02})`, // Red
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: "none",
            filter: "blur(2px)",
          }}
          animate={{
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: Math.random() * 5 + 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className=" my-0 mx-auto relative px-0 py-20 ">
        <img src={cloud} className=" absolute z-0 w-full bottom-0 top-0 l-0 " />
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          style={{ y: yHero, opacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className=" h-screen flex flex-col justify-center items-center"
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "60px",
              color: "#1a1a2e",
            }}
          >
            <motion.div
              className="hero-title"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <center>
                <img src={logo2} className=" w-full max-w-[1000px]" />
              </center>
            </motion.div>

            <motion.div
              className="hero-subtitle"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <center>
                <img src={logoBanner} className=" w-full max-w-[500px]" />
              </center>
            </motion.div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginTop: "40px",
              }}
            >
              {[
                { icon: CalendarOutlined, text: "January 25, 2026", delay: 0 },
                { icon: ClockCircleOutlined, text: "8am - 6pm", delay: 0.1 },
                {
                  icon: EnvironmentOutlined,
                  text: "Marikina Sports Center",
                  delay: 0.2,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="info-badge w-full max-w-[300px] flex items-center justify-center"
                  whileHover={{
                    scale: 1.1,
                    y: -5,
                    boxShadow: "0 10px 30px rgba(28, 60, 109, 0.25)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "#ffffff",
                    padding: "16px 28px",
                    borderRadius: "16px",
                    backdropFilter: "blur(10px)",
                    border:
                      "2px solid " +
                      (index === 0
                        ? "#1c3c6d"
                        : index === 1
                        ? "#f7a50a"
                        : "#d54839"),
                    boxShadow: "0 8px 32px rgba(28, 60, 109, 0.1)",
                    // cursor: "pointer",
                  }}
                >
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <item.icon
                      style={{
                        fontSize: "24px",
                        marginRight: "12px",
                        color:
                          index === 0
                            ? "#1c3c6d"
                            : index === 1
                            ? "#f7a50a"
                            : "#d54839",
                      }}
                    />
                  </motion.div>
                  <strong style={{ fontSize: "16px", color: "#1a1a2e" }}>
                    {item.text}
                  </strong>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          padding: "0 20px",
        }}
        className="bg-transparent"
      >
        {/* Registration Cards */}
        <div ref={cardsRef}>
          <Row gutter={[32, 32]} style={{ marginBottom: "60px" }}>
            {/* Member Registration Card */}
            <Col xs={24} lg={12}>
              <motion.div
                className="registration-card h-full"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
              >
                <Card
                  style={{
                    height: "100%",
                    borderRadius: "24px",
                    boxShadow: "0 10px 40px rgba(247, 165, 10, 0.15)",
                    border: "2px solid #fff3d6",
                    overflow: "hidden",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #fff9eb 100%)",
                  }}
                  styles={{
                    body: {
                      height: "100%",
                    },
                  }}
                >
                  <div className="p-0 md:p-4 flex h-full flex-col">
                    <div className=" flex-1">
                      <motion.div
                        style={{ textAlign: "center", marginBottom: "24px" }}
                        whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <div
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                            boxShadow: "0 10px 30px rgba(247, 165, 10, 0.3)",
                          }}
                        >
                          <TeamOutlined
                            style={{ fontSize: "48px", color: "white" }}
                          />
                        </div>
                      </motion.div>

                      <Title
                        level={2}
                        style={{
                          marginBottom: "12px",
                          textAlign: "center",
                          fontSize: "28px",
                        }}
                      >
                        Member Registration
                      </Title>
                      <Paragraph
                        style={{
                          fontSize: "16px",
                          color: "#666",
                          marginBottom: "24px",
                          textAlign: "center",
                        }}
                      >
                        Join as an individual member
                      </Paragraph>

                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        animate={{
                          boxShadow: [
                            "0 4px 15px rgba(247, 165, 10, 0.2)",
                            "0 8px 25px rgba(247, 165, 10, 0.3)",
                            "0 4px 15px rgba(247, 165, 10, 0.2)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          background:
                            "linear-gradient(135deg, #fff3d620 0%, #ffe7ad20 100%)",
                          padding: "20px",
                          borderRadius: "16px",
                          marginBottom: "24px",
                          border: "2px solid #f7a50a40",
                        }}
                      >
                        <Title
                          level={3}
                          style={{
                            margin: 0,
                            color: "#f7a50a",
                            fontSize: "32px",
                          }}
                        >
                          FREE
                        </Title>
                        <Paragraph
                          style={{
                            margin: "8px 0 0 0",
                            fontSize: "14px",
                            color: "#6b7280",
                          }}
                        >
                          No registration fee for members
                        </Paragraph>
                      </motion.div>

                      <div style={{ marginBottom: "28px" }}>
                        {[
                          "Select your registered club",
                          "Fill in your information",
                          "Get digital badge instantly",
                          "QR code sent via email",
                        ].map((text, i) => (
                          <motion.div
                            key={i}
                            className="feature-item"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              marginBottom: "12px",
                            }}
                          >
                            <CheckCircleOutlined
                              style={{ fontSize: "18px", color: "#f7a50a" }}
                            />
                            <span
                              style={{ fontSize: "15px", color: "#1a1a2e" }}
                            >
                              {text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate("/register-member")}
                        style={{
                          background:
                            "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                          border: "none",
                          height: "56px",
                          fontSize: "17px",
                          fontWeight: "600",
                          borderRadius: "12px",
                          boxShadow: "0 6px 20px rgba(247, 165, 10, 0.4)",
                        }}
                      >
                        Register as Member
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Club Registration Card */}
            <Col xs={24} lg={12}>
              <motion.div
                className="registration-card"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
              >
                <Card
                  style={{
                    height: "100%",
                    borderRadius: "24px",
                    boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
                    border: "2px solid #e1e5ef",
                    overflow: "hidden",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f0f2f7 100%)",
                  }}
                  styles={{
                    body: {
                      height: "100%",
                    },
                  }}
                >
                  <div className="p-0 md:p-4 flex h-full flex-col">
                    <div className=" flex-1">
                      <motion.div
                        style={{ textAlign: "center", marginBottom: "24px" }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.5 }}
                      >
                        <img
                          src={shirtTemplate}
                          alt="Shirt Template"
                          onClick={() => setPreviewVisible(true)}
                          style={{
                            width: "100%",
                            maxWidth: "280px",
                            height: "auto",
                            margin: "0 auto 20px",
                            borderRadius: "12px",
                            boxShadow: "0 10px 30px rgba(28, 60, 109, 0.2)",
                            cursor: "pointer",
                          }}
                        />
                      </motion.div>

                      <Title
                        level={2}
                        style={{
                          marginBottom: "12px",
                          textAlign: "center",
                          fontSize: "28px",
                        }}
                      >
                        Order Customized Shirt
                      </Title>
                      <Paragraph
                        style={{
                          fontSize: "16px",
                          color: "#6b7280",
                          marginBottom: "24px",
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
                          padding: "20px",
                          borderRadius: "16px",
                          marginBottom: "24px",
                          border: "2px solid #d5483940",
                        }}
                      >
                        <Title
                          level={3}
                          style={{
                            margin: 0,
                            color: "#d54839",
                            fontSize: "32px",
                          }}
                        >
                          ₱300
                        </Title>
                        <Paragraph
                          style={{
                            margin: "8px 0 0 0",
                            fontSize: "14px",
                            color: "#6b7280",
                          }}
                        >
                          All sizes - with custom name and number (00-99)
                        </Paragraph>
                      </motion.div>

                      <div style={{ marginBottom: "28px" }}>
                        {[
                          "Must be a registered member",
                          "Upload / scan your member badge",
                          "Choose your size",
                          "Add your name and 2-digit number (00-99)",
                          "Secure online payment",
                        ].map((text, i) => (
                          <motion.div
                            key={i}
                            className="feature-item"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              marginBottom: "12px",
                            }}
                          >
                            <CheckCircleOutlined
                              style={{ fontSize: "18px", color: "#d54839" }}
                            />
                            <span
                              style={{ fontSize: "15px", color: "#1a1a2e" }}
                            >
                              {text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <motion.div
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate("/shirt-order")}
                        style={{
                          background:
                            "linear-gradient(135deg, #1c3c6d 0%, #173052 100%)",
                          border: "none",
                          height: "56px",
                          fontSize: "17px",
                          fontWeight: "600",
                          borderRadius: "12px",
                          boxShadow: "0 6px 20px rgba(28, 60, 109, 0.4)",
                        }}
                      >
                        Order Now
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>

        {/* Club Payment Proof Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: "60px" }}
        >
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(247, 165, 10, 0.15)",
              border: "2px solid #fff3d6",
              background: "linear-gradient(135deg, #ffffff 0%, #fff9eb 100%)",
            }}
          >
            <div style={{ textAlign: "center", padding: "20px" }}>
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: "20px" }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: "0 8px 25px rgba(247, 165, 10, 0.3)",
                  }}
                >
                  <UploadOutlined
                    style={{ fontSize: "40px", color: "white" }}
                  />
                </div>
              </motion.div>

              <Title
                level={3}
                style={{
                  color: "#1c3c6d",
                  marginBottom: "12px",
                  fontWeight: "bold",
                }}
              >
                CLUB REGISTRATION
              </Title>

              <Paragraph
                style={{
                  fontSize: "16px",
                  color: "#6b7280",
                  marginBottom: "28px",
                  maxWidth: "600px",
                  margin: "0 auto 28px",
                }}
              >
                Upload or update your payment proof for verification
              </Paragraph>

              <motion.div
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate("/club-payment-proof")}
                  style={{
                    background:
                      "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                    border: "none",
                    height: "56px",
                    fontSize: "17px",
                    fontWeight: "600",
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(247, 165, 10, 0.4)",
                    minWidth: "300px",
                  }}
                >
                  Upload Payment Proof
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          style={{
            textAlign: "center",
            marginTop: "60px",
            padding: "40px 20px",
            borderTop: "2px solid #e8edf5",
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Paragraph
            style={{
              fontSize: "15px",
              color: "#6b7280",
              marginBottom: "12px",
            }}
          >
            For questions and inquiries, please contact the organizing
            committee.
          </Paragraph>
          <Paragraph
            style={{
              fontSize: "13px",
              color: "#9ca3af",
              marginTop: "16px",
            }}
          >
            © 2026 PALAROTARY. All rights reserved.
          </Paragraph>
        </motion.div>
      </div>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="90%"
        style={{ maxWidth: "800px" }}
        centered
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Title level={3} style={{ marginBottom: "20px" }}>
            Shirt Template Preview
          </Title>
          <img
            src={shirtTemplate}
            alt="Shirt Template Preview"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
