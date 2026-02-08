"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import Toolbar from "@/components/Toolbar";
import ActiveUsersPanel from "@/components/ActiveUsersPanel";
import ChatPanel, { ChatMessage } from "@/components/ChatPanel";
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
  const socket = useSocket();

  /* -------- UI State -------- */
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#3b82f6");
  const [width, setWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [style, setStyle] = useState<StrokeStyle>("solid");
  const [fillShapes, setFillShapes] = useState(false);
  const [dark, setDark] = useState(false);
  const [connected, setConnected] = useState(false);

  /* -------- Presence -------- */
  const [users, setUsers] = useState<Record<string, { username: string; color: string }>>({});
  const [myId, setMyId] = useState<string | null>(null);

  /* -------- Chat -------- */
  const [chat, setChat] = useState<ChatMessage[]>([]);

  /* -------- Drawing Engine -------- */
  const drawing = useRef(false);
  const prev = useRef({ x: 0, y: 0 });
  const shapeStart = useRef<{ x: number; y: number } | null>(null);
  const snapshot = useRef<ImageData | null>(null);
  const undo = useRef<ImageData[]>([]);
  const redo = useRef<ImageData[]>([]);
  const bg = useRef("#f0f2f5");

  /* -------- Cursors -------- */
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({});
  const cursorRAF = useRef<number | null>(null);

  /* ================= THEME ================= */

  useEffect(() => {
    const saved = localStorage.getItem("nexus-dark");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(saved ? saved === "true" : prefers);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("nexus-dark", String(dark));
    bg.current = dark ? "#0a0a0a" : "#f0f2f5";
  }, [dark]);

  /* ================= CANVAS INIT ================= */

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
  }, []);

  /* ================= DRAW ================= */

  const draw = useCallback((d: DrawEvent) => {
    const ctx = ctxRef.current!;
    ctx.save();

    if (d.tool === "eraser") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = bg.current;
      ctx.lineWidth = Math.max(d.width, 16);
    } else {
      ctx.strokeStyle = d.color;
      ctx.globalAlpha = d.opacity ?? 1;
      ctx.lineWidth = d.width;
      ctx.setLineDash(d.strokeStyle === "dashed" ? [8, 6] : []);
    }

    if (d.tool === "rectangle") {
      ctx.strokeRect(d.prevX, d.prevY, d.x - d.prevX, d.y - d.prevY);
    } else if (d.tool === "circle") {
      ctx.beginPath();
      ctx.arc(d.prevX, d.prevY, Math.hypot(d.x - d.prevX, d.y - d.prevY), 0, Math.PI * 2);
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

  /* ================= POINTER ================= */

  const pos = (x: number, y: number): [number, number] => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return [
      (x - r.left) * (c.width / r.width),
      (y - r.top) * (c.height / r.height),
    ];
  };

  const pointerDown = (x: number, y: number) => {
    prev.current = { x, y };
    drawing.current = true;

    if (tool === "text") {
      const text = prompt("Enter text");
      if (!text) return;
      snapshot.current = ctxRef.current!.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      const data: DrawEvent = { prevX: x, prevY: y, x, y, color, width, tool: "text", text };
      draw(data);
      socket.current?.emit("draw-event", data);
      return;
    }

    if (SHAPE_TOOLS.includes(tool)) {
      shapeStart.current = { x, y };
      snapshot.current = ctxRef.current!.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    }
  };

  const pointerMove = (x: number, y: number) => {
    if (!drawing.current) return;

    if (!SHAPE_TOOLS.includes(tool)) {
      const data: DrawEvent = {
        prevX: prev.current.x,
        prevY: prev.current.y,
        x,
        y,
        color,
        width,
        tool,
        opacity,
        strokeStyle: style,
      };
      draw(data);
      socket.current?.emit("draw-event", data);
      prev.current = { x, y };
    } else if (snapshot.current && shapeStart.current) {
      ctxRef.current!.putImageData(snapshot.current, 0, 0);
      draw({ prevX: shapeStart.current.x, prevY: shapeStart.current.y, x, y, color, width, tool, opacity, strokeStyle: style });
    }
  };

  const pointerUp = (x: number, y: number) => {
    if (!drawing.current) return;
    drawing.current = false;

    if (shapeStart.current) {
      const data: DrawEvent = { prevX: shapeStart.current.x, prevY: shapeStart.current.y, x, y, color, width, tool, opacity, strokeStyle: style };
      draw(data);
      socket.current?.emit("draw-event", data);
      
      // Save state for undo
      const currentState = ctxRef.current!.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      undo.current.push(currentState);
      if (undo.current.length > UNDO_LIMIT) {
        undo.current.shift();
      }
      redo.current = [];
    } else if (tool !== "text") {
      // Save state for non-shape tools too
      const currentState = ctxRef.current!.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      undo.current.push(currentState);
      if (undo.current.length > UNDO_LIMIT) {
        undo.current.shift();
      }
      redo.current = [];
    }

    shapeStart.current = null;
    snapshot.current = null;
  };

  /* ================= UNDO/REDO ================= */

  const handleUndo = useCallback(() => {
    if (undo.current.length === 0) return;

    const currentState = ctxRef.current!.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    redo.current.push(currentState);

    const previousState = undo.current.pop()!;
    ctxRef.current!.putImageData(previousState, 0, 0);

    socket.current?.emit("canvas-state", {
      imageData: previousState,
    });
  }, []);

  const handleRedo = useCallback(() => {
    if (redo.current.length === 0) return;

    const currentState = ctxRef.current!.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    undo.current.push(currentState);

    const nextState = redo.current.pop()!;
    ctxRef.current!.putImageData(nextState, 0, 0);

    socket.current?.emit("canvas-state", {
      imageData: nextState,
    });
  }, []);

  /* ================= SOCKET ================= */

  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    s.on("connect", () => {
      setConnected(true);
      setMyId(s.id ?? null);
    });
    s.on("disconnect", () => setConnected(false));
    s.on("draw-event", (d: DrawEvent) => requestAnimationFrame(() => draw(d)));
    s.on("cursor-move", (d) =>
      setCursors((p) => ({ ...p, [d.id]: { ...d, lastSeen: Date.now() } }))
    );
    s.on("cursor-remove", (id) => setCursors((p) => { const n = { ...p }; delete n[id]; return n; }));
    s.on("presence", (d) => {
      const map: typeof users = {};
      d.users.forEach((u: any) => (map[u.id] = { username: u.username, color: u.color }));
      setUsers(map);
    });
    s.on("chat-message", (m: ChatMessage) =>
      setChat((p) => [...p.slice(-CHAT_MAX + 1), m])
    );

    return () => {
      s.off("draw-event");
      s.off("cursor-move");
      s.off("cursor-remove");
      s.off("presence");
      s.off("chat-message");
    };
  }, [draw, socket]);

  /* ================= RENDER ================= */

  return (
    <div className={`relative h-full w-full ${dark ? "bg-neutral-950" : "bg-[#f0f2f5]"}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair touch-none"
        onMouseDown={(e) => { const [x, y] = pos(e.clientX, e.clientY); pointerDown(x, y); }}
        onMouseMove={(e) => { const [x, y] = pos(e.clientX, e.clientY); pointerMove(x, y); }}
        onMouseUp={(e) => { const [x, y] = pos(e.clientX, e.clientY); pointerUp(x, y); }}
        onMouseLeave={() => { drawing.current = false; shapeStart.current = null; snapshot.current = null; }}
      />

      <ActiveUsersPanel users={users} myId={myId} darkMode={dark} />
      <ChatPanel messages={chat} onSend={(t) => socket.current?.emit("chat-message", t)} myId={myId} darkMode={dark} />

      {Object.entries(cursors).map(([id, c]) =>
        Date.now() - c.lastSeen < CURSOR_TTL && (
          <div key={id} className="pointer-events-none absolute z-40" style={{ transform: `translate(${c.x}px, ${c.y}px)` }}>
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
        strokeStyle={style}
        fillShapes={fillShapes}
        onFillToggle={() => setFillShapes((f) => !f)}
        onToolChange={setTool}
        onColorChange={setColor}
        onStrokeWidthChange={setWidth}
        onOpacityChange={setOpacity}
        onStrokeStyleChange={setStyle}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportPNG={() => {
          const a = document.createElement("a");
          a.href = canvasRef.current!.toDataURL();
          a.download = "nexus-board.png";
          a.click();
        }}
        onClear={() => {
          ctxRef.current?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          undo.current = [];
          redo.current = [];
          socket.current?.emit("clear-board");
        }}
        canUndo={undo.current.length > 0}
        canRedo={redo.current.length > 0}
        isConnected={connected}
        darkMode={dark}
        onToggleDark={() => setDark((d) => !d)}
      />
    </div>
  );
}
