import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
if (!secret) {
  console.warn("NEXTAUTH_SECRET or JWT_SECRET not set; Socket auth will reject all connections.");
}

/**
 * Verify NextAuth JWT and attach user to socket.
 * Client must send handshake.auth.token (from GET /api/auth/socket-token).
 */
export function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error("Unauthorized: no token"));
  }
  if (!secret) {
    return next(new Error("Server auth not configured"));
  }
  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded.sub;
    if (!userId) return next(new Error("Unauthorized: invalid token"));
    socket.user = {
      id: userId,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      image: decoded.picture ?? null,
    };
    return next();
  } catch (err) {
    return next(new Error("Unauthorized: invalid token"));
  }
}
