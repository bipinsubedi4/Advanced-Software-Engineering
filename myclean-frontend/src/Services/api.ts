// src/services/api.ts

// In production, REACT_APP_API_URL must be set in Vercel environment variables.
// If it's missing (such as on preview deployments) we fall back to the deployed backend.
// For local dev, default to localhost.
const LOCAL_API_BASE = "http://localhost:4000";
const PROD_FALLBACK_BASE = "https://advanced-software-engineering-production.up.railway.app";

const BASE_RAW =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? PROD_FALLBACK_BASE : LOCAL_API_BASE);

const BASE = BASE_RAW.replace(/\/+$/, ""); // Remove trailing slashes
export const API_BASE = BASE;

// Debug logging
console.log("🌐 API Base URL (raw):", BASE_RAW);
console.log("🌐 API Base URL (normalized):", BASE);
console.log("🌐 NODE_ENV:", process.env.NODE_ENV);

// Log a warning in production if API URL is not configured
if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
  console.warn('⚠️ REACT_APP_API_URL is not set; falling back to deployed backend URL.');
}

export type Service = {
  id: number;
  serviceName: string;
  description?: string | null;
  pricePerHour: number; // cents
  durationMin: number;
  provider: {
    profileId: number;
    userId: number;
    name: string;
    profileImage?: string | null;
  };
};

// Helper function to build full URL, ensuring single slash between BASE and path
export function buildApiUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${normalizedPath}`;
}

export async function get<T>(path: string): Promise<T> {
  try {
    const url = buildApiUrl(path);
    console.log(`🔗 Fetching: ${url}`);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`❌ GET ${url} failed:`, res.status, errorText);
      throw new Error(`GET ${path} failed: ${res.status} - ${errorText}`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const url = buildApiUrl(path);
      console.error(`🌐 Network error: Cannot reach ${url}. Is the backend running?`);
      throw new Error(`Cannot connect to backend at ${BASE}. Please check your REACT_APP_API_URL configuration.`);
    }
    throw error;
  }
}

export async function post<T>(path: string, body: any): Promise<T> {
  const url = buildApiUrl(path);
  console.log(`📤 POST: ${url}`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    console.error(`❌ POST ${url} failed:`, res.status, errorText);
    throw new Error(`POST ${path} failed: ${res.status} - ${errorText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => get<{ ok: boolean }>("/api/health"),

  // ✅ now matches your new backend route/shape
  services: async () => {
    const data = await get<{ success: boolean; services: Service[] }>("/api/services");
    return data.services ?? [];
  },

  providers: async () => {
    const data = await get<{ success: boolean; providers: any[] }>("/api/providers");
    return data.providers ?? [];
  },

  provider: async (id: number) => {
    const data = await get<{ success: boolean; profile: any }>(`/api/providers/${id}`);
    return data.profile;
  },

  bookings: () => get<any[]>("/api/bookings"),
  createBooking: (payload: {
    userId: number;
    serviceId: number;
    startTime: string;
    endTime: string;
    address: string;
  }) => post("/api/bookings", payload),

  users: () => get<any[]>("/api/users"),
};
