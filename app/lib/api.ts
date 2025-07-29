import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthAPI } from './auth';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1`) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to force HTTP for localhost and include auth token
    this.client.interceptors.request.use(
      (config) => {
        // Force HTTP protocol for localhost URLs
        if (config.url && config.url.includes('localhost')) {
          config.url = config.url.replace(/^https:\/\//, 'http://');
        }
        if (config.baseURL && config.baseURL.includes('localhost')) {
          config.baseURL = config.baseURL.replace(/^https:\/\//, 'http://');
        }

        // Debug logging for URL issues
        console.log('API Request URL:', (config.baseURL || '') + config.url);

        if (AuthAPI.isAuthenticated()) {
          const token = AuthAPI.getToken();
          console.log('🔑 API Client Token exists:', !!token);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } else {
          console.log('⚠️ API Client: User not authenticated');
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          AuthAPI.signOut();
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;