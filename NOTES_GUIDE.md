# 📝 Notes Management System - User Guide

## 🚀 Getting Started

### Accessing Notes
- Click **"My Notes"** in the header navigation
- Or visit `/notes` directly in your browser

## 📖 How to Use

### Creating a New Note

1. **Click "New Note" button** (top-right corner)
2. **Fill in the details:**
   - **Title**: Enter your note title
   - **Content**: Write using Monaco Editor (Markdown supported)
   - **Tags**: Add comma-separated tags (e.g., "work, important, todo")
   - **Favorite**: Toggle star to mark as favorite
3. **Save your note:**
   - Press `Ctrl+S` (keyboard shortcut)
   - Or click "Save" button
   - Press `Esc` to cancel

### Editing Existing Notes

1. **Click "Edit" button** on any note card
2. **Make your changes** in the editor
3. **Save with `Ctrl+S`** or "Save" button

### Quick Actions

- **⭐ Toggle Favorite**: Click the heart icon
- **🗑️ Delete**: Click trash icon (confirmation required)
- **📋 Copy**: Copy note content to clipboard

## 🔍 Search & Filter

### Real-time Search
- Type in the search box
- Auto-search after 300ms delay
- Searches both title and content

### Tag Filtering
- Select tags in the Tag Manager
- Notes filter automatically
- Multiple tag selection supported

### Favorite Filter
- Toggle "Show Favorites Only"
- View only starred notes

## 🎯 Key Features

### ✅ Core Functionality
- **Complete CRUD Operations**: Create, Read, Update, Delete notes
- **Monaco Editor Integration**: Professional code editor for note content
- **Markdown Support**: Write formatted notes with Markdown syntax
- **Tag System**: Organize notes with autocomplete tag suggestions
- **Favorite System**: Mark important notes for quick access
- **Real-time Search**: Instant search with 300ms debouncing
- **Pagination**: 12 notes per page with navigation controls

### ✅ User Experience
- **Dark Mode Support**: All components support theme switching
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Shortcuts**: `Ctrl+S` to save, `Esc` to cancel
- **Loading States**: Progress indicators throughout the app
- **Error Handling**: User-friendly error messages
- **Delete Confirmations**: Safety prompts for destructive actions

### ✅ Technical Features
- **JWT Authentication**: Secure API access
- **TypeScript Support**: Type-safe development
- **React Hooks**: Modern React patterns (useNotes, useSearch, useTags)
- **API Integration**: Full backend integration with error handling
- **Auto-token Management**: Automatic JWT refresh

## 📱 Interface Overview

### Notes List View
```
┌─────────────────────────────────────────┐
│ My Notes                    [New Note]  │
├─────────────────────────────────────────┤
│ [Search Box]        [Tag Filters]      │
├─────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐                │
│ │Note1│ │Note2│ │Note3│                │
│ │ ⭐  │ │     │ │ ⭐  │                │
│ └─────┘ └─────┘ └─────┘                │
│                                         │
│ [Previous] [1] [2] [3] [Next]          │
└─────────────────────────────────────────┘
```

### Note Editor View
```
┌─────────────────────────────────────────┐
│ Title: [________________]               │
│                                         │
│ Content:                                │
│ ┌─────────────────────────────────────┐ │
│ │ Monaco Editor                       │ │
│ │ - Line numbers                      │ │
│ │ - Syntax highlighting              │ │
│ │ - Markdown support                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Tags: [work, important]                 │
│ Favorite: [ ⭐ ]                       │
│                                         │
│ [Save] [Cancel]                         │
└─────────────────────────────────────────┘
```

## 🎯 Usage Examples

### Example 1: Work Notes
```
Title: "Sprint Planning Meeting"
Tags: "work, sprint, planning"
Content:
# Sprint Goals
- Implement user authentication
- Add note management system
- Deploy to production

## Action Items
- [ ] Review user stories
- [ ] Estimate tasks
- [ ] Plan sprint timeline
```

### Example 2: Code Snippets
```
Title: "React Hook Examples"
Tags: "code, react, hooks"
Content:
```javascript
// Custom hook for notes
const useNotes = () => {
  const [notes, setNotes] = useState([]);
  // ... hook logic
};
```

### Example 3: Research Notes
```
Title: "API Documentation Research"
Tags: "research, api, documentation"
Content:
## REST API Endpoints
- GET /api/notes - List all notes
- POST /api/notes - Create new note
- PUT /api/notes/:id - Update note
```

## 🔧 Backend Requirements

Your backend should implement these endpoints:

```http
GET    /api/v1/notes              # List notes (paginated)
POST   /api/v1/notes              # Create note
GET    /api/v1/notes/{id}         # Get note
PUT    /api/v1/notes/{id}         # Update note
DELETE /api/v1/notes/{id}         # Delete note
GET    /api/v1/notes/search       # Search notes
GET    /api/v1/notes/favorites    # Get favorites
GET    /api/v1/notes/tags         # Get user tags
```

## 🛡️ Security

- All requests require `Authorization: Bearer <jwt_token>` header
- Users can only access their own notes
- Automatic token refresh on expiration
- Secure logout on authentication errors

## 💡 Tips & Tricks

1. **Use Tags Effectively**: Create consistent tag naming conventions
2. **Markdown Power**: Leverage Markdown for formatted notes
3. **Search Optimization**: Use descriptive titles for better search results
4. **Keyboard Shortcuts**: `Ctrl+S` for quick saving
5. **Favorites**: Star important notes for quick access
6. **Mobile Usage**: Responsive design works great on phones

This notes system provides a powerful, user-friendly way to organize and manage your thoughts, code snippets, and important information! 🎉