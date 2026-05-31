import { watchlistAPI } from '../api/watchlist.js';
import { formatPrice, formatDate, getPriceStatus, getPriceColor, getPriceIcon, showNotification } from '../utils/helpers.js';
import { router } from '../utils/router.js';

export async function WatchlistPage() {
  const target = document.getElementById('page-content') || document.getElementById('app');

  target.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">My Watchlists</h1>
            <p class="text-gray-600 mt-2">Monitor and manage your flight price watches</p>
          </div>
          <a href="/create-watch" data-link class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition">
            + Create New Watch
          </a>
        </div>

        <!-- Filter and Sort -->
        <div class="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 flex-wrap">
          <select id="filter-status" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            <option value="all">All Watchlists</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <select id="sort-by" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            <option value="recent">Recently Created</option>
            <option value="price">Lowest Price</option>
            <option value="departure">Nearest Departure</option>
          </select>

          <button id="refresh-btn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
            Refresh
          </button>
        </div>

        <!-- Watchlists Container -->
        <div id="watchlists-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Loading state -->
          <div class="bg-white rounded-lg shadow animate-pulse p-6 h-80"></div>
          <div class="bg-white rounded-lg shadow animate-pulse p-6 h-80"></div>
          <div class="bg-white rounded-lg shadow animate-pulse p-6 h-80"></div>
        </div>

        <!-- Empty State -->
        <div id="empty-state" class="hidden text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900">No watchlists found</h3>
          <p class="mt-1 text-gray-500">Start tracking flight prices by creating a new watchlist.</p>
          <a href="/search" data-link class="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition">
            Create Your First Watch
          </a>
        </div>
      </div>
    </div>
  `;

  loadWatchlists();
}

async function loadWatchlists() {
  const result = await watchlistAPI.getAll();

  if (result.success && result.data.watchlists) {
    const watchlists = result.data.watchlists;
    const container = document.getElementById('watchlists-container');
    const emptyState = document.getElementById('empty-state');

    if (watchlists.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    container.innerHTML = watchlists.map((watch, index) => {
      const priceStatus = getPriceStatus(watch.currentPrice, watch.previousPrice);
      const priceColor = getPriceColor(priceStatus);
      const priceIcon = getPriceIcon(priceStatus);

      return `
        <div class="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden" data-id="${watch.id}">
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-xl font-bold">${watch.origin} → ${watch.destination}</h3>
                <p class="text-sm opacity-90">${formatDate(watch.departureDate, 'MMM dd, yyyy')}</p>
              </div>
              <button class="toggle-active-btn px-3 py-1 rounded-full text-xs font-semibold ${
                watch.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }">
                ${watch.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4 space-y-4">
            <!-- Price Info -->
            <div>
              <p class="text-sm text-gray-600 mb-2">Current Price</p>
              <div class="flex items-baseline justify-between">
                <span class="text-3xl font-bold text-gray-900">${formatPrice(watch.currentPrice || watch.lowestPrice || 0)}</span>
                <span class="${priceColor} font-semibold text-lg">${priceIcon}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Lowest: ${formatPrice(watch.lowestPrice || 0)} | Budget: ${formatPrice(watch.budget)}
              </p>
            </div>

            <!-- Progress Bar -->
            <div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-600 h-2 rounded-full transition-all" style="width: ${
                  Math.min(((watch.currentPrice || 0) / watch.budget) * 100, 100)
                }%"></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                ${Math.round(((watch.currentPrice || 0) / watch.budget) * 100)}% of budget
              </p>
            </div>

            <!-- Details -->
            <div class="grid grid-cols-2 gap-4 py-3 border-y border-gray-200">
              <div>
                <p class="text-xs text-gray-600">Passengers</p>
                <p class="font-semibold text-gray-900">${watch.passengers}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600">Flight Type</p>
                <p class="font-semibold text-gray-900">${watch.flightType || 'Any'}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-2">
              <button class="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition text-sm view-details-btn">
                View Details
              </button>
              <div class="flex gap-2">
                <button class="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-sm edit-btn">
                  Edit
                </button>
                <button class="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition text-sm delete-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    attachWatchlistListeners(watchlists);
  }
}

function attachWatchlistListeners(watchlists) {
  document.querySelectorAll('[data-id]').forEach((card, index) => {
    const watch = watchlists[index];

    // View Details
    card.querySelector('.view-details-btn').addEventListener('click', () => {
      router.push(`/watchlist/${watch.id}`);
    });

    // Edit
    card.querySelector('.edit-btn').addEventListener('click', () => {
      router.push(`/watchlist/${watch.id}/edit`);
    });

    // Delete
    card.querySelector('.delete-btn').addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this watchlist?')) {
        const result = await watchlistAPI.delete(watch.id);
        if (result.success) {
          showNotification('Watchlist deleted', 'success');
          loadWatchlists();
        } else {
          showNotification(result.error, 'error');
        }
      }
    });

    // Toggle Active
    card.querySelector('.toggle-active-btn').addEventListener('click', async () => {
      const result = await watchlistAPI.toggleActive(watch.id, !watch.active);
      if (result.success) {
        showNotification(result.data.active ? 'Watchlist activated' : 'Watchlist paused', 'success');
        loadWatchlists();
      } else {
        showNotification(result.error, 'error');
      }
    });
  });

  // Filter and Sort
  document.getElementById('filter-status').addEventListener('change', (e) => {
    const status = e.target.value;
    const cards = document.querySelectorAll('[data-id]');
    cards.forEach(card => {
      const btn = card.querySelector('.toggle-active-btn');
      const isActive = btn.textContent.includes('Active');
      if (status === 'all' || (status === 'active' && isActive) || (status === 'inactive' && !isActive)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Refresh
  document.getElementById('refresh-btn').addEventListener('click', () => {
    loadWatchlists();
  });
}
