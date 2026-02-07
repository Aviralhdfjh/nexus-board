"use client";

import { Users } from "lucide-react";

export type ActiveUser = {
  username: string;
  color: string;
};

interface ActiveUsersPanelProps {
  users: Record<string, ActiveUser>;
  myId: string | null;
}

export default function ActiveUsersPanel({ users, myId }: ActiveUsersPanelProps) {
  const list = Object.entries(users);

  return (
    <div className="absolute top-4 right-4 z-50 w-48 rounded-lg border border-gray-200 bg-white/95 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
        <Users className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Active users</span>
        <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
          {list.length}
        </span>
      </div>
      <ul className="max-h-64 overflow-y-auto p-2">
        {list.length === 0 ? (
          <li className="py-2 text-center text-xs text-gray-400">No one else here</li>
        ) : (
          list.map(([id, u]) => (
            <li
              key={id}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-gray-200"
                style={{ backgroundColor: u.color }}
              />
              <span
                className="min-w-0 truncate text-gray-800"
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
