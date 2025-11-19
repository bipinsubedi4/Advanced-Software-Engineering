import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProviderProfile } from '../hooks/useProviderProfile';
import { useSocket } from '../context/SocketContext';
import { FaBars, FaTimes, FaUser, FaCalendar, FaChartBar, FaSignOutAlt, FaBell } from 'react-icons/fa';
import axios from 'axios';

interface Notification {
  id: number;
  type: string; // "NEW_MESSAGE" | "MESSAGE" | "BOOKING_REQUEST" | "BOOKING_ACCEPTED" | etc.
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
}

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { profileComplete } = useProviderProfile();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = React.useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`/api/notifications/${user.id}`);
      const notifs = response.data.notifications || [];
      setNotifications(notifs.slice(0, 5)); // Show only last 5
      setUnreadCount(notifs.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  // Listen for socket notifications
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessageNotification = () => {
      // Refresh notifications when a new message notification arrives
      fetchNotifications();
    };

    socket.on('new_message_notification', handleNewMessageNotification);

    return () => {
      socket.off('new_message_notification', handleNewMessageNotification);
    };
  }, [socket, user, fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);
    
    // FORCE all message notifications to redirect to /provider/messages
    // No exceptions, no fallbacks, no conditional logic
    if (notification.type === "MESSAGE" || notification.type === "NEW_MESSAGE") {
      if (user?.role === 'PROVIDER') {
        navigate("/provider/messages");
        return;
      } else {
        navigate("/customer/messages");
        return;
      }
    }
    
    // For other notification types, use the link field
    const redirectUrl = notification.link || (user?.role === 'PROVIDER' ? '/provider/home' : '/');
    navigate(redirectUrl);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine home route based on user role
  const getHomeRoute = () => {
    if (user?.role === 'PROVIDER') {
      return '/provider/home';
    }
    return '/';
  };

  // Check if a route is active
  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Menu item class with gradient border
  const getMenuItemClass = (path: string, isMobile = false) => {
    const baseClass = isMobile 
      ? "gradient-menu-item block px-4 py-2 text-base font-medium"
      : "gradient-menu-item px-4 py-2 text-sm font-medium";
    
    const isActive = isActiveRoute(path);
    
    if (isActive) {
      return `${baseClass} active`;
    }
    
    return `${baseClass} text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-[#5046E5]/10 hover:to-[#EA489A]/10`;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={getHomeRoute()} className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold gradient-logo">
                MyClean
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'CUSTOMER' && (
                  <>
                    <Link to="/search" className={getMenuItemClass("/search")}>
                      Find Cleaners
                    </Link>
                    <Link to="/marketplace" className={getMenuItemClass("/marketplace")}>
                      Marketplace
                    </Link>
                    <Link to="/my-bookings" className={getMenuItemClass("/my-bookings")}>
                      My Bookings
                    </Link>
                    <Link
                      to="/customer/messages"
                      className={getMenuItemClass("/customer/messages")}
                    >
                      Messages
                    </Link>
                  </>
                )}
                {user.role === 'PROVIDER' && (
                  <>
                    <Link to="/provider/home" className={getMenuItemClass("/provider/home")}>
                      Home
                    </Link>
                    <Link to="/provider/dashboard" className={`${getMenuItemClass("/provider/dashboard")} flex items-center`}>
                      <FaChartBar className="mr-2" /> Dashboard
                    </Link>
                    <Link to="/provider/calendar" className={`${getMenuItemClass("/provider/calendar")} flex items-center`}>
                      <FaCalendar className="mr-2" /> Calendar
                    </Link>
                    <Link to="/provider/messages" className={getMenuItemClass("/provider/messages")}>
                      Messages
                    </Link>
                    <Link to="/provider/marketplace" className={getMenuItemClass("/provider/marketplace")}>
                      Marketplace
                    </Link>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className={getMenuItemClass("/admin")}>
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md relative"
                    >
                      <FaBell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-3 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                  !notification.isRead ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                {user.role === 'PROVIDER' ? (
                  <Link 
                    to={profileComplete ? "/provider/profile" : "/provider/profile-setup"} 
                    className={`${getMenuItemClass(profileComplete ? "/provider/profile" : "/provider/profile-setup")} flex items-center`}
                    title={profileComplete ? "View Profile" : "Complete Profile"}
                  >
                    <FaUser className="mr-2" /> {user.name}
                  </Link>
                  ) : (
                    <span className="px-4 py-2 rounded-full text-sm font-medium flex items-center text-gray-700 border-2 border-transparent">
                      <FaUser className="mr-2" /> {user.name}
                    </span>
                  )}
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
                    <Link to="/search" className={getMenuItemClass("/search", true)}>
                      Find Cleaners
                    </Link>
                    <Link to="/marketplace" className={getMenuItemClass("/marketplace", true)}>
                      Marketplace
                    </Link>
                    <Link to="/my-bookings" className={getMenuItemClass("/my-bookings", true)}>
                      My Bookings
                    </Link>
                    <Link
                      to="/customer/messages"
                      className={getMenuItemClass("/customer/messages", true)}
                    >
                      Messages
                    </Link>
                  </>
                )}
                {user.role === 'PROVIDER' && (
                  <>
                    <Link to="/provider/home" className={getMenuItemClass("/provider/home", true)}>
                      Home
                    </Link>
                    <Link to="/provider/dashboard" className={getMenuItemClass("/provider/dashboard", true)}>
                      Dashboard
                    </Link>
                    <Link to="/provider/calendar" className={getMenuItemClass("/provider/calendar", true)}>
                      Calendar
                    </Link>
                    <Link to="/provider/messages" className={getMenuItemClass("/provider/messages", true)}>
                      Messages
                    </Link>
                    <Link to="/provider/marketplace" className={getMenuItemClass("/provider/marketplace", true)}>
                      Marketplace
                    </Link>
                  </>
                )}
                {user.role === 'PROVIDER' && (
                  <Link 
                    to={profileComplete ? "/provider/profile" : "/provider/profile-setup"} 
                    className={getMenuItemClass(profileComplete ? "/provider/profile" : "/provider/profile-setup", true)}
                  >
                    {profileComplete ? "My Profile" : "Complete Profile"}
                  </Link>
                )}
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
