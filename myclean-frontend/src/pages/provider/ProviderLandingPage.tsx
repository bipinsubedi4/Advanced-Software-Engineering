import React from 'react';
import { Link } from 'react-router-dom';
import { FaDollarSign, FaCalendarCheck, FaUsers, FaChartLine, FaClock, FaHandshake, FaStar, FaShieldAlt, FaMobile, FaCheckCircle } from 'react-icons/fa';

const ProviderLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Grow Your Cleaning Business
              <br />
              <span className="text-indigo-200">With MyClean</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Join hundreds of cleaning professionals earning more and working smarter
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/provider/profile-setup"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-colors inline-flex items-center justify-center shadow-lg"
              >
                Complete Your Profile
              </Link>
              <Link
                to="/provider/dashboard"
                className="bg-indigo-800 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-900 transition-colors inline-flex items-center justify-center border-2 border-white"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Why Join MyClean */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Why Partner With MyClean?
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            Everything you need to build a successful cleaning business
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaDollarSign className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn More Money</h3>
              <p className="text-gray-600">
                Set your own rates. Keep up to 85% of every booking. Weekly guaranteed payouts every Friday.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaClock className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Schedule</h3>
              <p className="text-gray-600">
                Work when you want. Set your availability, accept bookings on your terms. Full control over your time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">More Customers</h3>
              <p className="text-gray-600">
                Access thousands of customers looking for cleaning services. Get matched with clients near you.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaStar className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Your Reputation</h3>
              <p className="text-gray-600">
                Collect reviews and ratings. Showcase your work. Top-rated providers get more bookings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaMobile className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use Platform</h3>
              <p className="text-gray-600">
                Manage bookings, communicate with clients, and track earnings all in one simple dashboard.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FaShieldAlt className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Protected</h3>
              <p className="text-gray-600">
                Payment protection. Background verification. Insurance coverage. We've got you covered.
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
            Start earning in four simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
              <p className="text-gray-600">
                Add your details, services, rates, and availability. Upload photos of your work.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Verified</h3>
              <p className="text-gray-600">
                Submit background check documents. Get approved within 24-48 hours.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accept Bookings</h3>
              <p className="text-gray-600">
                Receive booking requests. Accept jobs that fit your schedule. Start working!
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Paid</h3>
              <p className="text-gray-600">
                Complete jobs. Collect reviews. Get paid weekly directly to your bank account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Potential */}
      <div className="py-20 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Earnings Potential
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            See what you can earn with MyClean
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <FaChartLine className="text-5xl text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Part-Time</h3>
              <p className="text-gray-600 mb-4">15-20 hours/week</p>
              <p className="text-4xl font-bold text-green-600">$500-$800</p>
              <p className="text-gray-500 mt-2">per week</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-xl shadow-lg text-center text-white transform scale-105">
              <FaChartLine className="text-5xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Full-Time</h3>
              <p className="text-indigo-100 mb-4">35-40 hours/week</p>
              <p className="text-4xl font-bold">$1,500-$2,200</p>
              <p className="text-indigo-200 mt-2">per week</p>
              <div className="mt-4 bg-white bg-opacity-20 rounded-lg py-2 px-4">
                <p className="text-sm">Most Popular</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <FaChartLine className="text-5xl text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Top Earner</h3>
              <p className="text-gray-600 mb-4">45+ hours/week</p>
              <p className="text-4xl font-bold text-yellow-600">$2,500+</p>
              <p className="text-gray-500 mt-2">per week</p>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-xl p-6 shadow-md">
            <h4 className="text-xl font-semibold text-gray-900 mb-4 text-center">What's Included:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <FaCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">You Keep 85%</p>
                  <p className="text-gray-600 text-sm">We only take 15% platform fee</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Weekly Payouts</p>
                  <p className="text-gray-600 text-sm">Get paid every Friday, guaranteed</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Bonus Opportunities</p>
                  <p className="text-gray-600 text-sm">Earn extra for peak times and referrals</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Tips Included</p>
                  <p className="text-gray-600 text-sm">Keep 100% of all tips from customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            We Support You Every Step
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <FaHandshake className="text-4xl text-indigo-600 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Provider Support</h3>
                <p className="text-gray-600">
                  Our dedicated support team is always here to help. Live chat, phone, and email support available.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <FaCalendarCheck className="text-4xl text-indigo-600 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Training Resources</h3>
                <p className="text-gray-600">
                  Access our library of training videos, best practices, and tips to grow your business.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <FaShieldAlt className="text-4xl text-indigo-600 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Insurance Coverage</h3>
                <p className="text-gray-600">
                  All providers are covered by our liability insurance during bookings for your peace of mind.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <FaUsers className="text-4xl text-indigo-600 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Provider Community</h3>
                <p className="text-gray-600">
                  Join our community forum. Share tips, ask questions, and connect with other cleaning professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">180+</p>
              <p className="text-gray-600">Active Providers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">$1,850</p>
              <p className="text-gray-600">Avg Weekly Earnings</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">3,450+</p>
              <p className="text-gray-600">Jobs Completed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">98%</p>
              <p className="text-gray-600">Provider Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            What Our Providers Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "MyClean has completely transformed my business. I'm earning twice what I made before and have full control over my schedule!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  SJ
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="text-gray-600 text-sm">Provider since 2023</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The weekly payouts are a game-changer. No more chasing clients for payment. Everything is handled securely through the platform."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  MC
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Michael Chen</p>
                  <p className="text-gray-600 text-sm">Provider since 2022</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "I love the flexibility! I can work around my family schedule and still make great money. The support team is amazing too."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  EW
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Emma Wilson</p>
                  <p className="text-gray-600 text-sm">Provider since 2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join MyClean today and take control of your cleaning business
          </p>
          <Link
            to="/provider/profile-setup"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-colors inline-block shadow-lg"
          >
            Complete Your Profile Now
          </Link>
          <p className="mt-4 text-indigo-200">
            Already completed your profile?{' '}
            <Link to="/provider/dashboard" className="underline hover:text-white">
              Go to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderLandingPage;

