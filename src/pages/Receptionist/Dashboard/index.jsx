import { useEffect, useState } from 'react';
import { useReceptionistAuthStore } from '../../../store/hotelStore';
// import { bookingsAPI, queueAPI, roomsAPI } from '../services/api';

function Dashboard() {
  const { userData, reset } = useReceptionistAuthStore();
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    cleaningRooms: 0,
    todayBookings: 0,
    walkInQueue: 0
  });
  const [rooms, setRooms] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [walkInQueue, setWalkInQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load rooms
      const roomsResponse = await roomsAPI.getAll();
      const roomsData = roomsResponse.data;
      setRooms(roomsData);

      // Calculate room statistics
      const totalRooms = roomsData.length;
      const occupiedRooms = roomsData.filter(room => room.roomStatus === 'occupied').length;
      const availableRooms = roomsData.filter(room => room.roomStatus === 'available').length;
      const cleaningRooms = roomsData.filter(room => room.roomStatus === 'cleaning').length;

      // Load recent bookings
      const bookingsResponse = await bookingsAPI.getAll({ limit: 10 });
      const bookingsData = bookingsResponse.data;
      setRecentBookings(bookingsData);

      // Load walk-in queue
      const queueResponse = await queueAPI.getQueue();
      const queueData = queueResponse.data;
      setWalkInQueue(queueData);

      setStats({
        totalRooms,
        occupiedRooms,
        availableRooms,
        cleaningRooms,
        todayBookings: bookingsData.filter(booking => {
          const today = new Date().toDateString();
          const bookingDate = new Date(booking.createdAt).toDateString();
          return today === bookingDate;
        }).length,
        walkInQueue: queueData.length
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked_in': return 'bg-green-100 text-green-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hotel Sogo Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {userData.firstName || userData.username} ({userData.role})
              </p>
            </div>
            <button
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{stats.totalRooms}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Rooms</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalRooms}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{stats.availableRooms}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.availableRooms}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{stats.occupiedRooms}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Occupied</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.occupiedRooms}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{stats.cleaningRooms}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Cleaning</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.cleaningRooms}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{stats.todayBookings}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Today's Bookings</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.todayBookings}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{stats.walkInQueue}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Queue</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.walkInQueue}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rooms Status */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Room Status</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Current status of all rooms</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {rooms.slice(0, 8).map((room) => (
                <li key={room.roomId}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">{room.roomNumber}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Room {room.roomNumber}</div>
                        <div className="text-sm text-gray-500">{room.roomTypeName} - Floor {room.floor}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoomStatusColor(room.roomStatus)}`}>
                        {room.roomStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest booking activities</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {recentBookings.slice(0, 8).map((booking) => (
                <li key={booking.bookingId}>
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.bookingReference}
                        </div>
                        <div className="text-sm text-gray-500">
                          Room {booking.roomNumber} - {booking.roomTypeName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(booking.bookingStatus)}`}>
                          {booking.bookingStatus.replace('_', ' ').toUpperCase()}
                        </span>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          ₱{booking.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Walk-in Queue */}
        {walkInQueue.length > 0 && (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Walk-in Queue</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Guests waiting for available rooms</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {walkInQueue.map((guest, index) => (
                <li key={guest.queueId}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{guest.guestName}</div>
                        <div className="text-sm text-gray-500">
                          {guest.numberOfGuests} guest(s) - {guest.roomTypeName || 'Any room type'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Wait: {guest.estimatedWaitTime} min
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;