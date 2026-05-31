import { flightsAPI } from '../api/flights.js';
import { watchlistAPI } from '../api/watchlist.js';
import { formatPrice, formatDate, formatDuration, showNotification } from '../utils/helpers.js';
import { router } from '../utils/router.js';

export async function SearchPage() {
  const target = document.getElementById('page-content') || document.getElementById('app');

  target.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- Search Form Section -->
      <div class="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <form id="search-form" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- Origin -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">From</label>
                <input
                  type="text"
                  id="origin"
                  placeholder="Departure city"
                  autocomplete="off"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  list="origins-list"
                >
                <datalist id="origins-list"></datalist>
              </div>

              <!-- Destination -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  type="text"
                  id="destination"
                  placeholder="Destination city"
                  autocomplete="off"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  list="destinations-list"
                >
                <datalist id="destinations-list"></datalist>
              </div>

              <!-- Departure Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Depart</label>
                <input
                  type="date"
                  id="departure-date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
              </div>

              <!-- Return Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Return</label>
                <input
                  type="date"
                  id="return-date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
              </div>

              <!-- Passengers -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                <select id="passengers" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4 Passengers</option>
                  <option value="5">5 Passengers</option>
                  <option value="6">6 Passengers</option>
                </select>
              </div>
            </div>

            <div class="flex gap-4">
              <button
                type="submit"
                class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition"
              >
                Search Flights
              </button>
              <button
                type="button"
                id="advanced-btn"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Advanced Filters
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Results Section -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div id="results-container" class="hidden">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Flight Results</h2>
          <div id="flights-list" class="space-y-4">
            <!-- Flight cards will be inserted here -->
          </div>
        </div>

        <div id="loading-state" class="hidden">
          <div class="text-center py-12">
            <div class="inline-block">
              <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p class="mt-4 text-gray-600">Searching for flights...</p>
          </div>
        </div>

        <div id="empty-state" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-9-2m9 2l9-2m-18-8l9-2m9 2l-9-2m0 0V5"></path>
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900">Start searching for flights</h3>
          <p class="mt-1 text-gray-500">Fill in your flight details and click search to get started.</p>
        </div>

        <div id="error-state" class="hidden bg-red-50 border border-red-200 rounded-lg p-6">
          <p class="text-red-800" id="error-message"></p>
        </div>
      </div>
    </div>
  `;

  attachSearchListeners();
}

function attachSearchListeners() {
  const form = document.getElementById('search-form');
  const searchBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departureDate = document.getElementById('departure-date').value;
    const passengers = document.getElementById('passengers').value;

    if (!origin || !destination || !departureDate) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('results-container').classList.add('hidden');

    const result = await flightsAPI.search({
      origin,
      destination,
      departureDate,
      returnDate: document.getElementById('return-date').value,
      passengers,
    });

    if (result.success && result.data.flights) {
      displayFlights(result.data.flights);
    } else {
      document.getElementById('error-state').classList.remove('hidden');
      document.getElementById('error-message').textContent = result.error;
    }

    document.getElementById('loading-state').classList.add('hidden');
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search Flights';
  });
}

function displayFlights(flights) {
  const container = document.getElementById('results-container');
  const list = document.getElementById('flights-list');

  list.innerHTML = flights.map(flight => `
    <div class="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Flight Info -->
        <div>
          <div class="flex items-center space-x-4">
            <div>
              <p class="text-sm text-gray-500">Departure</p>
              <p class="text-2xl font-bold text-gray-900">${flight.departureTime}</p>
              <p class="text-sm text-gray-600">${flight.origin}</p>
            </div>
            <div class="flex-1 border-t-2 border-gray-300 relative mt-4">
              <span class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                ${formatDuration(flight.duration)}
              </span>
            </div>
            <div>
              <p class="text-sm text-gray-500">Arrival</p>
              <p class="text-2xl font-bold text-gray-900">${flight.arrivalTime}</p>
              <p class="text-sm text-gray-600">${flight.destination}</p>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <p class="text-sm">
              <span class="text-gray-600">Airline:</span>
              <span class="font-medium text-gray-900">${flight.airline}</span>
            </p>
            <p class="text-sm">
              <span class="text-gray-600">Stops:</span>
              <span class="font-medium text-gray-900">${flight.stops === 0 ? 'Direct' : flight.stops + ' stop(s)'}</span>
            </p>
          </div>
        </div>

        <!-- Price Info -->
        <div class="flex flex-col justify-between">
          <div>
            <p class="text-sm text-gray-500">Best Price</p>
            <p class="text-3xl font-bold text-primary-600">${formatPrice(flight.price)}</p>
            <p class="text-xs text-gray-500 mt-1">Per person</p>
          </div>
          ${flight.priceChange ? `
            <p class="text-sm ${flight.priceChange > 0 ? 'text-red-600' : 'text-green-600'}">
              ${flight.priceChange > 0 ? '↑' : '↓'} ${Math.abs(flight.priceChange)}% from last check
            </p>
          ` : ''}
        </div>

        <!-- Actions -->
        <div class="flex flex-col justify-between">
          <div class="space-y-2">
            <button class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition view-flight-btn" data-flight='${JSON.stringify(flight)}'>
              View Details
            </button>
            <button class="w-full px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium transition watch-flight-btn" data-flight='${JSON.stringify(flight)}'>
              Create Watch
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  container.classList.remove('hidden');
  attachFlightListeners();
}

function attachFlightListeners() {
  document.querySelectorAll('.view-flight-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const flight = JSON.parse(e.target.dataset.flight);
      showNotification(`Viewing ${flight.airline} flight`, 'info');
    });
  });

  document.querySelectorAll('.watch-flight-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const flight = JSON.parse(e.target.dataset.flight);

      const watch = {
        origin: flight.origin,
        destination: flight.destination,
        departureDate: flight.departureDate,
        budget: flight.price * 1.2,
        passengers: 1,
        active: true,
      };

      const result = await watchlistAPI.create(watch);
      if (result.success) {
        showNotification('Watchlist created! Tracking flight prices.', 'success');
        setTimeout(() => {
          router.push('/watchlist');
        }, 1500);
      } else {
        showNotification(result.error, 'error');
      }
    });
  });
}
