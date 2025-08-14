// HAS TAX 12%

import {
  App,
  Button,
  Drawer,
  Modal,
  notification,
  Select,
  Space,
  Typography,
} from "antd";
import {
  Bed,
  CheckCircle,
  CreditCard,
  MapPin,
  Plus,
  Printer,
  Receipt,
  Star,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import BookingConfirmation from "../../../components/features/BookingConfirmation";
import BookingInformation from "../../../components/features/BookingInformation";
import StatusTag from "../../../components/features/StatusTag";
import { ROOM_STATUSES, STATUS_CONFIGS } from "../../../lib/constants";
import {
  useAddBookingApi,
  useGetBookingByRoomIdApi,
} from "../../../services/requests/useBookings";
import { useGetRoomsByBranch } from "../../../services/requests/useRooms";
import { useReceptionistAuthStore } from "../../../store/hotelStore";
import { formatCurrency } from "../../../utils/formatCurrency";
import { getCurrentDayType } from "../../../utils/formatDate";
import BookingForm from "./components/BookingForm";

const { Text } = Typography;

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
    const totalAmount = subtotal - discountAmount;

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

      setTimeout(() => {
        onConfirm(bookingData);
        setIsProcessing(false);
      }, 1000);
    };

    return (
      <Modal
        open={open}
        centered
        width={600}
        closeIcon={false}
        className="booking-modal"
        footer={
          <div className="flex gap-3">
            <Button
              block
              size="large"
              onClick={onClose}
              disabled={isProcessing || loading}
              className="rounded-lg"
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
              className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 border-0"
            >
              {isProcessing || loading
                ? "Processing Payment..."
                : `Pay ${formatCurrency(totalAmount)}`}
            </Button>
          </div>
        }
      >
        <BookingConfirmation
          selectedRoom={selectedRoom}
          selectedRate={selectedRate}
          bookingDetails={bookingDetails}
          appliedPromo={appliedPromo}
          selectedServices={selectedServices}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />
      </Modal>
    );
  }
);

const RoomCard = memo(({ room, isSelected, onSelect }) => {
  const isAvailable = room.roomStatus === ROOM_STATUSES.AVAILABLE;

  return (
    <div
      className={`min-w-[280px] bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 transform ${isSelected
        ? "border-red-400 ring-4 ring-red-100 shadow-xl scale-105"
        : "border-gray-100 hover:border-red-300"
        } ${!isAvailable ? "opacity-75" : ""}`}
      onClick={() => onSelect(room)}
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        <div
          className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
          style={{
            backgroundImage: `url(${room.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* <Bed className="w-12 h-12 text-blue-400" /> */}
        </div>
        <div className="absolute top-3 right-3">
          <StatusTag status={room.roomStatus} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Room {room.roomNumber}
          </h3>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            {/* <Star className="w-4 h-4" /> */}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-900 text-lg">
              {room.roomTypeName}
            </p>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bed className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium">{room.bedConfiguration}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-medium">
              Max {room.maxOccupancy} guests
            </span>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium">{room.roomSize} sqm</span>
          </div>
        </div>

        {isSelected && (
          <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Selected for booking
              </span>
            </div>
          </div>
        )}
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
      className="booking-drawer"
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
        <Button
          danger
          key={"cancel"}
          onClick={() => onSelect(null)}
          className="rounded-lg"
        >
          <X className="w-4 h-4" />
          CLOSE
        </Button>
      }
      footer={
        <div className="flex justify-end items-center">
          <Space>
            <Button key={"print"} className="rounded-lg">
              <Printer className="w-4 h-4" /> Print Receipt
            </Button>
            <Button danger key={"cancel"} className="rounded-lg">
              <XCircle className="w-4 h-4" />
              Cancel Booking
            </Button>
          </Space>
        </div>
      }
      classNames={{
        body: "bg-gray-50",
      }}
    >
      <div className="flex flex-col gap-4">
        {getBookingByRoomIdApi.data && (
          <BookingInformation bookingData={getBookingByRoomIdApi.data} />
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
      const bookingReference = `BK${Date.now().toString().slice(-8)}`;
      console.log(bookingData);

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

      addBookingApi.mutate(body, {
        onSuccess: (response) => {
          console.log(response);
          notification.success({
            message: "Booking Confirmed!",
            description: `Booking ${response.data?.bookingReference} has been created successfully. Room ${selectedRoom.roomNumber} is now occupied.`,
            duration: 5,
          });

          setSelectedRoom((prev) => ({
            ...prev,
            roomStatus: ROOM_STATUSES.OCCUPIED,
          }));

          setShowBookingModal(false);
          setSelectedRoom(null);
          setBookingDetails({
            dayType: getCurrentDayType(),
            guests: 2,
          });
          setCurrentBookingData(null);
          getRoomsByBranch.refetch();

          setSelectedRoomNotAvailable(response.data);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="w-11/12 mx-auto space-y-8">
        <div className="flex flex-row gap-8">
          <div className="flex-1 flex-col gap-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Room Booking System
              </h1>
              <p className="text-gray-600 text-lg">
                Book rooms with promo codes, additional services, and integrated
                payment solutions
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border-0 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bed className="w-4 h-4 text-blue-600" />
                </div>
                Room Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {getRoomsByBranch.data.length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Total Rooms
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-green-50">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {
                      getRoomsByBranch.data.filter(
                        (r) => r.roomStatus === ROOM_STATUSES.AVAILABLE
                      ).length
                    }
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    Available
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-red-50">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {
                      getRoomsByBranch.data.filter(
                        (r) => r.roomStatus === ROOM_STATUSES.OCCUPIED
                      ).length
                    }
                  </div>
                  <div className="text-sm text-red-700 font-medium">
                    Occupied
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-blue-50">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {
                      getRoomsByBranch.data.filter(
                        (r) => r.roomStatus === ROOM_STATUSES.RESERVED
                      ).length
                    }
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    Reserved
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-yellow-50">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {
                      getRoomsByBranch.data.filter(
                        (r) => r.roomStatus === ROOM_STATUSES.CLEANING
                      ).length
                    }
                  </div>
                  <div className="text-sm text-yellow-700 font-medium">
                    Cleaning
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-0 p-4 min-w-[350px]">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Getting Started
              </h3>
              <p className="text-gray-600 mb-6">
                Choose an available room to start the booking process
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700 font-medium">
                  Apply promo codes for discounts
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Plus className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-blue-700 font-medium">
                  Add extra services and amenities
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <span className="text-purple-700 font-medium">
                  Multiple payment methods supported
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Receipt className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-orange-700 font-medium">
                  Detailed payment breakdown
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-0 p-8">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <Text strong className="text-gray-700 text-base">
                Floor
              </Text>
              <Select
                value={filters.floor}
                onChange={(value) => updateFilter("floor", value)}
                className="w-full"
                size="large"
                options={[
                  { value: "all", label: "All Floors" },
                  ...availableFloors.map((floor) => ({
                    value: floor,
                    label: `${floor}st Floor`,
                  })),
                ]}
              />
            </div>
            <div className="space-y-2">
              <Text strong className="text-gray-700 text-base">
                Room Type
              </Text>
              <Select
                value={filters.roomType}
                onChange={(value) => updateFilter("roomType", value)}
                className="w-full"
                size="large"
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
            <div className="space-y-2">
              <Text strong className="text-gray-700 text-base">
                Status
              </Text>
              <Select
                value={filters.status}
                onChange={(value) => updateFilter("status", value)}
                className="w-full"
                size="large"
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

        <div className="bg-white rounded-2xl shadow-xl border-0 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Available Rooms ({availableRooms.length})
              </h2>
              <p className="text-gray-600">
                Select a room to begin the booking process
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              {Object.entries(STATUS_CONFIGS).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2">
                  {config.icon}
                  <span className="text-gray-600 font-medium">
                    {config.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {getRoomsByBranch.data.length === 0 ? (
            <div className="text-center py-16">
              <Bed className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No rooms available
              </h3>
              <p className="text-gray-400">
                Please check back later or contact management
              </p>
            </div>
          ) : Object.keys(groupedRooms).length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No rooms match your filters
              </h3>
              <p className="text-gray-400">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            Object.keys(groupedRooms)
              .sort()
              .map((floor) => (
                <div key={floor} className="mb-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {floor}
                      </span>
                    </div>
                    <div>
                      <p className="mb-0 text-gray-900 text-xl font-semibold ">
                        Floor {floor}
                      </p>
                      <Text type="secondary" className="text-base">
                        {groupedRooms[floor].length} rooms available
                      </Text>
                    </div>
                  </div>

                  <div className="flex flex-row flex-wrap gap-6">
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
          )}
        </div>

        <Drawer
          open={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          height={"95%"}
          placement="bottom"
          className="booking-drawer"
          title={
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Bed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Book Room {selectedRoom?.roomNumber}
                </h2>
                <p className="text-gray-600">
                  Complete your booking details below
                </p>
              </div>
            </div>
          }
          classNames={{
            body: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
          }}
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
              <div className="bg-white rounded-2xl shadow-xl border-0 p-12 text-center">
                <Bed className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Select a Room
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Choose an available room to start the booking process
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-green-700 font-medium text-sm">
                      Apply promo codes
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Plus className="w-6 h-6 text-blue-500" />
                    <span className="text-blue-700 font-medium text-sm">
                      Add services
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                    <CreditCard className="w-6 h-6 text-purple-500" />
                    <span className="text-purple-700 font-medium text-sm">
                      Multiple payments
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                    <Receipt className="w-6 h-6 text-orange-500" />
                    <span className="text-orange-700 font-medium text-sm">
                      Detailed breakdown
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Drawer>

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
      </div>
    </div>
  );
};

export default RoomBooking;
