# FlightWatch AI - Quick Reference Guide

## Quick Start

### Setup in 5 minutes
```bash
# 1. Clone and install
git clone https://github.com/08prachi/flightwatch-ai.git
cd flightwatch-ai
npm run install:all

# 2. Configure .env
cp .env.example .env
# Edit .env with your keys (DATABASE_URL, SERPAPI_API_KEY, etc.)

# 3. Setup database
cd backend
npx prisma migrate deploy

# 4. Start services
npm run dev          # Terminal 1: Backend
cd ../frontend
npm run dev          # Terminal 2: Frontend
```

Access at: `http://localhost:5173`

---

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JS + Tailwind CSS + Vite |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Queue** | BullMQ + Redis |
| **External APIs** | SerpAPI (flights), Gmail SMTP |
| **PDF** | PDFKit |
| **Auth** | JWT |

---

## Database Quick Reference

### Key Tables
```sql
-- Users
id, name, email, password (hashed), createdAt, updatedAt

-- Watchlists
id, origin, destination, departureDate, returnDate,
budget, currentPrice, lowestPrice, passengers, 
flightType, cabinClass, airline, active, userId

-- PriceHistory
id, watchlistId, price, flightCount, lowestPrice, 
highestPrice, createdAt

-- Notifications
id, userId, type, title, message, data, read, createdAt
```

---

## API Endpoints Summary

### Auth
```
POST   /api/auth/signup          Create account
POST   /api/auth/login           Login
```

### Watchlists
```
POST   /api/watchlists           Create
GET    /api/watchlists           List all
GET    /api/watchlists/{id}      Get one
PUT    /api/watchlists/{id}      Update
PATCH  /api/watchlists/{id}      Toggle active
DELETE /api/watchlists/{id}      Delete
GET    /api/watchlists/{id}/price-history    Price history
GET    /api/watchlists/{id}/top-flights      Top 3 flights
GET    /api/watchlists/{id}/alerts           Notifications
```

### Notifications
```
GET    /api/notifications        Get all
PUT    /api/notifications/{id}/read   Mark read
```

### Users
```
GET    /api/users/profile        Get profile
PUT    /api/users/profile        Update profile
```

---

## Key Services

### Price Check Workflow
```
1. Watchlist Created
   └─ Job queued to BullMQ

2. Worker Processes
   └─ Searches flights via SerpAPI (5-7 days)
   └─ Aggregates results
   └─ Generates PDF
   └─ Saves to PriceHistory

3. Email Sent
   └─ Via Notification Worker
   └─ Includes PDF with:
      ├─ Top 3 cheapest flights
      ├─ Best day to fly
      ├─ Summary statistics
      └─ All flights by date
```

### Email Flow
```
User Creates Watchlist
    ↓
Price Check Worker Completes
    ↓
Add to Notification Queue
    ↓
Notification Worker Picks Up
    ↓
Send via Gmail SMTP
    ↓
Email Delivered with PDF
```

---

## Environment Variables Checklist

```env
# REQUIRED
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flightwatch
JWT_SECRET=your-secret-key-min-32-chars
SERPAPI_API_KEY=your_serpapi_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# OPTIONAL
PORT=3000
NODE_ENV=development
SEARCH_DAYS=7
```

---

## File Structure

```
flightwatch-ai/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Database queries
│   │   ├── providers/       # External APIs
│   │   ├── workers/         # Background jobs
│   │   ├── queues/          # Job queues
│   │   ├── middleware/      # Auth, CORS, etc.
│   │   ├── config/          # DB, Redis configs
│   │   └── index.ts         # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # API calls
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── utils/           # Helpers
│   │   └── main.js          # Entry point
│   └── package.json
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
│
├── .env                     # Environment variables
└── package.json             # Monorepo config
```

---

## Common Commands

### Development
```bash
npm run dev                  # Start both frontend & backend
npm run backend:dev          # Backend only
npm run frontend:dev         # Frontend only
npm run build                # Build for production
```

### Database
```bash
npx prisma migrate dev --name description   # Create migration
npx prisma migrate deploy                   # Apply migrations
npx prisma studio                           # GUI database explorer
npx prisma db seed                          # Seed sample data
```

### Testing
```bash
npm test                     # Run tests (if configured)
npm run lint                 # Lint code
npm run type-check           # TypeScript check
```

---

## Monitoring & Debugging

### Check Services
```bash
# PostgreSQL
psql -U postgres -d flightwatch

# Redis
redis-cli ping

# Backend
curl http://localhost:3000/api/watchlists

# Frontend
Visit http://localhost:5173
```

### View Logs
```bash
# Backend logs in terminal
# Look for:
# 🚀 Server Running on Port 3000
# 📧 Email sent successfully
# ✅ Job completed

# Check job status
redis-cli
> KEYS *price-check*
> HGETALL bull:price-check:jobs:{job_id}
```

### Database Queries
```bash
# Connect to PostgreSQL
psql -U postgres -d flightwatch

# Useful queries
SELECT * FROM "User";
SELECT * FROM "Watchlist" WHERE "active" = true;
SELECT * FROM "PriceHistory" ORDER BY "createdAt" DESC LIMIT 10;
SELECT COUNT(*) FROM "Notification" WHERE "read" = false;
```

---

## Troubleshooting Checklist

### Can't Log In
- [ ] Check email/password in database
- [ ] Clear localStorage
- [ ] Verify JWT_SECRET in .env

### Price Check Not Running
- [ ] Redis running? (`redis-cli ping`)
- [ ] Check backend logs for errors
- [ ] Verify SERPAPI_API_KEY is valid
- [ ] Check queue: `redis-cli KEYS *price-check*`

### No Email Received
- [ ] Check Gmail app password (not regular password)
- [ ] Verify EMAIL_USER and EMAIL_PASS in .env
- [ ] Check spam folder
- [ ] View email logs in backend terminal

### Flights Not Showing
- [ ] Use real IATA codes (BKK, DEL, etc.)
- [ ] Date must be in future
- [ ] Check SerpAPI has credits
- [ ] View worker logs for errors

### Database Connection Failed
- [ ] PostgreSQL running? (`psql -U postgres`)
- [ ] DATABASE_URL correct in .env
- [ ] Database exists? (`createdb flightwatch`)

---

## API Request Examples

### Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Watchlist
```bash
curl -X POST http://localhost:3000/api/watchlists \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BKK",
    "destination": "DEL",
    "departureDate": "2026-06-10",
    "budget": 500,
    "passengers": 1,
    "flightType": "any",
    "cabinClass": "economy"
  }'
```

### Get Price History
```bash
curl http://localhost:3000/api/watchlists/WATCHLIST_ID/price-history?days=30 \
  -H "Authorization: Bearer TOKEN"
```

---

## Performance Tips

### Optimize Queries
- Use indexes (already configured in schema)
- Limit results with pagination
- Use select to fetch only needed fields

### Reduce Email Load
- Batch email sending if many users
- Consider queuing at high load
- Monitor SMTP rate limits

### Cache Management
- Top flights cached automatically
- Clear cache after new search
- Adjust TTL if needed

### Database Maintenance
```bash
# Vacuum database
VACUUM;

# Analyze query performance
EXPLAIN ANALYZE SELECT ...;

# View slow queries
# Enable slow_query_log in PostgreSQL
```

---

## Security Checklist

- [ ] JWT_SECRET is strong (32+ chars)
- [ ] EMAIL_PASS is app password, not regular password
- [ ] .env not committed to git
- [ ] SERPAPI_KEY rotated periodically
- [ ] CORS configured (not * in production)
- [ ] HTTPS enabled in production
- [ ] Database credentials not in logs
- [ ] Rate limiting configured (optional)
- [ ] Input validation enabled
- [ ] SQL injection protection (Prisma ORM)

---

## Useful Extensions/Tools

### VS Code
- REST Client - Test APIs in editor
- SQLTools - Database explorer
- Prisma - Schema highlighting
- Thunder Client - API testing

### Terminal Tools
```bash
# Install useful CLI tools
npm install -g prisma
npm install -g redis-cli
npm install -g postgresql

# Query database easily
psql -U postgres -d flightwatch -c "SELECT * FROM \"Watchlist\";"

# Monitor Redis
redis-cli MONITOR

# Test email
npx ts-node backend/src/scripts/testEmail.ts
```

---

## Important Notes

### Email Delay
- First email takes ~30-60 seconds (price check job)
- Subsequent emails sent from notification worker (2-5 sec)

### Price Check Frequency
- On creation: Immediate
- Via scheduler: Configurable (default: daily)
- Manual: User can trigger via UI refresh

### PDF Size
- Average: 100-500 KB per PDF
- Attachment size limit: Gmail ~25 MB
- Consider compression for high-volume

### Database Size
- PriceHistory grows fastest (1 record per check)
- Archive old data after 1 year
- Use `VACUUM` periodically

### SerpAPI Limits
- Free tier: 100 requests/month
- Paid: $50-500/month depending on volume
- Rate limit: Monitor to avoid throttling

---

## Next Steps for New Developers

1. **Understand the Flow**
   - Read DOCUMENTATION.md (especially Flight Search Process)
   - Trace code from API endpoint → Service → Database

2. **Set Up Locally**
   - Follow Quick Start above
   - Create test account
   - Create test watchlist

3. **Explore Code**
   - Start with `backend/src/routes/`
   - Then `backend/src/services/`
   - Then `backend/src/workers/`

4. **Test Manually**
   - Create watchlist in UI
   - Wait for email (60 seconds)
   - Check database changes
   - View price chart

5. **Deploy**
   - Choose platform (Heroku, Vercel, AWS, etc.)
   - Configure environment variables
   - Run migrations
   - Start server

---

**Last Updated**: May 31, 2026
**Questions?** Refer to DOCUMENTATION.md for detailed explanations

