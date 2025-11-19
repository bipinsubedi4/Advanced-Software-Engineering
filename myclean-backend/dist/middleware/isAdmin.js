"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const requireAdmin = async (req, res, next) => {
    const authReq = req;
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
    authReq.adminEmail = authReq.user.email;
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=isAdmin.js.map