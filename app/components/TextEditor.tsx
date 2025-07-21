'use client';

import { forwardRef, useRef, useEffect } from 'react';
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
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    function applyTheme() {
      if (monacoRef.current && editorRef.current) {
        if (isDarkMode) {
          monacoRef.current.editor.defineTheme('custom-dark-blue', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#374151',
              'editorLineNumber.foreground': '#64748b',
              'editorLineNumber.activeForeground': '#60a5fa',
              'editor.foreground': '#e0e7ef',
              'editorCursor.foreground': '#60a5fa',
              'editor.selectionBackground': '#334155',
              'editor.inactiveSelectionBackground': '#33415588',
              'editor.lineHighlightBackground': '#33415555',
              'editorIndentGuide.background': '#334155',
              'editorIndentGuide.activeBackground': '#60a5fa',
              'editorWidget.background': '#374151',
              'editorWidget.border': '#334155',
              'editorSuggestWidget.background': '#374151',
              'editorSuggestWidget.border': '#334155',
              'editorSuggestWidget.foreground': '#e0e7ef',
              'editorSuggestWidget.selectedBackground': '#334155',
              'editorSuggestWidget.highlightForeground': '#60a5fa',
              'editor.placeholderForeground': '#94a3b8',
            },
          });
          monacoRef.current.editor.setTheme('custom-dark-blue');
        } else {
          monacoRef.current.editor.setTheme('vs');
        }
        // Tema geçişinde layout'u güncelle
        editorRef.current.layout();
      } else {
        // Referanslar henüz oluşmadıysa kısa bir süre sonra tekrar dene
        setTimeout(applyTheme, 100);
      }
    }
    applyTheme();
  }, [isDarkMode]);

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
            monacoRef.current = monaco;
            editorRef.current = editor;
            if (isDarkMode) {
              monaco.editor.defineTheme('custom-dark-blue', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#374151', // gray-700, Result (editable) ile aynı
                  'editorLineNumber.foreground': '#64748b', // açık mavi-gri
                  'editorLineNumber.activeForeground': '#60a5fa', // aktif satır numarası için mavi
                  'editor.foreground': '#e0e7ef', // yazı rengi
                  'editorCursor.foreground': '#60a5fa', // imleç rengi
                  'editor.selectionBackground': '#334155', // seçili alan için daha açık mavi
                  'editor.inactiveSelectionBackground': '#33415588',
                  'editor.lineHighlightBackground': '#33415555',
                  'editorIndentGuide.background': '#334155',
                  'editorIndentGuide.activeBackground': '#60a5fa',
                  'editorWidget.background': '#374151',
                  'editorWidget.border': '#334155',
                  'editorSuggestWidget.background': '#374151',
                  'editorSuggestWidget.border': '#334155',
                  'editorSuggestWidget.foreground': '#e0e7ef',
                  'editorSuggestWidget.selectedBackground': '#334155',
                  'editorSuggestWidget.highlightForeground': '#60a5fa',
                  'editor.placeholderForeground': '#94a3b8', // placeholder için açık mavi-gri
                },
              });
              monaco.editor.setTheme('custom-dark-blue');
            } else {
              monaco.editor.setTheme('vs');
            }
            if (onScroll) {
              editor.onDidScrollChange((e: any) => {
                onScroll(e.scrollTop);
              });
            }
          }}
          options={{
            minimap: { enabled: false },
            lineNumbers: "on",
            wordWrap: "on",
            fontSize: 13,
            scrollBeyondLastLine: false,
            placeholder: "Start typing your text here... (Supports Markdown formatting)",
            automaticLayout: true,
          }}
          theme={isDarkMode ? "vs-dark" : "vs"}
        />
      </div>
    </section>
  );
});

TextEditor.displayName = 'TextEditor';

export default TextEditor;