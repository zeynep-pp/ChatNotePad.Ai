"use client";

import { useState, useEffect } from 'react';
import { Note, NoteFilters } from '../../types/notes';
import { NoteCard } from './NoteCard';
import { useNotes } from '../../hooks/useNotes';

interface NoteListProps {
  filters?: NoteFilters;
  onNoteSelect?: (note: Note) => void;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => Promise<void>;
  onToggleFavorite?: (note: Note) => Promise<void>;
  selectedNoteId?: string;
  className?: string;
  showSelection?: boolean;
  selectedNotes?: Note[];
  onSelectionChange?: (selectedNotes: Note[]) => void;
}

export const NoteList = ({ 
  filters = {}, 
  onNoteSelect, 
  onEdit,
  onDelete,
  onToggleFavorite,
  selectedNoteId,
  className = '',
  showSelection = false,
  selectedNotes = [],
  onSelectionChange
}: NoteListProps) => {
  const {
    notes,
    loading,
    error,
    pagination,
    fetchNotes,
    clearError,
  } = useNotes();

  const [currentPage, setCurrentPage] = useState(1);

  // Fetch notes when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: 12,
      ...filters,
    };
    fetchNotes(params);
  }, [filters, currentPage, fetchNotes]);

  const handleNoteView = (note: Note) => {
    if (onNoteSelect) {
      onNoteSelect(note);
    }
  };

  const handleNoteEdit = (note: Note) => {
    if (onEdit) {
      onEdit(note);
    }
  };

  const handleNoteDelete = async (id: string) => {
    if (onDelete) {
      await onDelete(id);
    }
  };

  const handleToggleFavoriteAdapter = async (id: string, is_favorite: boolean) => {
    const note = notes.find(n => n.id === id);
    if (note && onToggleFavorite) {
      await onToggleFavorite({ ...note, is_favorite });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNoteSelection = (note: Note, selected: boolean) => {
    if (!onSelectionChange) return;
    
    let newSelection;
    if (selected) {
      newSelection = [...selectedNotes, note];
    } else {
      newSelection = selectedNotes.filter(n => n.id !== note.id);
    }
    onSelectionChange(newSelection);
  };

  const isNoteSelected = (noteId: string) => {
    return selectedNotes.some(note => note.id === noteId);
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-l-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm border-t border-b border-gray-300 dark:border-gray-600 transition-colors duration-200 ${
            i === currentPage
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < pagination.pages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-r-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Next
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-0 mt-8">
        {pages}
      </div>
    );
  };

  if (loading && notes.length === 0) {
    return (
      <div className={`${className} flex justify-center items-center py-12`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex justify-center items-center py-12`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={clearError}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className={`${className} flex justify-center items-center py-12`}>
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No notes found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            {Object.keys(filters).length > 0 ? 'Try adjusting your filters' : 'Create your first note to get started'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={handleNoteEdit}
            onDelete={handleNoteDelete}
            onToggleFavorite={handleToggleFavoriteAdapter}
            onView={handleNoteView}
            isSelected={showSelection ? isNoteSelected(note.id) : selectedNoteId === note.id}
            showSelection={showSelection}
            onSelect={handleNoteSelection}
          />
        ))}
      </div>

      {/* Loading overlay for pagination */}
      {loading && notes.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Results info */}
      {notes.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          Showing {((currentPage - 1) * pagination.per_page) + 1} to {Math.min(currentPage * pagination.per_page, pagination.total)} of {pagination.total} notes
        </div>
      )}
    </div>
  );
};