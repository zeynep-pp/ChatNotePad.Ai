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
      const res = await axios.post("/prompt", {
        text: originalText,
        command,
      });
      setEditedText(res.data.text || "");
    } catch (err) {
      setEditedText("Error processing command.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 flex-col md:flex-row gap-4 p-4">
        {/* Left: Editor */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-2 flex flex-col">
          <div className="font-semibold mb-2">Original Note</div>
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
              }}
            />
          </div>
        </div>
        {/* Right: Diff Viewer */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-2 flex flex-col">
          <div className="font-semibold mb-2">Edited Note (Diff)</div>
          <div className="flex-1 min-h-[300px] overflow-auto">
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
        </div>
      </div>
      {/* Bottom: Chatbot Command Input */}
      <form onSubmit={handleCommandSubmit} className="w-full flex gap-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <input
          type="text"
          className="flex-1 rounded border px-3 py-2 focus:outline-none focus:ring focus:border-blue-400 dark:bg-gray-900 dark:text-white"
          placeholder="Enter a command, e.g. Remove all ',' characters."
          value={command}
          onChange={e => setCommand(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || !command.trim()}
        >
          {loading ? "Processing..." : "Send"}
        </button>
      </form>
    </div>
  );
}
