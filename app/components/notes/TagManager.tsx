"use client";

import { useState } from 'react';
import { useTags } from '../../hooks/useTags';

interface TagManagerProps {
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  showFavoriteFilter?: boolean;
  onFavoriteFilterChange?: (showFavorites: boolean) => void;
  className?: string;
}

export const TagManager = ({ 
  selectedTags = [], 
  onTagsChange,
  showFavoriteFilter = false,
  onFavoriteFilterChange,
  className = ''
}: TagManagerProps) => {
  const { tags, loading, error } = useTags();
  const [showAllTags, setShowAllTags] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (!onTagsChange) return;
    
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    onTagsChange(newTags);
  };

  const handleClearTags = () => {
    if (onTagsChange) {
      onTagsChange([]);
    }
  };

  const handleFavoriteToggle = () => {
    const newValue = !showOnlyFavorites;
    setShowOnlyFavorites(newValue);
    if (onFavoriteFilterChange) {
      onFavoriteFilterChange(newValue);
    }
  };

  const displayedTags = showAllTags ? (tags || []) : (tags || []).slice(0, 10);

  if (loading) {
    return (
      <div className={`${className} p-4`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded px-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-4`}>
        <div className="text-red-500 dark:text-red-400 text-sm">
          Failed to load tags: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={handleClearTags}
            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Favorite filter */}
      {showFavoriteFilter && (
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyFavorites}
              onChange={handleFavoriteToggle}
              className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>Show only favorites</span>
            </span>
          </label>
        </div>
      )}

      {/* Tags section */}
      {(tags && tags.length > 0) && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags ({selectedTags.length} selected)
            </h4>
            {(tags && tags.length > 10) && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                {showAllTags ? 'Show less' : `Show all ${tags?.length || 0}`}
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {displayedTags.map((tag, index) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={index}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 border
                    ${isSelected
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-gray-100 text-purple-700 border-purple-200 hover:bg-purple-50'}
                  `}
                >
                  {tag}
                  {isSelected && (
                    <span className="ml-1">×</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!tags || tags.length === 0) && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-sm">No tags available</p>
          <p className="text-xs mt-1">Tags will appear here when you create notes with tags</p>
        </div>
      )}

      {/* Active filters summary */}
      {(selectedTags.length > 0 || showOnlyFavorites) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Active filters:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {showOnlyFavorites && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Favorites
                </span>
              )}
              {selectedTags.slice(0, 3).map(tag => (
                <span key={tag} className="inline-block px-2 py-1 rounded bg-purple-200 dark:bg-purple-900/30 text-gray-800 dark:text-purple-300">
                  {tag}
                </span>
              ))}
              {selectedTags.length > 3 && (
                <span className="inline-block px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  +{selectedTags.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};