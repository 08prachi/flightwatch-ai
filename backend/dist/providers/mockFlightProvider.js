"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockFlightProvider = void 0;
class MockFlightProvider {
    async searchFlights() {
        return [
            {
                airline: "Air India",
                flightNumber: "AI995",
                departureTime: new Date(),
                arrivalTime: new Date(),
                price: 100 + Math.floor(Math.random() * 20000),
                stops: 0,
            },
        ];
    }
}
exports.MockFlightProvider = MockFlightProvider;
