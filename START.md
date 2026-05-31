# 🚀 FlightWatch AI - One Command Startup

## ⚡ Quick Start (One Command)

```bash
npm run dev
```

That's it! Both **frontend** and **backend** will start simultaneously.

---

## 📋 What Happens When You Run `npm run dev`

```
Terminal Output:
================

🔧 Starting backend server...
🎨 Starting frontend dev server...

[Backend]
  ✅ Database connected
  ✅ Redis connected
  ✅ Workers started
  ✅ API listening on http://localhost:3000

[Frontend]
  ✅ Vite dev server running
  ✅ Open http://localhost:5173

```

---

## 🌐 Access the App

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:3000

---

## 📊 Available Commands

```bash
# Run both frontend + backend together
npm run dev

# Run just backend
npm run dev:backend
npm run backend:dev

# Run just frontend
npm run dev:frontend
npm run frontend:dev

# Build for production
npm run build

# Start production server
npm start

# Install all dependencies
npm run install:all
```

---

## 🛠️ Prerequisites (Must Be Running)

### ✅ PostgreSQL
```bash
# Check if running
psql -U postgres -d flightwatch -c "SELECT 1"

# If not running, start it
# Windows: Services → PostgreSQL
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### ✅ Redis
```bash
# Check if running
redis-cli ping
# Should return: PONG

# If not running, start it
# Windows: redis-server
# Mac: brew services start redis
# Linux: sudo systemctl start redis-server
```

---

## 📦 What's Included

- **Backend (Node.js + TypeScript)**
  - Express.js API
  - HasData integration (real flight prices)
  - Price tracking workers
  - Email notifications
  - PostgreSQL database
  - Redis caching

- **Frontend (Vanilla JavaScript)**
  - Vite bundler
  - Tailwind CSS
  - 8 complete pages
  - Real-time flight search
  - Price tracking dashboard
  - Email alert management

---

## ✅ Verification Checklist

After running `npm run dev`:

1. **Check Backend**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"ok"}
   ```

2. **Check Frontend**
   - Open http://localhost:5173
   - Should see landing page

3. **Try Creating an Account**
   - Sign up with test email
   - Should receive confirmation (if email configured)

4. **Create a Watchlist**
   - NYC → LAX on a future date
   - Budget: $500

5. **Check API**
   ```bash
   curl http://localhost:3000/api/watchlists \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## 🐛 Troubleshooting

### Command not found: concurrently
```bash
npm install concurrently --save-dev
npm run dev
```

### Port 3000 already in use
```bash
# Change backend port in backend/src/index.ts
# Change line: app.listen(3000, ...)
# To: app.listen(3001, ...)
```

### Port 5173 already in use
```bash
# Change frontend port in frontend/vite.config.js
# Change: port: 5173
# To: port: 5174
```

### Cannot connect to PostgreSQL
- Check DATABASE_URL in `.env`
- Verify PostgreSQL is running
- Run: `npx prisma db push`

### Cannot connect to Redis
- Check Redis is running: `redis-cli ping`
- Should return: PONG
- Start Redis if needed

---

## 📝 Environment Setup

All environment variables are already configured:
- ✅ `.env` file in root (backend)
- ✅ `frontend/.env.example` created
- ✅ All API keys set
- ✅ Database URL configured
- ✅ Email credentials ready

---

## 🎯 First Things to Try

1. **Start the app**
   ```bash
   npm run dev
   ```

2. **Open in browser**
   - http://localhost:5173

3. **Create account**
   - Email: test@example.com
   - Password: test123

4. **Create watchlist**
   - From: NYC
   - To: LAX
   - Date: July 15, 2024
   - Budget: $500

5. **Wait for prices** (or manually trigger worker)

6. **Check email alerts**
   - When price drops, you'll get notified

---

## 💡 Pro Tips

- **Development mode**: Code changes auto-reload
- **Database**: Access with `npx prisma studio`
- **Logs**: Check console for detailed error messages
- **API Testing**: Use Postman or curl commands

---

## 🚀 Ready to Launch!

```bash
npm run dev
```

Both frontend and backend will start automatically. Open http://localhost:5173 and start testing!

---

**Questions?** Check:
- `HASDATA_INTEGRATION_COMPLETE.md` (Full guide)
- `IMPLEMENTATION_ROADMAP.md` (Architecture)
- Backend logs (detailed errors)
