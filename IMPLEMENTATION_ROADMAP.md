# FlightWatch AI - Implementation Roadmap

## 🎯 Current Architecture Issues & Solutions

### Problem
- ❌ AviationStack: Only provides flight schedules, NOT pricing data
- ❌ Playwright scraping: Violates ToS, unreliable, gets blocked
- ❌ No real pricing source = incomplete MVP

### Solution
Use **Kiwi.com API** (Free tier) + **Smart Caching** + **AviationStack** (flight details)

---

## 🏗️ New Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER SEARCHES                             │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SEARCH AGGREGATOR                             │
│  - Check Redis Cache (24h TTL)                                  │
│  - If miss: Call APIs below                                     │
└──────────┬──────────────────────────────────────┬───────────────┘
           │                                      │
           ▼                                      ▼
   ┌──────────────────┐             ┌─────────────────────────┐
   │  Kiwi.com API    │             │  AviationStack API      │
   │  ✅ PRICING DATA │             │  ✅ FLIGHT METADATA     │
   │  - Real prices   │             │  - Airlines             │
   │  - Multiple      │             │  - Aircraft types       │
   │    airlines      │             │  - Flight numbers       │
   └────────┬─────────┘             └────────┬────────────────┘
            │                                 │
            └────────────┬────────────────────┘
                         │
                         ▼
            ┌─────────────────────────┐
            │   MERGE & TRANSFORM     │
            │   DATA                  │
            └────────┬────────────────┘
                     │
                     ▼
         ┌────────────────────────────┐
         │  Redis Cache (24h)         │
         │  PostgreSQL (Historical)   │
         └────────┬───────────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │  Price Check Worker         │
    │  (Runs every 2-4 hours)     │
    │                             │
    │  1. Get active watchlists   │
    │  2. Check current prices    │
    │  3. Compare vs historical   │
    │  4. Detect price drops      │
    │  5. Queue alerts            │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │  Alert Decision Engine      │
    │                             │
    │  ✅ Price < Budget?         │
    │  ✅ Price Drop?             │
    │  ✅ Last 24h low?           │
    │  ✅ User preferences?       │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │  Notification Queue         │
    │  (BullMQ)                   │
    └────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │  Email Alerts               │
    │  (Nodemailer + Gmail)       │
    │                             │
    │  - Price Drop Alerts        │
    │  - Budget Alerts            │
    │  - Weekly Digests           │
    └─────────────────────────────┘
```

---

## 📋 Implementation Phases

### Phase 1: Setup Kiwi.com API & Data Sources (THIS WEEK)
- [ ] Create Kiwi.com API account (free tier)
- [ ] Create `kiwi.service.ts` for pricing
- [ ] Merge Kiwi + AviationStack responses
- [ ] Implement Redis caching (24h TTL)
- [ ] Update search endpoint

### Phase 2: Fix Database & Worker Pipeline (THIS WEEK)
- [ ] Run Prisma migrations (updated schema)
- [ ] Fix notification worker (Redis types)
- [ ] Update price check worker (Kiwi integration)
- [ ] Test worker jobs end-to-end

### Phase 3: Email Alerts & Notifications (THIS WEEK)
- [ ] Complete email templates (✅ already done)
- [ ] Queue email jobs properly
- [ ] Test email sending
- [ ] Add email preference tracking

### Phase 4: Frontend Integration (NEXT WEEK)
- [ ] Connect frontend to updated APIs
- [ ] Show real pricing in search results
- [ ] Display price history charts
- [ ] Test watchlist creation with real data

### Phase 5: Optimization & Monitoring (NEXT WEEK)
- [ ] Add rate limiting
- [ ] Monitor API quotas
- [ ] Setup error tracking
- [ ] Performance optimization

---

## 🔑 API Keys Needed

### Kiwi.com API
- **Free Tier**: 10 API calls/minute, 500/month free
- **Signup**: https://tequila.kiwi.com/
- **Get API Key**: Dashboard → Your API Key
- **Docs**: https://tequila.kiwi.com/documentation

### Already Have
✅ AviationStack API Key  
✅ Gmail credentials  
✅ PostgreSQL  
✅ Redis  

---

## 📊 Data Flow for Each Search

### Example: NYC → LAX on June 30

```
1. User searches: NYC → LAX, June 30, 1 passenger

2. Check Redis:
   KEY: "flight:NYC:LAX:2024-06-30:1p"
   HIT? → Return cached (2sec)
   MISS? → Continue...

3. Call Kiwi.com:
   GET /search?from=NYC&to=LAX&date=2024-06-30
   Response: {
     "data": [
       {
         "id": "flight123",
         "price": 245,
         "airline": "United",
         "fly_duration": "5h30m",
         "stops": 0
       },
       ...
     ]
   }

4. Call AviationStack:
   GET /flights?dep_iata=JFK&arr_iata=LAX&dep_date=2024-06-30
   Response: {
     "flight_number": "UA123",
     "airline": { "name": "United", "iata": "UA" },
     "aircraft": { "iata": "B787" },
     ...
   }

5. Merge Results:
   {
     "price": 245,
     "airline": "United",
     "flightNumber": "UA123",
     "aircraft": "B787",
     "duration": 330,
     "stops": 0
   }

6. Cache (Redis):
   SET flight:NYC:LAX:2024-06-30:1p = <json> EX 86400

7. Store in DB:
   INSERT priceHistory {
     watchlistId: "watch123",
     price: 245,
     flightCount: 12,
     lowestPrice: 245,
     highestPrice: 899
   }
```

---

## 🔄 Price Check Worker Schedule

```
Every 2-4 Hours:

1️⃣ Get all active watchlists (WHERE active = true)
   
2️⃣ For each watchlist:
   - Call Kiwi.com for current price
   - Get previous price from DB
   - Store new price in priceHistory
   
3️⃣ Analyze:
   - Current < Previous? → PRICE DROP ✅
   - Current <= Budget? → BUDGET ALERT ✅
   - Current < 24h Low? → GOOD DEAL ✅
   
4️⃣ Queue notifications:
   - DB: INSERT notification
   - Redis: PUSH to notification-queue
   
5️⃣ Update watchlist:
   - currentPrice = latest
   - lowestPrice = min(all)
   - lastChecked = now()
```

---

## 💾 Database Schema Changes

```sql
-- UPDATED Watchlist
CREATE TABLE "Watchlist" (
  id UUID PRIMARY KEY,
  origin VARCHAR(3),              -- NYC, LAX, etc.
  destination VARCHAR(3),
  departureDate TIMESTAMP,
  returnDate TIMESTAMP,
  
  budget FLOAT,                   -- $500
  currentPrice FLOAT,             -- Latest fetched price
  lowestPrice FLOAT,              -- All-time low
  
  passengers INT DEFAULT 1,
  flightType VARCHAR(20),         -- any, direct, oneStop
  airline VARCHAR(2),             -- Optional: UA, AA, etc.
  cabinClass VARCHAR(20),         -- economy, business, etc.
  
  active BOOLEAN DEFAULT TRUE,
  userId UUID FOREIGN KEY,
  
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- UPDATED PriceHistory
CREATE TABLE "PriceHistory" (
  id UUID PRIMARY KEY,
  watchlistId UUID FOREIGN KEY,
  
  price FLOAT,                    -- Actual price on that date
  flightCount INT,                -- How many flights found
  lowestPrice FLOAT,              -- Best price that day
  highestPrice FLOAT,             -- Worst price that day
  
  createdAt TIMESTAMP
);

-- UPDATED Notification
CREATE TABLE "Notification" (
  id UUID PRIMARY KEY,
  userId UUID FOREIGN KEY,
  
  type VARCHAR(50),               -- price_drop, budget_alert, etc.
  title VARCHAR(255),
  message TEXT,
  data JSONB,                     -- Additional context
  
  read BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP
);
```

---

## 🚀 File Changes Needed

### New Files to Create
1. `kiwi.service.ts` - Kiwi.com API client
2. `flightSearch.service.ts` - Merged search logic

### Files to Update
1. `priceCheck.worker.ts` - ✅ Use Kiwi instead of mock
2. `notification.worker.ts` - ✅ Send emails
3. `watchlist.controller.ts` - Use new search
4. `flights.controller.ts` - Use merged API
5. `index.ts` - Initialize workers

### Database
1. Run `prisma migrate dev --name update_schema`
2. Run `prisma db push`

---

## 📝 Implementation Checklist

### Week 1: Core Pipeline
- [ ] Sign up for Kiwi.com free tier
- [ ] Create `kiwi.service.ts`
  - [ ] searchFlights(origin, destination, date)
  - [ ] getFlightDetails(id)
  - [ ] Handle rate limiting
  - [ ] Error handling
  
- [ ] Create `flightSearch.service.ts`
  - [ ] Merge Kiwi + AviationStack
  - [ ] Cache results in Redis
  - [ ] Return normalized format
  
- [ ] Database migrations
  - [ ] Update schema
  - [ ] Run migrations
  - [ ] Verify tables
  
- [ ] Update workers
  - [ ] Fix price check worker
  - [ ] Fix notification worker
  - [ ] Test end-to-end

### Week 2: Testing & Integration
- [ ] Manual API testing
  - [ ] Kiwi.com searches
  - [ ] Price comparisons
  - [ ] Cache hits/misses
  
- [ ] Worker testing
  - [ ] Price check runs
  - [ ] Alerts triggered correctly
  - [ ] Emails sent
  
- [ ] Frontend integration
  - [ ] Connect to new endpoints
  - [ ] Display real prices
  - [ ] Test watchlist flow
  
- [ ] Optimization
  - [ ] Cache strategies
  - [ ] API quota monitoring
  - [ ] Rate limiting

---

## 🎨 Example: Complete Search Response

```json
{
  "searchId": "search_xyz",
  "route": {
    "from": "NYC",
    "to": "LAX",
    "date": "2024-06-30"
  },
  "results": [
    {
      "id": "flight_abc123",
      "price": 245,
      "airline": "United",
      "airlineCode": "UA",
      "flightNumber": "UA1234",
      "aircraft": "B787-9",
      "departure": {
        "airport": "JFK",
        "time": "2024-06-30T10:00:00Z",
        "terminal": "4"
      },
      "arrival": {
        "airport": "LAX",
        "time": "2024-06-30T13:15:00Z"
      },
      "duration": 330,
      "stops": 0,
      "cabinClass": "economy",
      "priceHistory": {
        "lowest24h": 235,
        "highest24h": 399,
        "trend": "up" // up, down, stable
      },
      "dealIndicator": "good" // poor, fair, good, excellent
    }
  ],
  "meta": {
    "cached": false,
    "cachedAt": null,
    "expiresAt": "2024-05-31T20:30:00Z"
  }
}
```

---

## 🔗 Resources

### Kiwi.com API
- Docs: https://tequila.kiwi.com/documentation
- Explorer: https://tequila.kiwi.com/apidocs
- Free tier: No credit card needed

### Alternatives if Kiwi fails
1. **RapidAPI (Flight Price API)** - $15-30/month
2. **Amadeus API** - Free tier + paid
3. **Kayak/Skyscanner partners** - Enterprise

---

## ⚠️ Kiwi.com Free Tier Limits

| Metric | Free Tier | Notes |
|--------|-----------|-------|
| Requests/month | 500 | Usually enough for MVP |
| Requests/minute | 10 | Respect this! |
| Cache timeout | N/A | We'll use Redis 24h |
| Support | Community | Enough for initial phase |

### Strategy to Stay Within Limits
- Cache every search for 24h
- Don't re-search unless cache expires
- Batch price checks (every 4 hours, not every hour)
- Limit to active watchlists only

---

## 📊 Expected Performance

With Kiwi.com + Redis caching:

```
First search (cache miss):  2-3 seconds
Cached search:              <200ms
Price check for 100 lists:  ~50-100 API calls (stay under quota)
Cache hit rate:             ~95% (most users search same routes)
Monthly API usage:          ~400/500 (plenty of headroom)
```

---

## 🎯 Next Steps

1. **Get Kiwi.com API Key** (5 min)
   - Go to https://tequila.kiwi.com/
   - Sign up (free)
   - Copy API key to `.env`

2. **I'll build `kiwi.service.ts`** (30 min)
   - Complete Kiwi integration
   - Proper error handling
   - Rate limiting

3. **Update the worker** (30 min)
   - Swap mock data for real Kiwi prices
   - Test end-to-end

4. **Test everything** (1 hour)
   - Search flights
   - Check prices
   - Receive email alerts

---

**Total time to MVP with real pricing: 2-3 hours** ✅
