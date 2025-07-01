// src/api/axios.js

import axios from 'axios';
import { store } from '../store/store';
import { refreshAccessToken, resetAuthState } from '../store/slices/authSlice';

const BASE_URL = '/'; // Your Vite proxy handles the full URL

// --- 1. The Public Instance ---
// For any request that does NOT need authentication.
export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});


// --- 2. The Private Instance ---
// For all requests that DO need authentication.
export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // This is essential for sending cookies
});


// --- Interceptor Logic (now attached ONLY to the private instance) ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshUrl = '/api/v1/user/refresh-access-token';

    // Only handle 401 errors, and exclude the refresh token endpoint itself
    if (error.response?.status === 401 && originalRequest.url !== refreshUrl) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosPrivate(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await store.dispatch(refreshAccessToken()).unwrap();
        processQueue(null, null);
        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(resetAuthState());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);