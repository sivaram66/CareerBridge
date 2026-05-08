import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
});

// TODO: Attach JWT tokens via interceptor once auth flow is wired up
apiClient.interceptors.request.use((config) => {
    return config;
});

export default apiClient;