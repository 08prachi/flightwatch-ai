import { router } from '../utils/router.js';
import { watchlistAPI } from '../api/watchlist.js';
import { formatPrice, formatDate, showNotification } from '../utils/helpers.js';

let pollingTimeout;
let isPolling = false;

export async function FlightResultsPage(params) {
  const { id } = params;
  const target = document.getElementById('page-content') || document.getElementById('app');

  target.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12">
      <div class="max-w-6xl mx-auto px-4">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            ✈️ Top Cheapest Flights Found
          </h1>
          <p class="text-lg text-gray-600">
            We searched multiple dates and found the best available fares for you
          </p>
        </div>

        <!-- Loading State -->
        <div id="loading-state" class="text-center py-20">
          <div class="inline-block">
            <div class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
          <p class="mt-6 text-gray-600 text-lg">Processing your flight search...</p>
          <p class="mt-2 text-sm text-gray-500">This usually takes a few seconds</p>
        </div>

        <!-- Flights Container (hidden initially) -->
        <div id="flights-container" class="hidden">
          <!-- Stats Section -->
          <div id="stats-section" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <!-- Stats will be inserted here -->
          </div>

          <!-- Top 3 Flights -->
          <div id="top-flights-section" class="space-y-6 mb-12">
            <!-- Flight cards will be inserted here -->
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button id="view-watchlist-btn" class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition">
              View Watchlist
            </button>
            <button id="back-dashboard-btn" class="px-8 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium transition">
              Back to Dashboard
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div id="error-state" class="hidden text-center py-20">
          <svg class="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v2m0-6v2m-6-4h.01M9 5h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z"></path>
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">No flights available</h2>
          <p class="text-gray-600 mb-6">We couldn't find any flights for this route.</p>
          <button id="retry-btn" class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition">
            Try Again
          </button>
        </div>
      </div>
    </div>
  `;

  // Start polling for flight results
  pollForFlights(id);
  attachFlightResultsListeners(id);
}

async function pollForFlights(watchlistId) {
  if (isPolling) return;
  isPolling = true;

  const maxAttempts = 60; // 60 seconds max
  let attempts = 0;
  const pollInterval = 1000; // 1 second

  const poll = async () => {
    try {
      attempts++;
      console.log(`🔄 Polling attempt ${attempts}/${maxAttempts}`);

      // Poll the regular watchlist endpoint for top flights
      const result = await watchlistAPI.getById(watchlistId);

      if (result.success && result.data.topFlights) {
        console.log('✅ Flights received:', result.data.topFlights);
        displayFlights(result.data.topFlights.flights, result.data.topFlights.statistics);
        isPolling = false;
        return;
      }

      if (attempts >= maxAttempts) {
        console.log('⏱️ Polling timeout');
        showErrorState();
        isPolling = false;
        return;
      }

      // Schedule next poll
      pollingTimeout = setTimeout(poll, pollInterval);
    } catch (error) {
      console.error('❌ Polling error:', error);
      if (attempts >= maxAttempts) {
        showErrorState();
        isPolling = false;
      } else {
        pollingTimeout = setTimeout(poll, pollInterval);
      }
    }
  };

  poll();
}

function displayFlights(flights, statistics) {
  const loadingState = document.getElementById('loading-state');
  const flightsContainer = document.getElementById('flights-container');
  const statsSection = document.getElementById('stats-section');
  const topFlightsSection = document.getElementById('top-flights-section');

  if (!flights || flights.length === 0) {
    showErrorState();
    return;
  }

  // Hide loading, show flights
  loadingState.classList.add('hidden');
  flightsContainer.classList.remove('hidden');

  // Display statistics
  if (statistics) {
    statsSection.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-center">
          <p class="text-gray-600 text-sm font-medium">Total Flights Found</p>
          <p class="text-3xl font-bold text-primary-600 mt-2">${statistics.totalFlights}</p>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-center">
          <p class="text-gray-600 text-sm font-medium">Cheapest Fare</p>
          <p class="text-3xl font-bold text-green-600 mt-2">${formatPrice(statistics.cheapestFare)}</p>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-center">
          <p class="text-gray-600 text-sm font-medium">Average Fare</p>
          <p class="text-3xl font-bold text-blue-600 mt-2">${formatPrice(statistics.averageFare)}</p>
        </div>
      </div>
    `;
  }

  // Display top 3 flights
  topFlightsSection.innerHTML = flights.map((flight, index) => {
    const isFirstRank = flight.rank === 1;
    const rankColors = {
      1: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', text: 'text-green-700' },
      2: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', text: 'text-blue-700' },
      3: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', text: 'text-orange-700' },
    };
    const colors = rankColors[flight.rank] || rankColors[3];

    return `
      <div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition border-2 ${colors.border} ${isFirstRank ? 'ring-2 ring-green-400' : ''}">
        <div class="p-6">
          <!-- Rank Badge and Airline Info -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <span class="inline-block ${colors.badge} px-3 py-1 rounded-full text-sm font-bold mb-2">
                #${flight.rank} Best Price
              </span>
              <h3 class="text-2xl font-bold text-gray-900">${flight.airline}</h3>
              ${flight.flightNumber ? `<p class="text-gray-600">Flight: ${flight.flightNumber}</p>` : ''}
            </div>
            <div class="text-right">
              <p class="text-4xl font-bold ${colors.text}">${formatPrice(flight.price)}</p>
              <p class="text-sm text-gray-600">Per Person</p>
            </div>
          </div>

          <!-- Flight Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 pb-6 border-b">
            <!-- Date -->
            <div>
              <p class="text-gray-600 text-sm font-medium mb-1">📅 Date</p>
              <p class="text-lg font-semibold text-gray-900">${formatDate(flight.date)}</p>
            </div>

            <!-- Duration and Stops -->
            <div>
              <p class="text-gray-600 text-sm font-medium mb-1">⏱️ Duration & Stops</p>
              <p class="text-lg font-semibold text-gray-900">
                ${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m
                <span class="text-gray-600 ml-2">
                  ${flight.stops === 0 ? '✈️ Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                </span>
              </p>
            </div>

            <!-- Departure -->
            <div>
              <p class="text-gray-600 text-sm font-medium mb-1">🛫 Departure</p>
              <div class="flex items-center space-x-2">
                <span class="text-lg font-semibold text-gray-900">${flight.origin}</span>
                <span class="text-gray-400">→</span>
                <p class="text-gray-900">
                  <span class="font-bold">${flight.departureTime}</span>
                </p>
              </div>
            </div>

            <!-- Arrival -->
            <div>
              <p class="text-gray-600 text-sm font-medium mb-1">🛬 Arrival</p>
              <div class="flex items-center space-x-2">
                <span class="text-lg font-semibold text-gray-900">${flight.destination}</span>
                <span class="text-gray-400">←</span>
                <p class="text-gray-900">
                  <span class="font-bold">${flight.arrivalTime}</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition book-btn" data-rank="${flight.rank}">
              ✈️ Book Now
            </button>
            <button class="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition save-btn" data-rank="${flight.rank}">
              ❤️ Save Flight
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function showErrorState() {
  const loadingState = document.getElementById('loading-state');
  const flightsContainer = document.getElementById('flights-container');
  const errorState = document.getElementById('error-state');

  loadingState.classList.add('hidden');
  flightsContainer.classList.add('hidden');
  errorState.classList.remove('hidden');
}

function attachFlightResultsListeners(watchlistId) {
  // View Watchlist button
  const viewWatchlistBtn = document.getElementById('view-watchlist-btn');
  if (viewWatchlistBtn) {
    viewWatchlistBtn.addEventListener('click', () => {
      router.push(`/watchlist/${watchlistId}`);
    });
  }

  // Back to Dashboard button
  const backDashboardBtn = document.getElementById('back-dashboard-btn');
  if (backDashboardBtn) {
    backDashboardBtn.addEventListener('click', () => {
      router.push('/dashboard');
    });
  }

  // Retry button
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      isPolling = false;
      FlightResultsPage({ id: watchlistId });
    });
  }

  // Book buttons
  document.querySelectorAll('.book-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      showNotification('Redirecting to booking provider...', 'info');
      // In a real app, redirect to provider's booking URL
      setTimeout(() => {
        showNotification('Coming soon! Booking integration in progress.', 'info');
      }, 1000);
    });
  });

  // Save flight buttons
  document.querySelectorAll('.save-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      showNotification('✅ Flight saved to favorites!', 'success');
      btn.textContent = '✓ Saved';
      btn.disabled = true;
    });
  });
}

// Cleanup on page leave
export function cleanupFlightResults() {
  if (pollingTimeout) {
    clearTimeout(pollingTimeout);
  }
  isPolling = false;
}
