import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middleware";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const normalizedRole = authReq.user.role?.toUpperCase() ?? "";
  const isRoleAdmin = normalizedRole === "ADMIN";
  const emailMatchesAdmin = ADMIN_EMAIL
    ? authReq.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    : false;

  if (!isRoleAdmin && !emailMatchesAdmin) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  (authReq as AuthRequest & { adminEmail?: string }).adminEmail = authReq.user.email;
  next();
};
