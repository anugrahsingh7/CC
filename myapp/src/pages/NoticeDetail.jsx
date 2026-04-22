import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { X, Download, Share2, FileText, Calendar, Clock, User, Loader2, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import A4NoticeModal from "../components/A4NoticeModal";

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin-post/get-post-by-id/${id}`
      );
      setNotice(response.data.post);
    } catch (err) {
      console.error("Error fetching notice:", err);
      setError("Notice not found or unavailable");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/notice/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (notice?.imageUrl) {
      const link = document.createElement('a');
      link.href = notice.imageUrl;
      link.download = `${notice.title.replace(/\s+/g, '_')}_notice.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#070707] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#4790fd]" />
          <p className="text-gray-600 dark:text-[#a0a0a0]">Loading notice...</p>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#070707] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#ffffff]/10 shadow-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-2">
            Notice Not Found
          </h2>
          <p className="text-gray-600 dark:text-[#a0a0a0] mb-6">
            {error || "The notice you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/Notice')}
            className="px-6 py-2 bg-[#4790fd] text-black rounded-lg hover:bg-[#4790fd]/80 transition-colors font-medium"
          >
            Back to Notices
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/Notice')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-[#a0a0a0] hover:bg-gray-100 dark:hover:bg-[#252525] transition-all duration-300 shadow-sm border border-gray-200 dark:border-[#ffffff]/10"
          >
            <X size={20} />
            <span>Back to Notices</span>
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
            {notice.imageUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4790fd] text-black hover:bg-[#4790fd]/80 transition-colors font-medium"
              >
                <Download size={18} />
                Download
              </button>
            )}
          </div>
        </div>

        {/* Notice Modal */}
        <A4NoticeModal
          isOpen={true}
          onClose={() => navigate('/Notice')}
          title={notice.title}
          date={format(parseISO(notice?.createdAt), "dd MMM yyyy, hh:mm a")}
          postedBy={notice?.author?.fullName}
          role={notice?.author?.designation}
          fileUrl={notice.imageUrl}
          description={notice.content}
          department={notice.category}
          id={notice._id}
        />
      </div>
    </div>
  );
};

export default NoticeDetail;