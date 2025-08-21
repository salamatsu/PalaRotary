import React, { useState, useEffect } from "react";
import { useExtendBookingApi } from "../../../../services/requests/useBookings";
import {
  App,
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Tag,
  Statistic,
  Alert,
  Tooltip,
  Badge,
  Switch,
  Radio,
} from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { CheckCircleIcon, Clock, Info, ToggleRightIcon } from "lucide-react";

const { Title, Text } = Typography;

const ExtendBooking = ({ bookingData, request, callback = () => {} }) => {
  const [form] = Form.useForm();
  const extendBookingApi = useExtendBookingApi();
  const { message, modal, notification } = App.useApp();
  const [previewData, setPreviewData] = useState({
    newCheckOut: null,
    extensionRate: 0,
    totalRate: 0,
  });

  // Calculate new checkout time based on extension hours
  const calculateNewCheckOut = (extensionHours) => {
    if (!extensionHours || !bookingData?.expectedCheckOutDateTime) return null;
    return dayjs(bookingData.expectedCheckOutDateTime).add(
      extensionHours,
      "hour"
    );
  };

  // Calculate extension rate (assuming hourly rate from booking info)
  const calculateExtensionRate = (extensionHours) => {
    if (!extensionHours || !bookingData?.rateAmountPerHour) return 0;
    return extensionHours * bookingData.rateAmountPerHour;
  };

  const handleFinish = (values) => {
    const extensionHours = parseInt(values.extensionHours);
    const newCheckOut = calculateNewCheckOut(extensionHours);
    const extensionRate = calculateExtensionRate(extensionHours);

    modal.confirm({
      title: "Confirm Extension",
      content: (
        <div>
          <p>
            Are you sure you want to extend the booking for{" "}
            <strong>{extensionHours} hours</strong>?
          </p>
          <p>
            New Checkout Time:{" "}
            <strong>{newCheckOut?.format("MMM DD, YYYY h:mm A")}</strong>
          </p>
          <p>
            Total Rate: <strong>{formatCurrency(extensionRate)}</strong>
          </p>
          {values.reason && (
            <p>
              Reason: <strong>{values.reason}</strong>
            </p>
          )}
        </div>
      ),
      okText: "Extend",
      cancelText: "Cancel",
      onOk: () => {
        extendBookingApi.mutate(
          {
            bookingId: bookingData?.bookingId,
            originalCheckOut: bookingData?.expectedCheckOutDateTime,
            newCheckOut: newCheckOut?.toISOString(),
            newCheckOutFormatted: newCheckOut?.format("MMM DD, YYYY h:mm A"),
            extensionHours: extensionHours,
            extensionRate: extensionRate,
            reason: values.reason || "Guest requested extension",
            currentBookingStatus: bookingData?.bookingStatus,
            ...values,
          },
          {
            onSuccess: (result) => {
              notification.success({
                message: "Booking Extended Successfully",
                description: `Booking ${result.data?.bookingReference} has been extended successfully.`,
              });

              form.resetFields();
              setPreviewData({
                newCheckOut: null,
                extensionRate: 0,
                totalRate: 0,
              });
              callback(result.data);
              if (request) {
                request.refetch();
              }
            },
            onError: (error) => {
              message.error(error?.message || "Failed to extend booking");
            },
          }
        );
      },
    });
  };

  const handleExtensionHoursChange = (value) => {
    if (value && bookingData) {
      const newCheckOut = calculateNewCheckOut(value);
      const extensionRate = calculateExtensionRate(value);
      const totalRate = (bookingData?.totalAmount || 0) + extensionRate;

      setPreviewData({
        newCheckOut,
        extensionRate,
        totalRate,
      });

      // Update form fields with calculated values
      form.setFieldsValue({
        newCheckOut: newCheckOut?.format("MMM DD, YYYY h:mm A"),
        extensionRate: extensionRate,
      });
    } else {
      setPreviewData({
        newCheckOut: null,
        extensionRate: 0,
        totalRate: bookingData?.totalAmount || 0,
      });
      form.setFieldsValue({
        newCheckOut: null,
        extensionRate: 0,
      });
    }
  };

  const InfoCard = ({ icon, title, value, color = "default" }) => (
    <div
      className="info-card"
      style={{
        padding: "14px",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        minHeight: "80px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background:
            color === "primary"
              ? "#1677ff"
              : color === "success"
              ? "#52c41a"
              : "#64748b",
        }}
      />
      <Space align="start" style={{ width: "100%" }}>
        <div
          style={{
            padding: "6px",
            background:
              color === "primary"
                ? "#e6f4ff"
                : color === "success"
                ? "#f6ffed"
                : "#f1f5f9",
            borderRadius: "6px",
            color:
              color === "primary"
                ? "#1677ff"
                : color === "success"
                ? "#52c41a"
                : "#64748b",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text
            type="secondary"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              display: "block",
              marginBottom: "2px",
            }}
          >
            {title}
          </Text>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#1e293b",
              wordBreak: "break-word",
              lineHeight: "1.3",
            }}
          >
            {value}
          </div>
        </div>
      </Space>
    </div>
  );

  return (
    <div>
      <Text type="secondary" style={{ fontSize: "14px", lineHeight: "1.5" }}>
        Modify the checkout time and calculate additional charges
      </Text>

      {/* Current Booking Info */}
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={5}
          style={{
            color: "#475569",
            marginBottom: "16px",
            fontSize: "16px",
          }}
        >
          Current Booking Details
        </Title>
        <div className="grid grid-cols-2 gap-6">
          <InfoCard
            icon={<InfoCircleOutlined />}
            title="Booking Reference"
            value={bookingData?.bookingReference}
          />
          <InfoCard
            icon={<InfoCircleOutlined />}
            title="Room"
            value={`${bookingData?.roomNumber} - ${bookingData?.roomTypeName}`}
          />

          <InfoCard
            icon={<CalendarOutlined />}
            title="Current Check-out"
            value={dayjs(bookingData?.expectedCheckOutDateTime).format(
              "MMM DD, h:mm A"
            )}
            color="primary"
          />

          <InfoCard
            icon={<DollarOutlined />}
            title="Hourly Rate"
            value={formatCurrency(bookingData?.rateAmountPerHour)}
            color="success"
          />
        </div>
      </div>

      <Divider style={{ margin: "20px 0" }} />

      {/* Extension Form */}
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        requiredMark={false}
        style={{ marginTop: "20px" }}
      >
        <div className=" flex flex-row justify-between gap-6">
          <Form.Item
            className="w-full"
            label={
              <Space size="small" wrap>
                <Clock />
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  Extension Hours
                </span>
              </Space>
            }
            name="extensionHours"
            rules={[
              { required: true, message: "Please enter extension hours" },
              {
                type: "number",
                min: 1,
                max: 24,
                message: "Please enter a valid number of hours (1-24)",
              },
            ]}
          >
            <InputNumber
              size="large"
              min={1}
              max={24}
              placeholder="Hours to extend"
              onChange={handleExtensionHoursChange}
              style={{
                width: "100%",
                height: "44px",
                fontSize: "16px",
                borderRadius: "8px",
              }}
              addonAfter="hours"
            />
          </Form.Item>
          <Form.Item
            className="w-full"
            label={
              <Space size="small" wrap>
                <CheckCircleIcon />
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  Mark as Paid
                </span>
              </Space>
            }
            name="paymentStatus"
            initialValue={"completed"}
          >
            <Radio.Group>
              <Radio value="completed">PAID</Radio>
              <Radio value="pending">UNPAID</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
        <Form.Item
          className="w-full"
          label={
            <Space size="small" wrap>
              <Info />
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                Reason (Optional)
              </span>
            </Space>
          }
          name="reason"
        >
          <Input.TextArea
            size="large"
            placeholder="Reason for extension"
            style={{
              height: "44px",
              borderRadius: "8px",
            }}
          />
        </Form.Item>

        {/* Preview Section */}
        {previewData.newCheckOut && (
          <div style={{ marginTop: "20px" }}>
            <Alert
              message={
                <span style={{ fontWeight: 600, fontSize: "16px" }}>
                  Extension Preview
                </span>
              }
              description={
                <Row gutter={[12, 16]} style={{ marginTop: "16px" }}>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          color: "#1677ff",
                          fontSize: "16px",
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                      >
                        <CalendarOutlined style={{ marginRight: "6px" }} />
                        {previewData.newCheckOut.format("MMM DD")}
                      </div>
                      <div
                        style={{
                          color: "#1677ff",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        {previewData.newCheckOut.format("h:mm A")}
                      </div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        New Check-out
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          color: "#52c41a",
                          fontSize: "16px",
                          fontWeight: 600,
                          marginBottom: "8px",
                        }}
                      >
                        {formatCurrency(previewData.extensionRate)}
                      </div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Extension Charge
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          color: "#fa541c",
                          fontSize: "16px",
                          fontWeight: 600,
                          marginBottom: "8px",
                        }}
                      >
                        {formatCurrency(previewData.totalRate)}
                      </div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        New Total Amount
                      </Text>
                    </div>
                  </Col>
                </Row>
              }
              type="info"
              showIcon
              style={{
                borderRadius: "12px",
                border: "1px solid #91caff",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              }}
            />
          </div>
        )}

        {/* Hidden form fields for submission */}
        <Form.Item name="newCheckOut" style={{ display: "none" }}>
          <Input />
        </Form.Item>
        <Form.Item name="extensionRate" style={{ display: "none" }}>
          <InputNumber />
        </Form.Item>

        <div
          className=" flex flex-row justify-between gap-6"
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "12px",
          }}
        >
          <Button
            onClick={() => {
              form.resetFields();
              setPreviewData({
                newCheckOut: null,
                extensionRate: 0,
                totalRate: 0,
              });
            }}
            block
            danger
            style={{
              borderRadius: "8px",
              height: "44px",
              fontSize: "15px",
            }}
          >
            Reset
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={extendBookingApi.isLoading}
            block
            style={{
              borderRadius: "8px",
              height: "44px",
              fontWeight: 600,
              fontSize: "15px",
            }}
            icon={<CheckCircleOutlined />}
          >
            Extend Booking
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ExtendBooking;
