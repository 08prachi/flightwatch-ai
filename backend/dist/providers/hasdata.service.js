"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasdataService = exports.HasDataService = void 0;
const axios_1 = __importDefault(require("axios"));
const SERPAPI_BASE = 'https://serpapi.com/search';
const API_KEY = process.env.SERPAPI_API_KEY;
class HasDataService {
    apiKey;
    constructor() {
        this.apiKey = API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️  SerpAPI key not configured. Get free key at https://serpapi.com');
        }
    }
    async searchFlights(params) {
        try {
            console.log('🔍 Searching Google Flights (via SerpAPI):', {
                from: params.from,
                to: params.to,
                date: params.departure_date,
            });
            const queryParams = {
                engine: 'google_flights',
                departure_id: params.from,
                arrival_id: params.to,
                outbound_date: params.departure_date,
                adults: params.adults || 1,
                api_key: this.apiKey,
            };
            // Handle round trip vs one-way
            if (params.return_date) {
                queryParams.return_date = params.return_date;
                queryParams.type = '1'; // Round trip
            }
            else {
                queryParams.type = '2'; // One way
            }
            const response = await axios_1.default.get(SERPAPI_BASE, {
                params: queryParams,
                timeout: 30000,
            });
            if (!response.data) {
                console.log('⚠️  Empty response from SerpAPI');
                return [];
            }
            // Parse SerpAPI Google Flights format
            const bestFlights = response.data.best_flights || [];
            const otherFlights = response.data.other_flights || [];
            const allFlights = [...bestFlights, ...otherFlights];
            if (allFlights.length === 0) {
                console.log('⚠️  No flights found');
                return [];
            }
            // Convert to standard format
            const flights = allFlights.map((f) => {
                const legs = f.flights || [];
                const firstLeg = legs[0] || {};
                const lastLeg = legs[legs.length - 1] || {};
                // Extract times from airport objects
                const departure = firstLeg.departure_airport?.time || '';
                const arrival = lastLeg.arrival_airport?.time || '';
                // Calculate stops from layovers or legs
                const stops = f.layovers?.length || Math.max(0, legs.length - 1);
                return {
                    price: f.price,
                    airline: firstLeg.airline || 'Multiple Airlines',
                    departure_time: departure,
                    arrival_time: arrival,
                    duration: f.total_duration || 0,
                    stops: stops,
                };
            });
            console.log(`✈️  Found ${flights.length} flights`);
            return flights;
        }
        catch (error) {
            console.error(`❌ SerpAPI Error:`, error.response?.data || error.message);
            throw new Error(`Failed to fetch from Google Flights: ${error.message}`);
        }
    }
    async getFlightDetails(flightId) {
        try {
            console.log(`📊 Fetching flight details: ${flightId}`);
            return null;
        }
        catch (error) {
            console.error('Error fetching flight details:', error.message);
            return null;
        }
    }
    async getLowestPrice(from, to, date) {
        try {
            const flights = await this.searchFlights({
                from,
                to,
                departure_date: date,
            });
            if (flights.length === 0)
                return null;
            const lowestPrice = Math.min(...flights.map((f) => f.price || 0));
            console.log(`💰 Lowest price found: $${lowestPrice}`);
            return lowestPrice;
        }
        catch (error) {
            console.error('Error getting lowest price:', error);
            return null;
        }
    }
    isHealthy() {
        return !!this.apiKey;
    }
    getStatus() {
        return {
            apiKeyConfigured: !!this.apiKey,
            status: this.apiKey ? 'ready' : 'not_configured',
            apiProvider: 'Google Flights (SerpAPI)',
        };
    }
}
exports.HasDataService = HasDataService;
exports.hasdataService = new HasDataService();
