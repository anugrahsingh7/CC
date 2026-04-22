import { ArrowLeft, Users } from "lucide-react";

export default function ChatHeader({
  recipient,
  connected,
  isTyping,
  recipientPresence,
  isMobile,
  onBack,
}) {
  const isOnline = recipientPresence?.isOnline ?? recipient.status;
  const subtitle = recipient.isGroup
    ? `${recipient.memberCount || recipient.members?.length || 0} members`
    : isTyping
      ? "Typing..."
      : isOnline
        ? "Online"
        : connected
          ? recipient.designation || "Available offline"
          : "Reconnecting...";

  return (
    <div className="sticky top-0 z-20 shrink-0 flex items-center justify-between border-b border-[#4790fd]/20 bg-[#070707]/95 px-3 py-3 backdrop-blur-sm sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        {isMobile && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="relative">
          {recipient.isGroup ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 sm:h-11 sm:w-11">
              <Users className="h-4 w-4" />
            </div>
          ) : (
            <>
              <img
                src={recipient.profileImage || "default-user.jpg"}
                alt={recipient.fullName}
                className="h-10 w-10 rounded-full object-cover sm:h-11 sm:w-11"
              />
              <span
                className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  isOnline ? "bg-[#27dc66]" : "bg-white/30"
                }`}
              />
            </>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-white sm:text-base">
            {recipient.fullName}
          </h2>
          <p className="truncate text-xs text-white/55">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="text-xs font-medium text-white/35">
        {recipient.isGroup ? "Group" : ""}
      </div>
    </div>
  );
}
