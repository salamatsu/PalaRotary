import {
  Alert,
  Button,
  Card,
  Col,
  Image,
  InputNumber,
  notification,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  AlertCircle,
  Bed,
  CheckCircle,
  Clock,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
// import {
//   useGetRateByRoomTypeId,
//   useGetRateTypes,
//   useGetRoomTypes,
// } from "../../../services/requests/useRequests";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Constants moved to separate file in real app
const ROOM_STATUSES = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  CLEANING: "cleaning",
  MAINTENANCE: "maintenance",
};

const STATUS_CONFIGS = {
  [ROOM_STATUSES.AVAILABLE]: {
    color: "green",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Available",
  },
  [ROOM_STATUSES.OCCUPIED]: {
    color: "red",
    icon: <XCircle className="w-4 h-4" />,
    label: "Occupied",
  },
  [ROOM_STATUSES.CLEANING]: {
    color: "yellow",
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Cleaning",
  },
  [ROOM_STATUSES.MAINTENANCE]: {
    color: "gray",
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Maintenance",
  },
};

const DAY_TYPE_OPTIONS = [
  { value: "weekday", label: "Weekday" },
  { value: "weekend", label: "Weekend" },
];
// Memoized Components
const StatusTag = memo(({ status }) => {
  const config = STATUS_CONFIGS[status];
  return (
    <Tag color={config.color} className="flex items-center gap-1 p-4">
      {config.label}
    </Tag>
  );
});

const RoomCard = memo(({ room, roomType, isSelected, onSelect }) => {
  const isAvailable = room.roomStatus === ROOM_STATUSES.AVAILABLE;

  const handleClick = useCallback(() => {
    // if (isAvailable) onSelect(room);
    onSelect(room);
  }, [isAvailable, onSelect, room]);

  return (
    <Card
      hoverable={isAvailable}
      className={`h-full transition-all cursor-pointer ${isSelected ? "ring-2 ring-blue-500" : ""
        } ${!isAvailable ? "opacity-75 cursor-not-allowed" : ""}`}
      onClick={handleClick}
      styles={{ body: { padding: "16px" } }}
    >
      <div className="flex items-center justify-between mb-3">
        <Text strong className="text-lg">
          Room {room.roomNumber}
        </Text>
        <StatusTag status={room.roomStatus} />
      </div>

      <div className="space-y-2">
        <Text strong className="block">
          {roomType?.roomTypeName}
        </Text>
        <div className="flex items-center gap-2 text-gray-600">
          <Bed className="w-4 h-4" />
          <Text type="secondary">{roomType?.bedConfiguration}</Text>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <Text type="secondary">Max {roomType?.maxOccupancy} guests</Text>
        </div>
        <Text type="secondary">{roomType?.roomSize}</Text>
      </div>

      {room.notes && (
        <Alert
          message={room.notes}
          type="warning"
          size="small"
          className="mt-3"
        />
      )}
    </Card>
  );
});

const RateCard = memo(({ rate, rateTypeInfo }) => (
  <Card className="bg-blue-50 border-blue-200">
    <Row justify="space-between" align="middle">
      <Col>
        <Text strong>{rateTypeInfo.rateTypeName}</Text>
      </Col>
      <Col>
        <Title level={3} className="text-blue-600 mb-0">
          ₱{rate.rate?.toLocaleString() || rate.baseRate?.toLocaleString()}
        </Title>
      </Col>
    </Row>
  </Card>
));

const RoomGrid = memo(
  ({ groupedRooms, getRoomType, selectedRoom, onRoomSelect }) => (
    <>
      {Object.keys(groupedRooms).length === 0 ? (
        <div className="text-center py-8">
          <Text type="secondary">No rooms match your current filters</Text>
        </div>
      ) : (
        Object.keys(groupedRooms)
          .sort()
          .map((floor) => (
            <div key={floor} className="mb-6">
              <Title level={4} className="mb-3">
                Floor {floor}
                <Text type="secondary" className="ml-2 text-base font-normal">
                  ({groupedRooms[floor].length} rooms)
                </Text>
              </Title>
              <Row gutter={[16, 16]}>
                {groupedRooms[floor].map((room) => (
                  <Col xs={24} sm={12} lg={8} key={room.roomId}>
                    <RoomCard
                      room={room}
                      roomType={getRoomType(room.roomTypeId)}
                      isSelected={selectedRoom?.roomId === room.roomId}
                      onSelect={onRoomSelect}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          ))
      )}
    </>
  )
);

const BookingForm = memo(
  ({
    selectedRoom,
    roomType,
    bookingDetails,
    rates,
    rateTypes,
    availableDurations,
    onBookingChange,
    onBook,
  }) => {
    const filteredRates = useMemo(() => {
      if (!rates?.length || !rateTypes?.length) return [];

      return rates.filter((rate) => {
        const rateTypeInfo = rateTypes.find(
          (type) => type.rateTypeId === rate.rateTypeId
        );
        return (
          rateTypeInfo?.dayType === bookingDetails.dayType &&
          rateTypeInfo?.duration === bookingDetails.duration
        );
      });
    }, [rates, rateTypes, bookingDetails.dayType, bookingDetails.duration]);

    return (
      <Card>
        <Title level={4} className="mb-4">
          Book Room {selectedRoom.roomNumber}
        </Title>

        <div className="mb-4">
          <Image
            src={roomType?.imageUrl}
            alt={roomType?.roomTypeName}
            className="w-full h-32 object-cover rounded-lg mb-3"
            preview={false}
          />
          <Title level={5}>{roomType?.roomTypeName}</Title>
          <Paragraph type="secondary" className="text-sm">
            {roomType?.description}
          </Paragraph>
        </div>

        <Space direction="vertical" size="large" className="w-full">
          <Row gutter={12}>
            <Col span={12}>
              <div className="mb-2">
                <Text strong>
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration
                </Text>
              </div>
              <Select
                value={bookingDetails.duration}
                onChange={(value) => onBookingChange("duration", value)}
                className="w-full"
                size="large"
                options={availableDurations.map((duration) => ({
                  value: duration,
                  label: `${duration} Hours`,
                }))}
              />
            </Col>
            <Col span={12}>
              <div className="mb-2">
                <Text strong>Day Type</Text>
              </div>
              <Select
                value={bookingDetails.dayType}
                onChange={(value) => onBookingChange("dayType", value)}
                className="w-full"
                size="large"
                options={DAY_TYPE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
            </Col>
          </Row>

          <div>
            <div className="mb-2">
              <Text strong>
                <User className="w-4 h-4 inline mr-1" />
                Number of Guests
              </Text>
            </div>
            <InputNumber
              min={1}
              max={roomType?.maxOccupancy || 2}
              value={bookingDetails.guests}
              onChange={(value) => onBookingChange("guests", value)}
              size="large"
            />
          </div>

          {/* Available Rates */}
          {filteredRates.map((rate) => {
            const rateTypeInfo = rateTypes.find(
              (type) => type.rateTypeId === rate.rateTypeId
            );
            return (
              <RateCard
                key={rate.rateTypeId}
                rate={rate}
                rateTypeInfo={rateTypeInfo}
              />
            );
          })}

          <Button
            type="primary"
            size="large"
            onClick={onBook}
            className="w-full"
            disabled={filteredRates.length === 0}
          >
            Book Room
          </Button>
        </Space>
      </Card>
    );
  }
);

// Custom hooks
const useRooms = () => {
  return useMemo(() => {
    const baseRooms = [
      {
        roomId: 1,
        roomNumber: "101",
        floor: "1",
        roomTypeId: 1,
        roomStatus: ROOM_STATUSES.AVAILABLE,
      },
      {
        roomId: 2,
        roomNumber: "102",
        floor: "1",
        roomTypeId: 2,
        roomStatus: ROOM_STATUSES.OCCUPIED,
      },
      {
        roomId: 3,
        roomNumber: "103",
        floor: "1",
        roomTypeId: 1,
        roomStatus: ROOM_STATUSES.CLEANING,
      },
      {
        roomId: 4,
        roomNumber: "104",
        floor: "1",
        roomTypeId: 3,
        roomStatus: ROOM_STATUSES.AVAILABLE,
      },
      {
        roomId: 5,
        roomNumber: "105",
        floor: "1",
        roomTypeId: 2,
        roomStatus: ROOM_STATUSES.MAINTENANCE,
      },
      {
        roomId: 6,
        roomNumber: "201",
        floor: "2",
        roomTypeId: 3,
        roomStatus: ROOM_STATUSES.AVAILABLE,
      },
      {
        roomId: 7,
        roomNumber: "202",
        floor: "2",
        roomTypeId: 4,
        roomStatus: ROOM_STATUSES.OCCUPIED,
      },
      {
        roomId: 8,
        roomNumber: "203",
        floor: "2",
        roomTypeId: 3,
        roomStatus: ROOM_STATUSES.AVAILABLE,
      },
      {
        roomId: 9,
        roomNumber: "204",
        floor: "2",
        roomTypeId: 4,
        roomStatus: ROOM_STATUSES.CLEANING,
      },
      {
        roomId: 10,
        roomNumber: "205",
        floor: "2",
        roomTypeId: 2,
        roomStatus: ROOM_STATUSES.AVAILABLE,
      },
      {
        roomId: 11,
        roomNumber: "301",
        floor: "3",
        roomTypeId: 4,
        roomStatus: ROOM_STATUSES.AVAILABLE,
      },
      {
        roomId: 12,
        roomNumber: "302",
        floor: "3",
        roomTypeId: 3,
        roomStatus: ROOM_STATUSES.OCCUPIED,
      },
      {
        roomId: 13,
        roomNumber: "303",
        floor: "3",
        roomTypeId: 4,
        roomStatus: ROOM_STATUSES.AVAILABLE,
      },
      {
        roomId: 14,
        roomNumber: "304",
        floor: "3",
        roomTypeId: 3,
        roomStatus: ROOM_STATUSES.AVAILABLE,
      },
    ];

    return baseRooms.map((room) => ({
      ...room,
      lastCleaned: new Date(
        Date.now() - Math.random() * 86400000 * 2
      ).toISOString(),
      maintenanceStatus:
        room.roomStatus === ROOM_STATUSES.MAINTENANCE ? "scheduled" : "none",
      notes: room?.notes,
      isActive: true,
    }));
  }, []);
};

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
    duration: "12",
    dayType: dayjs().day() === 0 || dayjs().day() === 6 ? "weekend" : "weekday", // is weekday using dayjs
    guests: 2,
  });

  const updateBookingDetails = useCallback((field, value) => {
    setBookingDetails((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetBooking = useCallback(() => {
    setSelectedRoom(null);
    setBookingDetails({
      duration: "12",
      dayType: "weekday",
      guests: 1,
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

// Main Component
const RoomBooking = () => {
  // Hooks
  const rooms = useRooms();
  const [filters, updateFilter] = useFilters();
  const {
    selectedRoom,
    setSelectedRoom,
    bookingDetails,
    updateBookingDetails,
    resetBooking,
  } = useBooking();

  // API calls
  const { data: roomTypes = [], isPending: loadingRoomTypes } = {
    data: [],
    isPending: false,
  };
  const { data: rateTypes = [], isPending: loadingRateTypes } = {
    data: [],
    isPending: false,
  };
  const { data: rates = [], isPending: loadingRates } = {
    data: [],
    isPending: false,
  };

  // Memoized computations
  const roomTypeMap = useMemo(
    () =>
      roomTypes.reduce((acc, roomType) => {
        acc[roomType.roomTypeId] = roomType;
        return acc;
      }, {}),
    [roomTypes]
  );

  const filteredRooms = useMemo(
    () =>
      rooms
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
    [rooms, filters]
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
    () => [...new Set(rooms.map((room) => room.floor))].sort(),
    [rooms]
  );

  const availableDurations = useMemo(() => {
    if (!rates?.length || !rateTypes?.length) return [];
    const rateDurations = rates
      .map(
        (rate) =>
          rateTypes.find((type) => type.rateTypeId === rate.rateTypeId)
            ?.duration
      )
      .filter(Boolean);
    return [...new Set(rateDurations)].sort();
  }, [rates, rateTypes]);

  // Event handlers
  const getRoomType = useCallback(
    (roomTypeId) => roomTypeMap[roomTypeId],
    [roomTypeMap]
  );

  const handleRoomSelect = useCallback(
    (room) => {
      if (room.roomStatus === ROOM_STATUSES.AVAILABLE) {
        setSelectedRoom(room);
      }

      console.log(room.roomStatus);

      if (room.roomStatus === ROOM_STATUSES.MAINTENANCE) {
        notification.error({
          message: "Maintenance Error",
          description: "Room is currently under maintenance.",
        });
      }

      if (room.roomStatus === ROOM_STATUSES.CLEANING) {
        notification.error({
          message: "Cleaning Error",
          description: "Room is currently under cleaning.",
        });
      }

      if (room.roomStatus === ROOM_STATUSES.OCCUPIED) {
        notification.error({
          message: "Occupied Error",
          description: "Room is currently occupied.",
        });
      }

      if (room.roomStatus === ROOM_STATUSES.RESERVED) {
        notification.error({
          message: "Reserved Error",
          description: "Room is currently reserved.",
        });
      }
    },
    [setSelectedRoom]
  );

  const handleBookRoom = useCallback(() => {
    const applicableRates = rates.filter((rate) => {
      const rateTypeInfo = rateTypes.find(
        (type) => type.rateTypeId === rate.rateTypeId
      );
      return (
        rateTypeInfo?.dayType === bookingDetails.dayType &&
        rateTypeInfo?.duration === bookingDetails.duration
      );
    });

    if (applicableRates.length === 0) {
      notification.error({
        message: "Rate Error",
        description: "Unable to calculate rate for selected options.",
      });
      return;
    }

    const totalRate = applicableRates[0].baseRate || applicableRates[0].rate;

    //   {
    //   "bookingId": 1,
    //   "bookingReference": "SOGO2025073100001",
    //   "branchId": 1,
    //   "roomId": 2,
    //   "roomTypeId": 2,
    //   "rateId": 6,
    //   "rateTypeId": 2,
    //   "numberOfGuests": 2,
    //   "checkInDateTime": "2025-07-31T14:00:00Z",
    //   "expectedCheckOutDateTime": "2025-08-01T14:00:00Z",
    //   "actualCheckInDateTime": "2025-07-31T14:15:00Z",
    //   "actualCheckOutDateTime": null,
    //   "stayDuration": 24,
    //   "stayDurationType": "hours",
    //   "bookingStatus": "checked_in",
    //   "paymentStatus": "paid",
    //   "baseAmount": 1500.0,
    //   "discountAmount": 0.0,
    //   "taxAmount": 180.0,
    //   "totalAmount": 1680.0,
    //   "currency": "PHP",
    //   "paymentMethod": "cash",
    //   "specialRequests": "",
    //   "guestNotes": "",
    //   "staffNotes": "Regular customer, no issues",
    //   "source": "walk_in",
    //   "cancellationPolicy": "no_cancellation_8hrs_before",
    //   "createdAt": "2025-07-31T13:45:00Z",
    //   "updatedAt": "2025-07-31T14:15:00Z",
    //   "createdBy": "front_desk_01"
    // }

    notification.success({
      message: "Booking Confirmed",
      description: `Room ${selectedRoom.roomNumber
        } has been booked successfully for ₱${totalRate.toLocaleString()}`,
      duration: 4,
    });

    resetBooking();
  }, [selectedRoom, rates, rateTypes, bookingDetails, resetBooking]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 flex flex-col">
      <div className="max-w-7xl w-full mx-auto flex flex-1 flex-col gap-3">
        {/* Filters */}
        <Card>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <div className="mb-2">
                <Text strong>Floor</Text>
              </div>
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
            </Col>
            <Col xs={24} md={8} className=" flex flex-row">
              <div className="">
                <Text strong>Room Type</Text>
              </div>
              <Select
                value={filters.roomType}
                onChange={(value) => updateFilter("roomType", value)}
                className="w-full"
                loading={loadingRoomTypes}
                options={[
                  { value: "all", label: "All Room Types" },
                  ...roomTypes.map((rt) => ({
                    value: rt.roomTypeId,
                    label: rt.roomTypeName,
                  })),
                ]}
              />
            </Col>
            <Col xs={24} md={8}>
              <div className="mb-2">
                <Text strong>Status</Text>
              </div>
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
            </Col>
          </Row>
        </Card>

        <div className=" grid grid-cols-12 gap-3 flex-1 h-full ">
          <div className=" col-span-8 flex flex-col overflow-auto">
            <Card>
              <RoomGrid
                groupedRooms={groupedRooms}
                getRoomType={getRoomType}
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
              />
            </Card>
          </div>

          {/* Booking Panel */}
          <div className=" col-span-4 ">
            <div className="space-y-6 flex flex-col gap-3">
              {/* Legend */}
              <Card>
                <Title level={4} className="mb-3">
                  Room Status Legend
                </Title>
                <Space size="small">
                  {Object.entries(STATUS_CONFIGS).map(([status, config]) => (
                    <Tag key={status} color={config.color}>
                      {config.label}
                    </Tag>
                  ))}
                </Space>
              </Card>

              {/* Booking Form */}
              {selectedRoom ? (
                <BookingForm
                  selectedRoom={selectedRoom}
                  roomType={getRoomType(selectedRoom.roomTypeId)}
                  bookingDetails={bookingDetails}
                  rates={rates}
                  rateTypes={rateTypes}
                  availableDurations={availableDurations}
                  onBookingChange={updateBookingDetails}
                  onBook={handleBookRoom}
                />
              ) : (
                <Card className="text-center py-8">
                  <Bed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <Text type="secondary">
                    Select an available room to start booking
                  </Text>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomBooking;
