import {
  App,
  Button,
  Card,
  Checkbox,
  Drawer,
  Empty,
  Select,
  Spin,
  Typography,
  message,
} from "antd";
import {
  Building,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { PAYMENT_METHODS } from "../../../../lib/constants";
import { useAddAdditionalServices } from "../../../../services/requests/useAdditionalServices";
import AdditionalServicesSelector from "./AdditionalServicesSelector";

const { Text } = Typography;

// StatusBadge component with better styling
const StatusBadge = ({ status }) => {
  const statusConfig = useMemo(() => {
    const configs = {
      confirmed: { color: "bg-blue-100 text-blue-800", icon: "✓" },
      "checked-in": { color: "bg-green-100 text-green-800", icon: "🏠" },
      "checked-out": { color: "bg-gray-100 text-gray-800", icon: "🚪" },
      cancelled: { color: "bg-red-100 text-red-800", icon: "✗" },
      paid: { color: "bg-green-100 text-green-800", icon: "💰" },
      partial: { color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
      pending: { color: "bg-orange-100 text-orange-800", icon: "⏱️" },
      completed: { color: "bg-green-100 text-green-800", icon: "✅" },
      applied: { color: "bg-blue-100 text-blue-800", icon: "📋" },
    };
    return (
      configs[status?.toLowerCase()] || {
        color: "bg-gray-100 text-gray-800",
        icon: "❓",
      }
    );
  }, [status]);

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full font-medium capitalize ${statusConfig.color}`}
    >
      <span className="text-xs">{statusConfig.icon}</span>
      {status || "Unknown"}
    </span>
  );
};

// Loading component
const LoadingSpinner = ({ size = "default" }) => (
  <div className="flex items-center justify-center p-4">
    <Spin size={size} />
  </div>
);

const BookingInformation = memo(
  ({ bookingData, loading = false, request, settlePayment }) => {
    const { modal } = App.useApp();

    const [selectedServices, setSelectedServices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(
      PAYMENT_METHODS[0]?.value || "cash"
    );
    const [markAsPaid, setMarkAsPaid] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const addAdditionalServices = useAddAdditionalServices();

    // Memoized calculations
    const totalSelectedValue = useMemo(
      () =>
        selectedServices.reduce(
          (sum, service) => sum + (service.totalAmount || 0),
          0
        ),
      [selectedServices]
    );

    const balanceAmount = useMemo(
      () => (bookingData?.totalAmount || 0) - (bookingData?.totalPaid || 0),
      [bookingData?.totalAmount, bookingData?.totalPaid]
    );

    // Utility functions
    const formatDateTime = useCallback((dateTime) => {
      if (!dateTime) return "Not set";
      try {
        const date = new Date(dateTime);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        console.error("Date formatting error:", error);
        return "Invalid date";
      }
    }, []);

    const formatCurrency = useCallback((amount, currency = "PHP") => {
      if (typeof amount !== "number" || isNaN(amount))
        return `${currency} 0.00`;
      return `${currency} ${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}`;
    }, []);

    const handleConfirmPayment = useCallback(async () => {
      if (selectedServices.length === 0) {
        message.warning("Please select at least one service");
        return;
      }

      let currentModal = null;

      const PaymentConfirmationContent = () => {
        const [localPaymentMethod, setLocalPaymentMethod] =
          useState(paymentMethod);
        const [localMarkAsPaid, setLocalMarkAsPaid] = useState(markAsPaid);

        const handleSubmit = async () => {
          setIsProcessingPayment(true);

          try {
            const body = {
              bookingId: bookingData?.bookingId,
              roomId: bookingData?.roomId,
              paymentMethod: localPaymentMethod,
              paymentStatus: localMarkAsPaid ? "completed" : "pending",
              additionalCharges: selectedServices.map((service) => ({
                ...service,
                // Ensure all required fields are present
                serviceName: service.serviceName || "Unknown Service",
                totalAmount: service.totalAmount || 0,
                quantity: service.quantity || 1,
              })),
            };

            await addAdditionalServices.mutateAsync(body, {
              onSuccess: () => {
                message.success("Additional services added successfully!");
                setSelectedServices([]);
                setIsModalOpen(false);
                currentModal?.destroy();

                if (request) request.refetch();
              },
              onError: (error) => {
                console.error("Payment error:", error);
                message.error(
                  error?.response?.data?.message ||
                    "Failed to process payment. Please try again."
                );
              },
              onSettled: () => {
                setIsProcessingPayment(false);
              },
            });
          } catch (error) {
            console.error("Payment error:", error);
            message.error(
              error?.response?.data?.message ||
                "Failed to process payment. Please try again."
            );
          } finally {
            setIsProcessingPayment(false);
          }
        };

        return (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">
                Confirm Additional Services Payment
              </h2>
            </div>

            {/* Payment Method Selection */}
            <Card size="small" title="Payment Method" className="mb-4">
              <Select
                value={localPaymentMethod}
                onChange={setLocalPaymentMethod}
                className="w-full"
                options={PAYMENT_METHODS}
                placeholder="Select payment method"
              />
            </Card>

            {/* Services Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Text className="font-semibold text-gray-900">
                  Selected Services
                </Text>
                <Text className="text-sm text-gray-600">
                  {selectedServices.length} service
                  {selectedServices.length !== 1 ? "s" : ""}
                </Text>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedServices.map((service, index) => (
                  <div
                    key={`service-${index}`}
                    className="flex justify-between items-start p-3 bg-white rounded-lg border"
                  >
                    <div className="flex-1">
                      <Text className="font-medium">{service.serviceName}</Text>
                      {service.itemDescription && (
                        <Text className="text-sm text-gray-600 block">
                          {service.itemDescription}
                        </Text>
                      )}
                      {service.isPerItem === 1 && (
                        <Text className="text-sm text-gray-500">
                          Quantity: {service.quantity} ×{" "}
                          {formatCurrency(service.unitPrice || 0)}
                        </Text>
                      )}
                    </div>
                    <Text className="font-semibold text-green-600">
                      {formatCurrency(service.totalAmount)}
                    </Text>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900">
                  Total Amount
                </Text>
                <Text className="text-xl font-bold text-green-600">
                  {formatCurrency(totalSelectedValue)}
                </Text>
              </div>

              <Checkbox
                checked={localMarkAsPaid}
                onChange={(e) => setLocalMarkAsPaid(e.target.checked)}
                className="mt-3"
              >
                <Text className="font-semibold">Mark as paid immediately</Text>
              </Checkbox>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                size="large"
                className="flex-1 rounded-lg"
                onClick={() => currentModal?.destroy()}
                disabled={isProcessingPayment}
              >
                Cancel
              </Button>
              <Button
                size="large"
                type="primary"
                loading={isProcessingPayment}
                onClick={handleSubmit}
                icon={
                  isProcessingPayment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )
                }
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 border-0"
                disabled={!localPaymentMethod || isProcessingPayment}
              >
                {isProcessingPayment
                  ? "Processing..."
                  : `Confirm ${formatCurrency(totalSelectedValue)}`}
              </Button>
            </div>
          </div>
        );
      };

      currentModal = modal.confirm({
        className: "booking-payment-modal",
        width: 700,
        closable: !isProcessingPayment,
        maskClosable: !isProcessingPayment,
        content: <PaymentConfirmationContent />,
        footer: null, // Custom footer in content
      });
    }, [
      selectedServices,
      bookingData,
      paymentMethod,
      markAsPaid,
      addAdditionalServices,
      formatCurrency,
      modal,
      totalSelectedValue,
    ]);

    // Reset selected services when booking data changes
    useEffect(() => {
      setSelectedServices([]);
      setMarkAsPaid(false);
    }, [bookingData?.bookingId]);

    // Loading state
    if (loading) {
      return (
        <div className="w-full mx-auto min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      );
    }

    // Error state
    if (!bookingData) {
      return (
        <div className="w-full mx-auto min-h-screen flex items-center justify-center">
          <Empty description="No booking data available" />
        </div>
      );
    }

    return (
      <div className="w-full mx-auto min-h-screen bg-gray-50 p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Reference:{" "}
              <Typography.Text
                style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                className="text-blue-600"
              >
                {bookingData.bookingReference}
              </Typography.Text>
            </h1>
            <div className="flex justify-center gap-4 flex-wrap">
              <StatusBadge status={bookingData?.bookingStatus} />
              <StatusBadge status={bookingData?.paymentStatus} />
            </div>
          </div>

          {/* Quick Info Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Branch</p>
                  <p className="font-semibold text-gray-900">
                    {bookingData.branchName}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Room</p>
                  <p className="font-semibold text-gray-900">
                    #{bookingData.roomNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {bookingData.roomTypeName}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Guests</p>
                  <p className="font-semibold text-gray-900">
                    {bookingData.numberOfGuests}{" "}
                    {bookingData.numberOfGuests === 1 ? "Guest" : "Guests"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">
                    Duration
                  </p>
                  <p className="font-semibold text-gray-900">
                    {bookingData.stayDuration} {bookingData.stayDurationType}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Check-in/Check-out Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Check-in & Check-out
            </h2>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Expected Check-in
                </h3>
                <p className="text-gray-700">
                  {formatDateTime(bookingData.checkInDateTime)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Expected Check-out
                </h3>
                <p className="text-gray-700">
                  {formatDateTime(bookingData.expectedCheckOutDateTime)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Actual Check-in
                  </h4>
                  <p className="text-sm text-gray-700">
                    {bookingData.actualCheckInDateTime
                      ? formatDateTime(bookingData.actualCheckInDateTime)
                      : "Pending"}
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Actual Check-out
                  </h4>
                  <p className="text-sm text-gray-700">
                    {bookingData.actualCheckOutDateTime
                      ? formatDateTime(bookingData.actualCheckOutDateTime)
                      : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Payment Summary
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Base Amount</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(bookingData.baseAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rate per Hour</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(bookingData.rateAmountPerHour)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-red-600">Discount</p>
                  <p className="font-semibold text-red-700">
                    -{formatCurrency(bookingData.discountAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Additional Charges</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(bookingData.serviceChargesAmount)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">VAT (12%)</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(bookingData.taxAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Paid
                  </p>
                  <p className="font-semibold text-green-700">
                    {formatCurrency(bookingData.totalPaid)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-lg font-semibold text-gray-900">
                    Total Amount
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(bookingData.totalAmount)}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Balance</p>
                  <p
                    className={`font-semibold ${
                      balanceAmount > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(balanceAmount)}
                  </p>
                </div>
              </div>
            </div>
            <Button
              className="mt-6"
              type="primary"
              size="large"
              block
              onClick={() => settlePayment()}
            >
              Settle Payment ({formatCurrency(balanceAmount)})
            </Button>
          </div>

          {/* Additional Charges */}
          <div className="bg-white rounded-xl flex flex-col gap-6 shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
              Additional Charges
            </h2>

            {bookingData.additionalCharges?.length > 0 ? (
              <div className="space-y-3">
                {bookingData.additionalCharges.map((charge) => (
                  <div
                    key={charge.chargeId}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {charge.serviceName}
                        </h3>
                        {charge.itemDescription && (
                          <p className="text-sm text-gray-600">
                            {charge.itemDescription}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Qty: {charge.quantity} ×{" "}
                          {formatCurrency(charge.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <small>{charge.serviceType}</small>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(charge.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900">
                      Total Additional Charges
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(
                        bookingData.additionalCharges.reduce(
                          (sum, charge) => sum + charge.totalAmount,
                          0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center h-full flex items-center justify-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No additional charges"
                />
              </div>
            )}

            <Button
              size="large"
              type="primary"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
              className="mt-auto"
            >
              ADD SERVICES
            </Button>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              Payment History
            </h2>

            {bookingData.payments?.length > 0 ? (
              <div className="space-y-3">
                {bookingData.payments.map((payment) => (
                  <div
                    key={payment.paymentId}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 capitalize">
                          {payment.paymentType?.replace("_", " ")}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {payment.paymentMethod} • {payment.paymentCategory}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(payment.paymentDateTime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Processed by: {payment.processedBy}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-green-700">
                          {formatCurrency(payment.amount)}
                        </p>
                        <StatusBadge status={payment.paymentStatus} />
                      </div>
                    </div>
                    {payment.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        Note: {payment.notes}
                      </p>
                    )}
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-lg font-semibold text-gray-900">
                      Total Amount
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(
                        bookingData.payments.reduce(
                          (sum, payment) => sum + payment.amount,
                          0
                        )
                      )}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Balance</p>
                    <p
                      className={`font-semibold ${
                        bookingData.payments.reduce(
                          (sum, payment) =>
                            sum +
                            (payment.paymentStatus === "pending"
                              ? payment.amount
                              : 0),
                          0
                        ) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(
                        bookingData.payments.reduce(
                          (sum, payment) =>
                            sum +
                            (payment.paymentStatus === "pending"
                              ? payment.amount
                              : 0),
                          0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Empty description="No payment history" />
            )}
          </div>

          {/* Booking Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Booking Information
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-semibold text-gray-900">
                    #{bookingData.bookingId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Source</p>
                  <span className="inline-flex px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium capitalize">
                    {bookingData.source}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Rate Type</p>
                  <p className="font-semibold text-gray-900">
                    {bookingData.rateTypeName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created By</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {bookingData.createdBy}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-semibold text-gray-900">
                    {formatDateTime(bookingData.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold text-gray-900">
                    {formatDateTime(bookingData.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-medium text-orange-900 mb-2">
                  Staff Notes
                </h3>
                <p className="text-sm text-gray-700">
                  {bookingData.staffNotes || "No notes available"}
                </p>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Guest Information
            </h2>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Primary Guest</p>
                      <p className="font-medium text-gray-900">
                        {bookingData.primaryGuestName || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium text-gray-900">
                        {bookingData.primaryGuestContact || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {bookingData.primaryGuestEmail || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">
                  Special Requests
                </h3>
                <p className="text-sm text-gray-700">
                  {bookingData.specialRequests || "No special requests"}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-yellow-900 mb-2">
                  Guest Notes
                </h3>
                <p className="text-sm text-gray-700">
                  {bookingData.guestNotes || "No guest notes"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Drawer */}
        <Drawer
          placement="right"
          open={isModalOpen}
          onClose={() => !isProcessingPayment && setIsModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Additional Services
            </div>
          }
          size="large"
          closable={!isProcessingPayment}
          maskClosable={!isProcessingPayment}
          footer={
            <div className="flex gap-3">
              <Button
                size="large"
                onClick={() => setIsModalOpen(false)}
                disabled={isProcessingPayment}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="large"
                type="primary"
                onClick={handleConfirmPayment}
                disabled={selectedServices.length === 0 || isProcessingPayment}
                loading={isProcessingPayment}
                icon={
                  !isProcessingPayment && <CreditCard className="w-4 h-4" />
                }
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 border-0"
              >
                {isProcessingPayment
                  ? "Processing..."
                  : `Proceed to Payment ${
                      totalSelectedValue > 0
                        ? formatCurrency(totalSelectedValue)
                        : ""
                    }`}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {isProcessingPayment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <Text className="text-blue-800 font-medium">
                    Processing your request...
                  </Text>
                </div>
              </div>
            )}

            <AdditionalServicesSelector
              selectedServices={selectedServices}
              setSelectedServices={setSelectedServices}
              onServicesChange={setSelectedServices}
              disabled={isProcessingPayment}
            />

            {selectedServices.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center">
                  <Text className="font-medium text-green-800">
                    Selected Services: {selectedServices.length}
                  </Text>
                  <Text className="font-bold text-green-800">
                    Total: {formatCurrency(totalSelectedValue)}
                  </Text>
                </div>
              </div>
            )}
          </div>
        </Drawer>
      </div>
    );
  }
);

export default BookingInformation;
