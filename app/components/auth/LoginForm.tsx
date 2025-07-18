"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth';
import { Toast } from '../Toast';
import { EmailVerificationModal } from './EmailVerificationModal';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignUp, onForgotPassword }) => {
  const { signIn, loading, error, clearError, errorType, unverifiedEmail, resendVerificationEmail } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [specificError, setSpecificError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorHandled, setErrorHandled] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
  });

  // Handle error state changes from AuthContext
  useEffect(() => {
    console.log('🔵 LoginForm useEffect - error:', error);
    console.log('🔵 LoginForm useEffect - errorType:', errorType);
    console.log('🔵 LoginForm useEffect - errorHandled:', errorHandled);
    console.log('🔵 LoginForm useEffect - isSubmitting:', isSubmitting);
    
    if (error && !errorHandled && !isSubmitting) {
      console.log('🔴 Processing login error in useEffect:', error);
      
      if (errorType === 'email_not_verified') {
        // Show email verification modal
        setVerificationMessage(error);
        setUserEmail(unverifiedEmail || '');
        setShowEmailVerificationModal(true);
      } else {
        // Show regular error message
        setSpecificError(error);
        showToastMessage(error, "error");
      }
      
      setErrorHandled(true);
      
      // Clear the AuthContext error after we've handled it
      clearError();
    }
  }, [error, errorType, unverifiedEmail, errorHandled, isSubmitting, clearError]);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    console.log('Login showToastMessage called with:', { message, type });
    console.log('Before setting toast state - showToast:', showToast, 'toastMessage:', toastMessage);
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    console.log('After setting toast state - should be true');
    
    // Check if state actually changed
    setTimeout(() => {
      console.log('Toast state check - showToast:', showToast, 'toastMessage:', toastMessage);
    }, 100);
  };


  const handleInputChange = () => {
    console.log('Login handleInputChange called');
    if (specificError) {
      console.log('Clearing login specificError');
      setSpecificError(null);
    }
    if (error) {
      console.log('Clearing login AuthContext error');
      clearError();
    }
    // Reset error handling flag when user starts typing
    setErrorHandled(false);
  };

  const onSubmit = async (data: LoginCredentials) => {
    console.log('🚀 === LOGIN ONSUBMIT START ===');
    console.log('🚀 Data:', data);
    
    // Prevent any form submission behavior
    if (isSubmitting) {
      console.log('⚠️ Already submitting, ignoring');
      return;
    }
    
    setIsSubmitting(true);
    setErrorHandled(false); // Reset error handling flag
    
    // Clear form errors and local state
    clearErrors();
    setSpecificError(null);
    
    // Store email for potential email verification modal
    setUserEmail(data.email);
    
    try {
      console.log('🔄 Calling signIn...');
      await signIn(data);
      console.log('✅ signIn completed - Login successful!');
      showToastMessage("Login successful! Welcome back.", "success");
      setErrorHandled(true); // Mark as handled so useEffect doesn't process it
    } catch (error) {
      console.log('❌ Login failed in try-catch:', error);
      // Don't do anything here - let the useEffect handle the error
      // This prevents any potential page refresh or navigation
    }
    
    setIsSubmitting(false);
    console.log('🏁 === LOGIN ONSUBMIT END ===');
  };

  console.log('🔄 LoginForm RENDER - isSubmitting:', isSubmitting, 'loading:', loading, 'error:', error);
  
  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        message={verificationMessage}
        email={userEmail}
        onResendEmail={() => resendVerificationEmail(userEmail)}
      />
      
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Sign In
          </h2>

          {specificError && (
            <div className="mb-4 p-4 bg-red-600 border border-red-700 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-white font-medium">{specificError}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSpecificError(null)}
                    className="inline-flex rounded-md bg-red-700 p-1.5 text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Form submit prevented');
            handleSubmit(onSubmit)(e);
          }} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                onChange={(e) => {
                  register('email').onChange(e);
                  handleInputChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  onChange={(e) => {
                    register('password').onChange(e);
                    handleInputChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="button"
              disabled={loading || isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👆 Button clicked, preventing default');
                console.log('👆 About to call handleSubmit(onSubmit)');
                handleSubmit(onSubmit)();
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={onForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};