"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ImportStats } from '../../lib/notesApi';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (stats: ImportStats) => void;
  title?: string;
}

interface FilePreview {
  file: File;
  content?: string;
  valid: boolean;
  error?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  title = "Import Notes"
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['.md', '.txt', '.json'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setImportProgress(0);
      setImportStats(null);
      setIsImporting(false);
      setFiles([]);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    if (file.size > maxFileSize) {
      return { valid: false, error: `File size exceeds 10MB limit` };
    }

    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!supportedFormats.includes(extension)) {
      return { valid: false, error: `Unsupported format. Supported: ${supportedFormats.join(', ')}` };
    }

    return { valid: true };
  }, []);

  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: FilePreview[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateFile(file);
      
      let content = '';
      let valid = validation.valid;
      let error = validation.error;

      if (valid) {
        try {
          content = await file.text();
          if (!content.trim()) {
            valid = false;
            error = 'File appears to be empty';
          }
        } catch (err) {
          valid = false;
          error = 'Failed to read file content';
        }
      }

      newFiles.push({
        file,
        content,
        valid,
        error
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    const validFiles = files.filter(f => f.valid);
    
    if (validFiles.length === 0) {
      setError('No valid files to import');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Use the updated NotesAPI
      const { NotesAPI } = await import('../../lib/notesApi');
      
      // Create a FileList-like object from valid files
      const fileArray = validFiles.map(fp => fp.file);
      const fileList = {
        length: fileArray.length,
        item: (index: number) => fileArray[index],
        [Symbol.iterator]: function* () {
          for (let i = 0; i < this.length; i++) {
            yield this.item(i);
          }
        }
      } as FileList;

      const stats = await NotesAPI.importNotes(fileList);

      clearInterval(progressInterval);
      setImportProgress(100);
      
      setImportStats(stats);

      if (onImportComplete) {
        onImportComplete(stats);
      }

      if (stats.failed === 0) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      onClose();
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  const validFiles = files.filter(f => f.valid);

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 z-[9998]" onClick={handleClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 relative z-[9999]">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload your notes files to import them into your collection.
                </p>
              </div>

              {/* Supported Formats */}
              <div className="mt-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Supported Formats
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        {supportedFormats.join(', ')} • Max size: 10MB per file
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Area */}
              {!importStats && (
                <div
                  className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragOver
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  } ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isImporting && openFileDialog()}
                >
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-medium">Click to upload</span> or drag and drop your files here
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    Multiple files supported
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={supportedFormats.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* File List */}
              {files.length > 0 && !importStats && (
                <div className="mt-4 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {files.map((filePreview, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 border rounded-md ${
                          filePreview.valid
                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                            : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                        }`}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <div className={`w-4 h-4 mr-3 flex-shrink-0 ${
                            filePreview.valid ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {filePreview.valid ? (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${
                              filePreview.valid
                                ? 'text-green-800 dark:text-green-200'
                                : 'text-red-800 dark:text-red-200'
                            }`}>
                              {filePreview.file.name}
                            </div>
                            <div className={`text-xs ${
                              filePreview.valid
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {filePreview.error || `${(filePreview.file.size / 1024).toFixed(1)} KB`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          disabled={isImporting}
                          className="ml-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isImporting && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Importing {validFiles.length} files...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Import Results */}
              {importStats && (
                <div className="mt-4">
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-md p-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-green-800 dark:text-green-200">
                          Import Complete
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Successfully imported {importStats.imported} of {importStats.total} notes
                          {importStats.failed > 0 && ` (${importStats.failed} failed)`}
                        </div>
                        {importStats.errors.length > 0 && (
                          <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                            Errors: {importStats.errors.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
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
            {!importStats && (
              <button
                type="button"
                onClick={handleImport}
                disabled={isImporting || validFiles.length === 0}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap min-w-fit"
              >
                {isImporting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </div>
                ) : (
                  `Import ${validFiles.length} Files`
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              disabled={isImporting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-6 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importStats ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};