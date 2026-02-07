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
};

/* ================= COMPONENT ================= */

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const socketRef = useSocket();

  /* -------- UI / Tool State -------- */
  const [currentTool, setCurrentTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
  const [isConnected, setIsConnected] = useState(false);

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

  /* Ref so passive:false touch listeners always call latest handlers */
  const touchHandlersRef = useRef({
    handleTouchStart: (_e: React.TouchEvent<HTMLCanvasElement>) => {},
    handleTouchMove: (_e: React.TouchEvent<HTMLCanvasElement>) => {},
    handleTouchEnd: (_e: React.TouchEvent<HTMLCanvasElement>) => {},
  });

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

    const sendName = () => socket.emit("set-username", name);
    sendName();
    socket.on("connect", sendName);

    return () => {
      socket.off("connect", sendName);
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

  /* ================= DRAW HELPERS ================= */

  const drawArrowHead = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    size: number
  ) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - size * Math.cos(angle - Math.PI / 6),
      toY - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - size * Math.cos(angle + Math.PI / 6),
      toY - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawLine = useCallback((data: DrawEvent) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const {
      prevX,
      prevY,
      x,
      y,
      color,
      width,
      tool,
      opacity = 1,
      strokeStyle = "solid",
    } = data;

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.globalAlpha = 1;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;
    }

    ctx.lineWidth = width;
    ctx.setLineDash(strokeStyle === "dashed" ? [8, 6] : []);

    if (tool === "rectangle") {
      ctx.strokeRect(prevX, prevY, x - prevX, y - prevY);
    } else if (tool === "circle") {
      const r = Math.hypot(x - prevX, y - prevY);
      ctx.beginPath();
      ctx.arc(prevX, prevY, r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === "line" || tool === "arrow") {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (tool === "arrow") {
        drawArrowHead(ctx, prevX, prevY, x, y, Math.min(width * 4, 20));
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.globalCompositeOperation = "source-over";
  }, []);

  const drawFromRemote = useCallback(
    (data: DrawEvent) => requestAnimationFrame(() => drawLine(data)),
    [drawLine]
  );

  /* ================= SOCKET EVENTS ================= */

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on("draw-event", drawFromRemote);
    socket.on("clear-board", () =>
      ctxRef.current?.clearRect(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      )
    );

    socket.on("cursor-move", (d) =>
      setRemoteCursors((p) => ({
        ...p,
        [d.id]: { x: d.x, y: d.y, color: d.color, username: d.username },
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
      const next: typeof activeUsers = {};
      d.users.forEach((u: any) => {
        next[u.id] = { username: u.username, color: u.color };
      });
      setActiveUsers(next);
    });

    socket.on("user-joined", (u) =>
      setActiveUsers((p) => ({ ...p, [u.id]: { username: u.username, color: u.color } }))
    );

    socket.on("user-updated", (u) =>
      setActiveUsers((p) => ({
        ...p,
        [u.id]: { ...p[u.id], username: u.username },
      }))
    );

    socket.on("user-left", ({ id }) =>
      setActiveUsers((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      })
    );

    socket.on("chat-message", (msg: ChatMessage) =>
      setChatMessages((p) =>
        p.length >= CHAT_MAX ? [...p.slice(1), msg] : [...p, msg]
      )
    );

    return () => {
      socket.removeAllListeners();
    };
  }, [drawFromRemote, socketRef]);

  /* ================= HELPERS ================= */

  const getPosFromClient = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    const scaleX = r.width ? canvas.width / r.width : 1;
    const scaleY = r.height ? canvas.height / r.height : 1;
    return {
      x: (clientX - r.left) * scaleX,
      y: (clientY - r.top) * scaleY,
    };
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) =>
    getPosFromClient(e.clientX, e.clientY);

  const emitCursorMove = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastCursorEmit.current > 16) {
      socketRef.current?.emit("cursor-move", { x, y });
      lastCursorEmit.current = now;
    }
  };

  const getDrawOpts = () => ({
    opacity: currentTool === "highlighter" ? Math.min(opacity, 0.5) : opacity,
    strokeStyle,
  });

  /* ================= MOUSE EVENTS ================= */

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    prevPos.current = getPos(e);
    drawingRef.current = true;
    hasDrawnRef.current = false;

    if (SHAPE_TOOLS.includes(currentTool)) {
      shapeStartRef.current = prevPos.current;
      snapshotRef.current = ctxRef.current!.getImageData(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    emitCursorMove(pos.x, pos.y);
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

    const opts = getDrawOpts();

    if (!SHAPE_TOOLS.includes(currentTool)) {
      const data: DrawEvent = {
        prevX: prevPos.current.x,
        prevY: prevPos.current.y,
        x: pos.x,
        y: pos.y,
        color,
        width:
          currentTool === "highlighter"
            ? Math.max(strokeWidth, 8)
            : strokeWidth,
        tool: currentTool,
        ...opts,
      };
      drawLine(data);
      socketRef.current?.emit("draw-event", data);
      prevPos.current = pos;
    }

    if (snapshotRef.current && shapeStartRef.current) {
      ctxRef.current!.putImageData(snapshotRef.current, 0, 0);
      drawLine({
        prevX: shapeStartRef.current.x,
        prevY: shapeStartRef.current.y,
        x: pos.x,
        y: pos.y,
        color,
        width: strokeWidth,
        tool: currentTool,
        ...opts,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    if (shapeStartRef.current) {
      const pos = getPos(e);
      const data: DrawEvent = {
        prevX: shapeStartRef.current.x,
        prevY: shapeStartRef.current.y,
        x: pos.x,
        y: pos.y,
        color,
        width: strokeWidth,
        tool: currentTool,
        ...getDrawOpts(),
      };
      drawLine(data);
      socketRef.current?.emit("draw-event", data);
    }

    shapeStartRef.current = null;
    snapshotRef.current = null;
  };

  /* ================= TOUCH EVENTS (mobile) ================= */

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const pos = getPosFromClient(touch.clientX, touch.clientY);
    prevPos.current = pos;
    drawingRef.current = true;
    hasDrawnRef.current = false;

    if (SHAPE_TOOLS.includes(currentTool)) {
      shapeStartRef.current = pos;
      snapshotRef.current = ctxRef.current!.getImageData(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const pos = getPosFromClient(touch.clientX, touch.clientY);
    emitCursorMove(pos.x, pos.y);
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

    const opts = getDrawOpts();

    if (!SHAPE_TOOLS.includes(currentTool)) {
      const data: DrawEvent = {
        prevX: prevPos.current.x,
        prevY: prevPos.current.y,
        x: pos.x,
        y: pos.y,
        color,
        width:
          currentTool === "highlighter"
            ? Math.max(strokeWidth, 8)
            : strokeWidth,
        tool: currentTool,
        ...opts,
      };
      drawLine(data);
      socketRef.current?.emit("draw-event", data);
      prevPos.current = pos;
    }

    if (snapshotRef.current && shapeStartRef.current) {
      ctxRef.current!.putImageData(snapshotRef.current, 0, 0);
      drawLine({
        prevX: shapeStartRef.current.x,
        prevY: shapeStartRef.current.y,
        x: pos.x,
        y: pos.y,
        color,
        width: strokeWidth,
        tool: currentTool,
        ...opts,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!drawingRef.current) return;
    drawingRef.current = false;

    const touch = e.changedTouches[0];
    if (touch && shapeStartRef.current) {
      const pos = getPosFromClient(touch.clientX, touch.clientY);
      const data: DrawEvent = {
        prevX: shapeStartRef.current.x,
        prevY: shapeStartRef.current.y,
        x: pos.x,
        y: pos.y,
        color,
        width: strokeWidth,
        tool: currentTool,
        ...getDrawOpts(),
      };
      drawLine(data);
      socketRef.current?.emit("draw-event", data);
    }

    shapeStartRef.current = null;
    snapshotRef.current = null;
  };

  touchHandlersRef.current = {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };

  /* Native touch listeners with passive: false so preventDefault works on mobile */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const opts = { passive: false };
    const onStart = (e: TouchEvent) => {
      e.preventDefault();
      touchHandlersRef.current.handleTouchStart(e as unknown as React.TouchEvent<HTMLCanvasElement>);
    };
    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      touchHandlersRef.current.handleTouchMove(e as unknown as React.TouchEvent<HTMLCanvasElement>);
    };
    const onEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchHandlersRef.current.handleTouchEnd(e as unknown as React.TouchEvent<HTMLCanvasElement>);
    };
    canvas.addEventListener("touchstart", onStart, opts);
    canvas.addEventListener("touchmove", onMove, opts);
    canvas.addEventListener("touchend", onEnd, opts);
    canvas.addEventListener("touchcancel", onEnd, opts);
    return () => {
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onEnd);
      canvas.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  /* ================= UNDO / REDO / EXPORT ================= */

  const handleUndo = () => {
    if (!undoStack.current.length) return;
    redoStack.current.push(
      ctxRef.current!.getImageData(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      )
    );
    ctxRef.current!.putImageData(undoStack.current.pop()!, 0, 0);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  };

  const handleRedo = () => {
    if (!redoStack.current.length) return;
    undoStack.current.push(
      ctxRef.current!.getImageData(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      )
    );
    ctxRef.current!.putImageData(redoStack.current.pop()!, 0, 0);
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
  };

  const handleExportPNG = () => {
    const link = document.createElement("a");
    link.download = `nexus-board-${Date.now()}.png`;
    link.href = canvasRef.current!.toDataURL("image/png");
    link.click();
  };

  const handleClear = () => {
    ctxRef.current?.clearRect(
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height
    );
    undoStack.current = [];
    redoStack.current = [];
    setCanUndo(false);
    setCanRedo(false);
    socketRef.current?.emit("clear-board");
  };

  const handleSendChat = useCallback(
    (text: string) => socketRef.current?.emit("chat-message", text),
    [socketRef]
  );

  /* ================= RENDER ================= */

  return (
    <div className="relative w-full h-full bg-gray-50">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-white cursor-crosshair touch-none select-none"
        style={{ touchAction: "none", WebkitTouchCallout: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <ActiveUsersPanel users={activeUsers} myId={myId} />
      <ChatPanel messages={chatMessages} onSend={handleSendChat} myId={myId} />

      {Object.entries(remoteCursors).map(([id, c]) => (
        <div
          key={id}
          className="pointer-events-none absolute z-40"
          style={{ transform: `translate(${c.x}px, ${c.y}px)` }}
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: c.color }}
          />
          <div
            className="mt-1 rounded px-1 text-[10px] text-white"
            style={{ backgroundColor: c.color }}
          >
            {c.username}
          </div>
        </div>
      ))}

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
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportPNG={handleExportPNG}
        onClear={handleClear}
        canUndo={canUndo}
        canRedo={canRedo}
        isConnected={isConnected}
      />
    </div>
  );
}
