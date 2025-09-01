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
  CloseOutlined,
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
  bookingData,
  onPaymentSuccess,
}) => {
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
    queryKey: ["payment-summary", bookingData?.bookingId],
    queryFn: () => getBookingPaymentSummaryApi(bookingData?.bookingId),
    enabled: open && !!bookingData?.bookingId,
    refetchOnWindowFocus: false,
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: paymentSettleApi,
    onSuccess: (data) => {
      message.success(data.message || "Payment processed successfully!");
      queryClient.invalidateQueries([
        "payment-summary",
        bookingData?.bookingId,
      ]);
      queryClient.invalidateQueries(["booking", bookingData?.bookingId]);
      queryClient.invalidateQueries(["bookings"]);
      onPaymentSuccess?.(data);
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      message.error(error.message || "Payment processing failed");
    },
  });

  // Check if booking has any payments (excluding pending ones)
  const hasExistingPayments = () => {
    if (!bookingData?.payments) return false;
    return bookingData.payments.some(
      (payment) =>
        payment.paymentStatus === "completed" &&
        ["room_charge", "partial_payment", "down_payment"].includes(
          payment.paymentType
        )
    );
  };

  // Get available payment type options based on payment history and balance
  const getAvailablePaymentTypes = () => {
    const hasPayments = hasExistingPayments();
    const financials = paymentSummary?.data?.financials;
    const balanceAmount = financials?.balanceAmount || 0;

    const options = [];

    // Only show down payment if no existing payments
    if (!hasPayments) {
      options.push({
        value: "down_payment",
        label: (
          <div className="flex items-center space-x-2 py-1">
            <WalletOutlined className="text-blue-600" />
            <Text className="font-medium">Down Payment</Text>
            <Text type="secondary" className="text-xs">
              Initial deposit payment
            </Text>
          </div>
        ),
      });
    }

    // Show partial payment if there's a balance > 0
    if (balanceAmount > 0) {
      options.push({
        value: "partial_payment",
        label: (
          <div className="flex items-center space-x-2 py-1">
            <DollarOutlined className="text-orange-600" />
            <Text className="font-medium">Partial Payment</Text>
            <Text type="secondary" className="text-xs">
              Custom amount
            </Text>
          </div>
        ),
      });
    }

    // Show full settlement if there's a balance > 0
    if (balanceAmount > 0) {
      options.push({
        value: "balance_settlement",
        label: (
          <div className="flex items-center space-x-2 py-1">
            <CheckCircleOutlined className="text-green-600" />
            <Text className="font-medium">Full Settlement</Text>
            <Text type="secondary" className="text-xs">
              Pay remaining balance (₱{balanceAmount.toFixed(2)})
            </Text>
          </div>
        ),
      });
    }

    return options;
  };

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

  // Check if amount input should be disabled
  const isAmountDisabled = selectedSettlementType === "balance_settlement";

  // Validate amount to prevent triggering full payment accidentally
  const validateAmount = (_, value) => {
    if (!value || value <= 0) {
      return Promise.reject("Amount must be greater than 0");
    }

    const balanceAmount = financials?.balanceAmount || 0;

    if (value > balanceAmount + 1) {
      return Promise.reject("Amount exceeds outstanding balance");
    }

    // Prevent partial/down payment from accidentally paying full balance
    if (
      selectedSettlementType !== "balance_settlement" &&
      Math.abs(value - balanceAmount) < 0.01
    ) {
      return Promise.reject(
        "Use 'Full Settlement' option to pay the complete balance. For partial payment, enter an amount less than the full balance."
      );
    }

    return Promise.resolve();
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    const balanceAmount = financials?.balanceAmount || 0;

    // Additional validation before submission
    if (
      selectedSettlementType !== "balance_settlement" &&
      Math.abs(values.amount - balanceAmount) < 0.01
    ) {
      message.error("Use 'Full Settlement' option to pay the complete balance");
      return;
    }

    await paymentMutation.mutateAsync(
      {
        bookingId: bookingData?.bookingId,
        ...values,
        settlementType: selectedSettlementType,
        currency: "PHP",
        transactionReference: bookingData?.bookingReference,
      },
      {
        onSuccess: (data) => {
          message.success(data.message || "Payment processed successfully!");
          queryClient.invalidateQueries([
            "payment-summary",
            bookingData?.bookingId,
          ]);
          queryClient.invalidateQueries(["booking", bookingData?.bookingId]);
          queryClient.invalidateQueries(["bookings"]);
          onPaymentSuccess?.(data);
          form.resetFields();
          onClose();
        },
        onError: (error) => {
          message.error(error.message || "Payment processing failed");
        },
      }
    );
  };

  // Reset form when drawer opens and set default payment type
  useEffect(() => {
    if (open && paymentSummary?.data) {
      const hasPayments = hasExistingPayments();
      const balanceAmount = paymentSummary.data.financials?.balanceAmount || 0;

      // Set default payment type based on payment history
      let defaultType = "partial_payment";
      if (!hasPayments && balanceAmount > 0) {
        defaultType = "down_payment";
      } else if (hasPayments && balanceAmount > 0) {
        defaultType = "partial_payment";
      }

      form.resetFields();
      setSelectedSettlementType(defaultType);
      setCalculatedAmount(null);

      // Set the form value for settlement type
      form.setFieldsValue({ settlementType: defaultType });
    }
  }, [open, form, paymentSummary, bookingData]);

  // Refetch summary when drawer opens
  useEffect(() => {
    if (open) {
      refetchSummary();
    }
  }, [open, refetchSummary]);

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
              Booking: {bookingData?.bookingReference}
            </Text>
          </div>
        </div>
      }
      open={open}
      onClose={onClose}
      size="large"
      placement="right"
      className="payment-drawer"
      closable={false}
      extra={
        <Button
          type="text"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          size="large"
        >
          <CloseOutlined />
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

            {/* Payment History Indicator */}
            {hasExistingPayments() && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <Text className="text-sm text-blue-700">
                  <CheckCircleOutlined className="mr-1" />
                  This booking has existing payments
                </Text>
              </div>
            )}
          </Card>
        )}

        {/* Payment Form */}
        {flags?.acceptsPayments && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
            initialValues={{ settlementType: selectedSettlementType }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Settlement Type */}
              <Form.Item
                label={<Text className="font-medium">Payment Type</Text>}
                name="settlementType"
                rules={[
                  { required: true, message: "Please select payment type" },
                ]}
              >
                <Select
                  size="large"
                  onChange={handleSettlementTypeChange}
                  className="w-full"
                  value={selectedSettlementType}
                  options={getAvailablePaymentTypes()}
                  placeholder="Select payment type"
                />
              </Form.Item>

              {/* Payment Method */}
              <Form.Item
                label={<Text className="font-medium">Payment Method</Text>}
                name="paymentMethod"
                rules={[
                  { required: true, message: "Please select payment method" },
                ]}
                initialValue={"cash"}
              >
                <Select
                  size="large"
                  placeholder="Select payment method"
                  options={Object.entries(paymentMethodIcons).map(
                    ([method, icon]) => ({
                      value: method,
                      label: (
                        <div className="flex items-center space-x-2 py-1">
                          {icon}
                          <Text className="capitalize font-medium">
                            {method.replace("_", " ")}
                          </Text>
                        </div>
                      ),
                    })
                  )}
                />
              </Form.Item>
            </div>

            {/* Amount */}
            <Form.Item
              className="w-full"
              label={
                <div className="flex justify-between items-center w-full">
                  <Text className="font-medium">
                    Amount
                    {isAmountDisabled && (
                      <Text type="secondary" className="text-sm ml-2">
                        (Auto-calculated)
                      </Text>
                    )}
                  </Text>
                  {!isAmountDisabled && (
                    <Text type="secondary" className="text-sm">
                      Max: ₱{(financials?.balanceAmount || 0).toFixed(2)}
                    </Text>
                  )}
                </div>
              }
              name="amount"
              rules={[
                { required: true, message: "Please enter amount" },
                { validator: validateAmount },
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
                disabled={isAmountDisabled}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\₱\s?|(,*)/g, "")}
              />
            </Form.Item>

            {/* Full Settlement Notice */}
            {selectedSettlementType === "balance_settlement" && (
              <Alert
                type="info"
                showIcon
                message="Full Settlement Selected"
                description="The complete outstanding balance will be paid. Amount is automatically calculated and cannot be modified."
                className="mb-4"
              />
            )}

            {/* Validation Warnings */}
            {selectedSettlementType !== "balance_settlement" &&
              financials?.balanceAmount > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  message="Partial Payment Guidelines"
                  description={
                    <div className="text-sm">
                      <div>• Enter an amount less than the full balance</div>
                      <div>
                        • To pay the complete balance, select "Full Settlement"
                      </div>
                      <div>• Amount cannot equal the exact balance amount</div>
                    </div>
                  }
                  className="mb-4"
                />
              )}

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
                  : `Process Payment ${
                      selectedSettlementType === "balance_settlement"
                        ? "(Full)"
                        : selectedSettlementType === "down_payment"
                        ? "(Down)"
                        : "(Partial)"
                    }`}
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
