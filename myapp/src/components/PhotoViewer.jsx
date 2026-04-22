import React, { useState, useEffect, useRef } from "react";
import { X, Download, Trash2, Reply, MoreHorizontal } from "lucide-react";

const PhotoViewer = ({ 
  imageUrl, 
  senderName, 
  timestamp, 
  onClose, 
  onDownload,
  onDelete,
  onReply,
  showActions = true 
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset view when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl]);

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 0.5), 3);
    setScale(newScale);
  };

  // Handle touch/mouse down for dragging
  const handleStart = (clientX, clientY) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPos({
        x: clientX - position.x,
        y: clientY - position.y
      });
    }
  };

  // Handle touch/mouse move for dragging
  const handleMove = (clientX, clientY) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: clientX - startPos.x,
        y: clientY - startPos.y
      });
    }
  };

  // Handle touch/mouse up
  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse event handlers
  const handleMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();

  // Touch event handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => handleEnd();

  // Double click to zoom
  const handleDoubleClick = () => {
    setScale(scale === 1 ? 2 : 1);
    setPosition({ x: 0, y: 0 });
  };

  // Format timestamp like WhatsApp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div>
              <p className="text-white font-medium">{senderName}</p>
              <p className="text-white/70 text-sm">{formatTime(timestamp)}</p>
            </div>
          </div>
          
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <MoreHorizontal className="w-6 h-6 text-white" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-12 bg-black/90 backdrop-blur-sm rounded-xl border border-white/10 py-2 w-48">
                  <button
                    onClick={() => {
                      onDownload?.();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-white hover:bg-white/10 transition-colors text-left"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      onReply?.();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-white hover:bg-white/10 transition-colors text-left"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/20 transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Photo"
          className="max-w-full max-h-full object-contain select-none cursor-grab active:cursor-grabbing"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
      </div>

      {/* Footer with image info */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4 z-10">
        <div className="text-center">
          <p className="text-white/70 text-sm">
            {Math.round(scale * 100)}%
          </p>
        </div>
      </div>

      {/* Swipe indicators */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <div className="w-1 h-8 bg-white/30 rounded-full"></div>
      </div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="w-1 h-8 bg-white/30 rounded-full"></div>
      </div>
    </div>
  );
};

export default PhotoViewer;