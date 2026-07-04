import { Check, CheckCheck, MoreVertical, Edit2, Trash2, X, Check as CheckIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

function StatusIcon({ status }) {
  if (status === "read") {
    return <CheckCheck className="h-3.5 w-3.5 text-sky-500" />;
  }

  if (status === "delivered") {
    return <CheckCheck className="h-3.5 w-3.5 text-slate-400" />;
  }

  return <Check className="h-3.5 w-3.5 text-slate-400" />;
}

export default function MessageBubble({ 
  message, 
  isOwnMessage,
  onUpdateMessage,
  onDeleteMessage 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdate = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await onUpdateMessage(message._id, editContent);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this message?")) {
      await onDeleteMessage(message._id);
    }
    setShowMenu(false);
  };

  return (
    <div className={`group flex items-center gap-2 ${isOwnMessage ? "flex-row-reverse justify-start" : "justify-start"}`}>
      <div
        className={`relative max-w-[90%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[82%] sm:px-4 ${
          isOwnMessage
            ? "rounded-br-md bg-gradient-to-br from-[#4790fd] to-[#27dc66] text-white shadow-[#4790fd]/30"
            : "rounded-bl-md border border-[#ffffff]/15 bg-[#070707] text-white"
        }`}
      >
        {!isOwnMessage && message.group && (
          <p className="mb-1 text-xs font-semibold text-[#ece239]">
            {message.sender?.fullName}
          </p>
        )}
        
        {isEditing ? (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <textarea
              className="w-full bg-[#1a1a1a] text-white text-[13px] sm:text-sm rounded-lg p-2 border border-[#4790fd]/30 focus:outline-none focus:border-[#4790fd] resize-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
              <button 
                onClick={handleUpdate}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-emerald-400"
              >
                <CheckIcon size={16} />
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words text-[13px] leading-6 sm:text-sm">
            {message.content}
          </p>
        )}

        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-white/65">
          {message.isEdited && <span className="mr-1 italic text-[10px]">edited</span>}
          <span>{formatTime(message.createdAt)}</span>
          {isOwnMessage && <StatusIcon status={message.status} />}
        </div>
      </div>

      {isOwnMessage && !isEditing && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white"
          >
            <MoreVertical size={16} />
          </button>
          
          {showMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-28 bg-[#1a1a1a] border border-[#ffffff]/10 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-white/80 hover:bg-[#4790fd]/10 hover:text-[#4790fd] transition-colors"
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-[#ffffff]/5"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
