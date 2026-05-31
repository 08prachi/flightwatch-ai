import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { notificationQueue } from "../queues/notification.queue";
import { hasdataService } from "../providers/hasdata.service";
import { PriceHistoryRepository } from "../repositories/priceHistory.repository";
import { prisma } from "../config/prisma";
import { format, addDays } from "date-fns";
import { flightAggregationService } from "../services/flightAggregation.service";
import { pdfGenerationService } from "../services/pdfGeneration.service";
import { setTopFlights } from "../utils/topFlightsCache";

const priceHistoryRepository = new PriceHistoryRepository();

interface FlightWithDate {
  date: string;
  price: number;
  [key: string]: any;
}

const worker = new Worker(
  "price-check-queue",
  async (job) => {
    try {
      console.log("=================================");
      console.log("🚀 Processing Price Check Job");
      console.log(job.data);

      const { watchlistId } = job.data;

      const watchlist = await prisma.watchlist.findUnique({
        where: { id: watchlistId },
        include: { user: true },
      });

      if (!watchlist || !watchlist.user) {
        console.log("❌ Watchlist or user not found");
        return;
      }

      const departureDate = new Date(watchlist.departureDate);
      const allFlights: FlightWithDate[] = [];

      // DEBUG: Log environment
      console.log("🔵 [WORKER] process.env.SEARCH_DAYS:", process.env.SEARCH_DAYS);
      const searchDays = parseInt(process.env.SEARCH_DAYS || '5', 10);
      console.log("🔵 [WORKER] Parsed searchDays:", searchDays);
      console.log(`🟢 [WORKER] Starting search for ${searchDays} days`);

      // Search flights for specified number of days
      for (let i = 0; i < searchDays; i++) {
        const searchDate = addDays(departureDate, i);
        const formattedDate = format(searchDate, 'yyyy-MM-dd');

        try {
          console.log(`  🔍 Searching: ${watchlist.origin} → ${watchlist.destination} on ${formattedDate}`);
          const flights = await hasdataService.searchFlights({
            from: watchlist.origin,
            to: watchlist.destination,
            departure_date: formattedDate,
            return_date: watchlist.returnDate
              ? format(new Date(watchlist.returnDate), 'yyyy-MM-dd')
              : undefined,
            adults: watchlist.passengers,
            cabin_class: watchlist.cabinClass,
          });

          if (flights && flights.length > 0) {
            allFlights.push(...flights.map((f: any) => ({
              ...f,
              date: formattedDate,
            })));
            console.log(`    ✅ Found ${flights.length} flights on ${formattedDate}`);
          } else {
            console.log(`    ⚠️  No flights on ${formattedDate}`);
          }
        } catch (error: any) {
          console.log(`    ❌ Error searching ${formattedDate}: ${error?.message || 'Unknown error'}`);
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
      const pricesByDate = allFlights.reduce((acc: any, flight: any) => {
        if (!acc[flight.date]) {
          acc[flight.date] = [];
        }
        acc[flight.date].push(flight.price);
        return acc;
      }, {});

      const dailyLowest = Object.entries(pricesByDate).map(([date, prices]: any) => ({
        date,
        lowestPrice: Math.min(...prices),
        avgPrice: prices.reduce((a: number, b: number) => a + b, 0) / prices.length,
      }));

      const bestDay = dailyLowest.sort((a, b) => a.lowestPrice - b.lowestPrice)[0];

      console.log(`💰 Cheapest Price: $${top3Cheapest[0].price}`);
      console.log(`🏆 Best Day: ${bestDay.date} ($${bestDay.lowestPrice})`);

      // Aggregate flights and prepare for PDF generation
      const flightsByDate = new Map<string, any[]>();
      allFlights.forEach((flight) => {
        if (!flightsByDate.has(flight.date)) {
          flightsByDate.set(flight.date, []);
        }
        flightsByDate.get(flight.date)!.push(flight);
      });

      const aggregatedFlights = flightAggregationService.aggregateFlights(
        flightsByDate,
        watchlist.origin,
        watchlist.destination
      );

      const endDate = addDays(departureDate, searchDays - 1);
      const statistics = flightAggregationService.calculateFareStatistics(
        aggregatedFlights,
        {
          start: format(departureDate, 'yyyy-MM-dd'),
          end: format(endDate, 'yyyy-MM-dd'),
        }
      );

      // Generate PDF report
      let pdfBuffer: Buffer | null = null;
      try {
        console.log("📄 Generating PDF report...");
        pdfBuffer = await pdfGenerationService.generateFlightReport({
          watchlist: {
            id: watchlist.id,
            origin: watchlist.origin,
            destination: watchlist.destination,
            departureDate: format(departureDate, 'yyyy-MM-dd'),
            returnDate: watchlist.returnDate ? format(new Date(watchlist.returnDate), 'yyyy-MM-dd') : null,
          },
          allFlights: aggregatedFlights,
          top3Flights: top3Cheapest.map((f: any, i: number) => ({
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
      } catch (pdfError: any) {
        console.error("⚠️  PDF generation failed:", pdfError.message);
        console.log("📧 Continuing with email without PDF...");
      }

      // Prepare top 3 flights for frontend
      const top3ForFrontend = top3Cheapest.map((f: any, i: number) => ({
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
      const notificationData: any = {
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

      await notificationQueue.add(
        "send-notification",
        notificationData,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );

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

      await prisma.watchlist.update({
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
      setTopFlights(watchlistId, cacheData);
      console.log(`📦 Cached top flights for watchlist: ${watchlistId}`);

      // Return result containing top 3 flights for immediate access
      return {
        watchlistId,
        top3Flights: top3ForFrontend,
        statistics,
        ready: true,
      };
    } catch (error: any) {
      console.error("❌ Worker Error:");
      console.error(error.message);
      throw error;
    }
  },
  {
    connection: connection as any,
  }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

console.log("👂 Price Check Worker Started - Using Google Flights Real Pricing");