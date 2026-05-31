import { watchlistAPI } from '../api/watchlist.js';
import { storage } from '../utils/storage.js';
import { formatPrice, formatDate, showNotification } from '../utils/helpers.js';
import { router } from '../utils/router.js';

export async function DashboardPage() {
  const target = document.getElementById('page-content') || document.getElementById('app');
  const user = storage.getUser();

  target.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-12 px-4">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-4xl font-bold mb-2">Welcome, ${user?.name?.split(' ')[0]}!</h1>
          <p class="text-lg opacity-90">Track flight prices and get alerts when prices drop</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-12">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Active Watchlists</p>
                <p class="text-3xl font-bold text-gray-900 mt-2" id="active-count">0</p>
              </div>
              <svg class="w-12 h-12 text-primary-500 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
              </svg>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Price Drops</p>
                <p class="text-3xl font-bold text-green-600 mt-2" id="drops-count">0</p>
              </div>
              <svg class="w-12 h-12 text-green-500 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h.01a1 1 0 110 2H12zm-2.646 6.354a1 1 0 0 0 1.415-1.415l-2-2a1 1 0 0 0-1.415 0l-2 2a1 1 0 0 0 1.415 1.415L9.5 12.207v4.293a1 1 0 0 0 2 0v-4.293l1.354 1.354z"></path>
              </svg>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Potential Savings</p>
                <p class="text-3xl font-bold text-primary-600 mt-2" id="savings-amount">$0</p>
              </div>
              <svg class="w-12 h-12 text-primary-500 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.16 2.75a.75.75 0 00-1.32 0l-.478 1.435a.75.75 0 01-.56.56L4.75 5.04a.75.75 0 000 1.32l1.435.478c.261.087.477.303.56.56l.478 1.435a.75.75 0 001.32 0l.478-1.435c.083-.257.299-.473.56-.56l1.435-.478a.75.75 0 000-1.32L8.72 4.75a.75.75 0 01-.56-.56L7.68 2.75z"></path>
                <path fill-rule="evenodd" d="M11.573 3.5a.75.75 0 00-.57-.736l-1.097-.274-.274-1.097a.75.75 0 00-1.404 0l-.274 1.097-1.097.274a.75.75 0 000 1.404l1.097.274.274 1.097a.75.75 0 001.404 0l.274-1.097 1.097-.274a.75.75 0 00.57-.736zM10.75 17a.75.75 0 01-.736-.573l-.211-.792-.792-.211a.75.75 0 010-1.404l.792-.211.211-.792a.75.75 0 011.404 0l.211.792.792.211a.75.75 0 010 1.404l-.792.211-.211.792A.75.75 0 0110.75 17z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Watchlists Section -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Your Watchlists</h2>
          <a href="/create-watch" data-link class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition">
            + Create New Watch
          </a>
        </div>

        <!-- Watchlists List -->
        <div id="watchlists-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Loading skeletons will be shown here -->
          <div class="bg-white rounded-lg shadow animate-pulse p-6 h-48"></div>
          <div class="bg-white rounded-lg shadow animate-pulse p-6 h-48"></div>
          <div class="bg-white rounded-lg shadow animate-pulse p-6 h-48"></div>
        </div>

        <!-- Empty State -->
        <div id="empty-state" class="hidden text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900">No watchlists yet</h3>
          <p class="mt-1 text-gray-500">Get started by creating your first flight watch.</p>
          <a href="/search" data-link class="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition">
            Create Your First Watch
          </a>
        </div>
      </div>
    </div>
  `;

  loadDashboardData();
}

async function loadDashboardData() {
  const result = await watchlistAPI.getAll();
  console.log('Dashboard API Result:', result);

  if (result.success) {
    // Handle both array and object formats
    const watchlists = Array.isArray(result.data) ? result.data : result.data.watchlists;
    const container = document.getElementById('watchlists-container');
    const emptyState = document.getElementById('empty-state');

    console.log('Watchlists found:', watchlists.length);

    if (watchlists.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      updateStats([], []);
      return;
    }

    emptyState.classList.add('hidden');

    console.log('Rendering watchlists:', watchlists);
    container.innerHTML = watchlists.map(watch => `
      <div class="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer" data-id="${watch.id}">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                ${watch.origin} → ${watch.destination}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                ${formatDate(watch.departureDate)} | ${watch.passengers} passenger(s)
              </p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-medium ${
              watch.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }">
              ${watch.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div class="border-t pt-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-600">Current Price</span>
              <span class="text-xl font-bold text-gray-900">${formatPrice(watch.currentPrice || 0)}</span>
            </div>
            <div class="flex justify-between items-center mb-4">
              <span class="text-sm text-gray-600">Budget</span>
              <span class="text-sm font-medium text-gray-900">${formatPrice(watch.budget)}</span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-primary-600 h-2 rounded-full transition-all" style="width: ${
                ((watch.currentPrice || 0) / watch.budget) * 100
              }%"></div>
            </div>
          </div>

          <div class="mt-4 flex space-x-2">
            <button class="flex-1 px-3 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium transition text-sm view-btn">
              View Details
            </button>
            <button class="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition text-sm edit-btn">
              Edit
            </button>
          </div>
        </div>
      </div>
    `).join('');

    attachWatchlistListeners(watchlists);
    const alerts = Array.isArray(result.data) ? [] : (result.data.alerts || []);
    updateStats(watchlists, alerts);
  } else {
    console.error('API Error:', result.error);
    document.getElementById('watchlists-container').innerHTML = '';
    document.getElementById('empty-state').classList.remove('hidden');
  }
}

function attachWatchlistListeners(watchlists) {
  document.querySelectorAll('[data-id]').forEach((card, index) => {
    const watch = watchlists[index];

    card.querySelector('.view-btn').addEventListener('click', async () => {
      await router.push(`/watchlist/${watch.id}`);
    });

    card.querySelector('.edit-btn').addEventListener('click', async () => {
      await router.push(`/watchlist/${watch.id}/edit`);
    });
  });
}

function updateStats(watchlists, alerts) {
  const activeCount = watchlists.filter(w => w.active).length;
  const dropsCount = alerts.filter(a => a.type === 'price_drop').length;
  const savingsAmount = alerts.reduce((sum, a) => sum + (a.savingsAmount || 0), 0);

  document.getElementById('active-count').textContent = activeCount;
  document.getElementById('drops-count').textContent = dropsCount;
  document.getElementById('savings-amount').textContent = formatPrice(savingsAmount);
}
