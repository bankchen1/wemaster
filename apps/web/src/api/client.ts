import axios from 'axios';
import { ApiResponse } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          window.location.href = '/auth/login';
          break;
        case 403:
          // Handle forbidden
          break;
        case 404:
          // Handle not found
          break;
        case 500:
          // Handle server error
          break;
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

// Generic request function
const request = async <T>(config: any): Promise<ApiResponse<T>> => {
  try {
    const response = await api(config);
    return response as ApiResponse<T>;
  } catch (error) {
    throw error;
  }
};

export { api, request };
