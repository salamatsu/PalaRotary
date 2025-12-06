import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownloadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Progress,
  Select,
  Space,
  Spin,
  Typography,
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
import { useRegistrationStore } from "../../store/useRegistrationStore";
import { imageToBase64 } from "../../utils/tobase64";
import {
  getCurrentShirtPrice,
  isPromoActive,
  SHIRT_PRICING_CONFIG,
} from "../../lib/constants";

const { Paragraph, Title } = Typography;

export default function MemberRegistration() {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [formLoadTime] = useState(Date.now());
  const [familyMembers, setFamilyMembers] = useState([]);

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const badgeRef = useRef(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // Watch companyName field to show/hide designation field
  const companyName = Form.useWatch("companyName", form);

  const registerMember = useRegisterMember();
  const { data: clubsData, isLoading: loadingClubs } = useApprovedClubs();
  const {
    registrations,
    addSuccessRegistration,
    addFailedRegistration,
    resetRegistrations,
  } = useRegistrationStore();

  // Check if there's persisted registration data and show success page
  const [registrationComplete, setRegistrationComplete] = useState(
    registrations.success.length > 0
  );

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
    if (
      badgeRef.current &&
      registrationComplete &&
      registrations.success.length > 0
    ) {
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
  }, [registrationComplete, registrations.success]);

  // Helper function to generate loading modal content
  const getLoadingModalContent = (currentProcessing, submissionProgress) => (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{
          width: "80px",
          height: "80px",
          margin: "0 auto 24px",
          borderRadius: "50%",
          border: "6px solid #e0f2fe",
          borderTopColor: "#1e3a8a",
        }}
      />

      <h2
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#1e3a8a",
          marginBottom: "16px",
        }}
      >
        Registering Members...
      </h2>

      <p
        style={{
          fontSize: "14px",
          color: "#6b7280",
          marginBottom: "24px",
        }}
      >
        Processing: <strong>{currentProcessing}</strong>
      </p>

      <Progress
        percent={submissionProgress}
        strokeColor={{
          "0%": "#1e3a8a",
          "100%": "#3b82f6",
        }}
        style={{ marginBottom: "16px" }}
      />

      <p
        style={{
          fontSize: "12px",
          color: "#9ca3af",
        }}
      >
        Please wait while we register your members. Do not close this window.
      </p>
    </div>
  );

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

      // Validate family members
      const invalidMembers = familyMembers.filter(
        (member) => !member.firstName || !member.lastName || !member.companyName
      );

      if (invalidMembers.length > 0) {
        message.error(
          "Please fill in all required fields for family members (First Name, Last Name, Category)"
        );
        return;
      }

      // Remove honeypot fields from payload
      const { captcha, website, ...cleanValues } = values;

      // Reset previous registrations
      resetRegistrations();

      // Create loading modal
      const modalLoading = modal.info({
        closable: false,
        maskClosable: false,
        okButtonProps: { style: { display: "none" } },
        styles: {
          mask: {
            backdropFilter: "blur(8px)",
          },
        },
        content: getLoadingModalContent("", 0),
      });

      // Helper function to remove empty values from object
      const removeEmptyValues = (obj) => {
        return Object.fromEntries(
          Object.entries(obj).filter(
            ([_, value]) =>
              value !== "" && value !== null && value !== undefined
          )
        );
      };

      // Build array of members to register
      const membersToRegister = [];

      // Get primary member full name (used as designation for family members)
      const primaryMemberFullName = [
        cleanValues.firstName,
        cleanValues.middleName,
        cleanValues.lastName,
        cleanValues.suffix,
      ]
        .filter(Boolean)
        .join(" ");

      // Add primary member (with designation only if Spouse/Partner or Child)
      const primaryMember = removeEmptyValues({
        zone: cleanValues.zone,
        clubId: cleanValues.clubId,
        companyName: cleanValues.companyName,
        designation:
          cleanValues.companyName === "Rotaract / Interact" ||
          cleanValues.companyName === "Spouse / Partner" ||
          cleanValues.companyName === "Child"
            ? cleanValues.designation
            : "",
        firstName: cleanValues.firstName,
        middleName: cleanValues.middleName || "",
        lastName: cleanValues.lastName,
        suffix: cleanValues.suffix || "",
        email: cleanValues.email,
        mobileNumber: cleanValues.mobileNumber,
        origin: "P",
      });
      membersToRegister.push(primaryMember);

      // Add family members with parent designation
      familyMembers.forEach((member) => {
        const familyMember = removeEmptyValues({
          zone: cleanValues.zone,
          clubId: cleanValues.clubId,
          companyName: member.companyName,
          designation:
            member.companyName === "Rotaract / Interact" ||
            member.companyName === "Spouse / Partner" ||
            member.companyName === "Child"
              ? primaryMemberFullName
              : "",
          firstName: member.firstName,
          middleName: member.middleName || "",
          lastName: member.lastName,
          suffix: member.suffix || "",
          email: cleanValues.email,
          mobileNumber: cleanValues.mobileNumber,
          origin: "P",
        });
        membersToRegister.push(familyMember);
      });

      // Register all members asynchronously
      const totalMembers = membersToRegister.length;
      for (let i = 0; i < membersToRegister.length; i++) {
        const member = membersToRegister[i];
        const memberName = `${member.firstName} ${member.lastName}`;
        const currentProgress = Math.round(((i + 1) / totalMembers) * 100);

        // Update modal with current progress
        modalLoading.update({
          content: getLoadingModalContent(memberName, currentProgress),
        });

        try {
          const response = await registerMember.mutateAsync(member);
          addSuccessRegistration({
            ...response.data,
            memberInfo: member,
          });
        } catch (error) {
          addFailedRegistration({
            memberInfo: member,
            error: error.response?.data?.message || "Registration failed",
          });
        }
      }

      // Close the loading modal
      modalLoading.destroy();

      // Animate form exit with GSAP
      gsap.to(formRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setRegistrationComplete(true);

          if (registrations.success.length > 0) {
            message.success(
              `Successfully registered ${registrations.success.length} member(s)!`
            );
          }
          if (registrations.failed.length > 0) {
            message.warning(
              `${registrations.failed.length} registration(s) failed. Please check the details.`
            );
          }
        },
      });
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to register member"
      );
    }
  };

  const downloadQRCode = async (badgeUrl, qrCode) => {
    if (badgeUrl) {
      try {
        // Convert image URL to base64
        const base64Image = await imageToBase64(badgeUrl);

        // Create download link
        const a = document.createElement("a");
        a.download = `PALAROTARY-${qrCode}.png`;
        a.href = base64Image;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);

        message.success("Badge downloaded!");
      } catch (error) {
        console.error("Failed to download badge:", error);
        message.error("Failed to download badge. Please try again.");
      }
    }
  };

  const downloadAllBadges = async () => {
    message.loading({
      content: "Downloading all badges...",
      key: "download-all",
    });
    try {
      for (const registration of registrations.success) {
        await downloadQRCode(registration.badgeUrl, registration.qrCode);
        // Add delay between downloads to prevent browser blocking
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      message.success({
        content: `All ${registrations.success.length} badge(s) downloaded!`,
        key: "download-all",
      });
    } catch (error) {
      message.error({
        content: "Some badges failed to download. Please try again.",
        key: "download-all",
      });
    }
  };

  const addFamilyMember = () => {
    setFamilyMembers([
      ...familyMembers,
      {
        id: Date.now(),
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        companyName: "Child",
        designation: "",
      },
    ]);
  };

  const removeFamilyMember = (id) => {
    setFamilyMembers(familyMembers.filter((member) => member.id !== id));
  };

  const updateFamilyMember = (id, field, value) => {
    setFamilyMembers(
      familyMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

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

  if (registrationComplete && registrations.success.length > 0) {
    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #10b981 100%)",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Success background effects */}
        <div
          style={{
            position: "absolute",
            top: "-5%",
            right: "-5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.15)",
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-5%",
            left: "-5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.15)",
            filter: "blur(100px)",
          }}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            width: "100%",
            maxWidth: "1400px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Card
            style={{
              borderRadius: "32px",
              boxShadow: "0 30px 100px rgba(0,0,0,0.4)",
              overflow: "visible",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
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
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    fontSize: "16px",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  {registrations.success.length} member(s) registered
                  successfully
                </motion.p>
              </div>

              {/* Failed Registrations Alert */}
              {registrations.failed.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ marginBottom: "24px" }}
                >
                  <Alert
                    message="Some Registrations Failed"
                    description={
                      <div>
                        {registrations.failed.map((failed, index) => (
                          <div key={index} style={{ marginBottom: "8px" }}>
                            <strong>
                              {failed.memberInfo.firstName}{" "}
                              {failed.memberInfo.lastName}
                            </strong>
                            : {failed.error}
                          </div>
                        ))}
                      </div>
                    }
                    type="warning"
                    showIcon
                    style={{
                      borderRadius: "12px",
                      border: "2px solid #f7a50a30",
                    }}
                  />
                </motion.div>
              )}

              {/* Digital Badges Grid */}
              <div style={{ marginBottom: "32px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#1e3a8a",
                      margin: 0,
                      textAlign: "center",
                      margin: "auto",
                    }}
                  >
                    Your Digital Badges
                  </h3>
                  {registrations.success.length > 1 && (
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={downloadAllBadges}
                      style={{
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        border: "none",
                        height: "40px",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "14px",
                        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      Download All Badges
                    </Button>
                  )}
                </div>
                <div className=" flex flex-wrap justify-center gap-6">
                  {registrations.success.map((registration, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                      <motion.div
                        className="badge-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 20px 40px rgba(30, 58, 138, 0.3)",
                        }}
                        style={{
                          background: "white",
                          padding: "20px",
                          borderRadius: "20px",
                          border: "2px solid #e5e7eb",
                          height: "100%",
                          boxShadow: "0 10px 25px rgba(30, 58, 138, 0.15)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <h4
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#1e3a8a",
                              textTransform: "uppercase",
                            }}
                          >
                            {registration.firstName} {registration.lastName}
                          </h4>
                          <p
                            style={{
                              margin: "4px 0 0 0",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            {registration.memberInfo?.companyName}
                          </p>
                        </div>

                        <div
                          className="qr-code"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "12px",
                          }}
                        >
                          {registration.badgeUrl && (
                            <motion.img
                              initial={{ rotate: -10, scale: 0.8 }}
                              animate={{ rotate: 0, scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 200,
                                delay: 0.7 + index * 0.1,
                              }}
                              src={registration.badgeUrl}
                              alt={`Badge for ${registration.firstName}`}
                              style={{
                                width: "100%",
                                maxWidth: "200px",
                                // borderRadius: "8px",
                              }}
                            />
                          )}
                        </div>

                        <motion.div
                          className="badge-item"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={() =>
                              downloadQRCode(
                                registration.badgeUrl,
                                registration.qrCode
                              )
                            }
                            block
                            size="small"
                            style={{
                              background:
                                "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                              border: "none",
                              height: "36px",
                              borderRadius: "8px",
                              fontWeight: "600",
                              fontSize: "13px",
                              boxShadow: "0 4px 15px rgba(30, 58, 138, 0.4)",
                            }}
                          >
                            Download
                          </Button>
                        </motion.div>
                      </motion.div>
                    </Col>
                  ))}
                </div>
              </div>

              <div className=" flex flex-col lg:flex-row flex-wrap gap-6 justify-center items-center">
                <motion.div
                  className="badge-item flex-1 order-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <Card
                    style={{
                      borderRadius: "24px",
                      boxShadow: "0 8px 30px rgba(28, 60, 109, 0.12)",
                      border: "1px solid #e5e7eb",
                      overflow: "hidden",
                      background: "white",
                      marginBottom: "20px",
                      height: "100%",
                    }}
                    styles={{
                      body: {
                        padding: "0",
                        height: "100%",
                      },
                    }}
                  >
                    {/* Header Section with Gradient */}
                    <motion.div
                      className="badge-item"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0 }}
                      style={{
                        background:
                          "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                        padding: "24px",
                        color: "white",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Decorative elements */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.1)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-30px",
                          left: "-30px",
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.05)",
                        }}
                      />

                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px",
                          }}
                        >
                          <CheckCircleOutlined
                            style={{ fontSize: "28px", color: "#10b981" }}
                          />
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "20px",
                              fontWeight: "700",
                              color: "white",
                            }}
                          >
                            Registration Confirmed
                          </h3>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            opacity: 0.95,
                            lineHeight: "1.5",
                          }}
                        >
                          Your digital badges have been sent to your email.
                          Please download them before leaving the page.
                        </p>
                      </div>
                    </motion.div>

                    {/* Content Section */}
                    <div style={{ padding: "24px" }}>
                      {/* Event Details Card */}
                      <motion.div
                        className="badge-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        style={{
                          background:
                            "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                          padding: "20px",
                          borderRadius: "16px",
                          marginBottom: "20px",
                          border: "1px solid #fbbf24",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              minWidth: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              background: "rgba(245, 158, 11, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span style={{ fontSize: "20px" }}>📅</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4
                              style={{
                                fontSize: "15px",
                                fontWeight: "700",
                                marginBottom: "12px",
                                color: "#92400e",
                              }}
                            >
                              Event Information
                            </h4>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#78350f",
                                lineHeight: "1.8",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  marginBottom: "6px",
                                }}
                              >
                                <strong
                                  style={{ minWidth: "70px", opacity: 0.8 }}
                                >
                                  Event:
                                </strong>
                                <span>
                                  {
                                    registrations.success[0]?.eventDetails
                                      ?.eventName
                                  }
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  marginBottom: "6px",
                                }}
                              >
                                <strong
                                  style={{ minWidth: "70px", opacity: 0.8 }}
                                >
                                  Date:
                                </strong>
                                <span>
                                  {
                                    registrations.success[0]?.eventDetails
                                      ?.eventDate
                                  }
                                </span>
                              </div>
                              {registrations.success[0]?.eventDetails
                                ?.location && (
                                <div
                                  style={{
                                    display: "flex",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <strong
                                    style={{ minWidth: "70px", opacity: 0.8 }}
                                  >
                                    Time:
                                  </strong>
                                  <span>
                                    {
                                      registrations.success[0]?.eventDetails
                                        ?.location
                                    }
                                  </span>
                                </div>
                              )}
                              {registrations.success[0]?.eventDetails
                                ?.description && (
                                <div style={{ display: "flex" }}>
                                  <strong
                                    style={{ minWidth: "70px", opacity: 0.8 }}
                                  >
                                    Venue:
                                  </strong>
                                  <span>
                                    {
                                      registrations.success[0]?.eventDetails
                                        ?.description
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Important Reminder */}
                      <motion.div
                        className="badge-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        style={{
                          background:
                            "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                          padding: "16px",
                          borderRadius: "12px",
                          marginBottom: "20px",
                          border: "1px solid #fca5a5",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              minWidth: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background: "rgba(239, 68, 68, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginTop: "2px",
                            }}
                          >
                            <span style={{ fontSize: "16px" }}>⚠️</span>
                          </div>
                          <div>
                            <h4
                              style={{
                                fontSize: "14px",
                                fontWeight: "700",
                                marginBottom: "4px",
                                color: "#991b1b",
                              }}
                            >
                              Important Reminder
                            </h4>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "13px",
                                color: "#7f1d1d",
                                lineHeight: "1.6",
                              }}
                            >
                              Download your badges before leaving this page.
                              You'll need them for event check-in!
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Register Another Member Button */}
                      <motion.div
                        className="badge-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="default"
                          size="large"
                          icon={<UserAddOutlined />}
                          onClick={() => {
                            resetRegistrations();
                            setRegistrationComplete(false);
                            setFamilyMembers([]);
                            form.resetFields();
                          }}
                          style={{
                            height: "52px",
                            borderRadius: "12px",
                            fontWeight: "600",
                            fontSize: "15px",
                            border: "2px solid #e5e7eb",
                            color: "#1e3a8a",
                            background: "white",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                            transition: "all 0.3s ease",
                          }}
                          block
                        >
                          Register Another Member
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
                {/* Shirt Ordering Advertisement */}
                {/* <motion.div
                  className="badge-item flex-1 order-1"
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
                          <span style={{ fontSize: "14px", color: "#1a1a2e" }}>
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
                              memberData: registrations.success[0],
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
                </motion.div> */}

                <motion.div
                  className="registration-card col-span-12 md:col-span-6 lg:col-span-4"
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
                            marginBottom: "12px",
                            textAlign: "center",
                          }}
                        >
                          Get your personalized PALAROTARY 2026 shirt
                        </Paragraph>

                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          animate={{
                            boxShadow: [
                              "0 4px 15px rgba(28, 60, 109, 0.2)",
                              "0 8px 25px rgba(28, 60, 109, 0.3)",
                              "0 4px 15px rgba(28, 60, 109, 0.2)",
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{
                            background:
                              "linear-gradient(135deg, #fde5e320 0%, #fbcbc720 100%)",
                            padding: "20px",
                            borderRadius: "16px",
                            marginBottom: "24px",
                            border: "2px solid #9ca3af",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              marginBottom: "8px",
                            }}
                          >
                            <Title
                              level={3}
                              style={{
                                margin: 0,
                                color: "#173052",
                                fontSize: "32px",
                              }}
                            >
                              ₱{getCurrentShirtPrice()}
                            </Title>
                            {isPromoActive() && (
                              <Paragraph
                                style={{
                                  margin: 0,
                                  fontSize: "20px",
                                  color: "#9ca3af",
                                  textDecoration: "line-through",
                                }}
                              >
                                ₱{SHIRT_PRICING_CONFIG.regularPrice}
                              </Paragraph>
                            )}
                          </div>
                          <Paragraph
                            style={{
                              margin: "0 0 8px 0",
                              fontSize: "14px",
                              color: "#6b7280",
                            }}
                          >
                            All sizes - with custom name and number (00-99)
                          </Paragraph>
                          {isPromoActive() && (
                            <Paragraph
                              style={{
                                margin: 0,
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#d54839",
                              }}
                            >
                              Promo price until{" "}
                              {new Date(
                                SHIRT_PRICING_CONFIG.promoEndDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </Paragraph>
                          )}
                        </motion.div>

                        {/* Deadline Notice */}
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          style={{
                            background:
                              "linear-gradient(135deg, #17305210 0%, #17305210 100%)",
                            padding: "10px 16px",
                            borderRadius: "12px",
                            marginBottom: "16px",
                            border: "2px solid #9ca3af",
                            textAlign: "center",
                          }}
                        >
                          <Paragraph
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#173052",
                            }}
                          >
                            Orders available until{" "}
                            {new Date(
                              SHIRT_PRICING_CONFIG.orderDeadline
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Paragraph>
                        </motion.div>
                        <div style={{ marginBottom: "28px" }}>
                          {[
                            "Customize your shirt",
                            "Choose your size",
                            "Add your name and 2-digit number (00-99)",
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
                          onClick={() =>
                            navigate("/order-shirt", {
                              state: {
                                memberData: registrations.success[0],
                              },
                            })
                          }
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
              </div>
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
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.1)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(30, 58, 138, 0.1)",
          filter: "blur(80px)",
        }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "900px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Card
          style={{
            borderRadius: "32px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
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
              scrollToFirstError
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
                name="companyName"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  placeholder="Select category"
                  size="large"
                  style={{ borderRadius: "12px" }}
                  onChange={(value) => {
                    // Clear designation when category changes
                    if (
                      value !== "Rotaract / Interact" &&
                      value !== "Spouse / Partner" &&
                      value !== "Child"
                    ) {
                      form.setFieldValue("designation", undefined);
                    }
                  }}
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

              {/* Conditional Field - Show only for Spouse/Partner or Child */}
              {(companyName === "Spouse / Partner" ||
                companyName === "Child" ||
                companyName === "Rotaract / Interact") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Form.Item
                    label={
                      <span style={{ fontWeight: "600", color: "#333" }}>
                        Rotarian Member Name
                      </span>
                    }
                    name="designation"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the Rotarian member's name",
                      },
                    ]}
                    normalize={(value) => value?.toUpperCase()}
                  >
                    <Input
                      placeholder="Full name of Rotarian member"
                      size="large"
                      style={{ borderRadius: "12px" }}
                    />
                  </Form.Item>
                </motion.div>
              )}

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
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Enter valid 10-11 digit phone number",
                    },
                  ]}
                >
                  <Input
                    placeholder="0917 123 4567"
                    size="large"
                    style={{ borderRadius: "12px" }}
                  />
                </Form.Item>
              </div>

              {/* Add Family Member Section - Only for Rotarian or Rotaract/Interact */}
              {(companyName === "Rotarian" ||
                companyName === "Rotaract / Interact") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginTop: "24px" }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                      padding: "20px",
                      borderRadius: "16px",
                      border: "2px solid #3b82f620",
                      marginBottom: "16px",
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
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#1e3a8a",
                        }}
                      >
                        Family Members
                      </h3>
                      <Button
                        type="dashed"
                        icon={<UserAddOutlined />}
                        onClick={addFamilyMember}
                        style={{
                          borderColor: "#3b82f6",
                          color: "#3b82f6",
                          fontWeight: "600",
                        }}
                      >
                        Add Family Member
                      </Button>
                    </div>

                    {familyMembers.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        No family members added yet. Click "Add Family Member"
                        to register your family.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        {familyMembers.map((member, index) => (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                              background: "white",
                              padding: "16px",
                              borderRadius: "12px",
                              border: "1px solid #e5e7eb",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "600",
                                  color: "#1e3a8a",
                                  fontSize: "14px",
                                }}
                              >
                                Family Member {index + 1}
                              </span>
                              <Button
                                type="text"
                                danger
                                icon={<CloseOutlined />}
                                size="small"
                                onClick={() => removeFamilyMember(member.id)}
                              />
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "12px",
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: "4px",
                                    fontWeight: "600",
                                    color: "#333",
                                    fontSize: "13px",
                                  }}
                                >
                                  First Name{" "}
                                  <span style={{ color: "red" }}>*</span>
                                </label>
                                <Input
                                  placeholder="First name"
                                  value={member.firstName}
                                  onChange={(e) =>
                                    updateFamilyMember(
                                      member.id,
                                      "firstName",
                                      e.target.value.toUpperCase()
                                    )
                                  }
                                  style={{ borderRadius: "8px" }}
                                />
                              </div>

                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: "4px",
                                    fontWeight: "600",
                                    color: "#333",
                                    fontSize: "13px",
                                  }}
                                >
                                  Middle Name
                                </label>
                                <Input
                                  placeholder="Middle name (optional)"
                                  value={member.middleName}
                                  onChange={(e) =>
                                    updateFamilyMember(
                                      member.id,
                                      "middleName",
                                      e.target.value.toUpperCase()
                                    )
                                  }
                                  style={{ borderRadius: "8px" }}
                                />
                              </div>

                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: "4px",
                                    fontWeight: "600",
                                    color: "#333",
                                    fontSize: "13px",
                                  }}
                                >
                                  Last Name{" "}
                                  <span style={{ color: "red" }}>*</span>
                                </label>
                                <Input
                                  placeholder="Last name"
                                  value={member.lastName}
                                  onChange={(e) =>
                                    updateFamilyMember(
                                      member.id,
                                      "lastName",
                                      e.target.value.toUpperCase()
                                    )
                                  }
                                  style={{ borderRadius: "8px" }}
                                />
                              </div>

                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: "4px",
                                    fontWeight: "600",
                                    color: "#333",
                                    fontSize: "13px",
                                  }}
                                >
                                  Suffix
                                </label>
                                <Input
                                  placeholder="Jr., Sr., III (optional)"
                                  value={member.suffix}
                                  onChange={(e) =>
                                    updateFamilyMember(
                                      member.id,
                                      "suffix",
                                      e.target.value.toUpperCase()
                                    )
                                  }
                                  style={{ borderRadius: "8px" }}
                                />
                              </div>

                              <div style={{ gridColumn: "1 / -1" }}>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: "4px",
                                    fontWeight: "600",
                                    color: "#333",
                                    fontSize: "13px",
                                  }}
                                >
                                  Category{" "}
                                  <span style={{ color: "red" }}>*</span>
                                </label>
                                <Select
                                  placeholder="Select category"
                                  value={member.companyName}
                                  onChange={(value) =>
                                    updateFamilyMember(
                                      member.id,
                                      "companyName",
                                      value
                                    )
                                  }
                                  style={{ width: "100%", borderRadius: "8px" }}
                                  options={[
                                    { value: "Rotarian", label: "Rotarian" },
                                    {
                                      value: "Rotaract / Interact",
                                      label: "Rotaract / Interact",
                                    },
                                    { value: "Child", label: "Child" },
                                    {
                                      value: "Spouse / Partner",
                                      label: "Spouse / Partner",
                                    },
                                  ]}
                                />
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: "12px",
                                padding: "8px 12px",
                                background: "#f0f9ff",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "#1e3a8a",
                              }}
                            >
                              <strong>Note:</strong> Email and mobile number
                              will be copied from the primary member.
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

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
                    {familyMembers.length > 0
                      ? `Register ${
                          familyMembers.length + 1
                        } Member(s) & Get Digital Badges`
                      : "Register & Get Digital Badge"}
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

      <Modal
        open={loadingClubs}
        footer={[]}
        closable={false}
        centered
        destroyOnHidden
      >
        <center>
          <Space direction="vertical" size="small">
            <Spin />
            <Typography.Text>Loading zones and clubs . . .</Typography.Text>
          </Space>
        </center>
      </Modal>
    </motion.div>
  );
}
