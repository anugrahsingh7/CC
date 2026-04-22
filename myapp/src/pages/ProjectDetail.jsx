import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { X, Download, Share2, Heart, MessageCircle, User, Github, Globe, Users, Code, Loader2, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import VideoPlayer from "../components/VideoPlayer";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/project/get-project-by-id/${id}`
      );
      setProject(response.data.project);
      setLikesCount(response.data.project.likes);
      // We'll need to implement liked status check here
    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Project not found or unavailable");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/project/${id}`;
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
          <Loader2 className="w-12 h-12 animate-spin text-[#27dc66]" />
          <p className="text-gray-600 dark:text-[#a0a0a0]">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#070707] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#ffffff]/10 shadow-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 dark:text-[#a0a0a0] mb-6">
            {error || "The project you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/Network')}
            className="px-6 py-2 bg-[#27dc66] text-black rounded-lg hover:bg-[#27dc66]/80 transition-colors font-medium"
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/5 dark:bg-[#27dc66]/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-[#4790fd]/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#ffffff]/10 shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={project.userId.profileImage}
                        alt={project.userId.fullName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#27dc66]/20"
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
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f5f5f5] flex items-center gap-2">
                        <Code className="w-6 h-6 text-[#27dc66]" />
                        {project.title}
                      </h1>
                      <p className="text-gray-600 dark:text-[#a0a0a0]">
                        by {project.userId.fullName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-[#808080] mt-1">
                        {format(parseISO(project?.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-800 dark:text-[#d0d0d0] mb-6 whitespace-pre-wrap">
                  {project.description}
                </p>

                {/* Tech Stack */}
                {project.TechStack && project.TechStack.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-[#a0a0a0] mb-3">
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.TechStack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-[#27dc66]/10 text-[#27dc66] rounded-xl text-sm font-medium border border-[#27dc66]/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Links */}
                <div className="flex flex-wrap gap-3">
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#4790fd]/10 text-[#4790fd] rounded-xl hover:bg-[#4790fd]/20 border border-[#4790fd]/30 transition-all duration-300 text-sm font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/10 text-gray-300 rounded-xl hover:bg-gray-800/20 border border-gray-700/30 transition-all duration-300 text-sm font-medium"
                    >
                      <Github className="w-4 h-4" />
                      <span>Source Code</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Project Media */}
            {project.mediaUrl && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#ffffff]/10 shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5] mb-4">
                    Project Preview
                  </h3>
                  <div className="rounded-xl overflow-hidden">
                    {project.mediaUrl.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i) ? (
                      <VideoPlayer
                        src={project.mediaUrl}
                        className="w-full"
                        style={{ maxHeight: "500px" }}
                      />
                    ) : (
                      <img
                        src={project.mediaUrl}
                        alt="Project preview"
                        className="w-full object-cover"
                        style={{ maxHeight: "500px" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#ffffff]/10 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5] mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#c76191]/10 text-[#c76191] hover:bg-[#c76191]/20 transition-colors font-medium disabled:opacity-50"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedByCurrentUser
                        ? "fill-[#c76191] stroke-[#c76191] animate-pulse"
                        : "stroke-current"
                    }`}
                  />
                  Like ({likesCount})
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4790fd]/10 text-[#4790fd] hover:bg-[#4790fd]/20 transition-colors font-medium">
                  <MessageCircle className="w-5 h-5" />
                  Comment
                </button>
              </div>
            </div>

            {/* Contributors */}
            {project.contributors && project.contributors.length > 0 && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#ffffff]/10 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f5f5] mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#c76191]" />
                  Contributors
                </h3>
                <div className="flex -space-x-2">
                  {project.contributors.slice(0, 5).map((contributor, index) => (
                    <div key={index} className="relative">
                      <img
                        src={contributor}
                        alt={`Contributor ${index + 1}`}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-[#1a1a1a]"
                      />
                    </div>
                  ))}
                  {project.contributors.length > 5 && (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#2a2a2a] border-2 border-white dark:border-[#1a1a1a] text-gray-600 dark:text-[#a0a0a0] text-xs font-medium flex items-center justify-center">
                      +{project.contributors.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;