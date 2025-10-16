import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaDollarSign, FaCheckCircle, FaClock, FaCalendar } from 'react-icons/fa';
import Modal from '../../components/Modal';
import { format, addDays } from 'date-fns';

interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  photos?: string[];
}

const ProviderProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [address, setAddress] = useState('');
  const [selectedTab, setSelectedTab] = useState<'about' | 'reviews'>('about');

  // Mock provider data
  const provider = {
    id: Number(id),
    name: 'Sarah Johnson',
    location: 'Sydney, NSW',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 45,
    specializations: ['Deep Cleaning', 'Eco-Friendly', 'Pet-Friendly', 'Residential'],
    verified: true,
    profileImage: '/api/placeholder/150/150',
    bio: 'Professional cleaner with over 8 years of experience. I take pride in delivering exceptional cleaning services and ensuring every corner sparkles. Specialized in eco-friendly products and pet-safe cleaning solutions.',
    experience: '8 years',
    completedJobs: 450,
    responseTime: '2 hours',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    galleryImages: ['/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200'],
  };

  const reviews: Review[] = [
    {
      id: 1,
      customerName: 'John Smith',
      rating: 5,
      comment: 'Sarah did an amazing job! My house has never looked this clean. Very professional and thorough.',
      date: '2024-01-15',
      photos: ['/api/placeholder/200/150'],
    },
    {
      id: 2,
      customerName: 'Emily Davis',
      rating: 5,
      comment: 'Highly recommend! Great attention to detail and very friendly. Will definitely book again.',
      date: '2024-01-10',
    },
    {
      id: 3,
      customerName: 'Michael Brown',
      rating: 4,
      comment: 'Good service overall. Arrived on time and cleaned thoroughly. A bit pricey but worth it.',
      date: '2024-01-05',
    },
  ];

  const availableTimes = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle booking logic here
    console.log({ selectedDate, selectedTime, duration, address });
    setShowBookingModal(false);
    navigate('/booking-confirmation');
  };

  const totalPrice = provider.hourlyRate * duration;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <img
              src={provider.profileImage}
              alt={provider.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                {provider.verified && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <FaCheckCircle className="mr-1" /> Verified
                  </span>
                )}
              </div>
              
              <div className="flex items-center mt-2 text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                {provider.location}
              </div>
              
              <div className="flex items-center mt-2">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="font-semibold text-lg">{provider.rating}</span>
                <span className="text-gray-500 ml-2">({provider.reviewCount} reviews)</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {provider.specializations.map(spec => (
                  <span
                    key={spec}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 flex items-center">
                <FaDollarSign />
                {provider.hourlyRate}/hr
              </div>
              <button
                onClick={() => setShowBookingModal(true)}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Experience</p>
                <p className="text-2xl font-bold text-gray-900">{provider.experience}</p>
              </div>
              <FaClock className="text-blue-600 text-3xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{provider.completedJobs}</p>
              </div>
              <FaCheckCircle className="text-green-600 text-3xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{provider.responseTime}</p>
              </div>
              <FaClock className="text-purple-600 text-3xl" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setSelectedTab('about')}
                className={`px-6 py-4 font-medium ${
                  selectedTab === 'about'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setSelectedTab('reviews')}
                className={`px-6 py-4 font-medium ${
                  selectedTab === 'reviews'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({provider.reviewCount})
              </button>
            </div>
          </div>

          <div className="p-6">
            {selectedTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">About Me</h3>
                  <p className="text-gray-700 leading-relaxed">{provider.bio}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Availability</h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.availability.map(day => (
                      <span key={day} className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Work Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {provider.galleryImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Work ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{format(new Date(review.date), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="mt-3 text-gray-700">{review.comment}</p>
                    {review.photos && (
                      <div className="flex gap-2 mt-3">
                        {review.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Review ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book Cleaning Service"
        size="lg"
      >
        <form onSubmit={handleBooking} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendar className="inline mr-2" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaClock className="inline mr-2" />
                Select Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose time...</option>
                {availableTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (hours)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(hours => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setDuration(hours)}
                  className={`px-4 py-2 rounded-lg border ${
                    duration === hours
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              required
              placeholder="Enter your complete address..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Hourly Rate:</span>
              <span className="font-semibold">${provider.hourlyRate}/hour</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Duration:</span>
              <span className="font-semibold">{duration} hours</span>
            </div>
            <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">${totalPrice}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderProfile;

