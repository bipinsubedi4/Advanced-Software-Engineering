import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "./prisma";

export interface AuthUser {
  sub: number;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) return res.sendStatus(401);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload | string;
    if (typeof payload === "string" || !payload.sub) return res.sendStatus(401);

    (req as AuthRequest).user = {
      sub: Number(payload.sub),
      role: (payload as JwtPayload).role as string,
    };
    next();
  } catch {
    return res.sendStatus(403);
  }
}

export const requireVerifiedProvider = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (!authReq.user || authReq.user.role !== "PROVIDER") {
    return res.status(403).json({ error: "Provider access required" });
  }

  try {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: authReq.user.sub },
      select: { isVerified: true },
    });

    if (!profile?.isVerified) {
      return res.status(403).json({ error: "Your provider profile must be approved by an admin." });
    }

    next();
  } catch (error) {
    console.error("requireVerifiedProvider error:", error);
    return res.status(500).json({ error: "Failed to verify provider status" });
  }
};
