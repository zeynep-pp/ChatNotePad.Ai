"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';
import { EmailVerificationModal } from '../components/auth/EmailVerificationModal';

function AuthPageContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDeletedMessage, setShowDeletedMessage] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const { isAuthenticated, loading, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  console.log('🔥 AuthPage RENDER - isAuthenticated:', isAuthenticated, 'loading:', loading, 'isLogin:', isLogin);

  useEffect(() => {
    console.log('🔥 AuthPage useEffect - isAuthenticated:', isAuthenticated, 'loading:', loading);
    if (isAuthenticated && !loading) {
      console.log('🔥 Redirecting to / because isAuthenticated is true');
      router.push('/');
    }
  }, [isAuthenticated, router, loading]);

  useEffect(() => {
    // Debug: Log current URL and all parameters
    console.log('🔍 AUTH PAGE - Current URL:', window.location.href);
    console.log('🔍 AUTH PAGE - Search params:', window.location.search);
    console.log('🔍 AUTH PAGE - All URL params:', Object.fromEntries(searchParams.entries()));
    
    // Check if user was redirected after account deletion
    if (searchParams.get('deleted') === 'true') {
      setShowDeletedMessage(true);
      // Remove the parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('deleted');
      window.history.replaceState({}, '', url.pathname);
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setShowDeletedMessage(false);
      }, 5000);
    }
  }, [searchParams]);

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

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
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
        {showDeletedMessage && (
          <div className="mb-6 w-full max-w-md">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Account Deleted Successfully
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your account has been permanently deleted. Thank you for using ChatNotePadAi!
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setShowDeletedMessage(false)}
                    className="inline-flex rounded-md bg-green-50 dark:bg-green-900/20 p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ChatNotePadAi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered note editing and transformation
          </p>
        </div>

        {showPasswordReset ? (
          <PasswordResetForm onBackToLogin={() => {
            setShowPasswordReset(false);
            setIsLogin(true);
          }} />
        ) : isLogin ? (
          <LoginForm 
            onSwitchToSignUp={() => setIsLogin(false)} 
            onForgotPassword={() => setShowPasswordReset(true)}
          />
        ) : (
          <SignUpForm 
            onSwitchToLogin={() => setIsLogin(true)}
            onEmailVerificationRequired={(message, email) => {
              console.log('📧 AuthPage: Email verification required:', message, email);
              setVerificationMessage(message);
              setUserEmail(email);
              setShowEmailVerificationModal(true);
            }}
          />
        )}
        
        {/* Guest Mode Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Don't want to sign up right now?
          </p>
          <a
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium underline transition-colors"
          >
            Continue as Guest
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Limited features available without an account
          </p>
        </div>
        
        <EmailVerificationModal
          isOpen={showEmailVerificationModal}
          onClose={() => setShowEmailVerificationModal(false)}
          message={verificationMessage}
          email={userEmail}
          onResendEmail={() => resendVerificationEmail(userEmail)}
        />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}