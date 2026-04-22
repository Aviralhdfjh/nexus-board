"use client";

import { useState } from "react";
import { Users, ChevronRight, ChevronLeft } from "lucide-react";

function initialsFromName(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export type ActiveUser = {
  username: string;
  color: string;
};

interface ActiveUsersPanelProps {
  users: Record<string, ActiveUser>;
  myId: string | null;
  darkMode?: boolean;
}

export default function ActiveUsersPanel({ users, myId, darkMode = false }: ActiveUsersPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  const list = Object.entries(users).sort((a, b) => {
    if (a[0] === myId) return -1;
    if (b[0] === myId) return 1;
    return (a[1]?.username || "").localeCompare(b[1]?.username || "");
  });

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        title="Collaborators"
        aria-label="Open collaborators panel"
        aria-pressed={false}
        className={`absolute top-4 right-4 z-50 flex items-center gap-2 rounded-full border px-3 py-2 shadow-lg backdrop-blur-xl transition-all hover:scale-105 ${
          darkMode
            ? "border-white/10 bg-neutral-900/90 text-neutral-100 hover:bg-neutral-800/95"
            : "border-white/50 bg-white/90 text-gray-800 hover:bg-white"
        }`}
      >
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">Collaborators</span>
        <div className="flex -space-x-2">
          {list.slice(0, 3).map(([id, u]) => (
            <span
              key={id}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white/70"
              style={{ backgroundColor: u.color }}
              title={u.username}
            >
              {initialsFromName(u.username)}
            </span>
          ))}
        </div>
        {list.length > 3 && (
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              darkMode ? "bg-white/15 text-neutral-300" : "bg-gray-100 text-gray-600"
            }`}
            title={`${list.length - 3} more`}
          >
            +{list.length - 3}
          </span>
        )}
        <ChevronLeft className="h-4 w-4 opacity-60" />
      </button>
    );
  }

  return (
    <div
      className={`absolute top-4 right-4 z-50 w-52 rounded-2xl border shadow-xl backdrop-blur-xl transition-all ${
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
        <Users className={`h-4 w-4 ${darkMode ? "text-neutral-400" : "text-gray-500"}`} />
        <span className="text-sm font-semibold">Collaborators</span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
            darkMode ? "bg-white/15 text-neutral-300" : "bg-gray-100 text-gray-600"
          }`}
        >
          {list.length}
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Minimize"
          aria-label="Minimize collaborators panel"
          aria-pressed={true}
          className={`rounded-lg p-1.5 transition ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <ul className="max-h-64 overflow-y-auto p-2">
        {list.length === 0 ? (
          <li className={`py-3 text-center text-xs ${darkMode ? "text-neutral-500" : "text-gray-400"}`}>
            No one else here yet
          </li>
        ) : (
          list.map(([id, u]) => (
            <li
              key={id}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
              }`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-transparent"
                style={{
                  backgroundColor: u.color,
                  boxShadow: `0 0 0 1px ${darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
                }}
              />
              <span
                className={`min-w-0 truncate font-medium ${darkMode ? "text-neutral-200" : "text-gray-800"}`}
                title={u.username}
              >
                {id === myId ? `${u.username} (you)` : u.username}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
