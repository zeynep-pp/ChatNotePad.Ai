"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, AuthState, LoginCredentials, SignUpCredentials, UserPreferences } from '../types/auth';
import { AuthAPI } from '../lib/auth';
import { setupAxiosInterceptors } from '../lib/authInterceptor';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    preferences: null,
    errorType: undefined,
    unverifiedEmail: undefined,
  });

  useEffect(() => {
    console.log('🔥 AuthContext useEffect - setting up interceptors and checking auth');
    setupAxiosInterceptors();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔥 AuthContext checkAuth START');
    
    // Check if we're on the auth pages - if so, don't make API calls
    if (typeof window !== 'undefined' && (window.location.pathname === '/auth' || window.location.pathname.startsWith('/auth/'))) {
      console.log('🔥 On auth page, skipping API calls');
      setState(prev => ({
        ...prev,
        loading: false,
        isAuthenticated: false,
      }));
      return;
    }
    
    try {
      const isAuth = AuthAPI.isAuthenticated();
      console.log('🔥 AuthAPI.isAuthenticated():', isAuth);
      
      if (isAuth) {
        console.log('🔥 User is authenticated, getting user data...');
        const user = await AuthAPI.getCurrentUser();
        const preferences = await AuthAPI.getUserPreferences();
        console.log('🔥 User data retrieved:', user);
        setState(prev => ({
          ...prev,
          user,
          preferences,
          isAuthenticated: true,
          loading: false,
        }));
      } else {
        console.log('🔥 User is NOT authenticated, setting loading to false');
        setState(prev => ({
          ...prev,
          loading: false,
        }));
      }
    } catch (error) {
      console.log('🔥 checkAuth ERROR:', error);
      AuthAPI.signOut();
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to authenticate',
      }));
    }
    console.log('🔥 AuthContext checkAuth END');
  };

  const signIn = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const user = await AuthAPI.signIn(credentials);
      const preferences = await AuthAPI.getUserPreferences();
      setState(prev => ({
        ...prev,
        user,
        preferences,
        isAuthenticated: true,
        loading: false,
      }));
    } catch (error: any) {
      console.log('AuthContext signIn error:', error);
      
      let errorMessage = 'Login failed';
      let errorType = 'general';
      
      if (error.response?.data?.error === 'email_not_verified') {
        errorMessage = error.response.data.message || 'Please verify your email before signing in.';
        errorType = 'email_not_verified';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        errorType: errorType,
        unverifiedEmail: error.response?.data?.email || credentials.email,
      }));
      // Don't throw the error - let the form handle it via state
      // throw error;
    }
  };

  const signUp = async (credentials: SignUpCredentials): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      console.log('🔄 AuthContext signUp: START - credentials:', credentials);
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log('🔄 AuthContext signUp: calling AuthAPI.signUp');
      const response = await AuthAPI.signUp(credentials);
      console.log('🔄 AuthContext signUp: AuthAPI response:', response);
      
      // The signUp method returns UserProfile directly
      const user = response;
      
      // Check if user has email_verified field or if we need to verify email
      const needsVerification = user.email_verified === false;
      
      if (needsVerification) {
        console.log('AuthContext signUp: user needs email verification');
        setState(prev => ({
          ...prev,
          loading: false,
          isAuthenticated: false, // Don't authenticate until email is verified
          error: null,
        }));
        
        return { 
          success: true, 
          message: "Please check your email and click the verification link to complete your signup." 
        };
      } else {
        // User is verified, proceed with normal authentication
        const preferences = await AuthAPI.getUserPreferences();
        console.log('AuthContext signUp: success, setting user and preferences');
        setState(prev => ({
          ...prev,
          user,
          preferences,
          isAuthenticated: true,
          loading: false,
        }));
        
        return { success: true };
      }
    } catch (error: any) {
      console.log('AuthContext signUp error:', error);
      console.log('Error response:', error.response);
      
      let errorMessage = 'Sign up failed';
      let needsVerification = false;
      
      // Check if error is about email verification
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (errorMessage.toLowerCase().includes('confirm') || errorMessage.toLowerCase().includes('verify')) {
          needsVerification = true;
        }
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
        if (errorMessage.toLowerCase().includes('confirm') || errorMessage.toLowerCase().includes('verify')) {
          needsVerification = true;
        }
      } else if (error.message) {
        errorMessage = error.message;
        if (errorMessage.toLowerCase().includes('confirm') || errorMessage.toLowerCase().includes('verify')) {
          needsVerification = true;
        }
      }
      
      if (needsVerification) {
        console.log('AuthContext signUp: signup successful but needs verification');
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
        }));
        
        return { 
          success: true, 
          message: errorMessage 
        };
      }
      
      console.log('AuthContext signUp: setting loading to false and error to:', errorMessage);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  const signOut = () => {
    AuthAPI.signOut();
    setState({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      preferences: null,
      errorType: undefined,
      unverifiedEmail: undefined,
    });
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const updatedPreferences = await AuthAPI.updateUserPreferences(preferences);
      setState(prev => ({
        ...prev,
        preferences: updatedPreferences,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to update preferences',
      }));
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      await AuthAPI.refreshToken();
    } catch (error: any) {
      signOut();
      setState(prev => ({
        ...prev,
        error: 'Session expired. Please login again.',
      }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null, errorType: undefined, unverifiedEmail: undefined }));
  };

  const deleteAccount = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await AuthAPI.deleteAccount();
      
      // Clear all local storage
      localStorage.clear();
      
      // Reset state
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        preferences: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to delete account',
      }));
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      await AuthAPI.resendVerificationEmail(email);
    } catch (error: any) {
      console.log('Failed to resend verification email:', error);
      throw error;
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updatePreferences,
    refreshToken,
    clearError,
    deleteAccount,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};