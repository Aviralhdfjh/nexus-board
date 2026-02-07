# Troubleshooting Blank Screen

## Quick Checks

### 1. Is the Frontend Server Running?

Check your terminal for:
```
✓ Ready in X ms
○ Compiling / ...
```

If not running, start it:
```bash
cd frontend
npm run dev
```

### 2. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for JavaScript errors (red text)
- **Network tab**: Check if files are loading (should see 200 status)

### 3. Common Issues

#### Issue: "Module not found" errors
**Solution**: Dependencies not installed
```bash
cd frontend
npm install
```

#### Issue: "Cannot read property of null"
**Solution**: Component mounting issue - check browser console for specific error

#### Issue: White screen with no errors
**Solution**: 
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Check if port 3000 is already in use

#### Issue: Canvas not visible
**Solution**: 
- Check browser console for canvas initialization errors
- Verify canvas element exists in DOM (inspect element)
- Check if Tailwind CSS is loading

### 4. Verify Setup

1. **Check if Next.js is running:**
   ```bash
   # Should see output like:
   # ▲ Next.js 14.x.x
   # - Local: http://localhost:3000
   ```

2. **Check if files exist:**
   ```bash
   # Verify these files exist:
   frontend/app/page.tsx
   frontend/app/layout.tsx
   frontend/components/Whiteboard.tsx
   frontend/styles/globals.css
   ```

3. **Check TypeScript compilation:**
   ```bash
   cd frontend
   npm run build
   ```
   This will show any TypeScript errors

### 5. Debug Steps

1. **Add console.log to verify rendering:**
   - Check if `Whiteboard` component is mounting
   - Check if canvas is initializing
   - Check socket connection status

2. **Check Network Requests:**
   - Open DevTools → Network tab
   - Reload page
   - Look for failed requests (red)

3. **Verify Tailwind CSS:**
   - Check if styles are applied
   - Look for Tailwind classes in computed styles

### 6. Reset Everything

If nothing works:
```bash
# Clean install
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

## Still Not Working?

1. Check the browser console for specific error messages
2. Verify the backend server is running (for WebSocket, but shouldn't block rendering)
3. Try accessing `http://localhost:3000` in incognito mode
4. Check if another application is using port 3000

