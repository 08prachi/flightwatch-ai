import { storage } from '../utils/storage.js';
import { router } from '../utils/router.js';

export function Header() {
  const isAuthenticated = storage.isAuthenticated();
  const user = storage.getUser();

  return `
    <header class="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a href="/" data-link class="flex items-center space-x-2 font-bold text-xl text-primary-600 hover:text-primary-700">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>FlightWatch</span>
          </a>

          <!-- Navigation -->
          ${isAuthenticated ? `
            <nav class="hidden md:flex space-x-8">
              <a href="/" data-link class="text-gray-700 hover:text-primary-600 font-medium">🏠 Home</a>
              <a href="/dashboard" data-link class="text-gray-700 hover:text-primary-600 font-medium">Dashboard</a>
              <a href="/create-watch" data-link class="text-gray-700 hover:text-primary-600 font-medium">+ Create Watch</a>
              <a href="/watchlist" data-link class="text-gray-700 hover:text-primary-600 font-medium">Watchlist</a>
            </nav>
          ` : ''}

          <!-- Right Section -->
          <div class="flex items-center space-x-4">
            ${isAuthenticated ? `
              <!-- Notifications -->
              <button id="notification-btn" class="relative p-2 text-gray-700 hover:text-primary-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span id="notification-badge" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full hidden"></span>
              </button>

              <!-- User Menu -->
              <div class="relative">
                <button id="user-menu-btn" class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                  <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    ${user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span class="hidden sm:inline text-gray-700 font-medium text-sm">${user?.name?.split(' ')[0] || 'User'}</span>
                </button>

                <!-- Dropdown Menu -->
                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <a href="/profile" data-link class="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg">Profile</a>
                  <a href="/settings" data-link class="block px-4 py-2 text-gray-700 hover:bg-gray-50">Settings</a>
                  <hr class="my-1">
                  <button id="logout-btn" class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg">Logout</button>
                </div>
              </div>
            ` : `
              <a href="/login" data-link class="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium">Login</a>
              <a href="/signup" data-link class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Sign Up</a>
            `}
          </div>
        </div>
      </div>
    </header>
  `;
}

export function attachHeaderListeners() {
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const logoutBtn = document.getElementById('logout-btn');

  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { authAPI } = await import('../api/auth.js');
      await authAPI.logout();
      router.push('/login');
    });
  }

  const notificationBtn = document.getElementById('notification-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      router.push('/notifications');
    });
  }
}
