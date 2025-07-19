import { useState, useEffect, useCallback } from 'react';
import { NotesAPI } from '../lib/notesApi';
import { Note, NoteSearchParams } from '../types/notes';

interface SearchState {
  query: string;
  results: Note[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
}

export const useSearch = (debounceMs: number = 300) => {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    loading: false,
    error: null,
    hasSearched: false,
  });

  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(state.query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [state.query, debounceMs]);

  const searchNotes = useCallback(async (params: NoteSearchParams) => {
    if (!params.query.trim()) {
      setState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: null,
        hasSearched: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await NotesAPI.searchNotes(params);
      setState(prev => ({
        ...prev,
        results: response.notes,
        loading: false,
        hasSearched: true,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Search failed',
        hasSearched: true,
      }));
    }
  }, []);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchNotes({ query: debouncedQuery });
    } else {
      setState(prev => ({
        ...prev,
        results: [],
        hasSearched: false,
      }));
    }
  }, [debouncedQuery, searchNotes]);

  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
  }, []);

  const clearSearch = useCallback(() => {
    setState({
      query: '',
      results: [],
      loading: false,
      error: null,
      hasSearched: false,
    });
    setDebouncedQuery('');
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    setQuery,
    searchNotes,
    clearSearch,
    clearError,
  };
};