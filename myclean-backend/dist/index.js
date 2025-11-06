"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const prisma_1 = require("./prisma");
const auth_1 = __importDefault(require("./auth"));
const bookings_1 = __importDefault(require("./bookings"));
const reviews_1 = __importDefault(require("./reviews"));
const servicesRoute_1 = __importDefault(require("./servicesRoute"));
const providers_1 = __importDefault(require("./providers"));
const middleware_1 = require("./middleware");
const socket_1 = require("./socket");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Initialize Socket.IO
const io = (0, socket_1.initializeSocket)(httpServer);
console.log("🔌 Socket.IO initialized");
app.use((0, helmet_1.default)());
// CORS configuration - accept multiple origins
const allowedOrigins = [
    "http://localhost:3000",
    "https://myclean-project.vercel.app",
    "https://advanced-software-engineering-orpin.vercel.app",
];
// Allow any Vercel preview/production domain
const isVercelDomain = (origin) => {
    if (!origin)
        return false;
    return origin.includes(".vercel.app") || allowedOrigins.includes(origin);
};
app.use("/api/services", servicesRoute_1.default);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) {
            console.log("CORS: Allowing request with no origin");
            return callback(null, true);
        }
        // Check if it's localhost or allowed origin
        if (allowedOrigins.includes(origin) || isVercelDomain(origin)) {
            console.log(`CORS: Allowing origin: ${origin}`);
            return callback(null, true);
        }
        console.log(`CORS: Blocked origin: ${origin}`);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", auth_1.default);
// Iteration 2 API routes
app.use("/api/providers", providers_1.default);
app.use("/api/bookings", bookings_1.default);
app.use("/api/reviews", reviews_1.default);
// Example protected route
app.get("/api/users", middleware_1.authenticateToken, async (req, res) => {
    const user = req.user; // safely cast when you need it
    // TODO: replace with real implementation
    res.json({ message: "Fetched user successfully", user });
});
// Notification routes
app.get("/api/notifications/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await prisma_1.prisma.notification.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        res.json({ success: true, notifications });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get notifications" });
    }
});
app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await prisma_1.prisma.notification.update({
            where: { id: parseInt(id) },
            data: { isRead: true },
        });
        res.json({ success: true, notification });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update notification" });
    }
});
// Message routes
app.get("/api/messages/booking/:bookingId", async (req, res) => {
    try {
        const { bookingId } = req.params;
        const messages = await prisma_1.prisma.message.findMany({
            where: { bookingId: parseInt(bookingId) },
            include: {
                sender: { select: { id: true, name: true, profileImage: true } },
                receiver: { select: { id: true, name: true, profileImage: true } },
            },
            orderBy: { createdAt: "asc" },
        });
        res.json({ success: true, messages });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get messages" });
    }
});
app.patch("/api/messages/booking/:bookingId/read", async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "Missing userId" });
        }
        const result = await prisma_1.prisma.message.updateMany({
            where: {
                bookingId: parseInt(bookingId),
                receiverId: userId,
                isRead: false,
            },
            data: { isRead: true },
        });
        res.json({ success: true, updated: result.count });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to mark messages as read" });
    }
});
app.post("/api/messages", async (req, res) => {
    try {
        const { bookingId, senderId, receiverId, content } = req.body;
        const booking = await prisma_1.prisma.booking.findUnique({
            where: { id: bookingId },
            select: {
                customerId: true,
                providerId: true,
            },
        });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        const participants = [booking.customerId, booking.providerId];
        if (!participants.includes(senderId) || !participants.includes(receiverId)) {
            return res.status(403).json({ error: "Users are not part of this booking" });
        }
        const messageRecord = await prisma_1.prisma.message.create({
            data: { bookingId, senderId, receiverId, content },
            include: {
                sender: { select: { id: true, name: true, profileImage: true } },
                receiver: { select: { id: true, name: true, profileImage: true } },
            },
        });
        const payload = {
            id: messageRecord.id,
            bookingId: messageRecord.bookingId,
            senderId: messageRecord.senderId,
            receiverId: messageRecord.receiverId,
            content: messageRecord.content,
            isRead: messageRecord.isRead,
            createdAt: messageRecord.createdAt.toISOString(),
            sender: messageRecord.sender,
            receiver: messageRecord.receiver,
        };
        // Create notification for receiver
        await prisma_1.prisma.notification.create({
            data: {
                userId: receiverId,
                type: "NEW_MESSAGE",
                title: "New Message",
                message: `${messageRecord.sender.name} sent you a message`,
                link: `/my-bookings`,
            },
        });
        // Emit message to socket room
        io.to(`booking_${bookingId}`).emit("receive_message", {
            id: messageRecord.id,
            bookingId: messageRecord.bookingId,
            senderId: messageRecord.senderId,
            receiverId: messageRecord.receiverId,
            content: messageRecord.content,
            createdAt: messageRecord.createdAt.toISOString(),
            isRead: messageRecord.isRead,
            sender: messageRecord.sender,
        });
        res.status(201).json({ success: true, message: payload });
    }
    catch (error) {
        console.error("Failed to send message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
});
const port = Number(process.env.PORT || 4000);
httpServer.listen(port, "0.0.0.0", () => {
    console.log(`🚀 MyClean Backend API running on port ${port}`);
    console.log(`🔌 WebSocket server running on same port`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`✅ Health check: http://localhost:${port}/api/health`);
});
//# sourceMappingURL=index.js.map