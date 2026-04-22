const mongoose = require("mongoose");

const ChatGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    roomId: { type: String, required: true, unique: true },
    isCommunity: { type: Boolean, default: false },
    memberCount: { type: Number, default: 0 },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function requiredAdmin() {
        return !this.isCommunity;
      },
      default: null,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatGroup", ChatGroupSchema);
