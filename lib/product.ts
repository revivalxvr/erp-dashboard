
import axios from 'axios';
import { authAPI } from './auth';

export const productApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

// Interceptor untuk menangani request FormData
productApi.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      // Hapus Content-Type agar browser menentukan
      // multipart/form-data beserta boundary secara otomatis.
      config.headers.delete('Content-Type');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor refresh token ketika access token expired
productApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Refresh token ditangani oleh user-service.
        await authAPI.patch('/auth/refresh-token');

        // Ulangi request produk setelah refresh berhasil.
        return productApi(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
