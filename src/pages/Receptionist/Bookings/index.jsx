import { Button, Input, Select, Space, Table, Tag } from "antd";
import {
  AlertCircle,
  Bed,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  Grid3X3,
  List,
  MapPin,
  Phone,
  Search,
  Timer,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useGetBookingsApi } from "../../../services/requests/useBookings";
import CurrentBookedRoom from "../RoomBooking/components/CurrentBooking";

const Bookings = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const { data: bookingsData } = useGetBookingsApi();

  // Enhanced time warning calculation
  const getTimeStatus = (expectedCheckOutDateTime) => {
    if (!expectedCheckOutDateTime) return null;

    const now = new Date();
    const checkoutTime = new Date(expectedCheckOutDateTime);
    const diffMs = checkoutTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < -60) {
      return {
        type: "critical",
        label: "OVERDUE",
        time: `${Math.abs(diffHours)}h ago`,
        color: "error",
        priority: 5,
      };
    } else if (diffMins < -15) {
      return {
        type: "overdue",
        label: "OVERDUE",
        time: `${Math.abs(diffMins)}m ago`,
        color: "error",
        priority: 4,
      };
    } else if (diffMins <= 15) {
      return {
        type: "urgent",
        label: "DUE SOON",
        time: diffMins < 0 ? "Now" : `${diffMins}m`,
        color: "warning",
        priority: 3,
      };
    } else if (diffMins <= 60) {
      return {
        type: "warning",
        label: "DUE SOON",
        time: `${diffMins}m`,
        color: "warning",
        priority: 2,
      };
    }
    return {
      type: "ok",
      label: "ON TIME",
      time: diffHours > 0 ? `${diffHours}h` : `${diffMins}m`,
      color: "success",
      priority: 1,
    };
  };

  const getPaymentStatus = (paymentStatus, balanceAmount) => {
    if (balanceAmount > 0) {
      return {
        label: "BALANCE DUE",
        color: "error",
      };
    }
    switch (paymentStatus) {
      case "paid":
        return {
          label: "PAID",
          color: "success",
        };
      case "partial":
        return {
          label: "PARTIAL",
          color: "warning",
        };
      default:
        return {
          label: "PENDING",
          color: "default",
        };
    }
  };

  const getBookingStatus = (status) => {
    const statusMap = {
      confirmed: {
        label: "CONFIRMED",
        color: "blue",
      },
      extended: {
        label: "EXTENDED",
        color: "purple",
      },
      occupied: {
        label: "OCCUPIED",
        color: "green",
      },
      pending: {
        label: "PENDING",
        color: "orange",
      },
      cancelled: {
        label: "CANCELLED",
        color: "red",
      },
    };
    return statusMap[status] || statusMap["pending"];
  };

  const formatCurrency = (amount, currency = "PHP") => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookingsData;

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => {
        const timeStatus = getTimeStatus(booking.expectedCheckOutDateTime);
        return timeStatus?.type === statusFilter;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.bookingReference
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.roomNumber.includes(searchTerm) ||
          (booking.primaryGuestName &&
            booking.primaryGuestName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [statusFilter, searchTerm, bookingsData]);

  // Quick stats
  const stats = useMemo(() => {
    const total = bookingsData.length;
    const critical = bookingsData.filter(
      (b) => getTimeStatus(b.expectedCheckOutDateTime)?.type === "critical"
    ).length;
    const overdue = bookingsData.filter((b) =>
      ["critical", "overdue"].includes(
        getTimeStatus(b.expectedCheckOutDateTime)?.type
      )
    ).length;
    const urgent = bookingsData.filter(
      (b) => getTimeStatus(b.expectedCheckOutDateTime)?.type === "urgent"
    ).length;
    const balanceDue = bookingsData.filter((b) => b.balanceAmount > 0).length;
    const totalRevenue = bookingsData.reduce(
      (sum, b) => sum + b.totalAmount,
      0
    );

    return { total, critical, overdue, urgent, balanceDue, totalRevenue };
  }, [bookingsData]);

  // Ant Design Table columns
  const columns = [
    {
      title: "Room",
      dataIndex: "roomNumber",
      key: "roomNumber",
      sorter: (a, b) => a.roomNumber.localeCompare(b.roomNumber),
      render: (roomNumber, record) => (
        <div>
          <div className="font-semibold text-gray-900">Room {roomNumber}</div>
          <div className="text-sm text-gray-500">{record.roomTypeName}</div>
        </div>
      ),
    },
    {
      title: "Booking Reference",
      dataIndex: "bookingReference",
      key: "bookingReference",
      sorter: (a, b) => a.bookingReference.localeCompare(b.bookingReference),
      render: (ref) => (
        <div className="font-medium text-blue-600 text-sm">{ref}</div>
      ),
    },
    {
      title: "Guest",
      dataIndex: "primaryGuestName",
      key: "primaryGuestName",
      sorter: (a, b) => a.primaryGuestName.localeCompare(b.primaryGuestName),
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">
            {record.numberOfGuests} guest{record.numberOfGuests > 1 ? "s" : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Check Times",
      dataIndex: "expectedCheckOutDateTime",
      key: "checkTimes",
      sorter: (a, b) =>
        new Date(a.expectedCheckOutDateTime) -
        new Date(b.expectedCheckOutDateTime),
      render: (checkOut, record) => (
        <div className="text-sm">
          <div>In: {formatTime(record.checkInDateTime)}</div>
          <div className="font-medium">Out: {formatTime(checkOut)}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "bookingStatus",
      key: "status",
      filters: [
        { text: "Confirmed", value: "confirmed" },
        { text: "Extended", value: "extended" },
        { text: "Occupied", value: "occupied" },
        { text: "Pending", value: "pending" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.bookingStatus === value,
      render: (status, record) => {
        const bookingStatus = getBookingStatus(status);
        const paymentStatus = getPaymentStatus(
          record.paymentStatus,
          record.balanceAmount
        );

        return (
          <Space direction="vertical" size={4}>
            <Tag color={bookingStatus.color}>{bookingStatus.label}</Tag>
            <Tag color={paymentStatus.color}>{paymentStatus.label}</Tag>
          </Space>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount, record) => (
        <div>
          <div className="font-bold text-lg">{formatCurrency(amount)}</div>
          {record.balanceAmount > 0 && (
            <div className="text-sm text-red-600 font-semibold">
              Balance: {formatCurrency(record.balanceAmount)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Eye size={14} />}
          onClick={() => setSelectedBooking(record)}
        >
          View
        </Button>
      ),
    },
  ];

  const BookingCard = ({ booking }) => {
    const timeStatus = getTimeStatus(booking.expectedCheckOutDateTime);
    const paymentStatus = getPaymentStatus(
      booking.paymentStatus,
      booking.balanceAmount
    );
    const bookingStatus = getBookingStatus(booking.bookingStatus);

    return (
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:scale-[1.02] backdrop-blur-sm">
        {/* Header */}
        <div className="bg-gray-50 border-b border-opacity-20 p-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-xl text-gray-900">
                  Room {booking.roomNumber}
                </h3>
                <span className="text-xs font-medium text-gray-600 bg-white/70 px-2 py-1 rounded-full backdrop-blur-sm">
                  {booking.roomTypeName}
                </span>
              </div>
              <p className="text-sm font-semibold text-blue-600 tracking-wide">
                {booking.bookingReference}
              </p>
            </div>

            {/* Time Status Badge */}
            {timeStatus && (
              <Tag color={timeStatus.color} className="font-bold text-sm m-auto">
                <div className="text-center">
                  <div className="text-xs opacity-90">{timeStatus.label}</div>
                </div>
              </Tag>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {/* Guest Info Section */}
          <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-2">

              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {booking.primaryGuestName}
                </h4>
                <p className="text-sm text-gray-600">
                  {booking.numberOfGuests} guest
                  {booking.numberOfGuests > 1 ? "s" : ""} •{" "}
                  {booking.bedConfiguration}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin size={14} />
              <span className="capitalize">{booking.source}</span>
            </div>
          </div>

          {/* Time & Payment Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Check Times */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar size={16} />
                <span>CHECK TIMES</span>
              </div>
              <div className="space-y-1 pl-6">
                <p className="text-sm text-gray-600">
                  In: {formatTime(booking.checkInDateTime)}
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  Out: {formatTime(booking.expectedCheckOutDateTime)}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CreditCard size={16} />
                <span>PAYMENT</span>
              </div>
              <div className="space-y-1 pl-6">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(booking.totalAmount)}
                </p>
                {booking.balanceAmount > 0 ? (
                  <p className="text-sm font-semibold text-red-600">
                    Balance: {formatCurrency(booking.balanceAmount)}
                  </p>
                ) : (
                  <p className="text-sm text-green-600 font-medium">
                    Fully Paid
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Tag color={bookingStatus.color}>{bookingStatus.label}</Tag>
            <Tag color={paymentStatus.color}>{paymentStatus.label}</Tag>
            {booking.hasExtensions && <Tag color="purple">EXTENDED</Tag>}
            {booking.hasAdditionalCharges && <Tag color="blue">EXTRAS</Tag>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button
              type="primary"
              block
              size="large"
              icon={<Eye size={16} />}
              onClick={() => setSelectedBooking(booking)}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-2">
                Bookings
              </h1>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-lg border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "grid"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <Grid3X3 size={18} />
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "table"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <List size={18} />
                Table
              </button>
            </div>
          </div>
        </div>


        {/* Enhanced Filters */}
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by booking reference, room number, or guest name..."
                prefix={<Search size={20} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
                className="font-medium"
              />
            </div>

            <div className="flex gap-3">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                size="large"
                style={{ minWidth: 160 }}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "critical", label: "Critical" },
                  { value: "overdue", label: "Overdue" },
                  { value: "urgent", label: "Due Soon" },
                  { value: "warning", label: "Warning" },
                  { value: "ok", label: "On Time" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Timer size={20} />
            Checkout Time Status Legend
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm"></div>
              <span className="font-medium text-red-700">
                Critical (1h+ overdue)
              </span>
            </div>
            <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200">
              <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-sm"></div>
              <span className="font-medium text-orange-700">
                Due Soon (0-15m)
              </span>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
              <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-sm"></div>
              <span className="font-medium text-amber-700">
                Warning (15-60m)
              </span>
            </div>
            <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-sm"></div>
              <span className="font-medium text-green-700">
                On Time (1h+ remaining)
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.bookingId} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <Table
              columns={columns}
              dataSource={filteredBookings}
              rowKey="bookingId"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} bookings`,
              }}
              scroll={{ x: 1200 }}
              className="antd-table-custom"
            />
          </div>
        )}

        {filteredBookings.length === 0 && (
          <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters to find what
                you're looking for.
              </p>
            </div>
          </div>
        )}
      </div>



      <CurrentBookedRoom room={selectedBooking} onSelect={setSelectedBooking} />
    </div>
  );
};

export default Bookings;
