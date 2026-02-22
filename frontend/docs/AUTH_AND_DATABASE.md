# Nexus-Board: Auth & Database

## Why NextAuth (Auth.js) over custom JWT

- **OAuth + Credentials in one place**: Google and email/password with a single session model.
- **Security**: CSRF protection, secure cookies, battle-tested flows. Custom JWT would require reinventing session refresh and OAuth.
- **Ecosystem**: Prisma adapter, middleware, and type-safe session.
- **Socket.io**: Same JWT is used; backend verifies with `NEXTAUTH_SECRET`. No separate auth system.

## Folder structure

```
frontend/
  app/
    api/
      auth/
        [...nextauth]/route.ts
        register/route.ts
        socket-token/route.ts
      boards/
        route.ts
        [id]/route.ts
        [id]/members/route.ts
        [id]/messages/route.ts
    actions/
      boards.ts
    board/[id]/page.tsx    # Protected board page
    login/page.tsx
    register/page.tsx
    providers.tsx
    layout.tsx
  auth.ts                  # NextAuth config
  auth.config.ts           # Middleware auth config
  lib/
    auth.ts                # requireAuth, requireBoardAccess
    db.ts                  # Prisma singleton
    sdk/
      auth-client.ts
      board-client.ts
      message-client.ts
      user-client.ts
      index.ts
  middleware.ts
  prisma/
    schema.prisma
  hooks/
    useSocket.ts           # useSocket() with token
backend/
  server.js                # Socket.io + auth middleware
  socket-auth.js           # JWT verification
```

## ENV variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Used for signing JWTs and cookies (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | For Google | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | For Google | From Google Cloud Console |
| `JWT_SECRET` | Optional | Backend can use this or `NEXTAUTH_SECRET` for Socket.io |
| `NEXT_PUBLIC_SOCKET_URL` | Yes (client) | Socket server URL (e.g. `http://localhost:3001`) |
| `CLIENT_URL` | Backend | Same as `NEXTAUTH_URL` for CORS |

## Protecting a board page

- **Middleware**: All routes except `/login`, `/register`, and `/api/*` require a session. See `auth.config.ts` and `middleware.ts`.
- **Board access**: In `app/board/[id]/page.tsx`, `requireBoardAccess(id)` loads the board and checks membership; throws if not a member, then redirect.

```ts
// Server Component
const { user, member, board } = await requireBoardAccess(params.id);
// member.role is OWNER | EDITOR | VIEWER
```

## Only board members can access board

- `requireBoardAccess(boardId, roles?)` in `lib/auth.ts`:
  - Gets current user via `auth()`.
  - Looks up `BoardMember` for `boardId` + `userId`.
  - If no row or role not in `roles` (when provided), throws.
- Used in:
  - `GET/PATCH/DELETE /api/boards/[id]`
  - `GET/POST /api/boards/[id]/members`
  - `GET/POST /api/boards/[id]/messages`
  - `app/board/[id]/page.tsx`

## Socket.io authentication

1. **Client**: `useSocket()` calls `getTokenForSocket()` which fetches `GET /api/auth/socket-token` (cookie sent). That route uses `getToken({ req, secret, raw: true })` and returns the raw NextAuth JWT.
2. **Client**: Passes the token in the Socket handshake: `io(url, { auth: { token } })`.
3. **Backend**: `socket-auth.js` runs as `io.use(socketAuthMiddleware)`. It reads `handshake.auth.token`, verifies with `NEXTAUTH_SECRET` (or `JWT_SECRET`), and attaches `socket.user = { id, email, name, image }`.
4. **Backend**: Unauthenticated or invalid token → `next(new Error("Unauthorized"))` → connection rejected.

Accessing the user in Socket handlers:

```js
io.on("connection", (socket) => {
  const userId = socket.user.id;
  const name = socket.user.name;
  // ...
});
```

## SDK usage

- **Server (RSC / Server Actions)**: Use `auth()`, `requireAuth()`, `requireBoardAccess()` from `lib/auth.ts`; use `prisma` from `lib/db.ts`; or call SDK functions that use `fetch` with `credentials: "include"` from a Server Action (no cookies in server-side fetch by default — pass session or call from API route that has cookies).
- **Client**: Use `getSession()`, `getTokenForSocket()`, `signIn`, `signOut` from `lib/sdk/auth-client`. Use `getBoards()`, `getBoard(id)`, `createBoard()`, etc. from `lib/sdk/board-client`. Use `getMessages()`, `sendMessage()` from `lib/sdk/message-client`. All use `credentials: "include"` so cookies are sent.

Example (client): open a board and use the whiteboard (which uses `useSocket()` and thus the socket token):

```tsx
// app/board/[id]/page.tsx is a Server Component that checks requireBoardAccess
// and renders <Whiteboard />. useSocket() inside Whiteboard gets the token and
// connects with auth.
```

## Security decisions

- **Passwords**: Hashed with **bcrypt** (cost 12) in `api/auth/register` and verified in NextAuth Credentials `authorize`.
- **Sessions**: JWT strategy; no DB session table required for basic flow. Prisma adapter still used for OAuth Account linking.
- **API routes**: All board/message routes use `requireAuth()` or `requireBoardAccess()`; no anonymous access.
- **Socket**: No anonymous connections; middleware rejects missing/invalid JWT.
- **CORS**: Backend allows only `CLIENT_URL` and localhost.
- **Board membership**: Every board API and the board page enforce membership via `BoardMember`; role-based checks where needed (e.g. only OWNER can delete board).
