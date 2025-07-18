"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function getParamFromHashOrSearch(param: string) {
  // 1. Query string
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get(param)) return searchParams.get(param);

  // 2. Hash fragment
  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    return hashParams.get(param);
  }
  return null;
}

export const EmailConfirmationRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    console.log('[EmailConfirmationRedirect] Checking URL:', window.location.href);
    
    // First check sessionStorage for existing token (prioritize this)
    const tokenFromStorage = sessionStorage.getItem('emailConfirmationToken');
    console.log('[EmailConfirmationRedirect] Token from sessionStorage:', tokenFromStorage ? tokenFromStorage.substring(0, 20) + '...' : 'null');
    
    // Check for email confirmation token in URL
    const tokenFromUrl = getParamFromHashOrSearch('access_token') || getParamFromHashOrSearch('token') || getParamFromHashOrSearch('token_hash');
    const type = getParamFromHashOrSearch('type');
    
    // Check for error parameters
    const error = getParamFromHashOrSearch('error');
    const errorCode = getParamFromHashOrSearch('error_code');
    const errorDescription = getParamFromHashOrSearch('error_description');
    
    console.log('[EmailConfirmationRedirect] Found token from URL:', tokenFromUrl?.substring(0, 20) + '...', 'type:', type);
    
    // Handle errors first
    if (error || errorCode) {
      console.log('[EmailConfirmationRedirect] Error found:', error, errorCode, errorDescription);
      
      let errorMessage = 'Email confirmation link is invalid or has expired.';
      if (errorCode === 'otp_expired') {
        errorMessage = 'Email confirmation link has expired. Please request a new one.';
      } else if (error === 'access_denied') {
        errorMessage = 'Email confirmation link is invalid. Please request a new one.';
      }
      
      // Show error and redirect to auth page
      alert(errorMessage);
      router.push('/auth');
      return;
    }
    
    // Check if we have a valid token from either source
    const finalToken = tokenFromStorage || tokenFromUrl;
    
    if (finalToken && (tokenFromStorage || type === 'signup')) {
      console.log('[EmailConfirmationRedirect] Valid email confirmation token found');
      console.log('[EmailConfirmationRedirect] Token source:', tokenFromStorage ? 'sessionStorage' : 'URL');
      console.log('[EmailConfirmationRedirect] Token length:', finalToken.length);
      
      // If token came from URL, store it in sessionStorage with error handling
      if (tokenFromUrl && !tokenFromStorage) {
        try {
          sessionStorage.setItem('emailConfirmationToken', tokenFromUrl);
          console.log('[EmailConfirmationRedirect] Token stored in sessionStorage');
          
          // Verify token was stored successfully
          const storedToken = sessionStorage.getItem('emailConfirmationToken');
          if (!storedToken) {
            console.warn('[EmailConfirmationRedirect] sessionStorage failed, trying localStorage');
            localStorage.setItem('emailConfirmationToken', tokenFromUrl);
          }
        } catch (error) {
          console.error('[EmailConfirmationRedirect] sessionStorage failed:', error);
          console.log('[EmailConfirmationRedirect] Falling back to localStorage');
          try {
            localStorage.setItem('emailConfirmationToken', tokenFromUrl);
          } catch (localStorageError) {
            console.error('[EmailConfirmationRedirect] localStorage also failed:', localStorageError);
          }
        }
      }
      
      // Clean URL without reloading
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('token');
      currentUrl.searchParams.delete('token_hash');
      currentUrl.searchParams.delete('type');
      currentUrl.searchParams.delete('redirect_to');
      currentUrl.hash = '';
      window.history.replaceState({}, document.title, currentUrl.pathname);
      
      // Add small delay to ensure token is stored before redirect
      setTimeout(() => {
        console.log('[EmailConfirmationRedirect] About to redirect to /auth/confirm-email');
        router.push('/auth/confirm-email');
        console.log('[EmailConfirmationRedirect] router.push called');
      }, 50);
    } else {
      // Only log "no token found" if we're actually on the root page and both sources are empty
      if (window.location.pathname === '/' && !tokenFromStorage && !tokenFromUrl) {
        console.log('[EmailConfirmationRedirect] No email confirmation token found in URL or sessionStorage');
      }
    }
  }, [router]);

  return null;
};