"use client";

import React, { useState } from 'react';
import { Note } from '../../types/notes';
import { ExportModal } from './ExportModal';
import { ImportModal } from './ImportModal';
import { ExportDropdown } from './ExportDropdown';
import { ImportButton, ImportArea } from './ImportButton';
import { NotesAPI } from '../../lib/notesApi';
import { useNotes } from '../../hooks/useNotes';

interface NotesPageIntegrationProps {
  notes: Note[];
  selectedNotes?: Note[];
  onNotesUpdated?: () => void;
}

export const NotesPageIntegration: React.FC<NotesPageIntegrationProps> = ({
  notes,
  selectedNotes = [],
  onNotesUpdated
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { fetchNotes } = useNotes();

  const handleQuickExport = async (format: 'markdown' | 'txt' | 'pdf', exportNotes: Note[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const noteIds = exportNotes.map(note => note.id);
      await NotesAPI.quickExport(format, noteIds);
      
      setSuccess(`Successfully exported ${exportNotes.length} notes as ${format.toUpperCase()}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFiles = async (files: FileList) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stats = await NotesAPI.importNotes(files);
      
      setSuccess(`Successfully imported ${stats.imported} of ${stats.total} notes`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh notes list
      if (onNotesUpdated) {
        onNotesUpdated();
      } else {
        fetchNotes();
      }
      
      // If there were errors, show them
      if (stats.failed > 0 && stats.errors.length > 0) {
        console.warn('Import errors:', stats.errors);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportComplete = (stats: { imported: number; total: number; failed: number }) => {
    setSuccess(`Successfully imported ${stats.imported} of ${stats.total} notes`);
    setTimeout(() => setSuccess(null), 3000);
    
    // Refresh notes list
    if (onNotesUpdated) {
      onNotesUpdated();
    } else {
      fetchNotes();
    }
    
    setShowImportModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header with Import/Export Actions */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Notes Management
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {notes.length} total notes
            {selectedNotes.length > 0 && ` • ${selectedNotes.length} selected`}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Import Button */}
          <ImportButton
            onImport={handleImportFiles}
            disabled={isLoading}
            variant="secondary"
          />
          
          {/* Advanced Import Button */}
          <button
            onClick={() => setShowImportModal(true)}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Advanced Import
          </button>
          
          {/* Export Dropdown */}
          <ExportDropdown
            notes={notes}
            selectedNotes={selectedNotes}
            onExport={handleQuickExport}
            disabled={isLoading || notes.length === 0}
          />
          
          {/* Advanced Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            disabled={isLoading || notes.length === 0}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Advanced Export
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.082 16.5c-.77.833-.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-sm text-blue-800 dark:text-blue-200">Processing...</span>
          </div>
        </div>
      )}

      {/* Empty State with Import Area */}
      {notes.length === 0 && !isLoading && (
        <ImportArea
          onImport={handleImportFiles}
          disabled={isLoading}
          className="mx-auto max-w-lg"
        />
      )}

      {/* Modals */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        notes={notes}
        selectedNotes={selectedNotes}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

// Hook for easy integration
export const useNotesImportExport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const quickExport = async (format: 'markdown' | 'txt' | 'pdf', notes: Note[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const noteIds = notes.map(note => note.id);
      await NotesAPI.quickExport(format, noteIds);
      
      setSuccess(`Successfully exported ${notes.length} notes as ${format.toUpperCase()}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const quickImport = async (files: FileList) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stats = await NotesAPI.importNotes(files);
      
      setSuccess(`Successfully imported ${stats.imported} of ${stats.total} notes`);
      setTimeout(() => setSuccess(null), 3000);
      
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setTimeout(() => setError(null), 5000);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    success,
    quickExport,
    quickImport,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null)
  };
};