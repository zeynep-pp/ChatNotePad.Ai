"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import DiffViewer from "react-diff-viewer";
import axios from "axios";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type ErrorType = 'network' | 'server' | 'invalid_command' | 'empty_text' | 'unknown';

interface ErrorState {
  hasError: boolean;
  type: ErrorType | null;
  message: string;
  details?: string;
  retryable: boolean;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  timestamp: Date;
  originalText: string;
  result?: string;
  success: boolean;
  error?: string;
}

export default function SmartNotePage() {
  const [originalText, setOriginalText] = useState("");
  const [command, setCommand] = useState("");
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    type: null,
    message: "",
    retryable: false
  });
  const [retryCount, setRetryCount] = useState(0);
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    
    // Load command history from localStorage
    const savedHistory = localStorage.getItem('commandHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setCommandHistory(historyWithDates);
      } catch (error) {
        console.error('Failed to parse command history:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const saveHistoryToStorage = (history: CommandHistoryItem[]) => {
    try {
      localStorage.setItem('commandHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save command history:', error);
    }
  };

  const addToHistory = (item: CommandHistoryItem) => {
    const newHistory = [item, ...commandHistory].slice(0, 50); // Keep only last 50 items
    setCommandHistory(newHistory);
    saveHistoryToStorage(newHistory);
  };

  const clearHistory = () => {
    setCommandHistory([]);
    localStorage.removeItem('commandHistory');
  };
  
  const commandSuggestions = [
    "Remove all ',' characters",
    "Replace all 'and' with 'or'",
    "Capitalize first letter of each sentence",
    "Convert to uppercase",
    "Remove extra spaces",
    "Add bullet points to each line",
    "Summarize this text"
  ];

  const clearError = () => {
    setError({
      hasError: false,
      type: null,
      message: "",
      retryable: false
    });
  };

  const handleError = (errorType: ErrorType, message: string, details?: string, retryable: boolean = false) => {
    setError({
      hasError: true,
      type: errorType,
      message,
      details,
      retryable
    });
    setEditedText("");
  };

  const validateCommand = (cmd: string, text: string): { isValid: boolean; errorType?: ErrorType; message?: string } => {
    if (!cmd.trim()) {
      return {
        isValid: false,
        errorType: 'invalid_command',
        message: 'Please enter a command to process your text.'
      };
    }
    
    if (!text.trim()) {
      return {
        isValid: false,
        errorType: 'empty_text',
        message: 'Please enter some text to process before giving a command.'
      };
    }
    
    if (cmd.length < 3) {
      return {
        isValid: false,
        errorType: 'invalid_command',
        message: 'Command too short. Please provide a more detailed instruction.'
      };
    }
    
    return { isValid: true };
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    
    // Validate input
    const validation = validateCommand(command, originalText);
    if (!validation.isValid) {
      handleError(validation.errorType!, validation.message!);
      return;
    }
    
    setLoading(true);
    
    // Create history item
    const historyItem: CommandHistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      command: command.trim(),
      timestamp: new Date(),
      originalText: originalText,
      success: false
    };
    
    try {
      const isSummarization = command.toLowerCase().includes('summarize') || 
                            command.toLowerCase().includes('summary');
      
      const endpoint = isSummarization ? 
        "http://localhost:8000/summarize" : 
        "http://localhost:8000/prompt";
      
      const res = await axios.post(endpoint, {
        text: originalText,
        command,
      }, {
        timeout: 30000 // 30 second timeout
      });
      
      if (res.data.result) {
        setEditedText(res.data.result);
        setRetryCount(0); // Reset retry count on success
        
        // Update history item with success
        historyItem.success = true;
        historyItem.result = res.data.result;
        addToHistory(historyItem);
      } else {
        handleError('server', 'No result returned from the server. Please try a different command.', undefined, true);
        
        // Update history item with error
        historyItem.error = 'No result returned from the server';
        addToHistory(historyItem);
      }
      
    } catch (err: any) {
      console.error('Command processing error:', err);
      
      // Update history item with error
      historyItem.error = err.message || 'Unknown error occurred';
      addToHistory(historyItem);
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        handleError('network', 'Request timed out. The server might be busy.', 'Try again in a few moments or simplify your command.', true);
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        handleError('network', 'Unable to connect to the AI server.', 'Please check if the backend server is running on localhost:8000', true);
      } else if (err.response?.status === 400) {
        handleError('invalid_command', 'Invalid command or text format.', err.response.data?.error || 'Please try rephrasing your command.', false);
      } else if (err.response?.status === 500) {
        handleError('server', 'Server error occurred while processing your command.', err.response.data?.error || 'Please try again or use a simpler command.', true);
      } else if (err.response?.status === 429) {
        handleError('server', 'Too many requests. Please wait a moment.', 'The server is rate limiting requests.', true);
      } else {
        handleError('unknown', 'An unexpected error occurred.', err.message || 'Please try again or refresh the page.', true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      clearError();
      handleCommandSubmit({ preventDefault: () => {} } as React.FormEvent);
    } else {
      handleError('server', 'Maximum retry attempts reached.', 'Please check your connection and try again later.', false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      setCopySuccess("Failed to copy");
      setTimeout(() => setCopySuccess(""), 2000);
    }
  };

  const reuseCommand = (historyItem: CommandHistoryItem) => {
    setCommand(historyItem.command);
    setOriginalText(historyItem.originalText);
    setShowHistory(false);
    setShowSuggestions(false);
  };

  const HistoryPanel = () => {
    const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredHistory = commandHistory.filter(item => {
      const matchesFilter = filter === 'all' || 
        (filter === 'success' && item.success) || 
        (filter === 'error' && !item.success);
      
      const matchesSearch = searchTerm === '' || 
        item.command.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });

    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Command History</h3>
            <div className="flex gap-2">
              <button
                onClick={clearHistory}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Close
              </button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'success' | 'error')}
              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          {/* History List */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredHistory.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                {commandHistory.length === 0 ? 'No commands yet' : 'No commands match your search'}
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => reuseCommand(item)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reuseCommand(item);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Reuse
                    </button>
                  </div>
                  <div className="text-xs text-gray-800 dark:text-gray-100 mb-1 font-medium">
                    {item.command}
                  </div>
                  {item.error && (
                    <div className="text-xs text-red-600 dark:text-red-400 truncate">
                      Error: {item.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 shadow-md">
        <div className="w-full max-w-4xl flex justify-between items-center mb-4">
          <div className="flex-1"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">ChatNotePadAi</h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-xl text-sm">
          AI-powered note editing and transformation. Write your note, enter a natural language command, and see the changes instantly with live diff!
        </p>
      </header>
      {/* Main Content */}
      <main className="flex-1 w-full px-4 py-4">
        <div className="w-full max-w-full flex flex-col lg:flex-row gap-4 mb-32">
          {/* Left: Editor */}
          <section className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-[400px] border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold text-gray-800 dark:text-gray-100">Original Note</div>
              <div className="flex gap-2">
                {originalText && (
                  <button
                    onClick={() => setOriginalText("")}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-sm transition-colors"
                  >
                    Clear
                  </button>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  {originalText.length} chars
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-[300px]">
              <MonacoEditor
                height="300px"
                defaultLanguage="markdown"
                value={originalText}
                onChange={v => setOriginalText(v || "")}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  theme: isDarkMode ? "vs-dark" : "vs",
                  wordWrap: "on",
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  placeholder: "Start typing your text here... (Supports Markdown formatting)",
                }}
              />
            </div>
          </section>
          {/* Right: Edited Text and Diff Viewer */}
          <section className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-[400px] border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold text-gray-800 dark:text-gray-100">Edited Note</div>
              {editedText && (
                <button
                  onClick={() => copyToClipboard(editedText)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium transition-colors duration-200 text-sm flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copySuccess || "Copy"}
                </button>
              )}
            </div>
            
            {error.hasError ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
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
                            onClick={handleRetry}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry {retryCount > 0 && `(${retryCount}/3)`}
                          </button>
                        )}
                        <button
                          onClick={clearError}
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
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                          <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">💡 Try these instead:</div>
                          <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
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
              <div className="flex flex-col gap-3 flex-1">
                {/* Edited Text Area */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-1 text-sm">Result:</div>
                  <div className="max-h-24 overflow-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{editedText}</pre>
                  </div>
                </div>
                
                {/* Diff Viewer */}
                <div className="flex-1 min-h-[150px] overflow-auto">
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-1 text-sm">Changes:</div>
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
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center max-w-sm">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">AI is ready to help!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Write your text on the left, then use the chat below to transform it with natural language commands.</p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-left">
                    <div className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">💡 Example commands:</div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                      <div>• "Make it more formal"</div>
                      <div>• "Fix grammar and spelling"</div>
                      <div>• "Convert to bullet points"</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      {/* Enhanced Chat Interface */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 z-10 shadow-lg" style={{backdropFilter: 'blur(8px)'}}>
        {/* Command History Panel */}
        {showHistory && <HistoryPanel />}
        
        {/* Command Suggestions */}
        {showSuggestions && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Try these commands:</div>
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
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              
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
              <form onSubmit={handleCommandSubmit} className="flex-1 flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm text-base"
                    placeholder="✨ Tell me what to do with your text... (e.g., Remove all commas)"
                    value={command}
                    onChange={e => {
                      setCommand(e.target.value);
                      if (error.hasError && e.target.value.trim()) {
                        clearError();
                      }
                    }}
                    disabled={loading}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {/* Suggestions toggle */}
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
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
              </form>
            </div>
            
            {/* Quick tip */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              💡 Tip: Click the suggestions above or describe what you want to do with your text in natural language
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
