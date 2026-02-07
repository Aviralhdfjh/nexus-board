import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import crypto from "crypto";

const app = express();
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  CLIENT_URL,
].filter((v, i, a) => a.indexOf(v) === i);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.includes(origin)),
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

app.use(cors());
app.use(express.json());

// socketId -> { username, color }
const users = new Map();

const getPresenceList = () =>
  Array.from(users.entries()).map(([id, u]) => ({
    id,
    username: u.username,
    color: u.color,
  }));

io.on("connection", (socket) => {
  const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

  users.set(socket.id, { username: "Anonymous", color });

  socket.emit("user-color", { color });
  socket.emit("presence", { users: getPresenceList() });

  /* ---------- USERNAME ---------- */
  socket.on("set-username", (name) => {
    const entry = users.get(socket.id);
    if (!entry) return;

    entry.username = String(name || "Anonymous").slice(0, 50);

    const payload = {
      id: socket.id,
      username: entry.username,
      color: entry.color,
    };

    io.emit("user-updated", payload);
  });

  /* ---------- DRAW ---------- */
  socket.on("draw-event", (data) => {
    socket.broadcast.emit("draw-event", {
      ...data,
      userId: socket.id,
    });
  });

  /* ---------- CURSOR ---------- */
  socket.on("cursor-move", ({ x, y }) => {
    const entry = users.get(socket.id);
    if (!entry) return;

    socket.broadcast.emit("cursor-move", {
      id: socket.id,
      x,
      y,
      color: entry.color,
      username: entry.username,
    });
  });

  /* ---------- CLEAR ---------- */
  socket.on("clear-board", () => {
    socket.broadcast.emit("clear-board");
  });

  /* ---------- CHAT ---------- */
  socket.on("chat-message", (text) => {
    const entry = users.get(socket.id);
    if (!entry) return;

    const safeText = String(text || "").trim().slice(0, 500);
    if (!safeText) return;

    io.emit("chat-message", {
      messageId: crypto.randomUUID(),
      userId: socket.id,
      username: entry.username,
      color: entry.color,
      text: safeText,
      timestamp: Date.now(),
    });
  });

  /* ---------- DISCONNECT ---------- */
  socket.on("disconnect", () => {
    users.delete(socket.id);
    socket.broadcast.emit("user-left", { id: socket.id });
    socket.broadcast.emit("cursor-remove", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
});
