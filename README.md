# ChatNotePadAi UI

ChatNotePadAi is a modern note-taking frontend that allows users to edit and transform their notes using natural language commands. The UI communicates with an LLM-powered backend agent (via a `/prompt` endpoint) that processes user commands and returns the edited text. All changes are visualized with a live diff viewer.

## 🔗 Backend Code

The backend code for ChatNotePadAi can be found in the [Chat-Notepad-Core](https://github.com/zeynep-pp/Chat-Notepad-Core) repository.

## ✨ Features

- **Markdown Editor:** Monaco-based editor for writing and editing notes (left panel)
- **Diff Viewer:** Visualizes changes between the original and edited text (right panel), with additions in green and deletions in red
- **Natural Language Commands:** Enter commands like "Remove all ',' characters" or "Replace all 'and' with 'or'" in the chatbot input (bottom)
- **Live Feedback:** Changes are shown instantly after backend processing
- **Theme Support:** Light and dark mode (via TailwindCSS)
- **Undo/Redo, Line Numbers:** Editor supports standard editing features

## 🖥️ UI Layout

- **Left Panel:** Original note (Markdown editor)
- **Right Panel:** Edited note and diff (react-diff-viewer)
- **Bottom:** Chatbot input for natural language commands

## 🛠️ Tech Stack

- **React** (with hooks)
- **Next.js** (App Router)
- **TailwindCSS** (utility-first styling)
- **Monaco Editor** (`@monaco-editor/react`)
- **react-diff-viewer** (diff visualization)
- **axios** (API communication)

## 🛠️ Troubleshooting

### Tailwind CSS v4+ Configuration
This project uses Tailwind CSS v4 with the following configuration:

**PostCSS Configuration** (`postcss.config.js`):
```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**Global CSS** (`app/globals.css`):
```css
@import "tailwindcss";
```

**Note:** In Tailwind CSS v4, use `@import "tailwindcss"` instead of the separate `@tailwind` directives.

### Dependency Conflicts (react-diff-viewer)
If you see errors about peer dependency conflicts (especially with `react-diff-viewer`), always use the `--legacy-peer-deps` flag:

```sh
npm install --legacy-peer-deps
```

This is safe and necessary due to outdated peer dependencies in some libraries.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

### Backend Requirement
- The UI expects a backend endpoint at `/prompt` that accepts POST requests with `{ text, command }` and returns `{ text: <editedText> }`.
- Example backend: FastAPI or Node.js agent using LLMs (see backend repo for details).

## 📝 Usage

1. **Write your note** in the left panel (Markdown supported).
2. **Enter a command** in the chatbot input (bottom), e.g.:
   - `Remove all ',' characters.`
   - `Replace all 'and' with 'or'.`
   - `Capitalize the first sentence.`
3. **View the result** in the right panel. All changes are highlighted (additions in green, deletions in red).

## 📦 Project Structure

```
app/
  layout.tsx         # Root layout, imports TailwindCSS
  page.tsx           # Main ChatNotePadAi UI (editor, diff, chatbot)
  globals.css        # TailwindCSS imports
public/
tailwind.config.js
postcss.config.js
```

## 🧑‍💻 Development Notes
- All code and comments are in English.
- The UI is decoupled from the backend; you can point it to any compatible `/prompt` endpoint.
- Monaco Editor and react-diff-viewer are loaded dynamically for performance.
- TailwindCSS is used for all styling and theming.

## 🤝 Contributing
Pull requests are welcome! Please open an issue first to discuss major changes.

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.