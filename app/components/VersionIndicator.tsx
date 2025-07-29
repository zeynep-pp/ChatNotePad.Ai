"use client";

import { useState, useEffect } from 'react';

interface VersionIndicatorProps {
  currentVersion: number;
  totalVersions: number;
  hasUnsavedChanges: boolean;
  autoSaveEnabled?: boolean;
  lastAutoSave?: Date | null;
  onVersionTimelineClick?: () => void;
  className?: string;
}

export default function VersionIndicator({
  currentVersion,
  totalVersions,
  hasUnsavedChanges,
  autoSaveEnabled = false,
  lastAutoSave = null,
  onVersionTimelineClick,
  className = ""
}: VersionIndicatorProps) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (hasUnsavedChanges) {
      setAutoSaveStatus('idle');
    }
  }, [hasUnsavedChanges]);

  const handleAutoSave = () => {
    setAutoSaveStatus('saving');
    setTimeout(() => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 1000);
  };

  return (
    <div className={`flex items-center space-x-3 text-sm ${className}`}>
      {/* Version Info */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onVersionTimelineClick}
          className="flex items-center space-x-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          title="View version timeline"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300">
            v{totalVersions} of {totalVersions}
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

      {/* Auto-save Status */}
      <div className="flex items-center space-x-1">
        {hasUnsavedChanges ? (
          <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs">Unsaved changes</span>
          </div>
        ) : autoSaveStatus === 'saving' ? (
          <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Saving...</span>
          </div>
        ) : autoSaveStatus === 'saved' ? (
          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs">Saved</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs">
              {autoSaveEnabled && lastAutoSave 
                ? `Auto-saved ${lastAutoSave.toLocaleTimeString()}`
                : 'Up to date'
              }
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleAutoSave}
          disabled={!hasUnsavedChanges || autoSaveStatus === 'saving'}
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save current version"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </button>
      </div>
    </div>
  );
}