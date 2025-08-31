import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Modal,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { useGetBookingsApi } from "../../../services/requests/useBookings";
import { formatDateTime } from "../../../utils/formatDate";
import { formatCurrency } from "../../../utils/formatCurrency";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const BookingsManagement = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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



  const parseJsonArray = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
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
    // {
    //   title: "Branch",
    //   dataIndex: "branchName",
    //   key: "branchName",
    //   render: (text, record) => (
    //     <div>
    //       <div className="font-medium">{text}</div>
    //       <Text type="secondary" className="text-sm">
    //         {record.branchCode}
    //       </Text>
    //     </div>
    //   ),
    // },
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
      title: "Duration",
      key: "duration",
      render: (_, record) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {record.stayDuration} {record.stayDurationType}
        </Tag>
      ),
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
          <Button
            type="primary"
            size="small"
            onClick={() => showBookingDetails(record)}
          >
            View Details
          </Button>
          <Button size="small">Edit</Button>
        </Space>
      ),
    },
  ];

  const renderBookingDetails = (booking) => {
    if (!booking) return null;

    const additionalChargesColumns = [
      {
        title: "Service",
        dataIndex: "serviceName",
        key: "serviceName",
      },
      {
        title: "Type",
        dataIndex: "serviceType",
        key: "serviceType",
        render: (text) => <Tag>{text}</Tag>,
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Unit Price",
        dataIndex: "unitPrice",
        key: "unitPrice",
        render: (amount) => formatCurrency(amount),
      },
      {
        title: "Total",
        dataIndex: "totalAmount",
        key: "totalAmount",
        render: (amount) => <Text strong>{formatCurrency(amount)}</Text>,
      },
    ];

    const paymentsColumns = [
      {
        title: "Type",
        dataIndex: "paymentType",
        key: "paymentType",
        render: (text) => (
          <Tag color="blue">{text.replace("_", " ").toUpperCase()}</Tag>
        ),
      },
      {
        title: "Method",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
        render: (text) => <Tag color="green">{text?.toUpperCase() || "-"}</Tag>,
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (amount) => <Text strong>{formatCurrency(amount)}</Text>,
      },
      {
        title: "Status",
        dataIndex: "paymentStatus",
        key: "paymentStatus",
        render: (status) => (
          <Tag
            color={getStatusColor(status)}
            icon={
              status === "completed" ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              )
            }
          >
            {status.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: "Date",
        dataIndex: "paymentDateTime",
        key: "paymentDateTime",
        render: (date) => formatDateTime(date),
      },
    ];

    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="Booking Details" key="1">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card
                title={
                  <>
                    <HomeOutlined /> Branch Information
                  </>
                }
                size="small"
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Branch">
                    {booking.branchName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Code">
                    {booking.branchCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {booking.branchAddress}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contact">
                    <Space>
                      <PhoneOutlined />
                      {booking.branchContact}
                      <MailOutlined />
                      {booking.branchEmail}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Hours">
                    {booking.operatingHours}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={
                  <>
                    <CalendarOutlined /> Booking Information
                  </>
                }
                size="small"
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Reference">
                    {booking.bookingReference}
                  </Descriptions.Item>
                  <Descriptions.Item label="Source">
                    {booking.source}
                  </Descriptions.Item>
                  <Descriptions.Item label="Guests">
                    {booking.numberOfGuests}
                  </Descriptions.Item>
                  <Descriptions.Item label="Check-in">
                    {formatDateTime(booking.checkInDateTime)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Expected Check-out">
                    {formatDateTime(booking.expectedCheckOutDateTime)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Duration">
                    {booking.stayDuration} {booking.stayDurationType}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Room Details" size="small">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar size={64} src={booking.roomTypeImage} />
                  <div>
                    <Title level={5} className="mb-1">
                      Room {booking.roomNumber}
                    </Title>
                    <Text type="secondary">{booking.roomTypeName}</Text>
                    <div>
                      <Tag color={getStatusColor(booking.roomStatus)}>
                        {booking.roomStatus}
                      </Tag>
                    </div>
                  </div>
                </div>

                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Floor">
                    Floor {booking.floor}
                  </Descriptions.Item>
                  <Descriptions.Item label="Size">
                    {booking.roomSize} sqm
                  </Descriptions.Item>
                  <Descriptions.Item label="Bed">
                    {booking.bedConfiguration}
                  </Descriptions.Item>
                  <Descriptions.Item label="Max Occupancy">
                    {booking.maxOccupancy} guests
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Cleaned">
                    {booking.lastCleaned}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <div>
                  <Text strong>Amenities:</Text>
                  <div className="mt-2">
                    {parseJsonArray(booking.roomTypeAmenities).map(
                      (amenity, index) => (
                        <Tag key={index} className="mb-1">
                          {amenity}
                        </Tag>
                      )
                    )}
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={
                  <>
                    <DollarOutlined /> Financial Summary
                  </>
                }
                size="small"
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Base Amount">
                    {formatCurrency(booking.baseAmount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Discount">
                    {formatCurrency(booking.discountAmount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tax">
                    {formatCurrency(booking.taxAmount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Service Charges">
                    {formatCurrency(booking.serviceChargesAmount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Amount">
                    <Text strong className="text-lg">
                      {formatCurrency(booking.totalAmount)}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Paid">
                    {formatCurrency(booking.totalPaid)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Balance">
                    <Text
                      type={booking.balanceAmount > 0 ? "danger" : "success"}
                    >
                      {formatCurrency(booking.balanceAmount)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Rate">
                    {booking.rateTypeName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Rate Description">
                    {booking.rateTypeDescription}
                  </Descriptions.Item>
                  <Descriptions.Item label="Per Hour">
                    {formatCurrency(booking.rateAmountPerHour)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Additional Charges" key="2">
          <Table
            columns={additionalChargesColumns}
            dataSource={booking.additionalCharges}
            rowKey="chargeId"
            size="small"
            pagination={false}
          />
        </TabPane>

        <TabPane tab="Payments" key="3">
          <Table
            columns={paymentsColumns}
            dataSource={booking.payments}
            rowKey={(record, index) => `${record.paymentId}-${index}`}
            size="small"
            pagination={false}
          />
        </TabPane>

        <TabPane tab="Staff Information" key="4">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Created By" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Username">
                    {booking.createdByUsername}
                  </Descriptions.Item>
                  <Descriptions.Item label="Name">
                    {booking.createdByFirstName} {booking.createdByLastName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Role">
                    {booking.createdByRole}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At">
                    {formatDateTime(booking.createdAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Last Updated By" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Username">
                    {booking.lastUpdatedByUsername || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Name">
                    {booking.lastUpdatedByFirstName &&
                      booking.lastUpdatedByLastName
                      ? `${booking.lastUpdatedByFirstName} ${booking.lastUpdatedByLastName}`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Role">
                    {booking.lastUpdatedByRole || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Updated At">
                    {formatDateTime(booking.updatedAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          Hotel Bookings
        </Title>
        <Paragraph type="secondary">
          Manage and view all hotel bookings across branches
        </Paragraph>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Space>
            Total Bookings
            <Badge count={bookingsData.length} showZero />
          </Space>
          <Space>
            <Button type="primary">Add New Booking</Button>
            <Button icon={<SettingOutlined />}>Settings</Button>
          </Space>
        </div>

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
      </Card>

      <Modal
        title={
          <Space>
            <InfoCircleOutlined />
            Booking Details - {selectedBooking?.bookingReference}
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          <Button key="edit" type="primary">
            Edit Booking
          </Button>,
        ]}
      >
        {renderBookingDetails(selectedBooking)}
      </Modal>
    </div>
  );
};

export default BookingsManagement;
