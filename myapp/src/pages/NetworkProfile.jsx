import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { extractUserIdFromParams, generateProfileUrl, formatNameForUrl } from "../utils/urlHelpers";
import {
  X,
  Share2,
  Grid,
  Briefcase,
  Link as LinkIcon,
  Heart,
  MessageCircle,
  Github,
  ExternalLink,
  ArrowLeft,
  User,
  Loader2,
  Check,
} from "lucide-react";
import Comments from "../components/Comments";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";

function NetworkProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const userData = location.state?.userData;
  
  // Extract userId from URL params (handles both /:userId and /:name/:userId formats)
  const userId = extractUserIdFromParams(params) || userData?.userId;
  const [activeTab, setActiveTab] = useState("posts");
  const [currUserId, setCurrUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const { user: clerkUser } = useUser();
  const [category, setCategory] = useState("rejected");
  const [projects, setProjects] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [postCaption, setPostCaption] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [projectGithubUrl, setProjectGithubUrl] = useState('');
  const [projectDemoUrl, setProjectDemoUrl] = useState('');
  const [projectTechStack, setProjectTechStack] = useState('');
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [newProjectMedia, setNewProjectMedia] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (userId && clerkUser?.id) {
      fetchuser();
    }
  }, [userId, clerkUser?.id]);

  // Update document title (removed user name for privacy)
  useEffect(() => {
    document.title = 'Profile - Campus Connect';
  }, []);

  // Update URL to include user name for better SEO and sharing (name-first format)
  useEffect(() => {
    if (user?.fullName && userId && !params.name) {
      const nameSlug = formatNameForUrl(user.fullName);
      // Only update URL if we have the name and it's not already in the URL
      if (nameSlug && window.location.pathname === `/NetworkProfile/${userId}`) {
        const newUrl = `/NetworkProfile/${nameSlug}/${userId}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [user?.fullName, userId, params.name]);

  const fetchuser = async () => {
    try {
      const [userResponse, postResponse, userAuthResponse, projectResponse] =
        await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/user/profileById/${userId}`
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/user/posts/${userId}`
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${
              clerkUser.id
            }`
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/project/get-project/${userId}`
          ),
        ]);
      const data = userResponse.data;
      const currUserData = userAuthResponse.data;
      setUser(data);
      setCurrUserId(currUserData._id);
      const post = postResponse.data;
      setPosts(post);
      const projects = projectResponse.data;
      setProjects(projects);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile.");
    }
};

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostCaption(post.caption || '');
    setIsEditPostModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectTitle(project.title || '');
    setProjectDescription(project.description || '');
    setProjectGithubUrl(project.githubUrl || '');
    setProjectDemoUrl(project.projectUrl || '');
    setProjectTechStack(Array.isArray(project.TechStack) ? project.TechStack.join(',') : project.TechStack || '');
    setIsEditProjectModalOpen(true);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/post/delete-post/${postId}`, {
          data: { author: currUserId }
        });
        // Update local state to remove the deleted post
        setPosts(posts.filter(post => post._id !== postId));
        toast.success("Post deleted successfully!");
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post.");
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/project/delete-project/${projectId}`, {
          data: { userId: currUserId }
        });
        // Update local state to remove the deleted project
        setProjects(projects.filter(project => project._id !== projectId));
        toast.success("Project deleted successfully!");
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project.");
      }
    }
  };

  const updatePost = async () => {
    try {
      const formData = new FormData();
      formData.append('caption', postCaption);
      formData.append('author', currUserId);
      
      if (newPostMedia) {
        formData.append('file', newPostMedia);
      }
      
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/post/update-post/${editingPost._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update the post in local state
      const updatedPosts = posts.map(post => {
        if (post._id === editingPost._id) {
          return { ...post, caption: postCaption, mediaUrl: newPostMedia ? URL.createObjectURL(newPostMedia) : post.mediaUrl };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      setIsEditPostModalOpen(false);
      setEditingPost(null);
      setPostCaption('');
      setNewPostMedia(null);
      toast.success("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post.");
    }
  };

  const updateProject = async () => {
    try {
      const formData = new FormData();
      formData.append('title', projectTitle);
      formData.append('description', projectDescription);
      formData.append('githubUrl', projectGithubUrl);
      formData.append('projectUrl', projectDemoUrl);
      formData.append('TechStack', JSON.stringify(projectTechStack.split(',').map(tech => tech.trim()).filter(tech => tech)));
      formData.append('userId', currUserId);
      
      if (newProjectMedia) {
        formData.append('image', newProjectMedia);
      }
      
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/project/update-project/${editingProject._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update the project in local state
      const updatedProjects = projects.map(project => {
        if (project._id === editingProject._id) {
          return { 
            ...project, 
            title: projectTitle, 
            description: projectDescription, 
            githubUrl: projectGithubUrl, 
            projectUrl: projectDemoUrl,
            TechStack: projectTechStack.split(',').map(tech => tech.trim()).filter(tech => tech)
          };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      setIsEditProjectModalOpen(false);
      setEditingProject(null);
      setProjectTitle('');
      setProjectDescription('');
      setProjectGithubUrl('');
      setProjectDemoUrl('');
      setProjectTechStack('');
      setNewProjectMedia(null);
      toast.success("Project updated successfully!");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project.");
    }
  };

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/post/like/${
            selectedPost._id
          }`
        );
        const likedUsers = response.data.likedByUsers;
        setLikedByCurrentUser(likedUsers.some((user) => user === currUserId));
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    if (currUserId && selectedPost?._id) {
      fetchLikes();
    }
  }, [currUserId, selectedPost?._id]);

  useEffect(() => {
    const checkCategoryStatus = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/user/isPending/${currUserId}?receiverId=${user._id}`
        );
        setCategory(response.data?.category);
      } catch (error) {
        console.error("Error checking pending status:", error);
      }
    };

    if (currUserId && user) {
      checkCategoryStatus();
    }
  }, [currUserId, user]);

  const handleClick = async () => {
    try {
      const res = await axios.patch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/user/updateConnectionsPending/${currUserId}`,
        {
          receiverId: user._id,
        }
      );
      setCategory("pending");
      toast.success("Connection sent successfully!");
    } catch (err) {
      toast.error(err.response.data.message || "Something went wrong");
    }
  };

  const handleShareProfile = async () => {
    try {
      // Generate URL with user's name if available
      const profileUrl = user?.fullName 
        ? `${window.location.origin}${generateProfileUrl(userId, user.fullName)}`
        : `${window.location.origin}/NetworkProfile/${userId}`;
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/post/like/${
          selectedPost._id
        }/like-toggle`,
        { userId: currUserId }
      );
      const updatedPost = {
        ...selectedPost,
        likes: response.data.post.likes,
      };
      setSelectedPost(updatedPost);
      setLikedByCurrentUser(response.data.hasLiked);
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const formData = new FormData();
      formData.append("text", commentText);
      formData.append("postId", selectedPost._id);
      formData.append("userId", currUserId);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/post/create-comment`,
        `${import.meta.env.VITE_BACKEND_URL}/api/post/create-comment`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setCommentText("");
      toast.success(`Comment posted successfully!`);
    } catch (e) {
      console.error("Error posting comment:", e);
      toast.error("Something went wrong");
    }
  };

  return (
    <div
      className={`min-h-screen relative transition-colors duration-300 ${
        isDarkMode ? "bg-[#070707] text-[#f5f5f5]" : "bg-[#f5f5f5] text-[#070707]"
      }`}
    >
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4790fd]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c76191]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#27dc66]/3 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <div className="relative z-10 px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#040404]/80 backdrop-blur-xl border border-[#4790fd]/20 hover:border-[#4790fd]/30 text-[#4790fd] rounded-xl transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        <div className="relative group mb-8">
          {/* Gradient blur background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4790fd]/10 via-[#c76191]/5 to-[#27dc66]/10 rounded-3xl blur-xl opacity-50"></div>
                      
          {/* Card */}
          <div className="relative bg-[#040404]/80 backdrop-blur-2xl rounded-3xl border border-[#4790fd]/20 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-[#4790fd]/30 shadow-lg shadow-[#4790fd]/20">
                  <img
                    src={user?.profileImage}
                    alt={user?.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = "flex";
                      }
                    }}
                  />
                  <div className="hidden w-full h-full bg-[#070707] items-center justify-center">
                    <User className="w-16 h-16 text-[#4790fd]" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#27dc66] rounded-full border-4 border-[#040404] shadow-lg"></div>
              </div>
        
              {/* Profile Info */}
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                  <h2 className="text-3xl font-bold text-[#f5f5f5]">
                    {user?.fullName}
                  </h2>
                  <div className="flex gap-3">
                    {user?._id != currUserId && (
                      <button
                        onClick={handleClick}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 border ${
                          category === "accepted"
                            ? "bg-[#27dc66]/10 border-[#27dc66]/20 text-[#27dc66] hover:bg-[#27dc66]/15"
                            : category === "pending"
                            ? "bg-[#ece239]/10 border-[#ece239]/20 text-[#ece239] hover:bg-[#ece239]/15"
                            : "bg-[#4790fd]/10 border-[#4790fd]/20 text-[#4790fd] hover:bg-[#4790fd]/15"
                        }`}
                      >
                        {category === "accepted" && "Connected"}
                        {category === "pending" && "Pending"}
                        {category === "rejected" && "Connect"}
                      </button>
                    )}
                    <button 
                      onClick={handleShareProfile}
                      className="p-3 hover:bg-[#4790fd]/10 rounded-xl transition-all duration-300 border border-[#4790fd]/20 hover:border-[#4790fd]/30 text-[#4790fd]"
                      title="Share profile link"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
        
                {/* Stats */}
                <div className="flex gap-8 mb-6">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-[#f5f5f5]">
                      {posts?.length || 0}
                    </div>
                    <div className="text-sm text-[#a0a0a0]">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-[#f5f5f5]">
                      {projects.length || 0}
                    </div>
                    <div className="text-sm text-[#a0a0a0]">Projects</div>
                  </div>
                </div>
        
                {/* Bio and Details */}
                <div className="space-y-4 mb-6">
                  <p className="text-[#c0c0c0] leading-relaxed">
                    {user?.aboutMe ? user.aboutMe.split(' ').slice(0, 10).join(' ') + (user.aboutMe.split(' ').length > 10 ? '...' : '') : ''}
                  </p>
        
                  {/* Personal URL */}
                  {user?.personalUrl && (
                    <div className="flex items-center gap-2 text-[#4790fd]">
                      <LinkIcon size={16} />
                      <a
                        href={user?.personalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline transition-colors"
                      >
                        {user?.personalUrl}
                      </a>
                    </div>
                  )}
        
                  {/* Department/Batch Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user?.department && (
                      <div className="flex items-center gap-2 text-[#a0a0a0]">
                        <Briefcase size={16} />
                        <span className="text-sm">
                          {user.department}
                        </span>
                      </div>
                    )}
        
                    {user?.enrollmentNumber && (
                      <div className="flex items-center gap-2 text-[#a0a0a0]">
                        <span className="text-[#4790fd]">
                          {"Batch: 20" + user.enrollmentNumber.substring(9, 11)}
                        </span>
                      </div>
                    )}
                  </div>
        
                  {/* Status Indicators */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user?.role === "faculty" || user?.role === "admin" ? "bg-[#c76191]/20 text-[#c76191] border border-[#c76191]/30" : "bg-[#4790fd]/20 text-[#4790fd] border border-[#4790fd]/30"
                    }`}>
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "Student"}
                    </span>
                                
                    {user?.status && (
                      <span className="px-3 py-1 bg-[#27dc66]/20 text-[#27dc66] rounded-full text-xs font-medium border border-[#27dc66]/30">
                        Verified
                      </span>
                    )}
                  </div>
        
                  {/* Social Links */}
                  <div className="flex gap-3 pt-2">
                    {user?.githubUrl && (
                      <a
                        href={user.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#4790fd] hover:underline transition-colors text-sm"
                      >
                        <Github size={16} />
                        <span>GitHub</span>
                      </a>
                    )}
                                
                    {user?.linkedinUrl && (
                      <a
                        href={user.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#4790fd] hover:underline transition-colors text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#4790fd]">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm-7 8.536c-.823 0-1.494-.68-1.494-1.516 0-.836.671-1.516 1.494-1.516s1.494.68 1.494 1.516c0 .836-.671 1.516-1.494 1.516z"/>
                        </svg>
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
        
                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-[#4790fd]/10 text-[#4790fd] rounded-xl text-sm border border-[#4790fd]/20 hover:border-[#4790fd]/30 transition-all duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="relative group">
          {/* Gradient blur background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4790fd]/5 to-[#27dc66]/5 rounded-3xl blur-xl opacity-50"></div>
          
          {/* Card */}
          <div className="relative bg-[#040404]/80 backdrop-blur-2xl rounded-3xl border border-[#4790fd]/20 shadow-xl overflow-hidden">
            <div className="flex gap-1 p-2 bg-[#070707]/50">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === "posts"
                    ? "bg-[#4790fd]/10 text-[#4790fd] border border-[#4790fd]/20"
                    : "text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#070707]/50"
                }`}
              >
                <Grid size={20} />
                <span>Posts</span>
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === "projects"
                    ? "bg-[#27dc66]/10 text-[#27dc66] border border-[#27dc66]/20"
                    : "text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#070707]/50"
                }`}
              >
                <Briefcase size={20} />
                <span>Projects</span>
              </button>
            </div>

            {/* Content Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === "posts" ? (
                  posts?.map((post) => (
                    <div
                      key={post._id}
                      className="aspect-square bg-[#070707]/50 backdrop-blur-xl rounded-2xl overflow-hidden relative group cursor-pointer border border-[#4790fd]/10 hover:border-[#4790fd]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                      onClick={() => handlePostClick(post)}
                    >
                      {post?.mediaUrl &&
                      post.mediaUrl.toLowerCase().endsWith(".mp4") ? (
                        <video
                          src={post.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={post?.mediaUrl}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/90 via-[#070707]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center text-white">
                            <Heart size={24} className="fill-white" />
                            <span className="ml-2 font-semibold">
                              {post.likes}
                            </span>
                          </div>
                          <div className="flex items-center text-white">
                            <MessageCircle size={24} className="fill-white" />
                            <span className="ml-2 font-semibold">
                              {post?.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Video play indicator */}
                      {post?.mediaUrl &&
                        post.mediaUrl.toLowerCase().endsWith(".mp4") && (
                          <div className="absolute top-3 right-3 bg-[#070707]/70 rounded-full p-2 backdrop-blur-sm">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="white"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}

                      {/* Share button */}
                      <button
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                          isCopied 
                            ? 'bg-[#27dc66]/70 text-white' 
                            : 'bg-[#070707]/70 text-white hover:bg-[#070707]/90'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const shareUrl = `${window.location.origin}/post/${post._id}`;
                          navigator.clipboard.writeText(shareUrl);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        title={isCopied ? "Copied!" : "Share post"}
                      >
                        {isCopied ? (
                          <Check size={16} className="animate-pulse" />
                        ) : (
                          <Share2 size={16} />
                        )}
                      </button>

                      {/* Edit/Delete buttons for owner */}
                      {user?._id === currUserId && (
                        <div className="absolute top-3 left-3 flex gap-2">
                          <button
                            className="p-2 bg-[#070707]/70 rounded-full backdrop-blur-sm hover:bg-[#070707]/90 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open edit modal
                              handleEditPost(post);
                            }}
                            title="Edit post"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="p-2 bg-[#070707]/70 rounded-full backdrop-blur-sm hover:bg-[#ff4757]/70 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Confirm and delete post
                              handleDeletePost(post._id);
                            }}
                            title="Delete post"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : projects.length > 0 ? (
                  projects.map((project, i) => (
                    <div
                      key={i}
                      className="bg-[#070707]/50 backdrop-blur-xl rounded-2xl shadow-xl border border-[#27dc66]/10 hover:border-[#27dc66]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer overflow-hidden flex flex-col md:flex-row relative"
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="md:w-2/5 flex-shrink-0">
                        <img
                          src={project.mediaUrl}
                          alt="Project"
                          className="w-full h-48 md:h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-t-none"
                        />
                      </div>
                      <div className="p-5 flex-grow">
                        <h3 className="font-semibold text-[#f5f5f5] text-lg mb-2">
                          {project.title}
                        </h3>
                        <p className="text-[#a0a0a0] text-sm mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project?.TechStack?.map((tech, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-0.5 bg-[#27dc66]/10 text-[#27dc66] rounded-md text-xs border border-[#27dc66]/20"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <a
                            href={project?.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[#4790fd] hover:text-[#4790fd]/80 transition-colors text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Github size={14} />
                            <span>GitHub</span>
                          </a>
                          <a
                            href={project?.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[#4790fd] hover:text-[#4790fd]/80 transition-colors text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                            <span>Demo</span>
                          </a>
                        </div>
                      </div>
                      
                      {/* Share button */}
                      <button
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                          isCopied 
                            ? 'bg-[#27dc66]/70 text-white' 
                            : 'bg-[#070707]/70 text-white hover:bg-[#070707]/90'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const shareUrl = `${window.location.origin}/project/${project._id}`;
                          navigator.clipboard.writeText(shareUrl);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        title={isCopied ? "Copied!" : "Share project"}
                      >
                        {isCopied ? (
                          <Check size={16} className="animate-pulse" />
                        ) : (
                          <Share2 size={16} />
                        )}
                      </button>

                      {/* Edit/Delete buttons for owner */}
                      {user?._id === currUserId && (
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            className="p-2 bg-[#070707]/70 rounded-full backdrop-blur-sm hover:bg-[#070707]/90 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open edit modal
                              handleEditProject(project);
                            }}
                            title="Edit project"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="p-2 bg-[#070707]/70 rounded-full backdrop-blur-sm hover:bg-[#ff4757]/70 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Confirm and delete project
                              handleDeleteProject(project._id);
                            }}
                            title="Delete project"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-[#a0a0a0] text-lg">
                      No projects to show
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070707]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-[#040404]/95 backdrop-blur-2xl border border-[#4790fd]/20 rounded-2xl w-full h-full sm:h-auto sm:max-w-6xl sm:max-h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 left-4 p-2 bg-[#070707]/50 hover:bg-[#070707]/70 rounded-full cursor-pointer transition-all duration-300 border border-[#4790fd]/20 hover:border-[#4790fd]/30 z-50 text-[#f5f5f5]"
              aria-label="Close post modal"
            >
              <X size={20} />
            </button>

            {/* Media Section */}
            <div className="w-full lg:w-7/12 flex-shrink-0 bg-[#070707]/50 flex items-center justify-center overflow-hidden">
              <div className="w-full flex items-center justify-center">
                {selectedPost.mediaUrl ? (
                  selectedPost.mediaUrl.toLowerCase().endsWith(".mp4") ? (
                    <video
                      src={selectedPost.mediaUrl}
                      controls
                      className="object-contain aspect-[4/3] mx-auto my-4 w-full max-w-[95vw] max-h-[45vh] sm:max-h-[50vh] md:max-h-[55vh] lg:max-w-[40vw] lg:max-h-[60vh] lg:my-0"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={selectedPost.mediaUrl}
                      alt="Post content"
                      className="object-contain aspect-[4/3] mx-auto my-4 w-full max-w-[95vw] max-h-[45vh] sm:max-h-[50vh] md:max-h-[55vh] lg:max-w-[40vw] lg:max-h-[60vh] lg:my-0"
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center w-full h-40 text-[#a0a0a0]">
                    No media available
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="w-full lg:w-5/12 flex lg:border-l border-[#4790fd]/10 flex-col min-h-0 lg:min-h-full bg-[#040404]/95 backdrop-blur-2xl overflow-y-auto">
              {/* Post Header */}
              <div className="p-4 lg:p-6 border-b border-[#4790fd]/10 bg-[#070707]/50 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.profileImage}
                    alt={selectedPost.username}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover ring-2 ring-[#4790fd]/20"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = "flex";
                      }
                    }}
                  />
                  <div className="hidden w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#070707] items-center justify-center ring-2 ring-[#4790fd]/20">
                    <User className="w-6 h-6 text-[#4790fd]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#f5f5f5] text-sm md:text-base truncate">
                      {selectedPost.caption}
                    </p>
                    <p className="text-xs text-[#a0a0a0]">{selectedPost.time}</p>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div
                className={`flex-1 overflow-y-auto min-h-0 ${
                  commentModalOpen ? "block" : "hidden lg:block"
                }`}
              >
                <Comments postId={selectedPost._id} />
              </div>

              {/* Action Buttons */}
              <div className="p-4 lg:p-6 border-t border-[#4790fd]/10 bg-[#070707]/50 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleLike}
                      className="p-2 hover:bg-[#4790fd]/10 rounded-full transition-all duration-300"
                    >
                      <Heart
                        size={20}
                        className={`${
                          likedByCurrentUser
                            ? "fill-[#c76191] stroke-[#c76191]"
                            : "stroke-[#a0a0a0] hover:stroke-[#c76191]"
                        } transition-colors`}
                      />
                    </button>

                    <button
                      onClick={() => setCommentModalOpen(!commentModalOpen)}
                      className="p-2 hover:bg-[#4790fd]/10 rounded-full transition-all duration-300"
                    >
                      <MessageCircle
                        size={20}
                        className="text-[#a0a0a0] hover:text-[#4790fd]"
                      />
                    </button>

                    <button className="p-2 hover:bg-[#4790fd]/10 rounded-full transition-all duration-300">
                      <Share2
                        size={20}
                        className="text-[#a0a0a0] hover:text-[#4790fd]"
                      />
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-sm mb-3 text-[#f5f5f5]">
                  {selectedPost.likes} likes
                </p>
                {commentModalOpen && (
                  <form
                    onSubmit={handleSubmit}
                    className="flex items-center py-2 border-t border-[#4790fd]/10"
                  >
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 text-sm p-2.5 rounded-xl bg-[#070707]/50 backdrop-blur-xl border border-[#4790fd]/20 focus:border-[#4790fd] focus:outline-none text-[#f5f5f5] placeholder-[#808080]"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className={`ml-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        commentText.trim()
                          ? "bg-[#4790fd]/10 text-[#4790fd] border border-[#4790fd]/20 hover:bg-[#4790fd]/15"
                          : "text-[#808080] cursor-not-allowed"
                      }`}
                    >
                      Post
                    </button>
                  </form>
                )}
                <p className="text-xs text-[#808080] mt-2">
                  {selectedPost.time}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070707]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-[#040404]/95 backdrop-blur-2xl border border-[#27dc66]/20 rounded-2xl w-full h-full sm:h-auto sm:max-w-6xl sm:max-h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 left-4 p-2 bg-[#070707]/50 hover:bg-[#070707]/70 rounded-full cursor-pointer transition-all duration-300 border border-[#27dc66]/20 hover:border-[#27dc66]/30 z-50 text-[#f5f5f5]"
              aria-label="Close project modal"
            >
              <X size={20} />
            </button>

            {/* Project Image Section */}
            <div className="w-full lg:w-7/12 flex-shrink-0 bg-[#070707]/50 flex items-center justify-center overflow-hidden">
              <div className="w-full flex items-center justify-center">
                <img
                  src={selectedProject.mediaUrl}
                  alt="Project content"
                  className="object-contain aspect-[4/3] mx-auto my-4 w-full max-w-[95vw] max-h-[45vh] sm:max-h-[50vh] md:max-h-[55vh] lg:max-w-[40vw] lg:max-h-[60vh] lg:my-0"
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="w-full lg:w-5/12 flex-1 flex lg:border-l border-[#27dc66]/10 flex-col min-h-0 lg:min-h-full bg-[#040404]/95 backdrop-blur-2xl overflow-y-auto px-4 md:px-6">
              {/* Project Header */}
              <div className="p-4 lg:p-6 border-b border-[#27dc66]/10 bg-[#070707]/50 flex-shrink-0">
                <h2 className="font-semibold text-[#f5f5f5] text-lg sm:text-xl md:text-2xl truncate">
                  {selectedProject.title}
                </h2>
                <p className="text-xs text-[#a0a0a0] mt-1">
                  {selectedProject.description}
                </p>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 p-4 lg:p-6">
                {selectedProject?.TechStack?.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#27dc66]/10 text-[#27dc66] rounded-lg text-xs border border-[#27dc66]/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="space-y-2 p-4 lg:p-6">
                {selectedProject?.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#4790fd] hover:text-[#4790fd]/80 transition-colors text-sm"
                  >
                    <Github size={16} />
                    <span>View on GitHub</span>
                  </a>
                )}
                {selectedProject?.projectUrl && (
                  <a
                    href={selectedProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#4790fd] hover:text-[#4790fd]/80 transition-colors text-sm"
                  >
                    <ExternalLink size={16} />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {isEditPostModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070707]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-[#040404]/95 backdrop-blur-2xl border border-[#4790fd]/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => {
                setIsEditPostModalOpen(false);
                setEditingPost(null);
                setPostCaption('');
                setNewPostMedia(null);
              }}
              className="absolute top-4 right-4 p-2 bg-[#070707]/50 hover:bg-[#070707]/70 rounded-full cursor-pointer transition-all duration-300 border border-[#4790fd]/20 hover:border-[#4790fd]/30 z-50 text-[#f5f5f5]"
              aria-label="Close edit post modal"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-[#4790fd]/10 bg-[#070707]/50">
              <h2 className="text-2xl font-bold text-[#f5f5f5]">Edit Post</h2>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Caption Input */}
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    Caption
                  </label>
                  <textarea
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#070707]/50 backdrop-blur-xl border border-[#4790fd]/20 focus:border-[#4790fd] focus:outline-none text-[#f5f5f5] placeholder-[#808080] resize-none"
                    rows="3"
                    placeholder="Write a caption..."
                  />
                </div>

                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    Update Media (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => setNewPostMedia(e.target.files[0])}
                      className="flex-1 p-2 rounded-lg bg-[#070707]/50 backdrop-blur-xl border border-[#4790fd]/20 text-[#f5f5f5] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4790fd]/10 file:text-[#4790fd] hover:file:bg-[#4790fd]/15"
                    />
                    {newPostMedia && (
                      <span className="text-sm text-[#27dc66]">
                        {newPostMedia.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={updatePost}
                    className="flex-1 py-3 px-4 bg-[#4790fd]/10 text-[#4790fd] rounded-xl font-semibold border border-[#4790fd]/20 hover:bg-[#4790fd]/15 transition-all duration-300"
                  >
                    Update Post
                  </button>
                  <button
                    onClick={() => {
                      setIsEditPostModalOpen(false);
                      setEditingPost(null);
                      setPostCaption('');
                      setNewPostMedia(null);
                    }}
                    className="py-3 px-6 bg-[#070707]/50 text-[#a0a0a0] rounded-xl font-semibold border border-[#4790fd]/20 hover:border-[#4790fd]/30 hover:text-[#f5f5f5] transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditProjectModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070707]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-[#040404]/95 backdrop-blur-2xl border border-[#27dc66]/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => {
                setIsEditProjectModalOpen(false);
                setEditingProject(null);
                setProjectTitle('');
                setProjectDescription('');
                setProjectGithubUrl('');
                setProjectDemoUrl('');
                setProjectTechStack('');
                setNewProjectMedia(null);
              }}
              className="absolute top-4 right-4 p-2 bg-[#070707]/50 hover:bg-[#070707]/70 rounded-full cursor-pointer transition-all duration-300 border border-[#27dc66]/20 hover:border-[#27dc66]/30 z-50 text-[#f5f5f5]"
              aria-label="Close edit project modal"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-[#27dc66]/10 bg-[#070707]/50">
              <h2 className="text-2xl font-bold text-[#f5f5f5]">Edit Project</h2>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#070707]/50 backdrop-blur-xl border border-[#27dc66]/20 focus:border-[#27dc66] focus:outline-none text-[#f5f5f5] placeholder-[#808080]"
                    placeholder="Enter project title"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    Description
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#070707]/50 backdrop-blur-xl border border-[#27dc66]/20 focus:border-[#27dc66] focus:outline-none text-[#f5f5f5] placeholder-[#808080] resize-none"
                    rows="3"
                    placeholder="Describe your project..."
                  />
                </div>

                {/* Tech Stack Input */}
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    Tech Stack (comma separated)
                  </label>
                  <input
                    type="text"
                    value={projectTechStack}
                    onChange={(e) => setProjectTechStack(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#070707]/50 backdrop-blur-xl border border-[#27dc66]/20 focus:border-[#27dc66] focus:outline-none text-[#f5f5f5] placeholder-[#808080]"
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>

                {/* GitHub URL */}
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={projectGithubUrl}
                    onChange={(e) => setProjectGithubUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#070707]/50 backdrop-blur-xl border border-[#27dc66]/20 focus:border-[#27dc66] focus:outline-none text-[#f5f5f5] placeholder-[#808080]"
                    placeholder="https://github.com/username/project"
                  />
                </div>

                {/* Demo URL */}
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    Demo URL
                  </label>
                  <input
                    type="url"
                    value={projectDemoUrl}
                    onChange={(e) => setProjectDemoUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#070707]/50 backdrop-blur-xl border border-[#27dc66]/20 focus:border-[#27dc66] focus:outline-none text-[#f5f5f5] placeholder-[#808080]"
                    placeholder="https://project-demo.com"
                  />
                </div>

                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    Update Project Image (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewProjectMedia(e.target.files[0])}
                      className="flex-1 p-2 rounded-lg bg-[#070707]/50 backdrop-blur-xl border border-[#27dc66]/20 text-[#f5f5f5] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#27dc66]/10 file:text-[#27dc66] hover:file:bg-[#27dc66]/15"
                    />
                    {newProjectMedia && (
                      <span className="text-sm text-[#27dc66]">
                        {newProjectMedia.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={updateProject}
                    className="flex-1 py-3 px-4 bg-[#27dc66]/10 text-[#27dc66] rounded-xl font-semibold border border-[#27dc66]/20 hover:bg-[#27dc66]/15 transition-all duration-300"
                  >
                    Update Project
                  </button>
                  <button
                    onClick={() => {
                      setIsEditProjectModalOpen(false);
                      setEditingProject(null);
                      setProjectTitle('');
                      setProjectDescription('');
                      setProjectGithubUrl('');
                      setProjectDemoUrl('');
                      setProjectTechStack('');
                      setNewProjectMedia(null);
                    }}
                    className="py-3 px-6 bg-[#070707]/50 text-[#a0a0a0] rounded-xl font-semibold border border-[#27dc66]/20 hover:border-[#27dc66]/30 hover:text-[#f5f5f5] transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NetworkProfile;
