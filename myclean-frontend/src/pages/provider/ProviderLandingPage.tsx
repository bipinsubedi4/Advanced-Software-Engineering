import React from 'react';
import { Link } from 'react-router-dom';
import { FaDollarSign, FaClock, FaUsers } from 'react-icons/fa';

const benefits = [
  {
    icon: FaDollarSign,
    title: 'Earn More Money',
    description: 'Set your own rates and keep up to 85% of every booking. Guaranteed weekly payouts every Friday.',
    accent: 'bg-green-100 text-green-600',
  },
  {
    icon: FaClock,
    title: 'Flexible Schedule',
    description: 'Work when you want. Set your availability, accept bookings on your terms, and enjoy full control of your time.',
    accent: 'bg-blue-100 text-blue-600',
  },
  {
    icon: FaUsers,
    title: 'More Customers',
    description: 'Tap into thousands of customers looking for cleaning services. Get matched with clients near you.',
    accent: 'bg-purple-100 text-purple-600',
  },
];

const ProviderLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="uppercase tracking-[0.35em] text-sm md:text-base text-indigo-200 mb-4">
            MyClean for Providers
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Grow Your Cleaning Business
            <br />
            <span className="text-indigo-100">With MyClean</span>
          </h1>
          <p className="text-lg md:text-2xl text-indigo-100 max-w-3xl mx-auto mb-10">
            Join hundreds of cleaning professionals earning more and working smarter with guaranteed payouts and flexible schedules.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/provider/profile-setup"
              className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-indigo-50 transition-colors"
            >
              Complete Your Profile
            </Link>
            <Link
              to="/provider/dashboard"
              className="bg-indigo-900 bg-opacity-80 text-white px-10 py-4 rounded-xl font-semibold text-lg border border-white/70 hover:bg-opacity-100 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Partner With MyClean?</h2>
            <p className="text-xl text-gray-600">
              Everything you need to build a successful cleaning business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${benefit.accent}`}>
                  <benefit.icon className="text-2xl" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProviderLandingPage;
