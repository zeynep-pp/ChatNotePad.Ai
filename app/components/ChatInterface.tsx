'use client';

import { CommandHistoryItem } from '../types';
import HistoryPanel from './HistoryPanel';

interface ChatInterfaceProps {
  command: string;
  setCommand: (command: string) => void;
  loading: boolean;
  loadingProgress: number;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  commandHistory: CommandHistoryItem[];
  onReuseCommand: (item: CommandHistoryItem) => void;
  onClearHistory: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onClearError: () => void;
  hasError: boolean;
  commandSuggestions: string[];
  onQuickTransform: (command: string) => void;
}

export default function ChatInterface({
  command,
  setCommand,
  loading,
  loadingProgress,
  showHistory,
  setShowHistory,
  showSuggestions,
  setShowSuggestions,
  commandHistory,
  onReuseCommand,
  onClearHistory,
  onSubmit,
  onClearError,
  hasError,
  commandSuggestions,
  onQuickTransform
}: ChatInterfaceProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 z-10 shadow-lg" style={{backdropFilter: 'blur(8px)'}}>
      {/* Command History Panel */}
      {showHistory && (
        <HistoryPanel 
          commandHistory={commandHistory}
          onReuseCommand={onReuseCommand}
          onClearHistory={onClearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
      
      {/* Command Suggestions */}
      {showSuggestions && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          {/* Quick Transform Actions */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Transform:</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onQuickTransform("Make this more formal")}
                className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1"
              >
                📋 Make Formal
              </button>
              <button
                onClick={() => onQuickTransform("Simplify this text for beginners")}
                className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1"
              >
                📖 Simplify
              </button>
              <button
                onClick={() => onQuickTransform("Make this more casual")}
                className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors flex items-center gap-1"
              >
                😊 Make Casual
              </button>
              <button
                onClick={() => onQuickTransform("Add professional tone")}
                className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors flex items-center gap-1"
              >
                💼 Professional
              </button>
            </div>
          </div>
          
          {/* Regular Command Suggestions */}
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Try these commands:</div>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 hover:scale-105"
            >
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {commandSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setCommand(suggestion);
                  setShowSuggestions(false);
                }}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Chat Input */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            {/* AI Icon */}
            <button
              onClick={() => {
                setShowSuggestions(!showSuggestions);
                setShowHistory(false);
              }}
              className={`p-2 rounded-full transition-all duration-200 cursor-pointer hover:scale-105 ${
                showSuggestions 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              title="Toggle command suggestions"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            
            {/* History Toggle Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  setShowSuggestions(false);
                }}
                className={`p-2 rounded-full transition-colors ${
                  showHistory 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="Toggle command history"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {commandHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {commandHistory.length > 99 ? '99+' : commandHistory.length}
                </span>
              )}
            </div>
            
            {/* Input Form */}
            <form onSubmit={onSubmit} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm text-base"
                  placeholder="✨ Tell me what to do with your text... (e.g., Remove all commas)"
                  value={command}
                  onChange={e => {
                    setCommand(e.target.value);
                    if (hasError && e.target.value.trim()) {
                      onClearError();
                    }
                  }}
                  disabled={loading}
                  onFocus={() => setShowSuggestions(true)}
                />
                {/* Suggestions toggle */}
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-20 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="relative">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 transform hover:scale-105 active:scale-95"
                  disabled={loading || !command.trim()}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send
                    </>
                  )}
                </button>
                {/* Progress bar */}
                {loading && loadingProgress > 0 && (
                  <div className="absolute bottom-0 left-0 h-1 bg-blue-300 rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                )}
              </div>
            </form>
          </div>
          
          {/* Quick tip */}
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
            💡 Tip: Click the suggestions above or describe what you want to do with your text in natural language
          </div>
        </div>
      </div>
    </div>
  );
}