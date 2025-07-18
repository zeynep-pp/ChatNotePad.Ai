# Authentication Setup Guide

This guide explains how to set up and use the Supabase authentication system that has been integrated into your ChatNotePad.Ai application.

## Features Added

✅ **Authentication System**
- User registration and login with email/password
- JWT token management with automatic refresh
- Secure cookie-based token storage
- Protected routes for authenticated users

✅ **User Interface**
- Login/signup forms with validation
- User profile dropdown in header
- Settings page for user preferences
- Theme toggle (light/dark mode)

✅ **Security Features**
- Automatic token refresh on 401 errors
- Request interceptors for auth headers
- Protected route wrapper
- Secure logout functionality

## File Structure

```
app/
├── auth/
│   ├── page.tsx                    # Authentication page (login/signup)
│   ├── confirm-email/
│   │   └── page.tsx                # Email confirmation page
│   └── reset-password/
│       └── page.tsx                # Password reset page
├── components/
│   ├── auth/                       # Authentication components
│   │   ├── LoginForm.tsx           # Login form component
│   │   ├── SignUpForm.tsx          # Sign up form component
│   │   ├── ProtectedRoute.tsx      # Protected route wrapper
│   │   ├── UserProfileDropdown.tsx # User profile dropdown
│   │   ├── EmailVerificationModal.tsx # Email verification modal
│   │   ├── PasswordResetForm.tsx   # Password reset form
│   │   ├── PasswordUpdateForm.tsx  # Password update form
│   │   ├── EmailConfirmationRedirect.tsx # Email confirmation redirect
│   │   └── PasswordResetRedirect.tsx # Password reset redirect
│   ├── TextEditor.tsx              # Monaco editor
│   ├── ResultsPanel.tsx            # Results display
│   ├── ChatInterface.tsx           # Chat interface
│   ├── ConfirmationModal.tsx       # Confirmation modal
│   └── Toast.tsx                   # Toast notifications
├── contexts/
│   └── AuthContext.tsx             # Authentication context/provider
├── lib/
│   ├── auth.ts                     # Authentication API functions
│   └── authInterceptor.ts          # Axios interceptors for auth
├── settings/
│   └── page.tsx                    # User settings page
└── types/
    └── auth.ts                     # TypeScript interfaces for auth
```

## Environment Setup

1. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the environment variables:
   ```env
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # Supabase Configuration (Optional - for future use)
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Backend Requirements

Your backend should implement these endpoints:

### Authentication Endpoints

```typescript
// User registration
POST /auth/signup
Body: { email: string, password: string, full_name?: string }
Response: { user: UserProfile, token: AuthToken }

// User login
POST /auth/signin
Body: { email: string, password: string }
Response: { user: UserProfile, token: AuthToken }

// Get current user
GET /auth/me
Headers: { Authorization: "Bearer <token>" }
Response: { user: UserProfile }

// Get user preferences
GET /auth/preferences
Headers: { Authorization: "Bearer <token>" }
Response: { preferences: UserPreferences }

// Update user preferences
PUT /auth/preferences
Headers: { Authorization: "Bearer <token>" }
Body: { theme?: string, language?: string, auto_save?: boolean, ... }
Response: { preferences: UserPreferences }

// Refresh token
POST /auth/refresh
Headers: { Authorization: "Bearer <token>" }
Response: { user: UserProfile, token: AuthToken }
```

### Data Structures

```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
}

interface AuthToken {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  refresh_token?: string;
}

interface AuthResponse {
  user: UserProfile;
  token: AuthToken;
}
```

### Protected Endpoints

All existing endpoints (`/prompt`, `/summarize`, `/api/v1/transform`) now automatically include authentication headers when a user is logged in.

## Usage

### 1. Authentication Flow

- Users are redirected to `/auth` if not authenticated
- After successful login/signup, they're redirected to the main app
- Authentication state persists across page reloads
- Tokens are automatically refreshed when they expire

### 2. Protected Routes

Wrap any page that requires authentication:

```tsx
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <YourPageContent />
    </ProtectedRoute>
  );
}
```

### 3. Using Authentication in Components

```tsx
import { useAuth } from '../contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      Welcome, {user?.name || user?.email}!
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### 4. User Settings

Users can access their settings at `/settings` to:
- Change theme (light/dark/system)
- Update language preferences
- Toggle auto-save
- Adjust font size and line height

## API Integration

The authentication system automatically adds Bearer tokens to all API requests. The main application's API calls in `page.tsx` have been updated to include authentication headers.

## Error Handling

- 401 errors trigger automatic token refresh
- Failed refresh attempts redirect to login
- Network errors are handled gracefully
- Form validation prevents invalid submissions

## Security Notes

- JWT tokens are stored in secure HTTP-only cookies
- Tokens are automatically refreshed before expiration
- All API requests include authentication headers
- Protected routes require valid authentication
- Logout clears all authentication data

## Next Steps

1. Implement the backend authentication endpoints
2. Test the authentication flow
3. Customize the user interface to match your design
4. Add additional user preferences as needed
5. Implement proper error monitoring and logging

## Dependencies Added

```json
{
  "@supabase/supabase-js": "^2.51.0",
  "@hookform/resolvers": "^5.1.1",
  "js-cookie": "^3.0.5",
  "react-hook-form": "^7.60.0",
  "yup": "^1.6.1",
  "@types/js-cookie": "^3.0.6"
}
```

The authentication system is now fully integrated and ready to use with your backend API!