import { Divider, Typography } from "antd";
import { Receipt } from "lucide-react";
import { useMemo } from "react";
import { formatCurrency } from "../../utils/formatCurrency";

const { Text } = Typography

const PaymentSummary = ({
  baseAmount,
  appliedPromo,
  selectedServices,
  taxRate = 0.12,
}) => {
  const calculations = useMemo(() => {
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

    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * taxRate;
    // const totalAmount = discountedSubtotal + taxAmount;
    const totalAmount = discountedSubtotal;

    return {
      baseAmount,
      servicesTotal,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    };
  }, [baseAmount, appliedPromo, selectedServices, taxRate]);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="w-4 h-4 text-gray-600" />
        <Text strong>Payment Summary</Text>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Text>Room Rate</Text>
          <Text className="font-semibold">
            {formatCurrency(calculations.baseAmount)}
          </Text>
        </div>

        {selectedServices.length > 0 && (
          <>
            <div className="flex justify-between">
              <Text>Additional Services</Text>
              <Text className="font-semibold">
                {formatCurrency(calculations.servicesTotal)}
              </Text>
            </div>
            <div className="ml-4 space-y-1">
              {selectedServices.map((service) => (
                <div
                  key={service.serviceId}
                  className="grid grid-cols-12 text-sm text-gray-600"
                >
                  <div className=" col-span-9">
                    <Text>
                      {service.serviceName}
                      {service.isPerItem == 1 && ` × ${service.quantity}`}
                    </Text>
                  </div>
                  <div className="col-span-3 text-left">
                    <Text>{formatCurrency(service.totalAmount)}</Text>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-between">
          <Text>Subtotal</Text>
          {/* <Text>Subtotal (VATable Sales)</Text> */}
          <Text className="font-semibold">
            {formatCurrency(calculations.subtotal)}
          </Text>
        </div>

        {appliedPromo && calculations.discountAmount > 0 && (
          <div className="flex justify-between text-red-600">
            <div className="flex flex-col">
              <p className="text-xs">
                Discount
                {/* ({appliedPromo.promoCode}) */}
              </p>
              <small>
                {appliedPromo.promoName || "Promo Code"}{" "}
                {appliedPromo.promoType === "percentage" &&
                  ` - ${appliedPromo.discountValue}%`}
              </small>
            </div>
            <span className="font-semibold text-red-600">
              -{formatCurrency(calculations.discountAmount)}
            </span>
          </div>
        )}

        {/* <div className="flex justify-between text-sm text-gray-600">
            <Text>VAT ({(taxRate * 100).toFixed(0)}%)</Text>
            <Text className="font-semibold">
              {formatCurrency(calculations.taxAmount)}
            </Text>
          </div> */}

        <Divider className="my-2" />

        <div className="flex justify-between">
          <Text strong className="text-lg">
            Total Amount
          </Text>
          <Text strong className="text-lg text-blue-600">
            {formatCurrency(calculations.totalAmount)}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
