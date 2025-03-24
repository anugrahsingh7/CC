const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true },
  enrollmentNumber: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ["admin", "faculty", "student"],
    default: "student",
  },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema);
