import { WatchlistRepository } from "../repositories/watchlist.repository";
import { PriceHistoryRepository } from "../repositories/priceHistory.repository";
import { NotificationRepository } from "../repositories/notification.repository";

export class WatchlistService {
  private watchlistRepository =
    new WatchlistRepository();

  private priceHistoryRepository =
    new PriceHistoryRepository();

  private notificationRepository =
    new NotificationRepository();

  async create(data: {
    origin: string;
    destination: string;
    departureDate: Date | string;
    returnDate?: Date | string | null;
    budget: number;
    passengers: number;
    flightType: string;
    cabinClass: string;
    active: boolean;
    userId: string;
  }) {
    const watchlist =
      await this.watchlistRepository.create(data);

    return watchlist;
  }

  async getMyWatchlists(userId: string) {
    return this.watchlistRepository.findByUserId(
      userId
    );
  }

  async getById(id: string) {
    return this.watchlistRepository.findById(id);
  }

  async getPriceHistory(
    watchlistId: string
  ) {
    return this.priceHistoryRepository.findByWatchlistId(
      watchlistId
    );
  }

  async update(id: string, data: any) {
    return this.watchlistRepository.update(id, data);
  }

  async delete(id: string) {
    return this.watchlistRepository.delete(id);
  }

  async getAlerts(watchlistId: string, userId: string) {
    const watchlist = await this.watchlistRepository.findById(watchlistId);
    if (!watchlist) {
      return [];
    }

    return this.notificationRepository.findByUserId(userId);
  }
}
