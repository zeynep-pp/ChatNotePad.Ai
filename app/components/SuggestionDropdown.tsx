"use client";

import { useState, useEffect, useRef } from 'react';

interface Suggestion {
  id: string;
  text: string;
  type: 'content' | 'command' | 'style';
  confidence: number;
  description?: string;
}

interface SuggestionDropdownProps {
  isVisible: boolean;
  suggestions: Suggestion[];
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
  className?: string;
}

export default function SuggestionDropdown({
  isVisible,
  suggestions,
  selectedIndex,
  onSelect,
  onClose,
  position,
  className = ""
}: SuggestionDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isVisible && dropdownRef.current) {
      const dropdown = dropdownRef.current;
      const rect = dropdown.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Adjust horizontal position if dropdown goes beyond viewport
      if (position.x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }
      if (adjustedX < 10) {
        adjustedX = 10;
      }

      // Adjust vertical position if dropdown goes beyond viewport
      if (position.y + rect.height > viewportHeight) {
        adjustedY = position.y - rect.height - 10;
      }
      if (adjustedY < 10) {
        adjustedY = 10;
      }

      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    }
  }, [isVisible, position, suggestions.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex].text);
          }
          break;
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, selectedIndex, suggestions, onSelect, onClose]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  const getTypeIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'content':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'command':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
          </svg>
        );
      case 'style':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div
      ref={dropdownRef}
      className={`fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-sm min-w-64 ${className}`}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            AI Suggestions
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="max-h-64 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion.text)}
            className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 border-l-2 ${
              index === selectedIndex
                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500'
                : 'border-l-transparent'
            }`}
          >
            <div className="flex items-start space-x-2">
              {getTypeIcon(suggestion.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {suggestion.text.length > 40 
                      ? `${suggestion.text.substring(0, 40)}...` 
                      : suggestion.text
                    }
                  </p>
                  <div className="flex items-center space-x-1 ml-2">
                    <div 
                      className={`w-2 h-2 rounded-full ${getConfidenceColor(suggestion.confidence)}`}
                      title={`Confidence: ${Math.round(suggestion.confidence * 100)}%`}
                    />
                  </div>
                </div>
                {suggestion.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {suggestion.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                    {suggestion.type}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Use ↑↓ to navigate, Enter to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}