const mongoose = require("mongoose");
const Message = require("../models/Message");
const ChatGroup = require("../models/ChatGroup");
const imagekit = require("../imageKit");
const multer = require("multer");
const path = require("path");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, documents, and audio
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'application/rtf',
      'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/mp4'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Helper function to determine file type
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'document';
};

const buildRoomId = (firstId, secondId) => [firstId, secondId].sort().join("_");
const buildGroupRoomId = (groupId) => `group_${groupId}`;

const populateMessage = (query) =>
  query.populate("sender", "fullName profileImage designation status")
    .populate("recipient", "fullName profileImage designation status")
    .populate("group", "name roomId members admin");

// Get messages between two users
exports.getChats = async (req, res) => {
  try {
    const recipientId = req.params.id;
    const senderId = req.query.senderId;

    if (!recipientId || !senderId) {
      return res.status(400).json({ error: "senderId and recipientId are required" });
    }

    const messages = await populateMessage(
      Message.find({
        $or: [
          { sender: senderId, recipient: recipientId },
          { sender: recipientId, recipient: senderId },
        ],
        deletedFor: { $ne: senderId },
      }).sort({ createdAt: 1 })
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;

    if (!groupId || !userId) {
      return res.status(400).json({ error: "groupId and userId are required" });
    }

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some((memberId) => memberId.toString() === userId);
    if (!group.isCommunity && !isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const messages = await populateMessage(
      Message.find({
        group: groupId,
        deletedFor: { $ne: userId },
      }).sort({ createdAt: 1 })
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, adminId, memberIds = [] } = req.body;

    const uniqueMemberIds = [...new Set([adminId, ...memberIds].filter(Boolean))];

    if (!name?.trim()) {
      return res.status(400).json({ error: "Group name is required" });
    }

    if (!adminId || uniqueMemberIds.length < 2) {
      return res.status(400).json({ error: "A group needs at least 2 members" });
    }

    const group = await ChatGroup.create({
      name: name.trim(),
      admin: adminId,
      members: uniqueMemberIds,
      roomId: buildGroupRoomId(new mongoose.Types.ObjectId().toString()),
    });

    group.roomId = buildGroupRoomId(group._id.toString());
    await group.save();

    const populatedGroup = await ChatGroup.findById(group._id)
      .populate("admin", "fullName profileImage")
      .populate("members", "fullName profileImage designation status");

    res.status(201).json({
      _id: populatedGroup._id,
      fullName: populatedGroup.name,
      name: populatedGroup.name,
      roomId: populatedGroup.roomId,
      members: populatedGroup.members,
      memberCount: populatedGroup.memberCount || populatedGroup.members.length,
      isGroup: true,
      isCommunity: Boolean(populatedGroup.isCommunity),
      profileImage: null,
      admin: populatedGroup.admin,
      unreadCount: 0,
      lastMessage: null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getConversationSummaries = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);
    const directMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: objectUserId }, { recipient: objectUserId }],
          group: null,
          deletedFor: { $ne: objectUserId },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          otherUser: {
            $cond: [{ $eq: ["$sender", objectUserId] }, "$recipient", "$sender"],
          },
        },
      },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$recipient", objectUserId] },
                    { $ne: ["$status", "read"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "participant",
        },
      },
      { $unwind: "$participant" },
      { $sort: { "lastMessage.createdAt": -1 } },
      {
        $project: {
          _id: "$participant._id",
          fullName: "$participant.fullName",
          profileImage: "$participant.profileImage",
          designation: "$participant.designation",
          status: "$participant.status",
          roomId: "$lastMessage.roomId",
          unreadCount: 1,
          lastMessage: {
            _id: "$lastMessage._id",
            content: "$lastMessage.content",
            fileType: "$lastMessage.fileType",
            createdAt: "$lastMessage.createdAt",
            status: "$lastMessage.status",
            sender: "$lastMessage.sender",
          },
        },
      },
    ]);

    const groups = await ChatGroup.find({
      $or: [{ members: objectUserId }, { isCommunity: true }],
    })
      .populate("members", "fullName profileImage designation status")
      .populate("admin", "fullName profileImage");

    const groupConversations = await Promise.all(
      groups.map(async (group) => {
        const lastMessage = await Message.findOne({ group: group._id })
          .sort({ createdAt: -1 })
          .populate("sender", "fullName profileImage designation status");

        return {
          _id: group._id,
          fullName: group.name,
          name: group.name,
          profileImage: null,
          roomId: group.roomId,
          unreadCount: 0,
          isGroup: true,
          isCommunity: Boolean(group.isCommunity),
          memberCount: group.memberCount || group.members.length,
          members: group.members,
          lastMessage: lastMessage
            ? {
                _id: lastMessage._id,
                content: lastMessage.content,
                fileType: lastMessage.fileType,
                createdAt: lastMessage.createdAt,
                status: lastMessage.status,
                sender: lastMessage.sender,
              }
            : null,
        };
      })
    );

    res.json([...directMessages, ...groupConversations].sort((first, second) => {
      const firstTime = first.lastMessage?.createdAt
        ? new Date(first.lastMessage.createdAt).getTime()
        : 0;
      const secondTime = second.lastMessage?.createdAt
        ? new Date(second.lastMessage.createdAt).getTime()
        : 0;

      return secondTime - firstTime;
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a message
exports.createChat = async (req, res) => {
  const { recipientId, content, userId } = req.body;

  try {
    const roomId = buildRoomId(userId, recipientId);

    const message = new Message({
      sender: userId,
      recipient: recipientId,
      content,
      roomId,
    });

    await message.save();
    const populatedMessage = await populateMessage(Message.findById(message._id));
    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a message with file attachment
exports.createChatWithFile = async (req, res) => {
  try {
    const { recipientId, content, userId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const roomId = buildRoomId(userId, recipientId);

    // Upload file to ImageKit
    const uploadedFile = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "/chat-files",
      useUniqueFileName: true,
    });

    // Determine file type
    const fileType = getFileType(req.file.mimetype);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    const message = new Message({
      sender: userId,
      recipient: recipientId,
      content: content || "", // Content can be empty for file-only messages
      roomId,
      fileUrl: uploadedFile.url,
      fileType: fileType,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileExtension: fileExtension,
    });

    await message.save();
    const populatedMessage = await populateMessage(Message.findById(message._id));
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!["sent", "delivered", "read"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const update = { status };
    if (status === "delivered") {
      update.deliveredAt = new Date();
    }
    if (status === "read") {
      update.readAt = new Date();
      update.deliveredAt = update.deliveredAt || new Date();
    }

    const message = await Message.findByIdAndUpdate(messageId, update, {
      new: true,
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    // Check if user is the sender or recipient
    if (message.sender.toString() !== userId && message.recipient.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this message" });
    }
    
    // For sender: delete for everyone
    // For recipient: delete for me only (soft delete by marking as deleted)
    if (message.sender.toString() === userId) {
      await Message.findByIdAndDelete(messageId);
      res.json({ message: "Message deleted for everyone", deletedForEveryone: true });
    } else {
      // Add deletedBy field for recipient deletion
      message.deletedFor = message.deletedFor || [];
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
      res.json({ message: "Message deleted for you", deletedForEveryone: false });
    }
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: err.message });
  }
};

// Multer upload middleware
exports.uploadFile = upload.single("file");
