"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../Toast';

const signUpSchema = yup.object({
  full_name: yup.string().min(2, 'Full name must be at least 2 characters').required('Full name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type SignUpFormData = {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  onEmailVerificationRequired: (message: string, email: string) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToLogin, onEmailVerificationRequired }) => {
  const { signUp, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [specificError, setSpecificError] = useState<string | null>(null);
  const [showEmailExistsError, setShowEmailExistsError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorHandled, setErrorHandled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema) as any,
  });

  // Handle error state changes from AuthContext
  useEffect(() => {
    console.log('useEffect - error changed to:', error);
    console.log('useEffect - errorHandled:', errorHandled);
    console.log('useEffect - isSubmitting:', isSubmitting);
    
    if (error && !errorHandled && !isSubmitting) {
      console.log('Processing error in useEffect:', error);
      
      const parsedError = parseErrorMessage(error, 400);
      console.log('Parsed error in useEffect:', parsedError);
      
      setSpecificError(parsedError);
      showToastMessage(parsedError, "error");
      setErrorHandled(true);
      
      // Clear the AuthContext error after we've handled it
      clearError();
    }
  }, [error, errorHandled, isSubmitting, clearError]);

  // Component re-render logging
  useEffect(() => {
    console.log('🔄 SignUpForm component re-rendered');
  });

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    console.log('showToastMessage called with:', { message, type });
    console.log('About to set toastMessage:', message);
    setToastMessage(() => {
      console.log('Setting toastMessage to:', message);
      return message;
    });
    console.log('About to set toastType:', type);
    setToastType(() => {
      console.log('Setting toastType to:', type);
      return type;
    });
    console.log('About to set showToast:', true);
    setShowToast(() => {
      console.log('Setting showToast to: true');
      return true;
    });
    console.log('showToastMessage finished');
  };

  const handleInputChange = () => {
    console.log('handleInputChange called');
    if (specificError) {
      console.log('Clearing specificError');
      setSpecificError(null);
    }
    if (showEmailExistsError) {
      console.log('Clearing showEmailExistsError');
      setShowEmailExistsError(false);
    }
    if (error) {
      console.log('Clearing AuthContext error');
      clearError();
    }
    // Reset error handling flag when user starts typing
    setErrorHandled(false);
  };

  const parseErrorMessage = (errorMessage: string, statusCode?: number) => {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('already registered') || message.includes('already exists')) {
      setShowEmailExistsError(() => {
        console.log('Setting showEmailExistsError to: true');
        return true;
      });
      return "This email address is already registered. Please use a different email or try signing in.";
    }
    
    if (message.includes('failed to create session')) {
      return "Registration failed. Please try again or contact support.";
    }
    
    if (statusCode && statusCode >= 500) {
      return "Server error. Please try again later.";
    }
    
    return errorMessage || "An unexpected error occurred. Please try again.";
  };

  const onSubmit = async (data: SignUpFormData) => {
    console.log('=== SIGNUP ONSUBMIT START ===');
    console.log('📝 Form data received:', data);
    console.log('📝 Current isSubmitting state:', isSubmitting);
    console.log('📝 Current loading state:', loading);
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('⚠️ Already submitting, ignoring');
      return;
    }
    
    setIsSubmitting(true);
    setErrorHandled(false); // Reset error handling flag
    
    // Clear form errors and local state
    clearErrors();
    setSpecificError(null);
    setShowEmailExistsError(false);
    
    const { confirmPassword, ...signUpData } = data;
    
    try {
      console.log('🚀 About to call signUp with data:', signUpData);
      const result = await signUp(signUpData);
      console.log('✅ Signup result received:', result);
      
      if (result.success) {
        console.log('✅ Signup successful!');
        
        // Check if there's an email verification message
        if (result.message && (result.message.toLowerCase().includes('verify') || result.message.toLowerCase().includes('verification'))) {
          console.log('📧 Email verification required, calling parent callback');
          onEmailVerificationRequired(result.message, signUpData.email);
        } else {
          console.log('🎉 Account created without verification, showing success message');
          showToastMessage("Account created successfully! Welcome to ChatNotePadAi.", "success");
        }
        
        setErrorHandled(true); // Mark as handled so useEffect doesn't process it
      } else {
        console.log('❌ Signup failed:', result.error);
        // If not successful, the useEffect will handle the error from AuthContext
      }
    } catch (error) {
      console.log('💥 Unexpected error in onSubmit:', error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setSpecificError(errorMessage);
      showToastMessage(errorMessage, "error");
      setErrorHandled(true); // Mark as handled
    }
    
    setIsSubmitting(false);
    console.log('=== SIGNUP ONSUBMIT END ===');
  };

  console.log('RENDER - specificError:', specificError);
  console.log('RENDER - showToast:', showToast);
  console.log('RENDER - toastMessage:', toastMessage);
  console.log('RENDER - AuthContext error:', error);
  console.log('RENDER - AuthContext loading:', loading);
  
  return (
    <div className="relative">
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Sign Up
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
                  {showEmailExistsError && (
                    <button
                      onClick={onSwitchToLogin}
                      className="mt-2 text-sm font-medium text-white hover:text-gray-200 underline"
                    >
                      Sign In Instead
                    </button>
                  )}
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
            console.log('🔄 Form submit event prevented');
            handleSubmit(onSubmit)(e);
          }} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                {...register('full_name')}
                type="text"
                id="full_name"
                onChange={(e) => {
                  register('full_name').onChange(e);
                  handleInputChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

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
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 8 characters and contain:
                <ul className="list-disc list-inside mt-1">
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Sign Up'
              )}
            </button>
            
            {(loading || isSubmitting) && (
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please wait while we create your account...
                </p>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};