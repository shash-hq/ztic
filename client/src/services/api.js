import axios from 'axios';

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL,
  timeout:         10000,
  withCredentials: true, // required: sends httpOnly refresh cookie on every request
  headers:         { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config) => {
  // Dynamically read from localStorage on every request
  // so we always use the latest rotated token
  try {
    const raw   = localStorage.getItem('ztic-auth');
    const state = raw ? JSON.parse(raw) : null;
    const token = state?.state?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Silently ignore parse errors
  }
  return config;
});

// ── Response interceptor: silent token refresh on 401 ────────────────────────
let isRefreshing     = false;
let failedQueue      = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const original = err.config;

    const is401        = err.response?.status === 401;
    const isRetry      = original._retry;
    const isAuthRoute  = original.url?.includes('/auth/');

    if (is401 && !isRetry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue the request until the ongoing refresh resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch(Promise.reject.bind(Promise));
      }

      original._retry  = true;
      isRefreshing      = true;

      try {
        const data = await api.post('/auth/token/refresh');
        const newToken = data?.data?.accessToken;

        if (newToken) {
          // Patch localStorage directly so the request interceptor picks it up
          const raw   = localStorage.getItem('ztic-auth');
          const state = raw ? JSON.parse(raw) : { state: {} };
          state.state.accessToken = newToken;
          localStorage.setItem('ztic-auth', JSON.stringify(state));

          original.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(original);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Refresh failed — clear session and redirect to login
        localStorage.removeItem('ztic-auth');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      err.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default api;
