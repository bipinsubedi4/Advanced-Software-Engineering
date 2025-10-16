// src/components/BookingForm.tsx
import { useEffect, useState } from "react";
import { api } from "../api";

type Service = { id:number; title:string };

export default function BookingForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    userId: "",         // TEMP: until login is built
    serviceId: "",
    startTime: "",
    endTime: "",
    address: "",
  });

  useEffect(() => {
    api.services().then(setServices).catch(() => setServices([]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      await api.createBooking({
        userId: Number(form.userId || 1),
        serviceId: Number(form.serviceId),
        startTime: form.startTime,
        endTime: form.endTime,
        address: form.address,
      });
      setMsg("✅ Booking created!");
      setForm({ userId: "", serviceId: "", startTime: "", endTime: "", address: "" });
    } catch (err: any) {
      setMsg(`❌ Failed: ${err?.message || "error"}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display:"grid", gap:10, maxWidth:460 }}>
      <h2>Create a Booking</h2>

      <label>
        Service
        <select
          value={form.serviceId}
          onChange={e => setForm({ ...form, serviceId: e.target.value })}
          required
        >
          <option value="">Select service</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </label>

      <label>
        Start time
        <input
          type="datetime-local"
          value={form.startTime}
          onChange={e => setForm({ ...form, startTime: e.target.value })}
          required
        />
      </label>

      <label>
        End time
        <input
          type="datetime-local"
          value={form.endTime}
          onChange={e => setForm({ ...form, endTime: e.target.value })}
          required
        />
      </label>

      <label>
        Address
        <input
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
          placeholder="123 Sample St"
          required
        />
      </label>

      <label>
        User ID (temporary)
        <input
          value={form.userId}
          onChange={e => setForm({ ...form, userId: e.target.value })}
          placeholder="1"
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Create booking"}
      </button>

      {msg && <div>{msg}</div>}
    </form>
  );
}
