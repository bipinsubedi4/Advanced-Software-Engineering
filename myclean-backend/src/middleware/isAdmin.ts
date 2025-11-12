import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middleware";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!ADMIN_EMAIL) {
    console.error("ADMIN_EMAIL is not configured.");
    return res.status(500).json({ error: "Admin access is not configured" });
  }

  const authReq = req as AuthRequest;
  if (!authReq.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: authReq.user.sub } });
    if (!dbUser || dbUser.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    (authReq as AuthRequest & { adminEmail?: string }).adminEmail = dbUser.email;
    next();
  } catch (error) {
    console.error("isAdmin middleware error:", error);
    res.status(500).json({ error: "Failed to verify admin privileges" });
  }
};
