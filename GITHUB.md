# Push This Project to GitHub

Your project is already initialized with Git and has one commit. Follow these steps to put it on GitHub.

---

## 1. Create a new repository on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** e.g. `nexus-board` or `whiteboard`
3. **Description (optional):** e.g. `Real-time collaborative whiteboard`
4. Choose **Public**
5. **Do not** add a README, .gitignore, or license (you already have these)
6. Click **Create repository**

---

## 2. Connect your local project and push

GitHub will show you commands. Use these (replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name):

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**Example:** If your repo URL is `https://github.com/john/nexus-board`:

```bash
git remote add origin https://github.com/john/nexus-board.git
git branch -M main
git push -u origin main
```

---

## 3. If you use SSH instead of HTTPS

If you use an SSH key with GitHub:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 4. After the first push

- Your code will be at: `https://github.com/YOUR_USERNAME/YOUR_REPO`
- You can connect this repo to **Vercel** and **Railway/Render** for deployment (see **DEPLOYMENT.md**).
- For future changes:
  ```bash
  git add .
  git commit -m "Your message"
  git push
  ```

---

## Note

- **`.env`** and **`frontend/.env`** are in `.gitignore`, so they are **not** pushed. Add secrets (e.g. `NEXT_PUBLIC_SOCKET_URL`) in Vercel/Railway/Render after deployment.
- **`node_modules`** are not pushed; anyone who clones the repo should run `npm run install:all` (or install in `backend` and `frontend` separately).
