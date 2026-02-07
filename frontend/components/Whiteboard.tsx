"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSocket } from "@/hooks/useSocket";
import Toolbar from "@/components/Toolbar";
import ActiveUsersPanel from "@/components/ActiveUsersPanel";
import ChatPanel, { type ChatMessage } from "@/components/ChatPanel";
import type { Tool, StrokeStyle } from "@/types";

/* ================= CONSTANTS ================= */

const SHAPE_TOOLS: Tool[] = ["rectangle", "circle", "line", "arrow"];
const UNDO_LIMIT = 30;
const CHAT_MAX = 200;

/* ================= TYPES ================= */

type DrawEvent = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  color: string;
  width: number;
  tool: Tool;
  opacity?: number;
  strokeStyle?: StrokeStyle;
};

type RemoteCursor = {
  x: number;
  y: number;
  color: string;
  username: string;
  lastSeen: number;
};

/* ================= COMPONENT ================= */

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const socketRef = useSocket();

  /* -------- UI State -------- */
  const [currentTool, setCurrentTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#3b82f6");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
  const [isConnected, setIsConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  /* -------- Drawing Internals -------- */
  const drawingRef = useRef(false);
  const prevPos = useRef({ x: 0, y: 0 });
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);
  const hasDrawnRef = useRef(false);

  /* -------- Undo / Redo -------- */
  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  /* -------- Presence -------- */
  const [activeUsers, setActiveUsers] = useState<
    Record<string, { username: string; color: string }>
  >({});
  const [myId, setMyId] = useState<string | null>(null);

  /* -------- Remote Cursors -------- */
  const [remoteCursors, setRemoteCursors] = useState<
    Record<string, RemoteCursor>
  >({});
  const lastCursorEmit = useRef(0);

  /* -------- Chat -------- */
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  /* ================= DARK MODE ================= */

  useEffect(() => {
    const saved = localStorage.getItem("nexus-dark");
    if (saved) setDarkMode(saved === "true");
    else setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    localStorage.setItem("nexus-dark", String(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* ================= SOCKET STATUS ================= */

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onConnect = () => {
      setIsConnected(true);
      setMyId(socket.id ?? null);
    };
    const onDisconnect = () => {
      setIsConnected(false);
      setMyId(null);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socketRef]);

  /* ================= USERNAME INIT ================= */

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    let name = localStorage.getItem("nexus-username");
    if (!name) {
      name = prompt("Enter your name") || "Anonymous";
      localStorage.setItem("nexus-username", name);
    }

    const send = () => socket.emit("set-username", name);
    send();
    socket.on("connect", send);

    return () => {
      socket.off("connect", send);
    };
  }, [socketRef]);

  /* ================= CANVAS INIT ================= */

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
  }, []);

  /* ================= DRAW CORE ================= */

  const drawLine = useCallback((d: DrawEvent) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.globalCompositeOperation =
      d.tool === "eraser" ? "destination-out" : "source-over";

    ctx.strokeStyle = d.tool === "eraser" ? "#000" : d.color;
    ctx.globalAlpha = d.opacity ?? 1;
    ctx.lineWidth = d.width;
    ctx.setLineDash(d.strokeStyle === "dashed" ? [8, 6] : []);

    if (d.tool === "rectangle") {
      ctx.strokeRect(d.prevX, d.prevY, d.x - d.prevX, d.y - d.prevY);
    } else if (d.tool === "circle") {
      ctx.beginPath();
      ctx.arc(d.prevX, d.prevY, Math.hypot(d.x - d.prevX, d.y - d.prevY), 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(d.prevX, d.prevY);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.globalCompositeOperation = "source-over";
  }, []);

  /* ================= HELPERS ================= */

  const getPos = (clientX: number, clientY: number) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: (clientX - r.left) * (c.width / r.width),
      y: (clientY - r.top) * (c.height / r.height),
    };
  };

  const emitCursor = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastCursorEmit.current > 16) {
      socketRef.current?.emit("cursor-move", { x, y });
      lastCursorEmit.current = now;
    }
  };

  /* ================= MOUSE EVENTS ================= */

  const handleDown = (x: number, y: number) => {
    prevPos.current = { x, y };
    drawingRef.current = true;
    hasDrawnRef.current = false;

    if (SHAPE_TOOLS.includes(currentTool)) {
      shapeStartRef.current = { x, y };
      snapshotRef.current = ctxRef.current!.getImageData(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );
    }
  };

  const handleMove = (x: number, y: number) => {
    emitCursor(x, y);
    if (!drawingRef.current) return;

    if (!hasDrawnRef.current) {
      undoStack.current.push(
        ctxRef.current!.getImageData(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        )
      );
      if (undoStack.current.length > UNDO_LIMIT) undoStack.current.shift();
      redoStack.current = [];
      setCanUndo(true);
      setCanRedo(false);
      hasDrawnRef.current = true;
    }

    if (!SHAPE_TOOLS.includes(currentTool)) {
      const data: DrawEvent = {
        prevX: prevPos.current.x,
        prevY: prevPos.current.y,
        x,
        y,
        color,
        width: strokeWidth,
        tool: currentTool,
        opacity,
        strokeStyle,
      };
      drawLine(data);
      socketRef.current?.emit("draw-event", data);
      prevPos.current = { x, y };
    }
  };

  const handleUp = (x: number, y: number) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    if (shapeStartRef.current) {
      const s = shapeStartRef.current;
      const data: DrawEvent = {
        prevX: s.x,
        prevY: s.y,
        x,
        y,
        color,
        width: strokeWidth,
        tool: currentTool,
        opacity,
        strokeStyle,
      };
      drawLine(data);
      socketRef.current?.emit("draw-event", data);
    }

    shapeStartRef.current = null;
    snapshotRef.current = null;
  };

  /* ================= SOCKET EVENTS ================= */

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on("draw-event", drawLine);
    socket.on("cursor-move", (d) =>
      setRemoteCursors((p) => ({
        ...p,
        [d.id]: {
          x: d.x,
          y: d.y,
          color: d.color,
          username: d.username,
          lastSeen: Date.now(),
        },
      }))
    );
    socket.on("cursor-remove", (id) =>
      setRemoteCursors((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      })
    );
    socket.on("presence", (d) => {
      const map: typeof activeUsers = {};
      d.users.forEach((u: any) => (map[u.id] = { username: u.username, color: u.color }));
      setActiveUsers(map);
    });
    socket.on("user-left", ({ id }) =>
      setActiveUsers((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      })
    );
    socket.on("chat-message", (m: ChatMessage) =>
      setChatMessages((p) => [...p.slice(-CHAT_MAX + 1), m])
    );

    return () => {
      socket.removeAllListeners();
    };
  }, [drawLine, socketRef]);

  /* ================= RENDER ================= */

  return (
    <div className={`relative h-full w-full ${darkMode ? "bg-neutral-900" : "bg-gray-50"}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair touch-none"
        onMouseDown={(e) => {
          const pos = getPos(e.clientX, e.clientY);
          handleDown(pos.x, pos.y);
        }}
        onMouseMove={(e) => {
          const pos = getPos(e.clientX, e.clientY);
          handleMove(pos.x, pos.y);
        }}
        onMouseUp={(e) => {
          const pos = getPos(e.clientX, e.clientY);
          handleUp(pos.x, pos.y);
        }}
      />

      <ActiveUsersPanel users={activeUsers} myId={myId} />
      <ChatPanel messages={chatMessages} onSend={(t) => socketRef.current?.emit("chat-message", t)} myId={myId} />

      {Object.entries(remoteCursors).map(
        ([id, c]) =>
          Date.now() - c.lastSeen < 1500 && (
            <div
              key={id}
              className="pointer-events-none absolute z-40"
              style={{ transform: `translate(${c.x}px, ${c.y}px)` }}
            >
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="ml-1 rounded px-1 text-[10px] text-white" style={{ backgroundColor: c.color }}>
                {c.username}
              </span>
            </div>
          )
      )}

      <Toolbar
        currentTool={currentTool}
        color={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
        strokeStyle={strokeStyle}
        onToolChange={setCurrentTool}
        onColorChange={setColor}
        onStrokeWidthChange={setStrokeWidth}
        onOpacityChange={setOpacity}
        onStrokeStyleChange={setStrokeStyle}
        onUndo={() => {}}
        onRedo={() => {}}
        onExportPNG={() => {
          const a = document.createElement("a");
          a.href = canvasRef.current!.toDataURL();
          a.download = "nexus-board.png";
          a.click();
        }}
        onClear={() => socketRef.current?.emit("clear-board")}
        canUndo={canUndo}
        canRedo={canRedo}
        isConnected={isConnected}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />
    </div>
  );
}
