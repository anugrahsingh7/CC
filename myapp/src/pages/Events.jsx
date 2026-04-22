import React, { useState, useEffect, useRef } from "react";
import EventCard from "../components/EventCard";
import { Loader2, X, Calendar, Sparkles, Download, Share2, Info, MapPin, Clock, User, Check } from "lucide-react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { format, parseISO } from "date-fns";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const observerTarget = useRef(null);
  const observerRef = useRef(null);
  const LIMIT = 10; // same limit as on the server
  const { isDarkMode } = useTheme();

  // Refs to hold the latest values
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  const pageRef = useRef(page);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const fetchEvents = async () => {
    // Prevent duplicate calls if a fetch is already in progress
    if (loadingRef.current) return;

    // Capture the current page and immediately update it for the next call
    const currentPage = pageRef.current;
    pageRef.current = currentPage + 1;
    setPage(currentPage + 1);

    setLoading(true);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin-post/get-post?page=${currentPage}&category=Event`,
      );
      const newEvents = response.data.post;

      // If fewer events than expected are returned, mark that no more data is available.
      if (newEvents.length < LIMIT) {
        setHasMore(false);
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      }

      // Append the new events
      if (newEvents.length > 0) {
        setEvents((prev) => [...prev, ...newEvents]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Set up the observer once
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreRef.current &&
          !loadingRef.current
        ) {
          fetchEvents();
        }
      },
      { threshold: 0.5 },
    );
    observerRef.current = observer;

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, []); // run only once

  const openModal = (imageUrl, event) => {
    setModalImage(imageUrl);
    setSelectedEvent(event);
    setIsCopied(false); // Reset copied state when opening new modal
  };
  const closeModal = () => {
    setModalImage(null);
    setSelectedEvent(null);
    setIsCopied(false); // Reset copied state when closing
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-[#f5f5f5] relative overflow-hidden transition-colors duration-300">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 dark:bg-[#4790fd]/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/5 dark:bg-[#c76191]/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-yellow-500/5 dark:bg-[#ece239]/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 pt-10 pb-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-[#1a1a1a]/50 border border-gray-200 dark:border-[#ece239]/20 mb-6 backdrop-blur-md shadow-sm dark:shadow-none">
          <Sparkles className="w-4 h-4 text-yellow-500 dark:text-[#ece239]" />
          <span className="text-xs font-medium text-gray-600 dark:text-[#a0a0a0] uppercase tracking-wider">Upcoming Activities</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-yellow-500 to-gray-900 dark:from-[#f5f5f5] dark:via-[#ece239] dark:to-[#f5f5f5] mb-4">
          Events & Activities
        </h1>
        <p className="text-gray-600 dark:text-[#a0a0a0] text-lg max-w-2xl mx-auto font-light leading-relaxed">
          Discover what's happening in our community. Join workshops, seminars, and cultural fests.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {events.map((event, index) => (
            <EventCard
              key={event._id || index}
              event={event}
              openModal={openModal}
            />
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/50 dark:bg-[#1a1a1a]/50 border border-gray-200 dark:border-[#ece239]/20 backdrop-blur-md shadow-sm dark:shadow-none">
              <Loader2 className="w-5 h-5 animate-spin text-yellow-500 dark:text-[#ece239]" />
              <span className="text-sm font-medium text-gray-600 dark:text-[#a0a0a0]">
                Loading more events...
              </span>
            </div>
          </div>
        )}

        {/* Observer Target */}
        <div ref={observerTarget} className="h-4 w-full" />

        {/* End of Content Message */}
        {!hasMore && events.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-block px-4 py-2 rounded-full bg-white/50 dark:bg-[#1a1a1a]/30 border border-gray-200 dark:border-[#ffffff]/5 text-gray-500 dark:text-[#a0a0a0] text-sm shadow-sm dark:shadow-none">
              You've reached the end
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="text-center py-20 bg-white/50 dark:bg-[#1a1a1a]/30 rounded-3xl border border-gray-200 dark:border-[#ffffff]/5 backdrop-blur-sm max-w-lg mx-auto">
            <div className="w-20 h-20 bg-gray-100 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-200 dark:border-[#ffffff]/10">
              <Calendar className="w-10 h-10 text-yellow-500 dark:text-[#ece239] opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-2">
              No Events Yet
            </h3>
            <p className="text-gray-500 dark:text-[#a0a0a0]">
              Check back later for upcoming events and activities
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Event Modal */}
      {modalImage && selectedEvent && (
        <div
          className="fixed inset-0 bg-black/95 dark:bg-[#000000]/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-6xl w-full max-h-[95vh] overflow-hidden rounded-2xl">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-14 right-0 text-gray-300 hover:text-white dark:text-[#a0a0a0] dark:hover:text-[#f5f5f5] transition-colors p-3 bg-black/30 dark:bg-[#000000]/30 rounded-full hover:bg-black/50 dark:hover:bg-[#000000]/50 backdrop-blur-md z-10"
            >
              <X size={28} />
            </button>
            
            <div className="flex flex-col lg:flex-row bg-[#0a0a0a] dark:bg-[#000000] border border-white/10 dark:border-[#ffffff]/10 shadow-2xl h-full max-h-[90vh]">
              {/* Poster Section - Enhanced Size */}
              <div className="lg:w-2/3 relative overflow-hidden bg-black">
                <img
                  src={modalImage}
                  alt={selectedEvent.title}
                  className="w-full h-full object-contain max-h-[70vh] lg:max-h-none"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Event Title Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                    {selectedEvent.title}
                  </h2>
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
                  <h3 className="text-2xl font-bold text-[#f5f5f5] mb-2">{selectedEvent.title}</h3>
                  <p className="text-[#a0a0a0] text-sm">{selectedEvent.description || "No description available"}</p>
                </div>
                
                {/* Event Information */}
                <div className="space-y-5 flex-1">
                  {/* Date & Time */}
                  <div className="bg-[#222222]/50 rounded-xl p-4 border border-[#ffffff]/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-[#4790fd]/20 rounded-lg">
                        <Calendar size={20} className="text-[#4790fd]" />
                      </div>
                      <h4 className="font-semibold text-[#f5f5f5]">Date & Time</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-[#a0a0a0] flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#4790fd] rounded-full"></span>
                        {format(parseISO(selectedEvent?.createdAt), "EEEE, dd MMM yyyy")}
                      </p>
                      <p className="text-[#a0a0a0] flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#c76191] rounded-full"></span>
                        {format(parseISO(selectedEvent?.createdAt), "hh:mm a")}
                      </p>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="bg-[#222222]/50 rounded-xl p-4 border border-[#ffffff]/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-[#27dc66]/20 rounded-lg">
                        <MapPin size={20} className="text-[#27dc66]" />
                      </div>
                      <h4 className="font-semibold text-[#f5f5f5]">Location</h4>
                    </div>
                    <p className="text-[#a0a0a0] text-sm">
                      {selectedEvent.location || "On Campus"}
                    </p>
                  </div>
                  
                  {/* Organizer */}
                  <div className="bg-[#222222]/50 rounded-xl p-4 border border-[#ffffff]/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-[#c76191]/20 rounded-lg">
                        <User size={20} className="text-[#c76191]" />
                      </div>
                      <h4 className="font-semibold text-[#f5f5f5]">Organized By</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedEvent.author.profileImage}
                        alt={selectedEvent.author.fullName}
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
                        <p className="font-medium text-[#f5f5f5]">{selectedEvent.author.fullName}</p>
                        <p className="text-xs text-[#a0a0a0]">Event Organizer</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-[#ffffff]/10">
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/event/${selectedEvent._id}`;
                      navigator.clipboard.writeText(shareUrl);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors font-medium ${
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
                  <a
                    href={modalImage}
                    download={`${selectedEvent.title.replace(/\s+/g, '_')}_poster.jpg`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4790fd] text-black hover:bg-[#4790fd]/80 transition-colors font-medium"
                  >
                    <Download size={18} />
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
