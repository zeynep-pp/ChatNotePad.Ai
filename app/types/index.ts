export type ErrorType = 'network' | 'server' | 'invalid_command' | 'empty_text' | 'unknown';

export interface ErrorState {
  hasError: boolean;
  type: ErrorType | null;
  message: string;
  details?: string;
  retryable: boolean;
}

export interface AgentInfo {
  model: string;
  processing_time_ms: number;
  tokens_used?: number;
  confidence_score?: number;
  timestamp: string;
}

export interface CommandHistoryItem {
  id: string;
  command: string;
  timestamp: Date;
  originalText: string;
  result?: string;
  success: boolean;
  error?: string;
  agentInfo?: AgentInfo;
}