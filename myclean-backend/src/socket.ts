import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { prisma } from "./prisma";

interface SocketUser {
  userId: number;
  socketId: string;
}

// Track online users
const onlineUsers: Map<number, string> = new Map();

export function initializeSocket(httpServer: HTTPServer) {
  const staticAllowedOrigins = new Set([
    "http://localhost:3000",
    "https://myclean-project.vercel.app",
    "https://advanced-software-engineering-pi.vercel.app",
    "https://advanced-software-engineering-orpin.vercel.app",
  ]);

  const additionalOrigins = (process.env.SOCKET_EXTRA_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  additionalOrigins.forEach((origin) => staticAllowedOrigins.add(origin));

  const isAllowedOrigin = (origin?: string | null): boolean => {
    if (!origin) return true;
    if (staticAllowedOrigins.has(origin)) return true;
    if (origin.includes(".vercel.app")) return true;
    return false;
  };

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }

        console.warn(`Socket.IO CORS blocked origin: ${origin ?? "unknown"}`);
        return callback(new Error(`Socket origin not allowed: ${origin}`));
      },
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("✅ User connected:", socket.id);

    // User joins with their userId
    socket.on("user_online", (userId: number) => {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      console.log(`👤 User ${userId} is online`);
      
      // Broadcast online status
      io.emit("user_status", { userId, status: "online" });
    });

    // Join a chat room (based on bookingId)
    socket.on("join_room", (bookingId: number) => {
      socket.join(`booking_${bookingId}`);
      console.log(`📨 User joined room: booking_${bookingId}`);
    });

    // Send a message
    socket.on("send_message", async (data: {
      bookingId: number;
      senderId: number;
      receiverId: number;
      content: string;
    }) => {
      try {
        // Save message to database
        const message = await prisma.message.create({
          data: {
            bookingId: data.bookingId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        });

        // Emit to all users in the room
        io.to(`booking_${data.bookingId}`).emit("receive_message", {
          id: message.id,
          bookingId: message.bookingId,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          createdAt: message.createdAt,
          isRead: message.isRead,
          sender: message.sender,
        });

        // Determine receiver role to set correct redirect URL
        const receiver = await prisma.user.findUnique({
          where: { id: data.receiverId },
          select: { role: true },
        });

        const redirectUrl = receiver?.role === 'PROVIDER' 
          ? `/provider/messages?bookingId=${data.bookingId}`
          : `/customer/messages?bookingId=${data.bookingId}`;

        // Create database notification for receiver
        await prisma.notification.create({
          data: {
            userId: data.receiverId,
            type: "MESSAGE", // Use "MESSAGE" type for all message notifications
            title: "New Message",
            message: `${message.sender.name} sent you a message`,
            link: redirectUrl, // Still include link for reference, but frontend will override for MESSAGE type
          },
        });

        // Send notification to receiver if they're online
        const receiverSocketId = onlineUsers.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_message_notification", {
            bookingId: data.bookingId,
            from: message.sender.name,
            redirectUrl: redirectUrl,
          });
        }

        console.log(`💬 Message sent in booking_${data.bookingId}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing", (data: { bookingId: number; userId: number; userName: string }) => {
      socket.to(`booking_${data.bookingId}`).emit("user_typing", {
        userId: data.userId,
        userName: data.userName,
      });
    });

    // Stop typing indicator
    socket.on("stop_typing", (data: { bookingId: number; userId: number }) => {
      socket.to(`booking_${data.bookingId}`).emit("user_stop_typing", {
        userId: data.userId,
      });
    });

    // Mark message as read
    socket.on("mark_as_read", async (data: { messageId: number; bookingId: number }) => {
      try {
        await prisma.message.update({
          where: { id: data.messageId },
          data: { isRead: true },
        });

        // Notify sender that message was read
        io.to(`booking_${data.bookingId}`).emit("message_read", {
          messageId: data.messageId,
        });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    // Mark all messages in a booking as read
    socket.on("mark_all_as_read", async (data: { bookingId: number; userId: number }) => {
      try {
        await prisma.message.updateMany({
          where: {
            bookingId: data.bookingId,
            receiverId: data.userId,
            isRead: false,
          },
          data: { isRead: true },
        });

        io.to(`booking_${data.bookingId}`).emit("messages_read", {
          bookingId: data.bookingId,
          userId: data.userId,
        });
      } catch (error) {
        console.error("Error marking all messages as read:", error);
      }
    });

    // User disconnects
    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("user_status", { userId, status: "offline" });
        console.log(`👋 User ${userId} disconnected`);
      }
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
}

export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}
