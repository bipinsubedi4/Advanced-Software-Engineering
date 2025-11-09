import { type Request, type Response } from "express";
declare const router: import("express-serve-static-core").Router;
export declare const stripeWebhookHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export default router;
//# sourceMappingURL=stripeRoutes.d.ts.map