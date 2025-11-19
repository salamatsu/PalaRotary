import { CheckCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, message, Select } from "antd";
import { useState } from "react";
import {
  useApprovedClubs,
  useRegisterMember,
} from "../../services/requests/usePalarotary";

export default function MemberRegistration() {
  const [form] = Form.useForm();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [badgeData, setBadgeData] = useState(null);
  //   {
  //   badge_number: "PALAROTARY-0000",
  //   badge: {
  //     member_name: "John Doe",
  //     club_name: "Sample Club",
  //     qr_code_data_url: JSON.stringify({
  //       id: "a583c4b9-efcf-46a5-9791-caf134279a4f",
  //       badge: "PR2025-90065",
  //       event: "PR2025",
  //     }),
  //     event_name: "PALAROTARY 2025",
  //     event_date: "January 25, 2026",
  //     event_time: "8:00 AM - 6:00 PM",
  //     event_location: "Marikina Sports Center",
  //     event_venue: "Marikina, Metro Manila",
  //     callsign: "Sample Callsign",
  //     position: "Sample Position",
  //   },
  // }

  const registerMember = useRegisterMember();
  const { data: clubsData, isLoading: loadingClubs } = useApprovedClubs();

  const clubs = clubsData?.data || [];

  const onFinish = async (values) => {
    try {
      const response = await registerMember.mutateAsync(values);
      setBadgeData(response.data);
      setRegistrationComplete(true);
      message.success(
        "Registration successful! Check your email for your digital badge."
      );
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to register member"
      );
    }
  };

  const downloadQRCode = () => {
    if (badgeData?.badge?.qr_code_data_url) {
      const a = document.createElement("a");
      a.download = `PALAROTARY-${badgeData.badge_number}.png`;
      a.href = badgeData.badge.qr_code_data_url;
      document.body.appendChild(a);
      a.click();

      // Use setTimeout to ensure click event completes before removal
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);

      message.success("QR Code downloaded!");
    }
  };

  if (registrationComplete && badgeData) {
    return (
      <div
        style={{
          padding: "24px",
          maxWidth: "700px",
          margin: "0 auto",
          minHeight: "100vh",
          background: "#f0f2f5",
        }}
      >
        <Card>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <CheckCircleOutlined
              style={{
                fontSize: "72px",
                color: "#52c41a",
                marginBottom: "24px",
              }}
            />
            <h1 style={{ color: "#52c41a", marginBottom: "16px" }}>
              Registration Successful!
            </h1>

            <Card title="Your Digital Badge" style={{ marginTop: "24px" }}>
              <div
                className="member-badge-qr"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "24px",
                }}
              >
                {badgeData.badge.qr_code_data_url && (
                  <img
                    src={badgeData.badge.qr_code_data_url}
                    alt="QR Code Badge"
                    style={{
                      width: "256px",
                      height: "256px",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      padding: "8px",
                      background: "white",
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  textAlign: "left",
                  background: "#f5f5f5",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ margin: "8px 0" }}>
                  <strong>Badge Number:</strong> {badgeData.badge_number}
                </p>
                <p style={{ margin: "8px 0" }}>
                  <strong>Name:</strong> {badgeData.badge.member_name}
                </p>
                <p style={{ margin: "8px 0" }}>
                  <strong>Club:</strong> {badgeData.badge.club_name}
                </p>
                {badgeData.badge.callsign && (
                  <p style={{ margin: "8px 0" }}>
                    <strong>Callsign:</strong> {badgeData.badge.callsign}
                  </p>
                )}
                {badgeData.badge.position && (
                  <p style={{ margin: "8px 0" }}>
                    <strong>Position:</strong> {badgeData.badge.position}
                  </p>
                )}
              </div>

              <Alert
                message="Important"
                description="Your digital badge has been sent to your email. Please present this QR code at the registration desk on the event day."
                type="info"
                showIcon
                style={{ marginBottom: "16px" }}
              />

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadQRCode}
                block
                size="large"
                style={{
                  background: "#fe0808",
                  borderColor: "#fe0808",
                  marginBottom: "8px",
                }}
              >
                Download QR Code
              </Button>
            </Card>

            <div
              style={{
                background: "#fff3cd",
                padding: "16px",
                borderRadius: "8px",
                marginTop: "24px",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Event Details</h3>
              <p style={{ margin: "8px 0" }}>
                <strong>Event:</strong> {badgeData.badge.event_name}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Date:</strong> {badgeData.badge.event_date}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Time:</strong> {badgeData.badge.event_time}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Location:</strong> {badgeData.badge.event_location}
              </p>
            </div>

            <Button
              type="default"
              size="large"
              onClick={() => window.location.reload()}
              style={{ marginTop: "24px" }}
            >
              Register Another Member
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "700px",
        margin: "0 auto",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{ color: "#fe0808", fontSize: "32px", marginBottom: "8px" }}
          >
            PALAROTARY 2025
          </h1>
          <h2 style={{ fontSize: "20px", color: "#333", marginBottom: "8px" }}>
            Member Registration
          </h2>
          <p style={{ fontSize: "16px", color: "#666" }}>
            January 25, 2026 | Marikina Sports Center | 8am-6pm
          </p>
        </div>

        <Alert
          message="Free Registration for Club Members"
          description="Select your club and fill in your information to get your digital badge."
          type="success"
          showIcon
          style={{ marginBottom: "24px" }}
        />

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Select Your Club"
            name="club_id"
            rules={[{ required: true, message: "Please select your club" }]}
          >
            <Select
              placeholder="Select a registered club"
              size="large"
              loading={loadingClubs}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {clubs.map((club) => (
                <Select.Option key={club.id} value={club.id}>
                  {club.club_name} {club.zone && `(${club.zone})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="First Name"
            name="first_name"
            rules={[
              { required: true, message: "Please enter your first name" },
            ]}
          >
            <Input placeholder="Enter your first name" size="large" />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="last_name"
            rules={[{ required: true, message: "Please enter your last name" }]}
          >
            <Input placeholder="Enter your last name" size="large" />
          </Form.Item>

          <Form.Item
            label="Contact Number"
            name="contact_number"
            rules={[
              { required: true, message: "Please enter your contact number" },
              { pattern: /^[0-9+\-\s()]+$/, message: "Invalid phone number" },
            ]}
          >
            <Input placeholder="e.g., 0917 123 4567" size="large" />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please enter your email address" },
              { type: "email", message: "Invalid email address" },
            ]}
          >
            <Input placeholder="your.email@example.com" size="large" />
          </Form.Item>

          <Form.Item label="Callsign (Optional)" name="callsign">
            <Input placeholder="Your radio callsign (optional)" size="large" />
          </Form.Item>

          <Form.Item label="Position (Optional)" name="position">
            <Input
              placeholder="Your position in the club (optional)"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={registerMember.isPending}
              style={{ background: "#fe0808", borderColor: "#fe0808" }}
            >
              Register & Get Digital Badge
            </Button>
          </Form.Item>
        </Form>

        <Alert
          message="Note"
          description="After registration, you will receive a digital badge via email. Please present this badge at the registration desk on the event day."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
}
