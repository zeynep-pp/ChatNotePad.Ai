# ChatNotePad.Ai

ChatNotePad.Ai is a modern, AI-powered note-taking application that allows users to edit and transform their notes using natural language commands. The application features a clean, responsive UI with live diff visualization and supports both text editing and summarization capabilities.

## 🔗 Backend Integration

The backend for ChatNotePad.Ai should be a FastAPI application that provides the following endpoints:
- `/prompt` - For text editing and transformation
- `/summarize` - For text summarization
- `/api/v1/transform` - For advanced LLM transformations (formalization, simplification, tone shift)

### Export/Import Endpoints 🆕
- `POST /api/v1/export/notes` - Export notes in various formats (Markdown, TXT, PDF)
- `POST /api/v1/import/notes` - Import notes from uploaded files (Markdown, TXT, JSON)

### Authentication Endpoints
- `POST /auth/signup` - User registration with email verification
- `POST /auth/signin` - User login
- `POST /auth/confirm-email` - Email confirmation handling
- `POST /auth/reset-password` - Password reset request
- `POST /auth/update-password` - Password update with token
- `POST /auth/resend-verification` - Resend email verification
- `GET /auth/me` - Get current user profile
- `DELETE /auth/me` - Delete user account
- `GET /auth/preferences` - Get user preferences
- `PUT /auth/preferences` - Update user preferences

For a complete backend implementation example, see the [Chat-Notepad-Core](https://github.com/zeynep-pp/Chat-Notepad-Core) repository.

## ✨ Features

### Core Features
- **Monaco Editor:** Advanced code editor with syntax highlighting and markdown support
- **Live Diff Viewer:** Real-time visualization of text changes with additions in green and deletions in red
- **Natural Language Processing:** Transform text using plain English commands
- **Text Summarization:** AI-powered text summarization feature
- **Theme Support:** Beautiful light and dark mode with smooth transitions
- **Responsive Design:** Works seamlessly on desktop and mobile devices
- **User Authentication:** Complete Supabase-based authentication with email verification
- **User Profiles:** User management with preferences and settings
- **Protected Routes:** Secure access to application features

### Smart Commands
- **Text Editing:** "Remove all commas", "Replace 'and' with 'or'", "Capitalize first letter"
- **Formatting:** "Convert to uppercase", "Add bullet points", "Remove extra spaces"
- **AI Features:** "Summarize this text", "Make it more formal"
- **Advanced LLM Transformations:** "Simplify this text for beginners", "Add professional tone", "Make this more casual"

## 🖥️ UI Layout

- **Left Panel:** Original note editor (Monaco-based with line numbers)
- **Right Panel:** Processed text results and live diff comparison
- **Bottom Chat Interface:** Natural language command input with suggestions
- **Header:** App title and theme toggle button

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 15** (App Router)
- **TailwindCSS v4** (utility-first styling)
- **Monaco Editor** (`@monaco-editor/react`)
- **react-diff-viewer** (diff visualization)
- **axios** (API communication)
- **Supabase** (authentication and user management)
- **react-hook-form** (form validation)
- **yup** (schema validation)

### Backend Requirements
Your FastAPI backend should include:
- **FastAPI** with Pydantic models
- **Multi-agent architecture** (text editor + summarizer agents)
- **AI/LLM integration** (OpenAI, Anthropic, etc.)
- **Async request handling**
- **Supabase integration** (authentication, user management)
- **JWT token validation**
- **Email confirmation handling**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, pnpm, or yarn
- Python FastAPI backend (see backend integration section)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ChatNotePad.Ai
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

### Backend Setup
Ensure your FastAPI backend is running on `http://localhost:8000` with the following endpoints:

```python
@app.post("/prompt")
async def process_text(request: TextRequest):
    # Handle text editing commands
    return {"result": processed_text}

@app.post("/summarize") 
async def summarize_text(request: TextRequest):
    # Handle summarization requests
    return {"result": summary}

@app.post("/api/v1/transform")
async def transform_text(request: TransformRequest):
    # Handle advanced text transformations
    return {
        "result": transformed_text,
        "success": True,
        "agent_used": "transformer",
        "agent_info": {
            "model": "text-transformation-agent",
            "processing_time_ms": 1250,
            "tokens_used": 450,
            "confidence_score": 0.95,
            "transformation_type": "formalization"
        }
    }
```

## 📝 Usage Examples

### Text Editing Commands
1. **Write your note** in the left panel (supports Markdown)
2. **Enter a command** in the chat input:
   - `"Remove all commas from this text"`
   - `"Replace every instance of 'and' with 'or'"`
   - `"Capitalize the first letter of each sentence"`
   - `"Convert this to bullet points"`

### Summarization
1. **Paste long text** in the editor
2. **Use summarization commands**:
   - `"Summarize this text"`
   - `"Give me a brief summary"`
   - `"Create a concise summary"`

### Advanced LLM Transformations 🆕
The application now includes powerful text transformation capabilities powered by the TransformerAgent:

#### Quick Transform Actions
- **📋 Make Formal:** Converts casual text to professional, business-appropriate language
- **📖 Simplify:** Transforms complex text into simple, beginner-friendly language
- **😊 Make Casual:** Converts formal text to friendly, conversational tone
- **💼 Professional:** Adds professional tone while maintaining clarity

#### Transformation Commands
1. **Formalization:**
   - `"Make this more formal"`
   - `"Convert to professional language"`
   - `"Add business tone"`
   - `"Make this official"`

2. **Simplification:**
   - `"Simplify this text for beginners"`
   - `"Make this easier to understand"`
   - `"Convert to layman terms"`
   - `"Simplify the language"`

3. **Tone Shifting:**
   - `"Make this more casual"`
   - `"Add friendly tone"`
   - `"Make this conversational"`
   - `"Make this sound more confident"`

#### Visual Feedback
- **Transformation Type Badges:** Color-coded badges showing the type of transformation performed
- **Confidence Indicators:** Visual confidence scores with color coding:
  - 🟢 Green: ≥90% confidence (High quality)
  - 🟡 Yellow: 70-89% confidence (Good quality)
  - 🔴 Red: <70% confidence (Review recommended)
- **Agent Information:** Displays processing time, tokens used, and transformation metadata

### Live Diff Viewing
- Changes are highlighted in real-time
- **Green:** Added text
- **Red:** Removed text
- **Copy button:** Copy the result to clipboard

### Export/Import Features 🆕
The application now includes comprehensive note export and import capabilities:

#### Export Options
1. **Quick Export Dropdown:**
   - Instant export as Markdown (.md), Plain Text (.txt), or PDF
   - Export all notes or selected notes
   - One-click download with automatic file naming

2. **Advanced Export Modal:**
   - Choose export format with visual format descriptions
   - Select export mode (all notes vs selected notes)
   - Progress tracking with percentage indicator
   - Success/error notifications with detailed feedback

#### Import Options
1. **Quick Import Button:**
   - Multiple variants (primary, secondary, minimal)
   - Direct file selection for immediate import
   - Supports .md, .txt, and .json files

2. **Advanced Import Modal:**
   - Drag-and-drop file upload area
   - File validation with visual feedback (valid/invalid indicators)
   - Multiple file import with preview
   - Import progress tracking and statistics
   - Detailed error reporting for failed imports

3. **Import Area (Empty State):**
   - Large drag-and-drop zone when no notes exist
   - File format information and size limits
   - Prominent call-to-action for first-time users

#### Usage Examples
```typescript
// Quick export via dropdown
<ExportDropdown
  notes={allNotes}
  selectedNotes={selectedNotes}
  onExport={(format, notes) => handleQuickExport(format, notes)}
/>

// Advanced export modal
<ExportModal
  isOpen={showExportModal}
  onClose={() => setShowExportModal(false)}
  notes={allNotes}
  selectedNotes={selectedNotes}
/>

// Import functionality
<ImportButton
  onImport={(files) => handleFileImport(files)}
  variant="primary"
/>
```

## 🛡️ Error Handling & Recovery

The application now includes comprehensive error handling for a better user experience:

### Automatic Error Detection
- **Empty Command Validation:** Prevents submission of empty or too-short commands
- **Missing Text Detection:** Alerts when trying to process without input text
- **Network Error Handling:** Detects connection issues with the backend
- **Server Error Classification:** Categorizes different types of server errors

### Error Types & Messages
1. **Connection Errors:**
   - `"Unable to connect to the AI server"`
   - Suggests checking if backend is running on localhost:8000

2. **Invalid Commands:**
   - `"Command too short. Please provide a more detailed instruction"`
   - Provides example commands like "Make it more formal"

3. **Server Errors:**
   - `"Server error occurred while processing your command"`
   - Offers retry options with automatic attempt tracking

4. **Rate Limiting:**
   - `"Too many requests. Please wait a moment"`
   - Explains rate limiting and suggests waiting

### Recovery Features
- **Automatic Retry:** Up to 3 retry attempts for recoverable errors
- **Smart Error Clearing:** Errors automatically clear when user starts typing
- **Quick Fix Suggestions:** Context-specific solutions for each error type
- **Graceful Degradation:** App remains functional even when backend is unavailable

### Testing Error Scenarios
To test the error handling system:

1. **Invalid Command Test:**
   ```
   1. Leave the text editor empty
   2. Try to submit a command
   3. See "Missing Text" error with suggestions
   ```

2. **Connection Error Test:**
   ```
   1. Stop your backend server
   2. Try to process text
   3. See "Connection Error" with troubleshooting tips
   ```

3. **Short Command Test:**
   ```
   1. Enter text in the editor
   2. Type a very short command like "hi"
   3. See "Invalid Command" error with examples
   ```

4. **Recovery Test:**
   ```
   1. Trigger any error
   2. Start typing a new command
   3. Watch error automatically clear
   4. Use retry button for network errors
   ```

## 🔧 Configuration

### TailwindCSS v4+ Setup
This project uses the latest TailwindCSS v4 configuration:

**postcss.config.js:**
```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**app/globals.css:**
```css
@import "tailwindcss";
```

### Environment Variables
Create a `.env.local` file for any environment-specific settings:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🛠️ Troubleshooting

### Common Issues

**Dependency Conflicts:**
Always use the `--legacy-peer-deps` flag when installing:
```bash
npm install --legacy-peer-deps
```

**Backend Connection:**
Ensure your FastAPI backend is running on port 8000 and has CORS enabled:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## 🔐 Authentication System

### Supabase Integration
The application uses Supabase for authentication with the following features:

- **Email/Password Authentication:** Secure user registration and login
- **Email Verification:** Required email confirmation for new accounts
- **Password Reset:** Email-based password reset functionality
- **Protected Routes:** Automatic redirection for unauthenticated users
- **User Profiles:** Complete user management with preferences
- **Session Management:** Automatic token refresh and logout

### Authentication Flow
1. **Sign Up:** User registers with email/password
2. **Email Verification:** Confirmation email sent via Supabase
3. **Email Confirmation:** User clicks link to verify email
4. **Sign In:** User can now log in with verified credentials
5. **Protected Access:** Access to main application features

### Authentication Components
Located in `/app/components/auth/`:
- `LoginForm.tsx` - User login interface
- `SignUpForm.tsx` - User registration with validation
- `PasswordResetForm.tsx` - Password reset request
- `PasswordUpdateForm.tsx` - Password update with token
- `EmailVerificationModal.tsx` - Email verification prompts
- `ProtectedRoute.tsx` - Route protection wrapper
- `UserProfileDropdown.tsx` - User profile and settings

### Authentication Context
The `AuthContext` provides:
- User state management
- Authentication methods (signUp, signIn, signOut)
- Error handling and user feedback
- Automatic session management

## 📦 Project Structure

```
ChatNotePad.Ai/
├── app/
│   ├── auth/                     # Authentication pages
│   │   ├── page.tsx             # Login/signup page
│   │   ├── confirm-email/       # Email confirmation
│   │   └── reset-password/      # Password reset
│   ├── components/
│   │   ├── auth/                # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ...
│   │   ├── notes/               # Notes management components
│   │   │   ├── ExportModal.tsx  # Export modal with format selection
│   │   │   ├── ImportModal.tsx  # Import modal with drag-and-drop
│   │   │   ├── ExportDropdown.tsx # Quick export dropdown
│   │   │   ├── ImportButton.tsx # Import button and area components
│   │   │   ├── NotesPageIntegration.tsx # Complete integration example
│   │   │   ├── NoteList.tsx
│   │   │   ├── NoteCard.tsx
│   │   │   └── ...
│   │   ├── TextEditor.tsx       # Monaco editor
│   │   ├── ResultsPanel.tsx     # Results display
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── lib/
│   │   ├── auth.ts              # Authentication API
│   │   └── authInterceptor.ts   # Axios interceptors
│   ├── types/
│   │   └── auth.ts              # Authentication types
│   ├── settings/                # User settings page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main application
│   └── globals.css              # Global styles
├── public/
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── README.md
```

## 🎨 Features in Detail

### Monaco Editor Integration
- Syntax highlighting for multiple languages
- Line numbers and code folding
- Find and replace functionality
- Keyboard shortcuts support
- Responsive design

### Diff Visualization
- Side-by-side comparison view
- Syntax highlighting in diffs
- Word-level change detection
- Dark/light theme support

### Command Suggestions
- Pre-built common commands
- Click-to-use functionality
- Expandable suggestion panel
- Context-aware suggestions

## 🚀 Deployment

### Vercel Deployment
```bash
npm run build
npx vercel --prod
```

### Environment Setup
Make sure to configure your production backend URL in deployment settings.

## 🤖 Backend Agent Architecture

### Multi-Agent Design Pattern

The recommended backend architecture uses a **Multi-Agent Design Pattern** that provides:

#### Benefits:
- **Separation of Concerns**: Each agent handles one specific responsibility
- **Scalability**: New agents can be added without modifying existing code
- **Maintainability**: Each agent can be tested and debugged independently
- **Flexibility**: Different agents can use different AI providers or processing methods

#### Architecture Overview:
```
backend/
├── app/
│   ├── main.py                    # FastAPI app entry point
│   ├── models/
│   │   └── requests.py            # Pydantic request/response models
│   ├── agents/
│   │   ├── base_agent.py          # Abstract base class
│   │   ├── text_editor_agent.py   # Text transformation logic
│   │   └── summarizer_agent.py    # Summarization logic
│   ├── core/
│   │   └── agent_manager.py       # Agent orchestration
│   └── routers/
│       └── text_operations.py     # API endpoints
```

### Complete Backend Implementation Guide

#### 1. Base Agent Interface
```python
# agents/base_agent.py
from abc import ABC, abstractmethod
from typing import Dict, Any
import logging

class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"agent.{name}")
    
    @abstractmethod
    async def process(self, text: str, command: str) -> str:
        """Process input and return result"""
        pass
    
    async def validate_input(self, text: str, command: str) -> bool:
        """Validate input data"""
        return bool(text and text.strip() and command and command.strip())
```

#### 2. Agent Manager (Orchestration)
```python
# core/agent_manager.py
from typing import Dict
from ..agents.base_agent import BaseAgent
from ..agents.text_editor_agent import TextEditorAgent
from ..agents.summarizer_agent import SummarizerAgent

class AgentManager:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {
            "editor": TextEditorAgent("editor"),
            "summarizer": SummarizerAgent("summarizer")
        }
    
    async def execute(self, agent_name: str, text: str, command: str) -> Dict:
        agent = self.agents.get(agent_name)
        if not agent:
            raise ValueError(f"Agent '{agent_name}' not found")
        
        if not await agent.validate_input(text, command):
            raise ValueError("Invalid input data")
        
        try:
            result = await agent.process(text, command)
            return {
                "result": result,
                "success": True,
                "agent_used": agent.name
            }
        except Exception as e:
            agent.logger.error(f"Processing failed: {e}")
            return {
                "result": f"Error: {str(e)}",
                "success": False,
                "agent_used": agent.name
            }
    
    def add_agent(self, name: str, agent: BaseAgent):
        """Dynamically add new agents"""
        self.agents[name] = agent
```

#### 3. API Routes
```python
# routers/text_operations.py
from fastapi import APIRouter, HTTPException, Depends
from ..models.requests import TextRequest, TextResponse
from ..core.agent_manager import AgentManager

router = APIRouter(prefix="/api/v1", tags=["text"])

async def get_agent_manager() -> AgentManager:
    return AgentManager()

@router.post("/prompt", response_model=TextResponse)
async def process_text(
    request: TextRequest,
    agent_manager: AgentManager = Depends(get_agent_manager)
):
    try:
        result = await agent_manager.execute("editor", request.text, request.command)
        return TextResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize", response_model=TextResponse)
async def summarize_text(
    request: TextRequest,
    agent_manager: AgentManager = Depends(get_agent_manager)
):
    try:
        result = await agent_manager.execute("summarizer", request.text, request.command)
        return TextResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### 4. Pydantic Models
```python
# models/requests.py
from pydantic import BaseModel

class TextRequest(BaseModel):
    text: str
    command: str

class TextResponse(BaseModel):
    result: str
    success: bool = True
    agent_used: str = ""
```

#### 5. Main FastAPI Application
```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import text_operations

app = FastAPI(
    title="ChatNotePad.Ai Backend",
    description="Multi-agent text processing API",
    version="2.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Include routers
app.include_router(text_operations.router)

@app.get("/")
async def root():
    return {"message": "ChatNotePad.Ai Backend API", "version": "2.0.0"}
```

### Migration Strategy

If you have an existing FastAPI backend, follow this migration path:

1. **Create the new folder structure** as shown above
2. **Move existing `/prompt` logic** into `TextEditorAgent`
3. **Implement `SummarizerAgent`** with your chosen AI/LLM integration
4. **Create `AgentManager`** to orchestrate between agents
5. **Update API routes** to use the new agent system
6. **Test both endpoints** (`/prompt` and `/summarize`)
7. **Add backward compatibility** if needed

### Extending with New Agents

Adding new functionality is straightforward:

```python
# Example: Adding a translation agent
class TranslatorAgent(BaseAgent):
    async def process(self, text: str, command: str) -> str:
        # Translation logic here
        pass

# In AgentManager.__init__():
self.agents["translator"] = TranslatorAgent("translator")

# New route:
@router.post("/translate")
async def translate_text(request: TextRequest, ...):
    return await agent_manager.execute("translator", request.text, request.command)
```

This architecture ensures your backend remains scalable and maintainable as you add more AI-powered features.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.


## 🔮 Roadmap – Frontend (ChatNotePad.Ai)

### 🟢 Phase 1: Foundation & UI Features – **✅ Completed**
- ✅ React 18 + Next.js 15 (App Router)
- ✅ TailwindCSS v4 integration
- ✅ Monaco Editor integration with Markdown support
- ✅ Chat-style input area for natural language commands
- ✅ Live diff viewer integration using `react-diff-viewer`
- ✅ Dark/light theme toggle
- ✅ Responsive design (desktop/mobile)
- ✅ **Copy button** (copy result to clipboard)
- ✅ **Side-by-side diff view** (diff visualization)
- ✅ **Syntax highlighting in diffs**
- ✅ **Word-level change detection** (diff)
- ✅ **Monaco Editor features:**
    - Line numbers, code folding
    - Find & replace
    - Keyboard shortcuts
    - Responsive & markdown support
- ✅ **Header:** App title and theme toggle

---

### 🟡 Phase 2: Smart Commands & User Feedback – **✅ Completed**
- ✅ Improved error handling for invalid/unsupported commands
- ✅ Command history display panel
- ✅ **Command suggestions with click-to-apply actions**
- ✅ Animations and UX polish (auto-scroll, diff syncing)
- ✅ Feedback display for agent response (e.g. "Processed by GPT")
- ✅ **Advanced LLM use cases:** Tone shift, simplification, formalization
- ✅ **Pre-built common commands** (suggestion panel)
- ✅ **Expandable suggestion panel**
- ✅ **Smart command examples:**  
  - "Remove all commas", "Replace 'and' with 'or'", "Capitalize first letter"
  - "Convert to uppercase", "Add bullet points", "Remove extra spaces"
  - "Summarize this text", "Make it more formal", etc.
- ✅ **Text Editing & Summarization** (core functionality working)
- ✅ **Natural Language Processing:** Transform text using plain English commands

---

### 🟣 Phase 3: Collaboration & Scalability – **🚧 In Progress**
- ✅ **Supabase Authentication System**
  - User registration with email/password
  - Email verification flow with confirmation links
  - Password reset functionality
  - JWT token management with automatic refresh
  - Secure session management
- ✅ **User Interface & Navigation**
  - Login/signup forms with validation
  - Protected routes for authenticated users
  - User profile dropdown in header
  - Settings page for user preferences
  - Email verification modals and redirects
- ✅ **Security Features**
  - Automatic token refresh on 401 errors
  - Request interceptors for auth headers
  - Protected route wrapper components
  - Secure logout functionality
  - Email confirmation handling
- ✅ **User Preferences & Settings**
  - Theme selection (light/dark/system)
  - Font size and line height customization
  - Language preferences
  - Auto-save toggle
  - Account management (delete account)
- ✅ **Component Organization**
  - Organized auth components in `/components/auth/`
  - Comprehensive error handling and user feedback
  - Toast notifications for user actions
  - Form validation with react-hook-form and yup
- ✅ **Note Management System**
  - Complete CRUD operations for notes (Create, Read, Update, Delete)
  - Real-time search with debouncing (300ms delay)
  - Tag system with autocomplete and suggestions
  - Favorite notes functionality with toggle
  - Pagination system (12 notes per page)
  - Advanced filtering (by tags, favorites, date)
  - Grid-based note display with responsive cards
  - Monaco Editor integration for note editing
  - Loading states and error handling throughout
  - Keyboard shortcuts (Ctrl+S to save, Esc to cancel)
  - Delete confirmations and user feedback
  - Dark mode support for all components
- ✅ **API Integration**
  - JWT-authenticated API client with automatic token management
  - Complete TypeScript interfaces for all note operations
  - Custom React hooks (useNotes, useSearch, useTags)
  - Axios interceptors for request/response handling
  - Error boundary and fallback UI components
- ✅ **User-specific theme and settings**
- ✅ **Export/Import System**
  - Export notes as Markdown (.md), Plain Text (.txt), or PDF
  - Import notes from file (Markdown / TXT / JSON)
  - Drag-and-drop file upload with validation
  - Export modal with format selection and progress tracking
  - Import modal with file preview and batch processing
  - Quick export dropdown for immediate downloads
  - File size validation (10MB limit) and format checking
  - Import statistics with success/error reporting
  - API integration with `/api/v1/export/*` and `/api/v1/import/*` endpoints
  - Proper error handling and user feedback throughout
- ⬜ Version history and undo functionality (client-side)
- ⬜ **Real-time collaboration** UI support
- ⬜ Localization and **multi-language support** (UI & command handling)
- ⬜ **Plugin system for custom commands**
- ⬜ **Integration with cloud storage** (e.g., Dropbox, Google Drive)
- ⬜ **File import/export**
- ⬜ **Advanced AI integrations**
- ⬜ **Context-aware suggestions**

---

### 💡 Future Ideas
- ⬜ Plugin-based command system for power users
- ⬜ User-specific theme and settings
- ⬜ Integration with cloud storage (e.g., Dropbox, Google Drive)
