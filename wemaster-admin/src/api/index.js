/**
 * 统一的 API 客户端
 * 整合生成的 SDK 和自定义拦截器
 */

import axios from 'axios';
import { getAuth } from './core-sdk/auth/auth';
import { getOfferings } from './core-sdk/offerings/offerings';
import { getOrders } from './core-sdk/orders/orders';
import { getPayments } from './core-sdk/payments/payments';

// Create an axios instance
const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject tenantId and auth token
apiInstance.interceptors.request.use(
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
apiInstance.interceptors.response.use(
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

// Create API client with the configured axios instance
const createApiClient = (apiGetter: any) => {
  return apiGetter(apiInstance);
};

// Generated API clients
export const authApi = createApiClient(getAuth);
export const offeringsApi = createApiClient(getOfferings);
export const ordersApi = createApiClient(getOrders);
export const paymentsApi = createApiClient(getPayments);

// Export the axios instance for custom requests
export default apiInstance;