// HAS TAX 12%

import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  InfoCircleFilled,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Checkbox,
  Collapse,
  Descriptions,
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
  Calculator,
  CheckCircle,
  Clock,
  CreditCard,
  Gift,
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
import { formatDateTime, getCurrentDayType } from "../../../utils/formatDate";

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
          discountAmount = (baseAmount * appliedPromo.discountValue) / 100;
        } else {
          discountAmount = Math.min(appliedPromo.discountValue, baseAmount);
        }
      }

      const totalAmount = subtotal - discountAmount;
      const taxAmount = totalAmount * taxRate;
      // const totalAmount = discountedSubtotal + taxAmount;

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
            <Text className="font-semibold">{formatCurrency(calculations.baseAmount)}</Text>
          </div>

          {selectedServices.length > 0 && (
            <>
              <div className="flex justify-between">
                <Text>Additional Services</Text>
                <Text className="font-semibold">{formatCurrency(calculations.servicesTotal)}</Text>
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
                      <Text >{formatCurrency(service.totalAmount)}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-between">
            <Text>Subtotal</Text>
            <Text className="font-semibold">{formatCurrency(calculations.subtotal)}</Text>
          </div>

          {appliedPromo && calculations.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <div className="flex flex-col">
                <p className="text-xs">
                  Discount ({appliedPromo.promoCode})
                  {appliedPromo.promoType === "percentage" &&
                    ` - ${appliedPromo.discountValue}%`}
                </p>
                {appliedPromo.promoType === "percentage" && (
                  <small className="text-[10px]">Based on room rate</small>
                )}
              </div>
              <Text>-{formatCurrency(calculations.discountAmount)}</Text>
            </div>
          )}

          {/* <div className="flex justify-between text-sm text-gray-600">
            <Text>Tax ({(taxRate * 100).toFixed(0)}%)</Text>
            <Text>{formatCurrency(calculations.taxAmount)}</Text>
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
        discountAmount = (baseAmount * appliedPromo.discountValue) / 100;
      } else {
        discountAmount = Math.min(appliedPromo.discountValue, baseAmount);
      }
    }

    const taxAmount = (baseAmount - discountAmount) * 0.12;

    const totalAmount = subtotal - discountAmount

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

    const totalAmount = useMemo(() => {
      if (!selectedRate) return 0;
      const servicesTotal = selectedServices.reduce(
        (sum, service) => sum + service.totalAmount,
        0
      );
      const baseAmount = selectedRate.baseRate * selectedRate.duration;
      const subtotal = baseAmount + servicesTotal;

      let discountAmount = 0;
      if (appliedPromo) {
        if (appliedPromo.promoType === "percentage") {
          discountAmount = (subtotal * appliedPromo.discountValue) / 100;
        } else {
          discountAmount = Math.min(appliedPromo.discountValue, subtotal);
        }
      }

      const totalAmount = subtotal - discountAmount;
      // const totalAmount = discountedSubtotal + taxAmount;
      return totalAmount;

    }, [selectedRate, selectedServices, appliedPromo]);

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
                        className={`border rounded-lg p-2 cursor-pointer transition-all hover:bg-red-50 ${selectedRate?.rateId === rate.rateId
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
                {selectedRate
                  ? `Book for ${formatCurrency(totalAmount)}`
                  : "Select a Rate to Continue"}
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
      className={` min-w-[250px] bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow-md hover:scale-105 hover:border-red-400 duration-500 ${isSelected ? "border-red-500 ring-2 ring-red-200" : "border-gray-200"
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

const BookingCard = memo(({ booking: data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "pending":
        return "orange";
      case "cancelled":
        return "red";
      case "completed":
        return "blue";
      default:
        return "default";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "green";
      case "pending":
        return "orange";
      case "failed":
        return "red";
      case "refunded":
        return "purple";
      default:
        return "default";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Title level={2} className="mb-2">
                Booking Details
              </Title>
              <Text className="text-xl font-semibold text-blue-600">
                {data.bookingReference}
              </Text>
            </div>
            <Space>
              <Badge
                status={getStatusColor(data.bookingStatus)}
                text={data.bookingStatus.toUpperCase()}
                className="text-lg"
              />
              <Badge
                status={getPaymentStatusColor(data.paymentStatus)}
                text={data.paymentStatus.toUpperCase()}
                className="text-lg"
              />
            </Space>
          </div>
        </div>

        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div>
            <Card
              title={
                <span>
                  <HomeOutlined className="mr-2" />
                  Booking Information
                </span>
              }
              className="h-full"
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Booking ID">
                  {data.bookingId}
                </Descriptions.Item>
                <Descriptions.Item label="Branch ID">
                  {data.branchId}
                </Descriptions.Item>
                <Descriptions.Item label="Room ID">
                  {data.roomId}
                </Descriptions.Item>
                <Descriptions.Item label="Room Type ID">
                  {data.roomTypeId}
                </Descriptions.Item>
                <Descriptions.Item label="Rate ID">
                  {data.rateId}
                </Descriptions.Item>
                <Descriptions.Item label="Number of Guests">
                  <Tag color="blue" icon={<UserOutlined />}>
                    {data.numberOfGuests} guests
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Source">
                  <Tag color="purple">{data.source}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created By">
                  {data.createdBy || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Date & Time Information */}
          <div>
            <Card
              title={
                <span>
                  <CalendarOutlined className="mr-2" />
                  Schedule Information
                </span>
              }
              className="h-full"
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Check-in">
                  <div className="flex flex-col">
                    <Text strong>{formatDateTime(data.checkInDateTime)}</Text>
                    <Text type="secondary" className="text-sm">
                      Expected
                    </Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Check-out">
                  <div className="flex flex-col">
                    <Text strong>
                      {formatDateTime(data.expectedCheckOutDateTime)}
                    </Text>
                    <Text type="secondary" className="text-sm">
                      Expected
                    </Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Stay Duration">
                  <Tag color="orange" icon={<ClockCircleOutlined />}>
                    {data.stayDuration} {data.stayDurationType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {formatDateTime(data.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At">
                  {formatDateTime(data.updatedAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Guest Information */}
          <div>
            <Card
              title={
                <span>
                  <UserOutlined className="mr-2" />
                  Guest Information
                </span>
              }
              className="h-full"
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Primary Guest">
                  {data.primaryGuestName || (
                    <Text type="secondary">Not provided</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <PhoneOutlined className="mr-1" />
                      Contact
                    </span>
                  }
                >
                  {data.primaryGuestContact || (
                    <Text type="secondary">Not provided</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <MailOutlined className="mr-1" />
                      Email
                    </span>
                  }
                >
                  {data.primaryGuestEmail || (
                    <Text type="secondary">Not provided</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Special Requests">
                  {data.specialRequests || <Text type="secondary">None</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Guest Notes">
                  {data.guestNotes || <Text type="secondary">None</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Staff Notes">
                  {data.staffNotes || <Text type="secondary">None</Text>}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Payment Information */}
          <div>
            <Card
              title={
                <span>
                  <DollarOutlined className="mr-2" />
                  Payment Details
                </span>
              }
              className="h-full"
            >
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Text>Base Amount</Text>
                    <Text strong className="text-lg">
                      {formatCurrency(data.baseAmount, data.currency)}
                    </Text>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-green-600">
                    <Text>Discount</Text>
                    <Text>
                      -{formatCurrency(data.discountAmount, data.currency)}
                    </Text>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <Text>Service Charges</Text>
                    <Text>
                      {formatCurrency(data.serviceChargesAmount, data.currency)}
                    </Text>
                  </div>
                  {/* <div className="flex justify-between items-center mb-3">
                    <Text>Tax Amount</Text>
                    <Text>{formatCurrency(data.taxAmount, data.currency)}</Text>
                  </div> */}
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center mb-3">
                    <Text strong className="text-lg">
                      Total Amount
                    </Text>
                    <Text strong className="text-xl text-blue-600">
                      {formatCurrency(data.totalAmount, data.currency)}
                    </Text>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Text>Total Paid</Text>
                    <Text strong className="text-green-600">
                      {formatCurrency(data.totalPaid, data.currency)}
                    </Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text>Balance</Text>
                    <Text
                      strong
                      className={
                        data.balanceAmount > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {formatCurrency(data.balanceAmount, data.currency)}
                    </Text>
                  </div>
                </div>

                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Payment Method">
                    {data.paymentMethod || (
                      <Text type="secondary">Not specified</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Promo ID">
                    {data.promoId || <Text type="secondary">None applied</Text>}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Card>
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
      footer={
        [
          <Button type="primary" key={"check-in"}>
            Check In
          </Button>,
          <Button key={"edit"}>Edit Booking</Button>,
          <Button key={"print"}>Print Receipt</Button>,
          <Button danger key={"cancel"}>
            Cancel Booking
          </Button>,
        ]
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
        {room && <RoomCard room={room} />}

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

      // addBookingApi.mutate(body, {
      //   onSuccess: (response) => {
      //     console.log(response);
      //     // Simulate API success
      //     notification.success({
      //       message: "Booking Confirmed!",
      //       description: `Booking ${bookingReference} has been created successfully. Room ${selectedRoom.roomNumber} is now occupied.`,
      //       duration: 5,
      //     });

      //     // Update room status locally (in real app, this would come from API response)
      //     setSelectedRoom((prev) => ({
      //       ...prev,
      //       roomStatus: ROOM_STATUSES.OCCUPIED,
      //     }));

      //     // Reset form
      //     setShowBookingModal(false);
      //     setSelectedRoom(null);
      //     setBookingDetails({
      //       dayType: getCurrentDayType(),
      //       guests: 2,
      //     });
      //     setCurrentBookingData(null);
      //     getRoomsByBranch.refetch();
      //   },
      //   onError: (error) => {
      //     console.log(error);
      //   },
      // });
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
