"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightAggregationService = void 0;
class FlightAggregationService {
    aggregateFlights(flightsByDate, origin, destination) {
        const aggregated = [];
        flightsByDate.forEach((flights, date) => {
            flights.forEach((flight) => {
                const aggregated_flight = {
                    price: flight.price || 0,
                    airline: flight.airline || 'Unknown Airline',
                    flightNumber: flight.flightNumber || flight.flight_number || '',
                    departureTime: flight.departureTime || flight.departure_time || '',
                    arrivalTime: flight.arrivalTime || flight.arrival_time || '',
                    duration: flight.duration || 0,
                    stops: flight.stops ?? 0,
                    date,
                    origin,
                    destination,
                    provider: 'Google Flights',
                    bookingUrl: flight.bookingUrl || flight.booking_url || '',
                };
                aggregated.push(aggregated_flight);
            });
        });
        return aggregated;
    }
    findCheapestFlights(flights, count = 3) {
        const sorted = [...flights].sort((a, b) => a.price - b.price);
        return sorted.slice(0, count).map((flight, index) => ({
            ...flight,
            rank: index + 1,
        }));
    }
    calculateFareStatistics(flights, searchWindow) {
        if (flights.length === 0) {
            return {
                totalFlights: 0,
                cheapestFare: 0,
                mostExpensiveFare: 0,
                averageFare: 0,
                datesSearched: 0,
                searchWindow,
            };
        }
        const prices = flights.map((f) => f.price);
        const uniqueDates = new Set(flights.map((f) => f.date));
        return {
            totalFlights: flights.length,
            cheapestFare: Math.min(...prices),
            mostExpensiveFare: Math.max(...prices),
            averageFare: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            datesSearched: uniqueDates.size,
            searchWindow,
        };
    }
    groupFlightsByDate(flights) {
        const grouped = new Map();
        flights.forEach((flight) => {
            if (!grouped.has(flight.date)) {
                grouped.set(flight.date, []);
            }
            grouped.get(flight.date).push(flight);
        });
        return grouped;
    }
}
exports.flightAggregationService = new FlightAggregationService();
