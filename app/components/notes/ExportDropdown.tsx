"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../../types/notes';
import { ExportFormat } from './ExportModal';

interface ExportDropdownProps {
  notes: Note[];
  selectedNotes?: Note[];
  onExport: (format: ExportFormat, notes: Note[]) => void;
  disabled?: boolean;
  className?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  notes,
  selectedNotes = [],
  onExport,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleExport = (format: ExportFormat, exportNotes: Note[]) => {
    setIsOpen(false);
    onExport(format, exportNotes);
  };

  const exportOptions = [
    {
      format: 'markdown' as ExportFormat,
      label: 'Markdown',
      description: 'Export as .md files',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      format: 'txt' as ExportFormat,
      label: 'Plain Text',
      description: 'Export as .txt files',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      format: 'pdf' as ExportFormat,
      label: 'PDF',
      description: 'Export as PDF document',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-expanded="true"
          aria-haspopup="true"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
          <svg className="-mr-1 ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {/* Export All Section */}
            <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700">
              Export All ({notes.length} notes)
            </div>
            {exportOptions.map((option) => (
              <button
                key={`all-${option.format}`}
                onClick={() => handleExport(option.format, notes)}
                className="group flex items-start w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-blue-500 mr-3 mt-0.5">
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}

            {/* Export Selected Section */}
            {selectedNotes.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 mt-2">
                  Export Selected ({selectedNotes.length} notes)
                </div>
                {exportOptions.map((option) => (
                  <button
                    key={`selected-${option.format}`}
                    onClick={() => handleExport(option.format, selectedNotes)}
                    className="group flex items-start w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-green-500 mr-3 mt-0.5">
                      {option.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description} • Selected notes
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Quick Actions Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            
            {/* Quick Export Info */}
            <div className="px-4 py-2">
              <div className="flex items-start text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  Quick export downloads immediately. For advanced options, use the Export Modal.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};