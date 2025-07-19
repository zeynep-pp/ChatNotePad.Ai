"use client";

import { useState, useEffect } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { Note } from '../../types/notes';

interface SearchBarProps {
  onResults?: (results: Note[]) => void;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({ 
  onResults, 
  onQueryChange,
  placeholder = "Search notes...",
  className = ''
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const { query, results, loading, error, hasSearched, setQuery, clearSearch } = useSearch();

  // Notify parent of results changes
  useEffect(() => {
    if (onResults) {
      onResults(results);
    }
  }, [results, onResults]);

  // Notify parent of query changes
  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(query);
    }
  }, [query, onQueryChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    clearSearch();
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'transform scale-105' : ''
      }`}>
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className={`w-5 h-5 transition-colors duration-200 ${
                loading ? 'text-blue-500' : 'text-gray-400'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
          />
          
          {/* Clear button */}
          {query && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Searching...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Results summary */}
        {hasSearched && !loading && !error && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {results.length === 0 ? (
                <span>No notes found for "{query}"</span>
              ) : (
                <span>Found {results.length} note{results.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search tips */}
      {isFocused && !query && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">Search tips:</p>
            <ul className="text-xs space-y-1">
              <li>• Search in titles and content</li>
              <li>• Use quotes for exact phrases</li>
              <li>• Press Escape to clear</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};