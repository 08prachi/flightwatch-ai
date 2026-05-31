import api from '../utils/api.js';
import { storage } from '../utils/storage.js';

export const authAPI = {
  async signup(email, password, name) {
    try {
      const response = await api.post('/api/auth/signup', {
        email,
        password,
        name,
      });
      const { token, user } = response.data;
      storage.setToken(token);
      storage.setUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed',
      };
    }
  },

  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      storage.setToken(token);
      storage.setUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  },

  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storage.removeToken();
      storage.removeUser();
    }
  },

  async updateProfile(name, email) {
    try {
      const response = await api.put('/api/user/profile', { name, email });
      storage.setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Update failed',
      };
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed',
      };
    }
  },
};
