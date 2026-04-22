import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { X, Download, Share2, Calendar, Clock, MapPin, User, Loader2, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin-post/get-post-by-id/${id}`
      );
      setEvent(response.data.post);
    } catch (err) {
      console.error("Error fetching event:", err);
      setError("Event not found or unavailable");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/event/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (event?.imageUrl) {
      const link = document.createElement('a');
      link.href = event.imageUrl;
      link.download = `${event.title.replace(/\s+/g, '_')}_poster.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#070707] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#ece239]" />
          <p className="text-gray-600 dark:text-[#a0a0a0]">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#070707] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#ffffff]/10 shadow-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-600 dark:text-[#a0a0a0] mb-6">
            {error || "The event you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/Events')}
            className="px-6 py-2 bg-[#ece239] text-black rounded-lg hover:bg-[#ece239]/80 transition-colors font-medium"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/5 dark:bg-[#ece239]/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-[#4790fd]/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/Events')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-[#a0a0a0] hover:bg-gray-100 dark:hover:bg-[#252525] transition-all duration-300 shadow-sm border border-gray-200 dark:border-[#ffffff]/10"
          >
            <X size={20} />
            <span>Back to Events</span>
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
                  Share Event
                </>
              )}
            </button>
            {event.imageUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4790fd] text-black hover:bg-[#4790fd]/80 transition-colors font-medium"
              >
                <Download size={18} />
                Download Poster
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Event Modal */}
        <div className="flex flex-col lg:flex-row bg-[#0a0a0a] dark:bg-[#000000] border border-white/10 dark:border-[#ffffff]/10 shadow-2xl rounded-2xl overflow-hidden">
          {/* Poster Section */}
          <div className="lg:w-2/3 relative overflow-hidden bg-black">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-contain max-h-[70vh] lg:max-h-none"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
                <div className="text-center text-[#f5f5f5]">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-xl font-medium">{event.title}</p>
                </div>
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
            
            {/* Event Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {event.title}
              </h1>
            </div>
          </div>
          
          {/* Event Details Section */}
          <div className="lg:w-1/3 bg-[#1a1a1a] dark:bg-[#0a0a0a] p-6 overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ece239]/10 text-[#ece239] border border-[#ece239]/30 mb-4">
                <Calendar size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Event Details</span>
              </div>
              <h2 className="text-2xl font-bold text-[#f5f5f5] mb-2">{event.title}</h2>
              <p className="text-[#a0a0a0] text-sm">{event.content || "No description available"}</p>
            </div>
            
            {/* Event Information */}
            <div className="space-y-5 flex-1">
              {/* Date & Time */}
              <div className="bg-[#222222]/50 rounded-xl p-4 border border-[#ffffff]/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#4790fd]/20 rounded-lg">
                    <Calendar size={20} className="text-[#4790fd]" />
                  </div>
                  <h3 className="font-semibold text-[#f5f5f5]">Date & Time</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-[#a0a0a0] flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#4790fd] rounded-full"></span>
                    {format(parseISO(event?.createdAt), "EEEE, dd MMM yyyy")}
                  </p>
                  <p className="text-[#a0a0a0] flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#c76191] rounded-full"></span>
                    {format(parseISO(event?.createdAt), "hh:mm a")}
                  </p>
                </div>
              </div>
              
              {/* Location */}
              <div className="bg-[#222222]/50 rounded-xl p-4 border border-[#ffffff]/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#27dc66]/20 rounded-lg">
                    <MapPin size={20} className="text-[#27dc66]" />
                  </div>
                  <h3 className="font-semibold text-[#f5f5f5]">Location</h3>
                </div>
                <p className="text-[#a0a0a0] text-sm">
                  {event.location || "On Campus"}
                </p>
              </div>
              
              {/* Organizer */}
              <div className="bg-[#222222]/50 rounded-xl p-4 border border-[#ffffff]/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#c76191]/20 rounded-lg">
                    <User size={20} className="text-[#c76191]" />
                  </div>
                  <h3 className="font-semibold text-[#f5f5f5]">Organized By</h3>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={event.author.profileImage}
                    alt={event.author.fullName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#ffffff]/20"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-10 h-10 rounded-full bg-[#1a1a1a] 
                    items-center justify-center ring-2 ring-[#ffffff]/20">
                    <User size={18} className="text-[#a0a0a0]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#f5f5f5]">{event.author.fullName}</p>
                    <p className="text-xs text-[#a0a0a0]">Event Organizer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;