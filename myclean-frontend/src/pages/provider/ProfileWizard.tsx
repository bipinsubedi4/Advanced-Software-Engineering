import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import { useProviderProfile } from "../../hooks/useProviderProfile";
import Step1Personal from "./wizard/Step1Personal";
import Step2ServiceAreas from "./wizard/Step2ServiceAreas";
import Step3Services from "./wizard/Step3Services";
import Step4Availability from "./wizard/Step4Availability";
import { DAY_NAMES, findServiceCategory } from "./wizard/constants";
import { DayAvailability, ProfileWizardState, WizardServiceSelection } from "./wizard/types";
import { API_BASE } from "../../Services/api";

const buildDefaultAvailability = (): DayAvailability[] =>
  DAY_NAMES.map((day) => ({
    day,
    blocks: [],
  }));

const initialState: ProfileWizardState = {
  profileImageUrl: null,
  fullName: "",
  phone: "",
  bio: "",
  serviceSuburbs: [],
  services: [],
  availability: buildDefaultAvailability(),
};

const formatDayLabel = (value: string) => {
  const match = DAY_NAMES.find((day) => day.toUpperCase() === value?.toUpperCase());
  if (match) return match;
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "Monday";
};

const normalizeAvailability = (records: Array<{ dayOfWeek: string; startTime: string; endTime: string; id?: number }>): DayAvailability[] => {
  const map = new Map<string, DayAvailability>();
  DAY_NAMES.forEach((day) => map.set(day, { day, blocks: [] }));

  records.forEach((slot) => {
    const dayLabel = formatDayLabel(slot.dayOfWeek);
    const existing = map.get(dayLabel) ?? { day: dayLabel, blocks: [] };
    existing.blocks.push({
      id: `${dayLabel}-${slot.id ?? Math.random().toString(36).slice(2, 10)}`,
      startTime: slot.startTime ?? "09:00",
      endTime: slot.endTime ?? "17:00",
    });
    map.set(dayLabel, existing);
  });

  return DAY_NAMES.map((day) => map.get(day) ?? { day, blocks: [] });
};

const dedupeServices = (services: WizardServiceSelection[]): WizardServiceSelection[] => {
  const unique = new Map<string, WizardServiceSelection>();
  services.forEach((service) => {
    unique.set(service.name.toLowerCase(), service);
  });
  return Array.from(unique.values());
};

const ProfileWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { profile, profileComplete, loading: profileLoading, refetch } = useProviderProfile();

  const [formData, setFormData] = useState<ProfileWizardState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [initializing, setInitializing] = useState(true);
  const [prefilled, setPrefilled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (profileLoading) return;

    if (profile && !prefilled) {
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: profile.user?.profileImage ?? prev.profileImageUrl,
        fullName: profile.user?.name ?? prev.fullName,
        phone: profile.user?.phone ?? prev.phone,
        bio: profile.bio ?? prev.bio,
        serviceSuburbs: (profile as any).serviceSuburbs ?? (profile as any).servicePostcodes ?? prev.serviceSuburbs,
        services: profile.services
          ? dedupeServices(
              profile.services.map((service: any) => ({
                id: String(service.id),
                name: service.serviceName,
                category: findServiceCategory(service.serviceName),
                pricePerHour: service.pricePerHour ? service.pricePerHour / 100 : undefined,
              }))
            )
          : prev.services,
        availability: profile.availability ? normalizeAvailability(profile.availability) : prev.availability,
      }));
      setPrefilled(true);
    }

    if (!profile && !prefilled) {
      setFormData(initialState);
    }

    setInitializing(false);
  }, [profile, profileLoading, prefilled]);

  const handleFieldUpdate = (updates: Partial<ProfileWizardState>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleServicesChange = (services: WizardServiceSelection[]) => {
    setFormData((prev) => ({ ...prev, services: dedupeServices(services) }));
  };

  const handleAvailabilityChange = (availability: DayAvailability[]) => {
    setFormData((prev) => ({ ...prev, availability }));
  };

  const handlePhotoUpload = useCallback(
    async (file: File) => {
      if (!token) {
        setPhotoError("You must be logged in to upload a photo.");
        return;
      }

      setPhotoUploading(true);
      setPhotoError(null);

      try {
        const form = new FormData();
        form.append("file", file);
        const response = await axios.post(`${API_BASE}/api/cleaners/me/profile-image`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        handleFieldUpdate({ profileImageUrl: response.data.imageUrl });
      } catch (uploadError: any) {
        console.error("Photo upload failed", uploadError);
        setPhotoError(uploadError?.response?.data?.error ?? "Failed to upload image");
      } finally {
        setPhotoUploading(false);
      }
    },
    [token]
  );

  const validations = useMemo(
    () => [
      () =>
        formData.fullName.trim().length > 1 &&
        formData.phone.trim().length > 5 &&
        formData.bio.trim().length > 10,
      () => formData.serviceSuburbs.length > 0,
      () => formData.services.length > 0,
      () => formData.availability.some((day) => day.blocks.length > 0),
    ],
    [formData]
  );

  const canProceed = validations[currentStep]?.() ?? false;
  const progress = ((currentStep + 1) / validations.length) * 100;

  const nextStep = () => {
    if (!canProceed) return;
    setCurrentStep((prev) => Math.min(prev + 1, validations.length - 1));
  };

  const previousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const preparePayload = () => ({
    fullName: formData.fullName.trim(),
    phone: formData.phone.trim(),
    bio: formData.bio.trim(),
    profileImageUrl: formData.profileImageUrl ?? undefined,
    serviceSuburbs: formData.serviceSuburbs,
    services: formData.services.map((service) => ({
      name: service.name,
      category: service.category,
      pricePerHour: (service as any).pricePerHour, // Include price if set
    })),
    availability: formData.availability
      .filter((day) => day.blocks.length > 0)
      .map((day) => ({
        day: day.day.toUpperCase(),
        blocks: day.blocks.map((block) => ({
          startTime: block.startTime,
          endTime: block.endTime,
        })),
      })),
  });

  const finishWizard = async () => {
    if (!token) {
      setError("You must be logged in to complete your profile.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await axios.put(`${API_BASE}/api/cleaners/me/profile`, preparePayload(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refetch();
      navigate("/provider/home", { replace: true });
    } catch (err: any) {
      console.error("Profile completion failed", err);
      setError(err?.response?.data?.error ?? "Unable to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrimaryAction = () => {
    if (currentStep === validations.length - 1) {
      void finishWizard();
    } else {
      nextStep();
    }
  };

  if (!user) {
    return null;
  }

  if (profileLoading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isEditing = profileComplete === true;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Provider Onboarding</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">
            {isEditing
              ? "Update your profile details to keep your listing fresh."
              : "Tell us about yourself so we can match you with the right customers."}
          </p>
        </div>

        <Card>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Step {currentStep + 1} of {validations.length}</p>
                <p className="text-sm text-gray-500">
                  {["Personal Details", "Location & Service Area", "Services Offered", "Availability"][currentStep]}
                </p>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {currentStep === 0 && (
              <Step1Personal
                data={{
                  profileImageUrl: formData.profileImageUrl,
                  fullName: formData.fullName,
                  phone: formData.phone,
                  bio: formData.bio,
                }}
                onChange={handleFieldUpdate}
                onUploadPhoto={handlePhotoUpload}
                uploading={photoUploading}
                uploadError={photoError}
              />
            )}

            {currentStep === 1 && (
              <Step2ServiceAreas
                serviceSuburbs={formData.serviceSuburbs}
                onChange={(suburbs) => handleFieldUpdate({ serviceSuburbs: suburbs })}
              />
            )}

            {currentStep === 2 && (
              <Step3Services selected={formData.services} onChange={handleServicesChange} />
            )}

            {currentStep === 3 && (
              <Step4Availability availability={formData.availability} onChange={handleAvailabilityChange} />
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={previousStep}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Previous
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={!canProceed || isSaving}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${
                  !canProceed || isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {currentStep === validations.length - 1 ? (isSaving ? "Finishing..." : "Finish") : "Next"}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileWizard;
