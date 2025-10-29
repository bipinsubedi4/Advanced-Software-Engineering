import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./prisma"; 
import authRouter from "./auth";
import { authenticateToken, AuthRequest } from "./middleware";

const app = express();
app.use(helmet());
app.use(cors()); // We will fix this for production later
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);

// --- PROTECTED ROUTES ---
app.get("/api/services", async (_req, res) => {
  const services = await prisma.service.findMany();
  res.json(services);
});

app.post("/api/services", authenticateToken, async (req: AuthRequest, res) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Only admins can create services" });
  }
  const { title, description, durationMin, priceCents } = req.body;
  const svc = await prisma.service.create({
    data: { title, description, durationMin, priceCents },
  });
  res.status(201).json(svc);
});

app.get("/api/bookings", authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.sub;
  const userRole = req.user!.role;

  let bookings;
  if (userRole === "ADMIN") {
    bookings = await prisma.booking.findMany({
      include: { user: true, service: true },
    });
  } else {
    bookings = await prisma.booking.findMany({
      where: { userId: userId },
      include: { user: true, service: true },
    });
  }
  res.json(bookings);
});

app.post("/api/bookings", authenticateToken, async (req: AuthRequest, res) => {
  const { serviceId, startTime, endTime, address } = req.body;
  const userId = req.user!.sub; 

  const booking = await prisma.booking.create({
    data: {
      userId: userId,
      serviceId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      address,
    },
  });
  res.status(201).json(booking);
});

app.get("/api/users", authenticateToken, async (req: AuthRequest, res) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  res.json(users);
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API running at http://localhost:${port}`));