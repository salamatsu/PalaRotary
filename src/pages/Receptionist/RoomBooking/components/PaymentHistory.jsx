import React, { useState } from "react";
import {
  Modal,
  Button,
  Empty,
  Tag,
  Divider,
  Space,
  Card,
  Row,
  Col,
} from "antd";
import { Receipt, Eye, Clock, User, CreditCard, FileText } from "lucide-react";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { formatDateTime } from "../../../../utils/formatDate";

const PaymentHistory = ({ bookingData }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: { color: "success", text: "Completed" },
      pending: { color: "warning", text: "Pending" },
      failed: { color: "error", text: "Failed" },
      cancelled: { color: "default", text: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Tag color={config.color} className="text-xs">
        {config.text}
      </Tag>
    );
  };

  const PaymentCard = ({ payment, isCompact = false }) => (
    <div className={`bg-gray-50 p-4 rounded-lg ${isCompact ? "mb-3" : "mb-4"}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900 capitalize text-sm sm:text-base">
              {payment.paymentType?.replace("_", " ")}
            </h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={payment.paymentStatus} />
              {/* {!isCompact && (
                <Tag color="blue" className="text-xs capitalize">
                  {payment.paymentMethod}
                </Tag>
              )} */}
            </div>
          </div>

          <div className="space-y-1">
            {!isCompact && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <CreditCard className="h-3 w-3" />
                <span className="capitalize">
                  {payment.paymentMethod} • {payment.paymentCategory}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatDateTime(payment.paymentDateTime)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <User className="h-3 w-3" />
              <span>
                Processed by:{" "}
                {payment.processedByUsername || payment.processedBy}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right sm:ml-4 flex-shrink-0">
          <p className="font-semibold text-green-700 text-base sm:text-lg">
            {formatCurrency(payment.amount)}
          </p>
          {isCompact && (
            <div className="mt-1">
              <StatusBadge status={payment.paymentStatus} />
            </div>
          )}
        </div>
      </div>

      {payment.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>Note: {payment.notes}</span>
          </div>
        </div>
      )}
    </div>
  );

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Get top 3 payments
  const topPayments = bookingData.payments?.slice(0, 3) || [];
  const hasMorePayments = (bookingData.payments?.length || 0) > 3;

  // Calculate totals
  const totalAmount =
    bookingData.payments?.reduce((sum, payment) => sum + payment.amount, 0) ||
    0;
  const pendingAmount =
    bookingData.payments?.reduce(
      (sum, payment) =>
        sum + (payment.paymentStatus === "pending" ? payment.amount : 0),
      0
    ) || 0;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <span className="hidden xs:inline">Payment History</span>
            <span className="xs:hidden">Payments</span>
          </h2>

          {hasMorePayments && (
            <Button
              type="link"
              onClick={showModal}
              className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium text-sm"
            >
              View All ({bookingData.payments?.length})
            </Button>
          )}
        </div>

        {topPayments.length > 0 ? (
          <div className="space-y-3">
            {/* Top 3 Payments */}
            <div className="space-y-3">
              {topPayments.map((payment) => (
                <PaymentCard
                  key={payment.paymentId}
                  payment={payment}
                  isCompact
                />
              ))}
            </div>

            {/* View All Button for Mobile */}
            {hasMorePayments && (
              <div className="pt-3 sm:hidden">
                <Button
                  type="default"
                  onClick={showModal}
                  icon={<Eye className="h-4 w-4" />}
                  block
                  className="border-dashed"
                >
                  View All Payments ({bookingData.payments?.length})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Empty
            description={
              <span className="text-gray-500 text-sm">
                No payment history available
              </span>
            }
            className="py-8"
          />
        )}
      </div>

      {/* All Payments Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-green-600" />
            <span>All Payment History</span>
            <Tag color="blue" className="ml-2">
              {bookingData.payments?.length || 0} payments
            </Tag>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: "800px" }}
        className="payment-history-modal"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {bookingData.payments?.length > 0 ? (
            <div className="space-y-4">
              {/* All Payments */}
              <div className="space-y-4">
                {bookingData.payments.map((payment, index) => (
                  <div key={payment.paymentId}>
                    <PaymentCard payment={payment} />
                    {index < bookingData.payments.length - 1 && (
                      <Divider className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Empty
              description="No payment history available"
              className="py-12"
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default PaymentHistory;
