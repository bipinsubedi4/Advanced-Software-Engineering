import React, { useState } from 'react';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaStar, FaComments } from 'react-icons/fa';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { format } from 'date-fns';

interface Booking {
  id: number;
  providerName: string;
  providerImage: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  address: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  totalPrice: number;
  canReview: boolean;
}

const MyBookings: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Mock bookings data
  const bookings: Booking[] = [
    {
      id: 1,
      providerName: 'Sarah Johnson',
      providerImage: '/api/placeholder/50/50',
      service: 'Deep Cleaning',
      date: '2024-01-25',
      time: '10:00 AM',
      duration: 3,
      address: '123 Main St, Sydney NSW 2000',
      status: 'upcoming',
      totalPrice: 135,
      canReview: false,
    },
    {
      id: 2,
      providerName: 'Michael Chen',
      providerImage: '/api/placeholder/50/50',
      service: 'Regular Cleaning',
      date: '2024-01-15',
      time: '02:00 PM',
      duration: 2,
      address: '456 Oak Ave, Melbourne VIC 3000',
      status: 'completed',
      totalPrice: 100,
      canReview: true,
    },
    {
      id: 3,
      providerName: 'Emma Wilson',
      providerImage: '/api/placeholder/50/50',
      service: 'Move-out Cleaning',
      date: '2024-01-10',
      time: '09:00 AM',
      duration: 4,
      address: '789 Pine Rd, Brisbane QLD 4000',
      status: 'cancelled',
      totalPrice: 160,
      canReview: false,
    },
  ];

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const handleReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ bookingId: selectedBooking?.id, rating, review, reviewPhotos });
    setShowReviewModal(false);
    setRating(0);
    setReview('');
    setReviewPhotos([]);
  };

  const handleMessageProvider = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowMessageModal(true);
  };

  const submitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ bookingId: selectedBooking?.id, message });
    // TODO: Integrate with backend API
    alert('Message sent to provider successfully!');
    setShowMessageModal(false);
    setMessage('');
  };

  const handleReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewDate(booking.date);
    setNewTime(booking.time);
    setShowRescheduleModal(true);
  };

  const submitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ bookingId: selectedBooking?.id, newDate, newTime });
    // TODO: Integrate with backend API
    alert('Reschedule request submitted successfully!');
    setShowRescheduleModal(false);
    setNewDate('');
    setNewTime('');
  };

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const submitCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ bookingId: selectedBooking?.id, cancelReason });
    // TODO: Integrate with backend API
    alert('Booking cancelled successfully!');
    setShowCancelModal(false);
    setCancelReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'upcoming', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status as typeof filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <Card key={booking.id}>
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={booking.providerImage}
                    alt={booking.providerName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{booking.providerName}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{booking.service}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaCalendar className="mr-2 text-blue-600" />
                        {format(new Date(booking.date), 'MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-blue-600" />
                        {booking.time} ({booking.duration} hours)
                      </div>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-blue-600" />
                        {booking.address}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-2xl font-bold text-blue-600">${booking.totalPrice}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2 min-w-[200px]">
                  {booking.status === 'upcoming' && (
                    <>
                      <button 
                        onClick={() => handleMessageProvider(booking)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <FaComments className="mr-2" /> Message Provider
                      </button>
                      <button 
                        onClick={() => handleReschedule(booking)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => handleCancelBooking(booking)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'completed' && booking.canReview && (
                    <button
                      onClick={() => handleReview(booking)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FaStar className="mr-2" /> Leave Review
                    </button>
                  )}
                  
                  {booking.status === 'completed' && (
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      Book Again
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">No {filter !== 'all' && filter} bookings found.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Leave a Review"
      >
        <form onSubmit={submitReview} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <FaStar
                    size={32}
                    className={`${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              required
              placeholder="Share your experience..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setReviewPhotos(Array.from(e.target.files || []))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">Upload photos of the completed work</p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
          </div>
        </form>
      </Modal>

      {/* Message Provider Modal */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={`Message ${selectedBooking?.providerName}`}
      >
        <form onSubmit={submitMessage} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              placeholder="Type your message to the provider..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowMessageModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Booking"
      >
        <form onSubmit={submitReschedule} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Time
            </label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your reschedule request will be sent to the provider for approval. 
              You'll be notified once they respond.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowRescheduleModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request Reschedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Booking Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
      >
        <form onSubmit={submitCancellation} className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Cancelling this booking may incur cancellation fees depending on 
              the provider's policy and how close to the booking date you are.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              required
              placeholder="Please provide a reason for cancellation..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyBookings;

