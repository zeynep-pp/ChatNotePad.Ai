"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import apiClient from '../lib/api';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  onTranslated: (translatedText: string, targetLang: string) => void;
  className?: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto-detect', nativeName: 'Auto-detect', flag: '🌐' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' }
];

export default function TranslationModal({
  isOpen,
  onClose,
  sourceText,
  onTranslated,
  className = ""
}: TranslationModalProps) {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);
  const [languageSearch, setLanguageSearch] = useState('');
  const { translateText, isTranslating, error, rateLimitInfo } = useTranslation();

  useEffect(() => {
    // Load recent languages from localStorage
    const saved = localStorage.getItem('recentTranslationLanguages');
    if (saved) {
      try {
        setRecentLanguages(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse recent languages:', error);
      }
    }
  }, []);

  // Temporarily disable auto-detection to avoid errors
  // useEffect(() => {
  //   if (isOpen && sourceText) {
  //     // Auto-detect language when modal opens
  //     detectLanguage();
  //   }
  // }, [isOpen, sourceText]);

  const detectLanguage = async () => {
    try {
      const response = await apiClient.get<{language: string}>(`/api/v1/ai/detect-language?text=${encodeURIComponent(sourceText)}`);

      setDetectedLanguage(response.language);
      if (response.language !== 'en') {
        setSourceLang(response.language);
      }
    } catch (error) {
      console.error('Language detection failed:', error);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim() || !targetLang) return;
    
    const result = await translateText({
      text: sourceText,
      source_language: sourceLang === 'auto' ? undefined : sourceLang,
      target_language: targetLang,
    });

    if (result) {
      setTranslatedText(result.translated_text);
      setDetectedLanguage(result.source_language);
      
      // Update recent languages
      const updated = [targetLang, ...recentLanguages.filter(lang => lang !== targetLang)].slice(0, 5);
      setRecentLanguages(updated);
      localStorage.setItem('recentTranslationLanguages', JSON.stringify(updated));
    }
  };

  const handleUseTranslation = (action: 'replace' | 'insert') => {
    if (!translatedText) return;
    onTranslated(translatedText, targetLang);
    onClose();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (translatedText) {
      setTranslatedText('');
    }
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(languageSearch.toLowerCase()) ||
    lang.code.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const getLanguageByCode = (code: string) => 
    SUPPORTED_LANGUAGES.find(lang => lang.code === code);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Translate Text
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center justify-center space-x-4">
            {/* Source Language */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              {detectedLanguage && sourceLang === 'auto' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Detected: {getLanguageByCode(detectedLanguage)?.name || detectedLanguage}
                </p>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex-shrink-0 pt-6">
              <button
                onClick={swapLanguages}
                disabled={sourceLang === 'auto'}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Swap languages"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>

            {/* Target Language */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recent Languages */}
          {recentLanguages.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Recent languages:</p>
              <div className="flex flex-wrap gap-2">
                {recentLanguages.map(langCode => {
                  const lang = getLanguageByCode(langCode);
                  if (!lang) return null;
                  return (
                    <button
                      key={langCode}
                      onClick={() => setTargetLang(langCode)}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        targetLang === langCode
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Translation Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 h-96">
            {/* Source Text */}
            <div className="p-6 border-r border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Source Text
                </h3>
                <button
                  onClick={() => copyToClipboard(sourceText)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="h-full bg-gray-50 dark:bg-gray-700 rounded-lg p-3 overflow-y-auto">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm">
                  {sourceText}
                </p>
              </div>
            </div>

            {/* Translated Text */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Translation
                </h3>
                {translatedText && (
                  <button
                    onClick={() => copyToClipboard(translatedText)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    Copy
                  </button>
                )}
              </div>
              <div className="h-full bg-gray-50 dark:bg-gray-700 rounded-lg p-3 overflow-y-auto">
                {isTranslating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Translating...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-red-600 dark:text-red-400 mb-3">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-xs font-medium">Translation Error</p>
                        <p className="text-xs mt-1">{error}</p>
                      </div>
                      
                      {/* Rate limit info */}
                      {rateLimitInfo && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs">
                          <div className="flex items-center justify-center gap-1 text-yellow-700 dark:text-yellow-300 mb-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Rate Limit Exceeded</span>
                          </div>
                          <p className="text-yellow-600 dark:text-yellow-400">
                            Remaining requests: {rateLimitInfo.remaining}
                          </p>
                          {rateLimitInfo.resetTime && (
                            <p className="text-yellow-600 dark:text-yellow-400">
                              Resets at: {new Date(rateLimitInfo.resetTime).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : translatedText ? (
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm">
                    {translatedText}
                  </p>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Click "Translate" to see the translation
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !sourceText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
            </div>

            {translatedText && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUseTranslation('insert')}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Insert
                </button>
                <button
                  onClick={() => handleUseTranslation('replace')}
                  className="px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Replace
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}