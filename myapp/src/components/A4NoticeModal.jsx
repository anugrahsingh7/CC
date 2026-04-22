import React, { useState } from "react";
import { X, Download, FileText, Calendar, Clock, User, Share2, Check } from "lucide-react";

const A4NoticeModal = ({ 
  isOpen, 
  onClose, 
  title, 
  date, 
  postedBy, 
  role, 
  fileUrl, 
  description, 
  department,
  id
}) => {
  if (!isOpen) return null;
  
  const [isCopied, setIsCopied] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const { date: formattedDate, time: formattedTime } = formatDate(date);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#0a0a0a] text-[#f5f5f5] rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-auto border border-[#4790fd]/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-[#4790fd] to-[#27dc66] text-white p-6 border-b border-[#4790fd]/30">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  {formattedTime}
                </span>
                <span className="flex items-center gap-2">
                  <User size={16} />
                  {postedBy} - {role}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* A4 Paper Layout */}
        <div className="p-8">
          {/* Official Header */}
          <div className="text-center mb-8 border-b border-[#ffffff]/20 pb-6">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-[#f5f5f5] mb-1">
                {department || "UNIVERSITY NOTICE BOARD"}
              </h2>
              <div className="w-24 h-1 bg-[#4790fd] mx-auto rounded-full"></div>
            </div>
            <p className="text-[#a0a0a0] italic">Official Communication</p>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {/* Description Section */}
            <div className="bg-[#1a1a1a] p-6 rounded-lg border-l-4 border-[#4790fd] border-[#ffffff]/10">
              <h3 className="text-lg font-semibold text-[#f5f5f5] mb-3 flex items-center gap-2">
                <FileText size={20} className="text-[#4790fd]" />
                Notice Details
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-[#d0d0d0] leading-relaxed whitespace-pre-wrap">
                  {description || "No detailed description available for this notice."}
                </p>
              </div>
            </div>

            {/* PDF Preview Section - A4 Size */}
            <div className="bg-[#1a1a1a] border border-[#ffffff]/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#f5f5f5] mb-3 flex items-center gap-2">
                <FileText size={20} className="text-[#4790fd]" />
                Document Preview
              </h3>
              <div className="flex justify-center">
                <div 
                  className="bg-[#222222] rounded-lg overflow-hidden shadow-lg border border-[#ffffff]/10 md:w-[210mm] md:h-[297mm] w-full h-[70vh]"
                  style={{ 
                    width: '210mm',  // A4 width
                    height: '297mm', // A4 height
                    maxWidth: '100%',
                    maxHeight: '70vh'
                  }}
                >
                  {fileUrl ? (
                    <iframe
                      src={fileUrl}
                      title="Notice Document"
                      className="w-full h-full"
                      style={{ border: 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-center text-[#a0a0a0] p-8">
                      <div>
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No Document Available</p>
                        <p className="text-sm">This notice doesn't contain an attached document.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Information */}
            <div className="bg-[#1a1a1a] p-4 rounded-lg border-t border-[#ffffff]/20">
              <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-[#a0a0a0]">
                <div>
                  <p className="font-semibold text-[#f5f5f5]">Issued by:</p>
                  <p>{postedBy}</p>
                  <p className="text-xs">{role}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#f5f5f5]">Date:</p>
                  <p>{formattedDate}</p>
                  <p className="text-xs">{formattedTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-[#1a1a1a] border-t border-[#ffffff]/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-[#a0a0a0] hover:bg-[#ffffff]/10 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/notice/${id}`;
              navigator.clipboard.writeText(shareUrl);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            }}
            className={`px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
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
          <a
            href={fileUrl}
            download
            className="px-6 py-2 rounded-lg bg-[#4790fd] text-black hover:bg-[#4790fd]/80 transition-colors font-medium flex items-center gap-2"
          >
            <Download size={18} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default A4NoticeModal;