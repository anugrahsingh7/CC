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
  skills: { type: Array },
  githubUrl: { type: String },
  linkedinUrl: { type: String },
  collegeIDCard: { type: String },
  aboutMe: { type: String },
  designation: {
    type: String,
  },
  collegeId: { type: String },
  status: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
