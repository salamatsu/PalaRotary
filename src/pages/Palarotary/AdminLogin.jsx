import { Card, Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { loginAdminApi } from "../../services/api/palarotaryApi";
import { useAdminAuthStore } from "../../store/useAdminAuthStore";

export default function AdminLogin() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const setAuth = useAdminAuthStore((state) => state.setAuth);

  const onFinish = async (values) => {
    try {
      const response = await loginAdminApi(values);

      if (response.success) {
        setAuth(response.data.token, response.data.admin);
        message.success("Login successful!");
        navigate("/admin/dashboard");
      } else {
        message.error(response.message || "Login failed");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card style={{ maxWidth: "400px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{ color: "#fe0808", fontSize: "28px", marginBottom: "8px" }}
          >
            PALAROTARY 2026
          </h1>
          <h2 style={{ fontSize: "18px", color: "#666", fontWeight: "normal" }}>
            Admin Login
          </h2>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{ background: "#fe0808", borderColor: "#fe0808" }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
            Event Information
          </p>
          <p style={{ fontSize: "12px", color: "#999", margin: 0 }}>
            January 25, 2026 | Marikina Sports Center
          </p>
        </div>
      </Card>
    </div>
  );
}
