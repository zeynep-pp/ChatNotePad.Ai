import { apiClient } from './api';
import { 
  Note, 
  NoteCreate, 
  NoteUpdate, 
  NoteListResponse, 
  NoteSearchResponse, 
  NoteListParams, 
  NoteSearchParams, 
  TagsResponse 
} from '../types/notes';

export class NotesAPI {
  static async getNotes(params: NoteListParams = {}): Promise<NoteListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params.is_favorite !== undefined) searchParams.append('is_favorite', params.is_favorite.toString());
    if (params.tags && params.tags.length > 0) {
      searchParams.append('tags', JSON.stringify(params.tags));
    }
    
    const queryString = searchParams.toString();
    const url = queryString ? `/notes?${queryString}` : '/notes';
    
    return await apiClient.get<NoteListResponse>(url);
  }

  static async getNote(id: string): Promise<Note> {
    return await apiClient.get<Note>(`/notes/${id}`);
  }

  static async createNote(note: NoteCreate): Promise<Note> {
    return await apiClient.post<Note>('/notes', note);
  }

  static async updateNote(id: string, note: NoteUpdate): Promise<Note> {
    return await apiClient.put<Note>(`/notes/${id}`, note);
  }

  static async deleteNote(id: string): Promise<void> {
    await apiClient.delete(`/notes/${id}`);
  }

  static async searchNotes(params: NoteSearchParams): Promise<NoteSearchResponse> {
    const searchParams = new URLSearchParams();
    
    searchParams.append('query', params.query);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.per_page) searchParams.append('per_page', params.per_page.toString());
    
    return await apiClient.get<NoteSearchResponse>(`/notes/search?${searchParams.toString()}`);
  }

  static async getFavoriteNotes(): Promise<NoteListResponse> {
    return await apiClient.get<NoteListResponse>('/notes/favorites');
  }

  static async getTags(): Promise<TagsResponse> {
    return await apiClient.get<TagsResponse>('/notes/tags');
  }

  static async toggleFavorite(id: string, is_favorite: boolean): Promise<Note> {
    return await apiClient.put<Note>(`/notes/${id}`, { is_favorite });
  }
}