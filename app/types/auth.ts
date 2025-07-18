export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  full_name: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  auto_save: boolean;
  font_size: number;
  line_height: number;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  preferences: UserPreferences | null;
  errorType?: string;
  unverifiedEmail?: string;
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  deleteAccount: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

export interface AuthError {
  message: string;
  code?: string;
  details?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  refresh_token?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: AuthToken;
}