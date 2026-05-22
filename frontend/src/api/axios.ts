import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

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
    // 401 = unauthenticated, 403 = old middleware behavior for expired token
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      sessionStorage.setItem('auth_redirect_msg', 'Your session has expired. Please sign in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;