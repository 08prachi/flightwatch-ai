import api from '../utils/api.js';

export const notificationsAPI = {
  async getAll() {
    try {
      const response = await api.get('/api/notifications');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch notifications',
      };
    }
  },

  async getUnread() {
    try {
      const response = await api.get('/api/notifications/unread');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch unread notifications',
      };
    }
  },

  async markAsRead(id) {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark as read',
      };
    }
  },

  async markAllAsRead() {
    try {
      await api.patch('/api/notifications/read-all');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all as read',
      };
    }
  },

  async updatePreferences(preferences) {
    try {
      const response = await api.put('/api/notifications/preferences', preferences);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update preferences',
      };
    }
  },

  async getPreferences() {
    try {
      const response = await api.get('/api/notifications/preferences');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch preferences',
      };
    }
  },

  async delete(id) {
    try {
      await api.delete(`/api/notifications/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete notification',
      };
    }
  },
};
