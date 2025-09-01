import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Badge, Avatar, List, Typography, Divider, Button, Tag } from 'antd';
import {
  Bed,
  Users,
  Calendar,
  DollarSign,
  Clock,
  UserCheck,
  UserX,
  Sparkles,
  Settings,
  AlertTriangle,
  TrendingUp,
  Home,
  Phone,
  User
} from 'lucide-react';

const { Title, Text } = Typography;

// Mock data generator
const generateMockData = () => {
  return {
    roomStatus: [
      { roomStatus: 'available', count: 15 },
      { roomStatus: 'occupied', count: 22 },
      { roomStatus: 'cleaning', count: 5 },
      { roomStatus: 'maintenance', count: 2 },
      { roomStatus: 'out_of_order', count: 1 }
    ],
    todayBookings: [
      { bookingStatus: 'confirmed', count: 8, totalRevenue: 12500.00 },
      { bookingStatus: 'checked_in', count: 22, totalRevenue: 45600.00 },
      { bookingStatus: 'checked_out', count: 15, totalRevenue: 28900.00 },
      { bookingStatus: 'cancelled', count: 2, totalRevenue: 0 },
      { bookingStatus: 'no_show', count: 1, totalRevenue: 0 }
    ],
    currentOccupancy: [
      { occupiedRooms: 22, totalRooms: 45 }
    ],
    pendingCheckouts: [
      { count: 8 }
    ],
    walkInQueue: [
      { count: 3 }
    ]
  };
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockData();
      setDashboardData(mockData);
      setLoading(false);
    };

    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} loading className="shadow-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Process data for display
  const roomStatusData = dashboardData.roomStatus.reduce((acc, item) => {
    acc[item.roomStatus] = item.count;
    return acc;
  }, {});

  const bookingData = dashboardData.todayBookings.reduce((acc, item) => {
    acc[item.bookingStatus] = { count: item.count, revenue: item.totalRevenue };
    return acc;
  }, {});

  const occupancyData = dashboardData.currentOccupancy[0];
  const occupancyRate = ((occupancyData.occupiedRooms / occupancyData.totalRooms) * 100).toFixed(1);

  const totalRevenue = dashboardData.todayBookings.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalBookings = dashboardData.todayBookings.reduce((sum, item) => sum + item.count, 0);
  const pendingCheckouts = dashboardData.pendingCheckouts[0].count;
  const walkInQueue = dashboardData.walkInQueue[0].count;

  // Room status configuration
  const roomStatusConfig = {
    available: { color: '#52c41a', icon: Home, label: 'Available' },
    occupied: { color: '#1890ff', icon: Users, label: 'Occupied' },
    cleaning: { color: '#faad14', icon: Sparkles, label: 'Cleaning' },
    maintenance: { color: '#ff7875', icon: Settings, label: 'Maintenance' },
    out_of_order: { color: '#f5222d', icon: AlertTriangle, label: 'Out of Order' }
  };

  const getOccupancyColor = (rate) => {
    if (rate >= 90) return '#f5222d';
    if (rate >= 75) return '#faad14';
    return '#52c41a';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="!mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reception Dashboard
              </Title>
              <Text type="secondary" className="text-lg">
                Welcome back! Here's what's happening today
              </Text>
            </div>
            <div className="flex items-center space-x-4">
              <Badge dot status="processing">
                <Button type="primary" className="shadow-lg">
                  Live Updates
                </Button>
              </Badge>
              <Text type="secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Text>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-400 to-green-600 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-700 text-sm font-medium mb-2">Today's Revenue</div>
                  <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
                  <div className="text-green-700 text-xs mt-1 flex items-center">
                    <TrendingUp size={12} className="mr-1" />
                    +12.5% from yesterday
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <DollarSign size={32} />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-400 to-blue-600 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-700 text-sm font-medium mb-2">Room Occupancy</div>
                  <div className="text-3xl font-bold">{occupancyRate}%</div>
                  <div className="text-blue-700 text-xs mt-1">
                    {occupancyData.occupiedRooms} of {occupancyData.totalRooms} rooms
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Bed size={32} />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-400 to-purple-600 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-purple-700 text-sm font-medium mb-2">Today's Bookings</div>
                  <div className="text-3xl font-bold">{totalBookings}</div>
                  <div className="text-purple-700 text-xs mt-1">
                    {bookingData.confirmed?.count || 0} pending check-in
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Calendar size={32} />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-400 to-orange-600 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-orange-700 text-sm font-medium mb-2">Pending Actions</div>
                  <div className="text-3xl font-bold">{pendingCheckouts + walkInQueue}</div>
                  <div className="text-orange-700 text-xs mt-1">
                    {pendingCheckouts} checkouts, {walkInQueue} in queue
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Clock size={32} />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Detailed Information Row */}
        <Row gutter={[24, 24]}>
          {/* Room Status Breakdown */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center">
                  <Home className="mr-2" size={20} />
                  Room Status Overview
                </div>
              }
              className="shadow-xl border-0 h-full"
              extra={
                <Badge count={roomStatusData.maintenance + roomStatusData.out_of_order}
                  style={{ backgroundColor: '#ff4d4f' }}>
                  <Button type="text" size="small">View All Rooms</Button>
                </Badge>
              }
            >
              <div className="space-y-4">
                {Object.entries(roomStatusConfig).map(([status, config]) => {
                  const count = roomStatusData[status] || 0;
                  const Icon = config.icon;
                  const percentage = ((count / occupancyData.totalRooms) * 100).toFixed(1);

                  return (
                    <div key={status} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div
                          className="p-2 rounded-full"
                          style={{ backgroundColor: `${config.color}20` }}
                        >
                          <Icon size={20} style={{ color: config.color }} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{config.label}</div>
                          <div className="text-sm text-gray-500">{percentage}% of total rooms</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: config.color }}>{count}</div>
                        <div className="text-xs text-gray-400">rooms</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Divider />

              <div className="text-center">
                <Progress
                  type="circle"
                  percent={parseFloat(occupancyRate)}
                  strokeColor={getOccupancyColor(occupancyRate)}
                  format={percent => `${percent}%`}
                  width={120}
                />
                <div className="mt-2 text-sm text-gray-500">Current Occupancy Rate</div>
              </div>
            </Card>
          </Col>

          {/* Booking Status & Queue */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center">
                  <Users className="mr-2" size={20} />
                  Today's Activity
                </div>
              }
              className="shadow-xl border-0 h-full"
            >
              <div className="space-y-6">
                {/* Booking Status */}
                <div>
                  <Title level={5} className="!mb-4">Booking Status</Title>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <UserCheck size={24} className="mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-600">
                          {bookingData.checked_in?.count || 0}
                        </div>
                        <div className="text-sm text-gray-600">Checked In</div>
                        <div className="text-xs text-gray-400">
                          {formatCurrency(bookingData.checked_in?.revenue || 0)}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <UserX size={24} className="mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">
                          {bookingData.checked_out?.count || 0}
                        </div>
                        <div className="text-sm text-gray-600">Checked Out</div>
                        <div className="text-xs text-gray-400">
                          {formatCurrency(bookingData.checked_out?.revenue || 0)}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                <Divider />

                {/* Quick Actions */}
                <div>
                  <Title level={5} className="!mb-4">Quick Actions</Title>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="primary"
                      size="large"
                      className="h-16 flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 border-0"
                      danger={pendingCheckouts > 5}
                    >
                      <Clock size={20} className="mb-1" />
                      <span className="text-sm">Checkouts ({pendingCheckouts})</span>
                    </Button>

                    <Button
                      type="default"
                      size="large"
                      className="h-16 flex flex-col items-center justify-center border-dashed"
                      danger={walkInQueue > 2}
                    >
                      <Phone size={20} className="mb-1" />
                      <span className="text-sm">Queue ({walkInQueue})</span>
                    </Button>
                  </div>
                </div>

                {/* Recent Activity Preview */}
                <div>
                  <Title level={5} className="!mb-4">Recent Activity</Title>
                  <List
                    size="small"
                    dataSource={[
                      { action: 'Check-in', guest: 'Receptionist', room: '301', time: '10:30 AM', type: 'checkin' },
                      { action: 'Payment', guest: 'Bell boy', room: '205', time: '10:15 AM', type: 'payment' },
                      { action: 'Check-out', guest: 'Bell boy', room: '108', time: '09:45 AM', type: 'checkout' },
                    ]}
                    renderItem={item => (
                      <List.Item className="hover:bg-gray-50 px-2 rounded">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <Avatar
                              size="small"
                              style={{
                                backgroundColor: item.type === 'checkin' ? '#52c41a' :
                                  item.type === 'payment' ? '#1890ff' : '#faad14'
                              }}
                            >
                              <User size={14} />
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{item.action} - {item.guest}</div>
                              <div className="text-xs text-gray-500">Room {item.room}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">{item.time}</div>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Dashboard;