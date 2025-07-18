import axios from 'axios';
import Cookies from 'js-cookie';
import { UserProfile, LoginCredentials, SignUpCredentials, UserPreferences, AuthResponse } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class AuthAPI {
  private static getAuthHeaders() {
    const token = Cookies.get('auth_token');
    return token ? { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }

  static async signUp(credentials: SignUpCredentials): Promise<UserProfile> {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
      ...credentials,
      redirect_to: `${window.location.origin}/`
    }, {
      headers: this.getAuthHeaders()
    });
    
    const authResponse: AuthResponse = response.data;
    
    if (authResponse.token && authResponse.token.access_token) {
      Cookies.set('auth_token', authResponse.token.access_token, { expires: 7 });
    }
    
    return authResponse.user;
  }

  static async signIn(credentials: LoginCredentials): Promise<UserProfile> {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, credentials, {
      headers: this.getAuthHeaders()
    });
    
    const authResponse: AuthResponse = response.data;
    
    if (authResponse.token && authResponse.token.access_token) {
      Cookies.set('auth_token', authResponse.token.access_token, { expires: 7 });
    }
    
    return authResponse.user;
  }

  static async getCurrentUser(): Promise<UserProfile> {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    });
    
    return response.data.user;
  }

  static async getUserPreferences(): Promise<UserPreferences> {
    const response = await axios.get(`${API_BASE_URL}/auth/preferences`, {
      headers: this.getAuthHeaders()
    });
    
    return response.data.preferences;
  }

  static async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await axios.put(`${API_BASE_URL}/auth/preferences`, preferences, {
      headers: this.getAuthHeaders()
    });
    
    return response.data.preferences;
  }

  static async refreshToken(): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
      headers: this.getAuthHeaders()
    });
    
    const authResponse: AuthResponse = response.data;
    
    if (authResponse.token && authResponse.token.access_token) {
      Cookies.set('auth_token', authResponse.token.access_token, { expires: 7 });
      return authResponse.token.access_token;
    }
    
    throw new Error('No token received from refresh');
  }

  static signOut(): void {
    Cookies.remove('auth_token');
  }

  static getToken(): string | undefined {
    return Cookies.get('auth_token');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static async deleteAccount(): Promise<void> {
    await axios.delete(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    });
    
    // Clear all local data after successful deletion
    this.signOut();
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/auth/resend-verification`, { email }, {
      headers: this.getAuthHeaders()
    });
  }

  static async resetPassword(email: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { 
      email,
      redirect_to: `${window.location.origin}/`
    }, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  static async updatePassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/auth/update-password`, { 
      token, 
      new_password: newPassword 
    }, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }
}