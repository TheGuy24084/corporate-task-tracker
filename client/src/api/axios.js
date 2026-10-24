import axios from 'axios';

// Create Axios instance with base URL configured for the backend API
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios request interceptor to automatically attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Normalize url if it begins with /api/ to prevent /api/api/...
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api };
export default api;
