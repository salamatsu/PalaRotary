import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Table, Badge, Progress, Avatar, Tooltip, Tabs } from 'antd';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Bed,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// Mock data generator
const generateMockData = () => {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const bookings = Array.from({ length: 50 }, (_, i) => ({
    bookingId: `BK${String(i + 1).padStart(4, '0')}`,
    bookingReference: `HTL-${String(i + 1).padStart(6, '0')}`,
    roomNumber: `${Math.floor(Math.random() * 5) + 1}${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
    primaryGuestName: ['John Smith', 'Mary Johnson', 'David Wilson', 'Sarah Brown', 'Mike Davis'][Math.floor(Math.random() * 5)],
    primaryGuestContact: `+63${Math.floor(Math.random() * 1000000000)}`,
    primaryGuestEmail: ['john@email.com', 'mary@email.com', 'david@email.com', 'sarah@email.com', 'mike@email.com'][Math.floor(Math.random() * 5)],
    roomTypeName: ['Standard', 'Deluxe', 'Suite', 'Presidential'][Math.floor(Math.random() * 4)],
    bookingStatus: ['confirmed', 'checkedIn', 'checkedOut', 'cancelled', 'pending'][Math.floor(Math.random() * 5)],
    paymentStatus: ['paid', 'pending', 'partial', 'refunded'][Math.floor(Math.random() * 4)],
    checkInDateTime: new Date(today.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCheckOutDateTime: new Date(today.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: Math.floor(Math.random() * 5000) + 1000,
    numberOfGuests: Math.floor(Math.random() * 4) + 1,
    source: ['Online', 'Phone', 'Walk-in', 'Agency'][Math.floor(Math.random() * 4)]
  }));

  const rooms = Array.from({ length: 20 }, (_, i) => ({
    roomId: i + 1,
    roomNumber: `${Math.floor(i / 4) + 1}${String((i % 4) + 1).padStart(2, '0')}`,
    roomTypeName: ['Standard', 'Deluxe', 'Suite', 'Presidential'][i % 4],
    roomStatus: ['available', 'occupied', 'maintenance', 'cleaning', 'reserved'][Math.floor(Math.random() * 5)],
    floor: Math.floor(i / 4) + 1,
    maxOccupancy: [2, 3, 4, 6][i % 4],
    lastCleaned: new Date(today.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  }));

  return { bookings, rooms, last7Days };
};

const Dashboard = () => {
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [mockData, setMockData] = useState(generateMockData());

  const { bookings, rooms, last7Days } = mockData;

  // Calculate statistics
  const totalBookings = bookings.length;
  const checkedInToday = bookings.filter(b =>
    new Date(b.checkInDateTime).toDateString() === new Date().toDateString() &&
    b.bookingStatus === 'checkedIn'
  ).length;
  const totalRevenue = bookings.reduce((sum, b) => b.bookingStatus !== 'cancelled' ? sum + b.totalAmount : sum, 0);
  const occupancyRate = Math.round((rooms.filter(r => r.roomStatus === 'occupied').length / rooms.length) * 100);

  const availableRooms = rooms.filter(r => r.roomStatus === 'available').length;
  const maintenanceRooms = rooms.filter(r => r.roomStatus === 'maintenance').length;
  const cleaningRooms = rooms.filter(r => r.roomStatus === 'cleaning').length;

  // Chart configurations
  const bookingTrendsConfig = {
    chart: { type: 'line', height: 300 },
    title: { text: 'Booking Trends (Last 7 Days)', style: { fontSize: '16px' } },
    xAxis: {
      categories: last7Days.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    },
    yAxis: { title: { text: 'Number of Bookings' } },
    series: [{
      name: 'Bookings',
      data: last7Days.map(() => Math.floor(Math.random() * 15) + 5),
      color: '#3b82f6'
    }],
    legend: { enabled: false },
    credits: { enabled: false }
  };

  const revenueConfig = {
    chart: { type: 'column', height: 300 },
    title: { text: 'Revenue by Room Type', style: { fontSize: '16px' } },
    xAxis: { categories: ['Standard', 'Deluxe', 'Suite', 'Presidential'] },
    yAxis: { title: { text: 'Revenue (₱)' } },
    series: [{
      name: 'Revenue',
      data: [45000, 68000, 92000, 125000],
      color: '#10b981'
    }],
    legend: { enabled: false },
    credits: { enabled: false }
  };

  const occupancyConfig = {
    chart: { type: 'pie', height: 300 },
    title: { text: 'Room Status Distribution', style: { fontSize: '16px' } },
    series: [{
      name: 'Rooms',
      data: [
        { name: 'Occupied', y: rooms.filter(r => r.roomStatus === 'occupied').length, color: '#ef4444' },
        { name: 'Available', y: availableRooms, color: '#10b981' },
        { name: 'Maintenance', y: maintenanceRooms, color: '#f59e0b' },
        { name: 'Cleaning', y: cleaningRooms, color: '#6366f1' },
        { name: 'Reserved', y: rooms.filter(r => r.roomStatus === 'reserved').length, color: '#8b5cf6' }
      ]
    }],
    credits: { enabled: false }
  };

  const paymentStatusConfig = {
    chart: { type: 'pie', height: 300 },
    title: { text: 'Payment Status Overview', style: { fontSize: '16px' } },
    plotOptions: {
      pie: {
        innerSize: '50%',
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.percentage:.1f}%'
        }
      }
    },
    series: [{
      name: 'Payments',
      data: [
        { name: 'Paid', y: bookings.filter(b => b.paymentStatus === 'paid').length, color: '#10b981' },
        { name: 'Pending', y: bookings.filter(b => b.paymentStatus === 'pending').length, color: '#f59e0b' },
        { name: 'Partial', y: bookings.filter(b => b.paymentStatus === 'partial').length, color: '#6366f1' },
        { name: 'Refunded', y: bookings.filter(b => b.paymentStatus === 'refunded').length, color: '#ef4444' }
      ]
    }],
    credits: { enabled: false }
  };

  // Table columns
  const bookingColumns = [
    {
      title: 'Booking Ref',
      dataIndex: 'bookingReference',
      key: 'bookingReference',
      render: (text) => <span className="font-mono text-sm">{text}</span>
    },
    {
      title: 'Guest',
      dataIndex: 'primaryGuestName',
      key: 'primaryGuestName',
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <Avatar size={32} style={{ backgroundColor: '#3b82f6' }}>
            {text.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.primaryGuestContact}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Room',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.roomTypeName}</div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      render: (status) => {
        const statusConfig = {
          confirmed: { color: 'blue', icon: CheckCircle },
          checkedIn: { color: 'green', icon: UserCheck },
          checkedOut: { color: 'gray', icon: CheckCircle },
          cancelled: { color: 'red', icon: XCircle },
          pending: { color: 'orange', icon: Clock }
        };
        const config = statusConfig[status];
        const IconComponent = config.icon;
        return (
          <Badge
            color={config.color}
            text={
              <span className="flex items-center space-x-1">
                <IconComponent size={12} />
                <span className="capitalize">{status}</span>
              </span>
            }
          />
        );
      }
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => {
        const colors = { paid: 'green', pending: 'orange', partial: 'blue', refunded: 'red' };
        return <Badge color={colors[status]} text={status.charAt(0).toUpperCase() + status.slice(1)} />;
      }
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span className="font-medium">₱{amount.toLocaleString()}</span>
    },
    {
      title: 'Check-in',
      dataIndex: 'checkInDateTime',
      key: 'checkInDateTime',
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  const roomColumns = [
    {
      title: 'Room',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      render: (text, record) => (
        <div>
          <div className="font-medium text-lg">{text}</div>
          <div className="text-xs text-gray-500">Floor {record.floor}</div>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'roomTypeName',
      key: 'roomTypeName',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">Max {record.maxOccupancy} guests</div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'roomStatus',
      key: 'roomStatus',
      render: (status) => {
        const statusConfig = {
          available: { color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
          occupied: { color: 'red', bg: 'bg-red-100', text: 'text-red-800' },
          maintenance: { color: 'orange', bg: 'bg-orange-100', text: 'text-orange-800' },
          cleaning: { color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
          reserved: { color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800' }
        };
        const config = statusConfig[status];
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      title: 'Last Cleaned',
      dataIndex: 'lastCleaned',
      key: 'lastCleaned',
      render: (date) => {
        const cleanedDate = new Date(date);
        const hoursAgo = Math.floor((new Date() - cleanedDate) / (1000 * 60 * 60));
        return (
          <div>
            <div>{cleanedDate.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{hoursAgo}h ago</div>
          </div>
        );
      }
    }
  ];

  const handleRefresh = () => {
    setMockData(generateMockData());
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Receptionist Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening at your hotel today.</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
            <Select
              value={selectedBranch}
              onChange={setSelectedBranch}
              className="w-40"
              suffixIcon={<MapPin size={16} />}
            >
              <Option value="all">All Branches</Option>
              <Option value="main">Main Branch</Option>
              <Option value="north">North Branch</Option>
            </Select>
            <RangePicker
              value={selectedDateRange}
              onChange={setSelectedDateRange}
              className="w-64"
            />
            <Tooltip title="Refresh Data">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Key Metrics */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Today's Check-ins"
                value={checkedInToday}
                prefix={<UserCheck className="text-blue-500" size={24} />}
                valueStyle={{ color: '#3b82f6', fontSize: '28px' }}
              />
              <div className="mt-2 text-sm text-gray-500">
                +12% from yesterday
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Total Bookings"
                value={totalBookings}
                prefix={<Calendar className="text-green-500" size={24} />}
                valueStyle={{ color: '#10b981', fontSize: '28px' }}
              />
              <div className="mt-2 text-sm text-gray-500">
                Active reservations
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Revenue Today"
                value={totalRevenue}
                prefix="₱"
                precision={0}
                valueStyle={{ color: '#f59e0b', fontSize: '28px' }}
              />
              <div className="mt-2 text-sm text-gray-500">
                <TrendingUp size={12} className="inline mr-1" />
                +8% from last week
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-lg transition-shadow">
              <Statistic
                title="Occupancy Rate"
                value={occupancyRate}
                suffix="%"
                prefix={<Bed className="text-purple-500" size={24} />}
                valueStyle={{ color: '#8b5cf6', fontSize: '28px' }}
              />
              <div className="mt-2">
                <Progress
                  percent={occupancyRate}
                  showInfo={false}
                  strokeColor="#8b5cf6"
                  size="small"
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Room Status Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={12} sm={6}>
            <Card className="text-center hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="text-2xl font-bold text-green-600">{availableRooms}</div>
              <div className="text-sm text-gray-600">Available Rooms</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center hover:shadow-lg transition-shadow border-l-4 border-red-500">
              <div className="text-2xl font-bold text-red-600">{rooms.filter(r => r.roomStatus === 'occupied').length}</div>
              <div className="text-sm text-gray-600">Occupied Rooms</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center hover:shadow-lg transition-shadow border-l-4 border-orange-500">
              <div className="text-2xl font-bold text-orange-600">{maintenanceRooms}</div>
              <div className="text-sm text-gray-600">Maintenance</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="text-center hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-blue-600">{cleaningRooms}</div>
              <div className="text-sm text-gray-600">Cleaning</div>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card title="Booking Trends" className="hover:shadow-lg transition-shadow">
              <HighchartsReact
                highcharts={Highcharts}
                options={bookingTrendsConfig}
                key={`booking-trends-${refreshKey}`}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Revenue by Room Type" className="hover:shadow-lg transition-shadow">
              <HighchartsReact
                highcharts={Highcharts}
                options={revenueConfig}
                key={`revenue-${refreshKey}`}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card title="Room Status Distribution" className="hover:shadow-lg transition-shadow">
              <HighchartsReact
                highcharts={Highcharts}
                options={occupancyConfig}
                key={`occupancy-${refreshKey}`}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Payment Status" className="hover:shadow-lg transition-shadow">
              <HighchartsReact
                highcharts={Highcharts}
                options={paymentStatusConfig}
                key={`payment-${refreshKey}`}
              />
            </Card>
          </Col>
        </Row>

        {/* Data Tables */}
        <Card className="hover:shadow-lg transition-shadow">
          <Tabs defaultActiveKey="bookings" className="w-full">
            <TabPane
              tab={
                <span className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Recent Bookings</span>
                  <Badge count={bookings.filter(b => b.bookingStatus === 'pending').length} />
                </span>
              }
              key="bookings"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <Select placeholder="Filter by Status" className="w-40" allowClear>
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="checkedIn">Checked In</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
                <Select placeholder="Filter by Payment" className="w-40" allowClear>
                  <Option value="paid">Paid</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="partial">Partial</Option>
                </Select>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                  <Download size={16} />
                  Export
                </button>
              </div>
              <Table
                columns={bookingColumns}
                dataSource={bookings.slice(0, 10)}
                rowKey="bookingId"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </TabPane>
            <TabPane
              tab={
                <span className="flex items-center space-x-2">
                  <Bed size={16} />
                  <span>Room Status</span>
                  <Badge count={maintenanceRooms + cleaningRooms} />
                </span>
              }
              key="rooms"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <Select placeholder="Filter by Status" className="w-40" allowClear>
                  <Option value="available">Available</Option>
                  <Option value="occupied">Occupied</Option>
                  <Option value="maintenance">Maintenance</Option>
                  <Option value="cleaning">Cleaning</Option>
                </Select>
                <Select placeholder="Filter by Floor" className="w-40" allowClear>
                  <Option value="1">Floor 1</Option>
                  <Option value="2">Floor 2</Option>
                  <Option value="3">Floor 3</Option>
                </Select>
              </div>
              <Table
                columns={roomColumns}
                dataSource={rooms}
                rowKey="roomId"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 600 }}
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions" className="mt-8 hover:shadow-lg transition-shadow">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <button className="w-full p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex flex-col items-center space-y-2">
                <UserCheck size={24} />
                <span>New Check-in</span>
              </button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <button className="w-full p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex flex-col items-center space-y-2">
                <Calendar size={24} />
                <span>New Booking</span>
              </button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <button className="w-full p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex flex-col items-center space-y-2">
                <AlertCircle size={24} />
                <span>Room Maintenance</span>
              </button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <button className="w-full p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex flex-col items-center space-y-2">
                <DollarSign size={24} />
                <span>Process Payment</span>
              </button>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;