import { storage } from './storage.js';

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.params = {};
  }

  register(path, handler, requiresAuth = false) {
    this.routes.set(path, { handler, requiresAuth });
  }

  async navigate(path) {
    const isAuthenticated = storage.isAuthenticated();

    const route = Array.from(this.routes.entries()).find(([routePath]) => {
      return routePath === path || this.matchRoute(routePath, path);
    });

    if (!route) {
      this.renderNotFound();
      return;
    }

    const [routePath, { handler, requiresAuth }] = route;

    // Redirect if not authenticated and route requires auth
    if (requiresAuth && !isAuthenticated) {
      if (path !== '/login') {
        window.history.pushState({}, '', '/login');
        return this.navigate('/login');
      }
    }

    // Redirect if authenticated and trying to access login
    if (path === '/login' && isAuthenticated) {
      if (this.currentRoute !== '/dashboard') {
        window.history.pushState({}, '', '/dashboard');
        return this.navigate('/dashboard');
      }
    }

    this.params = this.extractParams(routePath, path);
    this.currentRoute = path;

    // Re-render header to reflect current auth state
    const { Header, attachHeaderListeners } = await import('../components/header.js');
    const headerContainer = document.querySelector('header');
    if (headerContainer) {
      headerContainer.innerHTML = Header();
    }

    await handler(this.params);

    // Attach header listeners after page renders
    setTimeout(() => attachHeaderListeners(), 0);
  }

  matchRoute(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return false;

    return patternParts.every((part, i) => {
      return part.startsWith(':') || part === pathParts[i];
    });
  }

  extractParams(pattern, path) {
    const params = {};
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    patternParts.forEach((part, i) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = pathParts[i];
      }
    });

    return params;
  }

  renderNotFound() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p class="text-gray-600 mb-8">Page not found</p>
          <a href="/" class="text-primary-600 hover:text-primary-700 font-semibold">
            Go back home
          </a>
        </div>
      </div>
    `;
  }

  setupHistoryListeners() {
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname);
    });

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]');
      if (link) {
        e.preventDefault();
        const path = link.getAttribute('href');
        window.history.pushState({}, '', path);
        this.navigate(path);
      }
    });
  }

  async push(path) {
    window.history.pushState({}, '', path);
    await this.navigate(path);
  }
}

export const router = new Router();
