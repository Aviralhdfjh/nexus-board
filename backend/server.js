import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import crypto from "crypto";
import { socketAuthMiddleware } from "./socket-auth.js";

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

io.use(socketAuthMiddleware);

app.use(cors());
app.use(express.json());

// socketId -> { userId, username, color } (userId from JWT)
const users = new Map();

const getPresenceList = () =>
  Array.from(users.entries()).map(([id, u]) => ({
    id,
    userId: u.userId,
    username: u.username,
    color: u.color,
  }));

io.on("connection", (socket) => {
  const user = socket.user;
  const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
  users.set(socket.id, {
    userId: user.id,
    username: user.name || user.email || "Anonymous",
    color,
  });

  socket.emit("user-color", { color });
  socket.emit("presence", { users: getPresenceList() });

  socket.on("set-username", (name) => {
    const entry = users.get(socket.id);
    if (!entry) return;
    entry.username = String(name || entry.username || "Anonymous").slice(0, 50);
    io.emit("user-updated", {
      id: socket.id,
      userId: entry.userId,
      username: entry.username,
      color: entry.color,
    });
  });

  socket.on("set-color", (newColor) => {
    const entry = users.get(socket.id);
    if (!entry) return;
    const safe =
      typeof newColor === "string"
        ? String(newColor).slice(0, 32)
        : entry.color;
    entry.color = safe;
    io.emit("user-updated", {
      id: socket.id,
      userId: entry.userId,
      username: entry.username,
      color: entry.color,
    });
  });

  socket.on("draw-event", (data) => {
    socket.broadcast.emit("draw-event", {
      ...data,
      userId: socket.user.id,
    });
  });

  socket.on("cursor-move", ({ x, y }) => {
    const entry = users.get(socket.id);
    if (!entry) return;
    socket.broadcast.emit("cursor-move", {
      id: socket.id,
      userId: entry.userId,
      x,
      y,
      color: entry.color,
      username: entry.username,
    });
  });

  socket.on("clear-board", () => {
    socket.broadcast.emit("clear-board");
  });

  socket.on("chat-message", (text) => {
    const entry = users.get(socket.id);
    if (!entry) return;
    const safeText = String(text || "").trim().slice(0, 500);
    if (!safeText) return;
    io.emit("chat-message", {
      messageId: crypto.randomUUID(),
      userId: entry.userId,
      id: socket.id,
      username: entry.username,
      color: entry.color,
      text: safeText,
      timestamp: Date.now(),
    });
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    socket.broadcast.emit("user-left", { id: socket.id });
    socket.broadcast.emit("cursor-remove", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
  console.log("🌐 Allowed origins:", ALLOWED_ORIGINS.join(", "));
});
