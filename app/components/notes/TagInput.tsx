"use client";

import { useState, useRef, useEffect } from 'react';
import { useTags } from '../../hooks/useTags';
import { useTheme } from '../../contexts/ThemeContext';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const TagInput = ({ 
  tags, 
  onChange, 
  placeholder = "Add tags...",
  disabled = false,
  className = ''
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tags: allTags } = useTags();
  const { isDarkMode } = useTheme();

  // Tag colors matching send button style
  const tagStyle = isDarkMode 
    ? "bg-blue-600 text-white border-blue-600" 
    : "bg-white text-purple-700 border border-purple-700";
  
  const tagCloseStyle = isDarkMode
    ? "text-blue-200 hover:text-white hover:bg-blue-500"
    : "text-purple-600 hover:text-purple-800 hover:bg-purple-50";

  // Filter suggestions based on input
  const suggestions = (allTags || []).filter(tag => 
    tag.toLowerCase().includes(inputValue.toLowerCase()) &&
    !tags.includes(tag)
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    console.log('Adding tag:', trimmedTag, 'Current tags:', tags);
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      console.log('New tags array:', newTags);
      onChange(newTags);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag when backspace is pressed and input is empty
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[2.5rem] focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-colors duration-200">
        {/* Existing tags */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tagStyle}`}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className={`ml-2 transition-colors duration-200 rounded-full p-0.5 ${tagCloseStyle}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        
        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
          {suggestions.slice(0, 10).map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Press Enter or comma to add tags
      </div>
    </div>
  );
};