"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightSearchService = void 0;
const hasdata_service_1 = require("../providers/hasdata.service");
const redis_1 = require("../config/redis");
class FlightSearchService {
    cacheTimeout = 24 * 60 * 60; // 24 hours in seconds
    async searchFlights(from, to, departureDate, returnDate, cabin) {
        try {
            console.log(`🔍 Searching flights: ${from} → ${to} on ${departureDate}`);
            // Generate cache key
            const cacheKey = `flight:${from}:${to}:${departureDate}:${cabin || 'economy'}`;
            // Check Redis cache
            const cached = await this.getFromCache(cacheKey);
            if (cached) {
                console.log('✅ Returning cached results');
                return {
                    ...cached,
                    meta: { ...cached.meta, cached: true },
                };
            }
            // Search flights using HasData
            const flights = await hasdata_service_1.hasdataService.searchFlights({
                from,
                to,
                departure_date: departureDate,
                return_date: returnDate,
                cabin_class: cabin || 'economy',
                adults: 1,
            });
            if (flights.length === 0) {
                return {
                    success: false,
                    data: [],
                    meta: {
                        route: `${from}-${to}`,
                        date: departureDate,
                        cached: false,
                        count: 0,
                        lowestPrice: null,
                        highestPrice: null,
                    },
                };
            }
            // Transform data
            const transformedFlights = flights.map((flight, index) => ({
                id: flight.id || `flight_${index}`,
                airline: flight.airline,
                airlineCode: flight.airline_code,
                flightNumber: flight.flight_number,
                price: flight.price,
                currency: flight.currency || 'USD',
                departure: {
                    airport: from,
                    time: flight.departure_time,
                },
                arrival: {
                    airport: to,
                    time: flight.arrival_time,
                },
                duration: flight.duration,
                stops: flight.stops,
                cabinClass: cabin || 'economy',
                bookingUrl: flight.booking_url,
            }));
            // Calculate stats
            const prices = transformedFlights.map((f) => f.price);
            const lowestPrice = Math.min(...prices);
            const highestPrice = Math.max(...prices);
            const result = {
                success: true,
                data: transformedFlights,
                meta: {
                    route: `${from}-${to}`,
                    date: departureDate,
                    cached: false,
                    count: transformedFlights.length,
                    lowestPrice,
                    highestPrice,
                },
            };
            // Cache results
            await this.saveToCache(cacheKey, result);
            console.log(`✅ Found ${transformedFlights.length} flights. Price range: $${lowestPrice}-$${highestPrice}`);
            return result;
        }
        catch (error) {
            console.error('❌ Search error:', error.message);
            return {
                success: false,
                data: [],
                meta: {
                    route: `${from}-${to}`,
                    date: departureDate,
                    cached: false,
                    count: 0,
                    lowestPrice: null,
                    highestPrice: null,
                },
            };
        }
    }
    async getPriceHistory(from, to, date) {
        try {
            console.log(`📊 Getting price history: ${from} → ${to} on ${date}`);
            // In production, fetch from database
            // For now, get current price
            const result = await this.searchFlights(from, to, date);
            if (result.meta.lowestPrice) {
                return [result.meta.lowestPrice];
            }
            return [];
        }
        catch (error) {
            console.error('Error getting price history:', error.message);
            return [];
        }
    }
    async getFromCache(key) {
        try {
            const cached = await redis_1.redis.get(key);
            if (cached) {
                return JSON.parse(cached);
            }
            return null;
        }
        catch (error) {
            console.warn('Cache read error:', error);
            return null;
        }
    }
    async saveToCache(key, data) {
        try {
            await redis_1.redis.setex(key, this.cacheTimeout, JSON.stringify(data));
            console.log(`💾 Cached: ${key}`);
        }
        catch (error) {
            console.warn('Cache write error:', error);
        }
    }
    clearCache(from, to) {
        const pattern = `flight:${from}:${to}:*`;
        console.log(`🗑️  Clearing cache for ${pattern}`);
        // In production, use redis.del with pattern matching
    }
}
exports.flightSearchService = new FlightSearchService();
