# How to Use Nexus-Board Collaboratively

Your app is **already collaborative**. Multiple users can draw at the same time and see each other's names. Follow these steps.

---

## 1. Start the servers

From the project root:

```bash
npm run dev
```

Or run them separately:

- **Terminal 1 – backend:**  
  `cd backend && npm run dev`  
  (You should see: `🚀 Server running on port 3001`)

- **Terminal 2 – frontend:**  
  `cd frontend && npm run dev`  
  (Frontend at `http://localhost:3000`)

---

## 2. Same computer (quick test)

1. Open **two browser tabs** (or two different browsers).
2. In both, go to: **http://localhost:3000**
3. Enter a name when prompted (e.g. "Alice" and "Bob").
4. Draw in one tab – strokes and shapes appear in the other.
5. Move the mouse – you’ll see the other user’s **cursor and name** on the canvas.
6. **Active users** (top right) shows everyone; **Chat** (bottom left) works for all.

---

## 3. Same Wi‑Fi / local network (other devices)

Yes — other people on other devices (phone, tablet, another laptop) can use the whiteboard with you as long as they’re on the **same Wi‑Fi** (or same local network).

**On the computer that runs the app:**

1. Find your computer’s IP (e.g. `192.168.1.10`):
   - **Windows:** open CMD → `ipconfig` → use “IPv4 Address”
   - **Mac:** System Settings → Network → your Wi‑Fi → “IP Address”

2. **Backend** – allow both you and others to connect:
   ```bash
   cd backend
   set CLIENT_URL=http://192.168.1.10:3000
   npm run dev
   ```
   (Replace `192.168.1.10` with your real IP.)

3. **Frontend** – so the app can reach the backend from any device:
   - Create or edit **`frontend/.env.local`**:
     ```
     NEXT_PUBLIC_SOCKET_URL=http://192.168.1.10:3001
     ```
     (Use the **same** IP as in step 2.)
   - Restart the frontend: `cd frontend && npm run dev`

4. **Share with others:**  
   Send them this link (use **your** IP):  
   **http://YOUR_IP:3000**  
   Example: `http://192.168.1.10:3000`

**On the other device:**  
They open that link in the browser, enter a name, and can draw with you. They will see:

- Your drawings in real time
- Your **cursor and name** on the board
- Themselves and you in **Active users**
- **Chat** with everyone

---

## 4. What’s already in place

- **Drawing:** Every stroke/shape is sent via Socket.io and drawn on every client.
- **Names:** Each user has a **username** (prompt on first visit) and a **color** (assigned by the server).
- **Cursors:** Other users’ **cursor + name** appear on the canvas where they’re pointing.
- **Active users:** Panel lists all connected users and updates on join/leave.
- **Chat:** Messages are broadcast so everyone sees them in real time.

No extra code is required for basic collaboration; you only need the right URL and `NEXT_PUBLIC_SOCKET_URL` when using another device on the same network.
