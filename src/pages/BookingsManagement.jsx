import {
  PlusOutlined
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { apiService } from '../services/api/api';

const { Title, } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const BookingsManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: apiService.getBookings,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: apiService.getRooms,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: apiService.createBooking,
    onSuccess: () => {
      message.success('Booking created successfully!');
      queryClient.invalidateQueries(['bookings']);
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to create booking');
    }
  });

  const handleCreateBooking = (values) => {
    const booking = {
      ...values,
      checkIn: values.dateRange[0].format('YYYY-MM-DD'),
      checkOut: values.dateRange[1].format('YYYY-MM-DD'),
      status: 'confirmed',
      createdAt: dayjs().toISOString()
    };
    delete booking.dateRange;
    createBookingMutation.mutate(booking);

    // Update room status to occupied
    const { updateRoom } = useHotelStore.getState();
    const room = rooms.find(r => r.number === values.roomNumber);
    if (room) {
      updateRoom(room.id, { status: 'occupied' });
    }
  };

  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Guest Name',
      dataIndex: 'guestName',
      key: 'guestName',
    },
    {
      title: 'Room Number',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      width: 120,
    },
    {
      title: 'Check In',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'confirmed' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small">Edit</Button>
          <Button type="link" danger size="small">Cancel</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Bookings Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="bg-blue-600"
        >
          New Booking
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={bookings}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Create Booking Modal */}
      <Modal
        title="Create New Booking"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateBooking}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="guestName"
                label="Guest Name"
                rules={[{ required: true, message: 'Please enter guest name' }]}
              >
                <Input placeholder="Enter guest name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="guestEmail"
                label="Guest Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roomNumber"
                label="Room"
                rules={[{ required: true, message: 'Please select a room' }]}
              >
                <Select placeholder="Select room">
                  {rooms.filter(room => room.status === 'available').map(room => (
                    <Option key={room.id} value={room.number}>
                      Room {room.number} - {room.type} (₱{room.price.toLocaleString()})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="guestPhone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dateRange"
            label="Check-in / Check-out Dates"
            rules={[{ required: true, message: 'Please select dates' }]}
          >
            <RangePicker
              className="w-full"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createBookingMutation.isLoading}
                className="bg-blue-600"
              >
                Create Booking
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookingsManagement;