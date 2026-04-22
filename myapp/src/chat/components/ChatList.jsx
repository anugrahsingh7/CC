import { Search, Bell, Users, House } from "lucide-react";

const formatSnippet = (conversation) => {
  if (!conversation?.lastMessage) return conversation.designation || "Start a conversation";
  if (conversation.lastMessage.fileType) {
    return `Shared a ${conversation.lastMessage.fileType}`;
  }
  if (conversation.isGroup && conversation.lastMessage.sender?.fullName) {
    return `${conversation.lastMessage.sender.fullName}: ${conversation.lastMessage.content || "Sent a message"}`;
  }
  return conversation.lastMessage.content || "Sent a message";
};

const formatTime = (date) => {
  if (!date) return "";

  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isToday = messageDate.toDateString() === today.toDateString();
  const isYesterday = messageDate.toDateString() === yesterday.toDateString();

  if (isToday) {
    return messageDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (isYesterday) return "Yesterday";

  return messageDate.toLocaleDateString([], { day: "numeric", month: "short" });
};

export default function ChatList({
  currentUser,
  conversations,
  selectedRecipientId,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  pendingCount,
  onGoNetwork,
  onOpenRequests,
  onCreateGroup,
  onSelectConversation,
}) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-[#070707]">
      <div className="border-b border-[#4790fd]/20 px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.profileImage || currentUser?.imageUrl || "default-user.jpg"}
              alt={currentUser?.fullName || "You"}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-[#4790fd]/30"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                Campus Connect
              </p>
              <h1 className="truncate text-sm font-semibold text-white sm:text-base">
                Messages
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGoNetwork}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ffffff]/10 text-white/70 transition hover:border-[#4790fd]/50 hover:bg-[#ffffff]/10 hover:text-white sm:h-10 sm:w-10"
              aria-label="Go to network"
              title="Go to network"
            >
              <House className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onCreateGroup}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ffffff]/10 text-white/70 transition hover:border-[#4790fd]/50 hover:bg-[#ffffff]/10 hover:text-white sm:h-10 sm:w-10"
              aria-label="Create group"
            >
              <Users className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onOpenRequests}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ffffff]/10 text-white/70 transition hover:border-[#4790fd]/50 hover:bg-[#ffffff]/10 hover:text-white sm:h-10 sm:w-10"
              aria-label="Open connection requests"
            >
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#c76191] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="relative mt-3 sm:mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search chats"
            className="w-full rounded-2xl border border-[#ffffff]/10 bg-[#ffffff]/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#4790fd]/50 focus:bg-[#ffffff]/10 focus:ring-4 focus:ring-[#4790fd]/20"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All" },
            { id: "groups", label: "Groups" },
            { id: "faculty", label: "Faculty" },
            { id: "students", label: "Students" },
          ].map((filter) => {
            const active = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-transparent bg-gradient-to-r from-[#4790fd] to-[#27dc66] text-white"
                    : "border-[#ffffff]/10 bg-[#ffffff]/5 text-white/70 hover:border-[#4790fd]/40 hover:bg-[#ffffff]/10"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 sm:px-3">
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/55">
            No conversations match your search.
          </div>
        ) : (
          conversations.map((conversation) => {
            const isActive = selectedRecipientId === conversation._id;
            return (
              <button
                key={conversation._id}
                type="button"
                onClick={() => onSelectConversation(conversation)}
                className={`relative mb-1.5 flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition sm:px-4 ${
                  isActive
                    ? "border-[#4790fd]/40 bg-[#ffffff]/10 shadow-sm shadow-[#4790fd]/20"
                    : "border-transparent hover:border-[#ffffff]/10 hover:bg-[#ffffff]/5"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#4790fd] to-[#27dc66]" />
                )}
                <div className="relative">
                  {conversation.isGroup ? (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffffff]/10 text-white/70 sm:h-12 sm:w-12">
                      <Users className="h-5 w-5" />
                    </div>
                  ) : (
                    <>
                      <img
                        src={conversation.profileImage || "default-user.jpg"}
                        alt={conversation.fullName}
                        className="h-11 w-11 rounded-full object-cover sm:h-12 sm:w-12"
                      />
                      <span
                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          conversation.status ? "bg-[#27dc66]" : "bg-white/30"
                        }`}
                      />
                    </>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="truncate text-sm font-semibold text-white">
                      {conversation.fullName}
                    </h2>
                    <span className="shrink-0 text-[11px] text-white/40">
                      {formatTime(conversation.lastMessage?.createdAt)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <p className="truncate text-[13px] text-white/60 sm:text-sm">
                      {formatSnippet(conversation)}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-[#4790fd] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
