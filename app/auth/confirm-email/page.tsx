"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

function ConfirmEmailContent() {
  console.log('🚀 ConfirmEmailContent - Component rendering');
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearError } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    console.log('🚀 CONFIRM EMAIL PAGE - Component mounted and useEffect triggered');
    
    // Debug: Log current URL and all parameters
    console.log('🔍 CONFIRM EMAIL PAGE - Current URL:', window.location.href);
    console.log('🔍 CONFIRM EMAIL PAGE - Search params:', window.location.search);
    console.log('🔍 CONFIRM EMAIL PAGE - All URL params:', Object.fromEntries(searchParams.entries()));
    
    // Add a small delay to allow EmailConfirmationRedirect to populate sessionStorage
    const checkForToken = () => {
      // First try to get token from sessionStorage (prioritize this)
      let tokenFromStorage = null;
      try {
        tokenFromStorage = sessionStorage.getItem('emailConfirmationToken');
      } catch (error) {
        console.warn('🔍 CONFIRM EMAIL PAGE - sessionStorage access failed:', error);
      }
      
      // Fallback to localStorage if sessionStorage fails
      let tokenFromLocalStorage = null;
      if (!tokenFromStorage) {
        try {
          tokenFromLocalStorage = localStorage.getItem('emailConfirmationToken');
        } catch (error) {
          console.warn('🔍 CONFIRM EMAIL PAGE - localStorage access failed:', error);
        }
      }
      
      console.log('🔍 CONFIRM EMAIL PAGE - Token from sessionStorage:', tokenFromStorage ? tokenFromStorage.substring(0, 20) + '...' : 'null');
      console.log('🔍 CONFIRM EMAIL PAGE - Token from localStorage:', tokenFromLocalStorage ? tokenFromLocalStorage.substring(0, 20) + '...' : 'null');
      
      // Fallback to URL params (for backwards compatibility)
      const tokenFromUrl = searchParams.get('token');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      console.log('🔍 CONFIRM EMAIL PAGE - Token from URL:', tokenFromUrl ? tokenFromUrl.substring(0, 20) + '...' : 'null');
      console.log('🔍 CONFIRM EMAIL PAGE - Error param:', errorParam);
      console.log('🔍 CONFIRM EMAIL PAGE - Error description:', errorDescription);
      
      if (errorParam) {
        console.log('❌ Error detected in URL parameters');
        setError(errorDescription || errorParam || 'Unknown error occurred');
        setIsLoading(false);
        return;
      }
      
      const finalToken = tokenFromStorage || tokenFromLocalStorage || tokenFromUrl;
      
      if (finalToken) {
        console.log('🔑 Email confirmation token found:', finalToken.substring(0, 20) + '...');
        console.log('🔑 Token length:', finalToken.length);
        console.log('🔑 Token source:', tokenFromStorage ? 'sessionStorage' : tokenFromLocalStorage ? 'localStorage' : 'URL');
        
        // Basic token validation
        if (finalToken.length < 20) {
          console.log('❌ Token appears to be too short');
          setError('Invalid email confirmation token. Please request a new confirmation email.');
          setIsLoading(false);
          return;
        }
        
        setToken(finalToken);
        
        // Clear stored tokens after using them
        try {
          if (tokenFromStorage) {
            sessionStorage.removeItem('emailConfirmationToken');
            console.log('🔑 Token removed from sessionStorage');
          }
          if (tokenFromLocalStorage) {
            localStorage.removeItem('emailConfirmationToken');
            console.log('🔑 Token removed from localStorage');
          }
        } catch (error) {
          console.warn('🔍 CONFIRM EMAIL PAGE - Failed to clear stored tokens:', error);
        }
        
        // Clean URL without reloading to remove token from address bar
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('token');
        currentUrl.searchParams.delete('error');
        currentUrl.searchParams.delete('error_description');
        window.history.replaceState({}, document.title, currentUrl.pathname);
        console.log('🔑 URL cleaned, token stored in component state');
        
        // Auto-confirm the email
        confirmEmail(finalToken);
      } else {
        console.log('🔍 CONFIRM EMAIL PAGE - No token found in URL, sessionStorage, or localStorage');
        setError('The email confirmation link is invalid or has expired. Please request a new confirmation email.');
        setIsLoading(false);
      }
    };
    
    // Give a small delay to allow EmailConfirmationRedirect to populate sessionStorage
    setTimeout(checkForToken, 100);
  }, [searchParams]);

  const confirmEmail = async (confirmationToken: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call your backend API to confirm the email
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/confirm-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: confirmationToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Email confirmed successfully! You can now sign in to your account.');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to confirm email. Please try again.');
      }
    } catch (error) {
      console.error('Email confirmation error:', error);
      setError('An error occurred while confirming your email. Please try again.');
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isProcessing ? 'Confirming your email...' : 'Verifying email confirmation token...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 shadow-lg"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ChatNotePadAi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered note editing and transformation
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            {success ? (
              <>
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Confirmed!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {success}
                </p>
                <button
                  onClick={() => router.push('/auth')}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Continue to Sign In
                </button>
              </>
            ) : error ? (
              <>
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.186-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Confirmation Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error}
                </p>
                <button
                  onClick={() => router.push('/auth')}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Back to Login
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Confirming Your Email
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Please wait while we confirm your email address...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  console.log('🚀 ConfirmEmailPage - Component rendering');
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}