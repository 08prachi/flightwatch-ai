"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistService = void 0;
const watchlist_repository_1 = require("../repositories/watchlist.repository");
const priceCheck_queue_1 = require("../queues/priceCheck.queue");
const priceHistory_repository_1 = require("../repositories/priceHistory.repository");
class WatchlistService {
    watchlistRepository = new watchlist_repository_1.WatchlistRepository();
    priceHistoryRepository = new priceHistory_repository_1.PriceHistoryRepository();
    async create(data) {
        const watchlist = await this.watchlistRepository.create(data);
        await priceCheck_queue_1.priceCheckQueue.add("price-check", {
            watchlistId: watchlist.id,
        });
        return watchlist;
    }
    async getMyWatchlists(userId) {
        return this.watchlistRepository.findByUserId(userId);
    }
    async getById(id) {
        return this.watchlistRepository.findById(id);
    }
    async getPriceHistory(watchlistId) {
        return this.priceHistoryRepository.findByWatchlistId(watchlistId);
    }
    async update(id, data) {
        return this.watchlistRepository.update(id, data);
    }
    async delete(id) {
        return this.watchlistRepository.delete(id);
    }
}
exports.WatchlistService = WatchlistService;
