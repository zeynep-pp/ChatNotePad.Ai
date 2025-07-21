"use client";

import { useState } from 'react';
import { Note } from '../../types/notes';
import { formatDistanceToNow } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, is_favorite: boolean) => void;
  onView: (note: Note) => void;
  isSelected?: boolean;
  onSelect?: (note: Note, selected: boolean) => void;
  showSelection?: boolean;
}

export const NoteCard = ({ 
  note, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onView,
  isSelected = false,
  onSelect,
  showSelection = false
}: NoteCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isDarkMode } = useTheme();

  // Tag colors matching send button style
  const tagStyle = isDarkMode 
    ? "bg-blue-600 text-white" 
    : "bg-white text-purple-700 border border-purple-700";
  
  const aiGeneratedTagStyle = isDarkMode
    ? "bg-purple-600 text-white"
    : "bg-purple-600 text-white";

  const handleDelete = () => {
    onDelete(note.id);
    setShowDeleteConfirm(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(note.id, !note.is_favorite);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(note);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(note, e.target.checked);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg border ${
        isSelected 
          ? 'border-blue-500 dark:border-blue-400' 
          : 'border-gray-200 dark:border-gray-700'
      } shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-4`}
      onClick={() => onView(note)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2 flex-1 mr-2">
          {/* Selection checkbox */}
          {showSelection && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {note.title}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          {/* Favorite button */}
          <button
            onClick={handleToggleFavorite}
            className={`p-1 rounded transition-colors duration-200 ${
              note.is_favorite 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-4 h-4" fill={note.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          
          {/* Edit button */}
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
            title="Edit note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
            title="Delete note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content preview */}
      {note.content && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed">
          {truncateContent(note.content)}
        </p>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className={`px-2 py-1 text-xs rounded font-medium ${
                tag === 'ai-generated' ? aiGeneratedTagStyle : tagStyle
              }`}
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              +{note.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>{formatDistanceToNow(new Date(note.updated_at))}</span>
        <span>{formatDistanceToNow(new Date(note.created_at))} ago</span>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Note
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};