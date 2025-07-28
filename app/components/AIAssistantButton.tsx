"use client";

import { useState } from 'react';
import axios from 'axios';

interface AIAssistantButtonProps {
  currentText: string;
  cursorPosition: number;
  onSuggestion: (suggestion: string) => void;
  onTranslate: () => void;
  disabled?: boolean;
  className?: string;
}

export default function AIAssistantButton({
  currentText,
  cursorPosition,
  onSuggestion,
  onTranslate,
  disabled = false,
  className = ""
}: AIAssistantButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStyleImprovement = async () => {
    if (!currentText.trim()) return;
    
    setLoading(true);
    try {
      const selectedText = getSelectedText();
      const textToImprove = selectedText || currentText;
      
      const response = await axios.post('/api/v1/ai/improve-style', {
        text: textToImprove,
        context: currentText,
        cursor_position: cursorPosition
      });

      onSuggestion(response.data.improved_text);
    } catch (error) {
      console.error('Style improvement failed:', error);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleQuickSummary = async () => {
    if (!currentText.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/ai/quick-summary', {
        text: currentText,
        max_length: 100
      });

      onSuggestion(response.data.summary);
    } catch (error) {
      console.error('Quick summary failed:', error);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleExpand = async () => {
    if (!currentText.trim()) return;
    
    setLoading(true);
    try {
      const selectedText = getSelectedText();
      const textToExpand = selectedText || currentText;
      
      const response = await axios.post('/api/v1/ai/expand-text', {
        text: textToExpand,
        context: currentText
      });

      onSuggestion(response.data.expanded_text);
    } catch (error) {
      console.error('Text expansion failed:', error);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const getSelectedText = () => {
    const selection = window.getSelection();
    return selection?.toString() || '';
  };

  const menuItems = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      label: 'Improve Style',
      action: handleStyleImprovement,
      description: 'Enhance writing style and clarity'
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Quick Summary',
      action: handleQuickSummary,
      description: 'Generate a brief summary'
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
      label: 'Expand Text',
      action: handleExpand,
      description: 'Add more detail and context'
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      label: 'Translate',
      action: () => {
        onTranslate();
        setShowMenu(false);
      },
      description: 'Translate to another language'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || loading}
        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
        title="AI Assistant"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
        <span className="text-sm font-medium">AI</span>
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 px-2">
              AI Assistant
            </div>
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                disabled={loading}
                className="w-full flex items-start space-x-3 px-2 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex-shrink-0 text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
              Select text for context-aware suggestions
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}