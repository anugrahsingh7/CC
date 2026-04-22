import React, { useEffect, useState } from "react";
import VideoPlayer from './VideoPlayer';
import {
  Heart,
  MessageCircle,
  Share2,
  Github,
  Link as LinkIcon,
  MoreHorizontal,
  Users,
  ExternalLink,
  Bookmark,
  Clock,
  User,
  Eye,
  Send,
  Star,
  Code,
  Globe,
  Check,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";
import CommentProject from "./CommentProject";
import { useNavigate } from "react-router";

const ProjectCard = ({
  avatar,
  userId,
  username,
  time,
  projectName,
  description,
  projectUrl,
  githubUrl,
  contributors,
  imageUrl,
  skills,
  likes,
  comments,
  projectId,
}) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);
  const [likesCount, setLikesCount] = useState(likes);
  const [commentModal, setCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { user: clerkUser } = useUser();
  useEffect(() => {
    if (clerkUser) {
      fetchUser();
    }
  }, [clerkUser]);

  useEffect(() => {
    if (user) {
      fetchLikes();
    }
  }, [user]);

  const fetchLikes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/project/like/${projectId}`
      );
      const likedUsers = response.data.likes;
      setLikedByCurrentUser(
        likedUsers.some((databaseUser) => databaseUser === user._id)
      );
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${clerkUser.id}`
      );
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    setLikedByCurrentUser(!likedByCurrentUser);
    const newLikedState = !likedByCurrentUser;
    setLikesCount((prev) => prev + (newLikedState ? 1 : -1));
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/project/like/${projectId}`,
        {
          userId: user?._id,
        }
      );
    } catch (error) {
      setLikedByCurrentUser(!newLikedState);
      setLikesCount((prev) => prev + (newLikedState ? -1 : 1));

      toast.error("Failed to like project");
    } finally {
      setIsLiking(false);
    }
  };

  const inputComment = () => {
    setCommentModal(!commentModal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const formData = new FormData();
      formData.append("text", commentText);
      formData.append("projectId", projectId);
      formData.append("userId", user?._id);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/project/create-project-comment`,
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

  const handleClick = () => {
    // We'll navigate with just the ID first, then the NetworkProfile component
    // will update the URL to include the name once user data loads
    navigate(`/NetworkProfile/${userId}`);
  };

  const handleOptionClick = (action) => {
    switch (action) {
      case "profile":
        navigate(`/NetworkProfile/${userId}`);
        break;
      case "share":
        const shareUrl = `${window.location.origin}/project/${projectId}`;
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        break;
      default:
        break;
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative group mb-6">
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#27dc66]/10 via-[#4790fd]/5 to-[#c76191]/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
      
      {/* Main card */}
      <div className="relative bg-[#040404]/80 backdrop-blur-2xl rounded-3xl border border-[#27dc66]/20 overflow-hidden shadow-2xl hover:shadow-[#27dc66]/20 hover:border-[#27dc66]/30 transition-all duration-500">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#27dc66]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-[#27dc66]/10 bg-gradient-to-r from-[#040404]/50 via-[#070707]/30 to-[#040404]/50">
          <div className="flex items-center gap-3">
            <div className="relative group/avatar">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#27dc66]/40 hover:ring-[#27dc66]/60 transition-all duration-300 shadow-lg shadow-[#27dc66]/20">
                <img
                  src={avatar}
                  alt={username}
                  className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#27dc66] rounded-full border-2 border-[#040404] shadow-lg"></div>
            </div>
            <div>
              <h3 className="font-semibold text-[#f5f5f5] text-sm hover:text-[#27dc66] cursor-pointer transition-colors duration-300">
                {username}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#a0a0a0]">
                <Clock size={12} className="text-[#27dc66]/60" />
                <span>{time}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              className="p-2 hover:bg-[#27dc66]/10 rounded-full transition-all duration-300"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <MoreHorizontal size={18} className="text-[#a0a0a0] hover:text-[#f5f5f5]" />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-[#040404]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#27dc66]/20 py-2 z-20">
                  <button
                    onClick={() => handleOptionClick("profile")}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#f5f5f5] hover:text-[#27dc66] hover:bg-[#27dc66]/10 w-full text-left transition-all duration-300"
                  >
                    <User size={16} className="text-[#27dc66]" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => handleOptionClick("share")}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#f5f5f5] hover:text-[#4790fd] hover:bg-[#4790fd]/10 w-full text-left transition-all duration-300"
                  >
                    {isCopied ? (
                      <>
                        <Check size={16} className="text-[#27dc66]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={16} className="text-[#4790fd]" />
                        <span>Share Project</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Project Content */}
        <div className="relative z-10 px-5 py-5">
          <h2 className="text-xl font-bold text-[#f5f5f5] mb-3 hover:text-[#27dc66] cursor-pointer transition-colors duration-300 flex items-center gap-2">
            <Code className="w-5 h-5 text-[#27dc66]" />
            {projectName}
          </h2>
          <p className="text-[#a0a0a0] text-sm leading-relaxed mb-5">
            {description}
          </p>

          {/* Tech Stack Tags */}
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {skills.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#27dc66]/20 to-[#27dc66]/10 text-[#27dc66] rounded-xl text-xs font-medium border border-[#27dc66]/30 hover:border-[#27dc66]/50 transition-all duration-300 backdrop-blur-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Project Links */}
          <div className="flex flex-wrap gap-3 mb-5">
            {projectUrl && (
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4790fd]/20 to-[#4790fd]/10 text-[#4790fd] rounded-xl hover:from-[#4790fd]/30 hover:to-[#4790fd]/20 border border-[#4790fd]/30 hover:border-[#4790fd]/50 transition-all duration-300 text-sm font-medium group/link"
              >
                <Globe className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                <span>Live Demo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#070707]/50 to-[#040404]/50 text-[#a0a0a0] rounded-xl hover:bg-[#070707] border border-[#4790fd]/20 hover:border-[#4790fd]/40 transition-all duration-300 text-sm font-medium group/github"
              >
                <Github className="w-4 h-4 group-hover/github:scale-110 transition-transform" />
                <span>Source Code</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Contributors */}
          {contributors && contributors.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[#c76191]" />
                <span className="text-xs font-medium text-[#a0a0a0]">
                  Contributors
                </span>
              </div>
              <div className="flex -space-x-2">
                {contributors.slice(0, 4).map((contributor, index) => (
                  <div key={index} className="relative group/contributor">
                    <img
                      src={contributor}
                      alt={`Contributor ${index + 1}`}
                      className="w-9 h-9 rounded-full border-2 border-[#040404] hover:z-10 transition-all duration-300 hover:scale-110 shadow-lg"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#27dc66] rounded-full border border-[#040404]"></div>
                  </div>
                ))}
                {contributors.length > 4 && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#070707] to-[#040404] border-2 border-[#040404] text-[#a0a0a0] text-xs font-medium flex items-center justify-center shadow-lg">
                    +{contributors.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Media */}
          {imageUrl && (
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#040404]/50 to-[#070707]/50 mb-5 group/media">
              {imageUrl.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i) ? (
                <VideoPlayer
                  src={imageUrl}
                  className="w-full object-cover group-hover/media:scale-[1.02] transition-transform duration-700"
                  style={{ maxHeight: "400px" }}
                  preload="metadata"
                />
              ) : (
                <img
                  src={imageUrl}
                  alt="Project preview"
                  className="w-full object-cover group-hover/media:scale-[1.02] transition-transform duration-700"
                  style={{ maxHeight: "400px" }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#040404]/40 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#27dc66]/10">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center gap-2 text-sm font-medium text-[#a0a0a0] hover:text-[#c76191] transition-colors duration-300 group/like disabled:opacity-50"
              >
                <Heart
                  className={`w-5 h-5 group-hover/like:scale-110 transition-all duration-300 ${
                    likedByCurrentUser
                      ? "fill-[#c76191] stroke-[#c76191] animate-pulse"
                      : "stroke-current"
                  }`}
                />
                <span>{likesCount}</span>
              </button>
              <button
                onClick={inputComment}
                className="flex items-center gap-2 text-sm font-medium text-[#a0a0a0] hover:text-[#4790fd] transition-colors duration-300 group/comment"
              >
                <MessageCircle className="w-5 h-5 group-hover/comment:scale-110 transition-all duration-300" />
                <span>{comments?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex items-center gap-2 py-4 px-5 border-t border-[#27dc66]/10 bg-gradient-to-r from-[#040404]/30 via-[#070707]/20 to-[#040404]/30"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm px-4 py-2.5 rounded-2xl border border-[#27dc66]/20 bg-[#070707]/50 backdrop-blur-sm text-[#f5f5f5] placeholder-[#a0a0a0] focus:ring-2 focus:ring-[#27dc66]/50 focus:border-[#27dc66]/50 transition-all duration-300"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className={`p-2.5 rounded-2xl transition-all duration-300 ${
              commentText.trim()
                ? "bg-gradient-to-r from-[#27dc66]/20 to-[#27dc66]/30 text-[#27dc66] border border-[#27dc66]/50 hover:from-[#27dc66]/30 hover:to-[#27dc66]/40 hover:scale-105"
                : "bg-[#070707]/50 text-[#4a4a4a] cursor-not-allowed"
            }`}
          >
            <Send size={18} />
          </button>
        </form>

        {/* Comments Section */}
        {commentModal && (
          <div className="border-t border-[#27dc66]/10 bg-gradient-to-r from-[#040404]/30 via-[#070707]/20 to-[#040404]/30">
            <CommentProject projectId={projectId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
