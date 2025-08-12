// src/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Create a new instance of axios with a base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// This is an "interceptor" that runs before each request is sent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // If a token exists, add it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// You can also add an interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If an API call fails with a 401 Unauthorized error,
    // it often means the token is expired, so we redirect to login.
    if (error.response && error.response.status === 401) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem('token');
      // This will force a refresh and the ProtectedRoute will redirect to /login
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;