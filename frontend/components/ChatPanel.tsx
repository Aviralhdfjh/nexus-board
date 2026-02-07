"use client";

import { useRef, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";

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
}

const MAX_MESSAGES = 200;

export default function ChatPanel({ messages, onSend, myId }: ChatPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="absolute bottom-4 left-4 z-50 flex w-80 flex-col rounded-lg border border-gray-200 bg-white/95 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
        <MessageCircle className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Chat</span>
      </div>

      <div
        ref={listRef}
        className="flex max-h-64 min-h-32 flex-col gap-1 overflow-y-auto p-2"
      >
        {messages.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">
            No messages yet. Say something!
          </p>
        ) : (
          messages.slice(-MAX_MESSAGES).map((msg, i) => (
            <div
              key={`${msg.id}-${msg.timestamp}-${i}`}
              className="rounded-lg px-2 py-1.5"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: msg.color }}
                />
                <span className="text-xs font-medium text-gray-600">
                  {msg.id === myId ? `${msg.username} (you)` : msg.username}
                </span>
                <span className="text-[10px] text-gray-400">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="mt-0.5 break-words pl-4 text-sm text-gray-800">
                {msg.text}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-100 p-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          className="min-w-0 flex-1 rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          maxLength={500}
        />
        <button
          type="submit"
          title="Send"
          className="rounded bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
