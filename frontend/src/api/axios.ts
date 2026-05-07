import axios from 'axios';

// Vite uses import.meta.env instead of process.env
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Optional: Add timeout so your frontend doesn't hang forever if the backend is down
  timeout: 30000, 
});

// We can add interceptors here later if we need to attach JWT tokens for user login
apiClient.interceptors.request.use((config) => {
    // Example: const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default apiClient;