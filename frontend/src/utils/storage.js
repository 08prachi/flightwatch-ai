import Cookie from 'js-cookie';

export const storage = {
  setToken: (token) => {
    Cookie.set('auth_token', token, { expires: 7 });
    localStorage.setItem('user_token', token);
  },

  getToken: () => {
    return Cookie.get('auth_token') || localStorage.getItem('user_token');
  },

  removeToken: () => {
    Cookie.remove('auth_token');
    localStorage.removeItem('user_token');
  },

  setUser: (user) => {
    localStorage.setItem('current_user', JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem('current_user');
  },

  setSearchHistory: (searches) => {
    localStorage.setItem('search_history', JSON.stringify(searches));
  },

  getSearchHistory: () => {
    const history = localStorage.getItem('search_history');
    return history ? JSON.parse(history) : [];
  },

  isAuthenticated: () => {
    return !!storage.getToken();
  }
};
