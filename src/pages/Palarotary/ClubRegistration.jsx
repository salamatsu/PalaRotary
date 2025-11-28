import {
  ArrowLeftOutlined,
  BankOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Progress,
  Upload,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import {
  usePaymentInfo,
  useRegisterClub,
} from "../../services/requests/usePalarotary";

export default function ClubRegistration() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [clubData, setClubData] = useState(null);

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const stepIndicatorRef = useRef(null);
  const floatingElementsRef = useRef([]);
  const headerRef = useRef(null);
  const progressBarRef = useRef(null);

  const registerClub = useRegisterClub();
  const { data: paymentInfo } = usePaymentInfo();

  // Advanced GSAP page load animation with timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6 }
      )
        .fromTo(
          headerRef.current,
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.3"
        )
        .fromTo(
          progressBarRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.6, transformOrigin: "left" },
          "-=0.2"
        );

      // Floating elements animation
      floatingElementsRef.current.forEach((el, i) => {
        if (el) {
          gsap.to(el, {
            y: "random(-20, 20)",
            x: "random(-15, 15)",
            rotation: "random(-15, 15)",
            duration: "random(3, 5)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.2,
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Animate form fields with advanced GSAP stagger and sequences
  useEffect(() => {
    if (formRef.current) {
      const formItems = formRef.current.querySelectorAll(".ant-form-item");
      const labels = formRef.current.querySelectorAll("label");
      const inputs = formRef.current.querySelectorAll("input, .ant-select");

      const tl = gsap.timeline();

      tl.fromTo(
        formItems,
        { opacity: 0, y: 30, rotationX: -15 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.6,
          stagger: {
            amount: 0.4,
            from: "start",
            ease: "power2.out",
          },
        }
      )
        .fromTo(
          labels,
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.3,
            stagger: 0.05,
          },
          "-=0.5"
        )
        .fromTo(
          inputs,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "back.out(1.5)",
          },
          "-=0.4"
        );
    }
  }, [currentStep]);

  // Animate step indicators with GSAP timeline
  useEffect(() => {
    if (stepIndicatorRef.current) {
      const circles =
        stepIndicatorRef.current.querySelectorAll(".step-circle-inner");
      const labels = stepIndicatorRef.current.querySelectorAll(".step-label");

      gsap.fromTo(
        circles,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "elastic.out(1, 0.5)",
        }
      );

      gsap.fromTo(
        labels,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.3,
        }
      );
    }
  }, [currentStep]);

  const onFinishStep1 = (values) => {
    Modal.confirm({
      title: "Confirm Registration",
      content: (
        <div style={{ padding: "10px 0" }}>
          <p style={{ marginBottom: "8px" }}>
            Please confirm the following details:
          </p>
          <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <p style={{ margin: "4px 0" }}>
              <strong>Club Name:</strong> {values.clubName}
            </p>
            {values.zone && (
              <p style={{ margin: "4px 0" }}>
                <strong>Zone:</strong> {values.zone}
              </p>
            )}
            <p style={{ margin: "4px 0" }}>
              <strong>Contact Person:</strong> {values.firstName}{" "}
              {values.lastName}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Email:</strong> {values.email}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Mobile:</strong> {values.mobileNumber}
            </p>
            {values.paymentProof && values.paymentProof.length > 0 && (
              <p style={{ margin: "4px 0" }}>
                <strong>Payment Proof:</strong> {values.paymentProof[0].name}
              </p>
            )}
          </div>
        </div>
      ),
      okText: "Confirm & Submit",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Prepare form data
          const formData = new FormData();
          formData.append("clubName", values.clubName);
          if (values.zone) formData.append("zone", values.zone);
          formData.append("firstName", values.firstName);
          formData.append("lastName", values.lastName);
          formData.append("email", values.email);
          formData.append("mobileNumber", values.mobileNumber);

          // Add payment proof if provided
          if (values.paymentProof && values.paymentProof.length > 0) {
            const file =
              values.paymentProof[0].originFileObj || values.paymentProof[0];
            formData.append("paymentProof", file);
          }

          const response = await registerClub.mutateAsync(formData);

          console.log("SUCCESS DATA", response.data);
          setClubData(values);

          // Advanced GSAP exit animation
          const tl = gsap.timeline();
          tl.to(formRef.current.querySelectorAll(".ant-form-item"), {
            opacity: 0,
            x: -30,
            rotationY: 45,
            stagger: 0.05,
            duration: 0.3,
            ease: "power2.in",
          }).to(
            formRef.current,
            {
              opacity: 0,
              scale: 0.9,
              duration: 0.3,
              onComplete: () => {
                message.success("Club registered successfully!");
                setCurrentStep(1);
              },
            },
            "-=0.2"
          );
        } catch (error) {
          message.error(
            error.response?.data?.message || "Failed to register club"
          );
        }
      },
    });
  };

  const paymentMethods = paymentInfo?.data || [];
  const progressPercent = ((currentStep + 1) / 2) * 100;

  // Advanced Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 },
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

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating decorative elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          ref={(el) => (floatingElementsRef.current[i] = el)}
          style={{
            position: "absolute",
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            borderRadius: "50%",
            background: i % 3 === 0
              ? `rgba(28, 60, 109, ${Math.random() * 0.08 + 0.02})`  // Navy blue
              : i % 3 === 1
              ? `rgba(247, 165, 10, ${Math.random() * 0.08 + 0.02})`  // Orange
              : `rgba(213, 72, 57, ${Math.random() * 0.08 + 0.02})`,  // Red
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: "none",
          }}
          animate={{
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.9, opacity: 0, rotateY: -10 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 0.8,
        }}
        style={{
          width: "100%",
          maxWidth: "650px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Card
          style={{
            borderRadius: "24px",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.3), 0 0 100px rgba(102, 126, 234, 0.2)",
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Back Button */}
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

          {/* Header */}
          <motion.div
            ref={headerRef}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            <motion.h1
              style={{
                background: "linear-gradient(135deg, #1c3c6d 0%, #173052 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "28px",
                fontWeight: "800",
                marginBottom: "4px",
                letterSpacing: "1px",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              PALAROTARY 2026
            </motion.h1>
            <motion.p
              style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              January 25, 2026 • Marikina Sports Center • 8am-6pm
            </motion.p>
          </motion.div>

          {/* Modern Step Indicator */}
          <div ref={stepIndicatorRef} style={{ marginBottom: "32px" }}>
            <div ref={progressBarRef}>
              <Progress
                percent={progressPercent}
                strokeColor={{
                  "0%": "#1c3c6d",
                  "100%": "#f7a50a",
                }}
                showInfo={false}
                strokeWidth={8}
                style={{ marginBottom: "16px" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {["Registration", "Done"].map((step, index) => (
                <motion.div
                  key={step}
                  className="step-circle"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    opacity: index <= currentStep ? 1 : 0.4,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <motion.div
                    className="step-circle-inner"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    animate={
                      index === currentStep
                        ? {
                            boxShadow: [
                              "0 4px 15px rgba(28, 60, 109, 0.4)",
                              "0 8px 25px rgba(247, 165, 10, 0.6)",
                              "0 4px 15px rgba(28, 60, 109, 0.4)",
                            ],
                          }
                        : {}
                    }
                    transition={{
                      boxShadow: { duration: 2, repeat: Infinity },
                    }}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background:
                        index <= currentStep
                          ? "linear-gradient(135deg, #1c3c6d 0%, #173052 100%)"
                          : "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      marginBottom: "8px",
                      cursor: "pointer",
                    }}
                  >
                    {index < currentStep ? "✓" : index + 1}
                  </motion.div>
                  <span
                    className="step-label"
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#6b7280",
                    }}
                  >
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Club Information */}
            {currentStep === 0 && (
              <motion.div
                key="step1"
                ref={formRef}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    background:
                      "linear-gradient(135deg, #fde5e315 0%, #fbcbc715 100%)",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    border: "2px solid #d5483930",
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <InfoCircleOutlined
                      style={{ fontSize: "20px", color: "#d54839" }}
                    />
                  </motion.div>
                  <div>
                    <strong style={{ color: "#d54839" }}>
                      Registration Fee: ₱4,000.00
                    </strong>
                  </div>
                </motion.div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinishStep1}
                  requiredMark={false}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <Form.Item
                      style={{ gridColumn: "1 / -1" }}
                      label={
                        <span style={{ fontWeight: "600", color: "#333" }}>
                          Club Name
                        </span>
                      }
                      name="clubName"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input
                        placeholder="Enter club name"
                        size="large"
                        style={{ borderRadius: "12px" }}
                      />
                    </Form.Item>

                    <Form.Item
                      style={{ gridColumn: "1 / -1" }}
                      label={
                        <span style={{ fontWeight: "600", color: "#333" }}>
                          Zone
                        </span>
                      }
                      name="zone"
                      rules={[
                        {
                          pattern: /^ZONE\s+\d+$/i,
                          message: "Format: ZONE 1",
                        },
                      ]}
                    >
                      <Input
                        placeholder="ZONE 1"
                        size="large"
                        style={{ borderRadius: "12px" }}
                      />
                    </Form.Item>

                    <Divider style={{ gridColumn: "1 / -1" }}>
                      Contact Information
                    </Divider>

                    <Form.Item
                      label={
                        <span style={{ fontWeight: "600", color: "#333" }}>
                          First Name
                        </span>
                      }
                      name="firstName"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input
                        placeholder="Enter first name"
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
                    >
                      <Input
                        placeholder="Enter last name"
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
                        {
                          pattern: /^09\d{9}$/,
                          message: "Must be 11 digits starting with 09",
                        },
                      ]}
                    >
                      <Input
                        placeholder="09171234567"
                        size="large"
                        maxLength={11}
                        style={{ borderRadius: "12px" }}
                      />
                    </Form.Item>
                  </div>

                  {/* Payment Information */}
                  <motion.div
                    variants={itemVariants}
                    style={{
                      background:
                        "linear-gradient(135deg, #fde5e308 0%, #fbcbc708 100%)",
                      padding: "16px",
                      borderRadius: "12px",
                      marginBottom: "16px",
                      border: "2px solid #d5483920",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      Registration Fee
                    </div>
                    <motion.div
                      style={{
                        fontSize: "28px",
                        fontWeight: "800",
                        color: "#d54839",
                        marginBottom: "16px",
                      }}
                    >
                      ₱4,000.00
                    </motion.div>

                    {paymentMethods.map((method, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        style={{
                          background: "#ffffff",
                          padding: "12px",
                          marginBottom: "8px",
                          borderRadius: "8px",
                          border: "2px solid #e8edf5",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "6px",
                          }}
                        >
                          {method.payment_method === "BDO" ? (
                            <BankOutlined
                              style={{ fontSize: "18px", color: "#1c3c6d" }}
                            />
                          ) : (
                            <MobileOutlined
                              style={{ fontSize: "18px", color: "#f7a50a" }}
                            />
                          )}
                          <h4
                            style={{
                              margin: 0,
                              fontWeight: "700",
                              fontSize: "14px",
                              color: "#1a1a2e",
                            }}
                          >
                            {method.payment_method === "BDO"
                              ? "BDO Bank Transfer"
                              : "GCash Payment"}
                          </h4>
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            lineHeight: "1.5",
                          }}
                        >
                          <p style={{ margin: "2px 0" }}>
                            <strong>Name:</strong> {method.account_name}
                          </p>
                          {method.account_number && (
                            <p style={{ margin: "2px 0" }}>
                              <strong>Account:</strong> {method.account_number}
                            </p>
                          )}
                          {method.mobile_number && (
                            <p style={{ margin: "2px 0" }}>
                              <strong>Mobile:</strong> {method.mobile_number}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <Form.Item
                    label={
                      <span style={{ fontWeight: "600", color: "#333" }}>
                        Payment Proof <small>(optional)</small>
                      </span>
                    }
                    name="paymentProof"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                      if (Array.isArray(e)) {
                        return e;
                      }
                      return e?.fileList;
                    }}
                    // rules={[
                    //   { required: true, message: "Payment proof is required" },
                    // ]}
                  >
                    <Upload.Dragger
                      accept="image/*"
                      beforeUpload={() => false}
                      maxCount={1}
                      style={{
                        background:
                          "linear-gradient(135deg, #e8edf505 0%, #c3cbdf05 100%)",
                        border: "2px dashed #1c3c6d",
                        borderRadius: "12px",
                        padding: "20px",
                      }}
                    >
                      <div style={{ padding: "20px 0" }}>
                        <p style={{ margin: 0, marginBottom: "12px" }}>
                          <UploadOutlined
                            style={{
                              fontSize: "48px",
                              color: "#1c3c6d",
                            }}
                          />
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#1c3c6d",
                            marginBottom: "4px",
                          }}
                        >
                          Click or drag file to upload
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#6b7280",
                          }}
                        >
                          Support for image files (JPG, PNG, Max 5MB)
                        </p>
                      </div>
                    </Upload.Dragger>
                  </Form.Item>

                  <Form.Item style={{ marginTop: "8px", marginBottom: 0 }}>
                    <motion.div
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={registerClub.isPending}
                        style={{
                          background:
                            "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                          border: "none",
                          height: "48px",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "16px",
                          boxShadow: "0 4px 15px rgba(247, 165, 10, 0.4)",
                        }}
                      >
                        Submit Registration
                      </Button>
                    </motion.div>
                  </Form.Item>
                </Form>
              </motion.div>
            )}

            {/* Success Page */}
            {currentStep === 1 && (
              <motion.div
                key="step3"
                ref={formRef}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ textAlign: "center", padding: "20px 0" }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 12,
                    delay: 0.2,
                  }}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 8px 25px rgba(247, 165, 10, 0.3)",
                    cursor: "pointer",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ fontSize: "40px", color: "white" }}
                  />
                </motion.div>

                <motion.h2
                  variants={itemVariants}
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#f7a50a",
                    marginBottom: "8px",
                  }}
                >
                  All Set!
                </motion.h2>
                <motion.p
                  variants={itemVariants}
                  style={{
                    fontSize: "16px",
                    color: "#6b7280",
                    marginBottom: "24px",
                  }}
                >
                  <strong>{clubData?.clubName}</strong> registered successfully
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    background:
                      "linear-gradient(135deg, #e8edf508 0%, #c3cbdf08 100%)",
                    padding: "20px",
                    borderRadius: "16px",
                    marginBottom: "20px",
                    textAlign: "left",
                    border: "2px solid #e8edf5",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      marginBottom: "12px",
                      color: "#1c3c6d",
                    }}
                  >
                    What's Next?
                  </h3>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      lineHeight: "1.8",
                    }}
                  >
                    {[
                      "Check your email for confirmation",
                      "Admin team will review your payment",
                      "Register your club members once approved",
                      "Receive email notification when approved",
                    ].map((item, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        style={{ margin: "6px 0", color: "#1a1a2e" }}
                      >
                        ✓ {item}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  style={{
                    background:
                      "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    padding: "16px",
                    borderRadius: "16px",
                    marginBottom: "20px",
                    textAlign: "left",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      marginBottom: "8px",
                      color: "#92400e",
                    }}
                  >
                    Event Details
                  </h3>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#78350f",
                      lineHeight: "1.6",
                    }}
                  >
                    <p style={{ margin: "4px 0" }}>
                      <strong>Date:</strong> January 25, 2026
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Time:</strong> 8am-6pm
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Venue:</strong> Marikina Sports Center
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
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
                      border: "2px solid #1c3c6d",
                      color: "#1c3c6d",
                      background: "white",
                    }}
                    block
                  >
                    Register Another Club
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
}
