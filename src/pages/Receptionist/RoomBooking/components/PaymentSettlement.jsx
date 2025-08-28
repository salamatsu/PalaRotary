import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Statistic,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Alert,
  Divider,
  Tag,
  InputNumber,
  message,
  Spin,
} from "antd";
import {
  CreditCardOutlined,
  WalletOutlined,
  BankOutlined,
  MobileOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBookingPaymentSummaryApi,
  paymentSettleApi,
} from "../../../../services/api/bookingsApi";

const { Title, Text } = Typography;
const { Option } = Select;

// Payment method icons mapping
const paymentMethodIcons = {
  cash: <WalletOutlined className="text-green-600" />,
  card: <CreditCardOutlined className="text-blue-600" />,
  gcash: <MobileOutlined className="text-blue-500" />,
  maya: <MobileOutlined className="text-orange-500" />,
  bank_transfer: <BankOutlined className="text-purple-600" />,
  check: <BankOutlined className="text-gray-600" />,
};

const PaymentSettlement = ({
  open,
  onClose,
  bookingId,
  bookingReference,
  onPaymentSuccess,
}) => {
  console.log({ bookingId, bookingReference });
  const [form] = Form.useForm();
  const [selectedSettlementType, setSelectedSettlementType] =
    useState("partial_payment");
  const [calculatedAmount, setCalculatedAmount] = useState(null);
  const queryClient = useQueryClient();

  // Fetch payment summary
  const {
    data: paymentSummary,
    isLoading: isLoadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["payment-summary", bookingId],
    queryFn: () => getBookingPaymentSummaryApi(bookingId),
    enabled: open && !!bookingId,
    refetchOnWindowFocus: false,
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: paymentSettleApi,
    onSuccess: (data) => {
      message.success(data.message || "Payment processed successfully!");
      queryClient.invalidateQueries(["payment-summary", bookingId]);
      queryClient.invalidateQueries(["booking", bookingId]);
      queryClient.invalidateQueries(["bookings"]);
      onPaymentSuccess?.(data);
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      message.error(error.message || "Payment processing failed");
    },
  });

  // Handle settlement type change
  const handleSettlementTypeChange = (type) => {
    setSelectedSettlementType(type);

    if (paymentSummary?.data) {
      const { balanceAmount, totalAmount } = paymentSummary.data.financials;

      switch (type) {
        case "balance_settlement":
          setCalculatedAmount(balanceAmount);
          form.setFieldsValue({ amount: balanceAmount });
          break;
        case "down_payment":
          // Suggest 50% of total or minimum 1000, whichever is lower, but not exceeding balance
          const suggestedDownPayment = Math.min(
            Math.round(totalAmount * 0.5),
            1000
          );
          const downPaymentAmount = Math.min(
            suggestedDownPayment,
            balanceAmount
          );
          setCalculatedAmount(downPaymentAmount);
          form.setFieldsValue({ amount: downPaymentAmount });
          break;
        default:
          setCalculatedAmount(null);
          form.setFieldsValue({ amount: null });
          break;
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    const paymentData = {
      ...values,
      settlementType: selectedSettlementType,
      currency: "PHP",
    };

    await paymentMutation.mutateAsync({
      bookingId,
      paymentData,
    });
  };

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedSettlementType("partial_payment");
      setCalculatedAmount(null);
      refetchSummary();
    }
  }, [open, form, refetchSummary]);

  const financials = paymentSummary?.data?.financials;
  const flags = paymentSummary?.data?.flags;

  return (
    <Drawer
      title={
        <div className="flex items-center space-x-3">
          <DollarOutlined className="text-green-600 text-xl" />
          <div>
            <Title level={4} className="!mb-0">
              Process Payment
            </Title>
            <Text type="secondary" className="text-sm">
              Booking: {bookingReference}
            </Text>
          </div>
        </div>
      }
      open={open}
      onClose={onClose}
      size="large"
      placement="right"
      className="payment-drawer"
      extra={
        <Button
          type="text"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Payment Summary Card */}
        {isLoadingSummary ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : summaryError ? (
          <Alert
            type="error"
            message="Failed to load payment summary"
            description={summaryError.message}
            showIcon
            action={
              <Button size="small" onClick={() => refetchSummary()}>
                Retry
              </Button>
            }
          />
        ) : (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={<Text className="text-gray-600">Total Amount</Text>}
                  value={financials?.totalAmount || 0}
                  precision={2}
                  prefix="₱"
                  valueStyle={{
                    color: "#1f2937",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<Text className="text-gray-600">Amount Paid</Text>}
                  value={financials?.totalPaid || 0}
                  precision={2}
                  prefix="₱"
                  valueStyle={{
                    color: "#059669",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                />
              </Col>
            </Row>

            <Divider className="!my-4" />

            <div className="flex justify-between items-center">
              <div>
                <Text className="text-gray-600 block">Outstanding Balance</Text>
                <Text className="text-2xl font-bold text-red-600">
                  ₱{(financials?.balanceAmount || 0).toFixed(2)}
                </Text>
              </div>
              <div className="text-right">
                <Tag
                  color={
                    flags?.isFullyPaid
                      ? "green"
                      : flags?.hasBalance
                      ? "orange"
                      : "default"
                  }
                  icon={
                    flags?.isFullyPaid ? (
                      <CheckCircleOutlined />
                    ) : flags?.hasBalance ? (
                      <ExclamationCircleOutlined />
                    ) : null
                  }
                  className="text-sm px-3 py-1"
                >
                  {flags?.isFullyPaid
                    ? "Fully Paid"
                    : flags?.hasBalance
                    ? "Partial Payment"
                    : "Pending"}
                </Tag>
              </div>
            </div>
          </Card>
        )}

        {/* Payment Form */}
        {flags?.acceptsPayments && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
            initialValues={{ settlementType: "partial_payment" }}
          >
            {/* Settlement Type */}
            <Form.Item
              label={<Text className="font-medium">Payment Type</Text>}
              name="settlementType"
            >
              <Select
                size="large"
                onChange={handleSettlementTypeChange}
                className="w-full"
                value={selectedSettlementType}
                options={[
                  {
                    value: "down_payment",
                    label: (
                      <div className="flex items-center space-x-2 py-1">
                        <WalletOutlined className="text-blue-600" />
                        <div>
                          <Text className="font-medium">Down Payment</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            Initial deposit payment
                          </Text>
                        </div>
                      </div>
                    ),
                  },
                  {
                    value: "balance_settlement",
                    label: (
                      <div className="flex items-center space-x-2 py-1">
                        <CheckCircleOutlined className="text-green-600" />
                        <div>
                          <Text className="font-medium">Full Settlement</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            Pay remaining balance
                          </Text>
                        </div>
                      </div>
                    ),
                  },
                  {
                    value: "partial_payment",
                    label: (
                      <div className="flex items-center space-x-2 py-1">
                        <DollarOutlined className="text-orange-600" />
                        <div>
                          <Text className="font-medium">Partial Payment</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            Custom amount
                          </Text>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </Form.Item>

            {/* Payment Method */}
            <Form.Item
              label={<Text className="font-medium">Payment Method</Text>}
              name="paymentMethod"
              rules={[
                { required: true, message: "Please select payment method" },
              ]}
            >
              <Select size="large" placeholder="Select payment method">
                {Object.entries(paymentMethodIcons).map(([method, icon]) => (
                  <Option key={method} value={method}>
                    <div className="flex items-center space-x-2 py-1">
                      {icon}
                      <Text className="capitalize font-medium">
                        {method.replace("_", " ")}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Amount */}
            <Form.Item
              className="w-full"
              label={
                <div className="flex justify-between items-center w-full">
                  <Text className="font-medium">Amount</Text>
                  {selectedSettlementType === "balance_settlement" && (
                    <Text type="secondary" className="text-sm">
                      Max: ₱{(financials?.balanceAmount || 0).toFixed(2)}
                    </Text>
                  )}
                </div>
              }
              name="amount"
              rules={[
                { required: true, message: "Please enter amount" },
                {
                  validator: (_, value) => {
                    if (!value || value <= 0) {
                      return Promise.reject("Amount must be greater than 0");
                    }
                    if (financials && value > financials.balanceAmount + 1) {
                      return Promise.reject(
                        "Amount exceeds outstanding balance"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                size="large"
                placeholder="0.00"
                className="w-full"
                style={{ width: "100%" }}
                prefix="₱"
                precision={2}
                min={0.01}
                max={financials?.balanceAmount || 999999}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\₱\s?|(,*)/g, "")}
              />
            </Form.Item>

            {/* Transaction Reference */}
            <Form.Item
              label={<Text className="font-medium">Transaction Reference</Text>}
              name="transactionReference"
            >
              <Input
                size="large"
                placeholder="Optional reference number"
                maxLength={100}
                showCount
              />
            </Form.Item>

            {/* Receipt Number */}
            <Form.Item
              label={<Text className="font-medium">Receipt Number</Text>}
              name="receiptNumber"
            >
              <Input
                size="large"
                placeholder="Optional receipt number"
                maxLength={50}
                showCount
              />
            </Form.Item>

            {/* Notes */}
            <Form.Item
              label={<Text className="font-medium">Notes</Text>}
              name="notes"
            >
              <Input.TextArea
                rows={3}
                placeholder="Optional payment notes..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="default"
                size="large"
                onClick={onClose}
                className="flex-1"
                disabled={paymentMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={paymentMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 border-green-600"
                icon={
                  paymentMutation.isPending ? (
                    <LoadingOutlined />
                  ) : (
                    <DollarOutlined />
                  )
                }
              >
                {paymentMutation.isPending
                  ? "Processing..."
                  : "Process Payment"}
              </Button>
            </div>

            {/* Payment Summary Preview */}
            {calculatedAmount && (
              <Alert
                type="info"
                showIcon
                message="Payment Preview"
                description={
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Payment Amount:</span>
                      <span className="font-medium">
                        ₱{calculatedAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Balance:</span>
                      <span className="font-medium">
                        ₱
                        {Math.max(
                          0,
                          (financials?.balanceAmount || 0) - calculatedAmount
                        ).toFixed(2)}
                      </span>
                    </div>
                    {Math.max(
                      0,
                      (financials?.balanceAmount || 0) - calculatedAmount
                    ) === 0 && (
                      <div className="text-green-600 font-medium mt-2">
                        ✓ Booking will be fully paid
                      </div>
                    )}
                  </div>
                }
                className="mt-4"
              />
            )}
          </Form>
        )}

        {/* No Payment Allowed Message */}
        {!flags?.acceptsPayments && (
          <Alert
            type="warning"
            showIcon
            message="Payment Not Available"
            description="This booking is either fully paid or not eligible for additional payments."
            className="mt-4"
          />
        )}

        {/* Error Display */}
        {paymentMutation.error && (
          <Alert
            type="error"
            showIcon
            message="Payment Error"
            description={paymentMutation.error.message}
            className="mt-4"
            closable
            onClose={() => paymentMutation.reset()}
          />
        )}
      </div>
    </Drawer>
  );
};

export default PaymentSettlement;
