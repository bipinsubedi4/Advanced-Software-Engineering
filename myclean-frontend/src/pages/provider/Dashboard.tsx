import React, { useState } from 'react';
import { FaCalendar, FaDollarSign, FaCheckCircle, FaClock, FaChartLine, FaStar } from 'react-icons/fa';
import Card from '../../components/Card';
import { format, startOfWeek, addDays } from 'date-fns';

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
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
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
  ]);

  const upcomingBookings = [
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
  ];

  const stats = {
    weeklyEarnings: 1250,
    monthlyEarnings: 4850,
    completedJobs: 127,
    averageRating: 4.9,
    responseRate: 98,
    upcomingJobs: 5,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Provider Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-green-600">${stats.weeklyEarnings}</p>
                <p className="text-xs text-gray-500 mt-1">+15% from last week</p>
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
                <p className="text-xs text-gray-500 mt-1">+8% from last month</p>
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
                <p className="text-xs text-gray-500 mt-1">All time</p>
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
                <p className="text-3xl font-bold text-yellow-600">{stats.averageRating}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.responseRate}% response rate</p>
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
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Update Availability
                </button>
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  View Messages
                </button>
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit Profile
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;

