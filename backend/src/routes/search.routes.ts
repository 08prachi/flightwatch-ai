import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { hasdataService } from "../providers/hasdata.service";

const router = Router();

router.get(
  "/flights",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { from, to, date, passengers = 1, cabin = 'economy' } = req.query;

      if (!from || !to || !date) {
        return res.status(400).json({
          message: "from, to, and date are required",
        });
      }

      const flights = await hasdataService.searchFlights({
        from: from as string,
        to: to as string,
        departure_date: date as string,
        adults: parseInt(passengers as string),
        cabin_class: cabin as string,
      });

      return res.json({
        flights: flights || [],
      });
    } catch (error: any) {
      console.error("Search error:", error.message);
      return res.status(500).json({
        message: error.message || "Failed to search flights",
      });
    }
  }
);

export default router;
