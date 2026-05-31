import { prisma } from "../config/prisma";

export class PriceHistoryRepository {
  async create(data: {
    watchlistId: string;
    price: number;
    flightCount: number;
    lowestPrice?: number | null;
    highestPrice?: number | null;
  }) {
    return prisma.priceHistory.create({
      data,
    });
  }

  async findByWatchlistId(
    watchlistId: string
  ) {
    return prisma.priceHistory.findMany({
      where: {
        watchlistId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getLowestPrice(
    watchlistId: string
  ) {
    return prisma.priceHistory.findFirst({
      where: {
        watchlistId,
      },
      orderBy: {
        price: "asc",
      },
    });
  }
}