import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../middleware";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: authReq.user.sub } });
    if (!dbUser) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const isRoleAdmin = dbUser.role === "ADMIN";
    const isAllowedEmail = ADMIN_EMAIL ? dbUser.email === ADMIN_EMAIL : true;

    if (!isRoleAdmin || !isAllowedEmail) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    (authReq as AuthRequest & { adminEmail?: string }).adminEmail = dbUser.email;
    next();
  } catch (error) {
    console.error("isAdmin middleware error:", error);
    res.status(500).json({ error: "Failed to verify admin privileges" });
  }
};
