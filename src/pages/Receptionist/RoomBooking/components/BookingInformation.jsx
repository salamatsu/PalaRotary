import React, { useState } from "react";
import {
  Building,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  ShoppingCart,
  Receipt,
  Plus,
} from "lucide-react";
import { Button, Drawer, Empty, Modal, Typography } from "antd";
import AdditionalServicesSelector from "./AdditionalServicesSelector";

// StatusBadge component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "checked-in":
        return "bg-green-100 text-green-800";
      case "checked-out":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "applied":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-sm rounded-full font-medium capitalize ${getStatusColor(
        status
      )}`}
    >
      {status || "Unknown"}
    </span>
  );
};

const BookingInformation = ({ bookingData }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Not set";
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount, currency = "PHP") => {
    return `${currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="w-full mx-auto min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {/* Booking Reference */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Ref No# :{" "}
            <Typography.Text
              style={{ fontSize: "1.25rem", fontWeight: "bolder" }}
              strong
            >
              {bookingData.bookingReference}
            </Typography.Text>
          </h1>
          <div className="flex justify-center gap-4">
            <StatusBadge status={bookingData?.bookingStatus} />
            <StatusBadge status={bookingData?.paymentStatus} />
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-red-600" />
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
              <MapPin className="h-8 w-8 text-purple-600" />
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
              <Users className="h-8 w-8 text-green-600" />
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
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Duration</p>
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

            <div className="grid grid-cols-2 gap-4">
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
                    bookingData.balanceAmount > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {formatCurrency(bookingData.balanceAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Charges */}
        {/* {bookingData.additionalCharges && bookingData.additionalCharges.length > 0 && (
        )} */}
        <div className="bg-white rounded-xl flex flex-col gap-6 shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            Additional Charges
          </h2>
          {bookingData.additionalCharges.length > 0 ? (
            <div className="space-y-3">
              {bookingData.additionalCharges.map((charge) => (
                <div
                  key={charge.chargeId}
                  className="bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {charge.serviceName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {charge.itemDescription}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {charge.quantity} ×{" "}
                        {formatCurrency(charge.unitPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(charge.totalAmount)}
                      </p>
                      <StatusBadge status={charge.status} />
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
            <div className="text-center h-full flex items-center justify-center ">
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
          >
            <Plus /> ADD
          </Button>
        </div>

        {/* Payment History */}
        {/* {bookingData.payments && bookingData.payments.length > 0 && (
        )} */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-green-600" />
            Payment History
          </h2>

          <div className="space-y-3">
            {bookingData.payments.map((payment) => (
              <div
                key={payment.paymentId}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 capitalize">
                      {payment.paymentType.replace("_", " ")}
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
                  <div className="text-right">
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
          </div>
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
              <h3 className="font-medium text-orange-900 mb-2">Staff Notes</h3>
              <p className="text-sm text-gray-700">
                {bookingData.staffNotes || "None"}
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
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Primary Guest</p>
                    <p className="font-medium text-gray-900">
                      {bookingData.primaryGuestName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium text-gray-900">
                      {bookingData.primaryGuestContact || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
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
                {bookingData.specialRequests || "None"}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-900 mb-2">Guest Notes</h3>
              <p className="text-sm text-gray-700">
                {bookingData.guestNotes || "None"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        placement="right"
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Additional Services"
        width={"50%"}
        footer={
          <Button
            size="large"
            block
            type="primary"
            onClick={() => setIsModalOpen(false)}
          >
            PROCEED TO PAYMENT
          </Button>
        }
      >
        <AdditionalServicesSelector
          selectedServices={selectedServices}
          onServicesChange={setSelectedServices}
        />
      </Drawer>
    </div>
  );
};

export default BookingInformation;
