import { apiClient } from "./client";

export type BookingStatusCount = {
  status: string;
  count: number;
};

export type OverviewResponse = {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  totalBookings: number;
  activeBookings: number;
  monthlyRevenue: number;
  averageBookingValue: number;
  bookingsByStatus: BookingStatusCount[];
  recentProviders: Array<{
    id: number;
    name: string;
    email: string;
    city: string | null;
    state: string | null;
    isVerified: boolean;
    createdAt: string;
  }>;
  recentCustomers: Array<{
    id: number;
    name: string | null;
    email: string;
    createdAt: string;
  }>;
};

export type BookingSummary = {
  id: number;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  createdAt: string;
  bookingDate: string;
  serviceName: string;
  customer: {
    id: number;
    name: string | null;
    email: string;
  };
  provider: {
    id: number;
    name: string | null;
    email: string;
  };
};

export type UserRecord = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export type ProviderRecord = {
  id: number;
  userId: number;
  name: string;
  email: string;
  city: string | null;
  state: string | null;
  serviceRadius: number;
  isVerified: boolean;
  isActive: boolean;
  isProfileComplete: boolean;
  createdAt: string;
  averageRating: number;
  totalBookings: number;
};

export const fetchOverview = async (): Promise<OverviewResponse> => {
  const { data } = await apiClient.get<OverviewResponse>("/api/admin/overview");
  return data;
};

export const fetchRecentBookings = async (): Promise<BookingSummary[]> => {
  const { data } = await apiClient.get<{ bookings: BookingSummary[] }>("/api/admin/bookings/recent");
  return data.bookings;
};

export const fetchUsers = async (): Promise<UserRecord[]> => {
  const { data } = await apiClient.get<{ users: UserRecord[] }>("/api/admin/users");
  return data.users;
};

export const fetchProviders = async (): Promise<ProviderRecord[]> => {
  const { data } = await apiClient.get<{ providers: ProviderRecord[] }>("/api/admin/providers");
  return data.providers;
};
