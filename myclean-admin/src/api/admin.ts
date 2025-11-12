import { apiClient } from "./client";

export type AdminStats = {
  users: number;
  bookings: number;
  revenue: number;
};

export type PendingProvider = {
  id: number;
  userId: number;
  name: string;
  email: string;
  createdAt: string;
  city: string | null;
  state: string | null;
  isVerified: boolean;
  verificationStatus: string;
};

export type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  isSuspended: boolean;
};

export const adminLogin = async (email: string, password: string) => {
  const { data } = await apiClient.post("/api/admin/login", { email, password });
  return data as { token: string; user: { id: number; name: string | null; email: string; role: string } };
};

export const fetchStats = async (): Promise<AdminStats> => {
  const { data } = await apiClient.get<AdminStats>("/api/admin/stats");
  return data;
};

export const fetchPendingProviders = async (): Promise<PendingProvider[]> => {
  const { data } = await apiClient.get<{ providers: PendingProvider[] }>("/api/admin/providers/pending");
  return data.providers;
};

export const approveProvider = async (id: number) => {
  await apiClient.post(`/api/admin/providers/approve/${id}`);
};

export const rejectProvider = async (id: number) => {
  await apiClient.post(`/api/admin/providers/reject/${id}`);
};

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const { data } = await apiClient.get<{ users: AdminUser[] }>("/api/admin/users");
  return data.users;
};

export const toggleUserSuspend = async (id: number) => {
  const { data } = await apiClient.put<{ user: AdminUser }>(`/api/admin/users/${id}/suspend`);
  return data.user;
};
