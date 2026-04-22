import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import useChatSocket from "../../hooks/useChatSocket";

export default function ChatPanel({
  currentUser,
  recipient,
  isMobile,
  onBack,
  onConversationUpdate,
}) {
  const {
    connected,
    messages,
    typingLabel,
    recipientPresence,
    sendMessage,
    setTyping,
  } = useChatSocket({
    currentUser,
    recipient,
    onConversationUpdate,
  });

  if (!recipient) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-100 p-4 sm:p-6">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm sm:px-8 sm:py-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl">
            💬
          </div>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Your messages
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pick a conversation from the left to start chatting in real time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#040404]">
      <ChatHeader
        recipient={recipient}
        connected={connected}
        isTyping={Boolean(typingLabel)}
        recipientPresence={recipientPresence}
        isMobile={isMobile}
        onBack={onBack}
      />
      <MessageList
        messages={messages}
        currentUserId={currentUser?._id}
        typingLabel={typingLabel}
      />
      <MessageInput
        disabled={!connected}
        onSendMessage={sendMessage}
        onTyping={setTyping}
      />
    </div>
  );
}
