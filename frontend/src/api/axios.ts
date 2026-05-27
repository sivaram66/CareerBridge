import axios from 'axios';

const FALLBACK_API_URL = import.meta.env.PROD
  ? 'https://careerbridge-api-9fyh.onrender.com/api'
  : 'http://localhost:5000/api';

const normalizeApiUrl = (url: string) => {
  const trimmedUrl = url.replace(/\/+$/, '');
  return trimmedUrl.endsWith('/api') ? trimmedUrl : `${trimmedUrl}/api`;
};

const BASE_URL = normalizeApiUrl(import.meta.env.VITE_BACKEND_URL || FALLBACK_API_URL);
export const BACKEND_ROOT_URL = BASE_URL.replace(/\/api$/, '');

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach JWT token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global auth error handler — clear stale token and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = requestUrl.startsWith('/auth/');

    // 401 = unauthenticated, 403 = old middleware behavior for expired token
    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      localStorage.removeItem('token');
      sessionStorage.setItem('auth_redirect_msg', 'Your session has expired. Please sign in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
