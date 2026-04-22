import React, { useState } from "react";
import PhotoViewer from "./PhotoViewer";

const MessageTypeContent = ({
  message,
  setSelectedImage,
  setShowImagePreview,
}) => {
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  // Handle file attachments (new structure)
  if (message.fileUrl) {
    switch (message.fileType) {
      case "image":
        return (
          <>
            <div
              className="cursor-pointer group"
              onClick={() => setShowPhotoViewer(true)}
            >
              <div className="relative inline-block">
                <img
                  src={message.fileUrl}
                  alt={message.fileName || "Shared image"}
                  className="max-w-[220px] md:max-w-[260px] rounded-2xl border border-white/10 object-cover"
                />
                <div className="absolute inset-0 rounded-2xl bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity">
                  Click to view
                </div>
              </div>
            </div>
            
            {showPhotoViewer && (
              <PhotoViewer
                imageUrl={message.fileUrl}
                senderName={message.sender?.fullName || "Unknown"}
                timestamp={message.timestamp}
                onClose={() => setShowPhotoViewer(false)}
                onDownload={() => {
                  const link = document.createElement('a');
                  link.href = message.fileUrl;
                  link.download = message.fileName || 'image.jpg';
                  link.click();
                }}
                onDelete={() => {
                  // Implement actual delete functionality
                  const user = JSON.parse(localStorage.getItem('user'));
                  if (user && message.sender._id === user._id) {
                    // Delete for everyone (sender)
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/chats/${message._id}`, {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ userId: user._id }),
                    })
                    .then(response => response.json())
                    .then(data => {
                      console.log('Message deleted:', data.message);
                      window.location.reload(); // Refresh to show deleted message
                    })
                    .catch(error => {
                      console.error('Error deleting message:', error);
                    });
                  }
                }}
                onReply={() => {
                  console.log("Reply to image:", message._id);
                }}
              />
            )}
          </>
        );

      case "video":
        return (
          <div className="max-w-[220px] md:max-w-[260px]">
            <video
              src={message.fileUrl}
              controls
              className="w-full rounded-2xl border border-white/10"
            />
            <p className="text-xs text-slate-400 mt-1 truncate">
              {message.fileName}
            </p>
          </div>
        );

      case "audio":
        return (
          <div className="flex items-center space-x-2 bg-black/40 border border-white/15 px-3 py-2 rounded-2xl max-w-[220px]">
            <svg
              className="w-5 h-5 text-[#c76191]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-slate-50 truncate">
                {message.fileName}
              </p>
              <audio 
                src={message.fileUrl} 
                controls 
                className="w-full mt-1"
              />
            </div>
          </div>
        );

      case "document":
      default:
        return (
          <div className="flex items-center space-x-2 bg-black/40 border border-white/15 px-3 py-2 rounded-2xl max-w-[220px]">
            <svg
              className="w-5 h-5 text-[#ece239]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-medium text-slate-50 truncate">
                {message.fileName}
              </p>
              <p className="text-[10px] text-slate-400">
                {(message.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4790fd] hover:text-[#4790fd]/80 text-xs"
            >
              Download
            </a>
          </div>
        );
    }
  }

  // Handle legacy message types
  switch (message.type) {
    case "text":
      return (
        <p className="text-[13px] md:text-sm text-slate-50 whitespace-pre-wrap">
          {message.text}
        </p>
      );

    case "image":
      return (
        <div
          className="cursor-pointer group"
          onClick={() => {
            setSelectedImage(message.content);
            setShowImagePreview(true);
          }}
        >
          <div className="relative inline-block">
            <img
              src={message.content}
              alt="Shared"
              className="max-w-[220px] md:max-w-[260px] rounded-2xl border border-white/10 object-cover"
            />
            <div className="absolute inset-0 rounded-2xl bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity">
              Click to expand
            </div>
          </div>
        </div>
      );

    case "file":
      return (
        <div className="flex items-center space-x-2 bg-black/40 border border-white/15 px-3 py-2 rounded-2xl">
          <svg
            className="w-5 h-5 text-[#ece239]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-50">
              {message.fileName}
            </p>
            <p className="text-[10px] text-slate-400">
              {(message.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      );

    default:
      // For messages without a specific type or legacy messages
      return (
        <p className="text-[13px] md:text-sm text-slate-50 whitespace-pre-wrap">
          {message.text || message.content}
        </p>
      );
  }
};

export default MessageTypeContent;