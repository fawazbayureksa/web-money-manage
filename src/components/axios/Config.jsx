import './ProgressBar.css';
/* eslint-disable react-refresh/only-export-components */
import axios from 'axios';

const Config = (customHeaders = {}, params = null) => {
  return {
    headers: {
      'Content-Type': 'application/json', // default for JSON requests
      Accept: 'application/json',
      ...customHeaders,
    },
    ...(params && { params }),
  };
};

// Create axios instance with interceptors
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
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

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleLogout();
    }
    return Promise.reject(error);
  }
);

// Logout handler
export const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const ErrorHandler = (error) => {
  if (error.response) {
    if (error.response.status === 401) {
      handleLogout();
    }
  }
};

export default Config;