import api from '../utils/api.js';

export const watchlistAPI = {
  async getAll() {
    try {
      const response = await api.get('/api/watchlists');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch watchlists',
      };
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/api/watchlists/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch watchlist',
      };
    }
  },

  async create(watchlist) {
    try {
      const response = await api.post('/api/watchlists', watchlist);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create watchlist',
      };
    }
  },

  async update(id, watchlist) {
    try {
      const response = await api.put(`/api/watchlists/${id}`, watchlist);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update watchlist',
      };
    }
  },

  async delete(id) {
    try {
      await api.delete(`/api/watchlists/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete watchlist',
      };
    }
  },

  async getPriceHistory(watchlistId, days = 30) {
    try {
      const response = await api.get(`/api/watchlists/${watchlistId}/price-history?days=${days}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch price history',
      };
    }
  },

  async toggleActive(id, active) {
    try {
      const response = await api.patch(`/api/watchlists/${id}`, { active });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle watchlist',
      };
    }
  },

  async getTopFlights(watchlistId) {
    try {
      const response = await api.get(`/api/watchlists/${watchlistId}/top-flights`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch top flights',
      };
    }
  },
};
