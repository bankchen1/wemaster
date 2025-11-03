import axios from 'axios';

// Create an axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject tenantId and auth token
instance.interceptors.request.use(
  (config) => {
    // Get tenantId from app store
    const tenantId = localStorage.getItem('tenantId'); // In a real implementation, get from Pinia store
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }

    // Get auth token from user store
    const token = localStorage.getItem('authToken'); // In a real implementation, get from Pinia store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Redirect to login page
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Show permission error
      console.error('Permission denied');
    } else if (error.response?.status === 404) {
      // Handle not found
      console.error('Resource not found');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }

    return Promise.reject(error);
  }
);

export default instance;