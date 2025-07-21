'use client';

import { forwardRef } from 'react';
import DiffViewer from "react-diff-viewer";
import { AgentInfo, ErrorState } from '../types';
import AgentFeedbackBadge from './AgentFeedbackBadge';
import { TagInput } from './notes/TagInput';

interface ResultsPanelProps {
  editedText: string;
  originalText: string;
  error: ErrorState;
  agentInfo: AgentInfo | null;
  isDarkMode: boolean;
  copySuccess: string;
  retryCount: number;
  onCopyToClipboard: (text: string) => void;
  onRetry: () => void;
  onClearError: () => void;
  onDiffScroll?: (scrollTop: number) => void;
  onSaveAsNote?: (text: string) => void;
  onTextChange?: (text: string) => void;
  userTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  editingNote?: any;
  isSignedIn?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (isFavorite: boolean) => void;
  noteTitle?: string;
  onTitleChange?: (title: string) => void;
}

const ResultsPanel = forwardRef<HTMLDivElement, ResultsPanelProps>(({ 
  editedText,
  originalText,
  error,
  agentInfo,
  isDarkMode,
  copySuccess,
  retryCount,
  onCopyToClipboard,
  onRetry,
  onClearError,
  onDiffScroll,
  onSaveAsNote,
  onTextChange,
  userTags = [],
  onTagsChange,
  editingNote,
  isSignedIn,
  isFavorite = false,
  onToggleFavorite,
  noteTitle = "",
  onTitleChange
}, ref) => {
  // Ampul ikonunun light modda mor olması için renk değişkeni
  const actionIconBg = isDarkMode ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50';
  const actionIconFg = isDarkMode ? 'text-blue-500' : 'text-purple-700';
  return (
    <section className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-[400px] border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold text-gray-800 dark:text-gray-100">Final Note</div>
        {editedText && (
          <div className="flex gap-2">
            {isSignedIn && onSaveAsNote && (
              <div className="flex gap-2">
                <button
                  onClick={() => onSaveAsNote(editedText)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium transition-colors duration-200 text-sm flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save as Note
                </button>
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(!isFavorite)}
                    className={`px-3 py-1 rounded font-medium transition-colors duration-200 text-sm flex items-center gap-1 ${
                      isFavorite 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-yellow-500 hover:text-white text-gray-700 dark:text-gray-300'
                    }`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg className="w-3 h-3" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {isFavorite ? 'Favorited' : 'Favorite'}
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => onCopyToClipboard(editedText)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium transition-colors duration-200 text-sm flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copySuccess || "Copy"}
            </button>
          </div>
        )}
      </div>
      
      {error.hasError ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 animate-in fade-in-50 slide-in-from-right duration-300">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  {error.type === 'network' && 'Connection Error'}
                  {error.type === 'server' && 'Server Error'}
                  {error.type === 'invalid_command' && 'Invalid Command'}
                  {error.type === 'empty_text' && 'Missing Text'}
                  {error.type === 'unknown' && 'Unexpected Error'}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {error.message}
                </p>
                {error.details && (
                  <p className="text-xs text-red-600 dark:text-red-400 mb-3 bg-red-100 dark:bg-red-800/50 p-2 rounded">
                    {error.details}
                  </p>
                )}
                <div className="flex gap-2">
                  {error.retryable && retryCount < 3 && (
                    <button
                      onClick={onRetry}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retry {retryCount > 0 && `(${retryCount}/3)`}
                    </button>
                  )}
                  <button
                    onClick={onClearError}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                  >
                    Dismiss
                  </button>
                </div>
                {error.type === 'network' && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                    <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">💡 Quick fixes:</div>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Make sure the backend server is running</li>
                      <li>• Check if localhost:8000 is accessible</li>
                      <li>• Try refreshing the page</li>
                    </ul>
                  </div>
                )}
                {error.type === 'invalid_command' && (
                  <div className="mt-3 p-2 bg-orange-50 dark:bg-yellow-900/20 border border-orange-200 dark:border-yellow-800 rounded text-xs">
                    <div className="font-medium text-orange-900 dark:text-yellow-200 mb-1">💡 Try these instead:</div>
                    <ul className="text-orange-800 dark:text-yellow-300 space-y-1">
                      <li>• "Make it more formal"</li>
                      <li>• "Fix grammar and spelling"</li>
                      <li>• "Convert to bullet points"</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : editedText ? (
        <div ref={ref} className="flex flex-col gap-3 flex-1 animate-in fade-in-50 slide-in-from-left duration-500">
          {/* Agent Feedback Badge */}
          {agentInfo && (
            <div className="animate-in fade-in-50 duration-300">
              <AgentFeedbackBadge agentInfo={agentInfo} />
            </div>
          )}
          
          {/* Edited Text Area */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600 transform transition-all duration-300 hover:shadow-md">
            <div className={`font-medium mb-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Result (editable):</div>
            <div className="max-h-24 overflow-auto">
              <textarea
                value={editedText}
                onChange={(e) => onTextChange?.(e.target.value)}
                className={`w-full min-h-[60px] resize-none bg-transparent border-0 outline-none text-sm p-0 ${isDarkMode ? 'text-gray-200' : 'text-black'} placeholder-gray-500`}
                placeholder="Your final note will appear here..."
              />
            </div>
          </div>

          {/* Title Section */}
          {isSignedIn && onTitleChange && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
              <div className={`font-medium mb-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>
                Note Title:
              </div>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder={editingNote ? "Update note title..." : "Enter note title..."}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 text-sm transition-colors duration-200 ${
                  isDarkMode ? 'text-gray-200 placeholder-gray-400' : 'text-black placeholder-gray-500'
                }`}
              />
            </div>
          )}

          {/* Tags Section */}
          {isSignedIn && onTagsChange && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
              {editingNote && (
                <div className={`mb-2 p-2 rounded text-xs border ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-orange-50 border-orange-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-blue-200' : 'text-orange-800'}`}>
                    ✏️ Editing: {editingNote.title || 'Untitled Note'}
                  </div>
                </div>
              )}
              <div className={`font-medium mb-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>
                Tags {editingNote ? '(will update note tags)' : '(will be added to saved note)'}:
              </div>
              <TagInput
                tags={userTags}
                onChange={onTagsChange}
                placeholder="Add tags for your note..."
              />
            </div>
          )}
          
          {/* Diff Viewer */}
          <div className="flex-1 min-h-[150px] overflow-auto scroll-smooth" onScroll={(e) => onDiffScroll?.(e.currentTarget.scrollTop)}>
            <div className={`font-medium mb-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Changes:</div>
            <div className="transform transition-all duration-300 hover:shadow-sm">
              <DiffViewer
                oldValue={originalText}
                newValue={editedText}
                splitView={false}
                hideLineNumbers={true}
                showDiffOnly={true}
                useDarkTheme={isDarkMode}
                styles={{
                  variables: {
                    light: {
                      diffViewerBackground: "#fff",
                      addedBackground: "#e6ffed",
                      removedBackground: "#ffeef0",
                    },
                    dark: {
                      diffViewerBackground: "#1a202c",
                      addedBackground: "#064420",
                      removedBackground: "#420606",
                    },
                  },
                  line: {
                    padding: '4px 8px',
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center max-w-sm">
            <div className={`${actionIconBg} rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center`}>
              <svg className={`w-8 h-8 ${actionIconFg}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 
              className="font-medium text-gray-800 dark:text-gray-200 mb-2"
              style={isDarkMode ? {} : { color: '#831843' }}
            >
              AI is ready to help!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Write your text on the left, then use the chat below to transform it with natural language commands.</p>
            <div 
              className={`dark:bg-yellow-900/20 rounded-lg p-3 text-left border ${isDarkMode ? 'border-yellow-400' : ''}`}
              style={isDarkMode ? {} : { backgroundColor: '#fdf2f8', borderColor: '#fce7f3', border: '1px solid' }}
            >
              <div 
                className="text-xs font-medium dark:text-yellow-200 mb-1" 
                style={isDarkMode ? {} : { color: '#831843' }}
              >
                💡 Example commands:
              </div>
              <div 
                className="text-xs dark:text-yellow-300 space-y-1" 
                style={isDarkMode ? {} : { color: '#be185d' }}
              >
                <div>• "Make it more formal"</div>
                <div>• "Fix grammar and spelling"</div>
                <div>• "Convert to bullet points"</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

ResultsPanel.displayName = 'ResultsPanel';

export default ResultsPanel;