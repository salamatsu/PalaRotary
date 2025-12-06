import { Card, Form, Input, Button, App, Spin } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { logo2 } from "../../assets/images/logos";
import { useLoginAdminAuth } from "../../services/requests/useAuth";

export default function AdminLogin() {
  const [form] = Form.useForm();
  const { modal, message } = App.useApp();
  const { mutate, isPending } = useLoginAdminAuth();

  const onFinish = (values) => {
    modal.success({
      icon: <></>,
      iconType: "loading",
      content: (
        <div className=" flex flex-col gap-2 text-center justify-center items-center">
          <Spin />
          <span>Loading...</span>
        </div>
      ),
      title: null,
      closable: false,
      footer: null,
      centered: true,
    });

    mutate(values, {
      onSuccess: () => {
        form.resetFields();
      },
      onError: (error) => {
        message.error(error?.message);
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ffffff 0%, #1E3A71 100%)",
        padding: "20px",
      }}
    >
      <Card style={{ maxWidth: "400px", width: "100%" }}>
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
          </div>
        </motion.div>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", color: "#666", fontWeight: "normal" }}>
            Admin Login
          </h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={isPending}
        >
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
              loading={isPending}
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
