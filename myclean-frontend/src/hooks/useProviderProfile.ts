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
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefreshIndex((index) => index + 1);
  }, []);

  useEffect(() => {
    if (!isProvider || !user || !token) {
      setProfileComplete(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get<CleanerProfileResponse>(`${API_BASE}/api/cleaners/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const completionFlag =
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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isProvider, token, refreshIndex]);

  return { profileComplete, profile, loading, refetch };
};
