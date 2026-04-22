import axios from "axios";
import dayjs from "dayjs";
import EmojiPicker from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Smile, User, Phone, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

// Theme colors aligned with theme.txt
const CC_YELLOW = "#ece239";
const CC_BLUE = "#4790fd";
const CC_PINK = "#c76191";
const CC_GREEN = "#27dc66";

const ChatWindow = ({ user, recipient, onMobileBack }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showReactions, setShowReactions] = useState(null);
  const [reactions, setReactions] = useState({});
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  const roomId = useMemo(() => {
    return user && recipient ? [user._id, recipient._id].sort().join("_") : "";
  }, [user, recipient]);

  const scrollToBottom = (behavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!user || !recipient) return;

    socket.emit("join_room", roomId);
    fetchMessages();
    const handleReceiveMessage = (data) => {
      if (data.roomId !== roomId) return; // Ignore messages not in this room

      setChat((prev) => [...prev, data]);

      const container = chatContainerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          100;
        setShouldScroll(isNearBottom);
      }
    };

    const handleReaction = (data) => {
      setReactions((prev) => {
        const messageReactions = prev[data.messageId] || [];
        const existingIndex = messageReactions.findIndex(
          (r) => r.userId === data.userId
        );

        if (existingIndex >= 0) {
          if (data.reaction === null) {
            // Remove reaction
            return {
              ...prev,
              [data.messageId]: messageReactions.filter(
                (_, i) => i !== existingIndex
              ),
            };
          } else {
            // Update reaction
            const updated = [...messageReactions];
            updated[existingIndex] = {
              userId: data.userId,
              reaction: data.reaction,
            };
            return { ...prev, [data.messageId]: updated };
          }
        } else {
          // Add new reaction
          return {
            ...prev,
            [data.messageId]: [
              ...messageReactions,
              { userId: data.userId, reaction: data.reaction },
            ],
          };
        }
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("reaction", handleReaction);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("reaction", handleReaction);
    };
  }, [user, recipient, roomId]);

  useEffect(() => {
    if (shouldScroll) scrollToBottom("auto");
  }, [chat, shouldScroll]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/chats/${
          recipient._id
        }?senderId=${user._id}`
      );
      setChat(res.data);

      setTimeout(() => scrollToBottom("auto"), 0);
    } catch (err) {
      console.error(
        "Error fetching messages:",
        err.response?.data || err.message
      );
    }
  };

  const handleProfileClick = () => {
    if (recipient && recipient._id) {
      // Navigate with ID first, URL will be updated automatically with name
      navigate(`/NetworkProfile/${recipient._id}`);
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    setShouldScroll(isNearBottom);
  };

  const handleReaction = (messageId, reaction) => {
    socket.emit("reaction", {
      messageId,
      userId: user._id,
      reaction,
      roomId,
    });
    setShowReactions(null);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const sendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !user || !recipient) return;

    const messageId = Date.now().toString();

    // Handle file upload
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("recipientId", recipient._id);
      formData.append("content", message.trim());
      formData.append("userId", user._id);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat/chats/file`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Create message object for real-time display
        const msg = {
          _id: response.data._id,
          sender: { _id: user._id, fullName: user.fullName },
          content: message.trim(),
          roomId,
          timestamp: response.data.createdAt, // Use database timestamp
          fileUrl: response.data.fileUrl,
          fileType: response.data.fileType,
          fileName: response.data.fileName,
          fileSize: response.data.fileSize,
        };

        socket.emit("send_message", msg);
        setChat((prev) => [...prev, msg]);
        
        // Reset file state
        setSelectedFile(null);
        setPreviewUrl(null);
      } catch (err) {
        console.error("Error uploading file:", err.response?.data || err.message);
        // Handle error appropriately
        return;
      }
    } else if (message.trim()) {
      // Handle regular text message
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/chats`, {
          recipientId: recipient._id,
          content: message,
          userId: user._id,
          roomId,
        });

        const msg = {
          _id: response.data._id,
          sender: { _id: user._id, fullName: user.fullName },
          content: message,
          roomId,
          timestamp: response.data.createdAt, // Use database timestamp
        };

        socket.emit("send_message", msg);
        setChat((prev) => [...prev, msg]);
      } catch (err) {
        console.error("Error sending message:", err.response?.data || err.message);
        return;
      }
    }

    setMessage("");
    setShouldScroll(true);
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-black/80 backdrop-blur-2xl transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-16 right-0 w-56 h-56 rounded-full blur-3xl opacity-40"
          style={{ background: CC_BLUE }}
        />
        <div
          className="absolute top-1/3 -left-10 w-64 h-64 rounded-full blur-3xl opacity-30"
          style={{ background: CC_PINK }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full blur-[90px] opacity-25"
          style={{ background: CC_GREEN }}
        />
      </div>

      {/* Header */}
      <div className="relative z-20 px-4 py-3 md:px-6 md:py-3 border-b border-white/10 bg-gradient-to-r from-black via-black/90 to-black/80">
          <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              className="md:hidden mr-1 p-1.5 rounded-full hover:bg-white/10 text-white/70 transition-all duration-300"
              onClick={() => {
                if (onMobileBack) {
                  onMobileBack();
                } else {
                  navigate(-1);
                }
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowProfilePhotoModal(true)}
            >
              <img
                src={recipient.profileImage || "default-user.jpg"}
                alt={recipient.fullName}
                className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border border-white/10 shadow-lg shadow-black/70 group-hover:border-[#4790fd]/70 transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#27dc66] rounded-full border border-black shadow-[0_0_10px_rgba(39,220,102,0.9)]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="font-semibold text-white text-sm md:text-base truncate cursor-pointer hover:text-[#4790fd] transition-colors"
                onClick={handleProfileClick}
              >
                {recipient.fullName}
              </h2>
              <p className="text-[11px] md:text-xs text-[#27dc66]">
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              type="button"
              className="p-1.5 md:p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300"
              aria-label="Voice call"
            >
              <Phone className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              type="button"
              className="p-1.5 md:p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300"
              aria-label="Video call"
            >
              <Video className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              className="p-1.5 md:p-2 rounded-full border border-white/10 hover:border-white/40 hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300"
              onClick={handleProfileClick}
              aria-label="View profile"
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Photo Modal */}
      {showProfilePhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowProfilePhotoModal(false)}
        >
        <div
          className="relative max-w-lg w-full mx-auto bg-black/90 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.9)] border border-white/10 flex flex-col items-center p-6 animate-fadeIn transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
              onClick={() => setShowProfilePhotoModal(false)}
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="relative">
              <img
                src={recipient.profileImage || "default-user.jpg"}
                alt={recipient.fullName}
                className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover border-4 border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.9)] mx-auto"
                style={{ maxWidth: "90vw", maxHeight: "60vh" }}
              />
              <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none" />
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-1">
                {recipient.fullName}
              </h3>
              <p className="text-sm text-white/60">
                {recipient.designation || "Student"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div
        className="relative z-10 flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-[#020308]/80 custom-scrollbar transition-colors duration-300"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        <AnimatePresence>
          {chat.map((msg, i) => {
            const isMe = msg.sender?._id === user._id;
            const messageId = msg._id || i;
            const messageReactions = reactions[messageId] || [];

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`relative px-3 py-2.5 md:px-4 md:py-3 rounded-2xl text-xs md:text-sm leading-relaxed break-words transition-all duration-300 shadow-md shadow-black/60 ${
                      isMe ? "rounded-br-md" : "rounded-bl-md"
                    }`}
                    style={{
                      background: isMe
                        ? `linear-gradient(135deg, ${CC_BLUE}, ${CC_GREEN})`
                        : `linear-gradient(135deg, rgba(15,23,42,0.95), rgba(71,144,253,0.35))`,
                      border: isMe
                        ? "none"
                        : "1px solid rgba(148, 163, 184, 0.35)",
                      color: "#f9fafb",
                    }}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                      <span className="text-[10px] md:text-[11px] text-slate-200/80">
                        {dayjs(msg.timestamp).format("h:mm A")}
                      </span>
                    </div>

                    {/* Reactions Display */}
                    {messageReactions.length > 0 && (
                      <div className="absolute -bottom-3 right-3 flex bg-black/80 rounded-full px-1.5 py-0.5 shadow-md border border-white/20 scale-75 md:scale-90">
                        {messageReactions.map((r, idx) => (
                          <span key={idx} className="text-sm">
                            {r.reaction}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative z-20 border-t border-white/10 bg-black/90 px-3 py-2.5 md:px-4 md:py-3 transition-colors duration-300">
        {/* File preview */}
        {selectedFile && (
          <div className="px-3 py-2 bg-black/80 border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {previewUrl === "video" ? (
                  <div className="w-12 h-12 bg-[#c76191]/20 rounded-lg flex items-center justify-center border border-[#c76191]/30">
                    <svg
                      className="w-6 h-6 text-[#c76191]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                ) : previewUrl === "document" ? (
                  <div className="w-12 h-12 bg-[#ece239]/20 rounded-lg flex items-center justify-center border border-[#ece239]/30">
                    <svg
                      className="w-6 h-6 text-[#ece239]"
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
                  </div>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-white/10"
                  />
                ) : (
                  <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                    <svg
                      className="w-6 h-6 text-white/50"
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
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-xs md:text-sm font-medium text-white truncate block">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-white/60">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="text-white/60 hover:text-white text-sm px-2 py-1 rounded-full hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <div className="flex items-end gap-2 relative max-w-4xl mx-auto w-full">
          <button
            className="p-2 md:p-2.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all duration-300"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {showEmojiPicker && (
            <div
              className="absolute bottom-16 left-0 z-50 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden border border-white/10 bg-black/95 animate-fadeIn"
              ref={emojiPickerRef}
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme="auto"
                lazyLoadEmojis={true}
                searchPlaceHolder="Search emoji..."
                width={300}
                height={400}
              />
            </div>
          )}

          {/* Attachment button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
              className="p-2 md:p-2.5 text-white/60 hover:text-white rounded-full hover:bg-white/10 border border-white/10 hover:border-white/40 transition-all duration-300"
              title="Attach"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
            {attachmentMenuOpen && (
              <div className="absolute bottom-14 left-0 bg-black/95 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.9)] p-2 border border-white/10 z-50">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      // Set accept attribute for images and videos only
                      fileInputRef.current.accept = "image/*,video/*";
                      fileInputRef.current.click();
                      setAttachmentMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded-lg w-full text-xs text-white"
                  >
                    <svg
                      className="w-4 h-4 text-[#4790fd]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Photo & Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Set accept attribute for documents only
                      fileInputRef.current.accept = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain";
                      fileInputRef.current.click();
                      setAttachmentMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded-lg w-full text-xs text-white"
                  >
                    <svg
                      className="w-4 h-4 text-[#ece239]"
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
                    <span>Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Set accept attribute for audio files
                      fileInputRef.current.accept = "audio/*";
                      fileInputRef.current.click();
                      setAttachmentMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded-lg w-full text-xs text-white"
                  >
                    <svg
                      className="w-4 h-4 text-[#c76191]"
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
                    <span>Audio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Reset to accept all file types
                      fileInputRef.current.accept = "image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,audio/*";
                      fileInputRef.current.click();
                      setAttachmentMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded-lg w-full text-xs text-white"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    <span>Any File</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 bg-white/5 rounded-3xl flex items-center border border-white/10 focus-within:border-[#4790fd]/70 focus-within:ring-2 focus-within:ring-[#4790fd]/30 transition-all duration-300">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (!isTyping) {
                  setIsTyping(true);
                  socket.emit("typing", { roomId, isTyping: true });
                }
                if (e.target.value === "") {
                  setIsTyping(false);
                  socket.emit("typing", { roomId, isTyping: false });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="w-full bg-transparent text-white p-2.5 md:p-3.5 max-h-32 min-h-[44px] focus:outline-none resize-none custom-scrollbar text-sm md:text-base placeholder:text-white/40"
              rows={1}
            />
          </div>

          <button
            className={`p-2.5 md:p-3 rounded-full transition-all duration-300 shadow-lg ${
              (message.trim() || selectedFile)
                ? "text-white hover:scale-105 active:scale-95"
                : "text-white/30 cursor-not-allowed"
            }`}
            onClick={sendMessage}
            disabled={!(message.trim() || selectedFile)}
            style={{
              background: (message.trim() || selectedFile)
                ? `linear-gradient(135deg, ${CC_BLUE}, ${CC_GREEN})`
                : "rgba(15,23,42,0.9)",
            }}
          >
            <Send className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setSelectedFile(file);
            // Handle different file types for preview
            if (file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = () => setPreviewUrl(reader.result);
              reader.readAsDataURL(file);
            } else if (file.type.startsWith("video/")) {
              // For videos, we'll show a video icon preview
              setPreviewUrl("video");
            } else {
              // For documents and other files, show file icon
              setPreviewUrl("document");
            }
          }
        }}
        className="hidden"
        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,audio/*"
      />
    </div>
  );
};

export default ChatWindow;
