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

// Helper function to get the correct backend URL
const getBackendUrl = (endpoint: string) => {
  return `http://localhost:8000/api/v1${endpoint}`;
};

export interface ExportRequest {
  note_ids: string[];
  format: 'markdown' | 'txt' | 'pdf';
  export_mode: 'single' | 'selected' | 'all';
}

export interface ImportStats {
  total: number;
  imported: number;
  failed: number;
  errors: string[];
}

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

  static async exportSingleNote(noteId: string, format: 'markdown' | 'txt' | 'pdf'): Promise<void> {
    const { AuthAPI } = await import('./auth');
    const token = AuthAPI.getToken();
    
    const response = await fetch(getBackendUrl(`/export/${format}/${noteId}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 
                    `note.${format === 'markdown' ? 'md' : format}`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  static async exportBulkNotes(noteIds: string[], format: 'markdown' | 'txt'): Promise<void> {
    const { AuthAPI } = await import('./auth');
    const token = AuthAPI.getToken();
    
    const response = await fetch(getBackendUrl(`/export/bulk?format=${format}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        note_ids: noteIds,
        format: format
      }),
    });

    if (!response.ok) {
      throw new Error(`Bulk export failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 
                    `notes_export.${format === 'markdown' ? 'md' : 'txt'}`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  static async importFile(file: File): Promise<ImportStats> {
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file: Expected a File object');
    }
    
    const { AuthAPI } = await import('./auth');
    const token = AuthAPI.getToken();
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(getBackendUrl('/import/file'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || `Import failed: ${response.statusText}`);
    }

    return {
      total: result.total_count,
      imported: result.imported_count,
      failed: result.total_count - result.imported_count,
      errors: result.errors || []
    };
  }

  static async importNotes(files: FileList): Promise<ImportStats> {
    if (!files || files.length === 0) {
      throw new Error('No files provided for import');
    }

    let totalStats: ImportStats = {
      total: 0,
      imported: 0,
      failed: 0,
      errors: []
    };

    // Import files one by one since backend expects single file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) {
        totalStats.total += 1;
        totalStats.failed += 1;
        totalStats.errors.push(`File at index ${i} is undefined`);
        continue;
      }
      
      try {
        const stats = await this.importFile(file);
        totalStats.total += stats.total;
        totalStats.imported += stats.imported;
        totalStats.failed += stats.failed;
        totalStats.errors.push(...stats.errors);
      } catch (error) {
        totalStats.total += 1;
        totalStats.failed += 1;
        totalStats.errors.push(`${files[i].name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return totalStats;
  }

  static async quickExport(format: 'markdown' | 'txt' | 'pdf', noteIds: string[]): Promise<void> {
    try {
      if (noteIds.length === 1) {
        // Single note export
        await this.exportSingleNote(noteIds[0], format);
      } else {
        // Bulk export (only markdown and txt supported)
        if (format === 'pdf') {
          throw new Error('PDF export is only available for single notes');
        }
        await this.exportBulkNotes(noteIds, format as 'markdown' | 'txt');
      }
    } catch (error) {
      console.error('Quick export failed:', error);
      throw error;
    }
  }

  static async validateImportFile(file: File): Promise<{valid: boolean; total_notes: number; preview: any[]; errors: string[]}> {
    const { AuthAPI } = await import('./auth');
    const token = AuthAPI.getToken();
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(getBackendUrl('/import/validate'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Validation failed');
    }

    return await response.json();
  }
}