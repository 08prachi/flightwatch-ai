"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistController = exports.topFlightsCache = void 0;
const watchlist_service_1 = require("../services/watchlist.service");
const watchlistService = new watchlist_service_1.WatchlistService();
// Simple in-memory cache for top flights
exports.topFlightsCache = new Map();
class WatchlistController {
    async create(req, res) {
        try {
            const watchlist = await watchlistService.create({
                ...req.body,
                userId: req.userId,
            });
            return res.status(201).json(watchlist);
        }
        catch (error) {
            return res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong",
            });
        }
    }
    async getMyWatchlists(req, res) {
        try {
            const watchlists = await watchlistService.getMyWatchlists(req.userId);
            return res.json({
                watchlists,
                alerts: [],
            });
        }
        catch (error) {
            return res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong",
            });
        }
    }
    async getById(req, res) {
        try {
            const watchlist = await watchlistService.getById(req.params.id);
            if (!watchlist) {
                return res.status(404).json({
                    message: "Watchlist not found",
                });
            }
            return res.json(watchlist);
        }
        catch (error) {
            return res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong",
            });
        }
    }
    async getPriceHistory(req, res) {
        try {
            const history = await watchlistService.getPriceHistory(req.params.id);
            return res.json(history);
        }
        catch (error) {
            return res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong",
            });
        }
    }
    async update(req, res) {
        try {
            const watchlist = await watchlistService.update(req.params.id, req.body);
            return res.json(watchlist);
        }
        catch (error) {
            return res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong",
            });
        }
    }
    async delete(req, res) {
        try {
            await watchlistService.delete(req.params.id);
            return res.json({
                message: "Watchlist deleted successfully",
            });
        }
        catch (error) {
            return res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong",
            });
        }
    }
    async getTopFlights(req, res) {
        try {
            const watchlistId = req.params.id;
            // Check in-memory cache
            const cached = exports.topFlightsCache.get(watchlistId);
            if (cached) {
                return res.json({
                    success: true,
                    data: {
                        ready: true,
                        ...cached,
                    },
                });
            }
            // Not ready yet
            return res.json({
                success: true,
                data: {
                    ready: false,
                    flights: [],
                    statistics: null,
                    message: "Processing flights...",
                },
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Something went wrong",
            });
        }
    }
}
exports.WatchlistController = WatchlistController;
