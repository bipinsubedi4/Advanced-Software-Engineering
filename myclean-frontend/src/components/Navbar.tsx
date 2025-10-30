import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaUser, FaCalendar, FaChartBar, FaSignOutAlt } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">MyClean</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'CUSTOMER' && (
                  <>
                    <Link to="/search" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Find Cleaners
                    </Link>
                    <Link to="/my-bookings" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      My Bookings
                    </Link>
                  </>
                )}
                {user.role === 'PROVIDER' && (
                  <>
                    <Link to="/provider/home" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                      Home
                    </Link>
                    <Link to="/provider/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                      <FaChartBar className="mr-2" /> Dashboard
                    </Link>
                    <Link to="/provider/calendar" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                      <FaCalendar className="mr-2" /> Calendar
                    </Link>
                    <Link to="/provider/messages" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                      Messages
                    </Link>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <FaUser className="mr-2" /> {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 flex items-center"
                  >
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                {user.role === 'CUSTOMER' && (
                  <>
                    <Link to="/search" className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium">
                      Find Cleaners
                    </Link>
                    <Link to="/my-bookings" className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium">
                      My Bookings
                    </Link>
                  </>
                )}
                {user.role === 'PROVIDER' && (
                  <>
                    <Link to="/provider/home" className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium">
                      Home
                    </Link>
                    <Link to="/provider/dashboard" className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium">
                      Dashboard
                    </Link>
                    <Link to="/provider/calendar" className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium">
                      Calendar
                    </Link>
                    <Link to="/provider/messages" className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium">
                      Messages
                    </Link>
                  </>
                )}
                <Link to="/profile" className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium">
                  Login
                </Link>
                <Link to="/register" className="block text-gray-700 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

