'use client';

import { forwardRef } from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onScroll?: (scrollTop: number) => void;
  isDarkMode: boolean;
}

const TextEditor = forwardRef<HTMLDivElement, TextEditorProps>(({ 
  value, 
  onChange, 
  onScroll, 
  isDarkMode 
}, ref) => {
  return (
    <section className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-[400px] border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold text-gray-800 dark:text-gray-100">Original Note</div>
        <div className="flex gap-2">
          {value && (
            <button
              onClick={() => onChange("")}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-sm transition-colors"
            >
              Clear
            </button>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
            {value.length} chars
          </div>
        </div>
      </div>
      <div ref={ref} className="flex-1 min-h-[300px]">
        <MonacoEditor
          height="300px"
          defaultLanguage="markdown"
          value={value}
          onChange={v => onChange(v || "")}
          onMount={(editor, monaco) => {
            if (onScroll) {
              editor.onDidScrollChange((e: any) => {
                onScroll(e.scrollTop);
              });
            }
          }}
          options={{
            minimap: { enabled: false },
            lineNumbers: "on",
            theme: isDarkMode ? "vs-dark" : "vs",
            wordWrap: "on",
            fontSize: 13,
            scrollBeyondLastLine: false,
            placeholder: "Start typing your text here... (Supports Markdown formatting)",
          }}
        />
      </div>
    </section>
  );
});

TextEditor.displayName = 'TextEditor';

export default TextEditor;