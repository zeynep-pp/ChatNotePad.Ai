"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { NoteList } from '../components/notes/NoteList';
import { SearchBar } from '../components/notes/SearchBar';
import { SearchResultsList } from '../components/notes/SearchResultsList';
import { TagManager } from '../components/notes/TagManager';
import { ExportModal } from '../components/notes/ExportModal';
import { ImportModal } from '../components/notes/ImportModal';
import { useNotes } from '../hooks/useNotes';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileDropdown } from '../components/auth/UserProfileDropdown';
import { NotesAPI } from '../lib/notesApi';
import { Note } from '../types/notes';

function NotesPageContent() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const { createNote, updateNote, deleteNote, toggleFavorite, notes, fetchNotes } = useNotes();

  // Handle saving/updating pending note from AI Editor
  useEffect(() => {
    const action = searchParams.get('action');
    if ((action === 'save' || action === 'update') && user) {
      const pendingNoteData = localStorage.getItem('pendingNote');
      if (pendingNoteData) {
        try {
          const pendingNote = JSON.parse(pendingNoteData);
          if (action === 'update') {
            handleUpdatePendingNote(pendingNote);
          } else {
            handleSavePendingNote(pendingNote);
          }
          localStorage.removeItem('pendingNote');
        } catch (error) {
          console.error('Error parsing pending note:', error);
        }
      }
    }
  }, [user, searchParams]);

  const handleSavePendingNote = async (noteData: any) => {
    try {
      // Only add ai-generated tag if AI was actually used
      const baseTags = noteData.userTags || [];
      const allTags = noteData.hasAIResult ? ['ai-generated', ...baseTags] : baseTags;
      
      const finalTitle = noteData.noteTitle?.trim() || `Note from AI Editor - ${new Date().toLocaleDateString()}`;
      
      await createNote({
        title: finalTitle,
        content: noteData.content,
        tags: allTags,
        is_favorite: noteData.isFavorite || false
      });
      // Refresh the page to show the new note
      window.location.href = '/notes';
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleUpdatePendingNote = async (noteData: any) => {
    try {
      if (!noteData.editingNote?.id) {
        console.error('No note ID for update');
        return;
      }

      // Handle ai-generated tag logic for updates
      const originalTags = noteData.editingNote.tags || [];
      const hadAiGenerated = originalTags.includes('ai-generated');
      const userTags = noteData.userTags || [];
      
      let allTags;
      if (noteData.hasAIResult) {
        // New AI processing was done, ensure ai-generated tag is present
        allTags = ['ai-generated', ...userTags.filter((tag: string) => tag !== 'ai-generated')];
      } else if (hadAiGenerated) {
        // No new AI processing, but had ai-generated before - keep it
        allTags = ['ai-generated', ...userTags.filter((tag: string) => tag !== 'ai-generated')];
      } else {
        // No AI processing and didn't have ai-generated before - just user tags
        allTags = userTags;
      }
      
      const updateData: any = {
        content: noteData.content,
        tags: allTags,
        is_favorite: noteData.isFavorite !== undefined ? noteData.isFavorite : noteData.editingNote.is_favorite
      };
      
      // Only update title if user provided a custom title
      if (noteData.noteTitle?.trim()) {
        updateData.title = noteData.noteTitle.trim();
      }
      
      await updateNote(noteData.editingNote.id, updateData);
      
      // Refresh the page to show the updated note
      window.location.href = '/notes';
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleEditNote = (note: Note) => {
    // Navigate to AI Editor with the note content
    localStorage.setItem('editingNote', JSON.stringify(note));
    window.location.href = '/';
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleToggleFavorite = async (note: Note) => {
    try {
      await toggleFavorite(note.id, !note.is_favorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Export/Import handlers
  const handleQuickExport = async (format: 'markdown' | 'txt' | 'pdf', exportNotes: Note[]) => {
    try {
      setIsExportLoading(true);
      const noteIds = exportNotes.map(note => note.id);
      await NotesAPI.quickExport(format, noteIds);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExportLoading(false);
    }
  };

  const handleImportFiles = async (files: FileList) => {
    try {
      setIsExportLoading(true);
      const stats = await NotesAPI.importNotes(files);
      alert(`Successfully imported ${stats.imported} of ${stats.total} notes`);
      fetchNotes(); // Refresh the notes list
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
    } finally {
      setIsExportLoading(false);
    }
  };

  const handleImportComplete = (stats: { imported: number; total: number; failed: number }) => {
    alert(`Successfully imported ${stats.imported} of ${stats.total} notes`);
    fetchNotes(); // Refresh the notes list
    setShowImportModal(false);
  };


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Login kontrolü
  if (!loading && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign in to access your notes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be signed in to create and manage your personal notes.
          </p>
          <div className="space-y-3">
            <a
              href="/auth"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Sign In / Sign Up
            </a>
            <div>
              <a
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                ← Back to AI Editor
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Başlık ve Sign In butonu için renk değişkeni (sadece light modda mor)
  const mainColor = isDarkMode ? "text-gray-900 dark:text-white" : "text-purple-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="w-full py-6 px-4 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 shadow-md">
          <div className="w-full max-w-6xl flex justify-between items-center mb-4">
            <div className="flex-1">
              <a
                href="/"
                className="inline-flex items-center text-black dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                AI Editor
              </a>
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${mainColor}`}>ChatNotePad.AI</h1>
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
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-3xl font-bold tracking-tight ${mainColor}`}>
                My Notes
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Create new notes using the <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">AI Editor</a>
              </div>
            </div>

            {/* Import/Export Actions */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions:
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {notes ? notes.length : 0} total notes
                  {selectedNotes.length > 0 && ` • ${selectedNotes.length} selected`}
                </div>
                
                {/* Selection Mode Toggle */}
                <button
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    if (isSelectionMode) {
                      setSelectedNotes([]);
                    }
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    isSelectionMode
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {isSelectionMode ? 'Exit Selection' : 'Select Notes'}
                </button>
                
                {/* Selection Controls */}
                {isSelectionMode && notes && notes.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedNotes(notes)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                      onClick={() => setSelectedNotes([])}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Advanced Import */}
                <button
                  onClick={() => setShowImportModal(true)}
                  disabled={isExportLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Notes
                </button>
                
                {/* Advanced Export */}
                <button
                  onClick={() => setShowExportModal(true)}
                  disabled={isExportLoading || !notes || notes.length === 0}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Notes
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-2/3">
                <SearchBar
                  onQueryChange={(query) => {
                    setSearchQuery(query);
                    // Clear search results when query is cleared
                    if (!query.trim()) {
                      setSearchResults(null);
                    }
                  }}
                  onResults={(results) => {
                    setSearchResults(results);
                  }}
                  placeholder="Search notes..."
                />
              </div>
              <div className="w-full md:w-1/3">
                <TagManager
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  showFavoriteFilter={true}
                  onFavoriteFilterChange={setShowFavorites}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          {searchQuery.trim() && searchResults !== null ? (
            <SearchResultsList
              results={searchResults}
              onNoteSelect={setSelectedNote}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <NoteList
              onNoteSelect={setSelectedNote}
              filters={{
                tags: selectedTags,
                is_favorite: showFavorites || undefined,
              }}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
              showSelection={isSelectionMode}
              selectedNotes={selectedNotes}
              onSelectionChange={setSelectedNotes}
            />
          )}
        </div>

        {/* Modals */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          notes={notes || []}
          selectedNotes={selectedNotes}
          title="Export Your Notes"
        />

        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
          title="Import Notes"
        />
      </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <NotesPageContent />
    </Suspense>
  );
}