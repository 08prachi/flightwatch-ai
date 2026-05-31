export async function HomePage() {
  const { storage } = await import('../utils/storage.js');
  const isAuthenticated = storage.isAuthenticated();
  const target = document.getElementById('page-content') || document.getElementById('app');

  target.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <!-- Hero Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center mb-16">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Never Overpay for Flight Tickets Again
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            FlightWatch AI continuously monitors flight prices and alerts you the moment the perfect deal appears. Smart tracking for smart travelers.
          </p>
          ${isAuthenticated ? `
            <a href="/dashboard" data-link class="inline-block px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-lg transition">
              Go to Dashboard
            </a>
          ` : `
            <a href="/signup" data-link class="inline-block px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-lg transition">
              Get Started Free
            </a>
          `}
        </div>

        <!-- Features -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 my-20">
          <div class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Real-Time Tracking</h3>
            <p class="text-gray-600">Monitor flight prices 24/7 across multiple airlines and route combinations.</p>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Instant Alerts</h3>
            <p class="text-gray-600">Get notified via email, push notification, or WhatsApp when prices drop below your budget.</p>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Price Analysis</h3>
            <p class="text-gray-600">View historical price trends and AI-powered recommendations on when to buy.</p>
          </div>
        </div>

        <!-- How It Works -->
        <div class="my-20">
          <h2 class="text-4xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="relative">
              <div class="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4">1</div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Create a Watch</h3>
              <p class="text-gray-600">Set your flight route, dates, and budget preferences.</p>
            </div>

            <div class="relative">
              <div class="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4">2</div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">We Monitor</h3>
              <p class="text-gray-600">Our system continuously checks prices across airlines.</p>
            </div>

            <div class="relative">
              <div class="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4">3</div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Get Alerts</h3>
              <p class="text-gray-600">Receive instant notifications when great deals appear.</p>
            </div>

            <div class="relative">
              <div class="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4">4</div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Save Money</h3>
              <p class="text-gray-600">Book at the perfect time and enjoy your trip!</p>
            </div>
          </div>
        </div>

        <!-- Pricing -->
        <div class="my-20">
          <h2 class="text-4xl font-bold text-gray-900 text-center mb-16">Simple Pricing</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div class="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Free</h3>
              <p class="text-gray-600 mb-6">Perfect for casual travelers</p>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                  3 Active Watches
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                  Email Alerts
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                  30-Day History
                </li>
              </ul>
              <button class="w-full px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium transition">
                Get Started
              </button>
            </div>

            <div class="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg shadow-lg p-8 text-white border-2 border-primary-600 relative">
              <span class="absolute -top-4 right-6 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold">POPULAR</span>
              <h3 class="text-2xl font-bold mb-4">Premium</h3>
              <p class="text-white opacity-90 mb-6">For frequent flyers</p>
              <div class="mb-6">
                <span class="text-4xl font-bold">$9.99</span>
                <span class="text-white opacity-75">/month</span>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-yellow-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                  Unlimited Watches
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-yellow-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                  Email + Push + WhatsApp
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-yellow-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                  AI Predictions
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-yellow-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                  Priority Support
                </li>
              </ul>
              <button class="w-full px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 font-medium transition font-semibold">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="bg-gray-900 text-gray-400 py-12 mt-20">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 FlightWatch AI. All rights reserved.</p>
          <div class="mt-4 space-x-6">
            <a href="#" class="hover:text-white">Privacy Policy</a>
            <a href="#" class="hover:text-white">Terms of Service</a>
            <a href="#" class="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  `;
}
