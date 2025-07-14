'use client';

import { useState, useRef } from 'react';
import { CommandHistoryItem } from '../types';

interface HistoryPanelProps {
  commandHistory: CommandHistoryItem[];
  onReuseCommand: (item: CommandHistoryItem) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export default function HistoryPanel({ 
  commandHistory, 
  onReuseCommand, 
  onClearHistory, 
  onClose 
}: HistoryPanelProps) {
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const historyRef = useRef<HTMLDivElement>(null);

  const filteredHistory = commandHistory.filter(item => {
    const matchesFilter = filter === 'all' || 
      (filter === 'success' && item.success) || 
      (filter === 'error' && !item.success);
    
    const matchesSearch = searchTerm === '' || 
      item.command.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm animate-in slide-in-from-bottom duration-300">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Command History</h3>
          <div className="flex gap-2">
            <button
              onClick={onClearHistory}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 hover:scale-105"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-all duration-200 hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Search commands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'success' | 'error')}
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>
        
        {/* History List */}
        <div ref={historyRef} className="max-h-48 overflow-y-auto space-y-2 scroll-smooth">
          {filteredHistory.length === 0 ? (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
              {commandHistory.length === 0 ? 'No commands yet' : 'No commands match your search'}
            </div>
          ) : (
            filteredHistory.map((item, index) => (
              <div
                key={item.id}
                className={`bg-gray-50 dark:bg-gray-700 rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                  index === 0 ? 'animate-pulse' : ''
                }`}
                onClick={() => onReuseCommand(item)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReuseCommand(item);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 transition-all duration-200 hover:scale-105"
                  >
                    Reuse
                  </button>
                </div>
                <div className="text-xs text-gray-800 dark:text-gray-100 mb-1 font-medium">
                  {item.command}
                </div>
                
                {/* Agent Info in History */}
                {item.agentInfo && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>{item.agentInfo.model}</span>
                    <span>•</span>
                    <span>{item.agentInfo.processing_time_ms >= 1000 ? 
                      `${(item.agentInfo.processing_time_ms / 1000).toFixed(1)}s` : 
                      `${item.agentInfo.processing_time_ms}ms`}</span>
                    {item.agentInfo.tokens_used && (
                      <>
                        <span>•</span>
                        <span>{item.agentInfo.tokens_used} tokens</span>
                      </>
                    )}
                  </div>
                )}
                
                {item.error && (
                  <div className="text-xs text-red-600 dark:text-red-400 truncate">
                    Error: {item.error}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}