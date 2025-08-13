// HAS TAX 12%

import { InfoCircleFilled } from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  Drawer,
  Image,
  Input,
  InputNumber,
  Modal,
  notification,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  AlertCircle,
  Bed,
  Building,
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Gift,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useGetAllAdditionalServices } from "../../../services/requests/useAdditionalServices";
import {
  useAddBookingApi,
  useGetBookingByRoomIdApi,
} from "../../../services/requests/useBookings";
import { useGetPromotionByPromoCode } from "../../../services/requests/usePromotions";
import {
  useGetRoomsByBranch,
  useGetRoomsRates,
} from "../../../services/requests/useRooms";
import { useReceptionistAuthStore } from "../../../store/hotelStore";
import { formatCurrency } from "../../../utils/formatCurrency";
import { getCurrentDayType } from "../../../utils/formatDate";

const { Text, Title } = Typography;
const { Panel } = Collapse;

// Constants
const ROOM_STATUSES = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  CLEANING: "cleaning",
  MAINTENANCE: "maintenance",
  RESERVED: "reserved",
};

const STATUS_CONFIGS = {
  [ROOM_STATUSES.AVAILABLE]: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Available",
  },
  [ROOM_STATUSES.OCCUPIED]: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
    label: "Occupied",
  },
  [ROOM_STATUSES.CLEANING]: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Cleaning",
  },
  [ROOM_STATUSES.MAINTENANCE]: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Maintenance",
  },
  [ROOM_STATUSES.RESERVED]: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Clock className="w-4 h-4" />,
    label: "Reserved",
  },
};

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "gcash", label: "GCash" },
  { value: "paymaya", label: "PayMaya" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

// Enhanced Components
const StatusTag = memo(({ status }) => {
  const config = STATUS_CONFIGS[status];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
});

const PromoCodeInput = memo(
  ({ selectedRoom, onApplyPromo, appliedPromo, onRemovePromo }) => {
    const [promoCode, setPromoCode] = useState("");
    // const [isValidating, setIsValidating] = useState(false);
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
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-green-600" />
            <div>
              <Text strong className="text-green-800">
                {appliedPromo.promoCode}
              </Text>
              <div className="text-xs text-green-600">
                {appliedPromo.promoName}
              </div>
              {/* discount value */}
              <div className="text-xs text-green-600">
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
            icon={<XCircle className="w-3 h-3" />}
            onClick={onRemovePromo}
          >
            Remove
          </Button>
        </div>
      );
    }

    return (
      <div className=" flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            onPressEnter={handleApplyPromo}
            prefix={<Gift className="w-4 h-4 text-gray-400" />}
            allowClear
          />
          <Button
            type="primary"
            loading={getPromotionByPromoCode.isPending}
            onClick={handleApplyPromo}
            disabled={!promoCode.trim()}
          >
            Apply
          </Button>
        </div>
        {getPromotionByPromoCode.error && (
          <Alert
            message={getPromotionByPromoCode.error?.message}
            type="warning"
            closable
          />
        )}
      </div>
    );
  }
);

const AdditionalServicesSelector = memo(
  ({ selectedServices, onServicesChange }) => {
    const getAllAdditionalServices = useGetAllAdditionalServices();

    const handleServiceToggle = (service, checked) => {
      if (checked) {
        const newService = {
          ...service,
          quantity: 1,
          totalAmount: service.basePrice,
        };
        onServicesChange([...selectedServices, newService]);
      } else {
        onServicesChange(
          selectedServices.filter((s) => s.serviceId !== service.serviceId)
        );
      }
    };

    const handleQuantityChange = (serviceId, quantity) => {
      onServicesChange(
        selectedServices.map((service) =>
          service.serviceId === serviceId
            ? {
                ...service,
                quantity,
                totalAmount: service.basePrice * quantity,
              }
            : service
        )
      );
    };

    const isServiceSelected = (serviceId) => {
      return selectedServices.some((s) => s.serviceId === serviceId);
    };

    const getSelectedService = (serviceId) => {
      return selectedServices.find((s) => s.serviceId === serviceId);
    };

    // Loading
    if (getAllAdditionalServices.isPending)
      return (
        <div className="flex items-center justify-center">
          <Spin size="small" />
        </div>
      );
    return (
      <div className="space-y-3">
        {/* <div className="flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4 text-gray-600" />
          <Text strong>Additional Services</Text>
        </div> */}
        <div className=" space-y-3 max-h-[300px] overflow-auto">
          {getAllAdditionalServices.data.map((service) => {
            const isSelected = isServiceSelected(service.serviceId);
            const selectedService = getSelectedService(service.serviceId);

            return (
              <div key={service.serviceId} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) =>
                        handleServiceToggle(service, e.target.checked)
                      }
                    />
                    <div>
                      <Text strong>{service.serviceName}</Text>
                      <div className="text-xs text-gray-500 capitalize">
                        {service.serviceType}
                      </div>
                    </div>
                  </div>
                  <Text strong className="text-blue-600">
                    {formatCurrency(service.basePrice)}
                    {service.isPerItem == 1 ? "/item" : ""}
                  </Text>
                </div>

                {isSelected && service.isPerItem == 1 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Text className="text-sm">Quantity:</Text>
                    <InputNumber
                      min={1}
                      max={10}
                      value={selectedService?.quantity || 1}
                      onChange={(value) =>
                        handleQuantityChange(service.serviceId, value)
                      }
                      size="small"
                    />
                    <Text className="text-sm text-gray-500">
                      Total:{" "}
                      {formatCurrency(
                        selectedService?.totalAmount || service.basePrice
                      )}
                    </Text>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

const PaymentSummary = memo(
  ({ baseAmount, appliedPromo, selectedServices, taxRate = 0.12 }) => {
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
      const totalAmount = discountedSubtotal + taxAmount;

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
            <Text>Subtotal (VATable Sales)</Text>
            <Text className="font-semibold">
              {formatCurrency(calculations.subtotal)}
            </Text>
          </div>

          {appliedPromo && calculations.discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <div className="flex flex-col">
                <p className="text-xs">
                  Discount ({appliedPromo.promoCode})
                  {appliedPromo.promoType === "percentage" &&
                    ` - ${appliedPromo.discountValue}%`}
                </p>
              </div>
              <span className="font-semibold text-red-600">
                -{formatCurrency(calculations.discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm text-gray-600">
            <Text>VAT ({(taxRate * 100).toFixed(0)}%)</Text>
            <Text className="font-semibold">
              {formatCurrency(calculations.taxAmount)}
            </Text>
          </div>

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
  }
);

const BookingModal = memo(
  ({
    loading = false,
    open,
    selectedRoom,
    selectedRate,
    bookingDetails,
    appliedPromo,
    selectedServices,
    onClose,
    onConfirm,
  }) => {
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [isProcessing, setIsProcessing] = useState(false);

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

    const taxAmount = (subtotal - discountAmount) * 0.12;

    const totalAmount = subtotal - discountAmount + taxAmount;

    const handleConfirmPayment = () => {
      setIsProcessing(true);

      const bookingData = {
        room: selectedRoom,
        rate: selectedRate,
        details: bookingDetails,
        promo: appliedPromo,
        services: selectedServices,
        payment: {
          method: paymentMethod,
          baseAmount,
          discountAmount,
          taxAmount,
          totalAmount,
        },
      };

      // Simulate payment processing
      // setTimeout(() => {
      onConfirm(bookingData);
      setIsProcessing(false);
      // }, 2000);
    };

    return (
      <Modal
        open={open}
        centered
        width={600}
        closeIcon={false}
        footer={
          <div className="flex gap-3">
            <Button
              block
              size="large"
              onClick={onClose}
              disabled={isProcessing || loading}
            >
              Cancel
            </Button>
            <Button
              block
              size="large"
              type="primary"
              loading={isProcessing || loading}
              onClick={handleConfirmPayment}
              icon={<CreditCard className="w-4 h-4" />}
            >
              {isProcessing || loading
                ? "Processing Payment..."
                : `Pay ${formatCurrency(totalAmount)}`}
            </Button>
          </div>
        }
      >
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
      </Modal>
    );
  }
);

const BookingForm = memo(
  ({ selectedRoom, bookingDetails, onBookingChange, onBook }) => {
    const [selectedRate, setSelectedRate] = useState(null);
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);

    const getRoomsRates = useGetRoomsRates(
      selectedRoom.roomTypeId,
      selectedRoom.branchId
    );

    useEffect(() => {
      setSelectedRate(null);
      setAppliedPromo(null);
    }, [selectedRoom]);

    const handleBookClick = useCallback(() => {
      if (!selectedRate) {
        notification.error({
          message: "Rate Required",
          description: "Please select a rate before booking.",
        });
        return;
      }
      onBook(selectedRate, appliedPromo, selectedServices);
    }, [selectedRate, appliedPromo, selectedServices, onBook]);

    const currentDayType =
      dayjs().day() === 0 || dayjs().day() === 6 ? "weekend" : "weekday";

    return (
      <>
        <div className=" grid grid-cols-12 gap-6 h-full">
          <Card size="small" className="col-span-4">
            {/* Room Image and Details */}
            <div className="mb-6">
              <Image
                src={selectedRoom?.imageUrl}
                alt={selectedRoom?.roomTypeName}
                className="w-full h-32 object-cover rounded-lg mb-3"
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIj5Sb29tIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
              />
              <h3 className="text-lg font-medium text-gray-900">
                {selectedRoom?.roomTypeName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedRoom?.description}
              </p>
            </div>
            {/* Guest Count */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Number of Guests
              </label>
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                max={selectedRoom?.maxOccupancy || 2}
                value={bookingDetails.guests}
                onChange={(value) => onBookingChange("guests", value)}
                size="large"
                controls
              />
            </div>
          </Card>
          <Card size="small" className="col-span-4">
            <div className="space-y-6">
              {/* Rate Selection */}
              <div className=" space-y-3 mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 ">
                  <CreditCard className="w-4 h-4" />
                  Select Rate
                </label>
                {/* <Input.Search
                placeholder="Find a rate"
                onInput={setSearchRoomRate}
                allowClear
              /> */}

                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {/* filter by is weekday or weekend */}
                  {getRoomsRates.data
                    .filter(
                      ({ dayType }) =>
                        dayType === "all" || dayType === currentDayType
                    )
                    .map((rate) => (
                      <div
                        key={rate.rateId}
                        className={`border rounded-lg p-2 cursor-pointer transition-all hover:bg-red-50 ${
                          selectedRate?.rateId === rate.rateId
                            ? "border-red-500 ring-2 ring-red-200 bg-red-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => setSelectedRate(rate)}
                      >
                        <div className="flex justify-between items-center">
                          <div className=" flex flex-col space-y-0">
                            <span className="font-medium text-gray-900">
                              {rate.rateTypeName}
                            </span>
                            <small className=" text-gray-500">
                              {rate.duration} hour{rate.duration > 1 && "s"}
                            </small>
                          </div>
                          <div className="text-right flex flex-col space-y-0">
                            <span className="text-lg font-bold text-red-600">
                              {formatCurrency(rate.baseRate * rate.duration)}
                            </span>
                            <small className=" text-gray-500">
                              {formatCurrency(rate.baseRate)} / hour
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Gift className="w-4 h-4" />
                  Promo Code
                </label>
                <PromoCodeInput
                  selectedRoom={selectedRoom}
                  onApplyPromo={setAppliedPromo}
                  appliedPromo={appliedPromo}
                  onRemovePromo={() => setAppliedPromo(null)}
                />
              </div>
            </div>
          </Card>
          <Card size="small" className="col-span-4">
            <div className="space-y-6">
              {/* Additional Services */}
              <Collapse ghost className="mb-6">
                <Panel
                  header={
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <b>Additional Services</b>
                      {selectedServices.length > 0 && (
                        <Tag color="blue">
                          {selectedServices.length} selected
                        </Tag>
                      )}
                    </div>
                  }
                  key="services"
                >
                  <AdditionalServicesSelector
                    selectedServices={selectedServices}
                    onServicesChange={setSelectedServices}
                  />
                </Panel>
              </Collapse>
              {/* Payment Summary */}
              {selectedRate && (
                <PaymentSummary
                  baseAmount={selectedRate.baseRate * selectedRate.duration}
                  appliedPromo={appliedPromo}
                  selectedServices={selectedServices}
                />
              )}

              {/* Book Button */}
              <Button
                block
                size="large"
                type="primary"
                disabled={!selectedRate}
                onClick={handleBookClick}
                icon={<Calculator className="w-4 h-4" />}
              >
                {selectedRate ? `Book Now` : "Select a Rate to Continue"}
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }
);

const RoomCard = memo(({ room, isSelected, onSelect }) => {
  const isAvailable = room.roomStatus === ROOM_STATUSES.AVAILABLE;

  return (
    <div
      className={` min-w-[250px] bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow-md hover:scale-105 hover:border-red-400 duration-500 ${
        isSelected ? "border-red-500 ring-2 ring-red-200" : "border-gray-200"
      } ${!isAvailable ? "opacity-75" : ""}`}
      onClick={() => onSelect(room)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Room {room.roomNumber}
          </h3>
          <StatusTag status={room.roomStatus} />
        </div>

        <div className="space-y-2">
          <p className="font-medium text-gray-900">{room.roomTypeName}</p>
          <div className="flex items-center gap-2 text-gray-600">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{room.bedConfiguration}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">Max {room.maxOccupancy} guests</span>
          </div>
          <p className="text-sm text-gray-600">
            Room size: {room.roomSize} sqm{" "}
          </p>
        </div>
      </div>
    </div>
  );
});

const getStatusColor = (status) => {
  const colors = {
    confirmed: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    paid: "bg-blue-100 text-blue-800 border-blue-200",
    unpaid: "bg-red-100 text-red-800 border-red-200",
    partial: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const StatusBadge = ({ status, type = "default" }) => (
  <span
    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
      status
    )}`}
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const BookingCard = memo(({ booking: bookingData }) => {
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
    <div className=" w-full mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Branch</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            Payment Details
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
                <p className="text-sm text-gray-600">Service Charges</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(bookingData.serviceChargesAmount)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tax Amount</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(bookingData.taxAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
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
      </div>
    </div>
  );
});

const CurrentBookedRoom = memo(({ room, onSelect }) => {
  const getBookingByRoomIdApi = useGetBookingByRoomIdApi(room?.roomId);

  return (
    <Drawer
      placement="right"
      open={!!room}
      onClose={() => onSelect(null)}
      width={"80%"}
      closeIcon={null}
      title={
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Details
          </h1>
          <p className="text-lg text-gray-600 font-mono">
            Ref. #:{" "}
            <Typography.Text
              copyable
              style={{ fontSize: "1.25rem", fontWeight: "bold" }}
            >
              {getBookingByRoomIdApi.data?.bookingReference}
            </Typography.Text>
          </p>
        </div>
      }
      extra={
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <StatusBadge status={getBookingByRoomIdApi.data?.bookingStatus} />
          <StatusBadge status={getBookingByRoomIdApi.data?.paymentStatus} />
        </div>
      }
      footer={
        <div className=" flex justify-between items-center">
          <div>
            <Button danger key={"cancel"} onClick={() => onSelect(null)}>
              CLOSE
            </Button>
          </div>
          <Space>
            <Button type="primary" key={"check-in"}>
              Check In
            </Button>
            <Button key={"edit"}>Edit Booking</Button>
            <Button key={"print"}>Print Receipt</Button>
            <Button danger key={"cancel"}>
              Cancel Booking
            </Button>
          </Space>
        </div>
        // <Space size="large">
        //   <Button type="primary" >
        //     Check In
        //   </Button>
        //   <Button >Edit Booking</Button>
        //   <Button >Print Receipt</Button>
        //   <Button danger >
        //     Cancel Booking
        //   </Button>
        // </Space>
      }
    >
      <div className=" flex flex-col gap-4">
        {getBookingByRoomIdApi.data && (
          <BookingCard booking={getBookingByRoomIdApi.data} />
        )}
      </div>
    </Drawer>
  );
});

const useFilters = () => {
  const [filters, setFilters] = useState({
    floor: "all",
    roomType: "all",
    status: "all",
  });

  const updateFilter = useCallback((filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  }, []);

  return [filters, updateFilter];
};

const RoomBooking = () => {
  const [filters, updateFilter] = useFilters();
  const { userData } = useReceptionistAuthStore();
  const { message } = App.useApp();

  const [selectedRoom, setSelectedRoom] = useState(null);

  const [selectedRoomNotAvailable, setSelectedRoomNotAvailable] =
    useState(null);

  const [bookingDetails, setBookingDetails] = useState({
    dayType: getCurrentDayType(),
    guests: 2,
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentBookingData, setCurrentBookingData] = useState(null);

  const addBookingApi = useAddBookingApi();
  const getRoomsByBranch = useGetRoomsByBranch(userData.branchId);

  const handleRoomSelect = useCallback((room) => {
    if (room.roomStatus === ROOM_STATUSES.AVAILABLE) {
      setSelectedRoom(room);
      return;
    }

    const statusMessages = {
      [ROOM_STATUSES.MAINTENANCE]:
        "Room is currently under maintenance and cannot be booked.",
      [ROOM_STATUSES.CLEANING]:
        "Room is currently being cleaned. Please wait until cleaning is complete.",
      [ROOM_STATUSES.OCCUPIED]: "Room is currently occupied by another guest.",
      [ROOM_STATUSES.RESERVED]:
        "Room is currently reserved. Please select another room.",
    };

    const messageInfo =
      statusMessages[room.roomStatus] || "Room is not available for booking.";
    message.warning(messageInfo);

    // notification.error({
    //   message: "Room Unavailable",
    //   description: message,
    // });
    setSelectedRoomNotAvailable(room);
  }, []);

  const handleBookingChange = useCallback((field, value) => {
    setBookingDetails((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBookRoom = useCallback(
    (selectedRate, appliedPromo, selectedServices) => {
      setCurrentBookingData({
        selectedRate,
        appliedPromo,
        selectedServices,
      });
      setShowBookingModal(true);
    },
    []
  );

  const handleConfirmBooking = useCallback(
    (bookingData) => {
      // Generate booking reference
      const bookingReference = `BK${Date.now().toString().slice(-8)}`;
      console.log(bookingData);

      // Prepare booking payload for API
      const bookingPayload = {
        bookingReference,
        branchId: selectedRoom.branchId,
        roomId: selectedRoom.roomId,
        roomTypeId: selectedRoom.roomTypeId,
        rateId: bookingData.rate.rateId,
        rateTypeId: bookingData.rate.rateTypeId,
        promoId: bookingData.promo ? bookingData.promo.promoId : null,
        numberOfGuests: bookingDetails.guests,
        checkInDateTime: new Date().toISOString(),
        stayDuration: bookingData.rate.duration,
        // stayDurationType: bookingData.rate.durationType || 'hour',
        bookingStatus: "confirmed",
        paymentStatus: "paid",
        baseAmount: bookingData.payment.baseAmount,
        discountAmount: bookingData.payment.discountAmount,
        taxAmount: bookingData.payment.taxAmount,
        totalAmount: bookingData.payment.totalAmount,
        currency: "PHP",
        paymentMethod: bookingData.payment.method,
        source: "walk-in",
        createdBy: userData.userId,
      };

      // Prepare additional charges payload
      const additionalCharges = bookingData.services.map((service) => ({
        serviceId: service.serviceId,
        chargeType: service.serviceType,
        itemDescription: service.serviceName,
        quantity: service.quantity || 1,
        unitPrice: service.basePrice,
        totalAmount: service.totalAmount,
        appliedAt: new Date().toISOString(),
        appliedBy: userData.userId,
        status: "applied",
      }));

      const body = {
        ...bookingPayload,
        additionalCharges,
      };

      console.log("booking", body);

      addBookingApi.mutate(body, {
        onSuccess: (response) => {
          console.log(response);
          // Simulate API success
          notification.success({
            message: "Booking Confirmed!",
            description: `Booking ${bookingReference} has been created successfully. Room ${selectedRoom.roomNumber} is now occupied.`,
            duration: 5,
          });

          // Update room status locally (in real app, this would come from API response)
          setSelectedRoom((prev) => ({
            ...prev,
            roomStatus: ROOM_STATUSES.OCCUPIED,
          }));

          // Reset form
          setShowBookingModal(false);
          setSelectedRoom(null);
          setBookingDetails({
            dayType: getCurrentDayType(),
            guests: 2,
          });
          setCurrentBookingData(null);
          getRoomsByBranch.refetch();
        },
        onError: (error) => {
          console.log(error);
        },
      });
    },
    [selectedRoom, bookingDetails]
  );

  const availableRooms = getRoomsByBranch.data.filter(
    (room) => room.roomStatus === ROOM_STATUSES.AVAILABLE
  );

  const roomTypes = getRoomsByBranch.data.reduce(
    (acc, { roomTypeName, roomTypeId }) => {
      if (!acc.find((item) => item.roomTypeId === roomTypeId)) {
        acc.push({ roomTypeName, roomTypeId });
      }
      return acc;
    },
    []
  );

  const filteredRooms = useMemo(
    () =>
      getRoomsByBranch.data
        .filter(
          (room) => filters.floor === "all" || room.floor === filters.floor
        )
        .filter(
          (room) =>
            filters.roomType === "all" ||
            room.roomTypeId === parseInt(filters.roomType)
        )
        .filter(
          (room) =>
            filters.status === "all" || room.roomStatus === filters.status
        )
        .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)),
    [getRoomsByBranch.data, filters]
  );

  const groupedRooms = useMemo(
    () =>
      filteredRooms.reduce((acc, room) => {
        if (!acc[room.floor]) acc[room.floor] = [];
        acc[room.floor].push(room);
        return acc;
      }, {}),
    [filteredRooms]
  );

  const availableFloors = useMemo(
    () => [...new Set(getRoomsByBranch.data.map((room) => room.floor))].sort(),
    [getRoomsByBranch.data]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex">
      <div className="w-11/12 mx-auto space-y-6 ">
        <div className=" flex flex-row gap-6">
          <div className=" flex-1 flex-col gap-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Room Booking
              </h1>
              <p className="text-gray-600">
                Book rooms with promo codes, additional services, and integrated
                payment
              </p>
            </div>

            {/* Room Statistics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Room Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {getRoomsByBranch.data.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Rooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      getRoomsByBranch.data.filter(
                        (r) => r.roomStatus === ROOM_STATUSES.AVAILABLE
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      getRoomsByBranch.data.filter(
                        (r) => r.roomStatus === ROOM_STATUSES.OCCUPIED
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Occupied</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      getRoomsByBranch.data.filter(
                        (r) => r.roomStatus === ROOM_STATUSES.RESERVED
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Reserved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      getRoomsByBranch.data.filter(
                        (r) => r.roomStatus === ROOM_STATUSES.CLEANING
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Cleaning</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder */}
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            {/* <Bed className="w-12 h-12 mx-auto mb-4 text-gray-300" /> */}
            <h3 className="text-lg font-medium text-gray-900 mb-2 italic space-x-4">
              <InfoCircleFilled /> Selecting a Room
            </h3>
            <p className="text-gray-600 mb-4">
              Choose an available room to start the booking process
            </p>
            <div className="space-y-2 text-sm text-gray-500 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Apply promo codes for discounts</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Add extra services and amenities</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-500" />
                <span>Multiple payment methods supported</span>
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-500" />
                <span>Detailed payment breakdown</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className=" flex flex-row gap-3">
            <div className=" flex flex-row gap-1 items-center grow">
              <nobr>
                <Text strong>Floor</Text>
              </nobr>
              <Select
                value={filters.floor}
                onChange={(value) => updateFilter("floor", value)}
                className="w-full"
                options={[
                  { value: "all", label: "All Floors" },
                  ...availableFloors.map((floor) => ({
                    value: floor,
                    label: `${floor}st Floor`,
                  })),
                ]}
              />
            </div>
            <div className=" flex flex-row gap-1 items-center grow">
              <nobr>
                <Text strong>Room Type</Text>
              </nobr>
              <Select
                value={filters.roomType}
                onChange={(value) => updateFilter("roomType", value)}
                className="w-full"
                loading={getRoomsByBranch.isPending}
                options={[
                  { value: "all", label: "All Room Types" },
                  ...roomTypes.map(({ roomTypeName, roomTypeId }) => ({
                    value: roomTypeId,
                    label: roomTypeName,
                  })),
                ]}
              />
            </div>
            <div className=" flex flex-row gap-1 items-center grow">
              <nobr>
                <Text strong>Status</Text>
              </nobr>
              <Select
                value={filters.status}
                onChange={(value) => updateFilter("status", value)}
                className="w-full"
                options={[
                  { value: "all", label: "All Status" },
                  ...Object.entries(STATUS_CONFIGS).map(([status, config]) => ({
                    value: status,
                    label: config.label,
                  })),
                ]}
              />
            </div>
          </div>
        </div>

        {/* Room Grid */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Available Rooms ({availableRooms.length})
            </h2>
            <div className="flex items-center gap-4 text-xs">
              {Object.entries(STATUS_CONFIGS).map(([status, config]) => (
                <div key={status} className="flex items-center gap-1">
                  {config.icon}
                  <span className="text-gray-600">{config.label}</span>
                </div>
              ))}
            </div>
          </div>

          {
            getRoomsByBranch.data.length === 0 ? (
              <div className="text-center py-8">
                <Bed className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No rooms available</p>
              </div>
            ) : Object.keys(groupedRooms).length === 0 ? (
              <div className="text-center py-8">
                <Text type="secondary">
                  No rooms match your current filters
                </Text>
              </div>
            ) : (
              Object.keys(groupedRooms)
                .sort()
                .map((floor) => (
                  <div key={floor} className="mb-6">
                    <Title level={4} className="mb-3">
                      Floor {floor}
                      <Text
                        type="secondary"
                        className="ml-2 text-base font-normal"
                      >
                        ({groupedRooms[floor].length} rooms)
                      </Text>
                    </Title>

                    <div className="flex flex-row flex-wrap gap-4">
                      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                      {groupedRooms[floor].map((room) => (
                        <RoomCard
                          key={room.roomId}
                          room={room}
                          isSelected={selectedRoom?.roomId === room.roomId}
                          onSelect={handleRoomSelect}
                        />
                      ))}
                    </div>
                  </div>
                ))
            )
            // <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            //   {/* {rooms.map((room) => (
            //     <RoomCard
            //       key={room.roomId}
            //       room={room}
            //       isSelected={selectedRoom?.roomId === room.roomId}
            //       onSelect={handleRoomSelect}
            //     />
            //   ))} */}
            // </div>
          }
        </div>

        {/* Booking Panel */}
        <Drawer
          open={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          height={"95%"}
          placement="bottom"
          title={
            <h2 className="text-xl font-bold text-gray-900 ">
              Book Room {selectedRoom?.roomNumber}
            </h2>
          }
        >
          <div className="lg:col-span-1">
            {selectedRoom ? (
              <BookingForm
                selectedRoom={selectedRoom}
                bookingDetails={bookingDetails}
                onBookingChange={handleBookingChange}
                onBook={handleBookRoom}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <Bed className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Room
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose an available room to start the booking process
                </p>
                <div className="space-y-2 text-sm text-gray-500 text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Apply promo codes for discounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-500" />
                    <span>Add extra services and amenities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-500" />
                    <span>Multiple payment methods supported</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-orange-500" />
                    <span>Detailed payment breakdown</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Drawer>

        {/* Booking Modal */}
        {showBookingModal && currentBookingData && (
          <BookingModal
            loading={addBookingApi.isPending}
            open={showBookingModal}
            selectedRoom={selectedRoom}
            selectedRate={currentBookingData.selectedRate}
            bookingDetails={bookingDetails}
            appliedPromo={currentBookingData.appliedPromo}
            selectedServices={currentBookingData.selectedServices}
            onClose={() => {
              setShowBookingModal(false);
              setCurrentBookingData(null);
            }}
            onConfirm={handleConfirmBooking}
          />
        )}
        <CurrentBookedRoom
          room={selectedRoomNotAvailable}
          onSelect={setSelectedRoomNotAvailable}
        />

        {/* Available Promotions Info */}
        {/* <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-purple-600" />
            <Text strong className="text-purple-800">
              Available Promotions
            </Text>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockPromotions
              .filter((p) => p.isActive)
              .map((promo) => (
                <div
                  key={promo.promoId}
                  className="bg-white rounded-lg p-3 border border-purple-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Text strong className="text-purple-700">
                      {promo.promoCode}
                    </Text>
                    <Tag color="purple">
                      {promo.promoType === "percentage"
                        ? `${promo.discountValue}% OFF`
                        : `₱${promo.discountValue} OFF`}
                    </Tag>
                  </div>
                  <Text className="text-sm text-gray-600">
                    {promo.promoName}
                  </Text>
                  <div className="text-xs text-gray-500 mt-1">
                    Min. stay: {promo.minimumStayHours} hours
                  </div>
                </div>
              ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default RoomBooking;
