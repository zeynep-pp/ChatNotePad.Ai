"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import DiffViewer from "react-diff-viewer";
import axios from "axios";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function SmartNotePage() {
  const [originalText, setOriginalText] = useState("");
  const [command, setCommand] = useState("");
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/prompt", {
        text: originalText,
        command,
      });
      setEditedText(res.data.result || "");
    } catch (err) {
      setEditedText("Error processing command.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="w-full py-8 px-4 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 shadow-md mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">ChatNotePadAi</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-xl">
          AI-powered note editing and transformation. Write your note, enter a natural language command, and see the changes instantly with live diff!
        </p>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-2 md:px-8">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 md:gap-8 mb-24">
          {/* Left: Editor */}
          <section className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col min-h-[350px] border border-gray-200 dark:border-gray-700">
            <div className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Original Note</div>
            <div className="flex-1 min-h-[250px]">
              <MonacoEditor
                height="250px"
                defaultLanguage="markdown"
                value={originalText}
                onChange={v => setOriginalText(v || "")}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  theme: "vs-dark",
                  wordWrap: "on",
                }}
              />
            </div>
          </section>
          {/* Right: Diff Viewer */}
          <section className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col min-h-[350px] border border-gray-200 dark:border-gray-700">
            <div className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Edited Note (Diff)</div>
            <div className="flex-1 min-h-[250px] overflow-auto">
              <DiffViewer
                oldValue={originalText}
                newValue={editedText}
                splitView={true}
                hideLineNumbers={false}
                showDiffOnly={false}
                styles={{
                  variables: {
                    light: {
                      diffViewerBackground: "#fff",
                      addedBackground: "#e6ffed",
                      removedBackground: "#ffeef0",
                    },
                    dark: {
                      diffViewerBackground: "#1a202c",
                      addedBackground: "#064420",
                      removedBackground: "#420606",
                    },
                  },
                }}
              />
            </div>
          </section>
        </div>
      </main>
      {/* Bottom: Chatbot Command Input */}
      <form
        onSubmit={handleCommandSubmit}
        className="fixed bottom-0 left-0 w-full flex gap-2 px-2 md:px-8 py-4 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-700 z-10"
        style={{backdropFilter: 'blur(6px)'}}
      >
        <input
          type="text"
          className="flex-1 rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white text-lg shadow-sm"
          placeholder="Enter a command, e.g. Remove all ',' characters."
          value={command}
          onChange={e => setCommand(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-lg shadow-sm"
          disabled={loading || !command.trim()}
        >
          {loading ? "Processing..." : "Send"}
        </button>
      </form>
    </div>
  );
}
