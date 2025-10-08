// src/api.ts
const BASE = process.env.REACT_APP_API_URL || ""; // blank = use proxy

// generic GET helper
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

// generic POST helper
async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

// exported API object
export const api = {
  health: () => get<{ ok: boolean }>("/api/health"),
  services: () =>
    get<Array<{ id:number; title:string; description:string; durationMin:number; priceCents:number }>>("/api/services"),
  bookings: () =>
    get<Array<{ id:number; address:string; status:string; startTime:string; endTime:string; user?:any; service?:any }>>("/api/bookings"),
  createBooking: (data: {
    userId: number;
    serviceId: number;
    startTime: string;
    endTime: string;
    address: string;
  }) => post("/api/bookings", data),
  users: () => get<Array<{ id:number; name:string; email:string }>>("/api/users"),
};
