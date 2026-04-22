const AdminPost = require("../models/AdminPost");
const imagekit = require("../imageKit");
exports.createPost = async (req, res) => {
  try {
    const { title, content, author, category, link } = req.body;
    let imageUrl = null;

    if (req.file) {
      // Check if an image file is uploaded
      const uploadedImage = await imagekit.upload({
        file: req.file.buffer, // File buffer from multer
        fileName: req.file.originalname, // Use the original file name
        folder: "/admin-posts", // Optional: Store images in a specific folder
      });
      imageUrl = uploadedImage.url;
    }
    const post = new AdminPost({
      title,
      content,
      author,
      category,
      imageUrl,
      link: link || null,
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
    const category = req.query.category;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 10; // Fetch 10 notices per request
    const skip = (page - 1) * limit;
    console.log("Page:", page);

    // Fetch notices with pagination (latest first)
    const post = await AdminPost.find({ category: category })
      .populate("author", "fullName email profileImage designation")
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
    const post = await AdminPost.findById(id)
      .populate("author", "fullName email profileImage designation");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ post });
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};
