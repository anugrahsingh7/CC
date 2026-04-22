import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { X, Download, Share2, Heart, MessageCircle, User, Loader2, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import VideoPlayer from "../components/VideoPlayer";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/post/get-post-by-id/${id}`
      );
      setPost(response.data.post);
      setLikesCount(response.data.post.likes);
      // We'll need to implement liked status check here
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Post not found or unavailable");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    setLikedByCurrentUser(!likedByCurrentUser);
    const newLikedState = !likedByCurrentUser;
    setLikesCount((prev) => prev + (newLikedState ? 1 : -1));
    try {
      // Add like API call here when implemented
    } catch (error) {
      setLikedByCurrentUser(!newLikedState);
      setLikesCount((prev) => prev + (newLikedState ? -1 : 1));
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#070707] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#4790fd]" />
          <p className="text-gray-600 dark:text-[#a0a0a0]">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#070707] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#ffffff]/10 shadow-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-2">
            Post Not Found
          </h2>
          <p className="text-gray-600 dark:text-[#a0a0a0] mb-6">
            {error || "The post you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/Network')}
            className="px-6 py-2 bg-[#4790fd] text-black rounded-lg hover:bg-[#4790fd]/80 transition-colors font-medium"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 dark:bg-[#4790fd]/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/5 dark:bg-[#c76191]/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/Network')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-[#a0a0a0] hover:bg-gray-100 dark:hover:bg-[#252525] transition-all duration-300 shadow-sm border border-gray-200 dark:border-[#ffffff]/10"
          >
            <X size={20} />
            <span>Back to Feed</span>
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium ${
                isCopied 
                  ? 'bg-[#27dc66] text-black' 
                  : 'bg-[#ece239] text-black hover:bg-[#ece239]/80'
              }`}
            >
              {isCopied ? (
                <>
                  <Check size={18} className="animate-pulse" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  Share
                </>
              )}
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#ffffff]/10 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-[#ffffff]/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={post.author.profileImage}
                  alt={post.author.fullName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#4790fd]/20"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-12 h-12 rounded-full bg-[#1a1a1a] 
                  items-center justify-center ring-2 ring-[#ffffff]/10">
                  <User size={20} className="text-[#a0a0a0]" />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-[#f5f5f5]">
                  {post.author.fullName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-[#a0a0a0]">
                  {format(parseISO(post?.createdAt), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6">
            <p className="text-gray-800 dark:text-[#d0d0d0] mb-6 whitespace-pre-wrap">
              {post.caption}
            </p>
            
            {/* Media */}
            {post.mediaUrl && (
              <div className="rounded-xl overflow-hidden mb-6">
                {post.mediaUrl.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i) ? (
                  <VideoPlayer
                    src={post.mediaUrl}
                    className="w-full"
                    style={{ maxHeight: "500px" }}
                  />
                ) : (
                  <img
                    src={post.mediaUrl}
                    alt="Post content"
                    className="w-full object-cover"
                    style={{ maxHeight: "500px" }}
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-[#ffffff]/10">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#a0a0a0] hover:text-[#c76191] transition-colors duration-300 group"
              >
                <Heart
                  className={`w-5 h-5 group-hover:scale-110 transition-all duration-300 ${
                    likedByCurrentUser
                      ? "fill-[#c76191] stroke-[#c76191] animate-pulse"
                      : "stroke-current"
                  }`}
                />
                <span>{likesCount}</span>
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#a0a0a0] hover:text-[#4790fd] transition-colors duration-300 group">
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-all duration-300" />
                <span>0</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;