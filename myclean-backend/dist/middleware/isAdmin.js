"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const prisma_1 = require("../prisma");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const requireAdmin = async (req, res, next) => {
    if (!ADMIN_EMAIL) {
        console.error("ADMIN_EMAIL is not configured.");
        return res.status(500).json({ error: "Admin access is not configured" });
    }
    const authReq = req;
    if (!authReq.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: authReq.user.sub } });
        if (!dbUser || dbUser.email !== ADMIN_EMAIL) {
            return res.status(403).json({ error: "Forbidden: Admin access required" });
        }
        authReq.adminEmail = dbUser.email;
        next();
    }
    catch (error) {
        console.error("isAdmin middleware error:", error);
        res.status(500).json({ error: "Failed to verify admin privileges" });
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=isAdmin.js.map