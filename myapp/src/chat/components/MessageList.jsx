import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const isSameDay = (firstDate, secondDate) =>
  new Date(firstDate).toDateString() === new Date(secondDate).toDateString();

const formatDayLabel = (date) => {
  const value = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (value.toDateString() === today.toDateString()) return "Today";
  if (value.toDateString() === yesterday.toDateString()) return "Yesterday";

  return value.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function MessageList({
  messages,
  currentUserId,
  typingLabel,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingLabel]);

  const showEmptyState = messages.length === 0 && !typingLabel;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-[#040404] px-3 pb-3 pt-4 sm:px-4 sm:pb-4 sm:pt-5 lg:px-6"
      style={{
        backgroundImage:
          "radial-gradient(circle at top left, rgba(71,144,253,0.12), transparent 25%), radial-gradient(circle at bottom right, rgba(39,220,102,0.1), transparent 22%)",
      }}
    >
      <div
        className={`mx-auto flex w-full max-w-4xl flex-col gap-2 pb-1 sm:gap-2.5 ${
          showEmptyState ? "min-h-full items-center justify-center pb-4" : ""
        }`}
      >
        {showEmptyState && (
          <div className="w-full max-w-md rounded-2xl border border-[#4790fd]/20 bg-[#070707] px-5 py-4 text-center shadow-sm shadow-black/40">
            <p className="text-sm font-medium text-white">No messages yet</p>
            <p className="mt-1 text-xs text-white/60">
              Start the conversation with a quick hello.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const previousMessage = messages[index - 1];
          const showDateDivider =
            index === 0 || !isSameDay(previousMessage.createdAt, message.createdAt);

          return (
            <div key={message._id} className="flex flex-col gap-2">
              {showDateDivider && (
                <div className="flex justify-center py-1">
                  <span className="rounded-full border border-[#ffffff]/10 bg-[#070707]/80 px-3 py-1 text-[11px] font-medium text-white/60">
                    {formatDayLabel(message.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={message}
                isOwnMessage={message.sender?._id === currentUserId}
              />
            </div>
          );
        })}

        {typingLabel && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-[#ffffff]/15 bg-[#070707] px-4 py-3 shadow-sm shadow-black/40">
              <p className="mb-2 text-xs font-medium text-white/60">{typingLabel}</p>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
