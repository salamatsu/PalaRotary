import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Bed,
  DollarSign,
  Calendar,
  Clock,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Home,
  Settings,
  Package,
  Star,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';

// Mock data based on your provided structure
const mockData = {
  branches: [
    {
      branchId: 1,
      branchCode: "SOGO-EDSA-CUB",
      branchName: "Hotel Sogo EDSA Cubao",
      address: "1234 EDSA, Cubao, Quezon City",
      city: "Quezon City",
      region: "Metro Manila",
      contactNumber: "+63-2-8123-4567",
      email: "cubao@hotelsogo.com",
      operatingHours: "24/7",
      isActive: true
    }
  ],
  roomTypes: [
    { roomTypeId: 1, roomTypeName: "Premium Room", maxOccupancy: 2, roomSize: "15 sqm" },
    { roomTypeId: 2, roomTypeName: "Deluxe Room", maxOccupancy: 2, roomSize: "20 sqm" },
    { roomTypeId: 3, roomTypeName: "Executive Room", maxOccupancy: 2, roomSize: "25 sqm" },
    { roomTypeId: 4, roomTypeName: "Regency Room", maxOccupancy: 4, roomSize: "35 sqm" }
  ],
  rooms: [
    { roomId: 1, roomNumber: "101", floor: "1", roomTypeId: 1, roomStatus: "available" },
    { roomId: 2, roomNumber: "102", floor: "1", roomTypeId: 2, roomStatus: "occupied" },
    { roomId: 3, roomNumber: "201", floor: "2", roomTypeId: 3, roomStatus: "cleaning" }
  ],
  bookings: [
    {
      bookingId: 1,
      bookingReference: "SOGO2025073100001",
      roomId: 2,
      numberOfGuests: 2,
      checkInDateTime: "2025-07-31T14:00:00Z",
      expectedCheckOutDateTime: "2025-08-01T14:00:00Z",
      bookingStatus: "checked_in",
      paymentStatus: "paid",
      totalAmount: 1680.0,
      source: "walk_in"
    }
  ],
  payments: [
    {
      paymentId: 1,
      bookingId: 1,
      amount: 1680.0,
      paymentMethod: "cash",
      paymentStatus: "completed"
    },
    {
      paymentId: 2,
      bookingId: 1,
      amount: 250.0,
      paymentMethod: "cash",
      paymentStatus: "completed"
    }
  ],
  walkInQueue: [
    {
      queueId: 1,
      guestName: "Maria Santos",
      numberOfGuests: 2,
      preferredRoomType: 3,
      estimatedWaitTime: 45,
      status: "waiting"
    }
  ],
  housekeeping: [
    {
      housekeepingId: 1,
      roomId: 3,
      taskType: "checkout_cleaning",
      status: "in_progress",
      priority: "high"
    }
  ],
  inventoryItems: [
    { itemId: 1, itemName: "Bed Sheet Set", currentStock: 45, minimumStock: 20, category: "linens" },
    { itemId: 2, itemName: "Towel Set", currentStock: 68, minimumStock: 30, category: "linens" },
    { itemId: 3, itemName: "Shampoo Sachets", currentStock: 150, minimumStock: 50, category: "toiletries" }
  ],
  promotions: [
    { promoId: 1, promoCode: "LONGSTAY", promoName: "Long Stay Discount", discountValue: 10.0, currentUsage: 45 },
    { promoId: 2, promoCode: "FRONTLINER", promoName: "Frontliner Discount", discountValue: 20.0, currentUsage: 178 }
  ]
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-900",
    red: "bg-red-50 border-red-200 text-red-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900"
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-sm opacity-60 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full bg-white bg-opacity-50">
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4 text-sm">
          <TrendingUp size={16} className="mr-1" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, action, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    purple: "bg-purple-500 hover:bg-purple-600",
    orange: "bg-orange-500 hover:bg-orange-600"
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <button
            onClick={action}
            className={`${colorClasses[color]} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
          >
            View Details
          </button>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <Icon size={24} className="text-gray-600" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');

  // Calculate metrics from mock data
  const metrics = useMemo(() => {
    const totalRooms = mockData.rooms.length;
    const occupiedRooms = mockData.rooms.filter(room => room.roomStatus === 'occupied').length;
    const availableRooms = mockData.rooms.filter(room => room.roomStatus === 'available').length;
    const cleaningRooms = mockData.rooms.filter(room => room.roomStatus === 'cleaning').length;

    const occupancyRate = ((occupiedRooms / totalRooms) * 100).toFixed(1);

    const totalRevenue = mockData.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const activeBookings = mockData.bookings.filter(booking => booking.bookingStatus === 'checked_in').length;

    const lowStockItems = mockData.inventoryItems.filter(item => item.currentStock <= item.minimumStock).length;
    const pendingHousekeeping = mockData.housekeeping.filter(task => task.status === 'in_progress').length;

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      cleaningRooms,
      occupancyRate,
      totalRevenue,
      activeBookings,
      lowStockItems,
      pendingHousekeeping,
      waitingGuests: mockData.walkInQueue.length,
      activeBranches: mockData.branches.filter(branch => branch.isActive).length,
      activePromotions: mockData.promotions.length
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Hotel Sogo Management System</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`₱${metrics.totalRevenue.toLocaleString()}`}
            subtitle="Today's earnings"
            icon={DollarSign}
            trend="+12% from yesterday"
            color="green"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${metrics.occupancyRate}%`}
            subtitle={`${metrics.occupiedRooms}/${metrics.totalRooms} rooms`}
            icon={Bed}
            trend="+5% from last week"
            color="blue"
          />
          <StatCard
            title="Active Bookings"
            value={metrics.activeBookings}
            subtitle="Currently checked in"
            icon={UserCheck}
            color="purple"
          />
          <StatCard
            title="Active Branches"
            value={metrics.activeBranches}
            subtitle="Operational locations"
            icon={Building2}
            color="indigo"
          />
        </div>

        {/* Operations Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Room Status Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metrics.availableRooms}</div>
                  <div className="text-sm text-green-700">Available</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics.occupiedRooms}</div>
                  <div className="text-sm text-blue-700">Occupied</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{metrics.cleaningRooms}</div>
                  <div className="text-sm text-yellow-700">Cleaning</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{metrics.totalRooms}</div>
                  <div className="text-sm text-gray-700">Total Rooms</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
            <div className="space-y-3">
              {metrics.lowStockItems > 0 && (
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <AlertTriangle size={20} className="text-red-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-red-900">{metrics.lowStockItems} Low Stock Items</div>
                    <div className="text-xs text-red-700">Requires immediate attention</div>
                  </div>
                </div>
              )}
              {metrics.pendingHousekeeping > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <Clock size={20} className="text-yellow-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-yellow-900">{metrics.pendingHousekeeping} Pending Cleaning</div>
                    <div className="text-xs text-yellow-700">In progress</div>
                  </div>
                </div>
              )}
              {metrics.waitingGuests > 0 && (
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <Users size={20} className="text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">{metrics.waitingGuests} Guests Waiting</div>
                    <div className="text-xs text-blue-700">Walk-in queue</div>
                  </div>
                </div>
              )}
              {metrics.lowStockItems === 0 && metrics.pendingHousekeeping === 0 && metrics.waitingGuests === 0 && (
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle size={20} className="text-green-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-green-900">All Systems Normal</div>
                    <div className="text-xs text-green-700">No urgent alerts</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Branch Management"
              description="Manage all hotel branches and locations"
              icon={Building2}
              action={() => console.log('Navigate to branches')}
              color="blue"
            />
            <QuickActionCard
              title="User Management"
              description="Manage staff accounts and permissions"
              icon={Users}
              action={() => console.log('Navigate to users')}
              color="green"
            />
            <QuickActionCard
              title="Inventory Control"
              description="Monitor and manage inventory across branches"
              icon={Package}
              action={() => console.log('Navigate to inventory')}
              color="purple"
            />
            <QuickActionCard
              title="Promotions"
              description="Create and manage promotional campaigns"
              icon={Star}
              action={() => console.log('Navigate to promotions')}
              color="orange"
            />
          </div>
        </div>

        {/* Recent Activity & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance</h2>
            <div className="space-y-4">
              {mockData.branches.map((branch) => (
                <div key={branch.branchId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{branch.branchName}</div>
                    <div className="text-sm text-gray-600">{branch.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">₱{metrics.totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{metrics.occupancyRate}% occupied</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Room Types</span>
                <span className="font-semibold">{mockData.roomTypes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Promotions</span>
                <span className="font-semibold">{metrics.activePromotions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inventory Categories</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Methods</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Uptime</span>
                <span className="font-semibold text-green-600">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;