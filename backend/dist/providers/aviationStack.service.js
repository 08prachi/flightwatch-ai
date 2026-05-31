"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aviationStackService = exports.AviationStackService = void 0;
const axios_1 = __importDefault(require("axios"));
const AVIATION_API_BASE = 'http://api.aviationstack.com/v1';
const API_KEY = process.env.AVIATIONSTACK_API_KEY;
class AviationStackService {
    apiKey;
    baseUrl;
    requestCount = 0;
    maxRequests = 100; // Free tier limit per month
    resetTime = new Date();
    constructor() {
        this.apiKey = API_KEY || '';
        this.baseUrl = AVIATION_API_BASE;
        if (!this.apiKey) {
            console.warn('⚠️  AviationStack API key not configured');
        }
    }
    async makeRequest(endpoint, params = {}) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}${endpoint}`, {
                params: {
                    ...params,
                    access_key: this.apiKey,
                },
                timeout: 10000,
            });
            if (!response.data.data) {
                throw new Error(`API Error: ${response.data.error?.info || 'Unknown error'}`);
            }
            return response.data.data;
        }
        catch (error) {
            console.error(`AviationStack API Error:`, error.message);
            throw new Error(`Failed to fetch from AviationStack: ${error.message}`);
        }
    }
    async searchFlights(params) {
        try {
            console.log('🔍 Searching flights on AviationStack:', params);
            const flightData = await this.makeRequest('/flights', {
                dep_iata: params.dep_iata,
                arr_iata: params.arr_iata,
                dep_date: params.dep_date,
                arr_date: params.arr_date,
                limit: 100,
            });
            if (!flightData || flightData.length === 0) {
                console.log('No flights found for the given criteria');
                return [];
            }
            // Transform API response to our format
            return flightData.map((flight) => ({
                flightNumber: flight.flight_number,
                airline: flight.airline.name,
                airlineIata: flight.airline.iata,
                departureAirport: flight.departure.iata,
                departureTime: flight.departure.scheduled,
                arrivalAirport: flight.arrival.iata,
                arrivalTime: flight.arrival.scheduled,
                status: flight.status,
                aircraft: flight.aircraft?.iata || 'Unknown',
                duration: this.calculateDuration(flight.departure.scheduled, flight.arrival.scheduled),
                stops: 0, // AviationStack doesn't provide stops info
            }));
        }
        catch (error) {
            console.error('Error searching flights:', error);
            throw error;
        }
    }
    async getAirlines() {
        try {
            console.log('📋 Fetching airlines list from AviationStack');
            const airlines = await this.makeRequest('/airlines', {
                limit: 1000,
            });
            return airlines || [];
        }
        catch (error) {
            console.error('Error fetching airlines:', error);
            return [];
        }
    }
    async getAirports() {
        try {
            console.log('✈️  Fetching airports list from AviationStack');
            const airports = await this.makeRequest('/airports', {
                limit: 10000,
            });
            return airports || [];
        }
        catch (error) {
            console.error('Error fetching airports:', error);
            return [];
        }
    }
    async getFlightDetails(flightNumber, date) {
        try {
            console.log(`📊 Fetching flight details: ${flightNumber} on ${date}`);
            const flights = await this.makeRequest('/flights', {
                flight_iata: flightNumber,
                dep_date: date,
            });
            if (flights && flights.length > 0) {
                const flight = flights[0];
                return {
                    flightNumber: flight.flight_number,
                    airline: flight.airline.name,
                    departureAirport: flight.departure.iata,
                    departureTime: flight.departure.scheduled,
                    arrivalAirport: flight.arrival.iata,
                    arrivalTime: flight.arrival.scheduled,
                    status: flight.status,
                    delayMinutes: flight.arrival.delay || 0,
                    aircraft: flight.aircraft?.iata || 'Unknown',
                };
            }
            return null;
        }
        catch (error) {
            console.error('Error fetching flight details:', error);
            throw error;
        }
    }
    calculateDuration(departureTime, arrivalTime) {
        try {
            const dep = new Date(departureTime);
            const arr = new Date(arrivalTime);
            return Math.round((arr.getTime() - dep.getTime()) / (1000 * 60)); // minutes
        }
        catch {
            return 0;
        }
    }
    isHealthy() {
        return !!this.apiKey;
    }
    getRequestStatus() {
        return {
            requestCount: this.requestCount,
            maxRequests: this.maxRequests,
            remainingRequests: this.maxRequests - this.requestCount,
            apiKeyConfigured: !!this.apiKey,
        };
    }
}
exports.AviationStackService = AviationStackService;
exports.aviationStackService = new AviationStackService();
