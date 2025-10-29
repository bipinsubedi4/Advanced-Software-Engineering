import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

interface MyTokenPayload {
  sub: number;
  role: string;
}

export interface AuthRequest extends Request {
  user?: {
    sub: number;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === 'string') return res.sendStatus(401);

    const typedPayload = payload as unknown as MyTokenPayload;
    if (!typedPayload.sub || !typedPayload.role) return res.sendStatus(401);

    req.user = {
      sub: typedPayload.sub,
      role: typedPayload.role,
    };
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};