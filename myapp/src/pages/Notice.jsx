import React, { useEffect, useState } from "react";

import NoticeCard from "../components/NoticeCard";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { Bell, Loader2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (pageNum) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin-post/get-post?page=${pageNum}&category=Notice`,
      );
      const newPost = res.data.post;

      if (newPost.length === 0) {
        setHasMore(false); // No more notices to fetch
      } else {
        setNotices((prev) => [...prev, ...newPost]);
      }
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-[#f5f5f5] relative overflow-hidden transition-colors duration-300">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-[#4790fd]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/10 dark:bg-[#c76191]/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-green-500/5 dark:bg-[#27dc66]/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 pt-10 pb-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-[#1a1a1a]/50 border border-gray-200 dark:border-[#4790fd]/20 mb-6 backdrop-blur-md shadow-sm dark:shadow-none">
          <Bell className="w-4 h-4 text-yellow-500 dark:text-[#ece239]" />
          <span className="text-xs font-medium text-gray-600 dark:text-[#a0a0a0] uppercase tracking-wider">Campus Updates</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 dark:from-[#f5f5f5] dark:via-[#4790fd] dark:to-[#f5f5f5] mb-4">
          Notice Board
        </h1>
        <p className="text-gray-600 dark:text-[#a0a0a0] text-lg max-w-2xl mx-auto font-light leading-relaxed">
          Stay informed with the latest announcements, schedules, and important updates from the administration.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {/* Notices Grid */}
        <div className="grid gap-6">
          {notices.length === 0 && !loading ? (
            <div className="text-center py-20 bg-white/50 dark:bg-[#1a1a1a]/30 rounded-3xl border border-gray-200 dark:border-[#ffffff]/5 backdrop-blur-sm">
              <div className="w-20 h-20 bg-gray-100 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-200 dark:border-[#ffffff]/10">
                <Bell className="w-10 h-10 text-blue-500 dark:text-[#4790fd] opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-2">
                No Notices Yet
              </h3>
              <p className="text-gray-500 dark:text-[#a0a0a0]">Check back later for important updates</p>
            </div>
          ) : (
            notices.map((notice, index) => (
              <NoticeCard
                key={notice._id || index}
                id={notice._id}
                title={notice.title}
                date={format(
                  parseISO(notice?.createdAt),
                  "dd MMM yyyy, hh:mm a"
                )}
                postedBy={notice?.author?.fullName}
                profilePhoto={notice?.author?.profileImage}
                role={notice?.author?.designation}
                fileUrl={notice.imageUrl}
                description={notice.content}
                department={notice.category}
              />
            ))
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/50 dark:bg-[#1a1a1a]/50 border border-gray-200 dark:border-[#4790fd]/20 backdrop-blur-md shadow-sm dark:shadow-none">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500 dark:text-[#4790fd]" />
              <span className="text-sm font-medium text-gray-600 dark:text-[#a0a0a0]">
                Loading notices...
              </span>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && notices.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setPage(prev => prev + 1)}
              className="group relative px-8 py-3 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#ffffff]/10 text-gray-900 dark:text-[#f5f5f5] font-medium 
                hover:border-blue-500/50 dark:hover:border-[#4790fd]/50 transition-all duration-300 overflow-hidden shadow-sm dark:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 dark:from-[#4790fd]/0 dark:via-[#4790fd]/10 dark:to-[#4790fd]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative z-10 group-hover:text-blue-600 dark:group-hover:text-[#4790fd] transition-colors">Load More Notices</span>
            </button>
          </div>
        )}
        
        {/* End of Content Message */}
        {!hasMore && notices.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-block px-4 py-2 rounded-full bg-white/50 dark:bg-[#1a1a1a]/30 border border-gray-200 dark:border-[#ffffff]/5 text-gray-500 dark:text-[#a0a0a0] text-sm shadow-sm dark:shadow-none">
              You've reached the end
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notice;
