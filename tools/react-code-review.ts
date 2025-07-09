import { z } from "zod";
import { ESLint } from 'eslint';
import { createHash } from 'crypto';
import { getRedisClient } from '../lib/redis';
import * as reactPlugin from 'eslint-plugin-react';
// @ts-ignore - Next.js ESLint plugin types
import * as nextPlugin from '@next/eslint-plugin-next';

export interface LintMessage {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  ruleId?: string;
}

export interface ReactCodeReviewResult {
  messages: LintMessage[];
  summary: string;
}

function getCodeHash(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

function detectFileType(code: string): string {
  // Check for Next.js specific patterns
  if (code.includes('next/') || 
      code.includes('getServerSideProps') || 
      code.includes('getStaticProps') || 
      code.includes('getStaticPaths') ||
      code.includes('useRouter') ||
      code.includes('next/router') ||
      code.includes('next/head') ||
      code.includes('next/image') ||
      code.includes('next/link')) {
    return code.includes('TypeScript') || code.includes('interface ') || code.includes(': ') ? 'next.tsx' : 'next.jsx';
  }
  
  // Check for TypeScript patterns
  if (code.includes('interface ') || 
      code.includes('type ') || 
      code.includes(': React.') ||
      code.includes('<FC>') ||
      code.includes('Props>') ||
      /:\s*(string|number|boolean|object)/g.test(code)) {
    return 'component.tsx';
  }
  
  // Default to JSX
  return 'component.jsx';
}

/**
 * Analyze React and Next.js code and return linting results.
 * @param code - The React or Next.js code as a string
 */
export async function analyzeReactCode(code: string): Promise<ReactCodeReviewResult> {
  const redis = getRedisClient();
  const codeHash = getCodeHash(code);
  const cacheKey = `react-nextjs-review:${codeHash}`;

  // Try to get cached result
  if (redis) {
    try {
      // Handle both Upstash and regular Redis APIs
      const cached = 'get' in redis && typeof redis.get === 'function' 
        ? await (redis.get as (key: string) => Promise<string | null>)(cacheKey)
        : null;
      if (cached) {
        return JSON.parse(typeof cached === 'string' ? cached : JSON.stringify(cached));
      }
    } catch (error) {
      console.warn('Redis cache read failed:', error);
    }
  }

  // Detect file type for better analysis
  const fileType = detectFileType(code);
  const isNextJs = fileType.includes('next');
  
  // Set up ESLint for React and Next.js
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
        globals: {
          window: 'readonly',
          document: 'readonly',
          console: 'readonly',
          process: 'readonly',
          Buffer: 'readonly',
          __dirname: 'readonly',
          __filename: 'readonly',
          global: 'readonly',
          React: 'readonly',
          JSX: 'readonly',
        },
      },
      plugins: {
        react: reactPlugin,
        ...(isNextJs && { '@next/next': nextPlugin }),
      },
      rules: {
        // React rules
        ...reactPlugin.configs.recommended.rules,
        'react/react-in-jsx-scope': 'off', // Not needed in Next.js
        'react/prop-types': 'warn',
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        'react/no-unescaped-entities': 'warn',
        'react/jsx-key': 'error',
        'react/no-array-index-key': 'warn',
        'react/jsx-pascal-case': 'error',
        
        // Next.js specific rules (if detected)
        ...(isNextJs && {
          '@next/next/no-img-element': 'error',
          '@next/next/no-html-link-for-pages': 'error',
          '@next/next/no-head-import-in-document': 'error',
          '@next/next/no-script-component-in-head': 'error',
          '@next/next/no-duplicate-head': 'error',
          '@next/next/no-unwanted-polyfillio': 'error',
          '@next/next/no-page-custom-font': 'warn',
          '@next/next/no-css-tags': 'error',
          '@next/next/no-sync-scripts': 'error',
          '@next/next/no-before-interactive-script-outside-document': 'error',
        }),
        
        // Performance and best practices
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-unused-vars': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
      },
      settings: { 
        react: { version: 'detect' },
        ...(isNextJs && {
          next: {
            rootDir: '.',
          },
        }),
      },
    },
  });

  const results = await eslint.lintText(code, { filePath: fileType });
  const messages: LintMessage[] = results[0].messages.map(msg => ({
    line: msg.line,
    column: msg.column,
    severity: msg.severity === 2 ? 'error' : msg.severity === 1 ? 'warning' : 'info',
    message: msg.message,
    ruleId: typeof msg.ruleId === 'string' ? msg.ruleId : undefined,
  }));

  const frameWork = isNextJs ? 'Next.js' : 'React';
  const errorCount = messages.filter(m => m.severity === 'error').length;
  const warningCount = messages.filter(m => m.severity === 'warning').length;
  const summary = `${frameWork} code analysis: ${messages.length} issue(s) found (${errorCount} errors, ${warningCount} warnings).`;
  const reviewResult: ReactCodeReviewResult = { messages, summary };

  // Cache the result
  if (redis) {
    try {
      // Handle both Upstash and regular Redis APIs
      if ('setEx' in redis) {
        await redis.setEx(cacheKey, 60 * 10, JSON.stringify(reviewResult)); // 10 min expiry
      } else {
        await redis.set(cacheKey, JSON.stringify(reviewResult), { ex: 60 * 10 }); // 10 min expiry
      }
    } catch (error) {
      console.warn('Redis cache write failed:', error);
    }
  }

  return reviewResult;
}

export const reactCodeReviewTool = {
  name: 'react-nextjs-code-review',
  description: 'Analyze React and Next.js code and provide comprehensive code review feedback including lint errors, best practices, performance issues, and framework-specific recommendations.',
  schema: {
    code: z.string().describe('The React or Next.js code to review (supports .js, .jsx, .ts, .tsx files).'),
  },
  handler: async ({ code }: { code: string }) => {
    try {
      const result = await analyzeReactCode(code);
      // Format the result as a text content array
      const issues = result.messages.map(
        (msg) => `Line ${msg.line}, Col ${msg.column}: [${msg.severity.toUpperCase()}] ${msg.message}${msg.ruleId ? ` (${msg.ruleId})` : ''}`
      ).join('\n');
      return {
        content: [
          { type: 'text' as const, text: result.summary },
          { type: 'text' as const, text: issues || 'No issues found.' },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: 'text' as const, text: `Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}` },
        ],
      };
    }
  },
}; 