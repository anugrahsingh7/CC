// models/Message.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "ChatGroup", default: null },
    content: { type: String, required: false },
    roomId: { type: String, required: true },
    // File attachment fields
    fileUrl: { type: String },
    fileType: { type: String }, // 'image', 'video', 'document', 'audio'
    fileName: { type: String },
    fileSize: { type: Number }, // in bytes
    fileExtension: { type: String },
    // Message status fields
    status: { 
      type: String, 
      enum: ['sent', 'delivered', 'read'], 
      default: 'sent' 
    },
    readAt: { type: Date },
    deliveredAt: { type: Date },
    // Deletion tracking
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Reply functionality
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    // Reactions
    reactions: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      emoji: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);
