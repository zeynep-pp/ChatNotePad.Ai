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
  const [copySuccess, setCopySuccess] = useState("");

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      setCopySuccess("Failed to copy");
      setTimeout(() => setCopySuccess(""), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">ChatNotePadAi</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-xl text-sm">
          AI-powered note editing and transformation. Write your note, enter a natural language command, and see the changes instantly with live diff!
        </p>
      </header>
      {/* Main Content */}
      <main className="flex-1 w-full px-4 py-4">
        <div className="w-full max-w-full flex flex-col lg:flex-row gap-4 mb-20">
          {/* Left: Editor */}
          <section className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-[400px] border border-gray-200 dark:border-gray-700">
            <div className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Original Note</div>
            <div className="flex-1 min-h-[300px]">
              <MonacoEditor
                height="300px"
                defaultLanguage="markdown"
                value={originalText}
                onChange={v => setOriginalText(v || "")}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  theme: "vs-dark",
                  wordWrap: "on",
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </section>
          {/* Right: Edited Text and Diff Viewer */}
          <section className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-[400px] border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold text-gray-800 dark:text-gray-100">Edited Note</div>
              {editedText && (
                <button
                  onClick={() => copyToClipboard(editedText)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium transition-colors duration-200 text-sm flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copySuccess || "Copy"}
                </button>
              )}
            </div>
            
            {editedText ? (
              <div className="flex flex-col gap-3 flex-1">
                {/* Edited Text Area */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-1 text-sm">Result:</div>
                  <div className="max-h-24 overflow-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{editedText}</pre>
                  </div>
                </div>
                
                {/* Diff Viewer */}
                <div className="flex-1 min-h-[150px] overflow-auto">
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-1 text-sm">Changes:</div>
                  <DiffViewer
                    oldValue={originalText}
                    newValue={editedText}
                    splitView={false}
                    hideLineNumbers={true}
                    showDiffOnly={true}
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
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">Enter a command to see the edited text here</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      {/* Bottom: Chatbot Command Input */}
      <form
        onSubmit={handleCommandSubmit}
        className="fixed bottom-0 left-0 w-full flex gap-2 px-4 py-3 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-700 z-10"
        style={{backdropFilter: 'blur(6px)'}}
      >
        <input
          type="text"
          className="flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white shadow-sm"
          placeholder="Enter a command, e.g. Remove all ',' characters."
          value={command}
          onChange={e => setCommand(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
          disabled={loading || !command.trim()}
        >
          {loading ? "Processing..." : "Send"}
        </button>
      </form>
    </div>
  );
}
