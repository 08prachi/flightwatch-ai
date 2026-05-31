// Simple in-memory cache for top flights data
const topFlightsCache = new Map<string, any>();

export function setTopFlights(watchlistId: string, data: any) {
  topFlightsCache.set(watchlistId, data);
}

export function getTopFlightsFromCache(watchlistId: string) {
  return topFlightsCache.get(watchlistId);
}
