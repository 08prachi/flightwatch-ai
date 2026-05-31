"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../config/prisma");
const priceCheck_queue_1 = require("../queues/priceCheck.queue");
node_cron_1.default.schedule("0 */4 * * *", async () => {
    console.log("🔄 Running Scheduler - Checking prices for active watchlists");
    const watchlists = await prisma_1.prisma.watchlist.findMany({
        where: {
            active: true,
        },
        include: {
            user: true,
        },
    });
    console.log(`📋 Found ${watchlists.length} active watchlists`);
    for (const watchlist of watchlists) {
        await priceCheck_queue_1.priceCheckQueue.add("price-check", {
            watchlistId: watchlist.id,
        });
    }
    console.log(`✅ Queued ${watchlists.length} price check jobs`);
});
