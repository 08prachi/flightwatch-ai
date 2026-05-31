import { hasdataService } from '../providers/hasdata.service';
import { aviationStackService } from '../providers/aviationStack.service';
import { redis } from '../config/redis';
import { format } from 'date-fns';

export interface SearchResult {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  price: number;
  currency: string;
  departure: {
    airport: string;
    time: string;
  };
  arrival: {
    airport: string;
    time: string;
  };
  duration: number; // minutes
  stops: number;
  cabinClass: string;
  bookingUrl?: string;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  meta: {
    route: string;
    date: string;
    cached: boolean;
    count: number;
    lowestPrice: number | null;
    highestPrice: number | null;
  };
}

class FlightSearchService {
  private cacheTimeout = 24 * 60 * 60; // 24 hours in seconds

  async searchFlights(
    from: string,
    to: string,
    departureDate: string,
    returnDate?: string,
    cabin?: string
  ): Promise<SearchResponse> {
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
      const flights = await hasdataService.searchFlights({
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

      const result: SearchResponse = {
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
    } catch (error: any) {
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

  async getPriceHistory(from: string, to: string, date: string): Promise<number[]> {
    try {
      console.log(`📊 Getting price history: ${from} → ${to} on ${date}`);

      // In production, fetch from database
      // For now, get current price
      const result = await this.searchFlights(from, to, date);

      if (result.meta.lowestPrice) {
        return [result.meta.lowestPrice];
      }
      return [];
    } catch (error: any) {
      console.error('Error getting price history:', error.message);
      return [];
    }
  }

  private async getFromCache(key: string): Promise<SearchResponse | null> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }

  private async saveToCache(key: string, data: SearchResponse): Promise<void> {
    try {
      await redis.setex(key, this.cacheTimeout, JSON.stringify(data));
      console.log(`💾 Cached: ${key}`);
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  clearCache(from: string, to: string): void {
    const pattern = `flight:${from}:${to}:*`;
    console.log(`🗑️  Clearing cache for ${pattern}`);
    // In production, use redis.del with pattern matching
  }
}

export const flightSearchService = new FlightSearchService();
