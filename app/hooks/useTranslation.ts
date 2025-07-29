import { useState } from 'react';
import apiClient from '../lib/api';
import { RateLimitError } from '../lib/apiClient';

interface TranslationRequest {
  text: string;
  target_language: string;
  source_language?: string;
}

interface TranslationResponse {
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  confidence: number;
}

interface RateLimitInfo {
  remaining: number;
  resetTime?: number;
}

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    resetTime?: string;
    remaining?: number;
  } | null>(null);

  const translateText = async (request: TranslationRequest): Promise<TranslationResponse | null> => {
    setIsTranslating(true);
    setError(null);
    setRateLimitInfo(null);

    try {
      const response = await apiClient.post<TranslationResponse>('/ai/translate', request);
      return response;
    } catch (err: any) {
      if (err instanceof RateLimitError) {
        setError(`Rate limit exceeded. Try again in ${formatResetTime(err.resetTime)}`);
        setRateLimitInfo({
          resetTime: err.resetTime,
          remaining: err.remaining
        });
      } else if (err?.response?.status === 401) {
        setError('Translation requires authentication. Please sign in to use this feature.');
      } else if (err?.response?.status === 403) {
        setError('Translation access denied. Please check your subscription or permissions.');
      } else if (err instanceof Error) {
        setError(`Translation failed: ${err.message}`);
      } else {
        setError('Translation failed. Please try again.');
      }
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translateText,
    isTranslating,
    error,
    rateLimitInfo
  };
};

const formatResetTime = (resetTime: string): string => {
  const resetDate = new Date(resetTime);
  const now = new Date();
  const diffMinutes = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes`;
  } else {
    const hours = Math.ceil(diffMinutes / 60);
    return `${hours} hours`;
  }
};