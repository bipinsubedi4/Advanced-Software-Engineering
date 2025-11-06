import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaCalendar, FaShieldAlt, FaDollarSign, FaStar, FaCheckCircle } from 'react-icons/fa';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Professional Cleaning Services
              <br />
              <span className="text-blue-200">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Book trusted cleaners in minutes. Quality service guaranteed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                <FaSearch className="mr-2" />
                Find a Cleaner
              </Link>
              <Link
                to="/register"
                className="bg-blue-800 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-900 transition-colors inline-flex items-center justify-center border-2 border-white"
              >
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose MyClean?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaShieldAlt className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Providers</h3>
              <p className="text-gray-600">
                All cleaners are background-checked and verified for your safety and peace of mind.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaCalendar className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Book in minutes with our simple interface. Choose your date, time, and preferred cleaner.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaDollarSign className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">
                See exact prices upfront. No hidden fees. Afterpay available for flexible payments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaStar className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">
                Read reviews from real customers. Your payment is protected until service completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            Get your space cleaned in three simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search & Filter</h3>
              <p className="text-gray-600">
                Browse verified cleaners in your area. Filter by availability, price, ratings, and specializations.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Instantly</h3>
              <p className="text-gray-600">
                Choose your preferred date and time. Make secure payment with card or Afterpay. Get instant confirmation.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enjoy Clean Space</h3>
              <p className="text-gray-600">
                Your cleaner arrives on time. After completion, leave a review and share photos of your sparkling space!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* For Providers */}
      <div className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Are You a Cleaning Professional?
            </h2>
            <p className="text-xl text-indigo-100">
              Join MyClean and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl">
              <FaCheckCircle className="text-3xl mb-3" />
              <h3 className="text-xl font-semibold mb-2">Set Your Own Schedule</h3>
              <p className="text-indigo-100">
                Work when you want. Block out dates. Full control over your availability.
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl">
              <FaCheckCircle className="text-3xl mb-3" />
              <h3 className="text-xl font-semibold mb-2">Guaranteed Weekly Payouts</h3>
              <p className="text-indigo-100">
                Get paid every Friday. No delays. Secure payment processing.
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl">
              <FaCheckCircle className="text-3xl mb-3" />
              <h3 className="text-xl font-semibold mb-2">Grow Your Client Base</h3>
              <p className="text-indigo-100">
                Access thousands of customers. Build your reputation with reviews.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-colors inline-block"
            >
              Join as a Provider
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">1,250+</p>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">180+</p>
              <p className="text-gray-600">Verified Providers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">3,450+</p>
              <p className="text-gray-600">Bookings Completed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">4.9</p>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers and providers on MyClean
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-block"
          >
            Sign Up Now - It's Free!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

