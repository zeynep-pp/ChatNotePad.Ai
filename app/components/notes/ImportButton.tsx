"use client";

import React, { useRef } from 'react';

interface ImportButtonProps {
  onImport: (files: FileList) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'minimal';
  showLabel?: boolean;
}

export const ImportButton: React.FC<ImportButtonProps> = ({
  onImport,
  disabled = false,
  className = '',
  variant = 'primary',
  showLabel = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supportedFormats = ['.md', '.txt', '.json'];

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImport(e.target.files);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm focus:ring-green-500`;
      case 'secondary':
        return `${baseStyles} px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 text-sm focus:ring-blue-500`;
      case 'minimal':
        return `${baseStyles} px-3 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm focus:ring-blue-500`;
      default:
        return `${baseStyles} px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm focus:ring-green-500`;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`${getButtonStyles()} ${className}`}
        title="Import notes from files"
      >
        <svg className={`${showLabel ? 'mr-2' : ''} w-4 h-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        {showLabel && 'Import'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportedFormats.join(',')}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Import notes files"
      />
    </>
  );
};

// Import Area Component for drag-and-drop in empty states
interface ImportAreaProps {
  onImport: (files: FileList) => void;
  disabled?: boolean;
  className?: string;
}

export const ImportArea: React.FC<ImportAreaProps> = ({
  onImport,
  disabled = false,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supportedFormats = ['.md', '.txt', '.json'];

  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled && e.dataTransfer.files.length > 0) {
      onImport(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImport(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        isDragOver
          ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Import Your Notes
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
          Drag and drop your note files here, or click to browse and select files from your computer.
        </p>
        
        <div className="mb-4">
          <ImportButton
            onImport={onImport}
            disabled={disabled}
            variant="primary"
            showLabel={true}
          />
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <div className="mb-1">
            <strong>Supported formats:</strong> {supportedFormats.join(', ')}
          </div>
          <div>
            <strong>Max size:</strong> 10MB per file
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportedFormats.join(',')}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Import notes files"
      />
    </div>
  );
};