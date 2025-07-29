import axios, { AxiosError } from 'axios';
import { AuthAPI } from './auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = AuthAPI.getToken();
  
  // Debug logging
  console.log('🔍 API Request:', config.url);
  console.log('🔑 Token exists:', !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('⚠️ No authentication token found for request:', config.url);
  }
  
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 429) {
      const errorData = error.response.data as any;
      throw new RateLimitError(errorData.detail);
    }

    if (error.response?.status === 401) {
      console.error('🚨 Authentication failed - clearing token');
      
      // Don't redirect for certain API endpoints that should work in guest mode
      const url = error.config?.url || '';
      const noRedirectEndpoints = ['/api/v1/ai/translate', '/api/v1/ai/detect-language'];
      const shouldRedirect = !noRedirectEndpoints.some(endpoint => url.includes(endpoint));
      
      // Clear auth token and redirect if needed
      if (shouldRedirect) {
        AuthAPI.signOut();
        // Only redirect if not already on auth page and if we're in browser
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
      }
    }

    throw error;
  }
);

export class RateLimitError extends Error {
  public resetTime: string;
  public remaining: number;

  constructor(details: any) {
    super(details.message || 'Rate limit exceeded');
    this.resetTime = details.reset_time;
    this.remaining = details.remaining;
  }
}

export default apiClient;