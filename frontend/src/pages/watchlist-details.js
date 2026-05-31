import { watchlistAPI } from '../api/watchlist.js';
import { formatPrice, formatDate, showNotification } from '../utils/helpers.js';
import { router } from '../utils/router.js';
import Chart from 'chart.js/auto';

export async function WatchlistDetailsPage(params) {
  const { id } = params;
  const target = document.getElementById('page-content') || document.getElementById('app');

  target.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-6 flex justify-between items-center">
          <button class="flex items-center text-primary-600 hover:text-primary-700 font-medium" id="back-btn">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Watchlists
          </button>
          <div class="flex gap-3">
            <button id="edit-btn" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">✏️ Edit</button>
            <button id="delete-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">🗑️ Delete</button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-8 mb-6">
          <!-- Watch Info -->
          <div class="mb-8">
            <div id="watch-info" class="space-y-4">
              <!-- Content will be loaded here -->
            </div>
          </div>

          <!-- Top 3 Flights Section -->
          <div id="top-flights-section" class="hidden mb-8 pb-8 border-b">
            <h2 class="text-xl font-bold text-gray-900 mb-4">✈️ Top 3 Cheapest Flights</h2>
            <div id="top-flights-list" class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Flights will be loaded here -->
            </div>
          </div>

          <!-- Price History Chart -->
          <div id="chart-container" class="mb-8">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Price History</h2>
            <canvas id="price-chart" height="80"></canvas>
          </div>

          <!-- Alerts Section -->
          <div id="alerts-section" class="border-t pt-8">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Alerts</h2>
            <div id="alerts-list" class="space-y-4">
              <!-- Alerts will be loaded here -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  loadWatchlistDetails(id);
  attachDetailsListeners();
}

async function loadWatchlistDetails(id) {
  const result = await watchlistAPI.getById(id);

  if (result.success) {
    const watch = result.data;
    const watchInfo = document.getElementById('watch-info');

    watchInfo.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <p class="text-sm text-gray-600">Route</p>
          <p class="text-2xl font-bold text-gray-900">${watch.origin} → ${watch.destination}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Departure</p>
          <p class="text-2xl font-bold text-gray-900">${formatDate(watch.departureDate)}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Current Price</p>
          <p class="text-2xl font-bold text-primary-600">${formatPrice(watch.currentPrice || 0)}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Status</p>
          <p class="text-2xl font-bold ${watch.active ? 'text-green-600' : 'text-gray-600'}">
            ${watch.active ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
        <div>
          <p class="text-sm text-gray-600">Lowest Price</p>
          <p class="text-xl font-bold text-green-600">${formatPrice(watch.lowestPrice || 0)}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Budget</p>
          <p class="text-xl font-bold text-gray-900">${formatPrice(watch.budget)}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Savings</p>
          <p class="text-xl font-bold text-blue-600">${formatPrice((watch.budget - (watch.lowestPrice || 0)))}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 pt-6 border-t text-sm">
        <div>
          <p class="text-gray-600">Passengers</p>
          <p class="font-semibold">${watch.passengers}</p>
        </div>
        <div>
          <p class="text-gray-600">Cabin Class</p>
          <p class="font-semibold capitalize">${watch.cabinClass}</p>
        </div>
        <div>
          <p class="text-gray-600">Created</p>
          <p class="font-semibold">${formatDate(watch.createdAt)}</p>
        </div>
        <div>
          <p class="text-gray-600">Last Updated</p>
          <p class="font-semibold">${formatDate(watch.updatedAt)}</p>
        </div>
      </div>
    `;

    // Display top flights if available
    if (watch.topFlights && watch.topFlights.flights && watch.topFlights.flights.length > 0) {
      displayTopFlights(watch.topFlights.flights);
    }

    // Load price history and alerts
    loadPriceHistory(id);
    loadAlerts(id);
  } else {
    showNotification(result.error, 'error');
  }
}

async function loadPriceHistory(id) {
  const result = await watchlistAPI.getPriceHistory(id, 30);

  if (result.success && result.data.history) {
    const history = result.data.history;

    if (history.length > 0) {
      const ctx = document.getElementById('price-chart');
      const dates = history.map(h => formatDate(h.date, 'MMM dd'));
      const prices = history.map(h => h.price);

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [{
            label: 'Price Trend',
            data: prices,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#0284c7',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: (value) => '$' + value,
              }
            }
          }
        }
      });
    }
  }
}

async function loadAlerts(watchlistId) {
  const alertsList = document.getElementById('alerts-list');

  try {
    const response = await fetch(`/api/watchlists/${watchlistId}/alerts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const alerts = data.alerts || [];

      if (alerts.length === 0) {
        alertsList.innerHTML = '<p class="text-gray-500">No alerts yet</p>';
        return;
      }

      alertsList.innerHTML = alerts.map(alert => `
        <div class="p-4 bg-${alert.type === 'price_drop' ? 'green' : 'blue'}-50 border-l-4 border-${alert.type === 'price_drop' ? 'green' : 'blue'}-500 rounded">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-900">${alert.title}</p>
              <p class="text-sm text-gray-600 mt-1">${alert.message}</p>
              ${alert.data ? `<p class="text-xs text-gray-500 mt-2">${JSON.stringify(alert.data).substring(0, 100)}...</p>` : ''}
            </div>
            <span class="text-xs text-gray-500">${formatDate(alert.createdAt)}</span>
          </div>
        </div>
      `).join('');
    } else {
      alertsList.innerHTML = '<p class="text-gray-500">Failed to load alerts</p>';
    }
  } catch (error) {
    alertsList.innerHTML = '<p class="text-gray-500">No alerts available</p>';
  }
}

function displayTopFlights(flights) {
  const section = document.getElementById('top-flights-section');
  const list = document.getElementById('top-flights-list');

  section.classList.remove('hidden');

  list.innerHTML = flights.map((flight, index) => `
    <div class="border rounded-lg p-4 hover:shadow-lg transition">
      <div class="flex justify-between items-start mb-3">
        <span class="inline-block px-3 py-1 rounded-full text-sm font-bold ${
          index === 0 ? 'bg-green-100 text-green-800' :
          index === 1 ? 'bg-blue-100 text-blue-800' :
          'bg-orange-100 text-orange-800'
        }">
          #${index + 1}
        </span>
        <span class="text-2xl font-bold text-primary-600">${formatPrice(flight.price)}</span>
      </div>
      <p class="font-semibold text-gray-900 mb-2">${flight.airline}</p>
      <div class="text-sm space-y-1 text-gray-600">
        <p>📅 ${flight.date}</p>
        <p>🛫 ${flight.departureTime} → 🛬 ${flight.arrivalTime}</p>
        <p>⏱️ ${flight.duration}m | 🛫 ${flight.stops === 0 ? 'Non-stop' : flight.stops + ' stop(s)'}</p>
      </div>
    </div>
  `).join('');
}

function attachDetailsListeners() {
  const id = new URLSearchParams(window.location.pathname).get('id') ||
    window.location.pathname.split('/watchlist/')[1]?.split('/')[0];

  document.getElementById('back-btn').addEventListener('click', async () => {
    await router.push('/watchlist');
  });

  document.getElementById('edit-btn').addEventListener('click', async () => {
    await router.push(`/watchlist/${id}/edit`);
  });

  document.getElementById('delete-btn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete this watch? This cannot be undone.')) {
      const result = await watchlistAPI.delete(id);
      if (result.success) {
        showNotification('Watch deleted successfully!', 'success');
        setTimeout(async () => {
          await router.push('/dashboard');
        }, 1500);
      } else {
        showNotification(result.error || 'Failed to delete watch', 'error');
      }
    }
  });
}
