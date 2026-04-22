const imagekit = require("../imageKit");
const Project = require("../models/Project");
const CommentProject = require("../models/CommentProject");

exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      githubUrl,
      projectUrl,
      userId,
      category,
      TechStack,
      contributors,
    } = req.body;

    let mediaUrl = null;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Missing file parameter for upload" });
    }

    const uploadedImage = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "/user-project",
    });
    mediaUrl = uploadedImage.url;

    // Build project data dynamically
    const projectData = {
      title,
      description,
      githubUrl,
      projectUrl,
      userId,
      category,
      TechStack,
      mediaUrl,
    };

    if (contributors) {
      let parsedContributors = contributors;

      // Parse only if it's a string (e.g., from form-data)
      if (typeof contributors === "string") {
        try {
          parsedContributors = JSON.parse(contributors);
        } catch (e) {
          console.warn("Invalid JSON in contributors:", contributors);
          parsedContributors = [];
        }
      }

      // Only add if parsed value is a non-empty array
      if (Array.isArray(parsedContributors) && parsedContributors.length > 0) {
        projectData.contributors = parsedContributors;
      }
    }

    const project = new Project(projectData);
    await project.save();

    res.status(201).json(project);
    console.log(`Project created successfully: ${project}`);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("userId", "fullName profileImage ")
      .sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getProject = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "Missing user id parameter" });
    }
    const project = await Project.find({ userId: userId }).sort({
      createdAt: -1,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createCommentProject = async (req, res) => {
  try {
    const { text, projectId, userId } = req.body;
    console.log(text, projectId, userId);

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create new comment
    const newCommentProject = new CommentProject({ text, projectId, userId });
    await newCommentProject.save();

    // Push the comment ID into the project's comments array
    project.comments.push(newCommentProject._id);
    await project.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: newCommentProject,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProjectComments = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) {
      return res.status(400).json({ message: "Missing projectId parameter" });
    }
    const comments = await CommentProject.find({ projectId })
      .populate("userId", "fullName profileImage")
      .sort({ createdAt: -1 });
    res.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.likeProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body; // Get user ID from request

    if (!projectId || !userId) {
      return res.status(400).json({ message: "Missing projectId or userId" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "project not found" });
    }

    const hasLiked = project.likedByUsers.includes(userId);

    if (hasLiked) {
      // If user has already liked, remove like
      project.likes -= 1;
      project.likedByUsers = project.likedByUsers.filter((id) => id !== userId);
    } else {
      // If user has not liked, add like
      project.likes += 1;
      project.likedByUsers.push(userId);
    }

    await project.save();

    res.json({
      message: hasLiked ? "Like removed" : "project liked",
      project,
      hasLiked: !hasLiked, // Send new like status
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLikes = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ likes: project.likedByUsers });
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, githubUrl, projectUrl, TechStack, category } = req.body;
    
    // Find the project by ID
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if the user owns this project
    if (project.userId.toString() !== req.body.userId) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own projects" });
    }
    
    // Update project fields if provided
    if (title) project.title = title;
    if (description) project.description = description;
    if (githubUrl) project.githubUrl = githubUrl;
    if (projectUrl) project.projectUrl = projectUrl;
    if (TechStack) project.TechStack = JSON.parse(TechStack);
    if (category) project.category = category;
    
    // Handle media update if a new file is provided
    if (req.file) {
      const uploadedImage = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/user-project",
      });
      project.mediaUrl = uploadedImage.url;
    }
    
    await project.save();
    
    res.status(200).json({ message: "Project updated successfully", project });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;
    
    // Find the project by ID
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if the user owns this project
    if (project.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own projects" });
    }
    
    // Delete the project
    await Project.findByIdAndDelete(projectId);
    
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate("userId", "fullName profileImage");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};
