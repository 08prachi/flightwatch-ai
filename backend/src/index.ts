import "./env";
import express from "express";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import watchlistRoutes from "./routes/watchlist.routes";
import notificationRoutes from "./routes/notification.routes";
import searchRoutes from "./routes/search.routes";

import "./workers/priceCheck.worker";
import "./schedulers/watchlist.scheduler";
import "./workers/notification.worker";

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/user", userRoutes);
app.use("/api/watchlists", watchlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", searchRoutes);

app.use(
  "/api/auth",
  authRoutes
);

// Test route
app.get("/api/watchlists/:id/test-top-flights", (_req, res) => {
  res.json({ test: "working", id: _req.params.id });
});

app.get(
  "/health",
  (_req, res) => {
    res.json({
      status: "ok",
    });
  }
);

app.listen(3000, () => {
  console.log(
    "🚀 Server Running on Port 3000"
  );
});