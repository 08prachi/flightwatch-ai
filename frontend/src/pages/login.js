import { authAPI } from '../api/auth.js';
import { router } from '../utils/router.js';
import { validateEmail, validatePassword, showNotification } from '../utils/helpers.js';

export async function LoginPage() {
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
          <p class="text-gray-600 mt-2">Smart flight price tracking</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>

          <form id="login-form" class="space-y-4">
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
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center">
                <input type="checkbox" class="w-4 h-4 text-primary-600 rounded">
                <span class="ml-2 text-gray-600">Remember me</span>
              </label>
              <a href="#" class="text-primary-600 hover:text-primary-700 font-medium">Forgot password?</a>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition disabled:opacity-50"
            >
              Sign In
            </button>
          </form>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <!-- Social Login -->
          <div class="grid grid-cols-2 gap-4">
            <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition">
              Google
            </button>
            <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition">
              GitHub
            </button>
          </div>

          <!-- Sign Up Link -->
          <p class="text-center text-gray-600 text-sm mt-6">
            Don't have an account?
            <a href="/signup" data-link class="text-primary-600 hover:text-primary-700 font-semibold">Sign up</a>
          </p>
        </div>

        <!-- Footer -->
        <p class="text-center text-gray-500 text-xs mt-8">
          By signing in, you agree to our
          <a href="#" class="text-primary-600 hover:text-primary-700">Terms of Service</a>
          and
          <a href="#" class="text-primary-600 hover:text-primary-700">Privacy Policy</a>
        </p>
      </div>
    </div>
  `;

  attachLoginListeners();
}

function attachLoginListeners() {
  const form = document.getElementById('login-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!validateEmail(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    if (!validatePassword(password)) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    const result = await authAPI.login(email, password);

    if (result.success) {
      showNotification('Login successful!', 'success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } else {
      showNotification(result.error, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
}
