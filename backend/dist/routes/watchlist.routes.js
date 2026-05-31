"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const watchlist_controller_1 = require("../controllers/watchlist.controller");
const router = (0, express_1.Router)();
const controller = new watchlist_controller_1.WatchlistController();
router.post("/", auth_middleware_1.authMiddleware, controller.create);
router.get("/", auth_middleware_1.authMiddleware, controller.getMyWatchlists);
// More specific routes must come BEFORE general /:id route
router.get("/:id/history", auth_middleware_1.authMiddleware, controller.getPriceHistory);
router.get("/:id/top-flights", auth_middleware_1.authMiddleware, controller.getTopFlights);
// General routes after specific ones
router.get("/:id", auth_middleware_1.authMiddleware, controller.getById);
router.put("/:id", auth_middleware_1.authMiddleware, controller.update);
router.delete("/:id", auth_middleware_1.authMiddleware, controller.delete);
exports.default = router;
