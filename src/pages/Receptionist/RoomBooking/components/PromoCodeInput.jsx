import { Alert, App, Button, Input, Typography } from "antd";
import { Gift, XCircle } from "lucide-react";
import { useState } from "react";
import { useGetPromotionByPromoCode } from "../../../../services/requests/usePromotions";
import { formatCurrency } from "../../../../utils/formatCurrency";

const { Text } = Typography;

const PromoCodeInput = ({
  selectedRoom,
  onApplyPromo,
  appliedPromo,
  onRemovePromo,
}) => {
  const { notification } = App.useApp();
  const [promoCode, setPromoCode] = useState("");
  const getPromotionByPromoCode = useGetPromotionByPromoCode();

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      notification.error({
        message: "Invalid Promo Code",
        description: "Please enter a promo code",
      });
      return;
    }

    getPromotionByPromoCode.mutate(
      {
        promoCode,
        roomTypeId: selectedRoom.roomTypeId,
      },
      {
        onSuccess: ({ data }) => {
          if (data) {
            onApplyPromo(data);
            setPromoCode("");
            notification.success({
              message: "Promo Applied!",
              description: `${data.promoName} has been applied successfully`,
            });
          } else {
            notification.error({
              message: "Invalid Promo Code",
              description:
                "The promo code you entered is not valid or has expired",
            });
          }
        },
        onError: (error) => {
          notification.error({
            message: "Invalid Promo Code",
            description: error.message,
          });
        },
      }
    );
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Gift className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <Text strong className="text-green-800 text-base">
              {appliedPromo.promoName}
            </Text>
            <div className="text-sm text-green-600">
              Discount:{" "}
              {appliedPromo.promoType === "percentage"
                ? `${appliedPromo.discountValue}%`
                : formatCurrency(appliedPromo.discountValue)}
            </div>
          </div>
        </div>
        <Button
          size="small"
          type="text"
          danger
          icon={<XCircle className="w-4 h-4" />}
          onClick={onRemovePromo}
          className="hover:bg-red-50"
        >
          Remove
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          onPressEnter={handleApplyPromo}
          prefix={<Gift className="w-4 h-4 text-gray-400" />}
          allowClear
          className="rounded-lg"
        />
        <Button
          type="primary"
          loading={getPromotionByPromoCode.isPending}
          onClick={handleApplyPromo}
          disabled={!promoCode.trim()}
          className="rounded-lg px-6"
        >
          Apply
        </Button>
      </div>
      {getPromotionByPromoCode.error && (
        <Alert
          message={getPromotionByPromoCode.error?.message}
          type="warning"
          closable
          className="rounded-lg"
        />
      )}
    </div>
  );
};

export default PromoCodeInput;
