"use client";

import React from 'react';
import { WordFrequency } from '@/lib/textAnalysis';

interface KeywordAnalysisProps {
  keywords: WordFrequency[];
  isLoading?: boolean;
  isProcessing?: boolean;
  maxKeywords?: number;
  className?: string;
}

export const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({
  keywords,
  isLoading = false,
  isProcessing = false,
  maxKeywords = 10,
  className = ''
}) => {
  const showLoading = isLoading || isProcessing;

  if (showLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Keyword Density
          </h3>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isProcessing ? 'Processing...' : 'Analyzing...'}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center h-24">
          <div className="text-center">
            <div className="animate-pulse text-gray-400 dark:text-gray-500">
              Analyzing text for keywords...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (keywords.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Keyword Density
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Enter text to see keyword analysis
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Keyword Density
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Top {Math.min(keywords.length, maxKeywords)} words
        </span>
      </div>

      <div className="space-y-3">
        {keywords.map((keyword, index) => (
          <div
            key={keyword.word}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full">
                {index + 1}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {keyword.word}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {keyword.count} ({keyword.percentage.toFixed(1)}%)
              </span>
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(keyword.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {keywords.length >= maxKeywords && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          Showing top {maxKeywords} keywords. Add more text to see additional keywords.
        </p>
      )}
    </div>
  );
};