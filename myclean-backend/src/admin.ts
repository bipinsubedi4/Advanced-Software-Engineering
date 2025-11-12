import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { authenticateToken } from "./middleware";
import { requireAdmin } from "./middleware/isAdmin";

const adminRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

type LoginBody = {
  email: string;
  password: string;
};

const normalizeCompletedStatus = () => ["COMPLETED", "completed"];

adminRouter.post("/login", async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
  try {
    if (!ADMIN_EMAIL) {
      return res.status(500).json({ error: "ADMIN_EMAIL is not configured" });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const adminUser = await prisma.user.findUnique({ where: { email } });
    if (!adminUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordValid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: adminUser.id, role: adminUser.role, email: adminUser.email, scope: "admin" },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

adminRouter.use(authenticateToken);
adminRouter.use(requireAdmin);

adminRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [userCount, bookingCount, revenueSum] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          status: {
            in: normalizeCompletedStatus(),
          },
        },
      }),
    ]);

    res.json({
      users: userCount,
      bookings: bookingCount,
      revenue: Number(revenueSum._sum.totalPrice ?? 0),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

adminRouter.get("/providers/pending", async (_req: Request, res: Response) => {
  try {
    const pendingProviders = await prisma.providerProfile.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      providers: pendingProviders.map((provider) => ({
        id: provider.id,
        userId: provider.userId,
        name: provider.user?.name ?? "Unknown",
        email: provider.user?.email ?? "",
        createdAt: provider.createdAt,
        city: provider.city,
        state: provider.state,
        isVerified: provider.isVerified,
        verificationStatus: provider.verificationStatus,
      })),
    });
  } catch (error) {
    console.error("Pending providers error:", error);
    res.status(500).json({ error: "Failed to load providers" });
  }
});

adminRouter.post("/providers/approve/:id", async (req: Request, res: Response) => {
  try {
    const providerId = Number(req.params.id);
    if (Number.isNaN(providerId)) {
      return res.status(400).json({ error: "Invalid provider id" });
    }

    const updated = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        isVerified: true,
        verificationStatus: "APPROVED",
        isActive: true,
      },
    });

    res.json({ provider: updated });
  } catch (error) {
    console.error("Approve provider error:", error);
    res.status(500).json({ error: "Failed to approve provider" });
  }
});

adminRouter.post("/providers/reject/:id", async (req: Request, res: Response) => {
  try {
    const providerId = Number(req.params.id);
    if (Number.isNaN(providerId)) {
      return res.status(400).json({ error: "Invalid provider id" });
    }

    const updated = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        isVerified: false,
        isActive: false,
        verificationStatus: "REJECTED",
      },
    });

    res.json({ provider: updated });
  } catch (error) {
    console.error("Reject provider error:", error);
    res.status(500).json({ error: "Failed to reject provider" });
  }
});

adminRouter.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isSuspended: true,
      },
    });

    res.json({ users });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ error: "Failed to load users" });
  }
});

adminRouter.put("/users/:id/suspend", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: !user.isSuspended },
    });

    res.json({ user: updated });
  } catch (error) {
    console.error("Suspend user error:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

export default adminRouter;
