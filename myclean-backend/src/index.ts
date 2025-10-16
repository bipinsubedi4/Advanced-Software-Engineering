import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./prisma"; // <- uses src/prisma.ts
import authRouter from "./auth";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Auth routes
app.use("/api/auth", authRouter);

// Services
app.get("/api/services", async (_req, res) => {
  const services = await prisma.service.findMany();
  res.json(services);
});

app.post("/api/services", async (req, res) => {
  const { title, description, durationMin, priceCents } = req.body;
  const svc = await prisma.service.create({
    data: { title, description, durationMin, priceCents },
  });
  res.status(201).json(svc);
});

// Bookings
app.get("/api/bookings", async (_req, res) => {
  const bookings = await prisma.booking.findMany({
    include: { user: true, service: true },
  });
  res.json(bookings);
});

app.post("/api/bookings", async (req, res) => {
  const { userId, serviceId, startTime, endTime, address } = req.body;
  const booking = await prisma.booking.create({
    data: {
      userId,
      serviceId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      address,
    },
  });
  res.status(201).json(booking);
});

// Users
app.get("/api/users", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  const { email, name } = req.body;
  const user = await prisma.user.create({ data: { email, name } });
  res.status(201).json(user);
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API running at http://localhost:${port}`));
