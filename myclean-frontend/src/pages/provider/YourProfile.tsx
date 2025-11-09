// src/pages/provider/YourProfile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaDollarSign,
  FaCalendar,
  FaCheckCircle,
  FaShieldAlt,
  FaCar,
  FaTools,
  FaEdit,
  FaStar,
} from 'react-icons/fa';
import Card from '../../components/Card';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../Services/api';

interface ProviderProfile {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    profileImage: string | null;
  };
  bio: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  yearsExperience: string;
  hasInsurance: boolean;
  insuranceProvider: string | null;
  hasVehicle: boolean;
  hasEquipment: boolean;
  certifications: string | null;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  isVerified: boolean;
  profileComplete: boolean;
  services: Array<{
    id: number;
    serviceName: string;
    description: string | null;
    pricePerHour: number; // in cents
    durationMin: number;
    isActive: boolean;
  }>;
  availability: Array<{
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
}

const YourProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !token) {
        setError('You must be logged in to view your profile');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/providers/profile/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success && response.data.profile) {
          setProfile(response.data.profile);
          setError(null);
        } else {
          setError('Failed to load profile');
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
              <button
                onClick={() => navigate('/provider/profile-setup')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Complete Your Profile
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const fullAddress = [profile.address, profile.city, profile.state, profile.zipCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Profile</h1>
            <p className="text-lg text-gray-600">View and manage your provider profile</p>
          </div>
          <button
            onClick={() => navigate('/provider/profile-setup')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center font-semibold"
          >
            <FaEdit className="mr-2" />
            Edit Profile
          </button>
        </div>

        {/* Profile Card */}
        <Card>
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start space-x-6 pb-6 border-b border-gray-200">
              <div className="flex-shrink-0">
                <img
                  src={profile.user?.profileImage || '/api/placeholder/150/150'}
                  alt={profile.user?.name || 'Profile'}
                  className="h-32 w-32 rounded-full object-cover border-4 border-indigo-100"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">{profile.user?.name || 'Provider'}</h2>
                  {profile.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                {profile.averageRating > 0 && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-semibold text-gray-900">{profile.averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500">
                      ({profile.totalReviews} {profile.totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
                {profile.totalBookings > 0 && (
                  <p className="text-gray-600">{profile.totalBookings} bookings completed</p>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="mr-2 text-indigo-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <FaEnvelope className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{profile.user?.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaPhone className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{profile.user?.phone || '—'}</p>
                  </div>
                </div>
                {fullAddress && (
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <FaMapMarkerAlt className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-gray-900">{fullAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FaBriefcase className="mr-2 text-indigo-600" />
                  About You
                </h3>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Professional Details */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaBriefcase className="mr-2 text-indigo-600" />
                Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.yearsExperience && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Years of Experience</p>
                    <p className="text-gray-900">{profile.yearsExperience}</p>
                  </div>
                )}
                {profile.certifications && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Certifications</p>
                    <p className="text-gray-900">{profile.certifications}</p>
                  </div>
                )}
                <div className="flex items-center space-x-6">
                  {profile.hasInsurance && (
                    <div className="flex items-center space-x-2">
                      <FaShieldAlt className="text-green-500" />
                      <span className="text-gray-900">Insured</span>
                      {profile.insuranceProvider && (
                        <span className="text-sm text-gray-500">({profile.insuranceProvider})</span>
                      )}
                    </div>
                  )}
                  {profile.hasVehicle && (
                    <div className="flex items-center space-x-2">
                      <FaCar className="text-blue-500" />
                      <span className="text-gray-900">Has Vehicle</span>
                    </div>
                  )}
                  {profile.hasEquipment && (
                    <div className="flex items-center space-x-2">
                      <FaTools className="text-purple-500" />
                      <span className="text-gray-900">Has Equipment</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Services & Pricing */}
            {profile.services && profile.services.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FaDollarSign className="mr-2 text-indigo-600" />
                  Services & Pricing
                </h3>
                <div className="space-y-3">
                  {profile.services
                    .filter((service) => service.isActive)
                    .map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{service.serviceName}</h4>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            Duration: {service.durationMin} minutes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">
                            ${((service.pricePerHour || 0) / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">per hour</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {profile.availability && profile.availability.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FaCalendar className="mr-2 text-indigo-600" />
                  Your Availability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.availability
                    .filter((slot) => slot.isAvailable)
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <span className="font-medium text-gray-900">
                          {slot.dayOfWeek.charAt(0) + slot.dayOfWeek.slice(1).toLowerCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                </div>
                {profile.availability.filter((slot) => slot.isAvailable).length === 0 && (
                  <p className="text-gray-500 italic">No availability set</p>
                )}
              </div>
            )}

            {/* Stats */}
            {(profile.totalBookings > 0 || profile.totalReviews > 0) && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-3xl font-bold text-indigo-600">{profile.totalBookings}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Bookings</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{profile.totalReviews}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-600">
                      {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : '—'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default YourProfile;
