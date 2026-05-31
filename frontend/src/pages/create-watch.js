import { watchlistAPI } from '../api/watchlist.js';
import { router } from '../utils/router.js';
import { showNotification } from '../utils/helpers.js';

export async function CreateWatchPage() {
  // Use page-content if available (has header), otherwise use app
  const target = document.getElementById('page-content') || document.getElementById('app');

  target.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-2xl mx-auto px-4 py-8">
        <!-- Header -->
        <button id="back-btn" class="mb-6 flex items-center text-primary-600 hover:text-primary-700 font-medium">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Dashboard
        </button>

        <!-- Form Card -->
        <div class="bg-white rounded-lg shadow p-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-6">Create Flight Watch</h1>

          <form id="watch-form" class="space-y-6">
            <!-- Origin -->
            <div>
              <label for="origin" class="block text-sm font-medium text-gray-700 mb-2">From (Airport Code)</label>
              <input
                type="text"
                id="origin"
                placeholder="NYC, LAX, ORD..."
                required
                maxlength="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
              >
              <p class="text-xs text-gray-500 mt-1">Enter 3-letter airport code (e.g., NYC)</p>
            </div>

            <!-- Destination -->
            <div>
              <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">To (Airport Code)</label>
              <input
                type="text"
                id="destination"
                placeholder="NYC, LAX, ORD..."
                required
                maxlength="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
              >
              <p class="text-xs text-gray-500 mt-1">Enter 3-letter airport code (e.g., LAX)</p>
            </div>

            <!-- Departure Date -->
            <div>
              <label for="departure-date" class="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
              <input
                type="date"
                id="departure-date"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
            </div>

            <!-- Return Date -->
            <div>
              <label for="return-date" class="block text-sm font-medium text-gray-700 mb-2">Return Date (Optional)</label>
              <input
                type="date"
                id="return-date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
            </div>

            <!-- Budget -->
            <div>
              <label for="budget" class="block text-sm font-medium text-gray-700 mb-2">Budget ($) <span class="text-gray-400 text-sm">(Optional)</span></label>
              <input
                type="number"
                id="budget"
                placeholder="500"
                min="1"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
              <p class="text-xs text-gray-500 mt-1">Maximum price you want to pay (leave empty for no limit)</p>
            </div>

            <!-- Passengers -->
            <div>
              <label for="passengers" class="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
              <select id="passengers" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="1">1 Passenger</option>
                <option value="2">2 Passengers</option>
                <option value="3">3 Passengers</option>
                <option value="4">4 Passengers</option>
                <option value="5">5 Passengers</option>
                <option value="6">6 Passengers</option>
              </select>
            </div>

            <!-- Cabin Class -->
            <div>
              <label for="cabin-class" class="block text-sm font-medium text-gray-700 mb-2">Cabin Class</label>
              <select id="cabin-class" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>

            <!-- Submit Button -->
            <div class="flex gap-4 pt-4">
              <button
                type="submit"
                class="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition"
              >
                Create Watch
              </button>
              <button
                type="button"
                id="cancel-btn"
                class="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  attachWatchFormListeners();
}

function attachWatchFormListeners() {
  const form = document.getElementById('watch-form');
  const backBtn = document.getElementById('back-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  backBtn.addEventListener('click', async () => {
    await router.push('/dashboard');
  });

  cancelBtn.addEventListener('click', async () => {
    await router.push('/dashboard');
  });

  // Auto-uppercase airport codes
  document.getElementById('origin').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  document.getElementById('destination').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const origin = document.getElementById('origin').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const departureDate = document.getElementById('departure-date').value;
    const returnDate = document.getElementById('return-date').value;
    const budgetInput = document.getElementById('budget').value;
    const budget = budgetInput ? parseFloat(budgetInput) : 999999;
    const passengers = parseInt(document.getElementById('passengers').value);
    const cabinClass = document.getElementById('cabin-class').value;

    // Validation
    if (!origin || !destination || !departureDate) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (origin.length !== 3 || destination.length !== 3) {
      showNotification('Airport codes must be 3 letters', 'error');
      return;
    }

    if (origin === destination) {
      showNotification('Origin and destination cannot be the same', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    // Call API
    const result = await watchlistAPI.create({
      origin,
      destination,
      departureDate: new Date(departureDate).toISOString(),
      returnDate: returnDate ? new Date(returnDate).toISOString() : null,
      budget,
      passengers,
      flightType: 'any',
      cabinClass,
      active: true,
    });

    if (result.success) {
      const watchId = result.data.id;
      showNotification('Watch created! Searching flights and sending email...', 'success');

      setTimeout(async () => {
        await router.push(`/watchlist/${watchId}`);
      }, 500);
    } else {
      showNotification(result.error || 'Failed to create watch', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Watch';
    }
  });
}
