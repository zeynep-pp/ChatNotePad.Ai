import axios from 'axios';
import { AuthAPI } from './auth';

export const setupAxiosInterceptors = () => {
  // Set base URL for all axios requests
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  axios.defaults.baseURL = baseURL;
  console.log('🌐 Axios Base URL set to:', baseURL);
  
  axios.interceptors.request.use(
    (config) => {
      const token = AuthAPI.getToken();
      console.log('🔑 Axios Request - Token:', token ? 'Present' : 'Missing', 'URL:', config.url);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          await AuthAPI.refreshToken();
          const token = AuthAPI.getToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axios(originalRequest);
        } catch (refreshError) {
          console.log('🔥 Refresh token failed, signing out user');
          AuthAPI.signOut();
          if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
            console.log('🔥 Redirecting to /auth from', window.location.pathname);
            window.location.href = '/auth';
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};