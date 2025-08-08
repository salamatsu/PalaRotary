import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Col,
  Row,
  Statistic,
  Tag,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import { apiService } from '../services/api/api';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: apiService.getRooms,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: apiService.getBookings,
  });

  const { data: guests = [] } = useQuery({
    queryKey: ['guests'],
    queryFn: apiService.getGuests,
  });

  // Calculate statistics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
  const availableRooms = rooms.filter(room => room.status === 'available').length;
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter(booking =>
    dayjs(booking.checkIn).isSame(dayjs(), 'day')
  ).length;

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">Dashboard</Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col span={6}>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <Statistic
              title={<span className="text-blue-100">Total Rooms</span>}
              value={totalRooms}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <Statistic
              title={<span className="text-green-100">Available Rooms</span>}
              value={availableRooms}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <Statistic
              title={<span className="text-purple-100">Total Bookings</span>}
              value={totalBookings}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <Statistic
              title={<span className="text-orange-100">Today's Check-ins</span>}
              value={todayBookings}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Recent Bookings" className="h-96">
            <div className="space-y-3">
              {bookings.slice(0, 5).map(booking => (
                <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <Text strong>{booking.guestName}</Text>
                    <br />
                    <Text type="secondary">Room {booking.roomNumber}</Text>
                  </div>
                  <div className="text-right">
                    <Text>{dayjs(booking.checkIn).format('MMM DD')}</Text>
                    <br />
                    <Tag color={booking.status === 'confirmed' ? 'green' : 'orange'}>
                      {booking.status}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Room Status Overview" className="h-96">
            <div className="space-y-4">
              {rooms.map(room => (
                <div key={room.id} className="flex justify-between items-center">
                  <Text>Room {room.number}</Text>
                  <div className="flex items-center space-x-2">
                    <Text type="secondary">{room.type}</Text>
                    <Tag color={
                      room.status === 'available' ? 'green' :
                        room.status === 'occupied' ? 'red' : 'orange'
                    }>
                      {room.status}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;