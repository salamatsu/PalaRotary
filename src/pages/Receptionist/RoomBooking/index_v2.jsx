import { Button, Image, InputNumber, Modal, Select } from "antd";
import {
  AlertCircle,
  Bed,
  CheckCircle,
  Clock,
  CreditCard,
  User,
  Users,
  XCircle,
} from "lucide-react";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  useGetRoomsByBranch,
  useGetRoomsRates,
} from "../../../services/requests/useRooms";
import { formatPHPCurrencyNoFraction } from "../../../utils/formatCurrency";

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

// Utility functions
const showNotification = (type, title, message) => {
  const colors = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
  };

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 p-4 border rounded-lg shadow-lg z-50 ${
    colors[type] || colors.error
  }`;
  notification.innerHTML = `
    <div class="font-bold">${title}</div>
    <div>${message}</div>
  `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
};

const formatCurrency = (amount) => `₱${amount?.toLocaleString()}`;

const getCurrentDayType = () => {
  const day = new Date().getDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
};

// Memoized Components
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

const RoomCard = memo(({ room, isSelected, onSelect }) => {
  const isAvailable = room.roomStatus === ROOM_STATUSES.AVAILABLE;

  const handleClick = useCallback(() => {
    onSelect(room);
  }, [onSelect, room]);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow-md hover:scale-105 hover:border-red-400 duration-500 ${
        isSelected
          ? "border-primary-color ring-2 ring-red-200"
          : "border-gray-200"
      } ${!isAvailable ? "opacity-75" : ""}`}
      onClick={handleClick}
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
          <p className="text-sm text-gray-600">{room.roomSize}</p>
        </div>

        {room.notes && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            {room.notes}
          </div>
        )}
      </div>
    </div>
  );
});

const RateCard = memo(({ rate, isSelected, onSelect }) => (
  <div
    className={`bg-blue-50 border rounded-lg p-4 cursor-pointer transition-all hover:bg-blue-100 ${
      isSelected
        ? "border-primary-color ring-2 ring-red-200"
        : "border-gray-200"
    }`}
    onClick={() => onSelect(rate)}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium text-gray-900">{rate.rateTypeName}</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-primary-color">
          {formatPHPCurrencyNoFraction(
            (rate.rate || rate.baseRate) * rate.duration
          )}
        </p>
        <small>
          {formatPHPCurrencyNoFraction(rate.rate || rate.baseRate)} base rate
        </small>
      </div>
    </div>
  </div>
));

const RoomGrid = memo(({ groupedRooms, selectedRoom, onRoomSelect }) => (
  <div className="space-y-6">
    {Object.keys(groupedRooms).length === 0 ? (
      <div className="text-center py-8">
        <Bed className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 text-lg">
          No rooms match your current filters
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your filter criteria
        </p>
      </div>
    ) : (
      Object.keys(groupedRooms)
        .sort()
        .map((floor) => (
          <div key={floor}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Floor {floor}
              <span className="ml-2 text-base font-normal text-gray-500">
                ({groupedRooms[floor].length} room
                {groupedRooms[floor].length !== 1 ? "s" : ""})
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedRooms[floor].map((room) => (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  isSelected={selectedRoom?.roomId === room.roomId}
                  onSelect={onRoomSelect}
                />
              ))}
            </div>
          </div>
        ))
    )}
  </div>
));

const BookingModal = memo(
  ({
    open = false,
    selectedRoom,
    selectedRate,
    bookingDetails,
    onClose,
    onConfirm,
  }) => {
    if (!selectedRoom || !selectedRate) return null;

    const total =
      (selectedRate.rate || selectedRate.baseRate) * selectedRate.duration;
    const checkInTime = new Date().toLocaleString();

    return (
      <Modal
        open={open}
        centered
        closeIcon={false}
        footer={
          <div className="flex gap-3">
            <Button block size="large" danger type="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              block
              size="large"
              type="primary"
              onClick={onConfirm(selectedRoom, selectedRate, bookingDetails)}
            >
              Confirm Booking
            </Button>
          </div>
        }
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Confirm Booking
        </h2>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <p className="text-sm text-gray-600">Room</p>
            <p className="font-medium">
              {selectedRoom.roomNumber} - {selectedRoom.roomTypeName}
            </p>
          </div>

          <div className="flex justify-between">
            <p className="text-sm text-gray-600">Guests</p>
            <p className="font-medium">{bookingDetails.guests}</p>
          </div>

          <div className="flex justify-between">
            <p className="text-sm text-gray-600">Rate</p>
            <p className="font-medium">{selectedRate.rateTypeName}</p>
          </div>

          <div className="flex justify-between">
            <p className="text-sm text-gray-600">Base Rate</p>
            <p className="font-medium">
              {formatPHPCurrencyNoFraction(
                selectedRate.rate || selectedRate.baseRate
              )}
            </p>
          </div>

          <div className="flex justify-between">
            <p className="text-sm text-gray-600">Check-in Time</p>
            <p className="font-medium text-sm">{checkInTime}</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Total Amount</p>
              <p className="text-2xl font-bold text-primary-color">
                {formatPHPCurrencyNoFraction(total)}
              </p>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
);

const BookingForm = memo(
  ({ selectedRoom, bookingDetails, onBookingChange, onBook }) => {
    const [selectedRate, setSelectedRate] = useState(null);
    const getRoomsRates = useGetRoomsRates(
      selectedRoom.roomTypeId,
      selectedRoom.branchId
    );

    const handleBookClick = useCallback(() => {
      if (!selectedRate) {
        showNotification(
          "error",
          "Rate Required",
          "Please select a rate before booking."
        );
        return;
      }
      onBook(selectedRate);
    }, [selectedRate, onBook]);

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Book Room {selectedRoom.roomNumber}
        </h2>

        <div className="mb-6">
          <Image
            src={selectedRoom?.imageUrl}
            alt={selectedRoom?.roomTypeName}
            className="w-full h-32 object-cover rounded-lg mb-3"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIj5Sb29tIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
            }}
          />
          <h3 className="text-lg font-medium text-gray-900">
            {selectedRoom?.roomTypeName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedRoom?.description}
          </p>
        </div>

        <div className="space-y-6">
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
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum {selectedRoom?.maxOccupancy} guests allowed
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <CreditCard className="w-4 h-4" />
              Select Rate
            </label>
            <div className="space-y-3">
              {getRoomsRates.data.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No rates available for this room type</p>
                </div>
              ) : (
                getRoomsRates.data.map((rate) => (
                  <RateCard
                    key={rate.rateTypeId}
                    rate={rate}
                    isSelected={selectedRate?.rateTypeId === rate.rateTypeId}
                    onSelect={setSelectedRate}
                  />
                ))
              )}
            </div>
          </div>

          <Button
            block
            size="large"
            type="primary"
            disabled={getRoomsRates.data.length === 0 || !selectedRate}
            onClick={handleBookClick}
          >
            {selectedRate
              ? `Book for ${formatPHPCurrencyNoFraction(
                  (selectedRate.rate || selectedRate.baseRate) *
                    selectedRate.duration
                )}`
              : "Select a Rate to Continue"}
          </Button>
        </div>
      </div>
    );
  }
);

// Custom hooks
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

const useBooking = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    dayType: getCurrentDayType(),
    guests: 2,
  });

  const updateBookingDetails = useCallback((field, value) => {
    setBookingDetails((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetBooking = useCallback(() => {
    setSelectedRoom(null);
    setBookingDetails({
      dayType: getCurrentDayType(),
      guests: 2,
    });
  }, []);

  return {
    selectedRoom,
    setSelectedRoom,
    bookingDetails,
    updateBookingDetails,
    resetBooking,
  };
};

// Statistics component
const RoomStats = memo(({ rooms }) => {
  const stats = useMemo(() => {
    const available = rooms.filter(
      (r) => r.roomStatus === ROOM_STATUSES.AVAILABLE
    ).length;
    const occupied = rooms.filter(
      (r) => r.roomStatus === ROOM_STATUSES.OCCUPIED
    ).length;
    const maintenance = rooms.filter(
      (r) => r.roomStatus === ROOM_STATUSES.MAINTENANCE
    ).length;
    const cleaning = rooms.filter(
      (r) => r.roomStatus === ROOM_STATUSES.CLEANING
    ).length;
    const reserved = rooms.filter(
      (r) => r.roomStatus === ROOM_STATUSES.RESERVED
    ).length;

    return {
      available,
      occupied,
      maintenance,
      cleaning,
      reserved,
      total: rooms.length,
    };
  }, [rooms]);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Room Statistics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Rooms</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.available}
          </div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {stats.occupied}
          </div>
          <div className="text-sm text-gray-600">Occupied</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.reserved}
          </div>
          <div className="text-sm text-gray-600">Reserved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.cleaning}
          </div>
          <div className="text-sm text-gray-600">Cleaning</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {stats.maintenance}
          </div>
          <div className="text-sm text-gray-600">Maintenance</div>
        </div>
      </div>
    </div>
  );
});

// Main Component
const RoomBooking = () => {
  const [filters, updateFilter] = useFilters();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);

  const {
    selectedRoom,
    setSelectedRoom,
    bookingDetails,
    updateBookingDetails,
    resetBooking,
  } = useBooking();

  const getRoomsByBranch = useGetRoomsByBranch(1);

  const roomTypes = useMemo(() => {
    return getRoomsByBranch.data.reduce((acc, { roomTypeName, roomTypeId }) => {
      if (!acc.find((item) => item.roomTypeId === roomTypeId)) {
        acc.push({ roomTypeName, roomTypeId });
      }
      return acc;
    }, []);
  }, [getRoomsByBranch.data]);

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
        .sort((a, b) => {
          // Sort by floor first, then by room number
          if (a.floor !== b.floor) {
            return a.floor.localeCompare(b.floor);
          }
          return a.roomNumber.localeCompare(b.roomNumber);
        }),
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

    const message =
      statusMessages[room.roomStatus] || "Room is not available for booking.";
    showNotification("error", "Room Unavailable", message);
  }, []);

  const handleBookRoom = useCallback((rate) => {
    setSelectedRate(rate);
    setShowBookingModal(true);
  }, []);

  const handleConfirmBooking = useCallback(
    (room, rate, details) => {
      // Simulate API call delay
      setTimeout(() => {
        showNotification(
          "success",
          "Booking Confirmed",
          `Room ${room.roomNumber} has been successfully booked for ${details.guests} guest(s)!`
        );

        // Update room status to occupied (simulate real booking)
        const roomIndex = mockRoomsData.findIndex(
          (r) => r.roomId === room.roomId
        );
        if (roomIndex !== -1) {
          mockRoomsData[roomIndex].roomStatus = ROOM_STATUSES.OCCUPIED;
          mockRoomsData[
            roomIndex
          ].notes = `Booked at ${new Date().toLocaleTimeString()}`;
        }

        setShowBookingModal(false);
        resetBooking();
        setSelectedRate(null);
      }, 1000);
    },
    [resetBooking]
  );

  const handleClearFilters = useCallback(() => {
    updateFilter("floor", "all");
    updateFilter("roomType", "all");
    updateFilter("status", "all");
  }, [updateFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Room Booking System
          </h1>
          <p className="text-gray-600">
            Select and book available rooms for your guests
          </p>
        </div>

        {/* Room Statistics */}
        <RoomStats rooms={getRoomsByBranch.data} />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Filter Rooms
            </h2>
            <Button type="link" ghost danger onClick={handleClearFilters}>
              Clear All Filters
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Available Rooms ({filteredRooms.length})
                </h2>
                <div className="flex items-center gap-4">
                  {Object.entries(STATUS_CONFIGS).map(([status, config]) => (
                    <div key={status} className="flex items-center gap-1">
                      {config.icon}
                      <span className="text-xs text-gray-600">
                        {config.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <RoomGrid
                groupedRooms={groupedRooms}
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
              />
            </div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            {selectedRoom ? (
              <BookingForm
                selectedRoom={selectedRoom}
                bookingDetails={bookingDetails}
                onBookingChange={updateBookingDetails}
                onBook={handleBookRoom}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <Bed className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Room
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose an available room from the list to start booking
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Click on any available room to view details</p>
                  <p>• Use filters to narrow down your search</p>
                  <p>• View room statistics above</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Confirmation Modal */}
        <BookingModal
          open={showBookingModal}
          selectedRoom={selectedRoom}
          selectedRate={selectedRate}
          bookingDetails={bookingDetails}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedRate(null);
          }}
          onConfirm={handleConfirmBooking}
        />
        {/* {showBookingModal && (
        )} */}
      </div>
    </div>
  );
};

export default RoomBooking;
