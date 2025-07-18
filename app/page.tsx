"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import axios from "axios";
import { ErrorState, CommandHistoryItem, AgentInfo } from './types';
import TextEditor from './components/TextEditor';
import ResultsPanel from './components/ResultsPanel';
import ChatInterface from './components/ChatInterface';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserProfileDropdown } from './components/auth/UserProfileDropdown';
import { AuthAPI } from './lib/auth';

function SmartNotePageContent() {
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
  
  // Refs for scroll targets
  const historyRef = useRef<HTMLDivElement>(null);
  const diffViewerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Enhanced loading state with progress
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Diff syncing state
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [diffScrollTop, setDiffScrollTop] = useState(0);
  
  // Agent feedback state
  const [currentAgentInfo, setCurrentAgentInfo] = useState<AgentInfo | null>(null);
  
  const commandSuggestions = [
    "Remove all ',' characters",
    "Replace all 'and' with 'or'",
    "Capitalize first letter of each sentence",
    "Convert to uppercase",
    "Remove extra spaces",
    "Add bullet points to each line",
    "Summarize this text",
    "Make this more formal",
    "Simplify this text for beginners",
    "Make this more casual",
    "Add professional tone",
    "Make this sound more confident"
  ];

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
    
    // Auto-scroll to latest history item if panel is open
    if (showHistory) {
      setTimeout(() => {
        scrollToLatestHistory();
      }, 100);
    }
  };

  const clearHistory = () => {
    setCommandHistory([]);
    localStorage.removeItem('commandHistory');
  };

  // Auto-scroll functions
  const scrollToLatestHistory = () => {
    if (historyRef.current) {
      historyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToError = () => {
    if (errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const clearError = () => {
    setError({
      hasError: false,
      type: null,
      message: "",
      retryable: false
    });
  };

  const handleError = (errorType: any, message: string, details?: string, retryable: boolean = false) => {
    setError({
      hasError: true,
      type: errorType,
      message,
      details,
      retryable
    });
    setEditedText("");
    
    // Auto-scroll to error with slight delay
    setTimeout(() => {
      scrollToError();
    }, 100);
  };

  const validateCommand = (cmd: string, text: string) => {
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

  const handleCommandSubmit = async (e: React.FormEvent, quickCommand?: string) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    
    // Use provided command or fall back to state
    const currentCommand = quickCommand || command;
    
    // Validate input
    const validation = validateCommand(currentCommand, originalText);
    if (!validation.isValid) {
      handleError(validation.errorType!, validation.message!);
      return;
    }
    
    setLoading(true);
    setLoadingProgress(0);
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);
    
    // Create history item
    const historyItem: CommandHistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      command: currentCommand.trim(),
      timestamp: new Date(),
      originalText: originalText,
      success: false
    };
    
    try {
      const isSummarization = currentCommand.toLowerCase().includes('summarize') || 
                            currentCommand.toLowerCase().includes('summary');
      
      const isTransformation = currentCommand.toLowerCase().includes('formal') || 
                              currentCommand.toLowerCase().includes('formalize') ||
                              currentCommand.toLowerCase().includes('professional') ||
                              currentCommand.toLowerCase().includes('business') ||
                              currentCommand.toLowerCase().includes('official') ||
                              currentCommand.toLowerCase().includes('simplify') ||
                              currentCommand.toLowerCase().includes('simple') ||
                              currentCommand.toLowerCase().includes('easier') ||
                              currentCommand.toLowerCase().includes('beginner') ||
                              currentCommand.toLowerCase().includes('layman') ||
                              currentCommand.toLowerCase().includes('tone') ||
                              currentCommand.toLowerCase().includes('casual') ||
                              currentCommand.toLowerCase().includes('friendly') ||
                              currentCommand.toLowerCase().includes('warm') ||
                              currentCommand.toLowerCase().includes('conversational') ||
                              currentCommand.toLowerCase().includes('confident');
      
      const endpoint = isSummarization ? 
        "http://localhost:8000/summarize" : 
        isTransformation ?
        "http://localhost:8000/api/v1/transform" :
        "http://localhost:8000/prompt";
      
      const res = await axios.post(endpoint, {
        text: originalText,
        command: currentCommand,
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          ...AuthAPI.isAuthenticated() ? { Authorization: `Bearer ${AuthAPI.getToken()}` } : {}
        }
      });
      
      if (res.data.result) {
        setEditedText(res.data.result);
        setRetryCount(0); // Reset retry count on success
        
        // Handle agent info from backend (with backward compatibility)
        if (res.data.agent_info) {
          setCurrentAgentInfo(res.data.agent_info);
          historyItem.agentInfo = res.data.agent_info;
        } else {
          // Fallback for older backend versions
          setCurrentAgentInfo({
            model: isSummarization ? 'Summarization Agent' : 
                   isTransformation ? 'Text Transformation Agent' : 
                   'Processing Agent',
            processing_time_ms: Date.now() - parseInt(historyItem.id.split('Math')[0]),
            timestamp: new Date().toISOString()
          });
        }
        
        // Update history item with success
        historyItem.success = true;
        historyItem.result = res.data.result;
        addToHistory(historyItem);
        
        // Auto-scroll to results after success
        setTimeout(() => {
          scrollToResults();
        }, 300);
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
      setLoadingProgress(100);
      // Reset progress after animation
      setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
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

  const handleQuickTransform = (transformCommand: string) => {
    setCommand(transformCommand);
    setShowSuggestions(false);
    setShowHistory(false);
    // Auto-submit the transformation with the command parameter
    handleCommandSubmit({ preventDefault: () => {} } as React.FormEvent, transformCommand);
  };

  // Diff syncing functions
  const handleEditorScroll = (scrollTop: number) => {
    setEditorScrollTop(scrollTop);
    // Sync diff viewer scroll with a slight delay to avoid conflicts
    if (diffViewerRef.current) {
      setTimeout(() => {
        diffViewerRef.current?.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }, 50);
    }
  };

  const handleDiffScroll = (scrollTop: number) => {
    setDiffScrollTop(scrollTop);
    // Sync editor scroll with a slight delay to avoid conflicts
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current?.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        {/* Header */}
        <header className="w-full py-6 px-4 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 shadow-md">
        <div className="w-full max-w-4xl flex justify-between items-center mb-4">
          <div className="flex-1"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">ChatNotePadAi</h1>
          <div className="flex-1 flex justify-end space-x-3">
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
            <UserProfileDropdown />
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
          <TextEditor
            ref={editorRef}
            value={originalText}
            onChange={setOriginalText}
            onScroll={handleEditorScroll}
            isDarkMode={isDarkMode}
          />

          {/* Right: Results Panel */}
          <ResultsPanel
            ref={resultsRef}
            editedText={editedText}
            originalText={originalText}
            error={error}
            agentInfo={currentAgentInfo}
            isDarkMode={isDarkMode}
            copySuccess={copySuccess}
            retryCount={retryCount}
            onCopyToClipboard={copyToClipboard}
            onRetry={handleRetry}
            onClearError={clearError}
            onDiffScroll={handleDiffScroll}
          />
        </div>
      </main>

      {/* Chat Interface */}
      <ChatInterface
        command={command}
        setCommand={setCommand}
        loading={loading}
        loadingProgress={loadingProgress}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        commandHistory={commandHistory}
        onReuseCommand={reuseCommand}
        onClearHistory={clearHistory}
        onSubmit={handleCommandSubmit}
        onClearError={clearError}
        hasError={error.hasError}
        commandSuggestions={commandSuggestions}
        onQuickTransform={handleQuickTransform}
      />
      </div>
    </ProtectedRoute>
  );
}

export default function SmartNotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <SmartNotePageContent />
    </Suspense>
  );
}