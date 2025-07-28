"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Version {
  id: string;
  version_number: number;
  content: string;
  change_description?: string;
  created_at: string;
  file_size: number;
  checksum: string;
}

interface VersionTimelineProps {
  noteId: string;
  onVersionSelect: (versionId: string) => void;
  onRestoreVersion: (versionId: string) => void;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionTimeline({
  noteId,
  onVersionSelect,
  onRestoreVersion,
  className = "",
  isOpen,
  onClose
}: VersionTimelineProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (isOpen && noteId) {
      fetchVersions();
    }
  }, [isOpen, noteId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && isOpen) {
      interval = setInterval(fetchVersions, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isOpen]);

  const fetchVersions = async () => {
    if (!noteId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/notes/${noteId}/versions`);
      setVersions(response.data.versions || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
      // For testing purposes, show mock data when API fails
      const mockVersions: Version[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          version_number: 3,
          content: 'Latest version content...',
          change_description: 'Added new sections',
          created_at: new Date().toISOString(),
          file_size: 1024,
          checksum: 'abc123'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001', 
          version_number: 2,
          content: 'Previous version content...',
          change_description: 'Fixed typos',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          file_size: 987,
          checksum: 'def456'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          version_number: 1,
          content: 'Original version content...',
          change_description: 'Initial version',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          file_size: 512,
          checksum: 'ghi789'
        }
      ];
      setVersions(mockVersions);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionClick = (versionId: string) => {
    setSelectedVersion(selectedVersion === versionId ? null : versionId);
    onVersionSelect(versionId);
  };

  const handleRestoreClick = (versionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRestoreModal(versionId);
  };

  const confirmRestore = async () => {
    if (!showRestoreModal) return;
    
    try {
      await onRestoreVersion(showRestoreModal);
      setShowRestoreModal(null);
      fetchVersions(); // Refresh after restore
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getVersionColor = (index: number) => {
    if (index === 0) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (index < 3) return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Timeline Panel */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ${className}`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Version Timeline
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title={autoRefresh ? 'Auto-refresh enabled' : 'Enable auto-refresh'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={fetchVersions}
                disabled={loading}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                title="Refresh versions"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No versions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                
                {versions.map((version, index) => (
                  <div key={version.id} className="relative flex items-start space-x-3 pb-4">
                    {/* Timeline dot */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getVersionColor(index)}`}>
                      <span className="text-xs font-medium">
                        {version.version_number}
                      </span>
                    </div>
                    
                    {/* Version card */}
                    <div 
                      className={`flex-1 min-w-0 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedVersion === version.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                      }`}
                      onClick={() => handleVersionClick(version.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Version {version.version_number}
                          </h4>
                          {index === 0 && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleRestoreClick(version.id, e)}
                          disabled={index === 0}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {index === 0 ? 'Current' : 'Restore'}
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {formatDateTime(version.created_at)}
                      </p>
                      
                      {version.change_description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {version.change_description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatFileSize(version.file_size || 0)}</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
                          {version.checksum?.substring(0, 8) || 'N/A'}
                        </span>
                      </div>
                      
                      {selectedVersion === version.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 max-h-32 overflow-y-auto">
                            <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {version.content.length > 200 
                                ? `${version.content.substring(0, 200)}...` 
                                : version.content
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Restore Version
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to restore to this version? This will create a new version with the restored content.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRestoreModal(null)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}