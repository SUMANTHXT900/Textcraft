"use client";

import React, { useState, useMemo } from 'react';
import { findAndReplaceAdvanced } from '@/lib/textTransform';

interface AdvancedFindReplaceProps {
  text: string;
  onTextChange: (newText: string) => void;
  className?: string;
}

export const AdvancedFindReplace: React.FC<AdvancedFindReplaceProps> = ({
  text,
  onTextChange,
  className = ''
}) => {
  const [findTerm, setFindTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Preview matches without making changes
  const matchPreview = useMemo(() => {
    if (!findTerm.trim() || !text) {
      return { matches: [], count: 0 };
    }

    try {
      const result = findAndReplaceAdvanced(text, findTerm, replaceTerm, {
        caseSensitive,
        wholeWord,
      });
      return { matches: [], count: result.matchCount };
    } catch (error) {
      return { matches: [], count: 0, error: error instanceof Error ? error.message : 'Invalid pattern' };
    }
  }, [text, findTerm, replaceTerm, caseSensitive, wholeWord]);

  const handleReplaceAll = () => {
    if (!findTerm.trim()) {
      return;
    }

    try {
      const result = findAndReplaceAdvanced(text, findTerm, replaceTerm, {
        caseSensitive,
        wholeWord,
      });

      if (result.matchCount > 0) {
        onTextChange(result.text);
        setFindTerm(''); // Clear find term after successful replacement
      }
    } catch (error) {
      console.error('Replace all failed:', error);
      throw error; // Re-throw to let parent component handle user feedback
    }
  };

  // Reset form after successful replacement
  const resetForm = () => {
    setFindTerm('');
    setReplaceTerm('');
    setCaseSensitive(false);
    setWholeWord(false);
  };

  const handleReplaceSingle = () => {
    // For single replacement, we'd need cursor position - implement if needed
    try {
      handleReplaceAll(); // For now, do replace all
    } catch (error) {
      console.error('Replace single failed:', error);
      throw error; // Re-throw to let parent component handle user feedback
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded w-full text-left"
      >
        <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
        Advanced Find & Replace
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Live region for screen reader announcements */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {matchPreview.count > 0 && `${matchPreview.count} matches found`}
            {matchPreview.error && `Error: ${matchPreview.error}`}
          </div>
          {/* Find Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Find
            </label>
            <input
              type="text"
              value={findTerm}
              onChange={(e) => setFindTerm(e.target.value)}
              placeholder="Enter text to find..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Text to find"
              aria-describedby="find-help"
            />
            <div id="find-help" className="sr-only">
              Enter the text you want to search for in your document
            </div>
          </div>

          {/* Replace Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Replace with
            </label>
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              placeholder="Enter replacement text..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Replacement text"
              aria-describedby="replace-help"
            />
            <div id="replace-help" className="sr-only">
              Enter the text that will replace the found text
            </div>
          </div>

          {/* Options */}
          <fieldset className="space-y-2">
            <legend className="sr-only">Find and replace options</legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded focus:ring-2 focus:ring-blue-500"
                aria-describedby="case-sensitive-help"
              />
              Case sensitive
            </label>
            <div id="case-sensitive-help" className="sr-only">
              When enabled, search will be case-sensitive (e.g., "Word" ≠ "word")
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
                className="rounded focus:ring-2 focus:ring-blue-500"
                aria-describedby="whole-word-help"
              />
              Whole word only
            </label>
            <div id="whole-word-help" className="sr-only">
              When enabled, only match complete words (e.g., "word" ≠ "wording")
            </div>
          </fieldset>

          {/* Match Preview */}
          {findTerm.trim() && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {matchPreview.error ? (
                  <span className="text-red-500">Error: {matchPreview.error}</span>
                ) : (
                  <span>
                    Found {matchPreview.count} match{matchPreview.count !== 1 ? 'es' : ''}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleReplaceSingle}
              disabled={!findTerm.trim() || matchPreview.count === 0}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Replace single occurrence ${matchPreview.count > 0 ? `(${matchPreview.count} matches found)` : '(no matches)'}`}
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={!findTerm.trim() || matchPreview.count === 0}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label={`Replace all occurrences ${matchPreview.count > 0 ? `(${matchPreview.count} matches found)` : '(no matches)'}`}
            >
              Replace All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};