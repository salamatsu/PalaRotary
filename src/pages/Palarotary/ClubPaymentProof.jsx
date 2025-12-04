import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  Form,
  Select,
  Input,
  Upload,
  Button,
  Typography,
  App,
  Spin,
  Modal,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  EditOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import imageCompression from "browser-image-compression";
import {
  useGetRegisteredClub,
  useUploadPaymentProof,
} from "../../services/requests/usePalarotary";
import { logo2, logoBanner } from "../../assets/images/logos";

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function ClubPaymentProof() {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [compressing, setCompressing] = useState(false);

  const { data: clubsData, isLoading: loadingClubs } = useGetRegisteredClub();
  const { mutate: uploadPayment, isPending: uploading } =
    useUploadPaymentProof();

  const clubs = clubsData?.data || [];

  // Get unique zones from clubs
  const zones = [...new Set(clubs.map((club) => club.zone))].sort();

  // Filter clubs based on selected zone
  const filteredClubs = selectedZone
    ? clubs.filter((club) => club.zone === selectedZone)
    : clubs;

  const handleZoneSelect = (value) => {
    setSelectedZone(value);
    // Reset club selection when zone changes
    setSelectedClub(null);
    form.setFieldsValue({
      clubToken: undefined,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      mobileNumber: undefined,
    });
  };

  const handleClubSelect = (value) => {
    const club = clubs.find((c) => c.token === value);
    if (club) {
      setSelectedClub(club);
      form.setFieldsValue({
        firstName: club.firstName,
        lastName: club.lastName,
        email: club.email,
        mobileNumber: club.mobileNumber || "",
      });

      // Auto-enable editing if any required field is empty
      const hasEmptyFields =
        !club.firstName || !club.lastName || !club.email || !club.mobileNumber;
      if (hasEmptyFields) {
        setIsEditable(true);
      } else {
        setIsEditable(false);
      }
    }
  };

  const handleEditToggle = () => {
    if (isEditable) {
      // Lock the fields
      setIsEditable(false);
    } else {
      // Show confirmation before allowing edit
      setShowEditConfirm(true);
    }
  };

  const confirmEdit = () => {
    setIsEditable(true);
    setShowEditConfirm(false);
    message.info("You can now edit the contact information");
  };

  // Normalize file list for Form.Item
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleImageCompress = async (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }

    const fileSizeMB = file.size / 1024 / 1024;

    try {
      setCompressing(true);

      let compressedFile = file;

      // Only compress if file is larger than 5MB
      if (fileSizeMB > 5) {
        message.loading({ content: "Compressing image...", key: "compress" });

        const options = {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: file.type,
        };

        compressedFile = await imageCompression(file, options);

        const compressedSizeMB = compressedFile.size / 1024 / 1024;
        message.success({
          content: `Image compressed from ${fileSizeMB.toFixed(2)}MB to ${compressedSizeMB.toFixed(2)}MB`,
          key: "compress",
        });
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile);
      setPreviewImage(previewUrl);

      // Return the compressed file wrapped in a File object
      const finalFile = new File([compressedFile], file.name, {
        type: file.type,
      });

      setCompressing(false);
      return false; // Prevent auto upload
    } catch (error) {
      console.error("Error compressing image:", error);
      message.error("Failed to process image");
      setCompressing(false);
      return Upload.LIST_IGNORE;
    }
  };

  const handleRemoveImage = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
  };

  const handleSubmit = async ({ clubToken, paymentProof, ...values }) => {
    if (!selectedClub) {
      message.error("Please select a club");
      return;
    }

    if (!paymentProof || paymentProof.length === 0) {
      message.error("Please upload a proof of payment");
      return;
    }

    uploadPayment(
      {
        ...values,
        token: selectedClub.token,
        paymentProof: paymentProof?.[0]?.originFileObj,
      },
      {
        onSuccess: () => {
          message.success("Payment proof uploaded successfully!");
          setUploadSuccess(true);
          form.resetFields();
          setSelectedClub(null);
          setSelectedZone(null);
          setIsEditable(false);
          handleRemoveImage();
        },
        onError: (error) => {
          console.log(error);
          modal.warning({
            title: "Upload Failed",
            content:
              error?.response?.data?.message ||
              "Failed to upload payment proof. Please try again.",
            onOk: () => {
              form.resetFields();
            },
          });
        },
      }
    );
  };

  if (uploadSuccess) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)",
          padding: "40px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: "600px",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 8px 25px rgba(247, 165, 10, 0.3)",
              }}
            >
              <CheckCircleOutlined
                style={{ fontSize: "40px", color: "white" }}
              />
            </motion.div>

            <Title level={2} style={{ color: "#1c3c6d", marginBottom: "16px" }}>
              Upload Successful!
            </Title>

            <Text
              style={{
                fontSize: "16px",
                color: "#6b7280",
                display: "block",
                marginBottom: "32px",
              }}
            >
              Your payment proof has been uploaded successfully. Our team will
              review it shortly.
            </Text>

            <div
              style={{ display: "flex", gap: "12px", flexDirection: "column" }}
            >
              <Button
                type="primary"
                size="large"
                block
                onClick={() => setUploadSuccess(false)}
                style={{
                  background:
                    "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                  border: "none",
                  height: "48px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "16px",
                }}
              >
                Upload Another
              </Button>

              <Button
                size="large"
                block
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/", { preventScrollReset: true })}
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "16px",
                  borderColor: "#1c3c6d",
                  color: "#1c3c6d",
                }}
              >
                Back to Home
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)",
        padding: "40px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: "700px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Card
          style={{
            borderRadius: "24px",
            boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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

          {/* Header with Logos */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ textAlign: "center", marginBottom: "32px" }}
          >
            <div className="flex flex-col justify-center items-center">
              <center>
                <img src={logo2} className="w-full max-w-[300px]" alt="Logo" />
              </center>
              <center>
                <img
                  src={logoBanner}
                  className="w-full max-w-[250px] mt-2"
                  alt="Banner"
                />
              </center>
            </div>

            <Title
              level={2}
              style={{
                color: "#1c3c6d",
                marginTop: "24px",
                marginBottom: "8px",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              CLUB REGISTRATION
            </Title>
            <Text style={{ fontSize: "14px", color: "#6b7280" }}>
              Update your club's payment proof for verification
            </Text>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              {/* Zone Selection */}
              <Form.Item
                label={<Text strong>Select Zone</Text>}
                name="zone"
                rules={[{ required: true, message: "Please select a zone" }]}
              >
                <Select
                  placeholder="Select a zone first"
                  size="large"
                  onChange={handleZoneSelect}
                  loading={loadingClubs}
                  style={{ borderRadius: "8px" }}
                  showSearch
                  options={zones.map((zone) => ({
                    value: zone,
                    label: zone,
                  }))}
                />
              </Form.Item>

              {/* Club Selection */}
              <Form.Item
                label={<Text strong>Select Club</Text>}
                name="clubToken"
                rules={[{ required: true, message: "Please select a club" }]}
              >
                <Select
                  placeholder={
                    selectedZone ? "Select your club" : "Select a zone first"
                  }
                  size="large"
                  onChange={handleClubSelect}
                  loading={loadingClubs}
                  disabled={!selectedZone}
                  style={{ borderRadius: "8px" }}
                  optionFilterProp="children"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? "")
                      .toLowerCase()
                      .localeCompare((optionB?.label ?? "").toLowerCase())
                  }
                  options={filteredClubs.map((club) => ({
                    value: club.token,
                    label:
                      club.clubName +
                      (club.status === "APPROVED" ? " (Approved)" : ""),
                    disabled: club.status === "APPROVED",
                  }))}
                />
              </Form.Item>

              {/* Auto-filled Contact Information */}
              {/* {selectedClub && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #e8edf508 0%, #c3cbdf08 100%)",
                      padding: "20px",
                      borderRadius: "12px",
                      marginBottom: "24px",
                      border: "2px solid #e8edf5",
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
                      <Text strong style={{ color: "#1c3c6d" }}>
                        Club Information <small>(optional)</small>
                      </Text>
                      <Button
                        type="text"
                        icon={isEditable ? <LockOutlined /> : <EditOutlined />}
                        onClick={handleEditToggle}
                        style={{
                          color: isEditable ? "#d54839" : "#f7a50a",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        {isEditable ? "Lock" : "Edit"}
                      </Button>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <Form.Item
                        label={
                          <Text strong style={{ color: "#1a1a2e" }}>
                            First Name
                          </Text>
                        }
                        name="firstName"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input
                          size="large"
                          disabled={!isEditable}
                          style={{
                            background: isEditable ? "#fff" : "#f5f7fa",
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <Text strong style={{ color: "#1a1a2e" }}>
                            Last Name
                          </Text>
                        }
                        name="lastName"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input
                          size="large"
                          disabled={!isEditable}
                          style={{
                            background: isEditable ? "#fff" : "#f5f7fa",
                          }}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      label={
                        <Text strong style={{ color: "#1a1a2e" }}>
                          Email
                        </Text>
                      }
                      name="email"
                      rules={[
                        { required: true, message: "Required" },
                        { type: "email", message: "Invalid email" },
                      ]}
                    >
                      <Input
                        size="large"
                        disabled={!isEditable}
                        style={{ background: isEditable ? "#fff" : "#f5f7fa" }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <Text strong style={{ color: "#1a1a2e" }}>
                          Mobile Number
                        </Text>
                      }
                      name="mobileNumber"
                    >
                      <Input
                        size="large"
                        disabled={!isEditable}
                        style={{ background: isEditable ? "#fff" : "#f5f7fa" }}
                      />
                    </Form.Item>
                  </div>
                </motion.div>
              )} */}

              <Form.Item
                label={
                  <Text strong style={{ color: "#1a1a2e" }}>
                    Payment Channel
                  </Text>
                }
                name="paymentChannel"
              >
                {/* GCASH | BANK */}
                <Select
                  placeholder="Select Payment Channel"
                  size="large"
                  style={{ borderRadius: "8px" }}
                  options={[
                    { value: "GCASH", label: "GCASH" },
                    { value: "BANK", label: "BANK" },
                  ]}
                />
              </Form.Item>

              {/* File Upload */}
              <Form.Item
                label={<Text strong>Upload Proof of Payment</Text>}
                required
                name="paymentProof"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Dragger
                  beforeUpload={handleImageCompress}
                  maxCount={1}
                  accept="image/*"
                  onRemove={handleRemoveImage}
                  disabled={compressing}
                  style={{
                    background:
                      "linear-gradient(135deg, #e8edf505 0%, #c3cbdf05 100%)",
                    border: "2px dashed #1c3c6d",
                    borderRadius: "12px",
                  }}
                >
                  <div style={{ padding: "40px 20px" }}>
                    <p style={{ margin: 0, marginBottom: "12px" }}>
                      <InboxOutlined
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
                      {compressing
                        ? "Compressing image..."
                        : "Click or drag file to upload"}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#6b7280",
                      }}
                    >
                      {compressing
                        ? "Please wait..."
                        : "Support for image files (JPG, PNG). Files over 5MB will be compressed automatically."}
                    </p>
                  </div>
                </Dragger>
              </Form.Item>

              {/* Image Preview */}
              {previewImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginBottom: "24px",
                    padding: "16px",
                    background:
                      "linear-gradient(135deg, #e8edf508 0%, #c3cbdf08 100%)",
                    borderRadius: "12px",
                    border: "2px solid #e8edf5",
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
                    <Text strong style={{ color: "#1c3c6d" }}>
                      Image Preview
                    </Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Image
                      src={previewImage}
                      alt="Payment proof preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        borderRadius: "8px",
                        objectFit: "contain",
                      }}
                      preview={{
                        mask: (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                            }}
                          >
                            <EyeOutlined /> View Full Size
                          </div>
                        ),
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <Form.Item shouldUpdate>
                {() => {
                  const paymentProof = form.getFieldValue("paymentProof");
                  const hasFile = paymentProof && paymentProof.length > 0;

                  return (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={uploading}
                        disabled={!selectedClub || !hasFile}
                        icon={<UploadOutlined />}
                        style={{
                          background:
                            "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                          border: "none",
                          height: "56px",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "16px",
                          boxShadow: "0 4px 15px rgba(247, 165, 10, 0.4)",
                        }}
                      >
                        Upload Payment Proof
                      </Button>
                    </motion.div>
                  );
                }}
              </Form.Item>
            </Form>
          </motion.div>

          {/* Information Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              background: "linear-gradient(135deg, #fff9eb 0%, #fff3d6 100%)",
              padding: "16px",
              borderRadius: "12px",
              marginTop: "24px",
              border: "2px solid #f7a50a30",
            }}
          >
            <Text
              style={{ fontSize: "13px", color: "#1a1a2e", lineHeight: "1.6" }}
            >
              <strong style={{ color: "#f7a50a" }}>Note:</strong> Please ensure
              that your payment proof is clear and legible. The admin team will
              review your submission and update your club status accordingly.
            </Text>
          </motion.div>
        </Card>
      </motion.div>

      {/* Edit Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ExclamationCircleOutlined
              style={{ color: "#f7a50a", fontSize: "20px" }}
            />
            <span>Confirm Edit</span>
          </div>
        }
        open={showEditConfirm}
        onOk={confirmEdit}
        onCancel={() => setShowEditConfirm(false)}
        okText="Yes, Allow Edit"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            background: "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
            border: "none",
            fontWeight: "600",
          },
        }}
        cancelButtonProps={{
          style: {
            borderColor: "#1c3c6d",
            color: "#1c3c6d",
            fontWeight: "600",
          },
        }}
      >
        <Text style={{ fontSize: "15px", color: "#1a1a2e" }}>
          Are you sure you want to edit the contact information? This will allow
          you to modify the first name, last name, email, and mobile number for
          this club registration.
        </Text>
      </Modal>
    </div>
  );
}
