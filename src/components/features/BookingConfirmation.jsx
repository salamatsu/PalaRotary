import { Card, Select, Typography } from "antd";
import { PAYMENT_METHODS } from "../../lib/constants";
import PaymentSummary from "./PaymentSummary";

const { Text } = Typography;
const BookingConfirmation = ({
  selectedRoom,
  selectedRate,
  bookingDetails,
  appliedPromo,
  selectedServices,
  paymentMethod,
  setPaymentMethod,
}) => {
  if (!selectedRoom || !selectedRate) return null;

  const baseAmount = selectedRate.baseRate * selectedRate.duration;
  const servicesTotal = selectedServices.reduce(
    (sum, service) => sum + service.totalAmount,
    0
  );
  const subtotal = baseAmount + servicesTotal;

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.promoType === "percentage") {
      discountAmount = (subtotal * appliedPromo.discountValue) / 100;
    } else {
      discountAmount = Math.min(appliedPromo.discountValue, subtotal);
    }
  }
  return (
    <div className="space-y-4">
      <div className="text-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Confirm Booking & Payment
        </h2>
        <Text className="text-gray-600">
          Review your booking details and complete payment
        </Text>
      </div>

      {/* Booking Details */}
      <Card size="small" title="Booking Details">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Text className="text-gray-600">Room:</Text>
            <div className="font-medium">
              {selectedRoom.roomNumber} - {selectedRoom.roomTypeName}
            </div>
          </div>
          <div>
            <Text className="text-gray-600">Guests:</Text>
            <div className="font-medium">{bookingDetails.guests}</div>
          </div>
          <div>
            <Text className="text-gray-600">Rate:</Text>
            <div className="font-medium">{selectedRate.rateTypeName}</div>
          </div>
          <div>
            <Text className="text-gray-600">Duration:</Text>
            <div className="font-medium">{selectedRate.duration}</div>
          </div>
        </div>
      </Card>

      {/* Payment Method */}
      <Card size="small" title="Payment Method">
        <Select
          value={paymentMethod}
          onChange={setPaymentMethod}
          className="w-full"
          options={PAYMENT_METHODS}
        />
      </Card>

      {/* Payment Summary */}
      <PaymentSummary
        baseAmount={baseAmount}
        appliedPromo={appliedPromo}
        selectedServices={selectedServices}
      />
    </div>
  );
};

export default BookingConfirmation;
