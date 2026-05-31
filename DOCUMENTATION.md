# FlightWatch AI - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [External APIs](#external-apis)
7. [Internal Services](#internal-services)
8. [Authentication Flow](#authentication-flow)
9. [Flight Search Process](#flight-search-process)
10. [Job Queue System](#job-queue-system)
11. [Notification System](#notification-system)
12. [Frontend Structure](#frontend-structure)
13. [Deployment & Setup](#deployment--setup)
14. [Environment Variables](#environment-variables)

---

## Project Overview

**FlightWatch AI** is a smart flight price tracking platform that monitors flight prices across multiple dates and sends alerts when prices drop or meet user budgets.

### Key Features
- User authentication with JWT
- Create and manage flight watchlists
- Real-time flight price monitoring via SerpAPI
- Automatic email notifications for price changes
- Detailed price history tracking
- PDF reports of flight price analysis
- Top 3 cheapest flights per day
- Historical price data visualization

---

## Architecture

### System Design
```
┌─────────────────────┐
│   React Frontend    │
│   (Port 5173)       │
└──────────┬──────────┘
           │ HTTP/REST
┌──────────▼──────────────────────┐
│   Express Backend               │
│   (Port 3000)                   │
│  ┌──────────────────────────┐   │
│  │ API Routes               │   │
│  │ - Auth                   │   │
│  │ - Watchlists            │   │
│  │ - Price History         │   │
│  │ - Notifications         │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ Services                │   │
│  │ - UserService           │   │
│  │ - WatchlistService      │   │
│  │ - EmailService          │   │
│  │ - PDFGenerationService  │   │
│  │ - FlightAggregation     │   │
│  └──────────────────────────┘   │
└────┬──────────────────────┬──────┘
     │                      │
     ▼                      ▼
┌─────────────┐       ┌──────────────┐
│ PostgreSQL  │       │  Redis       │
│ Database    │       │  (Job Queue) │
└─────────────┘       └──────────────┘
     ▲                      ▲
     │                      │
     └──────────┬───────────┘
                │
      ┌─────────▼────────────┐
      │ Background Workers   │
      │ ┌──────────────────┐ │
      │ │ PriceCheck       │ │
      │ │ Worker           │ │
      │ └──────────────────┘ │
      │ ┌──────────────────┐ │
      │ │ Notification     │ │
      │ │ Worker           │ │
      │ └──────────────────┘ │
      └──────────┬───────────┘
                 │
        ┌────────┴──────────┬──────────────┐
        ▼                   ▼              ▼
   ┌─────────┐         ┌────────┐    ┌─────────┐
   │ SerpAPI │         │ Gmail  │    │ Cron    │
   │ (Flight │         │ SMTP   │    │ Jobs    │
   │ Search) │         │        │    │         │
   └─────────┘         └────────┘    └─────────┘
```

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js (v5.2.1)
- **Database**: PostgreSQL with Prisma ORM (v6.19.3)
- **Job Queue**: BullMQ (v5.77.6) with Redis
- **Authentication**: JWT (jsonwebtoken v9.0.3)
- **Password Hashing**: bcrypt (v6.0.0)
- **Email**: Nodemailer (v8.0.10)
- **PDF Generation**: PDFKit (v0.18.0)
- **Scheduling**: node-cron (v4.2.1)
- **HTTP Client**: axios (v1.16.1)
- **Validation**: zod (v4.4.3)

### Frontend
- **Framework**: Vanilla JavaScript (ES6+)
- **Bundler**: Vite (v5.4.21)
- **Styling**: Tailwind CSS
- **Charting**: Chart.js (auto)
- **HTTP Client**: axios

### Infrastructure
- **Database**: PostgreSQL (localhost:5432)
- **Cache/Queue**: Redis (localhost:6379)
- **Process Manager**: concurrently (for dev)

---

## Database Schema

### Users Table
```sql
CREATE TABLE "User" (
  id           TEXT PRIMARY KEY DEFAULT uuid(),
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL (hashed with bcrypt),
  createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose**: Store user accounts and authentication data

### Watchlists Table
```sql
CREATE TABLE "Watchlist" (
  id             TEXT PRIMARY KEY DEFAULT uuid(),
  origin         TEXT NOT NULL,          -- Departure airport code (e.g., BKK)
  destination    TEXT NOT NULL,          -- Arrival airport code (e.g., DEL)
  departureDate  DATE NOT NULL,          -- Exact departure date
  returnDate     DATE,                   -- Optional return date for round trips
  budget         FLOAT NOT NULL,         -- Maximum price user is willing to pay
  currentPrice   FLOAT,                  -- Latest found price
  lowestPrice    FLOAT,                  -- Historical lowest price
  passengers     INT DEFAULT 1,          -- Number of passengers
  flightType     TEXT DEFAULT 'any',     -- 'direct', 'oneStop', 'any'
  cabinClass     TEXT DEFAULT 'economy', -- 'economy', 'business', etc.
  airline        TEXT,                   -- Specific airline filter (optional)
  active         BOOLEAN DEFAULT true,   -- Is this watchlist active?
  userId         TEXT NOT NULL,          -- FK to User
  createdAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  INDEX (userId),
  INDEX (active)
);
```
**Purpose**: Store flight watchlists that users are monitoring

### PriceHistory Table
```sql
CREATE TABLE "PriceHistory" (
  id           TEXT PRIMARY KEY DEFAULT uuid(),
  watchlistId  TEXT NOT NULL,            -- FK to Watchlist
  price        FLOAT NOT NULL,           -- Cheapest price found in this check
  flightCount  INT DEFAULT 0,            -- Number of flights found
  lowestPrice  FLOAT,                    -- Minimum price from this check
  highestPrice FLOAT,                    -- Maximum price from this check
  createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (watchlistId) REFERENCES "Watchlist"(id) ON DELETE CASCADE,
  INDEX (watchlistId),
  INDEX (createdAt)
);
```
**Purpose**: Track historical price data for each watchlist

### Notifications Table
```sql
CREATE TABLE "Notification" (
  id        TEXT PRIMARY KEY DEFAULT uuid(),
  userId    TEXT NOT NULL,               -- FK to User
  type      TEXT NOT NULL,               -- 'price_drop', 'price_alert', 'system'
  title     TEXT NOT NULL,
  message   TEXT NOT NULL,
  data      TEXT,                        -- JSON string with additional data
  read      BOOLEAN DEFAULT false,       -- Has user seen this?
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  INDEX (userId),
  INDEX (read),
  INDEX (createdAt)
);
```
**Purpose**: Store notifications/alerts for users

---

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201):
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

### User Routes (`/api/users`)

#### Get Profile
```
GET /api/users/profile
Authorization: Bearer jwt_token

Response (200):
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-05-31T...",
  "updatedAt": "2026-05-31T..."
}
```

#### Update Profile
```
PUT /api/users/profile
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "name": "Jane Doe"
}

Response (200): Updated user object
```

### Watchlist Routes (`/api/watchlists`)

#### Create Watchlist
```
POST /api/watchlists
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "origin": "BKK",
  "destination": "DEL",
  "departureDate": "2026-06-10",
  "returnDate": null,
  "budget": 500,
  "passengers": 1,
  "flightType": "any",
  "cabinClass": "economy",
  "active": true
}

Response (201):
{
  "id": "watchlist_id",
  "origin": "BKK",
  "destination": "DEL",
  ...
  "message": "Watch created! Searching for flights and sending email..."
}

Side Effect: Triggers price check job immediately
```

#### Get All Watchlists
```
GET /api/watchlists
Authorization: Bearer jwt_token

Response (200):
{
  "watchlists": [
    {
      "id": "watchlist_id",
      "origin": "BKK",
      "destination": "DEL",
      "currentPrice": 195.00,
      "lowestPrice": 195.00,
      ...
    }
  ],
  "alerts": []
}
```

#### Get Watchlist by ID
```
GET /api/watchlists/{id}
Authorization: Bearer jwt_token

Response (200):
{
  "id": "watchlist_id",
  "origin": "BKK",
  "destination": "DEL",
  ...
  "topFlights": {
    "flights": [
      {
        "rank": 1,
        "price": 195.00,
        "date": "2026-06-10",
        "airline": "SriLankan",
        "departureTime": "07:45",
        "arrivalTime": "04:15",
        "duration": 1320,
        "stops": 1
      }
    ],
    "statistics": { ... },
    "cachedAt": "2026-05-31T..."
  }
}
```

#### Get Price History
```
GET /api/watchlists/{id}/price-history?days=30
Authorization: Bearer jwt_token

Response (200):
{
  "history": [
    {
      "id": "history_id",
      "watchlistId": "watchlist_id",
      "price": 195.00,
      "flightCount": 64,
      "lowestPrice": 195.00,
      "highestPrice": 483.00,
      "createdAt": "2026-05-31T13:35:00Z"
    }
  ]
}
```

#### Get Top Flights
```
GET /api/watchlists/{id}/top-flights
Authorization: Bearer jwt_token

Response (200):
{
  "success": true,
  "data": {
    "ready": true,
    "flights": [{ ... }],
    "statistics": { ... }
  }
}
```

#### Get Alerts/Notifications
```
GET /api/watchlists/{id}/alerts
Authorization: Bearer jwt_token

Response (200):
{
  "alerts": [
    {
      "id": "notification_id",
      "type": "price_drop",
      "title": "Price Alert!",
      "message": "Flight price dropped to $195",
      "data": "{...}",
      "read": false,
      "createdAt": "2026-05-31T..."
    }
  ]
}
```

#### Update Watchlist
```
PUT /api/watchlists/{id}
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "budget": 600,
  "active": false
}

Response (200): Updated watchlist object
```

#### Toggle Watchlist Active Status
```
PATCH /api/watchlists/{id}
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "active": false
}

Response (200): Updated watchlist object
```

#### Delete Watchlist
```
DELETE /api/watchlists/{id}
Authorization: Bearer jwt_token

Response (200):
{
  "message": "Watchlist deleted successfully"
}
```

### Notification Routes (`/api/notifications`)

#### Get Notifications
```
GET /api/notifications
Authorization: Bearer jwt_token

Response (200):
{
  "notifications": [
    {
      "id": "notification_id",
      "type": "price_drop",
      "title": "Price dropped!",
      "message": "...",
      "read": false,
      "createdAt": "2026-05-31T..."
    }
  ]
}
```

#### Mark as Read
```
PUT /api/notifications/{id}/read
Authorization: Bearer jwt_token

Response (200): Updated notification
```

---

## External APIs

### 1. SerpAPI (Flight Search)

**Purpose**: Real-time flight price search via Google Flights

**Endpoint**: `https://serpapi.com/search`

**Configuration**:
- **API Key**: `SERPAPI_API_KEY` (environment variable)
- **Engine**: `google_flights`

**Request Format**:
```javascript
{
  engine: 'google_flights',
  departure_id: 'BKK',           // IATA code
  arrival_id: 'DEL',              // IATA code
  outbound_date: '2026-06-10',    // YYYY-MM-DD
  return_date: '2026-06-15',      // Optional for round trips
  type: '2',                       // 1=roundtrip, 2=oneway
  adults: 1,
  api_key: 'your_key_here'
}
```

**Response Structure**:
```javascript
{
  "best_flights": [
    {
      "price": 195,
      "flights": [
        {
          "airline": "SriLankan",
          "departure_airport": { "time": "07:45" },
          "arrival_airport": { "time": "04:15" }
        }
      ],
      "layovers": [{}],            // Array of layover info
      "total_duration": 1320        // In minutes
    }
  ],
  "other_flights": [...]
}
```

**Implementation**: 
- File: `backend/src/providers/hasdata.service.ts`
- Method: `searchFlights()`
- Called by: Price check worker

### 2. Gmail SMTP (Email Notifications)

**Purpose**: Send email notifications to users

**Configuration**:
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=app_password          # Gmail app-specific password, not regular password
```

**Email Types Sent**:
1. **Price Analysis Email** - Top 3 cheapest flights + best day
2. **Price Drop Alert** - When price falls below previous low
3. **Budget Alert** - When price meets user budget
4. **Weekly Digest** - Summary of price changes
5. **Signup Confirmation** - Welcome email

**Implementation**:
- File: `backend/src/services/email.service.ts`
- Provider: Nodemailer with Gmail SMTP
- Triggered by: Notification worker

### 3. Prisma Database ORM

**Purpose**: Type-safe database access

**Configuration**:
- Database: PostgreSQL
- Connection: `DATABASE_URL` environment variable
- Migrations: In `prisma/migrations/`

---

## Internal Services

### 1. UserRepository
**File**: `backend/src/repositories/user.repository.ts`

**Methods**:
- `findByEmail(email: string)` - Get user by email
- `create(data)` - Create new user
- `findById(id: string)` - Get user by ID
- `update(id, data)` - Update user

### 2. UserService
**File**: `backend/src/services/user.service.ts`

**Methods**:
- `register(data)` - Sign up with email/password
- `login(email, password)` - Authenticate user
- `getProfile(id)` - Get user details
- `updateProfile(id, data)` - Update user info

### 3. WatchlistService
**File**: `backend/src/services/watchlist.service.ts`

**Methods**:
- `create(data)` - Create new watchlist
- `getMyWatchlists(userId)` - Get user's watchlists
- `getById(id)` - Get specific watchlist
- `getPriceHistory(watchlistId)` - Get price history
- `getAlerts(watchlistId, userId)` - Get notifications
- `update(id, data)` - Update watchlist
- `delete(id)` - Delete watchlist

### 4. EmailService
**File**: `backend/src/services/email.service.ts`

**Methods**:
- `sendEmail(options)` - Send generic email
- `sendSignupConfirmation(email, name)` - Welcome email
- `sendPriceDropAlert(...)` - Price dropped notification
- `sendPriceAnalysis(email, userName, route, flights, bestDay)` - Detailed price report
- `sendPriceAnalysisWithPDF(...)` - Price report with PDF attachment
- `sendBudgetAlert(...)` - Budget notification
- `sendWeeklyDigest(...)` - Weekly summary

### 5. PDFGenerationService
**File**: `backend/src/services/pdfGeneration.service.ts`

**Features**:
- Generates detailed flight price analysis PDFs
- Organized by date with top 3 flights per day highlighted in green
- Shows summary statistics (cheapest, average, most expensive fares)
- Lists all flights for each searched date

**Output**: Base64-encoded PDF buffer (sent via email)

### 6. FlightAggregationService
**File**: `backend/src/services/flightAggregation.service.ts`

**Methods**:
- `aggregateFlights(flightsByDate)` - Group and sort flights
- `calculateFareStatistics(flights)` - Compute stats (min, max, avg, etc.)

### 7. HasDataService (SerpAPI Integration)
**File**: `backend/src/providers/hasdata.service.ts`

**Methods**:
- `searchFlights(params)` - Search flights via SerpAPI
- `getLowestPrice(from, to, date)` - Get cheapest flight
- `isHealthy()` - Check API key status
- `getStatus()` - Return provider status

---

## Authentication Flow

### JWT-Based Authentication

#### Sign Up Flow
```
1. User submits: email, password, name
2. Backend validates input
3. Hash password using bcrypt (rounds: 10)
4. Create user in database
5. Generate JWT token: sign(userId, JWT_SECRET)
6. Return token + user data
7. Frontend stores token in localStorage
```

#### Login Flow
```
1. User submits: email, password
2. Backend finds user by email
3. Compare password with bcrypt hash
4. Generate JWT token
5. Return token + user data
```

#### Protected Routes
```
1. Frontend includes Authorization header: Bearer {token}
2. Middleware verifies token signature
3. Extract userId from token payload
4. Attach userId to request object
5. Allow route handler to proceed
6. Return 401 if token invalid/expired
```

#### Token Structure
```javascript
{
  userId: "user_uuid",
  iat: 1672531200,    // Issued at
  exp: never          // No expiration currently
}
```

---

## Flight Search Process

### Complete Price Check Flow

#### Trigger Point
1. **On Watchlist Creation** - Job added immediately
2. **Via Scheduler** - Runs at specified intervals (configured with node-cron)

#### Step-by-Step Process

```
1. Job Enqueued
   └─ watchlistId in price-check queue
   
2. Worker Picks Up Job
   └─ PriceCheck Worker (background process)
   
3. Fetch Watchlist Details
   └─ Get origin, destination, dates, preferences
   
4. Search Flights (via SerpAPI)
   ├─ Loop through each day in search window
   │  └─ searchDays = env.SEARCH_DAYS (default: 7)
   │
   └─ For each date:
      ├─ Call SerpAPI with:
      │  ├─ departure airport code
      │  ├─ arrival airport code
      │  ├─ departure date
      │  ├─ cabin class
      │  └─ number of passengers
      │
      └─ Parse response:
         ├─ Extract best_flights array
         ├─ Extract other_flights array
         └─ Combine and sort by price
   
5. Aggregate Results
   └─ Group flights by date
   └─ Calculate statistics:
      ├─ Cheapest fare
      ├─ Most expensive fare
      ├─ Average fare
      └─ Daily lowest prices
   
6. Identify Top Flights
   └─ Find top 3 cheapest across all dates
   └─ Find best day (lowest average price)
   
7. Save to Database
   └─ Create PriceHistory record:
      ├─ price: cheapest found
      ├─ flightCount: total flights found
      ├─ lowestPrice: minimum from this check
      ├─ highestPrice: maximum from this check
      └─ createdAt: timestamp
   
8. Update Watchlist
   └─ Set currentPrice = cheapest
   └─ Set lowestPrice = min(historical_lowest, current_cheapest)
   
9. Generate PDF Report
   └─ Create PDF with:
      ├─ Summary statistics
      ├─ All flights organized by date
      ├─ Top 3 flights per day highlighted
      └─ Lowest price for each date
   
10. Queue Notification
    └─ Add to notification-queue:
       ├─ type: "price-analysis-with-pdf"
       ├─ email: user email
       ├─ data:
       │  ├─ top3Cheapest flights
       │  ├─ bestDay info
       │  └─ pdfBuffer (base64)
       └─ This is picked up by Notification Worker
   
11. Cache Top Flights
    └─ Store in-memory cache:
       ├─ flights: top 3 for frontend
       ├─ statistics: fare stats
       └─ cachedAt: timestamp
   
12. Return Job Result
    └─ Return to BullMQ:
       ├─ watchlistId
       ├─ top3Flights
       ├─ statistics
       └─ ready: true
```

#### SerpAPI Response Parsing
```javascript
// Raw SerpAPI Response
{
  best_flights: [
    {
      price: 195,
      flights: [
        {
          airline: "SriLankan",
          departure_airport: { time: "07:45" },
          arrival_airport: { time: "04:15" }
        },
        { ... }  // More flight legs
      ],
      layovers: [{ ... }],
      total_duration: 1320
    }
  ],
  other_flights: [ ... ]
}

// Parsed Output
[
  {
    price: 195,
    airline: "SriLankan",
    departure_time: "07:45",
    arrival_time: "04:15",
    duration: 1320,
    stops: 1,
    date: "2026-06-10"
  },
  { ... }
]
```

#### Error Handling
```
If flight search fails for a date:
└─ Log error
└─ Continue with next date
└─ If NO flights found across all dates:
   └─ Job completes
   └─ No email sent
   └─ No PriceHistory created
```

---

## Job Queue System

### Technology: BullMQ + Redis

**Why**: Handle background jobs without blocking API responses

### Queues

#### 1. Price Check Queue
**Purpose**: Search flights and gather price data

**File**: `backend/src/queues/priceCheck.queue.ts`

**Trigger Points**:
- When watchlist is created (immediate)
- Scheduled jobs (via watchlist.scheduler.ts)

**Job Data**:
```javascript
{
  watchlistId: "uuid"
}
```

**Job Options**:
```javascript
{
  attempts: 1,  // No retries to avoid duplicate emails
  backoff: { type: "exponential", delay: 2000 }
}
```

**Worker**: `backend/src/workers/priceCheck.worker.ts`
**Processing Time**: 30-60 seconds per watchlist

#### 2. Notification Queue
**Purpose**: Send emails asynchronously

**File**: `backend/src/queues/notification.queue.ts`

**Trigger Points**:
- After price check completes (with PDF)
- Manual notifications

**Job Data**:
```javascript
{
  userId: "uuid",
  email: "user@example.com",
  userName: "John Doe",
  type: "price-analysis-with-pdf",
  message: "Top 3 cheapest flights...",
  data: {
    route: "BKK → DEL",
    top3Cheapest: [{...}, {...}, {...}],
    bestDay: { date, lowestPrice, avgPrice },
    pdfBuffer: "base64_string"
  }
}
```

**Worker**: `backend/src/workers/notification.worker.ts`
**Processing Time**: 2-5 seconds per email

### Job Lifecycle

```
1. Job Created
   └─ Added to Redis queue
   └─ Status: waiting

2. Worker Picks Up
   └─ Status: active

3. Job Processing
   ├─ Success
   │  └─ Status: completed
   │  └─ Remove from queue
   │
   └─ Failure (with attempts > 0)
      ├─ Status: failed
      ├─ Scheduled for retry
      └─ Apply backoff delay (exponential)

4. Event Emissions
   └─ 'completed': job finished successfully
   └─ 'failed': job failed
   └─ 'error': worker error
```

### Monitoring

**Get Queue Status**:
```javascript
const jobCounts = await priceCheckQueue.getJobCounts();
// Returns: { waiting, active, completed, failed, delayed }
```

**View Completed Jobs**:
```javascript
const completedJobs = await priceCheckQueue.getCompleted();
```

---

## Notification System

### Email Types

#### 1. Price Analysis with PDF
**Triggers**: After every successful price check
**Content**:
- Route (e.g., BKK → DEL)
- Top 3 cheapest flights across all dates
- Best day (lowest average price)
- PDF report attached
**Recipient**: User email

#### 2. Price Drop Alert
**Triggers**: When current price < previous lowest price
**Content**:
- Route
- Previous lowest price
- New price
- Savings amount & percentage
**Status**: Currently in code but not auto-triggered

#### 3. Budget Alert
**Triggers**: When price meets user's budget
**Content**:
- Route
- User's budget
- Current price
- Available savings
**Status**: Currently in code but not auto-triggered

#### 4. Signup Confirmation
**Triggers**: After user registration
**Content**:
- Welcome message
- Getting started guide
- CTA to create first watchlist

#### 5. Weekly Digest
**Triggers**: Via scheduler (configured separately)
**Content**:
- Total active watchlists
- Number of price drops
- Total savings this week
- Best deal
**Status**: In code but scheduler not configured

### Email Configuration

**Provider**: Gmail SMTP
**Credentials**: 
- `EMAIL_USER`: Gmail address
- `EMAIL_PASS`: Gmail app-specific password (NOT regular password)

**Steps to Generate App Password**:
1. Enable 2FA on Gmail
2. Go to Google Account → Security
3. Create "App Password" for Mail
4. Use this password in `EMAIL_PASS`

---

## Frontend Structure

### Project Layout
```
frontend/
├── src/
│   ├── api/
│   │   ├── auth.js         # Authentication API calls
│   │   ├── watchlist.js    # Watchlist CRUD
│   │   ├── flights.js      # Flight data
│   │   └── notifications.js # Notifications
│   │
│   ├── pages/
│   │   ├── home.js         # Landing page
│   │   ├── login.js        # Login form
│   │   ├── signup.js       # Registration form
│   │   ├── dashboard.js    # Main dashboard
│   │   ├── watchlist.js    # Watchlists list
│   │   ├── watchlist-details.js   # Details & price chart
│   │   ├── create-watch.js # New watchlist form
│   │   ├── search.js       # Flight search
│   │   ├── flight-results.js# Search results
│   │   ├── notifications.js# Alerts
│   │   └── settings.js     # User settings
│   │
│   ├── components/
│   │   └── header.js       # Navigation component
│   │
│   ├── utils/
│   │   ├── api.js          # Axios instance + interceptors
│   │   ├── storage.js      # LocalStorage helpers
│   │   ├── router.js       # Client-side routing
│   │   └── helpers.js      # Utility functions
│   │
│   └── main.js             # Entry point
│
└── index.html              # HTML template
```

### Key Features

#### Authentication
- JWT stored in localStorage
- Auto-include in API headers via axios interceptor
- Logout clears token

#### Routing
- Client-side routing (no page reloads)
- Routes handled by `utils/router.js`
- URL patterns: `/page?params`

#### API Integration
- Central axios instance in `utils/api.js`
- Base URL: `http://localhost:3000`
- Authorization header: `Bearer {token}`
- Error handling: display toasts

#### Data Display
- Watchlist cards with price info
- Price history chart (Chart.js)
- Top 3 flights section
- Alerts/notifications list

---

## Deployment & Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- Redis (v6+)
- npm or yarn

### Local Setup

#### 1. Clone Repository
```bash
git clone https://github.com/08prachi/flightwatch-ai.git
cd flightwatch-ai
```

#### 2. Install Dependencies
```bash
npm run install:all
# OR
cd backend && npm install && cd ../frontend && npm install
```

#### 3. Environment Configuration

Create `.env` in project root:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flightwatch"

# JWT
JWT_SECRET=your-super-secret-key-here

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Flight Search
SERPAPI_API_KEY=your_serpapi_key_here

# Job Scheduling
SEARCH_DAYS=7

# Optional
REDIS_URL=redis://localhost:6379
```

#### 4. Database Setup
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed  # Optional: seed with sample data
```

#### 5. Start Services

Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Terminal 3 (Redis - if not running as service):
```bash
redis-server
# Runs on localhost:6379
```

Terminal 4 (PostgreSQL - if not running as service):
```bash
# MacOS with Homebrew
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Or use Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

### Production Deployment

#### Build
```bash
npm run build
# Outputs: backend/dist, frontend/dist
```

#### Environment Variables
Set all environment variables in production hosting platform (Heroku, Vercel, AWS, etc.)

#### Database Migrations
```bash
npm run backend:build
NODE_ENV=production npx prisma migrate deploy
```

#### Start Server
```bash
npm start
# Starts: node backend/dist/index.js
```

---

## Environment Variables Reference

### Required

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | JWT signing key | `super-secret-key` |
| `SERPAPI_API_KEY` | Flight search API | `c4f1eeef3a87631bfa...` |
| `EMAIL_USER` | Gmail address | `noreply@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `abcd efgh ijkl mnop` |

### Optional

| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `SEARCH_DAYS` | Days to search ahead | `7` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |

---

## Troubleshooting

### Email Not Sending
**Problem**: "Invalid API key" or SMTP errors
**Solution**:
1. Verify Gmail app password (not regular password)
2. Enable "Less secure apps" if using regular password
3. Check EMAIL_USER and EMAIL_PASS in .env

### No Flights Found
**Problem**: Price check returns no flights
**Solution**:
1. Verify SerpAPI key is valid
2. Check if route is supported (use real IATA codes)
3. Verify date is in future
4. Check SerpAPI account has credits

### Database Connection Failed
**Problem**: Cannot connect to PostgreSQL
**Solution**:
1. Verify PostgreSQL is running: `psql -U postgres`
2. Check DATABASE_URL is correct
3. Verify database exists: `createdb flightwatch`

### Redis Connection Failed
**Problem**: BullMQ queue errors
**Solution**:
1. Verify Redis running: `redis-cli ping`
2. Check REDIS_URL in .env (if set)
3. Default: `redis://localhost:6379`

### JWT Token Issues
**Problem**: "Unauthorized" on protected routes
**Solution**:
1. Clear localStorage and re-login
2. Verify JWT_SECRET hasn't changed between restarts
3. Check Authorization header is sent: `Bearer {token}`

---

## Performance Notes

### Database
- Indexes on frequently queried columns:
  - Watchlist: `(userId, active)`
  - PriceHistory: `(watchlistId, createdAt)`
  - Notifications: `(userId, read, createdAt)`

### Caching
- Top flights cached in-memory after each search
- Cache invalidates automatically on next search

### API Response Times
- Login/Signup: ~100-200ms
- Get watchlists: ~50-100ms
- Get watchlist details: ~100-150ms
- Price check: 30-60 seconds (background job)
- Email send: 2-5 seconds (background job)

### Scalability Considerations
1. **Database**: Consider connection pooling at scale
2. **Queues**: BullMQ handles 1000s of jobs efficiently
3. **Email**: Nodemailer can send 100s of emails/minute
4. **PDF**: Generation is memory-intensive; consider async processing
5. **SerpAPI**: Rate limits apply; implement queue delays if needed

---

## Security Notes

### Password Security
- Passwords hashed with bcrypt (rounds: 10)
- Never stored in plaintext
- Never sent in responses

### JWT Security
- Signed with HS256 algorithm
- Secret should be strong (32+ characters)
- Currently no expiration; consider adding

### API Security
- CORS enabled for all origins (consider restricting in production)
- Input validation via Zod
- SQL injection prevented by Prisma ORM
- Email credentials in environment variables (never in code)

### Best Practices
1. Never commit .env files
2. Use strong JWT_SECRET (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
3. Rotate SerpAPI keys regularly
4. Monitor email account for suspicious access
5. Use HTTPS in production
6. Implement rate limiting on APIs
7. Add CSRF protection
8. Sanitize user inputs

---

## API Integration Checklist

- [ ] PostgreSQL running
- [ ] Redis running
- [ ] SerpAPI key obtained and configured
- [ ] Gmail account configured with app password
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Backend server started
- [ ] Frontend server started
- [ ] Can sign up and log in
- [ ] Can create watchlist
- [ ] Receives price analysis email within 2 minutes
- [ ] PDF attached to email
- [ ] Price history displays in dashboard
- [ ] Top flights cached and visible

---

## Support & Development

### Common Development Tasks

#### Add New API Endpoint
1. Create route in `backend/src/routes/`
2. Create controller method
3. Create service method
4. Add to index.ts routing

#### Modify Database Schema
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Deployment: `npx prisma migrate deploy`

#### Debug Background Jobs
1. Check Redis: `redis-cli`
2. Monitor queue: `await queue.getJobCounts()`
3. View failed jobs: `await queue.getFailed(0, -1)`

#### Test Email Sending
1. Run: `node backend/src/scripts/testEmail.ts`
2. Check: `npx ts-node backend/src/scripts/testEmail.ts`

---

**Last Updated**: May 31, 2026
**Project Version**: 1.0.0
**Maintainer**: FlightWatch AI Team

