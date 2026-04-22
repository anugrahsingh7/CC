import { useUser } from "@clerk/clerk-react";
import React, { useState } from "react";
import { Calendar, Clock, Download, Eye, User, FileText, Bell, Star, TrendingUp, X, Share2, Check } from 'lucide-react';
import A4NoticeModal from './A4NoticeModal';

const NoticeCard = ({ title, date, postedBy, profilePhoto, role, fileUrl, description, department, priority = "normal", id }) => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "high":
        return {
          gradient: "from-[#c76191]/20 via-[#c76191]/10 to-[#c76191]/5",
          border: "border-[#c76191]/30",
          icon: <Bell className="text-[#c76191]" size={16} />,
          badge: "bg-[#c76191]/20 text-[#c76191] border-[#c76191]/30",
          pulse: "animate-pulse"
        };
      case "low":
        return {
          gradient: "from-[#27dc66]/20 via-[#27dc66]/10 to-[#27dc66]/5",
          border: "border-[#27dc66]/30",
          icon: <Star className="text-[#27dc66]" size={16} />,
          badge: "bg-[#27dc66]/20 text-[#27dc66] border-[#27dc66]/30",
          pulse: ""
        };
      default:
        return {
          gradient: "from-[#4790fd]/20 via-[#4790fd]/10 to-[#4790fd]/5",
          border: "border-[#4790fd]/30",
          icon: <FileText className="text-[#4790fd]" size={16} />,
          badge: "bg-[#4790fd]/20 text-[#4790fd] border-[#4790fd]/30",
          pulse: ""
        };
    }
  };

  const priorityConfig = getPriorityConfig(priority);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      relative: diffDays === 1 ? 'Today' : diffDays === 2 ? 'Yesterday' : `${diffDays} days ago`
    };
  };

  const { date: formattedDate, time: formattedTime, relative } = formatDate(date);

  return (
    <>
      {/* Modern Notice Card */}
      <div
        className={`group relative overflow-hidden rounded-2xl transition-all duration-500 ease-out
          bg-gradient-to-br ${priorityConfig.gradient} 
          border ${priorityConfig.border} 
          hover:scale-[1.01] hover:shadow-xl hover:shadow-[#4790fd]/10
          backdrop-blur-sm bg-[#1a1a1a]/40`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#4790fd]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#c76191]/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Priority Badge */}
        {/* <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full 
          ${priorityConfig.badge} border backdrop-blur-sm ${priorityConfig.pulse} z-10`}>
          {priorityConfig.icon}
          <span className="text-xs font-medium capitalize">{priority}</span>
        </div> */}

        {/* Main Content */}
        <div className="relative p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h3 
                className="text-lg sm:text-xl font-bold text-[#f5f5f5] mb-2 line-clamp-2 cursor-pointer
                  hover:text-[#4790fd] transition-colors duration-300"
                onClick={handleOpenModal}
              >
                {title}
              </h3>
              <p className="text-[#a0a0a0] text-sm line-clamp-2 font-light">
                {description || "No description available"}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2 relative z-20">
              <button
                onClick={handleOpenModal}
                className="p-2.5 bg-[#ffffff]/5 hover:bg-[#4790fd]/20 rounded-xl transition-all duration-300
                  text-[#a0a0a0] hover:text-[#4790fd] border border-transparent hover:border-[#4790fd]/30"
                title="View Details"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}/notice/${id}`;
                  navigator.clipboard.writeText(shareUrl);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className={`p-2.5 rounded-xl transition-all duration-300 border border-transparent flex items-center gap-2 ${
                  isCopied 
                    ? 'bg-[#27dc66]/20 text-[#27dc66] border-[#27dc66]/30' 
                    : 'bg-[#ffffff]/5 text-[#a0a0a0] hover:bg-[#ece239]/20 hover:text-[#ece239] hover:border-[#ece239]/30'
                }`}
                title={isCopied ? "Copied!" : "Share Notice"}
              >
                {isCopied ? (
                  <>
                    <Check size={18} className="animate-pulse" />
                    <span className="text-xs font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 size={18} />
                    <span className="text-xs font-medium">Share</span>
                  </>
                )}
              </button>
              <a
                href={fileUrl}
                download
                className="p-2.5 bg-[#ffffff]/5 hover:bg-[#27dc66]/20 rounded-xl transition-all duration-300
                  text-[#a0a0a0] hover:text-[#27dc66] border border-transparent hover:border-[#27dc66]/30"
                title="Download"
              >
                <Download size={18} />
              </a>
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#808080] mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#4790fd]" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#ece239]" />
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#27dc66]" />
              <span>{relative}</span>
            </div>
            {department && (
              <span className="px-2.5 py-1 bg-[#ffffff]/5 rounded-full text-[#a0a0a0] text-xs border border-[#ffffff]/10">
                {department}
              </span>
            )}
          </div>

          {/* Author Section */}
          <div className="flex items-center justify-between pt-4 border-t border-[#ffffff]/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={profilePhoto}
                  alt={postedBy}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#4790fd]/20"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-10 h-10 rounded-full bg-[#1a1a1a] 
                  items-center justify-center ring-2 ring-[#4790fd]/20">
                  <User size={18} className="text-[#a0a0a0]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#27dc66] rounded-full border-2 border-[#070707]"></div>
              </div>
              <div>
                <p className="font-semibold text-[#f5f5f5] text-sm">{postedBy}</p>
                <p className="text-[#a0a0a0] text-xs">{role}</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-3 text-xs text-[#a0a0a0]">
              <div className="text-center group-hover:scale-110 transition-transform duration-300">
                <div className="font-semibold text-[#4790fd]">📄</div>
                <div>PDF</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#4790fd]/0 via-[#4790fd]/5 to-[#c76191]/0 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <A4NoticeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={title}
          date={date}
          postedBy={postedBy}
          role={role}
          fileUrl={fileUrl}
          description={description}
          department={department}
          id={id}
        />
      )}
    </>
  );
};

export default NoticeCard;
