import { useEffect, useRef, useState } from "react";
import { Send, Smile } from "lucide-react";

export default function MessageInput({ onSendMessage, onTyping, disabled }) {
  const [message, setMessage] = useState("");
  const textAreaRef = useRef(null);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, [message]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage("");
    onTyping(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-[#4790fd]/20 bg-[#070707] px-3 py-1.5 sm:px-4 sm:py-2"
    >
      <div className="mx-auto flex max-w-4xl items-end gap-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ffffff]/10 text-white/65 transition hover:border-[#4790fd]/50 hover:bg-[#ffffff]/10 hover:text-white sm:h-10 sm:w-10"
          aria-label="Open emoji picker"
          title="Emoji picker placeholder"
        >
          <Smile className="h-4.5 w-4.5" />
        </button>

        <div className="flex-1 rounded-3xl border border-[#ffffff]/10 bg-[#ffffff]/5 px-4 py-1.5 transition focus-within:border-[#4790fd]/50 focus-within:bg-[#ffffff]/10 focus-within:ring-4 focus-within:ring-[#4790fd]/20">
          <textarea
            ref={textAreaRef}
            value={message}
            disabled={disabled}
            rows={1}
            onChange={(event) => {
              const nextValue = event.target.value;
              setMessage(nextValue);
              onTyping(Boolean(nextValue.trim()));
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                handleSubmit(event);
              }
            }}
            placeholder="Type a message"
            className="max-h-36 w-full resize-none bg-transparent text-[13px] leading-5 text-white outline-none placeholder:text-white/35 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4790fd] to-[#27dc66] text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#ffffff]/20 sm:h-10 sm:w-10"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
