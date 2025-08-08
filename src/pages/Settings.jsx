import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";

const { Title, Text } = Typography;

const Settings = () => {
  const { hotelInfo, updateHotelInfo } = useHotelStore();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(hotelInfo);
  }, [hotelInfo, form]);

  const handleSave = (values) => {
    updateHotelInfo(values);
    message.success("Settings saved successfully!");
  };

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        Settings
      </Title>

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Hotel Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={hotelInfo}
            >
              <Form.Item
                name="name"
                label="Hotel Name"
                rules={[{ required: true, message: "Please enter hotel name" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="totalRooms"
                label="Total Rooms"
                rules={[
                  { required: true, message: "Please enter total rooms" },
                ]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-blue-600"
                >
                  Save Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="System Information">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text strong>System Version:</Text>
                <Text>v2.1.0</Text>
              </div>
              <div className="flex justify-between">
                <Text strong>Last Backup:</Text>
                <Text>
                  {dayjs().subtract(1, "day").format("MMM DD, YYYY HH:mm")}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text strong>Database Status:</Text>
                <Tag color="green">Online</Tag>
              </div>
              <div className="flex justify-between">
                <Text strong>Active Users:</Text>
                <Text>1</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;
