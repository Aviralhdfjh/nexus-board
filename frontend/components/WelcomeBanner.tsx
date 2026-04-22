"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export function WelcomeBanner({ name }: { name: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(id);
  }, []);

  if (!visible) return null;

  return (
    <header className="absolute left-4 top-4 z-60 flex items-center gap-3 rounded-xl border border-white/40 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
      <p className="text-sm font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
        Welcome, {name}!
      </p>
      <Link
        href="/boards"
        className="flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-700"
        title="Back to boards"
      >
        <Home className="h-3 w-3" />
        <span>Boards</span>
      </Link>
    </header>
  );
}

