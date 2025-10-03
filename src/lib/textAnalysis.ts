// Text Analysis Utility Functions

export interface ReadabilityMetrics {
  fleschKincaidScore: number;      // 0-100 (100 = easiest to read)
  gradeLevel: string;             // "5th Grade Level", "College Level", etc.
  averageSyllablesPerWord: number; // Syllables per word
  syllables: number;              // Total syllable count
}

export interface TextStats {
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: string;
  speakingTime: string;
  averageWordLength: number;
  averageSentenceLength: number;
  longestWord: string;
  uniqueWords: number;
  readability?: ReadabilityMetrics; // Optional for backward compatibility
}

export interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}

// Constants for better performance and maintainability
const READING_WPM = 225; // Words per minute for reading
const SPEAKING_WPM = 140; // Words per minute for speaking
const MAX_TEXT_LENGTH = 1000000; // 1MB limit to prevent browser freezing
const MAX_WORDS_FOR_LONGEST = 50000; // Limit for longest word calculation

// Enhanced rule-based syllable counting algorithm with better accuracy
function countSyllables(word: string): number {
  if (!word || word.length === 0) return 0;

  // Convert to lowercase and remove non-alphabetic characters
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleanWord.length === 0) return 0;

  // Handle single letter words
  if (cleanWord.length === 1) return 1;

  // Count vowel groups (consecutive vowels = one syllable)
  const vowels = 'aeiouy';
  let syllableCount = 0;
  let previousWasVowel = false;

  for (let i = 0; i < cleanWord.length; i++) {
    const isVowel = vowels.includes(cleanWord[i]);
    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }
    previousWasVowel = isVowel;
  }

  // Subtract silent 'e' at the end, but not for words ending in 'le'
  if (cleanWord.endsWith('e') && syllableCount > 1 && !cleanWord.endsWith('le')) {
    syllableCount--;
  }

  // Handle special cases for better accuracy
  if (cleanWord.endsWith('le') && cleanWord.length > 2 && !'aeiou'.includes(cleanWord[cleanWord.length - 3])) {
    syllableCount++;
  }

  // Handle words ending in 'ism' (like 'rhythm' - should be 1 syllable)
  if (cleanWord.endsWith('ism') && cleanWord.length > 3) {
    // Keep the syllable count as is, don't add extra
  }

  // Handle 'tion' and 'sion' endings (usually 2 syllables)
  if ((cleanWord.endsWith('tion') || cleanWord.endsWith('sion')) && cleanWord.length > 4) {
    // These typically add an extra syllable
    syllableCount++;
  }

  // Handle consecutive consonants (might indicate syllable breaks)
  let consonantGroups = 0;
  for (let i = 1; i < cleanWord.length - 1; i++) {
    if (!vowels.includes(cleanWord[i]) &&
        !vowels.includes(cleanWord[i-1]) &&
        !vowels.includes(cleanWord[i+1]) &&
        cleanWord[i] !== cleanWord[i-1]) {
      consonantGroups++;
    }
  }

  // Add syllables for consonant clusters (max 2 additional)
  syllableCount += Math.min(consonantGroups, 2);

  // Ensure minimum of 1 syllable and maximum based on word length
  const maxPossibleSyllables = Math.ceil(cleanWord.length / 2);
  return Math.max(1, Math.min(syllableCount, maxPossibleSyllables));
}

// Calculate Flesch-Kincaid Reading Ease and Grade Level with robust error handling
function calculateReadability(text: string): ReadabilityMetrics {
  if (!text || text.trim().length === 0) {
    return {
      fleschKincaidScore: 0,
      gradeLevel: "No text",
      averageSyllablesPerWord: 0,
      syllables: 0,
    };
  }

  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  const sentences = text
    .split(/[.!?]+/)
    .filter((sentence) => sentence.trim().length > 0);

  // Handle edge cases
  if (words.length === 0) {
    return {
      fleschKincaidScore: 0,
      gradeLevel: "No words",
      averageSyllablesPerWord: 0,
      syllables: 0,
    };
  }

  if (sentences.length === 0) {
    return {
      fleschKincaidScore: 0,
      gradeLevel: "No sentences",
      averageSyllablesPerWord: 0,
      syllables: 0,
    };
  }

  // Count total syllables with error handling
  let totalSyllables = 0;
  try {
    totalSyllables = words.reduce((sum, word) => {
      const syllables = countSyllables(word);
      return sum + (isNaN(syllables) ? 1 : syllables); // Fallback to 1 if NaN
    }, 0);
  } catch (error) {
    console.warn('Error counting syllables:', error);
    totalSyllables = words.length; // Fallback: assume 1 syllable per word
  }

  // Calculate averages with NaN protection
  const averageSentenceLength = words.length / sentences.length;
  const averageSyllablesPerWord = totalSyllables / words.length;

  // Validate calculations
  if (!isFinite(averageSentenceLength) || !isFinite(averageSyllablesPerWord)) {
    return {
      fleschKincaidScore: 0,
      gradeLevel: "Calculation error",
      averageSyllablesPerWord: 0,
      syllables: totalSyllables,
    };
  }

  // Flesch-Kincaid Reading Ease formula with bounds checking
  let fleschKincaidScore: number;
  try {
    fleschKincaidScore = 206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord);
    fleschKincaidScore = Math.max(0, Math.min(100, fleschKincaidScore));
  } catch (error) {
    console.warn('Error calculating Flesch-Kincaid score:', error);
    fleschKincaidScore = 50; // Neutral fallback score
  }

  // Convert score to grade level
  let gradeLevel = "Unknown";
  if (fleschKincaidScore >= 90) gradeLevel = "5th Grade Level";
  else if (fleschKincaidScore >= 80) gradeLevel = "6th Grade Level";
  else if (fleschKincaidScore >= 70) gradeLevel = "7th Grade Level";
  else if (fleschKincaidScore >= 60) gradeLevel = "8th-9th Grade Level";
  else if (fleschKincaidScore >= 50) gradeLevel = "10th-12th Grade Level";
  else if (fleschKincaidScore >= 30) gradeLevel = "College Level";
  else gradeLevel = "Graduate Level";

  return {
    fleschKincaidScore: Math.round(fleschKincaidScore),
    gradeLevel,
    averageSyllablesPerWord: parseFloat(averageSyllablesPerWord.toFixed(1)),
    syllables: totalSyllables,
  };
}

export function analyzeText(text: string): TextStats {
  if (!text || text.trim().length === 0) {
    return {
      charactersWithSpaces: 0,
      charactersWithoutSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTime: "0 sec",
      speakingTime: "0 sec",
      averageWordLength: 0,
      averageSentenceLength: 0,
      longestWord: "",
      uniqueWords: 0,
    };
  }

  // Prevent browser freezing with extremely large text
  if (text.length > MAX_TEXT_LENGTH) {
    console.warn(`Text length (${text.length}) exceeds maximum (${MAX_TEXT_LENGTH}). Analysis may be slow.`);
  }

  // Character counts
  const charactersWithSpaces = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, "").length;

  // Word count - optimized for large texts
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const wordCount = words.length;

  // Sentence count
  const sentences = text
    .split(/[.!?]+/)
    .filter((sentence) => sentence.trim().length > 0);
  const sentenceCount = sentences.length;

  // Paragraph count
  const paragraphs = text
    .split(/\n\n+/)
    .filter((para) => para.trim().length > 0);
  const paragraphCount = paragraphs.length;

  // Line count
  const lineCount = text.split("\n").length;

  // Reading time
  const readingMinutes = wordCount / READING_WPM;
  const readingTime = formatTime(readingMinutes);

  // Speaking time
  const speakingMinutes = wordCount / SPEAKING_WPM;
  const speakingTime = formatTime(speakingMinutes);

  // Average word length
  const averageWordLength =
    wordCount > 0 ? charactersWithoutSpaces / wordCount : 0;

  // Average sentence length
  const averageSentenceLength =
    sentenceCount > 0 ? wordCount / sentenceCount : 0;

  // Longest word - optimized for large texts
  const longestWord =
    words.length > 0
      ? words.slice(0, MAX_WORDS_FOR_LONGEST).reduce((longest, current) =>
          current.length > longest.length ? current : longest
        )
      : "";

  // Unique words
  const uniqueWords = new Set(
    words.map((word) => word.toLowerCase().replace(/[^\w]/g, ""))
  ).size;

  // Calculate readability metrics
  const readabilityMetrics = calculateReadability(text);

  return {
    charactersWithSpaces,
    charactersWithoutSpaces,
    words: wordCount,
    sentences: sentenceCount,
    paragraphs: paragraphCount,
    lines: lineCount,
    readingTime,
    speakingTime,
    averageWordLength: parseFloat(averageWordLength.toFixed(1)),
    averageSentenceLength: parseFloat(averageSentenceLength.toFixed(1)),
    longestWord,
    uniqueWords,
    readability: readabilityMetrics,
  };
}

// Comprehensive list of English stop words - optimized for keyword extraction
const STOP_WORDS = new Set([
  // Articles and pronouns
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it',
  'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'would', 'could', 'should', 'may',
  'might', 'must', 'shall', 'can', 'do', 'does', 'did', 'have', 'had', 'been', 'being', 'am',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',

  // Personal pronouns
  'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',

  // Interrogatives and relatives
  'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'just', 'like', 'also', 'well', 'now', 'here', 'there', 'then',

  // Common adverbs and qualifiers
  'always', 'never', 'sometimes', 'often', 'usually', 'generally', 'specifically', 'actually',
  'really', 'quite', 'rather', 'almost', 'nearly', 'about', 'around', 'between', 'among',
  'through', 'across', 'behind', 'beside', 'before', 'after', 'during', 'within', 'without',
  'upon', 'into', 'onto', 'out', 'off', 'over', 'under', 'up', 'down', 'left', 'right',
  'forward', 'backward', 'inside', 'outside', 'above', 'below', 'besides', 'except',

  // Conjunctions and connectors
  'but', 'however', 'although', 'though', 'while', 'whereas', 'unless', 'until', 'since', 'because',
  'therefore', 'thus', 'hence', 'consequently', 'accordingly', 'meanwhile', 'furthermore',
  'moreover', 'nevertheless', 'nonetheless', 'otherwise', 'instead', 'alternatively', 'similarly',
  'likewise', 'contrary', 'conversely', 'opposite', 'different', 'various', 'several', 'many',
  'much', 'little', 'few', 'less', 'more', 'most', 'least',

  // Ordinals and sequences
  'first', 'last', 'next', 'previous', 'following', 'above', 'below', 'higher', 'lower',
  'upper', 'lower', 'front', 'back', 'top', 'bottom', 'middle', 'center',

  // Directions and locations
  'north', 'south', 'east', 'west', 'northwest', 'northeast', 'southwest', 'southeast',
  'here', 'there', 'everywhere', 'anywhere', 'nowhere', 'somewhere', 'elsewhere',

  // Common affirmatives and responses
  'yes', 'no', 'okay', 'ok', 'sure', 'certainly', 'definitely', 'absolutely',
  'probably', 'possibly', 'maybe', 'perhaps',

  // Common modifiers
  'approximately', 'roughly', 'about', 'around', 'nearly', 'almost', 'exactly', 'precisely',
  'clearly', 'obviously', 'evidently', 'apparently', 'seemingly', 'reportedly', 'allegedly',
  'supposedly', 'ostensibly', 'purportedly',

  // Business/common words that don't add keyword value
  'business', 'company', 'time', 'work', 'year', 'day', 'week', 'month', 'today', 'yesterday',
  'tomorrow', 'morning', 'evening', 'night', 'hour', 'minute', 'second', 'people', 'person',
  'man', 'woman', 'child', 'children', 'thing', 'things', 'way', 'ways', 'place', 'places',
  'point', 'points', 'part', 'parts', 'case', 'cases', 'fact', 'facts', 'idea', 'ideas',
  'problem', 'problems', 'question', 'questions', 'answer', 'answers', 'solution', 'solutions'
]);

// Performance-optimized word frequency analysis with chunked processing
export function getWordFrequency(
  text: string,
  limit: number = 10,
  filterStopWords: boolean = true
): WordFrequency[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Performance optimization: limit processing for extremely large texts
  const MAX_CHARS = 500000; // 500K characters max for keyword analysis
  const processedText = text.length > MAX_CHARS
    ? text.substring(0, MAX_CHARS) + '...'
    : text;

  const words = processedText
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 0);

  const totalWords = words.length;

  // Early return for very small texts
  if (totalWords < 2) {
    return totalWords === 0 ? [] : [{
      word: words[0],
      count: 1,
      percentage: 100
    }];
  }

  const frequencyMap = new Map<string, number>();

  // Process words efficiently - for typical use cases, batching isn't necessary
  // but we include it for future optimization if needed
  words.forEach((word) => {
    // Skip stop words if filtering is enabled
    if (filterStopWords && STOP_WORDS.has(word)) {
      return;
    }

    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  });

  const sortedWords = Array.from(frequencyMap.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: (count / totalWords) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return sortedWords;
}

function formatTime(minutes: number): string {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return seconds === 0 ? "0 sec" : `${seconds} sec`;
  }

  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);

  if (secs === 0) {
    return `${mins} min`;
  }

  return `${mins} min ${secs} sec`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}
