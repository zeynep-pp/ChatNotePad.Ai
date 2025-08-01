"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import apiClient from "./lib/apiClient";
import { ErrorState, CommandHistoryItem, AgentInfo } from './types';
import TextEditor from './components/TextEditor';
import ResultsPanel from './components/ResultsPanel';
import ChatInterface from './components/ChatInterface';
import { UserProfileDropdown } from './components/auth/UserProfileDropdown';
import { ImportButton } from './components/notes/ImportButton';
import { AuthAPI } from './lib/auth';
import { NotesAPI } from './lib/notesApi';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { useNotes } from './hooks/useNotes';

// Import new advanced components
import VersionIndicator from './components/VersionIndicator';
import SuggestionDropdown from './components/SuggestionDropdown';
import VersionTimeline from './components/VersionTimeline';
import DiffViewer from './components/DiffViewer';
import TranslationModal from './components/TranslationModal';
import AIAssistantButton from './components/AIAssistantButton';

function SmartNotePageContent() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { fetchNotes } = useNotes();
  const [originalText, setOriginalText] = useState("");
  const [command, setCommand] = useState("");
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    type: null,
    message: "",
    retryable: false
  });
  const [retryCount, setRetryCount] = useState(0);
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  
  // Refs for scroll targets
  const historyRef = useRef<HTMLDivElement>(null);
  const diffViewerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Enhanced loading state with progress
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Diff syncing state
  const [diffScrollTop, setDiffScrollTop] = useState(0);
  
  // Agent feedback state
  const [currentAgentInfo, setCurrentAgentInfo] = useState<AgentInfo | null>(null);

  // New advanced features state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestionDropdown, setShowSuggestionDropdown] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionPosition, setSuggestionPosition] = useState({ x: 0, y: 0 });
  
  // Version management state
  const [currentVersion, setCurrentVersion] = useState(1);
  const [totalVersions, setTotalVersions] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showVersionTimeline, setShowVersionTimeline] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [diffMode, setDiffMode] = useState<'inline' | 'side-by-side'>('side-by-side');
  const [compareVersions, setCompareVersions] = useState({ 
    v1Uuid: '550e8400-e29b-41d4-a716-446655440000', 
    v2Uuid: '550e8400-e29b-41d4-a716-446655440001' 
  });
  
  // Auto-save state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30000); // 30 seconds
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Translation state
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  
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

    // Load editing note from localStorage (when coming from My Notes)
    const editingNoteData = localStorage.getItem('editingNote');
    if (editingNoteData) {
      try {
        const noteData = JSON.parse(editingNoteData);
        setEditingNote(noteData);
        setOriginalText(noteData.content || '');
        setUserTags(noteData.tags?.filter((tag: string) => tag !== 'ai-generated') || []);
        setIsFavorite(noteData.is_favorite || false);
        setNoteTitle(noteData.title || '');
        
        // Fetch version information for existing note
        const fetchVersionInfo = async () => {
          try {
            const response = await apiClient.get(`/api/v1/notes/${noteData.id}/versions`);
            console.log('API Response:', response.data); // Debug log
            
            // Use the total field if available, otherwise count versions array
            const versionCount = response.data.total || response.data.versions?.length || 0;
            
            if (versionCount > 0) {
              setTotalVersions(versionCount);
              setCurrentVersion(versionCount); // Set to latest version
              console.log(`✅ Loaded ${versionCount} versions for note ${noteData.id}`);
            }
          } catch (error) {
            console.error('Failed to fetch version info:', error);
          }
        };
        
        fetchVersionInfo();
        localStorage.removeItem('editingNote');
      } catch (error) {
        console.error('Failed to parse editing note:', error);
      }
    }
  }, []);

  // Track if user has made AI transformations
  const [hasAIResult, setHasAIResult] = useState(false);

  // Advanced features handlers
  const handleVersionSelect = async (versionId: string) => {
    console.log('Selected version:', versionId);
  };

  const handleVersionRestore = async (versionId: string) => {
    if (!editingNote) return;
    
    try {
      const response = await apiClient.post(`/api/v1/notes/${editingNote.id}/restore/${versionId}`);
      
      if (response.status === 200) {
        // Fetch the updated note to get the restored content
        const noteResponse = await apiClient.get(`/api/v1/notes/${editingNote.id}`);
        if (noteResponse.data) {
          setOriginalText(noteResponse.data.content);
          // Update the current version count
          setTotalVersions(prev => prev + 1);
          setCurrentVersion(totalVersions + 1);
          setShowVersionTimeline(false);
          // Show success message
          alert('Version restored successfully!');
        }
      }
    } catch (error) {
      console.error('Version restore failed:', error);
      alert('Failed to restore version. Please try again.');
    }
  };

  const createAutoSaveVersion = async () => {
    if (!editingNote || !hasUnsavedChanges || !autoSaveEnabled) {
      return;
    }
    
    try {
      // Update note content first
      await apiClient.put(`/api/v1/notes/${editingNote.id}`, {
        content: editedText,
        title: noteTitle || editingNote.title
      });
      
      // Then create version
      await apiClient.post(`/api/v1/notes/${editingNote.id}/versions`, {
        change_description: 'Auto-save'
      });
      setTotalVersions(prev => prev + 1);
      setCurrentVersion(prev => prev + 1);
      setLastAutoSave(new Date());
      setHasUnsavedChanges(false);
      console.log('💾 Auto-save completed at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleTranslationResult = (translatedText: string, targetLang: string) => {
    setEditedText(translatedText);
    setHasAIResult(true);
  };

  const handleAISuggestion = (suggestion: string) => {
    setEditedText(suggestion);
    setHasAIResult(true);
  };

  const handleSuggestionSelect = (suggestionText: string) => {
    const textBefore = originalText.substring(0, cursorPosition);
    const textAfter = originalText.substring(cursorPosition);
    const newText = textBefore + suggestionText + textAfter;
    
    setOriginalText(newText);
    setShowSuggestionDropdown(false);
    setCursorPosition(cursorPosition + suggestionText.length);
  };

  const handleSuggestionClose = () => {
    setShowSuggestionDropdown(false);
  };

  // Sync original text to edited text if no AI result exists
  useEffect(() => {
    if (!hasAIResult) {
      setEditedText(originalText);
    }
    // Reset AI result flag when original text is cleared
    if (!originalText) {
      setHasAIResult(false);
    }
  }, [originalText, hasAIResult]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(originalText !== editedText && hasAIResult);
  }, [originalText, editedText, hasAIResult]);

  // Auto-save functionality with debounced timer
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || !editingNote) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      createAutoSaveVersion();
    }, autoSaveInterval);

    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, editingNote, autoSaveEnabled, autoSaveInterval]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSuggestionDropdown) {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            setSelectedSuggestionIndex(prev => 
              prev > 0 ? prev - 1 : suggestions.length - 1
            );
            break;
          case 'ArrowDown':
            e.preventDefault();
            setSelectedSuggestionIndex(prev => 
              prev < suggestions.length - 1 ? prev + 1 : 0
            );
            break;
          case 'Enter':
            e.preventDefault();
            if (suggestions[selectedSuggestionIndex]) {
              handleSuggestionSelect(suggestions[selectedSuggestionIndex].text);
            }
            break;
          case 'Escape':
            e.preventDefault();
            handleSuggestionClose();
            break;
        }
      } else {
        // Global shortcuts
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'h':
              e.preventDefault();
              setShowHistory(!showHistory);
              break;
            case 't':
              if (e.shiftKey) {
                e.preventDefault();
                setShowTranslationModal(true);
              }
              break;
            case 'k':
              if (e.shiftKey) {
                e.preventDefault();
                setShowVersionTimeline(!showVersionTimeline);
              }
              break;
            case 'd':
              if (e.shiftKey) {
                e.preventDefault();
                setShowDiffViewer(!showDiffViewer);
              }
              break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestionDropdown, selectedSuggestionIndex, suggestions, showHistory, showVersionTimeline, showDiffViewer]);

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
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const endpoint = isSummarization ? 
        `${baseUrl}/summarize` : 
        isTransformation ?
        `${baseUrl}/api/v1/transform` :
        `${baseUrl}/prompt`;
      
      const res = await apiClient.post(endpoint, {
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
        setHasAIResult(true); // Mark that we now have an AI result
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

  const handleSaveAsNote = () => {
    // Redirect to notes page with note content to save
    if (editedText) {
      const noteData = {
        content: editedText,
        originalText: originalText,
        command: command,
        userTags: userTags,
        editingNote: editingNote, // Include editing note for update
        isFavorite: isFavorite,
        noteTitle: noteTitle,
        hasAIResult: hasAIResult // Track if AI was actually used
      };
      
      localStorage.setItem('pendingNote', JSON.stringify(noteData));
      
      if (editingNote) {
        window.location.href = '/notes?action=update';
      } else {
        window.location.href = '/notes?action=save';
      }
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

  // Handle manual edits to result text
  const handleEditedTextChange = (newText: string) => {
    setEditedText(newText);
    // If user manually edits the result, mark as having AI result to prevent auto-sync
    if (newText !== originalText) {
      setHasAIResult(true);
    }
  };

  // Export/Import handlers for AI Editor
  const handleQuickExport = async (format: 'markdown' | 'txt' | 'pdf', exportNotes: any[]) => {
    if (!user) {
      alert('Please sign in to export notes');
      return;
    }
    
    try {
      const noteIds = exportNotes.map(note => note.id);
      await NotesAPI.quickExport(format, noteIds);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleImportFiles = async (files: FileList) => {
    if (!user) {
      alert('Please sign in to import notes');
      return;
    }
    
    try {
      const stats = await NotesAPI.importNotes(files);
      
      if (stats.imported > 0) {
        // If exactly one note was imported (regardless of how many files were attempted), load it into AI Editor
        if (stats.imported === 1) {
          try {
            // Fetch the latest notes to find the newly imported note
            const notesResponse = await NotesAPI.getNotes({ page: 1, per_page: stats.imported });
            if (notesResponse.notes && notesResponse.notes.length > 0) {
              const importedNote = notesResponse.notes[0]; // Most recent note
              
              // Load the imported note into AI Editor
              setEditingNote(importedNote);
              setOriginalText(importedNote.content || '');
              setUserTags(importedNote.tags?.filter((tag: string) => tag !== 'ai-generated') || []);
              setIsFavorite(importedNote.is_favorite || false);
              setNoteTitle(importedNote.title || '');
              setHasAIResult(false); // Reset AI result flag
              
              const failedMsg = stats.failed > 0 ? ` (${stats.failed} failed)` : '';
              alert(`Successfully imported "${importedNote.title}" - now ready for editing!${failedMsg}`);
            } else {
              alert(`Successfully imported ${stats.imported} note(s)`);
            }
          } catch (fetchError) {
            console.error('Failed to fetch imported note:', fetchError);
            alert(`Successfully imported ${stats.imported} note(s), but couldn't load into editor`);
          }
        } else {
          // Multiple notes imported - just show summary and let user go to My Notes
          const failedMsg = stats.failed > 0 ? `. ${stats.failed} failed.` : '';
          alert(`Successfully imported ${stats.imported} of ${stats.total} notes${failedMsg} Check My Notes to view them.`);
        }
      } else {
        alert(`Import failed. ${stats.failed} of ${stats.total} files could not be imported.`);
      }
      
      fetchNotes(); // Refresh notes
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
    }
  };

  // Quick export current text as note (client-side export)  
  const handleExportCurrentText = async (format: 'markdown' | 'txt' | 'pdf') => {
    if (!originalText.trim() && !editedText.trim()) {
      alert('No text to export. Please write something first.');
      return;
    }
    
    const content = editedText || originalText;
    const finalTitle = noteTitle.trim() || `AI Editor Export - ${new Date().toLocaleDateString()}`;
    
    try {
      if (format === 'pdf') {
        // PDF export requires backend - first save as note, then export
        const confirmed = confirm('PDF export requires saving the note first. Do you want to continue?');
        if (!confirmed) return;
        
        // Save note first
        const tempNote = await NotesAPI.createNote({
          title: finalTitle,
          content,
          tags: ['ai-editor-export', ...userTags],
          is_favorite: isFavorite
        });
        
        if (tempNote) {
          // Then export as PDF
          await NotesAPI.exportSingleNote(tempNote.id, 'pdf');
          alert(`Successfully exported "${finalTitle}" as PDF`);
        } else {
          throw new Error('Failed to create note for PDF export');
        }
        return;
      }
      
      // Client-side export for markdown and txt
      const fileExtension = format === 'markdown' ? 'md' : 'txt';
      const fileName = `${finalTitle.replace(/[^a-zA-Z0-9-_\s]/g, '')}.${fileExtension}`;
      
      // Prepare content based on format
      let exportContent = content;
      if (format === 'markdown') {
        // Add title as markdown header
        exportContent = `# ${finalTitle}\n\n${content}`;
        
        // Add metadata if available
        if (userTags.length > 0) {
          exportContent += `\n\n---\n**Tags:** ${userTags.join(', ')}`;
        }
        exportContent += `\n\n*Exported from ChatNotePad.AI on ${new Date().toLocaleString()}*`;
      }
      
      // Create and download file
      const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert(`Successfully exported "${finalTitle}" as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export current text failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Diff syncing functions
  const handleEditorScroll = (scrollTop: number) => {

     
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

  // Başlık ve Sign In butonu için renk değişkeni (sadece light modda mor)
  const mainColor = isDarkMode ? "text-gray-900 dark:text-white" : "text-purple-700";
  const signInBtnColor = isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white text-purple-700 border border-purple-700 hover:bg-purple-50";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        {/* Header */}
        <header className="w-full py-6 px-4 flex flex-col bg-white/80 dark:bg-gray-900/80 shadow-md">
          <div className="w-full flex items-center mb-2">
            <h1 className={`text-2xl font-bold tracking-tight ${mainColor}`}>ChatNotePad.AI</h1>
            
            {/* Version Indicator (only show when editing a note) */}
            {editingNote && (
              <div className="ml-4">
                <VersionIndicator
                  currentVersion={currentVersion}
                  totalVersions={totalVersions}
                  hasUnsavedChanges={hasUnsavedChanges}
                  autoSaveEnabled={autoSaveEnabled}
                  lastAutoSave={lastAutoSave}
                  onVersionTimelineClick={() => setShowVersionTimeline(true)}
                />
              </div>
            )}
            
            <div className="flex-1 flex justify-end space-x-3">
              {/* AI Assistant Button */}
              <AIAssistantButton
                currentText={originalText}
                cursorPosition={cursorPosition}
                onSuggestion={handleAISuggestion}
                onTranslate={() => setShowTranslationModal(true)}
                disabled={!originalText.trim()}
              />
              
              {/* Auth Status Debug */}
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                {user ? (
                  <span className="text-green-600 dark:text-green-400">✓ Authenticated</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">⚠ Guest Mode</span>
                )}
              </div>

              {/* Quick Test Buttons for Advanced Features */}
              <div className="flex items-center space-x-2 border-l border-gray-300 dark:border-gray-600 pl-3">
                <button
                  onClick={async () => {
                    if (!editingNote) {
                      alert('No note selected for versioning');
                      return;
                    }
                    const description = prompt('Version description (optional):', 'Manual save point');
                    if (description !== null) {
                      try {
                        // Update note content first
                        await apiClient.put(`/api/v1/notes/${editingNote.id}`, {
                          content: editedText,
                          title: noteTitle || editingNote.title
                        });
                        
                        // Then create version
                        await apiClient.post(`/api/v1/notes/${editingNote.id}/versions`, {
                          change_description: description || 'Manual save point'
                        });
                        setTotalVersions(prev => prev + 1);
                        setCurrentVersion(prev => prev + 1);
                        setHasUnsavedChanges(false);
                        alert('✅ New version created successfully!');
                      } catch (error) {
                        console.error('Version creation failed:', error);
                        alert('❌ Failed to create version');
                      }
                    }
                  }}
                  disabled={!editingNote}
                  className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Create New Version"
                >
                  💾 Save Ver.
                </button>
                <div className="relative flex items-center space-x-1">
                  <button
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    className={`px-2 py-1 text-xs rounded-l transition-colors ${
                      autoSaveEnabled 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title={`Auto-save ${autoSaveEnabled ? 'enabled' : 'disabled'} (${autoSaveInterval/1000}s interval)${lastAutoSave ? ` - Last: ${lastAutoSave.toLocaleTimeString()}` : ''}`}
                  >
                    🔄 Auto {autoSaveEnabled ? 'ON' : 'OFF'}
                  </button>
                  <select
                    value={autoSaveInterval}
                    onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                    disabled={!autoSaveEnabled}
                    className={`px-1 py-1 text-xs rounded-r border-l border-gray-300 dark:border-gray-600 transition-colors ${
                      autoSaveEnabled 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    } disabled:opacity-50`}
                    title="Auto-save interval"
                  >
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                    <option value={60000}>1m</option>
                    <option value={300000}>5m</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowVersionTimeline(true)}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  title="Version Timeline (Ctrl+Shift+K)"
                >
                  Versions
                </button>
                <button
                  onClick={() => setShowDiffViewer(true)}
                  disabled={!editingNote}
                  className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Diff Viewer (Ctrl+Shift+D)"
                >
                  Diff
                </button>
                <button
                  onClick={() => {
                    // Simulate suggestions for testing
                    const mockSuggestions = [
                      { id: '1', text: 'Improve this sentence structure', type: 'style', confidence: 0.9, description: 'Enhance readability' },
                      { id: '2', text: 'Add more details here', type: 'content', confidence: 0.8, description: 'Expand content' },
                      { id: '3', text: 'Make this more formal', type: 'style', confidence: 0.85, description: 'Professional tone' }
                    ];
                    setSuggestions(mockSuggestions);
                    setSelectedSuggestionIndex(0);
                    setSuggestionPosition({ x: 400, y: 200 });
                    setShowSuggestionDropdown(true);
                  }}
                  disabled={!originalText.trim()}
                  className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Test AI Suggestions"
                >
                  Suggestions
                </button>
              </div>
              
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
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* Quick Import/Export for AI Editor */}
                  <ImportButton
                    onImport={handleImportFiles}
                    variant="minimal"
                    showLabel={false}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  />
                  
                  <div className="relative">
                    <button
                      onClick={() => handleExportCurrentText('markdown')}
                      disabled={!originalText.trim() && !editedText.trim()}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Export current text as Markdown"
                    >
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                  
                  <a
                    href="/notes"
                    className="px-3 py-2 text-sm rounded-lg font-medium transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    My Notes
                  </a>
                  <UserProfileDropdown />
                </div>
              ) : (
                <a
                  href="/auth"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${signInBtnColor}`}
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
          <div className="w-full max-w-xl pl-0 mt-1">
            <p className="text-gray-600 dark:text-gray-300 text-left text-sm">
              AI-powered note editing and transformation. Write your note, enter a natural language command, and see the changes instantly with live diff!
              {!user && (
                <span className="block mt-2 text-xs opacity-75">
                  Using as guest. <a href="/auth" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</a> to save notes permanently.
                </span>
              )}
            </p>
          </div>
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
            onCursorChange={setCursorPosition}
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
            onSaveAsNote={handleSaveAsNote}
            onTextChange={handleEditedTextChange}
            userTags={userTags}
            onTagsChange={setUserTags}
            editingNote={editingNote}
            isSignedIn={!!user}
            isFavorite={isFavorite}
            onToggleFavorite={setIsFavorite}
            noteTitle={noteTitle}
            onTitleChange={setNoteTitle}
          />
        </div>
      </main>

      {/* Advanced Features Components */}
      
      {/* AI Suggestion Dropdown */}
      <SuggestionDropdown
        isVisible={showSuggestionDropdown}
        suggestions={suggestions}
        selectedIndex={selectedSuggestionIndex}
        onSelect={handleSuggestionSelect}
        onClose={handleSuggestionClose}
        position={suggestionPosition}
      />

      {/* Version Timeline */}
      {editingNote && (
        <VersionTimeline
          noteId={editingNote.id}
          onVersionSelect={handleVersionSelect}
          onRestoreVersion={handleVersionRestore}
          isOpen={showVersionTimeline}
          onClose={() => setShowVersionTimeline(false)}
        />
      )}

      {/* Diff Viewer */}
      {showDiffViewer && editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Version Comparison</h2>
              <button
                onClick={() => setShowDiffViewer(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <DiffViewer
                noteId={editingNote.id}
                version1Uuid={compareVersions.v1Uuid}
                version2Uuid={compareVersions.v2Uuid}
                mode={diffMode}
                onModeChange={setDiffMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Translation Modal */}
      <TranslationModal
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        sourceText={originalText}
        onTranslated={handleTranslationResult}
      />

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