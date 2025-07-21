import { useState, useEffect, useCallback } from 'react';
import { NotesAPI } from '../lib/notesApi';
import { Note, NoteCreate, NoteUpdate, NoteListParams, NotesState } from '../types/notes';

export const useNotes = () => {
  const [state, setState] = useState<NotesState>({
    notes: [],
    loading: false,
    error: null,
    currentNote: null,
    filters: {},
    pagination: {
      page: 1,
      per_page: 20,
      total: 0,
      pages: 0,
    },
    searchQuery: '',
    searchResults: [],
    tags: [],
  });

  const fetchNotes = useCallback(async (params: NoteListParams = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await NotesAPI.getNotes(params);
      setState(prev => ({
        ...prev,
        notes: response.notes,
        pagination: {
          page: response.page,
          per_page: response.per_page,
          total: response.total,
          pages: response.pages,
        },
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch notes',
      }));
    }
  }, []);

  const fetchNote = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const note = await NotesAPI.getNote(id);
      setState(prev => ({
        ...prev,
        currentNote: note,
        loading: false,
      }));
      return note;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch note',
      }));
      return null;
    }
  }, []);

  const createNote = useCallback(async (noteData: NoteCreate) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newNote = await NotesAPI.createNote(noteData);
      setState(prev => ({
        ...prev,
        notes: [newNote, ...prev.notes],
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total + 1,
        },
        loading: false,
      }));
      return newNote;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to create note',
      }));
      return null;
    }
  }, []);

  const updateNote = useCallback(async (id: string, noteData: NoteUpdate) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedNote = await NotesAPI.updateNote(id, noteData);
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note => 
          note.id === id ? updatedNote : note
        ),
        currentNote: prev.currentNote?.id === id ? updatedNote : prev.currentNote,
        loading: false,
      }));
      return updatedNote;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update note',
      }));
      return null;
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await NotesAPI.deleteNote(id);
      setState(prev => ({
        ...prev,
        notes: prev.notes.filter(note => note.id !== id),
        currentNote: prev.currentNote?.id === id ? null : prev.currentNote,
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total - 1,
        },
        loading: false,
      }));
      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to delete note',
      }));
      return false;
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string, is_favorite: boolean) => {
    try {
      const updatedNote = await NotesAPI.toggleFavorite(id, is_favorite);
      setState(prev => ({
        ...prev,
        notes: prev.notes.map(note => 
          note.id === id ? updatedNote : note
        ),
        currentNote: prev.currentNote?.id === id ? updatedNote : prev.currentNote,
      }));
      return updatedNote;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to toggle favorite',
      }));
      return null;
    }
  }, []);

  const setFilters = useCallback((filters: Partial<NotesState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshNotes = useCallback(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Load initial data - only if authenticated
  useEffect(() => {
    // Don't fetch notes for guest users
    const { AuthAPI } = require('../lib/auth');
    if (AuthAPI.isAuthenticated()) {
      fetchNotes();
    }
  }, []); // Boş dependency array

  return {
    ...state,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    setFilters,
    clearError,
    refreshNotes,
  };
};