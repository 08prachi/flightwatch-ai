import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { WatchlistController } from "../controllers/watchlist.controller";

const router = Router();

const controller =
  new WatchlistController();

router.post(
  "/",
  authMiddleware,
  controller.create
);

router.get(
  "/",
  authMiddleware,
  controller.getMyWatchlists
);

// More specific routes must come BEFORE general /:id route
router.get(
  "/:id/price-history",
  authMiddleware,
  controller.getPriceHistory
);

router.get(
  "/:id/alerts",
  authMiddleware,
  controller.getAlerts
);

router.get(
  "/:id/top-flights",
  authMiddleware,
  controller.getTopFlights
);

// General routes after specific ones
router.get(
  "/:id",
  authMiddleware,
  controller.getById
);

router.put(
  "/:id",
  authMiddleware,
  controller.update
);

router.delete(
  "/:id",
  authMiddleware,
  controller.delete
);

export default router;