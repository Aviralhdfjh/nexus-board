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

/* ================= CONFIG ================= */

const SHAPE_TOOLS: Tool[] = ["rectangle", "circle", "line", "arrow"];
const UNDO_LIMIT = 30;
const CHAT_MAX = 200;
const CURSOR_TTL = 1500;

/* ================= TYPES ================= */

type DrawEvent = {
  prevX: number;
  prevY: number;
  x: number;
  y: number;
  color: string;
  width: number;
  tool: Tool;
  opacity?: number;
  strokeStyle?: StrokeStyle;
  text?: string;
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

  /* ---------- UI STATE ---------- */
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#3b82f6");
  const [width, setWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
  const [fillShapes, setFillShapes] = useState(false);
  const [dark, setDark] = useState(false);
  const [connected, setConnected] = useState(false);

  /* ---------- PRESENCE ---------- */
  const [users, setUsers] = useState<
    Record<string, { username: string; color: string }>
  >({});
  const [myId, setMyId] = useState<string | null>(null);

  /* ---------- CHAT ---------- */
  const [chat, setChat] = useState<ChatMessage[]>([]);

  /* ---------- DRAW ENGINE ---------- */
  const drawing = useRef(false);
  const prevPos = useRef({ x: 0, y: 0 });
  const shapeStart = useRef<{ x: number; y: number } | null>(null);
  const previewSnapshot = useRef<ImageData | null>(null);

  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);
  const bgColor = useRef("#f0f2f5");

  /* ---------- CURSORS ---------- */
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({});
  const cursorEmitTs = useRef(0);

  /* ================= THEME ================= */

  useEffect(() => {
    const saved = localStorage.getItem("nexus-dark");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(saved ? saved === "true" : prefers);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nexus-dark", String(dark));
    bgColor.current = dark ? "#0a0a0a" : "#f0f2f5";
  }, [dark]);

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

  const draw = useCallback((d: DrawEvent) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.save();

    if (d.tool === "eraser") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = bgColor.current;
      ctx.lineWidth = Math.max(d.width, 16);
      ctx.globalAlpha = 1;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = d.color;
      ctx.globalAlpha = d.opacity ?? 1;
      ctx.lineWidth = d.width;
      ctx.setLineDash(d.strokeStyle === "dashed" ? [8, 6] : []);
    }

    if (d.tool === "rectangle") {
      ctx.strokeRect(d.prevX, d.prevY, d.x - d.prevX, d.y - d.prevY);
    } else if (d.tool === "circle") {
      ctx.beginPath();
      ctx.arc(
        d.prevX,
        d.prevY,
        Math.hypot(d.x - d.prevX, d.y - d.prevY),
        0,
        Math.PI * 2
      );
      ctx.stroke();
    } else if (d.tool === "text" && d.text) {
      ctx.font = `${Math.max(14, d.width * 8)}px system-ui`;
      ctx.fillStyle = d.color;
      ctx.fillText(d.text, d.prevX, d.prevY);
    } else {
      ctx.beginPath();
      ctx.moveTo(d.prevX, d.prevY);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }

    ctx.restore();
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

  const saveHistory = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    undoStack.current.push(
      ctx.getImageData(0, 0, canvas.width, canvas.height)
    );
    if (undoStack.current.length > UNDO_LIMIT) undoStack.current.shift();
    redoStack.current = [];
  };

  /* ================= POINTER ================= */

  const onDown = (x: number, y: number) => {
    drawing.current = true;
    prevPos.current = { x, y };

    if (tool === "text") {
      const text = prompt("Enter text");
      if (!text) return;
      saveHistory();
      const d: DrawEvent = {
        prevX: x,
        prevY: y,
        x,
        y,
        color,
        width,
        tool: "text",
        text,
      };
      draw(d);
      socketRef.current?.emit("draw-event", d);
      return;
    }

    saveHistory();

    if (SHAPE_TOOLS.includes(tool)) {
      shapeStart.current = { x, y };
      previewSnapshot.current = ctxRef.current!.getImageData(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );
    }
  };

  const onMove = (x: number, y: number) => {
    if (!drawing.current) return;

    if (!SHAPE_TOOLS.includes(tool)) {
      const d: DrawEvent = {
        prevX: prevPos.current.x,
        prevY: prevPos.current.y,
        x,
        y,
        color,
        width,
        tool,
        opacity,
        strokeStyle,
      };
      draw(d);
      socketRef.current?.emit("draw-event", d);
      prevPos.current = { x, y };
    } else if (previewSnapshot.current && shapeStart.current) {
      ctxRef.current!.putImageData(previewSnapshot.current, 0, 0);
      draw({
        prevX: shapeStart.current.x,
        prevY: shapeStart.current.y,
        x,
        y,
        color,
        width,
        tool,
        opacity,
        strokeStyle,
      });
    }
  };

  const onUp = (x: number, y: number) => {
    if (!drawing.current) return;
    drawing.current = false;

    if (shapeStart.current) {
      const d: DrawEvent = {
        prevX: shapeStart.current.x,
        prevY: shapeStart.current.y,
        x,
        y,
        color,
        width,
        tool,
        opacity,
        strokeStyle,
      };
      draw(d);
      socketRef.current?.emit("draw-event", d);
    }

    shapeStart.current = null;
    previewSnapshot.current = null;
  };

  /* ================= UNDO / REDO ================= */

  const undo = () => {
    if (!undoStack.current.length) return;
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    redoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(undoStack.current.pop()!, 0, 0);
  };

  const redo = () => {
    if (!redoStack.current.length) return;
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(redoStack.current.pop()!, 0, 0);
  };

  /* ================= SOCKET ================= */

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    s.on("connect", () => {
      setConnected(true);
      setMyId(s.id ?? null);
    });
    s.on("disconnect", () => setConnected(false));
    s.on("draw-event", draw);
    s.on("cursor-move", (d) =>
      setCursors((p) => ({ ...p, [d.id]: { ...d, lastSeen: Date.now() } }))
    );
    s.on("cursor-remove", (id) =>
      setCursors((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      })
    );
    s.on("presence", (d) => {
      const map: typeof users = {};
      d.users.forEach((u: any) => (map[u.id] = u));
      setUsers(map);
    });
    s.on("chat-message", (m: ChatMessage) =>
      setChat((p) => [...p.slice(-CHAT_MAX + 1), m])
    );

    return () => {
      s.removeAllListeners();
    };
  }, [draw, socketRef]);

  /* ================= RENDER ================= */

  return (
    <div className={`relative h-full w-full ${dark ? "bg-neutral-950" : "bg-[#f0f2f5]"}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none cursor-crosshair"
        onMouseDown={(e) => {
          const p = getPos(e.clientX, e.clientY);
          onDown(p.x, p.y);
        }}
        onMouseMove={(e) => {
          const p = getPos(e.clientX, e.clientY);
          onMove(p.x, p.y);
        }}
        onMouseUp={(e) => {
          const p = getPos(e.clientX, e.clientY);
          onUp(p.x, p.y);
        }}
        onMouseLeave={() => (drawing.current = false)}
      />

      <ActiveUsersPanel users={users} myId={myId} darkMode={dark} />
      <ChatPanel
        messages={chat}
        onSend={(t) => socketRef.current?.emit("chat-message", t)}
        myId={myId}
        darkMode={dark}
      />

      {Object.entries(cursors).map(
        ([id, c]) =>
          Date.now() - c.lastSeen < CURSOR_TTL && (
            <div
              key={id}
              className="pointer-events-none absolute z-40"
              style={{ transform: `translate(${c.x}px, ${c.y}px)` }}
            >
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="rounded px-2 py-0.5 text-xs text-white" style={{ backgroundColor: c.color }}>
                  {c.username}
                </span>
              </div>
            </div>
          )
      )}

      <Toolbar
        currentTool={tool}
        color={color}
        strokeWidth={width}
        opacity={opacity}
        strokeStyle={strokeStyle}
        fillShapes={fillShapes}
        onFillToggle={() => setFillShapes((f) => !f)}
        onToolChange={setTool}
        onColorChange={setColor}
        onStrokeWidthChange={setWidth}
        onOpacityChange={setOpacity}
        onStrokeStyleChange={setStrokeStyle}
        onUndo={undo}
        onRedo={redo}
        onExportPNG={() => {
          const a = document.createElement("a");
          a.href = canvasRef.current!.toDataURL();
          a.download = "nexus-board.png";
          a.click();
        }}
        onClear={() => {
          ctxRef.current?.clearRect(
            0,
            0,
            canvasRef.current!.width,
            canvasRef.current!.height
          );
          undoStack.current = [];
          redoStack.current = [];
          socketRef.current?.emit("clear-board");
        }}
        canUndo={undoStack.current.length > 0}
        canRedo={redoStack.current.length > 0}
        isConnected={connected}
        darkMode={dark}
        onToggleDark={() => setDark((d) => !d)}
      />
    </div>
  );
}
