"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const hasdata_service_1 = require("../providers/hasdata.service");
const router = (0, express_1.Router)();
router.get("/flights", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { from, to, date, passengers = 1, cabin = 'economy' } = req.query;
        if (!from || !to || !date) {
            return res.status(400).json({
                message: "from, to, and date are required",
            });
        }
        const flights = await hasdata_service_1.hasdataService.searchFlights({
            from: from,
            to: to,
            departure_date: date,
            adults: parseInt(passengers),
            cabin_class: cabin,
        });
        return res.json({
            flights: flights || [],
        });
    }
    catch (error) {
        console.error("Search error:", error.message);
        return res.status(500).json({
            message: error.message || "Failed to search flights",
        });
    }
});
exports.default = router;
