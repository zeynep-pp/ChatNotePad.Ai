"use client";

import { useState } from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { NoteList } from '../components/notes/NoteList';
import { NoteEditor } from '../components/notes/NoteEditor';
import { SearchBar } from '../components/notes/SearchBar';
import { TagManager } from '../components/notes/TagManager';
import { useNotes } from '../hooks/useNotes';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileDropdown } from '../components/auth/UserProfileDropdown';
import { Note, NoteCreate, NoteUpdate } from '../types/notes';

export default function NotesPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const { createNote, updateNote, deleteNote, toggleFavorite } = useNotes();

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsEditing(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
  };

  const handleSaveNote = async (noteData: NoteCreate | NoteUpdate) => {
    try {
      if (selectedNote) {
        // Update existing note
        await updateNote(selectedNote.id, noteData as NoteUpdate);
      } else {
        // Create new note
        await createNote(noteData as NoteCreate);
      }
      setIsEditing(false);
      setSelectedNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setIsEditing(false);
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedNote(null);
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
  if (!isAuthenticated || !user) {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="w-full py-6 px-4 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 shadow-md">
          <div className="w-full max-w-6xl flex justify-between items-center mb-4">
            <div className="flex-1">
              <a
                href="/"
                className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                AI Editor
              </a>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">ChatNotePad.AI</h1>
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Notes
              </h2>
              <button
                onClick={handleCreateNote}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Note
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <SearchBar
                  onQueryChange={setSearchQuery}
                  placeholder="Search notes..."
                />
              </div>
              <div>
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
          {isEditing ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <NoteEditor
                note={selectedNote || undefined}
                onSave={handleSaveNote}
                onCancel={handleCancelEdit}
              />
            </div>
          ) : (
            <NoteList
              onNoteSelect={setSelectedNote}
              filters={{
                search: searchQuery,
                tags: selectedTags,
                is_favorite: showFavorites || undefined,
              }}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </div>
      </div>
  );
}