"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const notification_queue_1 = require("../queues/notification.queue");
const hasdata_service_1 = require("../providers/hasdata.service");
const priceHistory_repository_1 = require("../repositories/priceHistory.repository");
const prisma_1 = require("../config/prisma");
const date_fns_1 = require("date-fns");
const flightAggregation_service_1 = require("../services/flightAggregation.service");
const pdfGeneration_service_1 = require("../services/pdfGeneration.service");
const watchlist_controller_1 = require("../controllers/watchlist.controller");
const priceHistoryRepository = new priceHistory_repository_1.PriceHistoryRepository();
const worker = new bullmq_1.Worker("price-check-queue", async (job) => {
    try {
        console.log("=================================");
        console.log("🚀 Processing Price Check Job");
        console.log(job.data);
        const { watchlistId } = job.data;
        const watchlist = await prisma_1.prisma.watchlist.findUnique({
            where: { id: watchlistId },
            include: { user: true },
        });
        if (!watchlist || !watchlist.user) {
            console.log("❌ Watchlist or user not found");
            return;
        }
        const departureDate = new Date(watchlist.departureDate);
        const allFlights = [];
        // Search flights for next 7 days
        for (let i = 0; i < 1; i++) {
            const searchDate = (0, date_fns_1.addDays)(departureDate, i);
            const formattedDate = (0, date_fns_1.format)(searchDate, 'yyyy-MM-dd');
            try {
                const flights = await hasdata_service_1.hasdataService.searchFlights({
                    from: watchlist.origin,
                    to: watchlist.destination,
                    departure_date: formattedDate,
                    return_date: watchlist.returnDate
                        ? (0, date_fns_1.format)(new Date(watchlist.returnDate), 'yyyy-MM-dd')
                        : undefined,
                    adults: watchlist.passengers,
                    cabin_class: watchlist.cabinClass,
                });
                if (flights.length > 0) {
                    allFlights.push(...flights.map((f) => ({
                        ...f,
                        date: formattedDate,
                    })));
                    console.log(`  ${formattedDate}: ${flights.length} flights`);
                }
            }
            catch (error) {
                console.log(`  ${formattedDate}: No flights found`);
            }
        }
        if (allFlights.length === 0) {
            console.log("⚠️  No flights found for this route in next 7 days");
            return;
        }
        console.log(`✈️  Total Flights Found: ${allFlights.length}`);
        // Find top 3 cheapest flights
        const sortedByPrice = [...allFlights].sort((a, b) => a.price - b.price);
        const top3Cheapest = sortedByPrice.slice(0, 3);
        // Find best day (cheapest day)
        const pricesByDate = allFlights.reduce((acc, flight) => {
            if (!acc[flight.date]) {
                acc[flight.date] = [];
            }
            acc[flight.date].push(flight.price);
            return acc;
        }, {});
        const dailyLowest = Object.entries(pricesByDate).map(([date, prices]) => ({
            date,
            lowestPrice: Math.min(...prices),
            avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        }));
        const bestDay = dailyLowest.sort((a, b) => a.lowestPrice - b.lowestPrice)[0];
        console.log(`💰 Cheapest Price: $${top3Cheapest[0].price}`);
        console.log(`🏆 Best Day: ${bestDay.date} ($${bestDay.lowestPrice})`);
        // Aggregate flights and prepare for PDF generation
        const flightsByDate = new Map();
        allFlights.forEach((flight) => {
            if (!flightsByDate.has(flight.date)) {
                flightsByDate.set(flight.date, []);
            }
            flightsByDate.get(flight.date).push(flight);
        });
        const aggregatedFlights = flightAggregation_service_1.flightAggregationService.aggregateFlights(flightsByDate, watchlist.origin, watchlist.destination);
        const statistics = flightAggregation_service_1.flightAggregationService.calculateFareStatistics(aggregatedFlights, {
            start: (0, date_fns_1.format)(departureDate, 'yyyy-MM-dd'),
            end: (0, date_fns_1.format)((0, date_fns_1.addDays)(departureDate, 1), 'yyyy-MM-dd'),
        });
        // Generate PDF report
        let pdfBuffer = null;
        try {
            console.log("📄 Generating PDF report...");
            pdfBuffer = await pdfGeneration_service_1.pdfGenerationService.generateFlightReport({
                watchlist: {
                    id: watchlist.id,
                    origin: watchlist.origin,
                    destination: watchlist.destination,
                    departureDate: (0, date_fns_1.format)(departureDate, 'yyyy-MM-dd'),
                    returnDate: watchlist.returnDate ? (0, date_fns_1.format)(new Date(watchlist.returnDate), 'yyyy-MM-dd') : null,
                },
                allFlights: aggregatedFlights,
                top3Flights: top3Cheapest.map((f, i) => ({
                    ...f,
                    date: f.date,
                    rank: i + 1,
                    flightNumber: f.flightNumber || f.flight_number || '',
                    departureTime: f.departureTime || f.departure_time || '',
                    arrivalTime: f.arrivalTime || f.arrival_time || '',
                    origin: watchlist.origin,
                    destination: watchlist.destination,
                    provider: 'Google Flights',
                })),
                statistics,
            });
            console.log("✅ PDF generated successfully");
        }
        catch (pdfError) {
            console.error("⚠️  PDF generation failed:", pdfError.message);
            console.log("📧 Continuing with email without PDF...");
        }
        // Prepare top 3 flights for frontend
        const top3ForFrontend = top3Cheapest.map((f, i) => ({
            rank: i + 1,
            price: f.price,
            date: f.date,
            airline: f.airline || 'Multiple Airlines',
            flightNumber: f.flightNumber || f.flight_number || '',
            departureTime: f.departureTime || f.departure_time || '',
            arrivalTime: f.arrivalTime || f.arrival_time || '',
            duration: f.duration || 0,
            stops: f.stops || 0,
            origin: watchlist.origin,
            destination: watchlist.destination,
        }));
        // Send notification with PDF attachment if available
        const notificationType = pdfBuffer ? "price-analysis-with-pdf" : "price-analysis";
        const notificationData = {
            notificationId: null,
            type: notificationType,
            userId: watchlist.user.id,
            email: watchlist.user.email,
            userName: watchlist.user.name,
            message: `Top 3 cheapest flights for ${watchlist.origin} → ${watchlist.destination}`,
            data: {
                route: `${watchlist.origin} → ${watchlist.destination}`,
                currencySymbol: '$',
                top3Cheapest: top3ForFrontend,
                bestDay: {
                    date: bestDay.date,
                    lowestPrice: bestDay.lowestPrice,
                    avgPrice: Math.round(bestDay.avgPrice),
                },
            },
        };
        if (pdfBuffer) {
            notificationData.data.pdfBuffer = pdfBuffer.toString('base64');
        }
        await notification_queue_1.notificationQueue.add("send-notification", notificationData, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });
        // Store top 3 flights in watchlist metadata or return via job result
        console.log(`📊 Top 3 flights prepared for frontend`);
        // Save price history with cheapest price found
        const currentPrice = top3Cheapest[0].price;
        const highestPrice = sortedByPrice[sortedByPrice.length - 1].price;
        const saved = await priceHistoryRepository.create({
            watchlistId: watchlistId,
            price: currentPrice,
            flightCount: allFlights.length,
            lowestPrice: currentPrice,
            highestPrice: highestPrice,
        });
        // Update watchlist with latest price
        const lowestHistorical = await priceHistoryRepository.getLowestPrice(watchlistId);
        const lowestPrice = lowestHistorical
            ? Math.min(lowestHistorical.price, currentPrice)
            : currentPrice;
        await prisma_1.prisma.watchlist.update({
            where: { id: watchlistId },
            data: {
                currentPrice,
                lowestPrice,
            },
        });
        console.log("✅ Saved PriceHistory:", saved.id);
        console.log(`✅ Price check completed for watchlist: ${watchlistId}`);
        // Cache top flights in memory for quick access
        const cacheData = {
            flights: top3ForFrontend,
            statistics,
            cachedAt: new Date().toISOString(),
        };
        watchlist_controller_1.topFlightsCache.set(watchlistId, cacheData);
        console.log(`📦 Cached top flights for watchlist: ${watchlistId}`);
        // Return result containing top 3 flights for immediate access
        return {
            watchlistId,
            top3Flights: top3ForFrontend,
            statistics,
            ready: true,
        };
    }
    catch (error) {
        console.error("❌ Worker Error:");
        console.error(error.message);
        throw error;
    }
}, {
    connection: redis_1.connection,
});
worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});
worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});
console.log("👂 Price Check Worker Started - Using Google Flights Real Pricing");
