/**
 * Character Counter - Main Application Component
 *
 * Comprehensive text analysis tool with real-time statistics, platform-specific character limits,
 * and advanced text manipulation features.
 *
 * Performance Optimizations:
 * - Debounced text input (300ms) to prevent excessive re-renders
 * - Memoized expensive calculations (analyzeText, getWordFrequency)
 * - useCallback for event handlers to prevent child re-renders
 * - Constants for timeout values and magic numbers
 *
 * Accessibility Features:
 * - Semantic HTML with proper ARIA labels and descriptions
 * - Screen reader support with sr-only headings and descriptions
 * - Keyboard navigation with visible focus indicators
 * - High contrast text with proper color contrast ratios
 * - Proper form labels and input associations
 *
 * Error Handling:
 * - Comprehensive try-catch blocks for all async operations
 * - Graceful fallbacks for clipboard API failures
 * - Input validation for edge cases
 * - User-friendly error messages via toast notifications
 *
 * Browser Compatibility:
 * - Clipboard API with fallback for older browsers
 * - Secure context detection for modern clipboard features
 * - Progressive enhancement for export functionality
 */

"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  Copy,
  Trash2,
  Download,
  FileText,
  Search,
  Sparkles,
  Twitter,
  Instagram,
  MessageSquare,
  Facebook,
  Linkedin,
} from "lucide-react";
import { analyzeText, getWordFrequency, formatNumber } from "@/lib/textAnalysis";
import {
  PLATFORMS,
  calculateLimitStatus,
  getSMSMessageCount,
} from "@/lib/platformLimits";
import {
  toUpperCase,
  toLowerCase,
  toTitleCase,
  toSentenceCase,
  removeExtraSpaces,
  removeLineBreaks,
  findAndReplace,
  exportAsText,
  exportStatsAsCSV,
} from "@/lib/textTransform";
import { copyToClipboard, pasteFromClipboard } from "@/lib/clipboard";
import { triggerConfetti, checkMilestone } from "@/lib/confetti";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { LoaderFive } from "@/components/ui/loader";
import { StatsBento } from "@/components/StatsBento";
import { KeywordAnalysis } from "@/components/KeywordAnalysis";
import { AdvancedFindReplace } from "@/components/AdvancedFindReplace";

// Constants for better maintainability
const DEBOUNCE_DELAY = 300;
const ANALYSIS_DELAY = 300;
const WELCOME_DISMISS_DELAY = 3000;
const TOAST_DISMISS_DELAY = 3000;

export default function Home() {
  const [text, setText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("twitter");
  const [customLimit, setCustomLimit] = useState(1000);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);
  const [filterStopWords, setFilterStopWords] = useState(true);
  const [maxKeywords, setMaxKeywords] = useState(10);
  const [isProcessingKeywords, setIsProcessingKeywords] = useState(false);

  // Debounce text input for better performance with cleanup protection
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [text]);

  // Track when analysis is actually running to prevent race conditions
  useEffect(() => {
    if (debouncedText !== text) {
      setIsAnalyzing(true);
      setIsProcessingKeywords(true);
    } else {
      // Small delay to ensure calculations are complete
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
        setIsProcessingKeywords(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [debouncedText, text]);

  // Auto-dismiss welcome screen after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, WELCOME_DISMISS_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const prevStatsRef = useRef({ words: 0, charactersWithSpaces: 0 });

  // Memoize expensive calculations to prevent unnecessary re-renders
  const stats = useMemo(() => analyzeText(debouncedText), [debouncedText]);
  const wordFrequency = useMemo(() => getWordFrequency(debouncedText, maxKeywords, filterStopWords), [debouncedText, maxKeywords, filterStopWords]);
  const currentLimit =
    selectedPlatform === "custom"
      ? customLimit
      : PLATFORMS[selectedPlatform].limit;
  const limitStatus = calculateLimitStatus(stats.charactersWithSpaces, currentLimit);
  const smsCount = getSMSMessageCount(stats.charactersWithSpaces);

  useEffect(() => {
    if (checkMilestone(prevStatsRef.current, stats)) {
      triggerConfetti();
    }
    prevStatsRef.current = {
      words: stats.words,
      charactersWithSpaces: stats.charactersWithSpaces,
    };
  }, [stats.words, stats.charactersWithSpaces]);

  useEffect(() => {
    if (debouncedText.length > 0) {
      setShowWelcome(false);
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
      }, ANALYSIS_DELAY);
      return () => clearTimeout(timer);
    } else {
      setIsAnalyzing(false);
    }
  }, [debouncedText]);


  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), TOAST_DISMISS_DELAY);
  }, []);

  const handleCopyText = useCallback(async () => {
    try {
      const success = await copyToClipboard(text);
      showToastMessage(success ? "Text copied!" : "Failed to copy");
    } catch (error) {
      console.error('Copy operation failed:', error);
      showToastMessage("Copy failed. Please try again.");
    }
  }, [text, showToastMessage]);

  const handleCopyStats = useCallback(async () => {
    try {
      const statsText = `Text Statistics:
- Characters (with spaces): ${formatNumber(stats.charactersWithSpaces)}
- Characters (without spaces): ${formatNumber(stats.charactersWithoutSpaces)}
- Words: ${formatNumber(stats.words)}
- Sentences: ${formatNumber(stats.sentences)}
- Paragraphs: ${formatNumber(stats.paragraphs)}
- Lines: ${formatNumber(stats.lines)}
- Reading time: ${stats.readingTime}
- Speaking time: ${stats.speakingTime}`;

      const success = await copyToClipboard(statsText);
      showToastMessage(success ? "Statistics copied!" : "Failed to copy");
    } catch (error) {
      console.error('Copy stats operation failed:', error);
      showToastMessage("Failed to copy statistics. Please try again.");
    }
  }, [stats, showToastMessage]);

  const handlePaste = useCallback(async () => {
    try {
      const pastedText = await pasteFromClipboard();
      if (pastedText !== null) {
        setText(pastedText);
        showToastMessage("Text pasted!");
      } else {
        showToastMessage("No text to paste or clipboard unavailable");
      }
    } catch (error) {
      console.error('Paste operation failed:', error);
      showToastMessage("Paste failed. Please check clipboard permissions.");
    }
  }, [showToastMessage]);

  const handleClear = useCallback(() => {
    if (text.length > 100 && !isConfirmingClear) {
      setIsConfirmingClear(true);
      return;
    }

    setText("");
    setIsConfirmingClear(false);
    showToastMessage("Text cleared!");
  }, [text.length, isConfirmingClear, showToastMessage]);

  // Reset confirmation state when text changes
  useEffect(() => {
    if (isConfirmingClear && text.length <= 100) {
      setIsConfirmingClear(false);
    }
  }, [text.length, isConfirmingClear]);

  const handleFindReplace = useCallback((replaceAll: boolean = true) => {
    try {
      if (!findText.trim()) {
        showToastMessage("Please enter text to find");
        return;
      }

      const result = findAndReplace(text, findText, replaceText, {
        caseSensitive,
        replaceAll,
      });

      setText(result.text);
      showToastMessage(
        result.count > 0
          ? `Replaced ${result.count} occurrence${result.count > 1 ? "s" : ""}`
          : "No matches found"
      );
    } catch (error) {
      console.error('Find and replace operation failed:', error);
      showToastMessage("Find and replace operation failed");
    }
  }, [findText, replaceText, text, caseSensitive, showToastMessage]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="w-4 h-4" />;
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "sms":
        return <MessageSquare className="w-4 h-4" />;
      case "facebook":
        return <Facebook className="w-4 h-4" />;
      case "linkedin":
        return <Linkedin className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setShowWelcome(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 cursor-pointer"
          >
            <div className="text-center px-4">
              <TextGenerateEffect
                words="Welcome to Character Counter"
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
                duration={0.5}
              />
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                Start typing to analyze your text...
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Click anywhere to continue
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Character Counter
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time text analysis tool
                </p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Text Input */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="sr-only">Text Input and Analysis Tools</h2>
            {/* Textarea */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="w-full h-96 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent overflow-hidden">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start typing or paste your text here..."
                  className="w-full h-full p-4 resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0"
                  style={{ fontSize: "16px" }}
                  aria-label="Text input for character counting and analysis"
                  spellCheck="true"
                  autoComplete="off"
                  autoCorrect="on"
                  autoCapitalize="sentences"
                />
              </div>


              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                <StatefulButton
                  onClick={async () => {
                    await handleCopyText();
                    return Promise.resolve();
                  }}
                  className="bg-blue-500 hover:ring-blue-500 text-white"
                >
                  <Copy className="w-4 h-4" />
                  Copy Text
                </StatefulButton>
                <StatefulButton
                  onClick={async () => {
                    await handlePaste();
                    return Promise.resolve();
                  }}
                  className="bg-green-500 hover:ring-green-500 text-white"
                >
                  <FileText className="w-4 h-4" />
                  Paste
                </StatefulButton>
                <StatefulButton
                  onClick={async () => {
                    handleClear();
                    return Promise.resolve();
                  }}
                  className={`hover:ring-red-500 text-white ${isConfirmingClear ? 'bg-orange-500' : 'bg-red-500'}`}
                >
                  <Trash2 className="w-4 h-4" />
                  {isConfirmingClear ? "Are you sure?" : "Clear"}
                </StatefulButton>
                <StatefulButton
                  onClick={async () => {
                    await handleCopyStats();
                    return Promise.resolve();
                  }}
                  className="bg-purple-500 hover:ring-purple-500 text-white"
                >
                  <Copy className="w-4 h-4" />
                  Copy Stats
                </StatefulButton>
                <StatefulButton
                  onClick={async () => {
                    try {
                      exportAsText(text);
                      showToastMessage("Text exported successfully!");
                    } catch (error) {
                      console.error('Export text failed:', error);
                      showToastMessage("Export failed. Please try again.");
                    }
                    return Promise.resolve();
                  }}
                  className="bg-gray-600 hover:ring-gray-600 text-white"
                >
                  <Download className="w-4 h-4" />
                  Export TXT
                </StatefulButton>
                <StatefulButton
                  onClick={async () => {
                    try {
                      exportStatsAsCSV(stats);
                      showToastMessage("Statistics exported successfully!");
                    } catch (error) {
                      console.error('Export CSV failed:', error);
                      showToastMessage("CSV export failed. Please try again.");
                    }
                    return Promise.resolve();
                  }}
                  className="bg-gray-600 hover:ring-gray-600 text-white"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </StatefulButton>
              </div>
            </div>

            {/* Text Transformation Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Text Tools
              </h2>

              <div className="space-y-4">
                {/* Case Conversion */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Case Conversion
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <StatefulButton
                      onClick={async () => {
                        try {
                          setText(toUpperCase(text));
                        } catch (error) {
                          console.error('Uppercase transformation failed:', error);
                          showToastMessage("Transformation failed");
                        }
                        return Promise.resolve();
                      }}
                      className="px-3 py-1.5 bg-indigo-500 hover:ring-indigo-500 text-xs min-w-[100px] text-white"
                    >
                      UPPERCASE
                    </StatefulButton>
                    <StatefulButton
                      onClick={async () => {
                        try {
                          setText(toLowerCase(text));
                        } catch (error) {
                          console.error('Lowercase transformation failed:', error);
                          showToastMessage("Transformation failed");
                        }
                        return Promise.resolve();
                      }}
                      className="px-3 py-1.5 bg-indigo-500 hover:ring-indigo-500 text-xs min-w-[100px] text-white"
                    >
                      lowercase
                    </StatefulButton>
                    <StatefulButton
                      onClick={async () => {
                        try {
                          setText(toTitleCase(text));
                        } catch (error) {
                          console.error('Title case transformation failed:', error);
                          showToastMessage("Transformation failed");
                        }
                        return Promise.resolve();
                      }}
                      className="px-3 py-1.5 bg-indigo-500 hover:ring-indigo-500 text-xs min-w-[100px] text-white"
                    >
                      Title Case
                    </StatefulButton>
                    <StatefulButton
                      onClick={async () => {
                        try {
                          setText(toSentenceCase(text));
                        } catch (error) {
                          console.error('Sentence case transformation failed:', error);
                          showToastMessage("Transformation failed");
                        }
                        return Promise.resolve();
                      }}
                      className="px-3 py-1.5 bg-indigo-500 hover:ring-indigo-500 text-xs min-w-[100px] text-white"
                    >
                      Sentence case
                    </StatefulButton>
                  </div>
                </div>

                {/* Text Cleanup */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Cleanup
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <StatefulButton
                      onClick={async () => {
                        try {
                          setText(removeExtraSpaces(text));
                          showToastMessage("Extra spaces removed");
                        } catch (error) {
                          console.error('Remove extra spaces failed:', error);
                          showToastMessage("Operation failed");
                        }
                        return Promise.resolve();
                      }}
                      className="px-3 py-1.5 bg-teal-500 hover:ring-teal-500 text-xs min-w-[140px] text-white"
                    >
                      Remove Extra Spaces
                    </StatefulButton>
                    <StatefulButton
                      onClick={async () => {
                        try {
                          setText(removeLineBreaks(text));
                          showToastMessage("Line breaks removed");
                        } catch (error) {
                          console.error('Remove line breaks failed:', error);
                          showToastMessage("Operation failed");
                        }
                        return Promise.resolve();
                      }}
                      className="px-3 py-1.5 bg-teal-500 hover:ring-teal-500 text-xs min-w-[140px] text-white"
                    >
                      Remove Line Breaks
                    </StatefulButton>
                  </div>
                </div>

                {/* Find and Replace */}
                <div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <Search className="w-4 h-4" />
                    Find and Replace
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <input
                          type="text"
                          value={findText}
                          onChange={(e) => setFindText(e.target.value)}
                          placeholder="Find..."
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Text to find"
                        />
                        <input
                          type="text"
                          value={replaceText}
                          onChange={(e) => setReplaceText(e.target.value)}
                          placeholder="Replace with..."
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Replacement text"
                        />
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={caseSensitive}
                              onChange={(e) => setCaseSensitive(e.target.checked)}
                              className="rounded focus:ring-2 focus:ring-blue-500"
                              aria-describedby="case-sensitive-description"
                            />
                            Case sensitive
                          </label>
                          <div id="case-sensitive-description" className="sr-only">
                            When enabled, find and replace will be case-sensitive
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <StatefulButton
                            onClick={async () => {
                              try {
                                handleFindReplace(false);
                              } catch (error) {
                                console.error('Find and replace failed:', error);
                                showToastMessage("Replace operation failed");
                              }
                              return Promise.resolve();
                            }}
                            className="px-3 py-1.5 bg-blue-500 hover:ring-blue-500 text-xs min-w-[100px] text-white"
                          >
                            Replace
                          </StatefulButton>
                          <StatefulButton
                            onClick={async () => {
                              try {
                                handleFindReplace(true);
                              } catch (error) {
                                console.error('Replace all failed:', error);
                                showToastMessage("Replace all operation failed");
                              }
                              return Promise.resolve();
                            }}
                            className="px-3 py-1.5 bg-blue-500 hover:ring-blue-500 text-xs min-w-[100px] text-white"
                          >
                            Replace All
                          </StatefulButton>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Statistics */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="sr-only">Text Statistics and Platform Limits</h2>
            {/* Platform Limits */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PLATFORMS).map(([key, platform]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPlatform(key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        selectedPlatform === key
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {getPlatformIcon(key)}
                      {platform.name.split(" ")[0]}
                    </button>
                  ))}
                </div>

                {selectedPlatform === "custom" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom Limit
                    </label>
                    <input
                      type="number"
                      value={customLimit}
                      onChange={(e) =>
                        setCustomLimit(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      min="1"
                      max="1000000"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Custom character limit"
                      aria-describedby="custom-limit-description"
                    />
                    <div id="custom-limit-description" className="sr-only">
                      Set a custom character limit for text analysis (minimum: 1, maximum: 1,000,000)
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {PLATFORMS[selectedPlatform].name}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: limitStatus.color }}
                    >
                      {formatNumber(limitStatus.current)} / {formatNumber(currentLimit)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(limitStatus.percentage, 100)}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: limitStatus.color }}
                    />
                  </div>

                  <div className="mt-2 text-center">
                    <span
                      className="text-lg font-bold"
                      style={{ color: limitStatus.color }}
                    >
                      {limitStatus.remaining >= 0
                        ? `${formatNumber(limitStatus.remaining)} remaining`
                        : `${formatNumber(Math.abs(limitStatus.remaining))} over limit`}
                    </span>
                  </div>

                  {selectedPlatform === "sms" && smsCount > 1 && (
                    <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                      {smsCount} messages
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Core Statistics - MagicBento Grid */}
            <div className="bg-transparent rounded-xl p-2 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Statistics Overview
                </h2>
                {isAnalyzing && (
                  <LoaderFive text="Analyzing..." />
                )}
              </div>
              <StatsBento stats={stats} />
            </div>

            {/* Additional Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Detailed Stats
              </h2>
              <div className="space-y-3">
                <StatItem
                  label="Characters (without spaces)"
                  value={formatNumber(stats.charactersWithoutSpaces)}
                />
                <StatItem label="Lines" value={formatNumber(stats.lines)} />
                <StatItem
                  label="Avg word length"
                  value={`${stats.averageWordLength} chars`}
                />
                <StatItem
                  label="Avg sentence length"
                  value={`${stats.averageSentenceLength} words`}
                />
                {stats.longestWord && (
                  <StatItem
                    label="Longest word"
                    value={`${stats.longestWord} (${stats.longestWord.length})`}
                  />
                )}
              </div>
            </div>

            {/* Time Estimates */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Time Estimates
              </h2>

              <div className="space-y-3">
                <StatItem label="Speaking time" value={stats.speakingTime} />
              </div>
            </div>

            {/* Advanced Find & Replace */}
            <AdvancedFindReplace
              text={text}
              onTextChange={(newText) => {
                try {
                  setText(newText);
                } catch (error) {
                  console.error('Advanced find and replace failed:', error);
                  showToastMessage("Operation failed. Please try again.");
                }
              }}
            />

            {/* Keyword Density Analysis */}
            <KeywordAnalysis
              keywords={wordFrequency}
              isLoading={isAnalyzing}
              isProcessing={isProcessingKeywords}
              maxKeywords={maxKeywords}
            />
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-lg shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <motion.span
        key={value}
        initial={{ scale: 1.2, color: "#3B82F6" }}
        animate={{ scale: 1, color: "inherit" }}
        className="text-sm font-semibold text-gray-900 dark:text-gray-100"
      >
        {value}
      </motion.span>
    </div>
  );
}
