"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import Toolbar from "@/components/Toolbar";
import ActiveUsersPanel from "@/components/ActiveUsersPanel";
import ChatPanel, { type ChatMessage } from "@/components/ChatPanel";
import type { Tool, StrokeStyle } from "@/types";

/* ================= CONFIG ================= */
const SHAPE_TOOLS: Tool[] = ["rectangle", "circle", "line", "arrow"];
const UNDO_LIMIT = 20; // Reduced for memory efficiency
const CURSOR_TTL = 1500;
const CURSOR_EMIT_MS = 40;

export default function OptimizedWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useSocket();

  /* ---------- STATE ---------- */
  const [settings, setSettings] = useState({
    tool: "pencil" as Tool,
    color: "#3b82f6",
    width: 2,
    opacity: 1,
    strokeStyle: "solid" as StrokeStyle,
    fillShapes: false,
    dark: false,
    showMinimap: true,
    gridMode: "dots" as "solid" | "dots" | "lines"
  });

  const [presence, setPresence] = useState({
    users: {} as Record<string, any>,
    cursors: {} as Record<string, any>,
    chat: [] as ChatMessage[],
    myId: null as string | null,
    connected: false
  });

  /* ---------- REFS FOR PERFORMANCE ---------- */
  const drawing = useRef(false);
  const prevPos = useRef({ x: 0, y: 0 });
  const shapeStart = useRef<{ x: number; y: number } | null>(null);
  const previewSnapshot = useRef<ImageData | null>(null);
  const history = useRef<{ undo: ImageData[], redo: ImageData[] }>({ undo: [], redo: [] });
  const bgColor = useRef("#f0f2f5");
  const cursorEmitTs = useRef(0);

  /* ================= UTILS ================= */

  const updateMinimap = useCallback(() => {
    if (!settings.showMinimap || !canvasRef.current || !minimapRef.current) return;
    const miniCtx = minimapRef.current.getContext("2d");
    if (miniCtx) {
      miniCtx.clearRect(0, 0, 220, 140);
      miniCtx.drawImage(canvasRef.current, 0, 0, 220, 140);
    }
  }, [settings.showMinimap]);

  const getPosFromClient = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const saveHistory = () => {
    const ctx = ctxRef.current;
    if (!ctx || !canvasRef.current) return;
    history.current.undo.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    if (history.current.undo.length > UNDO_LIMIT) history.current.undo.shift();
    history.current.redo = [];
  };

  /* ================= ENGINE ================= */

  const draw = useCallback((d: any) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = d.tool === "eraser" ? bgColor.current : d.color;
    ctx.lineWidth = d.tool === "eraser" ? Math.max(d.width, 20) : d.width;
    ctx.globalAlpha = d.tool === "eraser" ? 1 : (d.opacity ?? 1);
    ctx.setLineDash(d.strokeStyle === "dashed" ? [8, 6] : []);

    if (d.tool === "rectangle") {
      if (d.fill) {
        ctx.fillStyle = d.color;
        ctx.fillRect(d.prevX, d.prevY, d.x - d.prevX, d.y - d.prevY);
      } else {
        ctx.strokeRect(d.prevX, d.prevY, d.x - d.prevX, d.y - d.prevY);
      }
    } else if (d.tool === "circle") {
      ctx.beginPath();
      ctx.arc(d.prevX, d.prevY, Math.hypot(d.x - d.prevX, d.y - d.prevY), 0, Math.PI * 2);
      if (d.fill) {
        ctx.fillStyle = d.color;
        ctx.fill();
      } else {
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(d.prevX, d.prevY);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }
    ctx.restore();
    updateMinimap();
  }, [updateMinimap]);

  /* ================= SOCKETS ================= */

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handlers = {
      connect: () => setPresence(p => ({ ...p, connected: true, myId: s.id ?? null })),
      "draw-event": draw,
      "cursor-move": (d: any) => setPresence(p => ({ ...p, cursors: { ...p.cursors, [d.id]: { ...d, lastSeen: Date.now() } } })),
      presence: (d: any) => {
        const map: any = {};
        d.users.forEach((u: any) => map[u.id] = u);
        setPresence(p => ({ ...p, users: map }));
      },
      "user-updated": (u: any) =>
        setPresence((p) => ({
          ...p,
          users: { ...p.users, [u.id]: { username: u.username, color: u.color } },
        })),
      "cursor-remove": (id: string) =>
        setPresence((p) => {
          const next = { ...p.cursors };
          delete next[id];
          return { ...p, cursors: next };
        }),
      "chat-message": (m: ChatMessage) =>
        setPresence((p) => ({ ...p, chat: [...p.chat.slice(-199), m] })),
      disconnect: () => setPresence((p) => ({ ...p, connected: false })),
    };

    Object.entries(handlers).forEach(([ev, fn]) => s.on(ev, fn));
    return () => { s.removeAllListeners(); };
  }, [draw, socketRef]);

  /* ================= INIT ================= */

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d"); // keep alpha so background overlay stays consistent
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
    }
  }, []);

  // Keep eraser background color in sync with theme
  useEffect(() => {
    bgColor.current = settings.dark ? "#020617" : "#f0f2f5"; // match neutral-950 vs light board
  }, [settings.dark]);

  // Resize handling: preserve current drawing on rotate/resize
  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const oldW = canvas.width;
      const oldH = canvas.height;
      if (!oldW || !oldH) return;

      // Buffer old content
      const buffer = document.createElement("canvas");
      buffer.width = oldW;
      buffer.height = oldH;
      const bctx = buffer.getContext("2d");
      if (bctx) bctx.drawImage(canvas, 0, 0);

      // Resize main canvas (resets context state)
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;

      // Redraw old content without scaling (top-left anchored)
      ctx.drawImage(buffer, 0, 0);

      // History snapshots no longer match dimensions; clear to avoid corrupt undo/redo
      history.current.undo = [];
      history.current.redo = [];

      updateMinimap();
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateMinimap]);

  // Stable callbacks to reduce Toolbar rerenders
  const onToolChange = useCallback((tool: Tool) => setSettings((s) => ({ ...s, tool })), []);
  const onColorChange = useCallback((color: string) => setSettings((s) => ({ ...s, color })), []);
  const onStrokeWidthChange = useCallback((width: number) => setSettings((s) => ({ ...s, width })), []);
  const onOpacityChange = useCallback((opacity: number) => setSettings((s) => ({ ...s, opacity })), []);
  const onToggleDark = useCallback(() => setSettings((s) => ({ ...s, dark: !s.dark })), []);
  const onToggleMinimap = useCallback(() => setSettings((s) => ({ ...s, showMinimap: !s.showMinimap })), []);
  const onGridModeChange = useCallback(
    () =>
      setSettings((s) => ({
        ...s,
        gridMode: s.gridMode === "solid" ? "dots" : s.gridMode === "dots" ? "lines" : "solid",
      })),
    []
  );

  const onUndo = useCallback(() => {
    if (!history.current.undo.length || !ctxRef.current || !canvasRef.current) return;
    history.current.redo.push(ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    ctxRef.current.putImageData(history.current.undo.pop()!, 0, 0);
    updateMinimap();
  }, [updateMinimap]);

  const onRedo = useCallback(() => {
    if (!history.current.redo.length || !ctxRef.current || !canvasRef.current) return;
    history.current.undo.push(ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    ctxRef.current.putImageData(history.current.redo.pop()!, 0, 0);
    updateMinimap();
  }, [updateMinimap]);

  const onClear = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.current.undo = [];
    history.current.redo = [];
    socketRef.current?.emit("clear-board");
    updateMinimap();
  }, [socketRef, updateMinimap]);

  const onExportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "nexus-board.png";
    a.click();
  }, []);

  const onCopyToClipboard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !(navigator as any).clipboard || !(window as any).ClipboardItem) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const item = new (window as any).ClipboardItem({ [blob.type]: blob });
        await (navigator as any).clipboard.write([item]);
      } catch (err) {
        console.error("Copy to clipboard failed", err);
      }
    });
  }, []);

  // Touch helpers
  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const t = e.touches[0];
      if (!t) return;
      const { x, y } = getPosFromClient(t.clientX, t.clientY);
      drawing.current = true;
      prevPos.current = { x, y };
      saveHistory();
      if (SHAPE_TOOLS.includes(settings.tool)) {
        shapeStart.current = { x, y };
        previewSnapshot.current = ctxRef.current!.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      }
    },
    [getPosFromClient, settings.tool]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const t = e.touches[0];
      if (!t) return;
      const { x, y } = getPosFromClient(t.clientX, t.clientY);

      const now = performance.now();
      if (now - cursorEmitTs.current > CURSOR_EMIT_MS) {
        cursorEmitTs.current = now;
        socketRef.current?.emit("cursor-move", { x, y });
      }

      if (!drawing.current) return;

      if (!SHAPE_TOOLS.includes(settings.tool)) {
        const d = { prevX: prevPos.current.x, prevY: prevPos.current.y, x, y, ...settings };
        draw(d);
        socketRef.current?.emit("draw-event", d);
        prevPos.current = { x, y };
      } else if (previewSnapshot.current) {
        ctxRef.current!.putImageData(previewSnapshot.current, 0, 0);
        draw({ prevX: shapeStart.current!.x, prevY: shapeStart.current!.y, x, y, ...settings, fill: settings.fillShapes });
      }
    },
    [draw, getPosFromClient, settings, socketRef]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!drawing.current) return;
      drawing.current = false;

      const t = e.changedTouches[0];
      if (shapeStart.current && t) {
        const { x, y } = getPosFromClient(t.clientX, t.clientY);
        socketRef.current?.emit("draw-event", {
          prevX: shapeStart.current.x,
          prevY: shapeStart.current.y,
          x,
          y,
          ...settings,
          fill: settings.fillShapes,
        });
      }

      shapeStart.current = null;
      previewSnapshot.current = null;
    },
    [getPosFromClient, settings, socketRef]
  );

  return (
    <div className={`relative h-full w-full overflow-hidden ${settings.dark ? "bg-neutral-950" : "bg-[#f0f2f5]"}`}>
      <div className={`absolute inset-0 pointer-events-none z-0 wb-grid-${settings.gridMode}`} />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 touch-none cursor-crosshair"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseDown={(e) => {
          const { x, y } = getPosFromClient(e.clientX, e.clientY);
          drawing.current = true;
          prevPos.current = { x, y };
          saveHistory();
          if (SHAPE_TOOLS.includes(settings.tool)) {
            shapeStart.current = { x, y };
            previewSnapshot.current = ctxRef.current!.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          }
        }}
        onMouseMove={(e) => {
          const { x, y } = getPosFromClient(e.clientX, e.clientY);
          const now = performance.now();
          if (now - cursorEmitTs.current > CURSOR_EMIT_MS) {
            cursorEmitTs.current = now;
            socketRef.current?.emit("cursor-move", { x, y });
          }
          if (!drawing.current) return;
          
          if (!SHAPE_TOOLS.includes(settings.tool)) {
            const d = { prevX: prevPos.current.x, prevY: prevPos.current.y, x, y, ...settings };
            draw(d);
            socketRef.current?.emit("draw-event", d);
            prevPos.current = { x, y };
          } else if (previewSnapshot.current) {
            ctxRef.current!.putImageData(previewSnapshot.current, 0, 0);
            draw({ prevX: shapeStart.current!.x, prevY: shapeStart.current!.y, x, y, ...settings, fill: settings.fillShapes });
          }
        }}
        onMouseUp={(e) => {
          if (!drawing.current) return;
          drawing.current = false;
          if (shapeStart.current) {
            const { x, y } = getPosFromClient(e.clientX, e.clientY);
            socketRef.current?.emit("draw-event", { prevX: shapeStart.current.x, prevY: shapeStart.current.y, x, y, ...settings, fill: settings.fillShapes });
          }
          shapeStart.current = null;
          previewSnapshot.current = null;
        }}
        onMouseLeave={() => {
          drawing.current = false;
          shapeStart.current = null;
          previewSnapshot.current = null;
        }}
      />

      <Toolbar
        currentTool={settings.tool}
        color={settings.color}
        strokeWidth={settings.width}
        opacity={settings.opacity}
        onToolChange={onToolChange}
        onColorChange={onColorChange}
        onStrokeWidthChange={onStrokeWidthChange}
        onOpacityChange={onOpacityChange}
        onClear={onClear}
        onUndo={onUndo}
        onRedo={onRedo}
        onExportPNG={onExportPNG}
        onCopyToClipboard={onCopyToClipboard}
        canUndo={history.current.undo.length > 0}
        canRedo={history.current.redo.length > 0}
        isConnected={presence.connected}
        darkMode={settings.dark}
        onToggleDark={onToggleDark}
        gridMode={settings.gridMode}
        onGridModeChange={onGridModeChange}
        showMinimap={settings.showMinimap}
        onToggleMinimap={onToggleMinimap}
      />

      <ActiveUsersPanel users={presence.users} myId={presence.myId} darkMode={settings.dark} />

      <ChatPanel
        messages={presence.chat}
        onSend={(t) => socketRef.current?.emit("chat-message", t)}
        myId={presence.myId}
        darkMode={settings.dark}
      />
      
      {settings.showMinimap && (
        <canvas ref={minimapRef} width={220} height={140} className="fixed bottom-4 right-4 z-30 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md" />
      )}
    </div>
  );
}