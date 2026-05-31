import { format, parseISO, differenceInDays } from 'date-fns';

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return date;
  }
};

export const formatTime = (time) => {
  return format(parseISO(time), 'hh:mm a');
};

export const getDaysUntil = (date) => {
  const days = differenceInDays(parseISO(date), new Date());
  return days > 0 ? days : 0;
};

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const getPriceStatus = (currentPrice, previousPrice) => {
  if (!previousPrice) return 'neutral';
  if (currentPrice < previousPrice) return 'down';
  if (currentPrice > previousPrice) return 'up';
  return 'neutral';
};

export const getPriceColor = (status) => {
  switch (status) {
    case 'down':
      return 'text-green-600';
    case 'up':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getPriceIcon = (status) => {
  switch (status) {
    case 'down':
      return '↓';
    case 'up':
      return '↑';
    default:
      return '→';
  }
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const showNotification = (message, type = 'success', duration = 3000) => {
  const notification = document.createElement('div');
  notification.className = `
    fixed top-4 right-4 p-4 rounded-lg text-white shadow-lg z-50 animate-fadeIn
    ${type === 'success' ? 'bg-green-500' : ''}
    ${type === 'error' ? 'bg-red-500' : ''}
    ${type === 'warning' ? 'bg-yellow-500' : ''}
    ${type === 'info' ? 'bg-blue-500' : ''}
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, duration);
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return (...args) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};
