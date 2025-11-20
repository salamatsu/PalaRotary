import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { App, Button, Card, Form, Input, Progress, Select, Upload } from "antd";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  usePaymentInfo,
  useRegisterClub,
  useUploadPaymentProof,
} from "../../services/requests/usePalarotary";

export default function ClubRegistration() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [clubId, setClubId] = useState(null);
  const [clubData, setClubData] = useState(null);

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const stepIndicatorRef = useRef(null);
  const floatingElementsRef = useRef([]);
  const headerRef = useRef(null);
  const progressBarRef = useRef(null);

  const registerClub = useRegisterClub();
  const uploadPayment = useUploadPaymentProof();
  const { data: paymentInfo } = usePaymentInfo();

  const controls = useAnimationControls();

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
      const circles = stepIndicatorRef.current.querySelectorAll(".step-circle-inner");
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

  const onFinishStep1 = async (values) => {
    try {
      const response = await registerClub.mutateAsync(values);
      setClubId(response.data.club_id);
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
            message.success("Club registered successfully! Please proceed to payment.");
            setCurrentStep(1);
          },
        },
        "-=0.2"
      );
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to register club");
    }
  };

  const handlePaymentUpload = async (info) => {
    if (info.file.status === "done" || info.file) {
      try {
        await uploadPayment.mutateAsync({
          clubId,
          file: info.file.originFileObj || info.file,
        });

        // Success burst animation
        const tl = gsap.timeline();
        tl.to(formRef.current, {
          scale: 1.05,
          duration: 0.2,
          ease: "power2.out",
        })
        .to(formRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            message.success("Payment proof uploaded successfully!");
            setCurrentStep(2);
          },
        });
      } catch (error) {
        message.error(
          error.response?.data?.message || "Failed to upload payment proof"
        );
      }
    }
  };

  const paymentMethods = paymentInfo?.data || [];
  const progressPercent = ((currentStep + 1) / 3) * 100;

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

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.03,
      y: -4,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
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

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
            background: `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: "none",
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
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
        style={{ width: "100%", maxWidth: "650px", position: "relative", zIndex: 1 }}
      >
        <Card
          style={{
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 100px rgba(102, 126, 234, 0.2)",
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
          }}
        >
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
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
              PALAROTARY 2025
            </motion.h1>
            <motion.p
              style={{ fontSize: "14px", color: "#666", margin: 0 }}
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
                  "0%": "#667eea",
                  "100%": "#764ba2",
                }}
                showInfo={false}
                strokeWidth={8}
                style={{ marginBottom: "16px" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {["Club Info", "Payment", "Done"].map((step, index) => (
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
                              "0 4px 15px rgba(102, 126, 234, 0.4)",
                              "0 8px 25px rgba(102, 126, 234, 0.6)",
                              "0 4px 15px rgba(102, 126, 234, 0.4)",
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
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
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
                  <span className="step-label" style={{ fontSize: "12px", fontWeight: "500", color: "#666" }}>
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
                    background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <InfoCircleOutlined style={{ fontSize: "20px", color: "#667eea" }} />
                  </motion.div>
                  <div>
                    <strong style={{ color: "#667eea" }}>Registration Fee: ₱4,000.00</strong>
                  </div>
                </motion.div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinishStep1}
                  initialValues={{ paymentChannel: "BDO" }}
                  requiredMark={false}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Form.Item
                      style={{ gridColumn: "1 / -1" }}
                      label={<span style={{ fontWeight: "600", color: "#333" }}>Club Name</span>}
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
                      label={<span style={{ fontWeight: "600", color: "#333" }}>Zone</span>}
                      name="zone"
                    >
                      <Input placeholder="Zone (optional)" size="large" style={{ borderRadius: "12px" }} />
                    </Form.Item>

                    <Form.Item
                      label={<span style={{ fontWeight: "600", color: "#333" }}>Payment Channel</span>}
                      name="paymentChannel"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Select size="large" style={{ borderRadius: "12px" }}>
                        <Select.Option value="BDO">BDO</Select.Option>
                        <Select.Option value="GCASH">GCASH</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={<span style={{ fontWeight: "600", color: "#333" }}>First Name</span>}
                      name="firstName"
                    >
                      <Input placeholder="First name (optional)" size="large" style={{ borderRadius: "12px" }} />
                    </Form.Item>

                    <Form.Item
                      label={<span style={{ fontWeight: "600", color: "#333" }}>Last Name</span>}
                      name="lastName"
                    >
                      <Input placeholder="Last name (optional)" size="large" style={{ borderRadius: "12px" }} />
                    </Form.Item>

                    <Form.Item
                      style={{ gridColumn: "1 / -1" }}
                      label={<span style={{ fontWeight: "600", color: "#333" }}>Email Address</span>}
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
                      label={<span style={{ fontWeight: "600", color: "#333" }}>Mobile Number</span>}
                      name="mobileNumber"
                      rules={[
                        { pattern: /^[0-9+\-\s()]+$/, message: "Invalid" },
                      ]}
                    >
                      <Input placeholder="0917 123 4567 (optional)" size="large" style={{ borderRadius: "12px" }} />
                    </Form.Item>
                  </div>

                  <Form.Item style={{ marginTop: "8px", marginBottom: 0 }}>
                    <motion.div variants={buttonVariants} initial="rest" whileHover="hover" whileTap="tap">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={registerClub.isPending}
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          border: "none",
                          height: "48px",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "16px",
                          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                        }}
                      >
                        Continue to Payment
                      </Button>
                    </motion.div>
                  </Form.Item>
                </Form>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 1 && (
              <motion.div
                key="step2"
                ref={formRef}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  variants={itemVariants}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  style={{
                    background: "linear-gradient(135deg, #10b98115 0%, #0f766e15 100%)",
                    padding: "16px",
                    borderRadius: "16px",
                    marginBottom: "20px",
                    textAlign: "center",
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                    transition={{ duration: 0.8 }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: "32px", color: "#10b981", marginBottom: "8px" }}
                    />
                  </motion.div>
                  <h3 style={{ margin: 0, color: "#10b981", fontSize: "18px", fontWeight: "700" }}>
                    Club Registered!
                  </h3>
                  <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
                    Complete payment to finalize registration
                  </p>
                </motion.div>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ marginBottom: "20px" }}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, rotate: [0, -1, 1, 0] }}
                    transition={{ rotate: { duration: 0.5 } }}
                    style={{
                      background: "linear-gradient(135deg, #667eea08 0%, #764ba208 100%)",
                      padding: "16px",
                      borderRadius: "12px",
                      marginBottom: "12px",
                      border: "2px solid #667eea20",
                    }}
                  >
                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                      Registration Fee
                    </div>
                    <motion.div
                      style={{ fontSize: "28px", fontWeight: "800", color: "#667eea" }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ₱4,000.00
                    </motion.div>
                  </motion.div>

                  {paymentMethods.map((method, index) => (
                    <motion.div
                      key={index}
                      variants={cardHoverVariants}
                      initial="rest"
                      whileHover="hover"
                      style={{
                        background: "#f8f9fa",
                        padding: "16px",
                        marginBottom: "12px",
                        borderRadius: "12px",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        {method.payment_method === "BDO" ? (
                          <BankOutlined style={{ fontSize: "20px", color: "#667eea" }} />
                        ) : (
                          <MobileOutlined style={{ fontSize: "20px", color: "#667eea" }} />
                        )}
                        <h4 style={{ margin: 0, fontWeight: "700", color: "#333" }}>
                          {method.payment_method === "BDO" ? "BDO Bank Transfer" : "GCash Payment"}
                        </h4>
                      </div>
                      <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
                        <p style={{ margin: "4px 0" }}>
                          <strong>Name:</strong> {method.account_name}
                        </p>
                        {method.account_number && (
                          <p style={{ margin: "4px 0" }}>
                            <strong>Account:</strong> {method.account_number}
                          </p>
                        )}
                        {method.mobile_number && (
                          <p style={{ margin: "4px 0" }}>
                            <strong>Mobile:</strong> {method.mobile_number}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    variants={itemVariants}
                    animate={{ x: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    style={{
                      background: "linear-gradient(135deg, #f59e0b15 0%, #d9770615 100%)",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginTop: "16px",
                    }}
                  >
                    <ClockCircleOutlined style={{ fontSize: "18px", color: "#f59e0b" }} />
                    <div style={{ fontSize: "13px", color: "#92400e" }}>
                      Upload proof within <strong>4 hours</strong> to secure registration
                    </div>
                  </motion.div>
                </motion.div>

                <Upload accept="image/*,.pdf" beforeUpload={() => false} onChange={handlePaymentUpload} maxCount={1}>
                  <motion.div variants={buttonVariants} initial="rest" whileHover="hover" whileTap="tap">
                    <Button
                      icon={<UploadOutlined />}
                      size="large"
                      block
                      loading={uploadPayment.isPending}
                      style={{
                        height: "48px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "16px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                      }}
                    >
                      Upload Proof of Payment
                    </Button>
                  </motion.div>
                </Upload>
                <p style={{ textAlign: "center", color: "#999", fontSize: "12px", marginTop: "8px" }}>
                  JPG, PNG, PDF (Max 5MB)
                </p>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 2 && (
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
                  transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 8px 25px rgba(16, 185, 129, 0.3)",
                    cursor: "pointer",
                  }}
                >
                  <CheckCircleOutlined style={{ fontSize: "40px", color: "white" }} />
                </motion.div>

                <motion.h2
                  variants={itemVariants}
                  style={{ fontSize: "24px", fontWeight: "800", color: "#10b981", marginBottom: "8px" }}
                >
                  All Set!
                </motion.h2>
                <motion.p variants={itemVariants} style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>
                  <strong>{clubData?.clubName}</strong> registered successfully
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    background: "linear-gradient(135deg, #667eea08 0%, #764ba208 100%)",
                    padding: "20px",
                    borderRadius: "16px",
                    marginBottom: "20px",
                    textAlign: "left",
                    border: "1px solid #667eea20",
                  }}
                >
                  <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "#333" }}>
                    What's Next?
                  </h3>
                  <div style={{ fontSize: "14px", color: "#666", lineHeight: "1.8" }}>
                    {["Check your email for confirmation", "Admin team will review your payment", "Register your club members once approved", "Receive email notification when approved"].map((item, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        style={{ margin: "6px 0" }}
                      >
                        ✓ {item}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  style={{
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    padding: "16px",
                    borderRadius: "16px",
                    marginBottom: "20px",
                    textAlign: "left",
                  }}
                >
                  <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "#92400e" }}>
                    Event Details
                  </h3>
                  <div style={{ fontSize: "13px", color: "#78350f", lineHeight: "1.6" }}>
                    <p style={{ margin: "4px 0" }}><strong>Date:</strong> January 25, 2026</p>
                    <p style={{ margin: "4px 0" }}><strong>Time:</strong> 8am-6pm</p>
                    <p style={{ margin: "4px 0" }}><strong>Venue:</strong> Marikina Sports Center</p>
                  </div>
                </motion.div>

                <motion.div variants={buttonVariants} initial="rest" whileHover="hover" whileTap="tap">
                  <Button
                    type="default"
                    size="large"
                    onClick={() => window.location.reload()}
                    style={{
                      height: "48px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      fontSize: "16px",
                      border: "2px solid #667eea",
                      color: "#667eea",
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
