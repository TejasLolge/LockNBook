/**
 * Centralized High-Performance API Client
 * Features:
 * - Request deduplication (reuses in-flight promises)
 * - In-memory cache for idempotent GET requests with TTL
 * - Automatic cache invalidation on mutations (POST, PUT, DELETE)
 * - Request timeout via AbortController
 * - Seamless fallback to mock fixture mode when backend is offline
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('lnb_auth_token') || null;
    this.cache = new Map();
    this.inFlightRequests = new Map();
    this.defaultTtl = 45 * 1000; // 45 seconds cache TTL
    this.unreachableUntil = 0;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('lnb_auth_token', token);
    } else {
      localStorage.removeItem('lnb_auth_token');
    }
    // Invalidate cache on auth change
    this.clearCache();
  }

  clearCache() {
    this.cache.clear();
  }

  async request(endpoint, options = {}) {
    const method = options.method || 'GET';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${cleanEndpoint}`;
    const cacheKey = `${method}:${cleanEndpoint}`;

    // Fast-path: If backend was unreachable in the last 15s, throw early to let dev/mock fallback respond instantly (0ms)
    if (this.unreachableUntil && Date.now() < this.unreachableUntil) {
      throw new Error('Backend currently unreachable. Fast-routing to development fixtures.');
    }

    // 1. Check in-memory cache for GET requests
    if (method === 'GET' && !options.skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.data;
      }
    }

    // 2. Request deduplication for simultaneous identical GET requests
    if (method === 'GET' && this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey);
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Agile 3.5s timeout for snappy UI interactions
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 3500);

    const executeRequest = async () => {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const error = new Error((data && (data.message || data.error)) || `Server returned error (${response.status})`);
          error.status = response.status;
          error.data = data;
          throw error;
        }

        // Cache successful GET responses
        if (method === 'GET') {
          this.cache.set(cacheKey, {
            data,
            expiresAt: Date.now() + (options.ttl || this.defaultTtl),
          });
        } else {
          // Invalidate GET cache on mutations
          this.clearCache();
        }

        return data;
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          this.unreachableUntil = Date.now() + 15000;
          throw new Error('Request timed out. Please check your connection.');
        }
        if (err.name === 'TypeError' || (err.message && err.message.includes('fetch'))) {
          this.unreachableUntil = Date.now() + 15000;
        }
        throw err;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    };

    const promise = executeRequest();
    if (method === 'GET') {
      this.inFlightRequests.set(cacheKey, promise);
    }

    return promise;
  }

  get(endpoint, headers = {}, options = {}) {
    return this.request(endpoint, { method: 'GET', headers, ...options });
  }

  post(endpoint, body, headers = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
      ...options,
    });
  }

  put(endpoint, body, headers = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
      ...options,
    });
  }

  delete(endpoint, headers = {}, options = {}) {
    return this.request(endpoint, { method: 'DELETE', headers, ...options });
  }
}

export const apiClient = new ApiClient();
export { API_BASE_URL };
