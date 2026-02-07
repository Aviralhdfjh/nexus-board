"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket() {
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

      socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });
    }

    socketRef.current = socket;

    // IMPORTANT: do NOT disconnect on unmount
    return () => {};
  }, []);

  return socketRef;
}
