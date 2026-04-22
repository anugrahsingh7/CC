import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Comments from "./Comments";
import VideoPlayer from './VideoPlayer';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Clock,
  User,
  Send,
  Eye,
  ThumbsUp,
  Smile,
  Check,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router";

const PostCard = ({
  avatar,
  username,
  time,
  content,
  imageUrl,
  likes: initialLikes,
  likedByUsers = [],
  postId,
  userId,
  comments,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currUserId, setCurrUserId] = useState(null);
  const [likes, setLikes] = useState(initialLikes);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!currUserId) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/post/like/${postId}`,
        );
        const likedUsers = response.data.likedByUsers;
        setLikedByCurrentUser(likedUsers.some((user) => user === currUserId));
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    if (currUserId) {
      fetchLikes();
    }
  }, [currUserId, postId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user.id}`,
      );
      const data = response.data;
      setCurrUserId(data._id);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile.");
    }
  };

  const inputComment = () => {
    setCommentModal(!commentModal);
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await axios.patch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/post/like/${postId}/like-toggle`,
        { userId: currUserId },
      );
      setLikes(response.data.post.likes);
      setLikedByCurrentUser(response.data.hasLiked);
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const formData = new FormData();
      formData.append("text", commentText);
      formData.append("postId", postId);
      formData.append("userId", currUserId);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/post/create-comment`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      setCommentText("");
      toast.success(`Comment posted successfully!`);
    } catch (e) {
      console.error("Error posting comment:", e);
      toast.error("Something went wrong");
    }
  };

  const handleOptionClick = (action) => {
    switch (action) {
      case "profile":
        // Navigate with ID first, URL will be updated automatically with name
        navigate(`/NetworkProfile/${userId}`);
        break;
      case "message":
        break;
      case "share":
        const shareUrl = `${window.location.origin}/post/${postId}`;
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        break;

      default:
        break;
    }
    setShowOptions(false);
  };

  return (
    <div className="relative group mb-6">
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 dark:from-[#4790fd]/10 dark:via-[#c76191]/5 dark:to-[#27dc66]/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>

      {/* Main card */}
      <div className="relative bg-white/80 dark:bg-[#040404]/80 backdrop-blur-2xl rounded-3xl border border-gray-200 dark:border-[#4790fd]/20 overflow-hidden shadow-2xl dark:shadow-none hover:shadow-blue-500/10 dark:hover:shadow-[#4790fd]/20 hover:border-blue-500/30 dark:hover:border-[#4790fd]/30 transition-all duration-500">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ece239]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#4790fd]/10 bg-gradient-to-r from-gray-50/50 via-white/30 to-gray-50/50 dark:from-[#040404]/50 dark:via-[#070707]/30 dark:to-[#040404]/50">
          <div className="flex items-center gap-3">
            <div className="relative group/avatar">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500/20 dark:ring-[#4790fd]/40 hover:ring-blue-500/40 dark:hover:ring-[#4790fd]/60 transition-all duration-300 shadow-lg shadow-blue-500/10 dark:shadow-[#4790fd]/20">
                <img
                  src={avatar}
                  alt={username}
                  className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#27dc66] rounded-full border-2 border-white dark:border-[#040404] shadow-lg"></div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-[#f5f5f5] text-sm hover:text-blue-500 dark:hover:text-[#4790fd] cursor-pointer transition-colors duration-300">
                {username}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#a0a0a0]">
                <Clock size={12} className="text-blue-500/60 dark:text-[#4790fd]/60" />
                <span>{time}</span>
              </div>
            </div>
          </div>

          {/* Options Menu */}
          <div className="relative">
            <button
              className="p-2 hover:bg-blue-500/10 dark:hover:bg-[#4790fd]/10 rounded-full transition-all duration-300"
              onClick={() => setShowOptions(!showOptions)}
            >
              <MoreHorizontal
                size={18}
                className="text-gray-400 dark:text-[#a0a0a0] hover:text-gray-900 dark:hover:text-[#f5f5f5]"
              />
            </button>

            {showOptions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowOptions(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-[#040404]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#4790fd]/20 py-2 z-20">
                  <button
                    onClick={() => handleOptionClick("profile")}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-[#f5f5f5] hover:text-blue-500 dark:hover:text-[#4790fd] hover:bg-blue-50 dark:hover:bg-[#4790fd]/10 w-full text-left transition-all duration-300"
                  >
                    <User size={16} className="text-blue-500 dark:text-[#4790fd]" />
                    <span>View Profile</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Media Section */}
        {imageUrl && (
          <div className="relative group/media overflow-hidden">
            {imageUrl.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i) ? (
              <VideoPlayer
                src={imageUrl}
                className="w-full max-h-96 object-contain bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-[#040404]/50 dark:to-[#070707]/50"
                preload="metadata"
              />
            ) : (
              <img
                src={imageUrl}
                alt="Post content"
                className="w-full max-h-96 object-contain bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-[#040404]/50 dark:to-[#070707]/50 group-hover/media:scale-[1.02] transition-transform duration-700"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}

        {/* Content Section */}
        <div className="relative z-10 px-5 py-4">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className="p-2.5 hover:bg-pink-500/10 dark:hover:bg-[#c76191]/10 rounded-xl transition-all duration-300 transform hover:scale-110 group/like disabled:opacity-50"
              >
                <Heart
                  size={22}
                  className={`${
                    likedByCurrentUser
                      ? "fill-pink-500 stroke-pink-500 dark:fill-[#c76191] dark:stroke-[#c76191] animate-pulse"
                      : "stroke-gray-400 dark:stroke-[#a0a0a0] group-hover/like:stroke-pink-500 dark:group-hover/like:stroke-[#c76191]"
                  } transition-all duration-300`}
                />
              </button>
              <button
                onClick={inputComment}
                className="p-2.5 hover:bg-blue-500/10 dark:hover:bg-[#4790fd]/10 rounded-xl transition-all duration-300 transform hover:scale-110 group/comment"
              >
                <MessageCircle
                  size={22}
                  className="stroke-gray-400 dark:stroke-[#a0a0a0] group-hover/comment:stroke-blue-500 dark:group-hover/comment:stroke-[#4790fd] transition-all duration-300"
                />
              </button>
            </div>
          </div>

          {/* Likes Count */}
          {likes > 0 && (
            <p className="font-semibold text-gray-900 dark:text-[#f5f5f5] text-sm mb-3 flex items-center gap-2">
              <ThumbsUp size={16} className="text-blue-500 dark:text-[#4790fd]" />
              <span>
                {likes} {likes === 1 ? "like" : "likes"}
              </span>
            </p>
          )}

          {/* Caption */}
          {content && (
            <div className="mb-3">
              <span className="font-semibold text-gray-900 dark:text-[#f5f5f5] text-sm mr-2 hover:text-blue-500 dark:hover:text-[#4790fd] cursor-pointer transition-colors duration-300">
                {username}
              </span>
              <span className="text-sm text-gray-600 dark:text-[#a0a0a0] leading-relaxed">
                {content}
              </span>
            </div>
          )}

          {/* Comments Count */}
          {comments?.length > 0 && (
            <button
              onClick={inputComment}
              className="text-gray-500 dark:text-[#a0a0a0] text-xs mb-3 hover:text-blue-500 dark:hover:text-[#4790fd] transition-colors duration-300 flex items-center gap-1.5"
            >
              <Eye size={12} />
              <span>
                View all {comments.length}{" "}
                {comments.length === 1 ? "comment" : "comments"}
              </span>
            </button>
          )}

          {/* Comment Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-[#4790fd]/10"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-[#4790fd]/20 bg-gray-50/50 dark:bg-[#070707]/50 backdrop-blur-sm text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#a0a0a0] focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-[#4790fd]/50 focus:border-blue-500/50 dark:focus:border-[#4790fd]/50 transition-all duration-300"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={`p-2.5 rounded-2xl transition-all duration-300 ${
                commentText.trim()
                  ? "bg-gradient-to-r from-blue-500/20 to-blue-500/30 dark:from-[#4790fd]/20 dark:to-[#4790fd]/30 text-blue-500 dark:text-[#4790fd] border border-blue-500/50 dark:border-[#4790fd]/50 hover:from-blue-500/30 hover:to-blue-500/40 dark:hover:from-[#4790fd]/30 dark:hover:to-[#4790fd]/40 hover:scale-105"
                  : "bg-gray-100 dark:bg-[#070707]/50 text-gray-400 dark:text-[#4a4a4a] cursor-not-allowed"
              }`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Comments Section */}
        {commentModal && (
          <div className="border-t border-gray-100 dark:border-[#4790fd]/10 bg-gradient-to-r from-gray-50/30 via-white/20 to-gray-50/30 dark:from-[#040404]/30 dark:via-[#070707]/20 dark:to-[#040404]/30">
            <Comments postId={postId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
