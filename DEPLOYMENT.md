# Deploy Nexus-Board

You have **two parts** to deploy:

1. **Frontend (Next.js)** → **Vercel** (recommended)
2. **Backend (Socket.io server)** → **Railway** or **Render** (Vercel cannot run long-lived WebSockets)

---

## Step 1: Deploy the backend first

The frontend needs your backend URL. Deploy the backend and copy its URL before configuring Vercel.

### Option A: Railway (free tier)

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. **New Project** → **Deploy from GitHub repo** (or “Empty project” and connect repo later).
3. If you use “Empty project”:
   - Add a **GitHub repo** that contains your project (with a `backend` folder).
   - In **Settings**, set **Root Directory** to `backend`.
4. Add **Environment variable**:
   - `CLIENT_URL` = your Vercel frontend URL (you can set this after Step 2, then redeploy), e.g. `https://your-app.vercel.app`
5. Railway will run `npm install` and `npm start`. Your backend `package.json` should have:
   - `"start": "node server.js"` (or the correct entry file).
6. After deploy, open the generated URL (e.g. `https://your-app.up.railway.app`) and copy it. You’ll use this as **Backend URL** in Step 2.

### Option B: Render (free tier)

1. Go to [render.com](https://render.com) and sign in.
2. **New** → **Web Service**.
3. Connect your GitHub repo.
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node server.js`)
5. **Environment** → Add:
   - `CLIENT_URL` = `https://your-app.vercel.app` (update after you have the Vercel URL)
6. Deploy and copy the service URL (e.g. `https://your-backend.onrender.com`).

**Important for Render free tier:** The backend may sleep after inactivity. First load can be slow; the next request will wake it.

---

## Step 2: Deploy the frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New** → **Project** and import your repository.
3. **Configure:**
   - **Root Directory**: click **Edit** and set to **`frontend`** (so Vercel builds the Next.js app).
   - **Framework Preset**: Next.js (auto-detected).
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: leave default.
4. **Environment Variables** (add before first deploy):
   - **Name:** `NEXT_PUBLIC_SOCKET_URL`  
   - **Value:** your backend URL from Step 1 (e.g. `https://your-app.up.railway.app` or `https://your-backend.onrender.com`)  
   - No trailing slash.
5. Click **Deploy**. Wait for the build to finish.
6. Copy your frontend URL (e.g. `https://nexus-board-xxx.vercel.app`).

---

## Step 3: Point backend to frontend (CORS)

Update the backend so it allows requests from your Vercel URL:

1. **Railway / Render** → your backend service → **Environment variables**.
2. Set:
   - `CLIENT_URL` = your Vercel URL, e.g. `https://nexus-board-xxx.vercel.app`
3. **Redeploy** the backend so the new value is used.

Your backend already uses `CLIENT_URL` for CORS; once this is set, the frontend on Vercel can connect to the backend.

---

## Summary

| Part      | Where   | URL you get              |
|----------|---------|---------------------------|
| Frontend | Vercel  | `https://xxx.vercel.app`  |
| Backend  | Railway / Render | `https://xxx.up.railway.app` or `https://xxx.onrender.com` |

- In **Vercel**: set `NEXT_PUBLIC_SOCKET_URL` = backend URL.  
- In **Backend**: set `CLIENT_URL` = Vercel frontend URL.

---

## Optional: custom domain

- **Vercel:** Project → **Settings** → **Domains** → add your domain.
- **Backend:** After you have a custom frontend domain, set `CLIENT_URL` to that domain (e.g. `https://whiteboard.yourdomain.com`) and redeploy the backend.
