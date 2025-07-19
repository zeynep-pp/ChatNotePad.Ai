import { useState, useEffect, useCallback } from 'react';
import { NotesAPI } from '../lib/notesApi';

interface TagsState {
  tags: string[];
  loading: boolean;
  error: string | null;
}

export const useTags = () => {
  const [state, setState] = useState<TagsState>({
    tags: [],
    loading: false,
    error: null,
  });

  const fetchTags = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await NotesAPI.getTags();
      setState(prev => ({
        ...prev,
        tags: response.tags,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch tags',
      }));
    }
  }, []);

  const addTag = useCallback((tag: string) => {
    if (tag.trim() && !state.tags.includes(tag.trim())) {
      setState(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    }
  }, [state.tags]);

  const removeTag = useCallback((tag: string) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshTags = useCallback(() => {
    fetchTags();
  }, [fetchTags]);

  // Load initial data
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    ...state,
    fetchTags,
    addTag,
    removeTag,
    clearError,
    refreshTags,
  };
};