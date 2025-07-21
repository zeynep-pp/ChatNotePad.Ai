"use client";

import React, { useState, useEffect } from 'react';
import { Note } from '../../types/notes';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  selectedNotes?: Note[];
  title?: string;
}

export type ExportFormat = 'markdown' | 'txt' | 'pdf';
export type ExportMode = 'single' | 'selected' | 'all';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  notes,
  selectedNotes = [],
  title = "Export Notes"
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('markdown');
  const [exportMode, setExportMode] = useState<ExportMode>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setExportProgress(0);
      setIsExporting(false);
      // Default to selected if there are selected notes
      setExportMode(selectedNotes.length > 0 ? 'selected' : 'all');
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, selectedNotes.length]);

  const getNotesToExport = (): Note[] => {
    switch (exportMode) {
      case 'selected':
        return selectedNotes;
      case 'all':
        return notes;
      case 'single':
        return selectedNotes.slice(0, 1);
      default:
        return notes;
    }
  };

  const getExportCount = (): number => {
    return getNotesToExport().length;
  };

  const handleExport = async () => {
    const notesToExport = getNotesToExport();
    
    if (notesToExport.length === 0) {
      setError('No notes selected for export');
      return;
    }

    setIsExporting(true);
    setError(null);
    setExportProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const noteIds = notesToExport.map(note => note.id);
      
      // Use the updated NotesAPI
      const { NotesAPI } = await import('../../lib/notesApi');
      await NotesAPI.quickExport(exportFormat, noteIds);

      clearInterval(progressInterval);
      setExportProgress(100);

      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const formatOptions = [
    { 
      value: 'markdown' as ExportFormat, 
      label: 'Markdown', 
      description: 'Export as .md files with full formatting',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      value: 'txt' as ExportFormat, 
      label: 'Plain Text', 
      description: 'Export as .txt files without formatting',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      value: 'pdf' as ExportFormat, 
      label: 'PDF', 
      description: 'Export as PDF with formatted layout (single notes only)',
      disabled: exportMode !== 'single' && getNotesToExport().length > 1,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ].filter(format => {
    // Hide PDF for bulk exports
    if (format.value === 'pdf' && getNotesToExport().length > 1) {
      return false;
    }
    return true;
  });

  const modeOptions = [
    { value: 'all' as ExportMode, label: 'All Notes', count: notes.length },
    { value: 'selected' as ExportMode, label: 'Selected Notes', count: selectedNotes.length, disabled: selectedNotes.length === 0 }
  ];

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 z-[9998]" onClick={handleClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-[9999]">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose export format and options for your notes.
                </p>
              </div>

              {/* Export Mode Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Mode
                </label>
                <div className="space-y-2">
                  {modeOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        id={`mode-${option.value}`}
                        name="exportMode"
                        type="radio"
                        value={option.value}
                        checked={exportMode === option.value}
                        onChange={(e) => setExportMode(e.target.value as ExportMode)}
                        disabled={option.disabled || isExporting}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                      />
                      <label htmlFor={`mode-${option.value}`} className={`ml-3 block text-sm ${option.disabled ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {option.label} ({option.count} notes)
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Export Format
                </label>
                <div className="space-y-3">
                  {formatOptions.map((format) => (
                    <div
                      key={format.value}
                      className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                        exportFormat === format.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isExporting && setExportFormat(format.value)}
                    >
                      <input
                        type="radio"
                        name="exportFormat"
                        value={format.value}
                        checked={exportFormat === format.value}
                        onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                        disabled={isExporting}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div className={`text-${exportFormat === format.value ? 'blue-600' : 'gray-400'} mr-3`}>
                          {format.icon}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${exportFormat === format.value ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                            {format.label}
                          </div>
                          <div className={`text-sm ${exportFormat === format.value ? 'text-blue-700 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                            {format.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              {isExporting && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Exporting {getExportCount()} notes...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.082 16.5c-.77.833-.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || getExportCount() === 0}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap min-w-fit"
            >
              {isExporting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </div>
              ) : (
                `Export ${getExportCount()} Notes`
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isExporting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-6 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};