"use client";

import { Note } from '../../types/notes';
import { NoteCard } from './NoteCard';

interface SearchResultsListProps {
  results: Note[];
  onNoteSelect?: (note: Note) => void;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => Promise<void>;
  onToggleFavorite?: (note: Note) => Promise<void>;
  selectedNoteId?: string;
  className?: string;
}

export const SearchResultsList = ({ 
  results,
  onNoteSelect, 
  onEdit,
  onDelete,
  onToggleFavorite,
  selectedNoteId,
  className = ''
}: SearchResultsListProps) => {

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
    const note = results.find(n => n.id === id);
    if (note && onToggleFavorite) {
      await onToggleFavorite({ ...note, is_favorite });
    }
  };

  if (results.length === 0) {
    return (
      <div className={`${className} flex justify-center items-center py-12`}>
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No search results found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Try searching with different keywords
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search results header */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-blue-800 dark:text-blue-300 font-medium">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={handleNoteEdit}
            onDelete={handleNoteDelete}
            onToggleFavorite={handleToggleFavoriteAdapter}
            onView={handleNoteView}
            isSelected={selectedNoteId === note.id}
          />
        ))}
      </div>
    </div>
  );
};