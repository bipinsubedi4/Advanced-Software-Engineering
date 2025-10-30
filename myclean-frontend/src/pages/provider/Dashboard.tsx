import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendar, FaDollarSign, FaCheckCircle, FaClock, FaChartLine, FaStar, FaUserEdit, FaComments, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import { format } from 'date-fns';

interface BookingRequest {
  id: number;
  customerName: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  address: string;
}

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // TODO: Check if profile is complete from backend
  const [profileComplete, setProfileComplete] = useState(false);
  
  // Show mock data only if profile is complete, otherwise show zeros
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(
    profileComplete ? [
      {
        id: 1,
        customerName: 'John Smith',
        service: 'Deep Cleaning',
        date: '2024-01-25',
        time: '10:00 AM',
        duration: 3,
        price: 135,
        address: '123 Main St, Sydney NSW 2000',
      },
      {
        id: 2,
        customerName: 'Emily Davis',
        service: 'Regular Cleaning',
        date: '2024-01-26',
        time: '02:00 PM',
        duration: 2,
        price: 90,
        address: '456 Oak Ave, Sydney NSW 2001',
      },
    ] : []
  );

  const upcomingBookings = profileComplete ? [
    {
      id: 3,
      customerName: 'Michael Brown',
      service: 'Move-out Cleaning',
      date: '2024-01-24',
      time: '09:00 AM',
      duration: 4,
      price: 180,
      address: '789 Pine Rd, Sydney NSW 2002',
    },
  ] : [];

  // Zero stats for new providers, mock data for complete profiles
  const stats = profileComplete ? {
    weeklyEarnings: 1250,
    monthlyEarnings: 4850,
    completedJobs: 127,
    averageRating: 4.9,
    responseRate: 98,
    upcomingJobs: 5,
  } : {
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    completedJobs: 0,
    averageRating: 0,
    responseRate: 0,
    upcomingJobs: 0,
  };

  const handleAccept = (requestId: number) => {
    console.log('Accepted booking:', requestId);
    setBookingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleDecline = (requestId: number) => {
    console.log('Declined booking:', requestId);
    setBookingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Profile Completion Alert */}
        {!profileComplete && (
          <Card className="mb-6 bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-start">
              <FaExclamationCircle className="text-yellow-600 text-3xl mr-4 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Complete Your Profile to Start Earning
                </h3>
                <p className="text-gray-700 mb-4">
                  You haven't completed your provider profile yet. Complete your profile to start receiving booking requests and earning money!
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/provider/profile-setup"
                    className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold inline-flex items-center"
                  >
                    <FaUserEdit className="mr-2" />
                    Complete Profile Now
                  </Link>
                  <Link
                    to="/provider/home"
                    className="bg-white border border-yellow-600 text-yellow-700 px-6 py-2 rounded-lg hover:bg-yellow-50 transition-colors font-semibold"
                  >
                    Learn More About Benefits
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-green-600">${stats.weeklyEarnings}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {profileComplete ? '+15% from last week' : 'Complete profile to start earning'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaDollarSign className="text-green-600 text-2xl" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-blue-600">${stats.monthlyEarnings}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {profileComplete ? '+8% from last month' : 'No bookings yet'}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaChartLine className="text-blue-600 text-2xl" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Jobs</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completedJobs}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {profileComplete ? 'All time' : 'No jobs completed'}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaCheckCircle className="text-purple-600 text-2xl" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {profileComplete ? stats.averageRating : '--'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {profileComplete ? `${stats.responseRate}% response rate` : 'No ratings yet'}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaStar className="text-yellow-600 text-2xl" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Requests */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Booking Requests ({bookingRequests.length})
              </h2>
              
              {bookingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaCalendar className="mx-auto text-4xl mb-2 text-gray-300" />
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingRequests.map(request => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{request.customerName}</h3>
                          <p className="text-gray-600">{request.service}</p>
                        </div>
                        <span className="text-xl font-bold text-blue-600">${request.price}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <FaCalendar className="mr-2 text-blue-600" />
                          {format(new Date(request.date), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <FaClock className="mr-2 text-blue-600" />
                          {request.time} ({request.duration}h)
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{request.address}</p>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(request.id)}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Upcoming Schedule */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upcoming Schedule
              </h2>
              
              <div className="space-y-3">
                {upcomingBookings.map(booking => (
                  <div key={booking.id} className="border-l-4 border-blue-600 bg-blue-50 p-3 rounded">
                    <p className="font-semibold text-gray-900">{booking.customerName}</p>
                    <p className="text-sm text-gray-600">{booking.service}</p>
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                      <FaCalendar className="mr-2" />
                      {format(new Date(booking.date), 'MMM d')} at {booking.time}
                    </div>
                    <p className="text-lg font-bold text-blue-600 mt-2">${booking.price}</p>
                  </div>
                ))}
                
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4">
                  View Full Calendar
                </button>
              </div>
            </Card>

            <Card className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <Link
                  to="/provider/calendar"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <FaCalendar className="text-xl mr-3" />
                    <div className="text-left">
                      <p className="font-semibold">Update Availability</p>
                      <p className="text-xs text-indigo-100">Manage your schedule</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/provider/messages"
                  className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 px-4 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <FaComments className="text-xl mr-3" />
                    <div className="text-left">
                      <p className="font-semibold">View Messages</p>
                      <p className="text-xs text-indigo-500">Chat with customers</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/provider/profile-setup"
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <FaUserEdit className="text-xl mr-3" />
                    <div className="text-left">
                      <p className="font-semibold">Edit Profile</p>
                      <p className="text-xs text-gray-500">Update your information</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;

