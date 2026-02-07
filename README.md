# Nexus-Board: Real-Time Collaborative Whiteboard

A real-time collaborative whiteboard system built with Next.js, React, Socket.io, and HTML5 Canvas. Multiple users can draw, annotate, and interact simultaneously with minimal latency.

## Project Structure

```
nexus-board/
│
├── backend/
│   ├── server.js
│   ├── package.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │
│   ├── components/
│   │   ├── Whiteboard.tsx
│   │   ├── Toolbar.tsx
│   │
│   ├── hooks/
│   │   └── useSocket.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── tsconfig.json
│   └── postcss.config.js
│
└── package.json
```

## Features

- 🎨 **Real-time Multi-user Drawing** - Draw together with others in real-time
- ✏️ **Multiple Tools** - Pencil, eraser, rectangle, and circle tools
- 🎨 **Color Picker** - Choose any color for your drawings
- 📏 **Adjustable Stroke Width** - Control the thickness of your strokes
- 👥 **Remote Cursors** - See where other users are on the canvas
- 🚀 **Low Latency** - Optimized for smooth, responsive drawing
- 📱 **Touch Support** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Real-Time**: Socket.io (WebSockets)
- **Canvas**: HTML5 Canvas API
- **Icons**: Lucide React
- **Backend**: Node.js + Express + Socket.io

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd whiteboard
```

2. Install all dependencies:
```bash
npm run install:all
```

Or install manually:
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

### Important: Start Backend First!

**The WebSocket connection will fail if the backend server is not running.**

1. **Start the backend server first:**
   ```bash
   cd backend
   npm run dev
   ```
   You should see: `🚀 Server running on port 3001`

2. **Then start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Or start both together:**
   ```bash
   npm run dev
   ```

3. Set up environment variables (optional):
Create a `.env.local` file in the `frontend/` directory:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Create a `.env` file in the `backend/` directory:
```
PORT=3001
CLIENT_URL=http://localhost:3000
```

4. Run the development servers:
```bash
npm run dev
```

This will start:
- Next.js frontend on `http://localhost:3000`
- Socket.io server on `http://localhost:3001`

5. Open your browser and navigate to `http://localhost:3000`

## Development

### Running Backend Only
```bash
cd backend
npm run dev
```

### Running Frontend Only
```bash
cd frontend
npm run dev
```

## Usage

1. Open the application in multiple browser tabs or share the URL with others
2. Start drawing on the canvas
3. See other users' cursors in real-time
4. Use the toolbar to switch tools, change colors, adjust stroke width, or clear the board

## Architecture

### Real-Time Synchronization

- Uses Socket.io for WebSocket communication
- Implements Last-Write-Wins (LWW) strategy for conflict resolution
- Drawing events are broadcasted to all connected clients
- Cursor positions are updated in real-time

### Performance Optimizations

- Batched rendering using `requestAnimationFrame`
- Incremental canvas updates (no full re-renders)
- Minimized network payloads
- Efficient event handling

## Future Enhancements

- [ ] User authentication
- [ ] Persistent board storage (MongoDB/PostgreSQL)
- [ ] Undo/Redo functionality
- [ ] Voice or chat integration
- [ ] Export board as image/PDF
- [ ] Room-based sessions
- [ ] Drawing history playback

## License

MIT
