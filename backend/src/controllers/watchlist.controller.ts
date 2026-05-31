import { Request, Response } from "express";
import { WatchlistService } from "../services/watchlist.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { setTopFlights, getTopFlightsFromCache } from "../utils/topFlightsCache";

const watchlistService = new WatchlistService();

export class WatchlistController {
  async create(
    req: AuthRequest,
    res: Response
  ) {
    try {
      console.log("🔵 [CREATE START] User:", req.userId);
      console.log("🔵 [CREATE START] Body:", JSON.stringify(req.body).substring(0, 200));

      const watchlist =
        await watchlistService.create({
          ...req.body,
          userId: req.userId!,
        });

      console.log("🟢 [CREATE SUCCESS] ID:", watchlist.id);

      // Build response data
      const responseData = {
        id: watchlist.id,
        origin: watchlist.origin,
        destination: watchlist.destination,
        departureDate: watchlist.departureDate,
        returnDate: watchlist.returnDate,
        budget: watchlist.budget,
        passengers: watchlist.passengers,
        cabinClass: watchlist.cabinClass,
        active: watchlist.active,
        message: "Watch created! Searching for flights and sending email...",
      };

      // Send response immediately
      res.status(201).json(responseData);

      // Queue job asynchronously AFTER response is sent
      try {
        const queueModule = await import("../queues/priceCheck.queue");
        const queue = queueModule?.priceCheckQueue;
        if (queue?.add && typeof queue.add === 'function') {
          queue.add("price-check", { watchlistId: watchlist.id }, {
            attempts: 1
          }).catch(err => console.warn("Queue error:", err?.message));
        }
      } catch (err: any) {
        console.warn("Queue init error:", err?.message);
      }

    } catch (error: any) {
      console.error("🔴 [CREATE ERROR] Message:", error?.message);
      console.error("🔴 [CREATE ERROR] Code:", error?.code);
      console.error("🔴 [CREATE ERROR] Stack:", error?.stack);
      console.error("🔴 [CREATE ERROR] Full Error:", error);

      return res.status(500).json({
        message: error?.message || "Failed to create watch",
        details: error?.code,
      });
    }
  }

  async getMyWatchlists(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const watchlists =
        await watchlistService.getMyWatchlists(
          req.userId!
        );

      return res.json({
        watchlists,
        alerts: [],
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }

  async getById(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const watchlist =
        await watchlistService.getById(
          req.params.id
        );

      if (!watchlist) {
        return res.status(404).json({
          message: "Watchlist not found",
        });
      }

      // Check if top flights are cached
      const topFlights = getTopFlightsFromCache(req.params.id);

      return res.json({
        ...watchlist,
        topFlights: topFlights || null,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }

  async getPriceHistory(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const history =
        await watchlistService.getPriceHistory(
          req.params.id
        );

      return res.json(history);
    } catch (error) {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }

  async update(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const watchlist =
        await watchlistService.update(
          req.params.id,
          req.body
        );

      return res.json(watchlist);
    } catch (error) {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }

  async delete(
    req: AuthRequest,
    res: Response
  ) {
    try {
      await watchlistService.delete(
        req.params.id
      );

      return res.json({
        message: "Watchlist deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }

  async getAlerts(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const alerts =
        await watchlistService.getAlerts(
          req.params.id,
          req.userId!
        );

      return res.json({
        alerts: alerts || [],
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }

  async getTopFlights(
    req: AuthRequest,
    res: Response
  ) {
    const watchlistId = req.params.id as string;
    const cached = getTopFlightsFromCache(watchlistId);

    if (cached) {
      return res.json({
        success: true,
        data: {
          ready: true,
          ...cached,
        },
      });
    }

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
}