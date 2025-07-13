# ChatNotePad.Ai

ChatNotePad.Ai is a modern, AI-powered note-taking application that allows users to edit and transform their notes using natural language commands. The application features a clean, responsive UI with live diff visualization and supports both text editing and summarization capabilities.

## 🔗 Backend Integration

The backend for ChatNotePad.Ai should be a FastAPI application that provides the following endpoints:
- `/prompt` - For text editing and transformation
- `/summarize` - For text summarization

For a complete backend implementation example, see the [Chat-Notepad-Core](https://github.com/zeynep-pp/Chat-Notepad-Core) repository.

## ✨ Features

### Core Features
- **Monaco Editor:** Advanced code editor with syntax highlighting and markdown support
- **Live Diff Viewer:** Real-time visualization of text changes with additions in green and deletions in red
- **Natural Language Processing:** Transform text using plain English commands
- **Text Summarization:** AI-powered text summarization feature
- **Theme Support:** Beautiful light and dark mode with smooth transitions
- **Responsive Design:** Works seamlessly on desktop and mobile devices

### Smart Commands
- **Text Editing:** "Remove all commas", "Replace 'and' with 'or'", "Capitalize first letter"
- **Formatting:** "Convert to uppercase", "Add bullet points", "Remove extra spaces"
- **AI Features:** "Summarize this text", "Make it more formal"

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

### Backend Requirements
Your FastAPI backend should include:
- **FastAPI** with Pydantic models
- **Multi-agent architecture** (text editor + summarizer agents)
- **AI/LLM integration** (OpenAI, Anthropic, etc.)
- **Async request handling**

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

### Live Diff Viewing
- Changes are highlighted in real-time
- **Green:** Added text
- **Red:** Removed text
- **Copy button:** Copy the result to clipboard

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

## 📦 Project Structure

```
ChatNotePad.Ai/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main application component
│   └── globals.css          # Global styles and TailwindCSS
├── public/
│   └── index.html           # Landing page
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # TailwindCSS configuration
├── postcss.config.js        # PostCSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
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

## 🔮 Roadmap

- [ ] Plugin system for custom commands
- [ ] Real-time collaboration
- [ ] File import/export
- [ ] Advanced AI integrations
- [ ] Multi-language support

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

### 🟡 Phase 2: Smart Commands & User Feedback – **🛠 In Progress**
- ⬜ Improved error handling for invalid/unsupported commands
- ⬜ Command history display panel
- ⬜ Command suggestions with click-to-apply actions
- ⬜ Animations and UX polish (auto-scroll, diff syncing)
- ⬜ Feedback display for agent response (e.g. "Processed by GPT")
- ⬜ **Advanced LLM use cases:** Tone shift, simplification, formalization
- ⬜ **Pre-built common commands** (suggestion panel)
- ⬜ **Context-aware suggestions**
- ⬜ **Expandable suggestion panel**
- ⬜ **Smart command examples:**  
  - "Remove all commas", "Replace 'and' with 'or'", "Capitalize first letter"
  - "Convert to uppercase", "Add bullet points", "Remove extra spaces"
  - "Summarize this text", "Make it more formal", etc.
- ✅ **Text Editing & Summarization** (core functionality working)
- ✅ **Natural Language Processing:** Transform text using plain English commands

---

### 🕣 Phase 3: Personalization & Export – **⬜ Not Started**
- ⬜ Export note as Markdown or TXT
- ⬜ Import notes from file (Markdown / TXT)
- ⬜ Version history and undo functionality (client-side)
- ⬜ Real-time collaboration UI support
- ⬜ Localization and multi-language support (UI & command handling)
- ⬜ **User-specific theme and settings**
- ⬜ **Plugin-based command system**
- ⬜ **Integration with cloud storage** (e.g., Dropbox, Google Drive)

---

### 💡 Future Ideas
_(Aşağıdaki maddeler Phase 3’e taşınabilir veya burada ayrı tutulabilir):_
- ⬜ Plugin-based command system for power users
- ⬜ User-specific theme and settings
- ⬜ Integration with cloud storage (e.g., Dropbox, Google Drive)

---

> 📝 **Not:**  
> Her fazın detayları README’nin “Features” bölümüyle uyumludur.  
> Bir özellik tamamlandığında ✅ ile işaretleyin, yeni eklemeler için uygun faza ekleyin.