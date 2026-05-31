import { authAPI } from '../api/auth.js';
import { router } from '../utils/router.js';
import { validateEmail, validatePassword, showNotification } from '../utils/helpers.js';

export async function SignupPage() {
  const target = document.getElementById('page-content') || document.getElementById('app');

  target.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center space-x-2 mb-4">
            <div class="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">FlightWatch AI</h1>
          <p class="text-gray-600 mt-2">Start tracking flight prices today</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Create Your Account</h2>

          <form id="signup-form" class="space-y-4">
            <!-- Full Name Input -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              >
            </div>

            <!-- Email Input -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              >
            </div>

            <!-- Password Input -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              >
              <p class="mt-1 text-xs text-gray-500">At least 6 characters</p>
            </div>

            <!-- Confirm Password Input -->
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                placeholder="••••••••"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              >
            </div>

            <!-- Terms Agreement -->
            <label class="flex items-start">
              <input type="checkbox" id="terms" required class="w-4 h-4 text-primary-600 rounded mt-1">
              <span class="ml-2 text-sm text-gray-600">
                I agree to the
                <a href="#" class="text-primary-600 hover:text-primary-700">Terms of Service</a>
                and
                <a href="#" class="text-primary-600 hover:text-primary-700">Privacy Policy</a>
              </span>
            </label>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition disabled:opacity-50"
            >
              Create Account
            </button>
          </form>

          <!-- Sign In Link -->
          <p class="text-center text-gray-600 text-sm mt-6">
            Already have an account?
            <a href="/login" data-link class="text-primary-600 hover:text-primary-700 font-semibold">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `;

  attachSignupListeners();
}

function attachSignupListeners() {
  const form = document.getElementById('signup-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!name) {
      showNotification('Please enter your full name', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    if (!validatePassword(password)) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    const result = await authAPI.signup(email, password, name);

    if (result.success) {
      showNotification('Account created! Redirecting to login...', 'success');
      setTimeout(async () => {
        await router.push('/login');
      }, 1000);
    } else {
      showNotification(result.error, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}
