import { notificationsAPI } from '../api/notifications.js';
import { formatDate, formatPrice, showNotification } from '../utils/helpers.js';

export async function NotificationsPage() {
  const target = document.getElementById('page-content') || document.getElementById('app');

  target.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Notifications</h1>
          <button id="mark-all-read-btn" class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition">
            Mark all as read
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <select id="filter-type" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            <option value="all">All Notifications</option>
            <option value="price_drop">Price Drops</option>
            <option value="price_alert">Price Alerts</option>
            <option value="system">System Alerts</option>
          </select>
        </div>

        <!-- Notifications List -->
        <div id="notifications-container" class="space-y-4">
          <!-- Loading state -->
          <div class="bg-white rounded-lg shadow animate-pulse p-6 h-24"></div>
          <div class="bg-white rounded-lg shadow animate-pulse p-6 h-24"></div>
          <div class="bg-white rounded-lg shadow animate-pulse p-6 h-24"></div>
        </div>

        <!-- Empty State -->
        <div id="empty-state" class="hidden text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
          <p class="mt-1 text-gray-500">You're all caught up!</p>
        </div>
      </div>
    </div>
  `;

  loadNotifications();
}

async function loadNotifications() {
  const result = await notificationsAPI.getAll();

  if (result.success && result.data.notifications) {
    const notifications = result.data.notifications;
    const container = document.getElementById('notifications-container');
    const emptyState = document.getElementById('empty-state');

    if (notifications.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    container.innerHTML = notifications.map(notif => {
      let icon, bgColor, textColor;

      switch (notif.type) {
        case 'price_drop':
          icon = '📉';
          bgColor = 'bg-green-50';
          textColor = 'text-green-700';
          break;
        case 'price_alert':
          icon = '⚠️';
          bgColor = 'bg-yellow-50';
          textColor = 'text-yellow-700';
          break;
        default:
          icon = 'ℹ️';
          bgColor = 'bg-blue-50';
          textColor = 'text-blue-700';
      }

      return `
        <div class="${bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-md transition cursor-pointer notification-item" data-id="${notif.id}">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <span class="text-2xl">${icon}</span>
                <h3 class="font-semibold text-gray-900">${notif.title}</h3>
                ${!notif.read ? '<span class="px-2 py-1 bg-primary-600 text-white text-xs rounded-full font-semibold">New</span>' : ''}
              </div>
              <p class="text-gray-700 mb-2">${notif.message}</p>

              ${notif.data ? `
                <div class="mt-3 space-y-1 text-sm text-gray-600">
                  ${notif.data.route ? `<p><strong>Route:</strong> ${notif.data.route}</p>` : ''}
                  ${notif.data.price ? `<p><strong>Price:</strong> ${formatPrice(notif.data.price)}</p>` : ''}
                  ${notif.data.savings ? `<p><strong>Savings:</strong> ${formatPrice(notif.data.savings)}</p>` : ''}
                </div>
              ` : ''}

              <p class="mt-3 text-xs text-gray-500">${formatDate(notif.createdAt, 'MMM dd, yyyy hh:mm a')}</p>
            </div>
            <button class="delete-notification-btn px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition ml-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    attachNotificationListeners(notifications);
  }
}

function attachNotificationListeners(notifications) {
  document.querySelectorAll('.notification-item').forEach((item, index) => {
    const notif = notifications[index];

    item.addEventListener('click', async () => {
      if (!notif.read) {
        await notificationsAPI.markAsRead(notif.id);
      }
    });

    item.querySelector('.delete-notification-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const result = await notificationsAPI.delete(notif.id);
      if (result.success) {
        showNotification('Notification deleted', 'success');
        loadNotifications();
      }
    });
  });

  document.getElementById('mark-all-read-btn').addEventListener('click', async () => {
    const result = await notificationsAPI.markAllAsRead();
    if (result.success) {
      showNotification('All notifications marked as read', 'success');
      loadNotifications();
    }
  });

  document.getElementById('filter-type').addEventListener('change', (e) => {
    const type = e.target.value;
    document.querySelectorAll('.notification-item').forEach(item => {
      if (type === 'all' || item.className.includes(type)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
}
