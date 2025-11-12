"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerifiedProvider = void 0;
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("./prisma");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
function authenticateToken(req, res, next) {
    const authHeader = req.header("authorization");
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;
    if (!token)
        return res.sendStatus(401);
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof payload === "string" || !payload.sub)
            return res.sendStatus(401);
        req.user = {
            sub: Number(payload.sub),
            role: payload.role,
        };
        next();
    }
    catch {
        return res.sendStatus(403);
    }
}
const requireVerifiedProvider = async (req, res, next) => {
    const authReq = req;
    if (!authReq.user || authReq.user.role !== "PROVIDER") {
        return res.status(403).json({ error: "Provider access required" });
    }
    try {
        const profile = await prisma_1.prisma.providerProfile.findUnique({
            where: { userId: authReq.user.sub },
            select: { isVerified: true },
        });
        if (!profile?.isVerified) {
            return res.status(403).json({ error: "Your provider profile must be approved by an admin." });
        }
        next();
    }
    catch (error) {
        console.error("requireVerifiedProvider error:", error);
        return res.status(500).json({ error: "Failed to verify provider status" });
    }
};
exports.requireVerifiedProvider = requireVerifiedProvider;
//# sourceMappingURL=middleware.js.map