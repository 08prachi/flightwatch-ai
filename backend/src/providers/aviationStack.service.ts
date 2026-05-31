import axios from 'axios';

const AVIATION_API_BASE = 'http://api.aviationstack.com/v1';
const API_KEY = process.env.AVIATIONSTACK_API_KEY;

interface FlightSearchParams {
  dep_iata: string;
  arr_iata: string;
  dep_date: string;
  arr_date?: string;
}

interface FlightData {
  flight_number: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string | null;
    gate: string | null;
    baggage: string | null;
    delay: number | null;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
  };
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  aircraft: {
    registration: string;
    iata: string;
    icao: string;
    icao24: string;
  } | null;
  codeshare: {
    airline_iata: string;
    airline_icao: string;
    flight_number: string;
  } | null;
  status: string;
  type: string;
}

interface AirlineData {
  airline_name: string;
  iata_code: string;
  icao_code: string;
  country_name: string;
  country_iso2: string;
  airline_id: number;
}

interface AirportData {
  airport_name: string;
  iata_code: string;
  icao_code: string;
  city_iata_code: string;
  country_name: string;
  country_iso2: string;
  gmt: string;
  airport_id: number;
}

export class AviationStackService {
  private apiKey: string;
  private baseUrl: string;
  private requestCount: number = 0;
  private maxRequests: number = 100; // Free tier limit per month
  private resetTime: Date = new Date();

  constructor() {
    this.apiKey = API_KEY || '';
    this.baseUrl = AVIATION_API_BASE;

    if (!this.apiKey) {
      console.warn('⚠️  AviationStack API key not configured');
    }
  }

  private async makeRequest<T>(endpoint: string, params: any = {}): Promise<T> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
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
    } catch (error: any) {
      console.error(`AviationStack API Error:`, error.message);
      throw new Error(`Failed to fetch from AviationStack: ${error.message}`);
    }
  }

  async searchFlights(params: FlightSearchParams) {
    try {
      console.log('🔍 Searching flights on AviationStack:', params);

      const flightData = await this.makeRequest<FlightData[]>('/flights', {
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
        duration: this.calculateDuration(
          flight.departure.scheduled,
          flight.arrival.scheduled
        ),
        stops: 0, // AviationStack doesn't provide stops info
      }));
    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  }

  async getAirlines(): Promise<AirlineData[]> {
    try {
      console.log('📋 Fetching airlines list from AviationStack');
      const airlines = await this.makeRequest<AirlineData[]>('/airlines', {
        limit: 1000,
      });
      return airlines || [];
    } catch (error) {
      console.error('Error fetching airlines:', error);
      return [];
    }
  }

  async getAirports(): Promise<AirportData[]> {
    try {
      console.log('✈️  Fetching airports list from AviationStack');
      const airports = await this.makeRequest<AirportData[]>('/airports', {
        limit: 10000,
      });
      return airports || [];
    } catch (error) {
      console.error('Error fetching airports:', error);
      return [];
    }
  }

  async getFlightDetails(flightNumber: string, date: string) {
    try {
      console.log(`📊 Fetching flight details: ${flightNumber} on ${date}`);
      const flights = await this.makeRequest<FlightData[]>('/flights', {
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
    } catch (error) {
      console.error('Error fetching flight details:', error);
      throw error;
    }
  }

  private calculateDuration(departureTime: string, arrivalTime: string): number {
    try {
      const dep = new Date(departureTime);
      const arr = new Date(arrivalTime);
      return Math.round((arr.getTime() - dep.getTime()) / (1000 * 60)); // minutes
    } catch {
      return 0;
    }
  }

  isHealthy(): boolean {
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

export const aviationStackService = new AviationStackService();
