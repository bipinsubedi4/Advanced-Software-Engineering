import { apiClient } from "./client";

export type AdminStats = {
  users: number;
  bookings: number;
  revenue: number;
};

export type ServiceRecord = {
  id: number;
  serviceName: string;
  description?: string | null;
  pricePerHour: number;
  durationMin: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  provider: {
    profileId: number;
    userId: number;
    name: string;
    email: string;
    city?: string | null;
    state?: string | null;
  };
};

export type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  isSuspended: boolean;
};

export type AdminProviderProfile = {
  id: number;
  userId: number;
  city: string | null;
  state: string | null;
  serviceRadius: number | null;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    phone?: string | null;
  };
  services: Array<{
    id: number;
    serviceName: string;
    status: string;
    isActive: boolean;
  }>;
};

export type AdminBooking = {
  id: number;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  createdAt: string;
  bookingDate: string;
  customer: { id: number; name: string | null; email: string };
  provider: { id: number; name: string | null; email: string };
  service: { id: number; serviceName: string; status: string };
};

export type AdminReview = {
  id: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  booking: { id: number; service: { id: number; serviceName: string } | null };
  customer: { id: number; name: string | null; email: string };
};

export const adminLogin = async (email: string, password: string) => {
  const { data } = await apiClient.post("/api/admin/login", { email, password });
  return data as { token: string; user: { id: number; name: string | null; email: string; role: string } };
};

export const fetchStats = async (): Promise<AdminStats> => {
  const { data } = await apiClient.get<AdminStats>("/api/admin/stats");
  return data;
};

export const fetchServices = async (status?: string): Promise<ServiceRecord[]> => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const { data } = await apiClient.get<{ services: ServiceRecord[] }>(`/api/admin/services${query}`);
  return data.services;
};

export const approveService = async (id: number) => {
  await apiClient.post(`/api/admin/services/${id}/approve`);
};

export const rejectService = async (id: number, reason?: string) => {
  await apiClient.post(`/api/admin/services/${id}/reject`, { reason });
};

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const { data } = await apiClient.get<{ users: AdminUser[] }>("/api/admin/users");
  return data.users;
};

export const toggleUserSuspend = async (id: number) => {
  const { data } = await apiClient.put<{ user: AdminUser }>(`/api/admin/users/${id}/suspend`);
  return data.user;
};

export const fetchProviderProfiles = async (): Promise<AdminProviderProfile[]> => {
  const { data } = await apiClient.get<{ profiles: AdminProviderProfile[] }>("/api/admin/provider-profiles");
  return data.profiles;
};

export const fetchAdminBookings = async (): Promise<AdminBooking[]> => {
  const { data } = await apiClient.get<{ bookings: AdminBooking[] }>("/api/admin/bookings");
  return data.bookings;
};

export const fetchAdminReviews = async (): Promise<AdminReview[]> => {
  const { data } = await apiClient.get<{ reviews: AdminReview[] }>("/api/admin/reviews");
  return data.reviews;
};
