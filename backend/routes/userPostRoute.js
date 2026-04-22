const express = require("express");
const router = express.Router();
const multer = require("multer");
const rateLimit = require("express-rate-limit");

const {
  createPost,
  getPosts,
  createComment,
  getComments,
  likePost,
  getLikedUser,
  replyComment,
  updatePost,
  deletePost,
  getPostById,
} = require("../controllers/userPostController");

// Rate limiting for post creation/updates
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit post creation/updates
  message: {
    error: "Too many posts created/updated, please try again later.",
  },
});

const storage = multer.memoryStorage();

// File filter to allow only images and videos
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
});

router.post("/create-post", upload.single("file"), postLimiter, createPost);
router.get("/getAll-post", getPosts);
router.get("/get-post-by-id/:id", getPostById);
router.post("/create-comment", createComment);
router.get("/get-comments/:postId", getComments);
router.patch("/like/:postId/like-toggle", likePost);
router.get("/like/:postId", getLikedUser);
router.post("/reply-comment", replyComment);

// Routes for updating and deleting posts
router.patch("/update-post/:postId", upload.single("file"), updatePost);
router.delete("/delete-post/:postId", deletePost);
// router.get("/get-post", getPosts);

module.exports = router;
