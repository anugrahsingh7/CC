const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const { Webhook } = require("svix");
const connectDb = require("./db");
const User = require("./models/User"); // ✅ Import User model
const Message = require("./models/Message");
const ChatGroup = require("./models/ChatGroup");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");
const userRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminPostRoute");
const postRouter = require("./routes/userPostRoute");
const projectRouter = require("./routes/projectRoute");
const chatRouter = require("./routes/chatRoute");

const app = express();
const server = require("http").createServer(app);
connectDb();
const port = process.env.PORT || 3000;

// Middleware to trust the first proxy (for render hosted environment)
app.set("trust proxy", 1);

// Rate limiting configurations
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://campus-connect-chi-ten.vercel.app",
    ], // your frontend origin
    methods: ["GET", "POST"],
  },
});

// Apply general rate limiting to all requests
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Increased from 50 to 100 for webhooks
  message: {
    error: "Too many webhook requests, please try again later.",
  },
});
app.use(generalLimiter);
app.post(
  "/api/webhooks",
  webhookLimiter,
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

      if (!WEBHOOK_SECRET) {
        console.error("Webhook secret not found.");
        return res.status(500).json({ error: "Server misconfiguration" });
      }

      const payload = req.body;
      const headers = req.headers;

      const svix = new Webhook(WEBHOOK_SECRET);
      let evt;

      try {
        evt = svix.verify(payload, headers);
      } catch (err) {
        console.error("Webhook verification failed:", err.message);
        return res.status(400).json({ error: "Webhook verification failed" });
      }

      const eventType = evt.type;

      const { id, first_name, last_name, email_addresses, image_url } =
        evt.data;
      const email = email_addresses?.length
        ? email_addresses[0].email_address
        : null;

      if (!id) {
        console.error("User ID is missing in webhook event.");
        return res.status(400).json({ error: "Invalid webhook data" });
      }

      if (eventType === "user.deleted") {
        // 🔥 Delete user from MongoDB
        const deletedUser = await User.findOneAndDelete({ clerkId: id });
        if (deletedUser) {
          console.log("User deleted from MongoDB:", deletedUser);
        } else {
          console.log("User not found in MongoDB, skipping delete.");
        }
        return res.status(200).json({ message: "User deleted successfully" });
      }

      if (eventType === "user.created" || eventType === "user.updated") {
        // 🔄 Create or update user in MongoDB
        const updatedUser = await User.findOneAndUpdate(
          { clerkId: id },
          {
            fullName: `${first_name} ${last_name}`,
            email: email,
            profileImage: image_url,
          },
          { new: true, upsert: true }
        );

        console.log("User updated in MongoDB:", updatedUser);
        return res.status(200).json({ message: "User updated successfully" });
      }

      console.log(`Unhandled event type: ${eventType}`);
      return res.status(200).json({ message: "Event type ignored" });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
app.use(express.json()); // ✅ Use express.json() to parse JSON bodies

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://campus-connect-chi-ten.vercel.app",
    ], // Allow frontend to access backend
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Apply specific rate limiters to different routes
app.use("/api/user", userRouter);
app.use("/api/admin-post", adminRouter);
app.use("/api/post", postRouter);
app.use("/api/project", projectRouter);
app.use("/api/chat", chatRouter);

// Socket.IO rate limiting (basic implementation)
const socketConnections = new Map();
const activeUsers = new Map();

const buildRoomId = (firstId, secondId) => [firstId, secondId].sort().join("_");
const buildGroupRoomId = (groupId) => `group_${groupId}`;

const COMMUNITY_GROUP_SEEDS = [
  { name: "Campus Announcements" },
  { name: "Placements & Referrals" },
  { name: "Hackathons & Events" },
  { name: "DSA / CP Lounge" },
  { name: "Project Collab Hub" },
];

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function ensureCommunityGroups() {
  const existing = await ChatGroup.countDocuments({ isCommunity: true });
  if (existing > 0) return;

  await ChatGroup.insertMany(
    COMMUNITY_GROUP_SEEDS.map((seed) => ({
      name: seed.name,
      isCommunity: true,
      memberCount: randomInt(500, 1000),
      roomId: `community_${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      members: [],
      admin: null,
    }))
  );
}

const emitPresence = (userId, isOnline) => {
  io.emit("presence:update", {
    userId,
    isOnline,
    lastSeen: isOnline ? null : new Date().toISOString(),
  });
};

const joinUserPresenceRoom = (socket, userId) => {
  socket.data.userId = userId;
  socket.join(`user:${userId}`);

  if (!activeUsers.has(userId)) {
    activeUsers.set(userId, new Set());
  }
  activeUsers.get(userId).add(socket.id);
  emitPresence(userId, true);
};

io.on("connection", (socket) => {
  // Track connection time for basic rate limiting
  const clientIP = socket.handshake.address;
  const now = Date.now();

  if (!socketConnections.has(clientIP)) {
    socketConnections.set(clientIP, { connections: 1, lastConnection: now });
  } else {
    const clientData = socketConnections.get(clientIP);
    if (now - clientData.lastConnection < 1000) {
      // 1 second cooldown
      console.log(`Rate limit exceeded for ${clientIP}`);
      socket.disconnect();
      return;
    }
    clientData.connections++;
    clientData.lastConnection = now;
  }

  socket.emit("chat:connected", {
    socketId: socket.id,
  });

  socket.on("register_user", ({ userId }) => {
    if (!userId) return;
    joinUserPresenceRoom(socket, userId);
  });

  socket.on("join_room", ({ roomId, userId }) => {
    if (userId && !socket.data.userId) {
      joinUserPresenceRoom(socket, userId);
    }
    socket.join(roomId);
  });

  socket.on("leave_room", ({ roomId }) => {
    if (!roomId) return;
    socket.leave(roomId);
  });

  socket.on("typing_status", ({ roomId, userId, userName, isTyping }) => {
    if (!roomId || !userId) return;
    socket.to(roomId).emit("typing_status", {
      roomId,
      userId,
      userName,
      isTyping: Boolean(isTyping),
    });
  });

  socket.on("send_message", async (data) => {
    try {
      const { tempId, senderId, recipientId, groupId, content } = data || {};

      if (!senderId || !content?.trim() || (!recipientId && !groupId)) {
        return;
      }

      let roomId = "";
      let message;
      let recipientsForUpdate = [];

      if (groupId) {
        const group = await ChatGroup.findById(groupId);
        if (!group) {
          socket.emit("message_error", {
            tempId,
            message: "Group not found.",
          });
          return;
        }

        roomId = group.roomId || buildGroupRoomId(groupId);
        recipientsForUpdate = group.isCommunity
          ? []
          : group.members
              .map((memberId) => memberId.toString())
              .filter((memberId) => memberId !== senderId);

        message = await Message.create({
          sender: senderId,
          group: groupId,
          content: content.trim(),
          roomId,
          status: "sent",
        });
      } else {
        roomId = buildRoomId(senderId, recipientId);
        recipientsForUpdate = [recipientId];
        message = await Message.create({
          sender: senderId,
          recipient: recipientId,
          content: content.trim(),
          roomId,
          status: activeUsers.has(recipientId) ? "delivered" : "sent",
          deliveredAt: activeUsers.has(recipientId) ? new Date() : undefined,
        });
      }

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "fullName profileImage designation status")
        .populate("recipient", "fullName profileImage designation status")
        .populate("group", "name roomId members admin");

      io.to(`user:${senderId}`).emit("message_sent", {
        tempId,
        message: populatedMessage,
      });

      socket.to(roomId).emit("receive_message", populatedMessage);
      recipientsForUpdate.forEach((memberId) => {
        io.to(`user:${memberId}`).emit("conversation:update", {
          roomId,
          participantId: groupId || senderId,
          conversationType: groupId ? "group" : "direct",
          message: populatedMessage,
        });
      });
      if (groupId && populatedMessage.group?.isCommunity) {
        io.emit("conversation:update", {
          roomId,
          participantId: groupId,
          conversationType: "group",
          message: populatedMessage,
        });
      }
      io.to(`user:${senderId}`).emit("conversation:update", {
        roomId,
        participantId: groupId || recipientId,
        conversationType: groupId ? "group" : "direct",
        message: populatedMessage,
      });
    } catch (error) {
      socket.emit("message_error", {
        tempId: data?.tempId,
        message: "Unable to send message right now.",
      });
    }
  });

  socket.on("message_delivered", async ({ messageId }) => {
    if (!messageId) return;

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        status: "delivered",
        deliveredAt: new Date(),
      },
      { new: true }
    );

    if (!updatedMessage) return;

    io.to(updatedMessage.roomId).emit("message_status", {
      messageId,
      status: "delivered",
    });
  });

  socket.on("message_read", async ({ roomId, messageIds }) => {
    if (!roomId || !Array.isArray(messageIds) || messageIds.length === 0) return;

    const messages = await Message.find({
      _id: { $in: messageIds },
      roomId,
    });

    if (messages.length === 0) return;

    await Message.updateMany(
      { _id: { $in: messageIds } },
      {
        status: "read",
        readAt: new Date(),
        deliveredAt: new Date(),
      }
    );

    io.to(roomId).emit("message_status", {
      messageIds,
      status: "read",
    });
  });

  socket.on("disconnect", () => {
    // Clean up old connections periodically
    if (socketConnections.has(clientIP)) {
      const clientData = socketConnections.get(clientIP);
      clientData.connections--;
      if (clientData.connections <= 0) {
        socketConnections.delete(clientIP);
      }
    }

    const { userId } = socket.data;
    if (userId && activeUsers.has(userId)) {
      const userSockets = activeUsers.get(userId);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        activeUsers.delete(userId);
        emitPresence(userId, false);
      }
    }
  });
});

// Clean up old socket connection tracking data every 10 minutes
setInterval(() => {
  const now = Date.now();
  const tenMinutesAgo = now - 10 * 60 * 1000;

  for (const [ip, data] of socketConnections.entries()) {
    if (data.lastConnection < tenMinutesAgo) {
      socketConnections.delete(ip);
    }
  }
}, 10 * 60 * 1000);

server.listen(port, async function () {
  try {
    await ensureCommunityGroups();
  } catch (error) {
    console.error("Failed to seed community groups:", error);
  }
  console.log(`Server is running on port ${port}`);
});
