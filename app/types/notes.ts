export interface Note {
  id: string;
  title: string;
  content: string;
  is_favorite: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface NoteCreate {
  title: string;
  content?: string;
  is_favorite?: boolean;
  tags?: string[];
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  is_favorite?: boolean;
  tags?: string[];
}

export interface NoteListResponse {
  notes: Note[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface NoteSearchResponse {
  notes: Note[];
  total: number;
  query: string;
}

export interface NoteListParams {
  page?: number;
  per_page?: number;
  is_favorite?: boolean;
  tags?: string[];
}

export interface NoteSearchParams {
  query: string;
  page?: number;
  per_page?: number;
}

export interface TagsResponse {
  tags: string[];
  total: number;
}

export interface NoteFilters {
  is_favorite?: boolean;
  tags?: string[];
  search?: string;
}

export interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  currentNote: Note | null;
  filters: NoteFilters;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
  searchQuery: string;
  searchResults: Note[];
  tags: string[];
}