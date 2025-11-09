// src/components/BookingForm.tsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "../Services/api";

type ServiceOption = { id: number; title: string; providerId: number };

export default function BookingForm() {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    userId: "", // TEMP: until login is built
    serviceId: "",
    providerId: "",
    frequency: "ONE_TIME",
    startTime: "",
    endTime: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    endDate: "",
    notes: "",
  });

  // Load providers and flatten their services into select options
  useEffect(() => {
    (async () => {
      try {
        const providersRes = await api.providers(); // GET /api/providers
        // providersRes is an array of provider profiles with .services
        const options: ServiceOption[] = providersRes.flatMap((p: any) =>
          (p.services ?? []).map((s: any) => ({
            id: s.id,
            // show provider name to help users pick
            title: `${s.serviceName} — ${p.user?.name ?? "Cleaner"}`,
            providerId: p.userId ?? p.user?.id ?? 0,
          })),
        );
        setServices(options);
      } catch (e) {
        console.error("Failed to load providers/services", e);
        setServices([]);
      }
    })();
  }, []);

  const selectedService = useMemo(
    () => services.find((service) => String(service.id) === form.serviceId),
    [services, form.serviceId]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      if (form.frequency !== "ONE_TIME") {
        await axios.post("/api/jobs/recurring", {
          customerId: Number(form.userId || 1),
          providerId: Number(form.providerId || selectedService?.providerId || 0),
          serviceId: Number(form.serviceId),
          frequency: form.frequency,
          startDate: form.startTime,
          startTime: form.startTime.split("T")[1] || "09:00",
          endTime: form.endTime.split("T")[1] || "11:00",
          endDate: form.endDate || null,
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          notes: form.notes,
        });
        setMsg("✅ Recurring schedule saved!");
      } else {
        await api.createBooking({
          userId: Number(form.userId || 1),
          serviceId: Number(form.serviceId),
          startTime: form.startTime,
          endTime: form.endTime,
          address: form.address,
        });
        setMsg("✅ Booking created!");
      }
      setForm({
        userId: "",
        serviceId: "",
        providerId: "",
        frequency: "ONE_TIME",
        startTime: "",
        endTime: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        endDate: "",
        notes: "",
      });
    } catch (err: any) {
      setMsg(`❌ Failed: ${err?.message || "error"}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 460 }}>
      <h2>Create a Booking</h2>

      <label>
        Service
        <select
          value={form.serviceId}
          onChange={(e) =>
            setForm({
              ...form,
              serviceId: e.target.value,
              providerId:
                services.find((s) => String(s.id) === e.target.value)?.providerId?.toString() || "",
            })
          }
          required
        >
          <option value="">Select service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Frequency
        <select
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
        >
          <option value="ONE_TIME">One-time</option>
          <option value="WEEKLY">Weekly</option>
          <option value="BIWEEKLY">Bi-weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
      </label>

      <label>
        Start time
        <input
          type="datetime-local"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          required
        />
      </label>

      <label>
        End time
        <input
          type="datetime-local"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          required
        />
      </label>

      <label>
        Address
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="123 Sample St"
          required
        />
      </label>
      <label>
        City
        <input
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="Sydney"
        />
      </label>
      <label>
        State
        <input
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          placeholder="NSW"
        />
      </label>
      <label>
        Postcode
        <input
          value={form.zipCode}
          onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
          placeholder="2000"
        />
      </label>
      {form.frequency !== "ONE_TIME" && (
        <>
          <label>
            End date (optional)
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </label>
          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any instructions for recurring visits"
            />
          </label>
        </>
      )}

      <label>
        User ID (temporary)
        <input
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
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
