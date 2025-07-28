# Advanced Features Integration Example

This document shows how to integrate the new advanced frontend components into your ChatNotePad.AI application.

## Components Overview

### High Priority Components (Phase 1)
- **VersionIndicator** - Shows current version, unsaved changes, and auto-save status
- **SuggestionDropdown** - AI-powered content suggestions with keyboard navigation
- **CommandHistoryPanel** - Enhanced history viewing with search and filters
- **AIAssistantButton** - Quick access to AI features

### Medium Priority Components (Phase 2)
- **VersionTimeline** - Full version management with restore capabilities
- **DiffViewer** - Side-by-side version comparison using react-diff-viewer
- **TranslationModal** - Multi-language translation interface

## Integration Example

Here's how to integrate these components into your main page component:

```typescript
// app/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from 'lodash'; // You may need to install lodash
import { ErrorState, CommandHistoryItem, AgentInfo } from './types';

// Import new components
import VersionIndicator from './components/VersionIndicator';
import SuggestionDropdown from './components/SuggestionDropdown';
import VersionTimeline from './components/VersionTimeline';
import DiffViewer from './components/DiffViewer';
import TranslationModal from './components/TranslationModal';
import AIAssistantButton from './components/AIAssistantButton';
import CommandStatsCard from './components/CommandStatsCard';

// Enhanced interface for suggestions
interface Suggestion {
  id: string;
  text: string;
  type: 'content' | 'command' | 'style';
  confidence: number;
  description?: string;
}

function SmartNotePageContent() {
  // ... existing state ...
  
  // New state for advanced features
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  const [compareVersions, setCompareVersions] = useState({ v1: 1, v2: 2 });
  
  // Translation state
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  
  // Stats state
  const [statsTimeRange, setStatsTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Auto-suggestion logic with debouncing
  const handleTextChange = useCallback(
    debounce(async (text: string, position: number) => {
      if (text.length > 10) {
        const context = text.substring(Math.max(0, position - 50), position + 50);
        try {
          const response = await fetch('/api/v1/ai/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              context: context,
              text: text,
              cursor_position: position,
              context_type: 'content'
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            const mappedSuggestions: Suggestion[] = data.suggestions.map((s: any, index: number) => ({
              id: `suggestion-${index}`,
              text: s.text,
              type: s.type || 'content',
              confidence: s.confidence || 0.8,
              description: s.description
            }));
            
            setSuggestions(mappedSuggestions);
            setSelectedSuggestionIndex(0);
            
            // Calculate suggestion position based on cursor
            const rect = document.getElementById('main-editor')?.getBoundingClientRect();
            if (rect) {
              setSuggestionPosition({
                x: rect.left + 20,
                y: rect.top + 40
              });
            }
            
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Suggestion error:', error);
        }
      } else {
        setShowSuggestions(false);
      }
    }, 500),
    []
  );

  // Version management functions
  const handleVersionSelect = async (versionId: string) => {
    // Implementation for version selection
    console.log('Selected version:', versionId);
  };

  const handleVersionRestore = async (versionId: string) => {
    try {
      const response = await fetch(`/api/v1/notes/${editingNote?.id}/versions/${versionId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOriginalText(data.content);
        setCurrentVersion(data.version_number);
        setShowVersionTimeline(false);
        // Show success message
      }
    } catch (error) {
      console.error('Version restore failed:', error);
    }
  };

  // Translation handlers
  const handleTranslationResult = (translatedText: string, targetLang: string) => {
    // You can choose to replace or insert the translated text
    setEditedText(translatedText);
    setHasAIResult(true);
  };

  // AI Assistant handlers
  const handleAISuggestion = (suggestion: string) => {
    setEditedText(suggestion);
    setHasAIResult(true);
  };

  // Suggestion selection handlers
  const handleSuggestionSelect = (suggestionText: string) => {
    const textBefore = originalText.substring(0, cursorPosition);
    const textAfter = originalText.substring(cursorPosition);
    const newText = textBefore + suggestionText + textAfter;
    
    setOriginalText(newText);
    setShowSuggestions(false);
    setCursorPosition(cursorPosition + suggestionText.length);
  };

  const handleSuggestionClose = () => {
    setShowSuggestions(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSuggestions) {
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
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, selectedSuggestionIndex, suggestions, showHistory, showVersionTimeline]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(originalText !== editedText && hasAIResult);
  }, [originalText, editedText, hasAIResult]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Enhanced Header with Version Indicator and AI Assistant */}
      <header className="w-full py-6 px-4 flex flex-col bg-white/80 dark:bg-gray-900/80 shadow-md">
        <div className="w-full flex items-center mb-2">
          <h1 className={`text-2xl font-bold tracking-tight ${mainColor}`}>ChatNotePad.AI</h1>
          
          {/* Version Indicator */}
          {editingNote && (
            <div className="ml-4">
              <VersionIndicator
                currentVersion={currentVersion}
                totalVersions={totalVersions}
                hasUnsavedChanges={hasUnsavedChanges}
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
            
            {/* Existing buttons... */}
            <button onClick={toggleTheme}>...</button>
            {user ? <UserProfileDropdown /> : <a href="/auth">Sign In</a>}
          </div>
        </div>
      </header>

      {/* Main Content with Enhanced Editor */}
      <main className="flex-1 w-full px-4 py-4">
        <div className="w-full max-w-full flex flex-col lg:flex-row gap-4 mb-32">
          {/* Left Side - Editor and Stats */}
          <div className="flex-1 space-y-4">
            <TextEditor
              id="main-editor"
              ref={editorRef}
              value={originalText}
              onChange={(text) => {
                setOriginalText(text);
                handleTextChange(text, cursorPosition);
              }}
              onCursorChange={setCursorPosition}
              onScroll={handleEditorScroll}
              isDarkMode={isDarkMode}
            />
            
            {/* Command Stats Card */}
            <CommandStatsCard
              timeRange={statsTimeRange}
              onTimeRangeChange={setStatsTimeRange}
              commandHistory={commandHistory}
            />
          </div>

          {/* Right Side - Results and Diff Viewer */}
          <div className="flex-1 space-y-4">
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
            
            {/* Diff Viewer */}
            {showDiffViewer && editingNote && (
              <DiffViewer
                noteId={editingNote.id}
                version1={compareVersions.v1}
                version2={compareVersions.v2}
                mode={diffMode}
                onModeChange={setDiffMode}
              />
            )}
          </div>
        </div>
      </main>

      {/* Chat Interface - Enhanced with suggestion integration */}
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

      {/* AI Suggestion Dropdown */}
      <SuggestionDropdown
        isVisible={showSuggestions}
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

      {/* Translation Modal */}
      <TranslationModal
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        sourceText={originalText}
        onTranslated={handleTranslationResult}
      />
    </div>
  );
}

export default function SmartNotePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SmartNotePageContent />
    </Suspense>
  );
}
```

## Required Dependencies

Make sure you have these dependencies installed:

```bash
npm install lodash @types/lodash
# react-diff-viewer is already installed in your package.json
```

## API Endpoints

Ensure your backend supports these new endpoints:

```
POST /api/v1/ai/suggest - AI content suggestions
POST /api/v1/ai/detect-language - Language detection
POST /api/v1/ai/translate - Text translation
POST /api/v1/ai/improve-style - Style improvement
POST /api/v1/ai/quick-summary - Quick summarization
POST /api/v1/ai/expand-text - Text expansion

GET /api/v1/notes/{id}/versions - List note versions
GET /api/v1/notes/{id}/versions/{versionId} - Get specific version
POST /api/v1/notes/{id}/versions/{versionId}/restore - Restore version
```

## Keyboard Shortcuts

- `Ctrl+H` - Toggle command history
- `Ctrl+Shift+T` - Open translation modal
- `Ctrl+Shift+K` - Toggle version timeline
- `Ctrl+Space` - Trigger AI suggestions
- `Arrow Keys` - Navigate suggestions
- `Enter` - Select suggestion
- `Escape` - Close modals/dropdowns

## Styling Notes

All components use Tailwind CSS classes and support dark mode through the `dark:` prefix. They automatically adapt to your existing theme context.

## Performance Considerations

1. **Debounced API Calls**: Suggestions are debounced to prevent excessive API calls
2. **Virtualization**: Consider implementing virtualization for large version lists
3. **Caching**: Implement caching for frequently accessed versions
4. **Lazy Loading**: Components are loaded only when needed

This integration provides a comprehensive advanced note-taking experience with AI-powered features, version control, and multi-language support while maintaining excellent performance and user experience.