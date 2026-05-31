"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceHistoryRepository = void 0;
const prisma_1 = require("../config/prisma");
class PriceHistoryRepository {
    async create(data) {
        return prisma_1.prisma.priceHistory.create({
            data,
        });
    }
    async findByWatchlistId(watchlistId) {
        return prisma_1.prisma.priceHistory.findMany({
            where: {
                watchlistId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async getLowestPrice(watchlistId) {
        return prisma_1.prisma.priceHistory.findFirst({
            where: {
                watchlistId,
            },
            orderBy: {
                price: "asc",
            },
        });
    }
}
exports.PriceHistoryRepository = PriceHistoryRepository;
