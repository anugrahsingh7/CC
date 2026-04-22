const Post = require("../models/Post");
const imagekit = require("../imageKit");
const fs = require("fs");
const Comment = require("../models/Comment");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  try {
    const { author, caption } = req.body;
    let mediaUrl = null;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Missing file parameter for upload" });
    }

    // With memory storage, use req.file.buffer directly
    if (req.file) {
      try {
        // Upload directly to ImageKit using the buffer from memory storage
        const uploadedImage = await imagekit.upload({
          file: req.file.buffer, // Use buffer from memory storage
          fileName: req.file.originalname,
          folder: "/user-posts",
          useUniqueFileName: true, // Prevents filename conflicts
        });

        mediaUrl = uploadedImage.url;
      } catch (uploadError) {
        console.error("ImageKit upload error:", uploadError);
        return res.status(500).json({
          error: "Failed to upload image",
          details: uploadError.message,
        });
      }
    }

    const post = new Post({
      caption,
      author,
      mediaUrl,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 10; // Fetch 10 notices per request
    const skip = (page - 1) * limit;

    // Fetch notices with pagination (latest first)
    const post = await Post.find()
      .populate("author", "fullName  profileImage ")
      .sort({ createdAt: -1 }) // Sort by latest
      .skip(skip)
      .limit(limit);

    res.json({ post });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate("author", "fullName profileImage");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ post });
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { text, postId, userId } = req.body;
    console.log(text, postId, userId);
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create new comment in Comment model
    const newComment = new Comment({ text, postId, userId });
    await newComment.save();

    // Push the new comment's ID into the Post model's comments array
    post.comments.push(newComment._id);
    await post.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    if (!postId) {
      return res.status(400).json({ message: "Missing postId parameter" });
    }
    const comments = await Comment.find({ postId, isReply: false })
      .populate("userId", "fullName profileImage")
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body; // Get user ID from request

    if (!postId || !userId) {
      return res.status(400).json({ message: "Missing postId or userId" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasLiked = post.likedByUsers.includes(userId);

    if (hasLiked) {
      // If user has already liked, remove like
      post.likes -= 1;
      post.likedByUsers = post.likedByUsers.filter((id) => id !== userId);
    } else {
      // If user has not liked, add like
      post.likes += 1;
      post.likedByUsers.push(userId);
    }

    await post.save();

    res.json({
      message: hasLiked ? "Like removed" : "Post liked",
      post,
      hasLiked: !hasLiked, // Send new like status
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLikedUser = async (req, res) => {
  try {
    const postId = req.params.postId;
    if (!postId) {
      return res.status(400).json({ message: "Missing postId parameter" });
    }
    const post = await Post.findById(postId).populate("likedByUsers");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ likedByUsers: post.likedByUsers });
  } catch (error) {
    console.error("Error fetching liked users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.replyComment = async (req, res) => {
  try {
    const { commentId, text, clerkId } = req.body;
    if (!commentId || !text || !clerkId) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user._id;

    console.log("Comment ID:", userId);
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Create new reply
    const newReply = new Comment({
      text,
      userId,
      postId: comment.postId,
      isReply: true,
    });
    await newReply.save();

    // Push the new reply's ID into the parent comment's replies array
    comment.replies.push(newReply._id);
    await comment.save();

    res.status(201).json({
      message: "Reply added successfully",
      reply: newReply,
    });
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption, author } = req.body;
    
    // Find the post by ID
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if the user owns this post
    if (post.author.toString() !== author) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own posts" });
    }
    
    // Update post fields if provided
    if (caption) post.caption = caption;
    
    // Handle media update if a new file is provided
    if (req.file) {
      // Upload new image to ImageKit
      const filePath = req.file.path; // Get the file path
      const fileBuffer = fs.readFileSync(filePath);
      
      const uploadedImage = await imagekit.upload({
        file: fileBuffer, // File buffer from multer
        fileName: req.file.originalname, // Use the original file name
        folder: "/user-posts", // Optional: Store images in a specific folder
      });
      
      // Update media URL and delete old image if needed
      post.mediaUrl = uploadedImage.url;
    }
    
    await post.save();
    
    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { author } = req.body;
    
    // Find the post by ID
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if the user owns this post
    if (post.author.toString() !== author) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own posts" });
    }
    
    // Delete the post
    await Post.findByIdAndDelete(postId);
    
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
