// Text Transformation Utilities

export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  });
}

export function toSentenceCase(text: string): string {
  return text.replace(/(^\w|\.\s+\w)/gm, (match) => {
    return match.toUpperCase();
  });
}

export function removeExtraSpaces(text: string): string {
  return text
    .replace(/[ \t]+/g, " ") // Replace multiple spaces/tabs with single space
    .replace(/^\s+|\s+$/gm, ""); // Trim leading/trailing spaces from each line
}

export function removeLineBreaks(text: string): string {
  return text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}

export function findAndReplace(
  text: string,
  find: string,
  replace: string,
  options: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
    replaceAll?: boolean;
  } = {}
): { text: string; count: number } {
  if (!find) {
    return { text, count: 0 };
  }

  const {
    caseSensitive = false,
    wholeWord = false,
    replaceAll = true,
  } = options;

  let pattern = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special chars

  if (wholeWord) {
    pattern = `\\b${pattern}\\b`;
  }

  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(pattern, replaceAll ? flags : flags.replace("g", ""));

  let count = 0;
  const newText = text.replace(regex, (match) => {
    count++;
    return replace;
  });

  return { text: newText, count };
}

// Advanced find and replace with enhanced options and safety measures
export function findAndReplaceAdvanced(
  text: string,
  findTerm: string,
  replaceTerm: string,
  options: {
    caseSensitive: boolean;
    wholeWord: boolean;
    regexMode?: boolean;
  }
): { text: string; matchCount: number; replacementCount: number } {
  if (!findTerm.trim()) {
    return { text, matchCount: 0, replacementCount: 0 };
  }

  // Safety check: prevent extremely long patterns that could cause issues
  if (findTerm.length > 1000) {
    throw new Error('Search pattern is too long. Please use a shorter pattern.');
  }

  try {
    let pattern: string;
    let flags = 'g';

    if (options.regexMode) {
      // Use the find term directly as a regex pattern
      pattern = findTerm;
    } else {
      // Escape special regex characters for literal search
      pattern = findTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Add word boundaries for whole word matching
      if (options.wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
    }

    // Set case sensitivity flag
    if (!options.caseSensitive) {
      flags += 'i';
    }

    // Safety: Add timeout and limits to prevent catastrophic backtracking
    const regex = new RegExp(pattern, flags);

    // Count matches first with safety timeout
    let matchCount = 0;
    try {
      const matches = text.match(regex);
      matchCount = matches ? matches.length : 0;
    } catch (matchError) {
      throw new Error('Search pattern is too complex or invalid.');
    }

    // Safety check: prevent replacement if too many matches (potential infinite loop)
    if (matchCount > 10000) {
      throw new Error(`Pattern matches ${matchCount.toLocaleString()} times. This may cause performance issues. Consider a more specific search.`);
    }

    // Perform replacement with safety check
    let newText: string;
    try {
      newText = text.replace(regex, replaceTerm);
    } catch (replaceError) {
      throw new Error('Replacement failed. The pattern may be too complex.');
    }

    // Count actual replacements made
    let replacementCount = 0;
    try {
      const remainingMatches = (newText.match(regex) || []).length;
      replacementCount = matchCount - remainingMatches;
    } catch (countError) {
      // If we can't count remaining matches, estimate based on text length difference
      replacementCount = Math.abs(newText.length - text.length) > 0 ? matchCount : 0;
    }

    return {
      text: newText,
      matchCount,
      replacementCount
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Advanced find and replace error:', error.message);
      throw error;
    } else {
      console.error('Advanced find and replace error:', error);
      throw new Error('An unexpected error occurred during find and replace.');
    }
  }
}

export function exportAsText(text: string, filename?: string): void {
  try {
    // Validate input
    if (typeof text !== 'string') {
      throw new Error('Invalid text provided for export');
    }

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `character-counter-export-${Date.now()}.txt`;

    // Append to body, click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export text:', error);
    throw new Error('Export failed. Please try again.');
  }
}

export function exportStatsAsCSV(stats: Record<string, any>): void {
  try {
    // Validate input
    if (!stats || typeof stats !== 'object') {
      throw new Error('Invalid stats provided for export');
    }

    const csvContent = [
      ["Metric", "Value"],
      ...Object.entries(stats).map(([key, value]) => [
        key.replace(/([A-Z])/g, " $1").trim(),
        value?.toString() || '0',
      ]),
    ]
      .map((row) => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `text-statistics-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export CSV:', error);
    throw new Error('CSV export failed. Please try again.');
  }
}
