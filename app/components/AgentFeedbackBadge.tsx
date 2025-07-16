import { AgentInfo } from '../types';

interface AgentFeedbackBadgeProps {
  agentInfo: AgentInfo;
}

export default function AgentFeedbackBadge({ agentInfo }: AgentFeedbackBadgeProps) {
  const formatProcessingTime = (ms: number) => {
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
  };

  const getModelDisplayName = (model: string) => {
    const modelMap: { [key: string]: string } = {
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5',
      'claude-3': 'Claude-3',
      'claude-3-sonnet': 'Claude-3 Sonnet',
      'claude-3-haiku': 'Claude-3 Haiku',
      'text-transformation-agent': 'Transform Agent'
    };
    return modelMap[model] || model;
  };

  const getTransformationBadge = (type?: string) => {
    const badges = {
      'formalization': { emoji: '📋', label: 'Formalization', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      'simplification': { emoji: '📖', label: 'Simplification', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
      'tone_shift': { emoji: '😊', label: 'Tone Shift', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      'general': { emoji: '⚙️', label: 'General', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' }
    };
    return badges[type as keyof typeof badges] || badges.general;
  };

  const transformBadge = getTransformationBadge(agentInfo.transformation_type);

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="font-medium">Processed by {getModelDisplayName(agentInfo.model)}</span>
        </div>
        
        {/* Transformation Type Badge */}
        {agentInfo.transformation_type && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${transformBadge.color}`}>
            {transformBadge.emoji} {transformBadge.label}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatProcessingTime(agentInfo.processing_time_ms)}</span>
        </div>
        
        {agentInfo.tokens_used && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>{agentInfo.tokens_used} tokens</span>
          </div>
        )}
        
        {agentInfo.confidence_score && (
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              agentInfo.confidence_score >= 0.9 ? 'bg-green-500' : 
              agentInfo.confidence_score >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className={`${
              agentInfo.confidence_score >= 0.9 ? 'text-green-600 dark:text-green-400' : 
              agentInfo.confidence_score >= 0.7 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {Math.round(agentInfo.confidence_score * 100)}% confidence
            </span>
          </div>
        )}
      </div>
    </div>
  );
}