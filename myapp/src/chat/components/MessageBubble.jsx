import { Check, CheckCheck } from "lucide-react";

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

export default function MessageBubble({ message, isOwnMessage }) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[82%] sm:px-4 ${
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
        <p className="whitespace-pre-wrap break-words text-[13px] leading-6 sm:text-sm">
          {message.content}
        </p>

        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-white/65">
          <span>{formatTime(message.createdAt)}</span>
          {isOwnMessage && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}
