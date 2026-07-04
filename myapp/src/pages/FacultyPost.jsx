import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  Send,
  X,
  ArrowLeft,
  Link as LinkIcon,
  FileText,
  Calendar,
  Briefcase,
  Loader2,
  Sparkles,
} from "lucide-react";
// import { showToast } from "../components/CustomToast"; // Component not found
import { useUser } from "@clerk/clerk-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const FacultyPost = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null,
    postType: "Notice",
    link: "",
  });

  useEffect(() => {
    const checkFacultyRole = async () => {
      if (!user) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user.id}`,
        );
        if (response.data.role !== "faculty") {
          toast.error("Access denied. Only faculty members can post here.");
          navigate("/");
        } else {
          setIsFaculty(true);
        }
      } catch (error) {
        console.error("Error checking faculty role:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    checkFacultyRole();
  }, [user, navigate]);

  const postTypeIcons = {
    Notice: <FileText className="w-5 h-5" />,
    Event: <Calendar className="w-5 h-5" />,
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFaculty) return;
    setIsSubmitting(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/${user.id}`,
      );
      const data = response.data;
      const form = new FormData();

      form.append("title", formData.title);
      form.append("content", formData.description);
      form.append("category", formData.postType);
      form.append("author", data._id);

      if (formData.link) {
        form.append("link", formData.link);
      }
      if (formData.file) {
        form.append("image", formData.file);
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin-post/create-post`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Post submitted successfully");
      navigate("/");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070707]">
        <Loader2 className="w-10 h-10 text-[#4790fd] animate-spin" />
      </div>
    );
  }

  if (!isFaculty) return null;

  return (
    <div
      className={`min-h-screen py-6 px-3 sm:py-8 sm:px-4 md:px-6 relative overflow-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-[#070707] text-[#f5f5f5]" : "bg-[#f5f5f5] text-[#070707]"
      }`}
    >
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#27dc66]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4790fd]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c76191]/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-[#4790fd]" />
                Faculty Announcements
              </h1>
              <p className="text-sm text-[#a0a0a0] mt-1">
                Share important updates, events, and opportunities with students
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4790fd]/10 via-[#c76191]/5 to-[#27dc66]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>

              <div className="relative bg-[#1a1a1a]/40 backdrop-blur-xl rounded-3xl border border-[#ffffff]/10 overflow-hidden">
                <div className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Post Type Selection */}
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-[#f5f5f5] uppercase tracking-wider opacity-80">
                        Select Post Type
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(postTypeIcons).map(([type, icon]) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                postType: type,
                              }))
                            }
                            className={`relative flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 overflow-hidden group/btn ${
                              formData.postType === type
                                ? "border-[#4790fd] bg-[#4790fd]/10"
                                : "border-[#ffffff]/10 bg-[#000000]/20 hover:border-[#ffffff]/20 hover:bg-[#ffffff]/5"
                            }`}
                          >
                            <span
                              className={`relative z-10 transition-colors duration-300 ${
                                formData.postType === type
                                  ? "text-[#4790fd]"
                                  : "text-[#a0a0a0] group-hover/btn:text-[#f5f5f5]"
                              }`}
                            >
                              {icon}
                            </span>
                            <span
                              className={`relative z-10 font-medium transition-colors duration-300 ${
                                formData.postType === type
                                  ? "text-[#f5f5f5]"
                                  : "text-[#a0a0a0] group-hover/btn:text-[#f5f5f5]"
                              }`}
                            >
                              {type}
                            </span>
                            {formData.postType === type && (
                              <div className="absolute inset-0 bg-gradient-to-br from-[#4790fd]/20 to-transparent opacity-50" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-[#f5f5f5] uppercase tracking-wider opacity-80 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#27dc66]" />
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Enter a compelling title"
                          className="w-full px-5 py-4 rounded-2xl border border-[#ffffff]/10 bg-[#000000]/20 backdrop-blur-sm text-[#f5f5f5] placeholder-[#666666] focus:border-[#4790fd] focus:ring-1 focus:ring-[#4790fd] transition-all duration-300"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-[#f5f5f5] uppercase tracking-wider opacity-80">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Provide detailed information about your post..."
                          rows="6"
                          className="w-full px-5 py-4 rounded-2xl border border-[#ffffff]/10 bg-[#000000]/20 backdrop-blur-sm text-[#f5f5f5] placeholder-[#666666] focus:border-[#4790fd] focus:ring-1 focus:ring-[#4790fd] transition-all duration-300 resize-none"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-[#f5f5f5] uppercase tracking-wider opacity-80 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-[#c76191]" />
                          External Link (Optional)
                        </label>
                        <input
                          type="url"
                          name="link"
                          value={formData.link}
                          onChange={handleChange}
                          placeholder="https://example.com"
                          className="w-full px-5 py-4 rounded-2xl border border-[#ffffff]/10 bg-[#000000]/20 backdrop-blur-sm text-[#f5f5f5] placeholder-[#666666] focus:border-[#c76191] focus:ring-1 focus:ring-[#c76191] transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-[#f5f5f5] uppercase tracking-wider opacity-80">
                        Media Upload
                      </label>
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#000000]/20 border-2 border-dashed border-[#ffffff]/10 hover:border-[#4790fd]/50 transition-all duration-300 group/upload">
                        {formData.file ? (
                          <div className="relative w-full h-full">
                            {formData.file.type.startsWith("image/") ? (
                              <img
                                src={URL.createObjectURL(formData.file)}
                                alt="Preview"
                                className="w-full h-full object-contain bg-black/50"
                              />
                            ) : (
                              <video
                                src={URL.createObjectURL(formData.file)}
                                controls
                                className="w-full h-full object-contain bg-black/50"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, file: null }))
                              }
                              className="absolute top-4 right-4 p-2.5 bg-[#000000]/80 hover:bg-[#ef4444] text-[#f5f5f5] rounded-full transition-all duration-300 backdrop-blur-md border border-[#ffffff]/10"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#a0a0a0] group-hover/upload:text-[#4790fd] transition-colors cursor-pointer">
                            <div className="p-4 rounded-full bg-[#ffffff]/5 group-hover/upload:bg-[#4790fd]/10 transition-colors mb-3">
                              <UploadCloud size={32} />
                            </div>
                            <p className="text-sm font-medium">
                              Click or drag to upload media
                            </p>
                            <p className="text-xs text-[#666666] mt-1">
                              Supports high-res images & videos
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          name="file"
                          accept="image/*,video/*"
                          onChange={handleChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-[#ffffff]/10">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#4790fd] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#4790fd]/20 hover:shadow-[#4790fd]/40 hover:scale-[1.01]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Publishing...</span>
                          </>
                        ) : (
                          <>
                            <Send size={20} />
                            <span>Publish Post</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            {/* User Profile Summary */}
            <div className="bg-[#1a1a1a]/40 backdrop-blur-xl rounded-3xl border border-[#ffffff]/10 p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={user?.imageUrl}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#4790fd]/40"
                />
                <div>
                  <h3 className="font-semibold text-[#f5f5f5] text-lg">
                    {user?.fullName}
                  </h3>
                  <p className="text-sm text-[#a0a0a0]">Faculty Member</p>
                </div>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-[#27dc66]/10 text-[#27dc66] border border-[#27dc66]/20">
                  Verified
                </span>
                <span className="px-3 py-1 rounded-full bg-[#ece239]/10 text-[#ece239] border border-[#ece239]/20">
                  Official
                </span>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-[#1a1a1a]/40 backdrop-blur-xl rounded-3xl border border-[#ffffff]/10 p-6">
              <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ece239]" />
                Posting Guidelines
              </h3>
              <ul className="space-y-4 text-sm text-[#a0a0a0]">
                {[
                  "Ensure content is relevant to academics.",
                  "Use clear and concise language.",
                  "Add media to increase engagement.",
                  "Verify external links before sharing.",
                  "Respect community guidelines.",
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4790fd] mt-2 shrink-0" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyPost;
