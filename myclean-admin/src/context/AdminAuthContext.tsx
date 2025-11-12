import { AxiosError } from "axios";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiClient, setAuthToken } from "../api/client";

type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
};

type AdminAuthContextType = {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedUser = localStorage.getItem("adminUser");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser) as AdminUser;
        setUser(parsed);
        setAuthToken(storedToken);
      } catch {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      }
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthToken(undefined);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const response = await apiClient.post("/api/auth/login", { email, password });
      const { token: newToken, user: payloadUser } = response.data as {
        token: string;
        user: AdminUser;
      };

      if (payloadUser.role !== "ADMIN") {
        throw new Error("This dashboard is restricted to admin accounts.");
      }

      setToken(newToken);
      setUser(payloadUser);
      setAuthToken(newToken);
      localStorage.setItem("adminToken", newToken);
      localStorage.setItem("adminUser", JSON.stringify(payloadUser));
    } catch (err) {
      let message = "Login failed. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        message = String(err.message);
      }

      if ((err as AxiosError)?.response?.data) {
        const data = (err as AxiosError<{ error?: string; message?: string }>).response?.data;
        message = data?.error ?? data?.message ?? message;
      }
      setError(message);
      throw new Error(message);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      error,
      clearError,
    }),
    [user, token, loading, login, logout, error, clearError]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
};
