import React, { useState } from 'react';
import { FaUsers, FaCalendar, FaExclamationTriangle, FaDollarSign, FaCheckCircle, FaBan } from 'react-icons/fa';
import Card from '../../components/Card';
import Modal from '../../components/Modal';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'PROVIDER';
  verified: boolean;
  status: 'active' | 'suspended';
  joinedDate: string;
}

interface Booking {
  id: number;
  customerName: string;
  providerName: string;
  service: string;
  date: string;
  amount: number;
  status: 'completed' | 'upcoming' | 'cancelled';
}

interface Dispute {
  id: number;
  bookingId: number;
  reportedBy: string;
  against: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'disputes'>('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const stats = {
    totalUsers: 1250,
    totalProviders: 180,
    totalCustomers: 1070,
    totalBookings: 3450,
    activeBookings: 45,
    totalRevenue: 125000,
    pendingDisputes: 5,
  };

  const users: User[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'PROVIDER',
      verified: true,
      status: 'active',
      joinedDate: '2023-12-01',
    },
    {
      id: 2,
      name: 'John Smith',
      email: 'john@example.com',
      role: 'CUSTOMER',
      verified: true,
      status: 'active',
      joinedDate: '2024-01-10',
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike@example.com',
      role: 'PROVIDER',
      verified: false,
      status: 'active',
      joinedDate: '2024-01-15',
    },
  ];

  const bookings: Booking[] = [
    {
      id: 1,
      customerName: 'John Smith',
      providerName: 'Sarah Johnson',
      service: 'Deep Cleaning',
      date: '2024-01-25',
      amount: 135,
      status: 'upcoming',
    },
    {
      id: 2,
      customerName: 'Emily Davis',
      providerName: 'Michael Chen',
      service: 'Regular Cleaning',
      date: '2024-01-20',
      amount: 90,
      status: 'completed',
    },
  ];

  const disputes: Dispute[] = [
    {
      id: 1,
      bookingId: 123,
      reportedBy: 'John Smith',
      against: 'Sarah Johnson',
      reason: 'Service not completed as agreed',
      status: 'pending',
      createdAt: '2024-01-22',
    },
    {
      id: 2,
      bookingId: 124,
      reportedBy: 'Sarah Johnson',
      against: 'Mike Brown',
      reason: 'Customer was not present at scheduled time',
      status: 'pending',
      createdAt: '2024-01-21',
    },
  ];

  const handleSuspendUser = (userId: number) => {
    console.log('Suspending user:', userId);
    setShowUserModal(false);
  };

  const handleVerifyUser = (userId: number) => {
    console.log('Verifying user:', userId);
    setShowUserModal(false);
  };

  const handleResolveDispute = (disputeId: number) => {
    console.log('Resolving dispute:', disputeId);
    setShowDisputeModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Stats Grid */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.totalProviders} providers</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaUsers className="text-blue-600 text-2xl" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalBookings}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.activeBookings} active</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaCalendar className="text-purple-600 text-2xl" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaDollarSign className="text-green-600 text-2xl" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Disputes</p>
                    <p className="text-3xl font-bold text-red-600">{stats.pendingDisputes}</p>
                    <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <FaExclamationTriangle className="text-red-600 text-2xl" />
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['overview', 'users', 'bookings', 'disputes'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-6 py-4 font-medium whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'PROVIDER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex items-center space-x-2">
                              {user.verified && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                  ✓ Verified
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">{user.joinedDate}</td>
                          <td className="px-4 py-4 text-sm">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Management</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">#{booking.id}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{booking.customerName}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{booking.providerName}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{booking.service}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{booking.date}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-green-600">${booking.amount}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Disputes Tab */}
            {activeTab === 'disputes' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Dispute Management</h2>
                
                <div className="space-y-4">
                  {disputes.map(dispute => (
                    <Card key={dispute.id}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">Dispute #{dispute.id}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              dispute.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {dispute.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Reported by:</strong> {dispute.reportedBy} | <strong>Against:</strong> {dispute.against}
                          </p>
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Reason:</strong> {dispute.reason}
                          </p>
                          <p className="text-xs text-gray-500">
                            Booking ID: #{dispute.bookingId} | Created: {dispute.createdAt}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setShowDisputeModal(true);
                          }}
                          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <FaUsers className="text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">New provider registered</p>
                        <p className="text-xs text-gray-600">Mike Wilson joined as a cleaning provider</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <FaCheckCircle className="text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Booking completed</p>
                        <p className="text-xs text-gray-600">Sarah Johnson completed a booking for John Smith</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <FaExclamationTriangle className="text-red-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">New dispute filed</p>
                        <p className="text-xs text-gray-600">Dispute #1 requires your attention</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={`Manage User: ${selectedUser?.name}`}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium">{selectedUser.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium">{selectedUser.status}</p>
            </div>
            
            <div className="flex gap-4 pt-4">
              {!selectedUser.verified && (
                <button
                  onClick={() => handleVerifyUser(selectedUser.id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaCheckCircle className="mr-2" /> Verify User
                </button>
              )}
              {selectedUser.status === 'active' && (
                <button
                  onClick={() => handleSuspendUser(selectedUser.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaBan className="mr-2" /> Suspend User
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title={`Dispute #${selectedDispute?.id}`}
      >
        {selectedDispute && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Reported By</p>
              <p className="font-medium">{selectedDispute.reportedBy}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Against</p>
              <p className="font-medium">{selectedDispute.against}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reason</p>
              <p className="font-medium">{selectedDispute.reason}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Booking ID</p>
              <p className="font-medium">#{selectedDispute.bookingId}</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Review the details carefully before taking action. You can contact both parties through the messaging system.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleResolveDispute(selectedDispute.id)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Resolve in Favor of Reporter
              </button>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;

