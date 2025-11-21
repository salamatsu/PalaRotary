import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Result, Button, Card, Typography } from "antd";
import { CheckCircleOutlined, HomeOutlined } from "@ant-design/icons";
import confetti from "canvas-confetti";

const { Title, Text, Paragraph } = Typography;

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  useEffect(() => {
    // Trigger confetti animation on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleOrderAgain = () => {
    navigate("/shirt-order");
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <Result
            status="warning"
            title="No Order Found"
            subTitle="Please complete your order first"
            extra={
              <Button type="primary" onClick={handleGoHome}>
                Go to Home
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl shadow-xl">
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          title={
            <Title level={2} className="mb-0">
              Order Submitted Successfully!
            </Title>
          }
          subTitle={
            <div className="mt-4">
              <Paragraph className="text-lg">
                Your shirt order has been received and is being processed.
              </Paragraph>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <Text strong>Order ID: </Text>
                <Text code className="text-lg">
                  {orderId}
                </Text>
              </div>
            </div>
          }
          extra={[
            <div key="actions" className="space-y-4 mt-6">
              <Paragraph type="secondary" className="text-center">
                Please save your order ID for reference. You will be contacted
                regarding payment and shipping details.
              </Paragraph>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  type="primary"
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={handleGoHome}
                >
                  Go to Home
                </Button>
                <Button size="large" onClick={handleOrderAgain}>
                  Order More Shirts
                </Button>
              </div>
            </div>,
          ]}
        />

        <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <Title level={4} className="mb-3">
            What's Next?
          </Title>
          <ul className="space-y-2">
            <li>
              <Text>Our team will review your order</Text>
            </li>
            <li>
              <Text>
                If you requested a special number, it will be reviewed for
                approval
              </Text>
            </li>
            <li>
              <Text>
                You will receive a confirmation call regarding payment and
                delivery
              </Text>
            </li>
            <li>
              <Text>Your custom shirts will be prepared and shipped</Text>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
