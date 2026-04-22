const Message = require("../models/Message");
const imagekit = require("../imageKit");
const { requireAuth } = require("@clerk/clerk-sdk-node");
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

// Get messages between two users
exports.getChats = async (req, res) => {
  try {
    const recipientId = req.params.id;
    const senderId = req.query.senderId;
    const messages = await Message.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    }).populate("sender recipient");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a message
exports.createChat = async (req, res) => {
  const { recipientId, content, userId } = req.body;

  try {
    // Generate roomId consistently
    const sortedIds = [userId, recipientId].sort();
    const roomId = sortedIds.join("_");

    const message = new Message({
      sender: userId,
      recipient: recipientId,
      content,
      roomId,
    });

    await message.save();
    res.status(201).json(message);
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

    // Generate roomId consistently
    const sortedIds = [userId, recipientId].sort();
    const roomId = sortedIds.join("_");

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
    res.status(201).json(message);
  } catch (err) {
    console.error("Error uploading file:", err);
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
