import api from '../utils/api.js';

export const flightsAPI = {
  async search(params) {
    try {
      const response = await api.get('/api/flights/search', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search flights',
      };
    }
  },

  async getFlightDetails(flightId) {
    try {
      const response = await api.get(`/api/flights/${flightId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch flight details',
      };
    }
  },

  async getPriceAlert(watchlistId) {
    try {
      const response = await api.get(`/api/flights/alerts/${watchlistId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch price alerts',
      };
    }
  },

  async getAirlines() {
    try {
      const response = await api.get('/api/flights/airlines');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch airlines',
        data: [],
      };
    }
  },

  async getAirports() {
    try {
      const response = await api.get('/api/flights/airports');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch airports',
        data: [],
      };
    }
  },
};
