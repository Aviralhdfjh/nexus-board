"use client";

import { useRef, useEffect, useState } from "react";
import { MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";

export type ChatMessage = {
  id: string;
  username: string;
  color: string;
  text: string;
  timestamp: number;
};

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  myId: string | null;
  darkMode?: boolean;
}

const MAX_MESSAGES = 200;

export default function ChatPanel({ messages, onSend, myId, darkMode = false }: ChatPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputRef.current?.value?.trim();
    if (!raw) return;
    onSend(raw);
    inputRef.current!.value = "";
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        title="Chat"
        className={`absolute bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border px-3 py-2 shadow-lg backdrop-blur-xl transition-all hover:scale-105 ${
          darkMode
            ? "border-white/10 bg-neutral-900/90 text-neutral-100 hover:bg-neutral-800/95"
            : "border-white/50 bg-white/90 text-gray-800 hover:bg-white"
        }`}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Chat</span>
        {messages.length > 0 && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              darkMode ? "bg-white/15" : "bg-gray-100 text-gray-600"
            }`}
          >
            {messages.length}
          </span>
        )}
        <ChevronUp className="h-4 w-4 opacity-60" />
      </button>
    );
  }

  return (
    <div
      className={`absolute bottom-4 right-4 z-50 flex w-80 flex-col rounded-2xl border shadow-xl backdrop-blur-xl transition-all ${
        darkMode
          ? "border-white/10 bg-neutral-900/90 text-neutral-100"
          : "border-white/50 bg-white/95 text-gray-800"
      }`}
    >
      <div
        className={`flex items-center gap-2 border-b px-3 py-2.5 ${
          darkMode ? "border-white/10" : "border-gray-100"
        }`}
      >
        <MessageCircle className={`h-4 w-4 ${darkMode ? "text-neutral-400" : "text-gray-500"}`} />
        <span className="text-sm font-semibold">Chat</span>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Minimize"
          className={`ml-auto rounded-lg p-1.5 transition ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={listRef}
        className="flex max-h-64 min-h-36 flex-col gap-2 overflow-y-auto p-3"
      >
        {messages.length === 0 ? (
          <p className={`py-6 text-center text-xs ${darkMode ? "text-neutral-500" : "text-gray-400"}`}>
            No messages yet. Say something!
          </p>
        ) : (
          messages.slice(-MAX_MESSAGES).map((msg, i) => (
            <div
              key={`${msg.id}-${msg.timestamp}-${i}`}
              className={`rounded-xl px-3 py-2 ${darkMode ? "hover:bg-white/5" : "hover:bg-gray-50/80"}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: msg.color }}
                />
                <span className={`text-xs font-semibold ${darkMode ? "text-neutral-300" : "text-gray-600"}`}>
                  {msg.id === myId ? `${msg.username} (you)` : msg.username}
                </span>
                <span className={`text-[10px] ${darkMode ? "text-neutral-500" : "text-gray-400"}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className={`mt-1 break-words pl-5 text-sm ${darkMode ? "text-neutral-200" : "text-gray-800"}`}>
                {msg.text}
              </p>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className={`flex gap-2 border-t p-3 ${darkMode ? "border-white/10" : "border-gray-100"}`}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none transition placeholder:opacity-70 ${
            darkMode
              ? "border-white/15 bg-white/5 text-white placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              : "border-gray-200 bg-gray-50/80 text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
          }`}
          maxLength={500}
        />
        <button
          type="submit"
          title="Send"
          className="rounded-xl bg-blue-500 p-2.5 text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-600 active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
