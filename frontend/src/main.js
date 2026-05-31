import './styles/main.css';
import { router } from './utils/router.js';
import { storage } from './utils/storage.js';
import { Header, attachHeaderListeners } from './components/header.js';

// Pages
import { HomePage } from './pages/home.js';
import { LoginPage } from './pages/login.js';
import { SignupPage } from './pages/signup.js';
import { DashboardPage } from './pages/dashboard.js';
import { CreateWatchPage } from './pages/create-watch.js';
import { WatchlistPage } from './pages/watchlist.js';
import { WatchlistDetailsPage } from './pages/watchlist-details.js';
import { FlightResultsPage } from './pages/flight-results.js';
import { NotificationsPage } from './pages/notifications.js';
import { SettingsPage } from './pages/settings.js';

// Initialize router
function initializeRouter() {
  // Public routes
  router.register('/', HomePage);
  router.register('/login', LoginPage);
  router.register('/signup', SignupPage);

  // Protected routes
  router.register('/dashboard', DashboardPage, true);
  router.register('/create-watch', CreateWatchPage, true);
  router.register('/flight-results/:id', FlightResultsPage, true);
  router.register('/watchlist', WatchlistPage, true);
  router.register('/watchlist/:id', WatchlistDetailsPage, true);
  router.register('/watchlist/:id/edit', WatchlistDetailsPage, true);
  router.register('/notifications', NotificationsPage, true);
  router.register('/settings', SettingsPage, true);
  router.register('/profile', SettingsPage, true);
}

// Initialize app
async function init() {
  initializeRouter();

  const app = document.getElementById('app');

  // Render header + page container
  const isAuthenticated = storage.isAuthenticated();
  app.innerHTML = Header() + '<div id="page-content"></div>';
  attachHeaderListeners();

  // Get current path
  const path = window.location.pathname || '/';

  // Navigate to the page
  await router.navigate(path);

  // Setup history listeners
  router.setupHistoryListeners();
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
