"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getTokenForSocket } from "@/lib/sdk/socket-token";

let socket: Socket | null = null;

export function useSocket(options?: { token?: string | null }) {
  const socketRef = useRef<Socket | null>(null);
  const [token, setToken] = useState<string | null>(options?.token ?? null);

  useEffect(() => {
    if (options?.token !== undefined) {
      setToken(options.token);
      return;
    }
    getTokenForSocket().then(setToken);
  }, [options?.token]);

  useEffect(() => {
    if (!token) {
      socketRef.current = null;
      return;
    }
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const s = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      autoConnect: true,
    });
    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });
    s.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
    socketRef.current = s;
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef;
}

/** Legacy: single global socket (unauthenticated). Prefer useSocket() with token for production. */
export function useSocketLegacy() {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    if (!socket) {
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
      socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: Infinity,
        autoConnect: true,
      });
    }
    socketRef.current = socket;
    return () => {};
  }, []);
  return socketRef;
}
