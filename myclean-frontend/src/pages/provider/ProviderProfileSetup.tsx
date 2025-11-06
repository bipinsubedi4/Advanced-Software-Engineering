// src/pages/provider/ProviderProfileSetup.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBriefcase,
  FaDollarSign,
  FaCalendar,
  FaCamera,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useProviderProfile } from "../../hooks/useProviderProfile";

// Get API base URL
const API_BASE = process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || 'http://localhost:4000';

type TimeSlot = {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

type Service = {
  name: string;
  rate: string; // dollars/hour in UI
  selected: boolean;
};

type BlockedDate = {
  id: number;
  date: string;
  reason: string;
};

const ProviderProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { profileComplete, loading: profileLoading } = useProviderProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingProfileData, setLoadingProfileData] = useState(false);

  // Step 1: Basic Information
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [bio, setBio] = useState("");

  // Step 2: Professional Details
  const [yearsExperience, setYearsExperience] = useState("");
  const [hasInsurance, setHasInsurance] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);
  const [hasEquipment, setHasEquipment] = useState(false);
  const [certifications, setCertifications] = useState("");

  // Step 3: Services & Pricing
  const [services, setServices] = useState<Service[]>([
    { name: "Regular Cleaning", rate: "", selected: false },
    { name: "Deep Cleaning", rate: "", selected: false },
    { name: "Move-in/Move-out Cleaning", rate: "", selected: false },
    { name: "Office Cleaning", rate: "", selected: false },
    { name: "Carpet Cleaning", rate: "", selected: false },
    { name: "Window Cleaning", rate: "", selected: false },
    { name: "Pressure Washing", rate: "", selected: false },
    { name: "Post-Construction Cleaning", rate: "", selected: false },
  ]);

  // Step 4: Availability (UI only for now)
  const [availability, setAvailability] = useState<TimeSlot[]>([
    { day: "Monday", enabled: false, startTime: "09:00", endTime: "17:00" },
    { day: "Tuesday", enabled: false, startTime: "09:00", endTime: "17:00" },
    { day: "Wednesday", enabled: false, startTime: "09:00", endTime: "17:00" },
    { day: "Thursday", enabled: false, startTime: "09:00", endTime: "17:00" },
    { day: "Friday", enabled: false, startTime: "09:00", endTime: "17:00" },
    { day: "Saturday", enabled: false, startTime: "09:00", endTime: "17:00" },
    { day: "Sunday", enabled: false, startTime: "09:00", endTime: "17:00" },
  ]);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState("3");
  const [advanceBookingDays, setAdvanceBookingDays] = useState("30");

  // Blocked dates
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedDateInput, setBlockedDateInput] = useState("");
  const [blockedReasonInput, setBlockedReasonInput] = useState("");

  // Step 5: Photos & Documents (not sent in this version)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [workPhotos, setWorkPhotos] = useState<File[]>([]);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
  
  // Avoid unused variable warnings - files will be implemented in future enhancement
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filesCollected = { profilePhoto, workPhotos, idDocument, insuranceDocument };

  // Load existing profile data when in edit mode
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user || !token || profileLoading) return;
      
      if (profileComplete === true) {
        setIsEditMode(true);
        setLoadingProfileData(true);
        
        try {
          const response = await axios.get(`${API_BASE}/api/providers/profile/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.data.success && response.data.profile) {
            const profile = response.data.profile;
            
            // Pre-populate basic info
            setFullName(profile.user?.name || user.name || "");
            setPhone(profile.user?.phone || "");
            setAddress(profile.address || "");
            setCity(profile.city || "");
            setState(profile.state || "");
            setZipCode(profile.zipCode || "");
            setBio(profile.bio || "");
            
            // Pre-populate professional details
            setYearsExperience(profile.yearsExperience || "");
            setHasInsurance(profile.hasInsurance || false);
            setInsuranceProvider(profile.insuranceProvider || "");
            setHasVehicle(profile.hasVehicle || false);
            setHasEquipment(profile.hasEquipment || false);
            setCertifications(profile.certifications || "");
            
            // Pre-populate services
            if (profile.services && profile.services.length > 0) {
              setServices((prev) => {
                return prev.map((service) => {
                  const existingService = profile.services.find(
                    (s: any) => s.serviceName === service.name
                  );
                  if (existingService) {
                    // Convert cents to dollars for display
                    const rateInDollars = (existingService.pricePerHour / 100).toFixed(2);
                    return {
                      ...service,
                      selected: true,
                      rate: rateInDollars,
                    };
                  }
                  return service;
                });
              });
            }
            
            // Pre-populate availability
            if (profile.availability && profile.availability.length > 0) {
              setAvailability((prev) => {
                return prev.map((slot) => {
                  const existingSlot = profile.availability.find(
                    (a: any) => a.dayOfWeek === slot.day.toUpperCase()
                  );
                  if (existingSlot) {
                    return {
                      ...slot,
                      enabled: existingSlot.isAvailable || false,
                      startTime: existingSlot.startTime || slot.startTime,
                      endTime: existingSlot.endTime || slot.endTime,
                    };
                  }
                  return slot;
                });
              });
            }

            if (profile.blockedDates && profile.blockedDates.length > 0) {
              setBlockedDates(
                profile.blockedDates.map((blocked: any) => ({
                  id: blocked.id,
                  date: blocked.date ? blocked.date.slice(0, 10) : "",
                  reason: blocked.reason || "",
                }))
              );
            }
            
            // Pre-populate settings (if available in profile)
            // Note: These might not be in the profile response, so we keep defaults
          }
        } catch (err) {
          console.error('Error loading existing profile:', err);
          // If profile can't be loaded, still allow editing with empty form
        } finally {
          setLoadingProfileData(false);
        }
      }
    };
    
    loadExistingProfile();
  }, [user, token, profileComplete, profileLoading]);

  const handleServiceToggle = (index: number) => {
    setServices((prev) => {
      return prev.map((service, i) => {
        if (i === index) {
          return { ...service, selected: !service.selected };
        }
        return service;
      });
    });
  };

  const handleServiceRate = (index: number, rate: string) => {
    setServices((prev) => {
      const copy = [...prev];
      copy[index].rate = rate;
      return copy;
    });
  };

  const handleAvailabilityToggle = (index: number) => {
    setAvailability((prev) => {
      return prev.map((slot, i) => {
        if (i === index) {
          return { ...slot, enabled: !slot.enabled };
        }
        return slot;
      });
    });
  };

  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailability((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const addBlockedDate = () => {
    if (!blockedDateInput) {
      setError("Please choose a date to block");
      return;
    }

    const exists = blockedDates.some((item) => item.date === blockedDateInput);
    if (exists) {
      setError("You have already blocked that date");
      return;
    }

    setBlockedDates((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: blockedDateInput,
        reason: blockedReasonInput.trim(),
      },
    ]);

    setBlockedDateInput("");
    setBlockedReasonInput("");
    setError(null);
  };

  const removeBlockedDate = (id: number) => {
    setBlockedDates((prev) => prev.filter((item) => item.id !== id));
  };

  const next = () => setCurrentStep((s) => Math.min(totalSteps, s + 1));
  const prev = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('User not logged in');
      return;
    }

    // Validate that at least one service is selected
    const selectedServices = services.filter(s => s.selected && s.rate);
    if (selectedServices.length === 0) {
      setError('Please select at least one service and set its rate');
      return;
    }

    // Validate that at least one day is available
    const enabledDays = availability.filter(a => a.enabled);
    if (enabledDays.length === 0) {
      setError('Please set your availability for at least one day');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profileData = {
        userId: user.id,
        basicInfo: { fullName, phone, address, city, state, zipCode, bio },
        professional: { 
          yearsExperience, 
          hasInsurance, 
          insuranceProvider: hasInsurance ? insuranceProvider : undefined,
          hasVehicle, 
          hasEquipment, 
          certifications: certifications || undefined
        },
        services,
        availability,
        blockedDates: blockedDates.map((item) => ({
          date: item.date,
          reason: item.reason || undefined,
        })),
        settings: { maxBookingsPerDay, advanceBookingDays },
      };

      console.log('=== PROFILE DATA BEING SENT ===');
      console.log('userId:', user.id);
      console.log('basicInfo:', profileData.basicInfo);
      console.log('professional:', profileData.professional);
      console.log('services:', profileData.services);
      console.log('availability:', profileData.availability);
      console.log('blockedDates:', profileData.blockedDates);
      console.log('settings:', profileData.settings);
      console.log('=== END PROFILE DATA ===');

      const response = await axios.post(`${API_BASE}/api/providers/profile`, profileData, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.data.success) {
        // Show success modal
        setShowSuccessModal(true);
        // Update edit mode status after successful save
        setIsEditMode(true);
      } else {
        setError('Failed to save profile. Please try again.');
      }
    } catch (err: any) {
      console.error('Profile creation error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Full error object:', JSON.stringify(err.response?.data, null, 2));
      
      if (err.response?.data?.details) {
        // Zod validation errors - convert to user-friendly messages
        const validationErrors = err.response.data.details;
        console.error('Validation errors:', validationErrors);
        
        // Map technical field names to user-friendly labels
        const fieldLabels: { [key: string]: string } = {
          'basicInfo.phone': 'Phone number',
          'basicInfo.address': 'Street address',
          'basicInfo.city': 'City',
          'basicInfo.state': 'State',
          'basicInfo.zipCode': 'Zip code',
          'basicInfo.bio': 'Bio / About you',
          'basicInfo.fullName': 'Full name',
          'professional.yearsExperience': 'Years of experience',
          'professional.insuranceProvider': 'Insurance provider',
          'services': 'Services',
          'availability': 'Availability',
        };
        
        // Convert technical errors to user-friendly messages
        const errorMessages = validationErrors.map((e: any) => {
          const fieldPath = e.path.join('.');
          const fieldLabel = fieldLabels[fieldPath] || fieldPath.replace(/([A-Z])/g, ' $1').trim();
          
          // Convert technical messages to user-friendly ones
          let userMessage = '';
          if (e.message.includes('Too small') || e.message.includes('>=1 characters')) {
            userMessage = `${fieldLabel} is required`;
          } else if (e.message.includes('Required')) {
            userMessage = `${fieldLabel} is required`;
          } else if (e.message.includes('Invalid')) {
            userMessage = `${fieldLabel} is invalid`;
          } else {
            userMessage = `${fieldLabel}: ${e.message}`;
          }
          
          return userMessage;
        });
        
        // Format error messages with bullet points
        const formattedErrors = errorMessages.length === 1 
          ? errorMessages[0] 
          : `Please fix the following:\n• ${errorMessages.join('\n• ')}`;
        setError(formattedErrors);
      } else if (err.response?.data?.error) {
        // Show backend error message
        setError(`Error: ${err.response.data.error}`);
      } else {
        setError('Failed to create profile. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaUser className="mr-3 text-indigo-600" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+61 400 000 000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Sydney"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select State</option>
                  <option value="NSW">New South Wales</option>
                  <option value="VIC">Victoria</option>
                  <option value="QLD">Queensland</option>
                  <option value="WA">Western Australia</option>
                  <option value="SA">South Australia</option>
                  <option value="TAS">Tasmania</option>
                  <option value="ACT">Australian Capital Territory</option>
                  <option value="NT">Northern Territory</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code *
                </label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="2000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio / About You *
                </label>
                <textarea
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Tell customers about yourself, your experience, and what makes you great at what you do..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {bio.length}/500 characters
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaBriefcase className="mr-3 text-indigo-600" />
              Professional Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <select
                  required
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select experience</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="hasInsurance"
                    checked={hasInsurance}
                    onChange={(e) => setHasInsurance(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="hasInsurance"
                    className="ml-2 block text-sm font-medium text-gray-900"
                  >
                    I have liability insurance
                  </label>
                </div>

                {hasInsurance && (
                  <input
                    type="text"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Insurance provider name"
                  />
                )}
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasVehicle}
                    onChange={(e) => setHasVehicle(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    I have my own vehicle
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasEquipment}
                    onChange={(e) => setHasEquipment(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    I bring my own cleaning equipment and supplies
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications (Optional)
                </label>
                <textarea
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="List any relevant certifications, training, or qualifications..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaDollarSign className="mr-3 text-indigo-600" />
              Services & Pricing
            </h3>

            <p className="text-gray-600">
              Select the services you offer and set your hourly rate for each.
              You can always update these later.
            </p>

            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={service.name}
                  className="border border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor={`service-${index}`} className="flex items-center flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.selected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleServiceToggle(index);
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        id={`service-${index}`}
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900 cursor-pointer">
                        {service.name}
                      </span>
                    </label>

                    {service.selected && (
                      <div className="flex items-center">
                        <span className="text-gray-700 mr-2">$</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={service.rate}
                          onChange={(e) => handleServiceRate(index, e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="45"
                          required
                        />
                        <span className="text-gray-700 ml-2">/hour</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-800">
                <strong>Pricing Tip:</strong> Check local competitors. Typical rates range
                from $35 to $65/hour depending on the service and experience.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaCalendar className="mr-3 text-indigo-600" />
              Set Your Availability
            </h3>

            <p className="text-gray-600">
              Set your weekly schedule. (Saving availability can be added later.)
            </p>

            <div className="space-y-3">
              {availability.map((slot, index) => (
                <div key={slot.day} className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <label htmlFor={`availability-${index}`} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot.enabled}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleAvailabilityToggle(index);
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        id={`availability-${index}`}
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900 w-24 cursor-pointer">
                        {slot.day}
                      </span>
                    </label>

                    {slot.enabled && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <FaClock className="text-gray-400 mr-2" />
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              handleTimeChange(index, "startTime", e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            handleTimeChange(index, "endTime", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Bookings Per Day
                </label>
                <select
                  value={maxBookingsPerDay}
                  onChange={(e) => setMaxBookingsPerDay(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="1">1 booking</option>
                  <option value="2">2 bookings</option>
                  <option value="3">3 bookings</option>
                  <option value="4">4 bookings</option>
                  <option value="5">5 bookings</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Booking Window
                </label>
                <select
                  value={advanceBookingDays}
                  onChange={(e) => setAdvanceBookingDays(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="7">1 week</option>
                  <option value="14">2 weeks</option>
                  <option value="30">1 month</option>
                  <option value="60">2 months</option>
                  <option value="90">3 months</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  How far in advance can customers book?
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Blocked Dates</h4>
              <p className="text-gray-600 mb-4">
                Add dates when you are unavailable. Customers cannot book you on blocked dates.
              </p>

              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={blockedDateInput}
                      onChange={(e) => setBlockedDateInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
                    <input
                      type="text"
                      value={blockedReasonInput}
                      onChange={(e) => setBlockedReasonInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Vacation, appointment, etc."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addBlockedDate}
                    className="inline-flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaPlus className="mr-2" /> Block Date
                  </button>
                </div>

                {blockedDates.length === 0 ? (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                    No blocked dates added yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedDates
                      .slice()
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((blocked) => (
                        <div
                          key={blocked.id}
                          className="flex items-center justify-between bg-red-50 border border-red-200 p-4 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(`${blocked.date}T00:00:00`).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            {blocked.reason && (
                              <p className="text-sm text-gray-600">{blocked.reason}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBlockedDate(blocked.id)}
                            className="text-red-600 hover:text-red-700 flex items-center"
                          >
                            <FaTrash className="mr-2" /> Remove
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaCamera className="mr-3 text-indigo-600" />
              Photos & Documents
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  A clear, professional headshot helps build trust with customers.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Portfolio Photos (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setWorkPhotos(Array.from(e.target.files || []))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {workPhotos.length > 0 && (
                  <p className="text-sm text-indigo-600 mt-2">
                    {workPhotos.length} photo(s) selected
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Verification Documents
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Government-Issued ID (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {hasInsurance && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insurance Certificate
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setInsuranceDocument(e.target.files?.[0] || null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Photos and documents are optional. You can complete your profile without them and start accepting bookings immediately. You can always upload them later to build more trust with customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while checking profile status or loading existing data
  if (profileLoading || loadingProfileData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditMode ? "Edit Your Provider Profile" : "Complete Your Provider Profile"}
          </h1>
          <p className="text-lg text-gray-600">
            {isEditMode 
              ? "Update your profile information to keep it current"
              : "Let's get you set up to start accepting bookings"}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-indigo-600">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <Card>
          <form
            onSubmit={currentStep === totalSteps ? handleSubmit : (e) => e.preventDefault()}
          >
            {renderStep()}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prev}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={next}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  Next Step
                  <FaCheckCircle className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="mr-2" />
                      {isEditMode ? "Save Changes" : "Complete Profile"}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Step badges */}
        <div className="mt-8 grid grid-cols-5 gap-4">
          {["Basic Info", "Professional", "Services", "Availability", "Photos"].map(
            (label, i) => (
              <div
                key={label}
                className={`text-center p-3 rounded-lg transition-colors ${
                  currentStep === i + 1
                    ? "bg-indigo-600 text-white"
                    : currentStep > i + 1
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <div className="font-medium text-sm">{label}</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={isEditMode ? "Profile Updated Successfully!" : "Profile Created Successfully!"}
        size="md"
      >
        <div className="text-center">
          <div className="mb-4">
            <FaCheckCircle className="mx-auto text-green-500 text-6xl mb-4" />
          </div>
          <p className="text-lg text-gray-700 mb-6">
            {isEditMode 
              ? "Your profile has been updated successfully!" 
              : "Your profile has been created successfully!"}
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>You are now visible to customers searching for cleaning services</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>You can start accepting bookings immediately</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Customers in your area can find and book you</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/provider/dashboard');
            }}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProviderProfileSetup;
