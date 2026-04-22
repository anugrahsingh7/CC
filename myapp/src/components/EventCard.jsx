import { format, parseISO } from "date-fns";
import React, { useState } from "react";
import { Calendar, Clock, MapPin, User, Eye, ExternalLink, Share2, Check } from 'lucide-react';

const EventCard = ({ event, openModal }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fullDate: format(parseISO(dateString), "EEEE, dd MMM yyyy"),
      relative: diffDays === 1 ? 'Today' : diffDays === 2 ? 'Tomorrow' : diffDays === 0 ? 'Today' : `${diffDays} days away`
    };
  };

  const { date: formattedDate, time: formattedTime, fullDate, relative } = formatDate(event?.createdAt);

  return (
    <div 
      className="group relative overflow-hidden rounded-3xl transition-all duration-500 ease-out
        bg-[#1a1a1a]/40 border border-[#ffffff]/10 hover:border-[#ece239]/50
        hover:shadow-2xl hover:shadow-[#ece239]/10 backdrop-blur-md flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#ece239]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#4790fd]/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Event Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full 
        bg-[#000000]/60 text-[#ece239] border border-[#ece239]/30 backdrop-blur-md z-20 shadow-lg">
        <span className="text-xs font-bold uppercase tracking-wider">Event</span>
      </div>

      {/* Poster with Hover Effect */}
      <div
        className="relative aspect-[4/3] overflow-hidden cursor-pointer"
        onClick={() => openModal(event.imageUrl, event)}
      >
        {!event.imageUrl ? (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center text-[#f5f5f5]">
            <div className="text-center p-6">
              <div className="text-5xl mb-4 opacity-50">🎉</div>
              <p className="text-lg font-medium text-[#a0a0a0]">{event.title}</p>
            </div>
          </div>
        ) : (
          <>
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
          </>
        )}

        {/* Event Date Badge - Floating */}
        <div className="absolute top-4 right-4 bg-[#000000]/60 backdrop-blur-md rounded-2xl p-2.5 shadow-xl border border-[#ffffff]/10 text-center min-w-[60px] z-20">
          <span className="block text-xl font-bold text-[#f5f5f5]">
            {format(parseISO(event?.createdAt), "dd")}
          </span>
          <span className="block text-xs font-medium text-[#ece239] uppercase tracking-wider">
            {format(parseISO(event?.createdAt), "MMM")}
          </span>
        </div>

        {/* View Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-black/20 backdrop-blur-[2px]">
          <button className="p-3.5 bg-[#ece239] rounded-full text-black hover:scale-110 transition-transform shadow-lg shadow-[#ece239]/20">
            <Eye size={24} />
          </button>
        </div>
      </div>

      {/* Event Details */}
      <div className="relative p-5 flex flex-col flex-1">
        {/* Title */}
        <h2 className="text-xl font-bold text-[#f5f5f5] mb-3 line-clamp-2 group-hover:text-[#ece239] transition-colors cursor-pointer"
            onClick={() => openModal(event.imageUrl, event)}>
          {event.title}
        </h2>

        {/* Meta Information */}
        <div className="space-y-2.5 mb-5 flex-1">
          <div className="flex items-center text-sm text-[#a0a0a0]">
            <Calendar size={16} className="mr-2.5 text-[#4790fd]" />
            <span>{fullDate}</span>
          </div>
          <div className="flex items-center text-sm text-[#a0a0a0]">
            <Clock size={16} className="mr-2.5 text-[#c76191]" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin size={16} className="mr-2.5 text-[#27dc66]" />
            <span className="text-[#a0a0a0]">{event.location || "On Campus"}</span>
          </div>
        </div>

        {/* Footer Section */}
        <div className="pt-4 mt-auto border-t border-[#ffffff]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={event.author.profileImage}
                alt={event.author.fullName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#ffffff]/10 group-hover:ring-[#ece239]/50 transition-all"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-9 h-9 rounded-full bg-[#1a1a1a] 
                items-center justify-center ring-2 ring-[#ffffff]/10">
                <User size={16} className="text-[#a0a0a0]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#f5f5f5] group-hover:text-[#ece239] transition-colors">
                {event?.author.fullName}
              </span>
              <span className="text-xs text-[#a0a0a0]">Organizer</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const shareUrl = `${window.location.origin}/event/${event._id}`;
                navigator.clipboard.writeText(shareUrl);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className={`p-2 rounded-lg transition-all duration-300 border flex items-center gap-1 text-xs font-medium ${
                isCopied 
                  ? 'bg-[#27dc66]/20 text-[#27dc66] border-[#27dc66]/30' 
                  : 'bg-[#ffffff]/5 text-[#a0a0a0] hover:bg-[#ece239]/20 hover:text-[#ece239] border-transparent hover:border-[#ece239]/30'
              }`}
              title={isCopied ? "Copied!" : "Share Event"}
            >
              {isCopied ? (
                <>
                  <Check size={14} className="animate-pulse" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  Share
                </>
              )}
            </button>
            <div className="px-2.5 py-1 rounded-full bg-[#ffffff]/5 text-[#a0a0a0] text-xs font-medium border border-[#ffffff]/10 group-hover:border-[#ece239]/30 transition-colors">
              {relative}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
