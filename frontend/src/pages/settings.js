import { authAPI } from '../api/auth.js';
import { notificationsAPI } from '../api/notifications.js';
import { storage } from '../utils/storage.js';
import { validatePassword, showNotification } from '../utils/helpers.js';

export async function SettingsPage() {
  const target = document.getElementById('page-content') || document.getElementById('app');
  const user = storage.getUser();

  target.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <!-- Settings Tabs -->
        <div class="flex space-x-4 border-b border-gray-200 mb-8">
          <button class="settings-tab px-4 py-3 font-medium text-primary-600 border-b-2 border-primary-600" data-tab="account">
            Account
          </button>
          <button class="settings-tab px-4 py-3 font-medium text-gray-600 hover:text-gray-900" data-tab="notifications">
            Notifications
          </button>
          <button class="settings-tab px-4 py-3 font-medium text-gray-600 hover:text-gray-900" data-tab="preferences">
            Preferences
          </button>
        </div>

        <!-- Account Settings -->
        <div id="account-tab" class="settings-content bg-white rounded-lg shadow p-8 mb-6">
          <!-- Profile Info -->
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
            <form id="profile-form" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value="${user?.name || ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value="${user?.email || ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                </div>
              </div>
              <button
                type="submit"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
              >
                Save Changes
              </button>
            </form>
          </div>

          <!-- Change Password -->
          <div class="border-t pt-8">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
            <form id="password-form" class="space-y-6 max-w-md">
              <div>
                <label for="current-password" class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  id="current-password"
                  placeholder="••••••••"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
              </div>
              <div>
                <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  placeholder="••••••••"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
              </div>
              <div>
                <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="••••••••"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
              </div>
              <button
                type="submit"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div id="notifications-tab" class="settings-content hidden bg-white rounded-lg shadow p-8 mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
          <form id="notifications-form" class="space-y-6">
            <div class="space-y-4">
              <label class="flex items-center">
                <input type="checkbox" id="email-alerts" checked class="w-4 h-4 text-primary-600 rounded">
                <span class="ml-3 text-gray-700">Email notifications for price drops</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" id="push-alerts" checked class="w-4 h-4 text-primary-600 rounded">
                <span class="ml-3 text-gray-700">Push notifications on mobile</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" id="weekly-digest" checked class="w-4 h-4 text-primary-600 rounded">
                <span class="ml-3 text-gray-700">Weekly price digest</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" id="marketing" class="w-4 h-4 text-primary-600 rounded">
                <span class="ml-3 text-gray-700">Marketing emails and updates</span>
              </label>
            </div>

            <div class="pt-4 border-t">
              <h3 class="font-medium text-gray-900 mb-4">Notification Timing</h3>
              <div class="space-y-4">
                <label class="block">
                  <span class="text-sm text-gray-700">Preferred time to receive alerts</span>
                  <select id="alert-time" class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option>Immediately</option>
                    <option>9:00 AM</option>
                    <option>12:00 PM</option>
                    <option>6:00 PM</option>
                  </select>
                </label>
              </div>
            </div>

            <button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
            >
              Save Preferences
            </button>
          </form>
        </div>

        <!-- Preferences -->
        <div id="preferences-tab" class="settings-content hidden bg-white rounded-lg shadow p-8 mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">General Preferences</h2>
          <form id="preferences-form" class="space-y-6">
            <div>
              <label for="currency" class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select id="currency" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="INR">Indian Rupee (INR)</option>
              </select>
            </div>

            <div>
              <label for="theme" class="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select id="theme" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
            >
              Save Preferences
            </button>
          </form>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 class="text-xl font-bold text-red-900 mb-4">Danger Zone</h2>
          <p class="text-red-800 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button id="delete-account-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  `;

  attachSettingsListeners();
  loadNotificationPreferences();
}

function attachSettingsListeners() {
  // Tab switching
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;

      document.querySelectorAll('.settings-tab').forEach(t => {
        t.classList.remove('border-b-2', 'border-primary-600', 'text-primary-600');
        t.classList.add('text-gray-600');
      });
      e.target.classList.add('border-b-2', 'border-primary-600', 'text-primary-600');

      document.querySelectorAll('.settings-content').forEach(content => {
        content.classList.add('hidden');
      });
      document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    });
  });

  // Profile form
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const btn = e.target.querySelector('button[type="submit"]');

    btn.disabled = true;
    const result = await authAPI.updateProfile(name, email);
    if (result.success) {
      showNotification('Profile updated successfully', 'success');
    } else {
      showNotification(result.error, 'error');
    }
    btn.disabled = false;
  });

  // Password form
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!validatePassword(newPassword)) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    const result = await authAPI.changePassword(currentPassword, newPassword);
    if (result.success) {
      showNotification('Password changed successfully', 'success');
      e.target.reset();
    } else {
      showNotification(result.error, 'error');
    }
    btn.disabled = false;
  });

  // Notifications form
  document.getElementById('notifications-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const preferences = {
      emailAlerts: document.getElementById('email-alerts').checked,
      pushAlerts: document.getElementById('push-alerts').checked,
      weeklyDigest: document.getElementById('weekly-digest').checked,
      marketing: document.getElementById('marketing').checked,
      alertTime: document.getElementById('alert-time').value,
    };

    const result = await notificationsAPI.updatePreferences(preferences);
    if (result.success) {
      showNotification('Preferences saved', 'success');
    } else {
      showNotification(result.error, 'error');
    }
  });

  // Delete account
  document.getElementById('delete-account-btn').addEventListener('click', async () => {
    if (confirm('Are you sure? This action cannot be undone.')) {
      if (confirm('Type "DELETE" to confirm deletion')) {
        showNotification('Account deletion initiated', 'info');
        setTimeout(() => {
          storage.removeToken();
          storage.removeUser();
          router.push('/login');
        }, 1500);
      }
    }
  });
}

async function loadNotificationPreferences() {
  const result = await notificationsAPI.getPreferences();
  if (result.success) {
    const prefs = result.data;
    if (prefs.emailAlerts !== undefined) {
      document.getElementById('email-alerts').checked = prefs.emailAlerts;
    }
    if (prefs.pushAlerts !== undefined) {
      document.getElementById('push-alerts').checked = prefs.pushAlerts;
    }
  }
}
