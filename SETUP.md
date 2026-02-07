# Setup Instructions

## Quick Start

### 1. Install Dependencies

From the root directory:
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

### 2. Start the Servers

**Option 1: Start both servers together (Recommended)**
```bash
npm run dev
```

**Option 2: Start servers separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 3. Verify Server is Running

- Backend should show: `🚀 Server running on port 3001`
- Frontend should be available at: `http://localhost:3000`

## Troubleshooting WebSocket Connection Issues

If you see WebSocket connection errors:

1. **Check if backend is running:**
   - Look for the server console message: `🚀 Server running on port 3001`
   - If not running, start it with `cd backend && npm run dev`

2. **Check if dependencies are installed:**
   ```bash
   cd backend
   npm list socket.io express cors
   ```
   If packages are missing, run `npm install`

3. **Check port conflicts:**
   - Make sure port 3001 is not used by another application
   - You can change the port in `backend/server.js` or set `PORT` environment variable

4. **Check CORS configuration:**
   - Backend is configured to accept connections from `http://localhost:3000`
   - If frontend runs on a different port, update `CLIENT_URL` in backend `.env` or `server.js`

5. **Clear browser cache and reload:**
   - Sometimes cached WebSocket connections can cause issues

## Environment Variables

### Backend (.env in backend/ directory)
```
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local in frontend/ directory)
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Common Issues

### "Cannot find module" errors
- Make sure you've run `npm install` in both `backend/` and `frontend/` directories

### "Port already in use" errors
- Another process is using port 3000 or 3001
- Kill the process or change the port in configuration

### WebSocket connection fails
- Ensure backend server is running before opening the frontend
- Check browser console for detailed error messages
- Verify firewall isn't blocking the connection

