import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Badge, Button, Space, Table, Tag, Typography } from "antd";
import { useState } from "react";
import { useGetBookingsApi } from "../../../services/requests/useBookings";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/formatDate";
import CurrentBookedRoom from "../RoomBooking/components/CurrentBooking";

const { Title, Text } = Typography;

const Bookings = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: bookingsData } = useGetBookingsApi();

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "success",
      pending: "warning",
      cancelled: "error",
      completed: "default",
      occupied: "processing",
      available: "success",
      partial: "orange",
      paid: "green",
    };
    return colors[status] || "default";
  };

  // Function to calculate time remaining until checkout and return warning info
  const getCheckoutWarning = (expectedCheckOutDateTime) => {
    if (!expectedCheckOutDateTime) return null;

    const now = new Date();
    const checkoutTime = new Date(expectedCheckOutDateTime);
    const timeDiffMs = checkoutTime.getTime() - now.getTime();
    const timeDiffMins = Math.floor(timeDiffMs / (1000 * 60));

    // If checkout time has passed
    if (timeDiffMins < -15) {
      return {
        type: "critical",
        color: "error",
        text: "OVERDUE",
        icon: <ExclamationCircleOutlined />,
        bgColor: "#ff4d4f",
      };
    } else if (timeDiffMins >= -15 && timeDiffMins < 0) {
      return {
        type: "overdue",
        color: "error",
        text: "0-15 mins overdue",
        icon: <ExclamationCircleOutlined />,
        bgColor: "#ff7875",
      };
    } else if (timeDiffMins >= 0 && timeDiffMins <= 15) {
      return {
        type: "immediate",
        color: "error",
        text: "0-15 mins",
        icon: <ClockCircleOutlined />,
        bgColor: "#ffccc7",
      };
    } else if (timeDiffMins > 15 && timeDiffMins <= 30) {
      return {
        type: "warning",
        color: "warning",
        text: "15-30 mins",
        icon: <ClockCircleOutlined />,
        bgColor: "#fff1b8",
      };
    }

    return null; // No warning needed if more than 30 minutes
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const columns = [
    {
      title: "Booking Reference",
      dataIndex: "bookingReference",
      key: "bookingReference",
      render: (text) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Room",
      key: "room",
      render: (_, record) => (
        <div>
          <div className="font-medium">Room {record.roomNumber}</div>
          <Text type="secondary" className="text-sm">
            {record.roomTypeName}
          </Text>
        </div>
      ),
    },
    {
      title: "Check-in",
      dataIndex: "checkInDateTime",
      key: "checkInDateTime",
      render: (text) => <div className="text-sm">{formatDateTime(text)}</div>,
    },
    {
      title: "Expected Check-out",
      dataIndex: "expectedCheckOutDateTime",
      key: "expectedCheckOutDateTime",
      render: (text, record) => {
        const warning = getCheckoutWarning(text);

        return (
          <div className="text-sm">
            <div>{formatDateTime(text)}</div>
            {warning && (
              <Tag
                color={warning.color}
                icon={warning.icon}
                style={{
                  marginTop: 4,
                  backgroundColor: warning.bgColor,
                  border: `1px solid ${warning.color === "error" ? "#ff4d4f" : "#faad14"
                    }`,
                  fontWeight: "bold",
                }}
              >
                {warning.text}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={getStatusColor(record.bookingStatus)}>
            {record.bookingStatus.toUpperCase()}
          </Tag>
          <Tag color={getStatusColor(record.paymentStatus)}>
            Payment: {record.paymentStatus}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Total Amount",
      key: "amount",
      render: (_, record) => (
        <div>
          <div className="font-bold text-lg">
            {formatCurrency(record.totalAmount)}
          </div>
          {record.balanceAmount > 0 && (
            <Text type="danger" className="text-sm">
              Balance: {formatCurrency(record.balanceAmount)}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => showBookingDetails(record)}>
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  // Add warning legend component
  const WarningLegend = () => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <Title level={5} className="mb-3">
        Checkout Time Warnings
      </Title>
      <Space wrap>
        <Tag color="warning" icon={<ClockCircleOutlined />}>
          15-30 mins remaining
        </Tag>
        <Tag color="error" icon={<ClockCircleOutlined />}>
          0-15 mins remaining
        </Tag>
        <Tag color="error" icon={<ExclamationCircleOutlined />}>
          0-15 mins overdue
        </Tag>
        <Tag color="error" icon={<ExclamationCircleOutlined />}>
          15+ mins overdue
        </Tag>
      </Space>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <Badge count={bookingsData.length} showZero>
          <Title level={2} className="mb-2">
            Bookings
          </Title>
        </Badge>
      </div>

      <WarningLegend />

      <Table
        columns={columns}
        dataSource={bookingsData}
        rowKey="bookingId"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} bookings`,
        }}
        scroll={{ x: 1200 }}
      />

      <CurrentBookedRoom room={selectedBooking} onSelect={setSelectedBooking} />
    </div>
  );
};

export default Bookings;
