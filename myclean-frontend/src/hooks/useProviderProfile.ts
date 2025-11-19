// Hook to check if provider profile is complete
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../Services/api';

interface CleanerProfileResponse {
  success: boolean;
  profileComplete: boolean;
  isProfileComplete: boolean;
  profile: any;
}

export const useProviderProfile = () => {
  const { user, isProvider, token } = useAuth();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (): Promise<boolean | null> => {
    if (!isProvider || !user || !token) {
      setProfileComplete(null);
      setProfile(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    let completionFlag = false;
    try {
      const response = await axios.get<CleanerProfileResponse>(`${API_BASE}/api/cleaners/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      completionFlag =
        response.data.isProfileComplete ??
        response.data.profileComplete ??
        response.data.profile?.isProfileComplete ??
        response.data.profile?.profileComplete ??
        false;

      setProfileComplete(completionFlag);
      setProfile(response.data.profile ?? null);
    } catch (error) {
      console.error('Error checking profile:', error);
      setProfileComplete(false);
      setProfile(null);
      completionFlag = false;
    } finally {
      setLoading(false);
    }
    return completionFlag;
  }, [isProvider, user, token]);

  useEffect(() => {
    fetchProfile().catch((error) => {
      console.error('Failed to load provider profile', error);
    });
  }, [fetchProfile]);

  const markProfileComplete = useCallback((value: boolean) => {
    setProfileComplete(value);
  }, []);

  return { profileComplete, profile, loading, refetch: fetchProfile, markProfileComplete };
};
