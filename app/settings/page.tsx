"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { UserProfileDropdown } from '../components/auth/UserProfileDropdown';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Toast } from '../components/Toast';

export default function SettingsPage() {
  const { user, preferences, updatePreferences, loading, deleteAccount } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Current theme state for display
  const getCurrentTheme = () => {
    if (preferences?.theme) {
      return preferences.theme;
    }
    // Fallback based on current mode
    return isDarkMode ? 'dark' : 'light';
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      
      // Update global theme context immediately
      if (theme === 'light' && isDarkMode) {
        toggleTheme();
      } else if (theme === 'dark' && !isDarkMode) {
        toggleTheme();
      } else if (theme === 'system') {
        // For system, detect and apply system preference
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemDark !== isDarkMode) {
          toggleTheme();
        }
      }
      
      // Update backend preferences
      await updatePreferences({ ...preferences, theme });
      setSaveMessage('Theme updated successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to update theme');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (language: string) => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      await updatePreferences({ ...preferences, language });
      setSaveMessage('Language updated successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to update language');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSaveToggle = async () => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      await updatePreferences({ ...preferences, auto_save: !preferences.auto_save });
      setSaveMessage('Auto-save setting updated');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to update auto-save setting');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleFontSizeChange = async (fontSize: number) => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      await updatePreferences({ ...preferences, font_size: fontSize });
      setSaveMessage('Font size updated');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to update font size');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLineHeightChange = async (lineHeight: number) => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      await updatePreferences({ ...preferences, line_height: lineHeight });
      setSaveMessage('Line height updated');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to update line height');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      
      // Close modal first
      setShowDeleteModal(false);
      
      // Show success message
      showToastMessage('✅ Account deleted successfully! You have been logged out.', 'success');
      
      // Redirect to auth page after showing the message
      setTimeout(() => {
        router.push('/auth?deleted=true');
      }, 3000);
    } catch (error: any) {
      showToastMessage(error.response?.data?.message || 'Failed to delete account. Please try again.', 'error');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <ProtectedRoute>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Are you absolutely sure?"
        message="This action cannot be undone. This will permanently delete your account, preferences, and all associated data."
        confirmButtonText="I understand, delete my account"
        isLoading={isDeleting}
        requiresTextConfirmation={true}
        requiredText="DELETE"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">
        <header className="w-full py-6 px-4 bg-white/80 dark:bg-gray-900/80 shadow-md">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>
            <UserProfileDropdown />
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-8 px-4">
          {saveMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {saveMessage}
            </div>
          )}

          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{user?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <div className="flex space-x-4">
                    {['light', 'dark', 'system'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handleThemeChange(theme as 'light' | 'dark' | 'system')}
                        disabled={saving}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          getCurrentTheme() === theme
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size: {preferences?.font_size || 14}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={preferences?.font_size || 14}
                    onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                    disabled={saving}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Line Height: {preferences?.line_height || 1.5}
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={preferences?.line_height || 1.5}
                    onChange={(e) => handleLineHeightChange(parseFloat(e.target.value))}
                    disabled={saving}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Editor Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Editor</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={preferences?.language || 'en'}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-save
                  </label>
                  <button
                    onClick={handleAutoSaveToggle}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences?.auto_save
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences?.auto_save ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Danger Zone</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-md p-4">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    Once you delete your account, there is no going back. This action cannot be undone.
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3 mb-4">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">This will permanently delete:</h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <li>• Your account and profile information</li>
                      <li>• All your preferences and settings</li>
                      <li>• Your command history and saved data</li>
                      <li>• All associated data and files</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isDeleting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}