import type { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    sub: number;
    role: string;
}
export interface AuthRequest extends Request {
    user?: AuthUser;
}
export declare function authenticateToken(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=middleware.d.ts.map