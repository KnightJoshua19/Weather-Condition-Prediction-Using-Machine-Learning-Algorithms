import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Undo2, Redo2, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, Highlighter,
  ChevronDown, Sparkles, X, Check, AlertTriangle,
  Info, Wand2, FileText, Download, ArrowLeft, Save,
  Palette, Minus, Subscript, Superscript, Link,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { theme } from '../config/theme';
import { DraggableAIButton } from './draggable-ai-button';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type SuggestionType = 'word' | 'sentence' | 'paragraph' | 'style';

interface AISuggestion {
  id: string;
  type: SuggestionType;
  label: string;
  original: string;
  suggestion: string;
  reason: string;
}

// ─────────────────────────────────────────────
// Simulated AI Analysis Data
// ─────────────────────────────────────────────
const INFORMAL_WORDS: Record<string, string> = {
  'gonna': 'going to',
  'wanna': 'want to',
  'gotta': 'have to',
  'kinda': 'somewhat',
  'sorta': 'somewhat',
  'yeah': 'yes',
  'nope': 'no',
  'ok': 'acceptable',
  'okay': 'acceptable',
  'stuff': 'subject matter',
  'things': 'provisions',
  'a lot of': 'numerous',
  'lots of': 'numerous',
  'super': 'extremely',
  'huge': 'substantial',
  'get': 'obtain',
  'use': 'utilize',
  'show': 'demonstrate',
  'help': 'assist',
  'need': 'require',
  'buy': 'purchase',
  'start': 'commence',
  'end': 'terminate',
  'about': 'approximately',
  'make sure': 'ensure',
  'find out': 'ascertain',
  'set up': 'establish',
  'look into': 'investigate',
  'deal with': 'address',
  'come up with': 'formulate',
  'go ahead': 'proceed',
};

const CONTRACTIONS: Record<string, string> = {
  "can't": 'cannot',
  "won't": 'will not',
  "don't": 'do not',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "hasn't": 'has not',
  "haven't": 'have not',
  "hadn't": 'had not',
  "it's": 'it is',
  "that's": 'that is',
  "there's": 'there is',
  "they're": 'they are',
  "we're": 'we are',
  "you're": 'you are',
  "I'm": 'I am',
  "I've": 'I have',
  "I'll": 'I will',
  "I'd": 'I would',
  "we've": 'we have',
  "we'll": 'we will',
  "could've": 'could have',
  "should've": 'should have',
  "would've": 'would have',
};

const REDUNDANT_PHRASES: Record<string, string> = {
  'null and void': 'void',
  'each and every': 'each',
  'cease and desist': 'cease',
  'any and all': 'all',
  'first and foremost': 'first',
  'true and correct': 'accurate',
  'full and complete': 'complete',
  'over and above': 'beyond',
  'unless and until': 'until',
  'if and when': 'when',
  'save and except': 'except',
};

const VAGUE_TERMS = [
  'etc.', 'and so on', 'and so forth', 'among others',
  'or otherwise', 'or similar', 'and the like',
];

function analyzeText(text: string): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  let idCounter = 0;

  if (!text.trim()) return [];

  // 1. Informal words
  for (const [word, replacement] of Object.entries(INFORMAL_WORDS)) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text)) {
      suggestions.push({
        id: `word-${idCounter++}`,
        type: 'word',
        label: 'Informal Word',
        original: word,
        suggestion: replacement,
        reason: `"${word}" is informal. In legal documents, prefer "${replacement}" for professional precision and formal tone.`,
      });
    }
  }

  // 2. Contractions
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    const escaped = contraction.replace(/'/g, "['\u2019]");
    const regex = new RegExp(escaped, 'gi');
    if (regex.test(text)) {
      suggestions.push({
        id: `style-${idCounter++}`,
        type: 'style',
        label: 'Contraction Detected',
        original: contraction,
        suggestion: expansion,
        reason: `Contractions like "${contraction}" are informal. Legal documents require "${expansion}" to maintain formal register and interpretive clarity.`,
      });
    }
  }

  // 3. Redundant legal phrases
  const textLower = text.toLowerCase();
  for (const [phrase, replacement] of Object.entries(REDUNDANT_PHRASES)) {
    if (textLower.includes(phrase.toLowerCase())) {
      suggestions.push({
        id: `para-${idCounter++}`,
        type: 'paragraph',
        label: 'Legal Redundancy',
        original: phrase,
        suggestion: replacement,
        reason: `"${phrase}" is a legal doublet with redundant meaning. "${replacement}" carries identical legal weight and is more concise.`,
      });
    }
  }

  // 4. Passive voice
  const passivePatterns = [
    /\b(was|were|is|are|been|be)\s+\w+ed\b/gi,
    /\b(has|have|had)\s+been\s+\w+ed\b/gi,
  ];
  let passiveFound = false;
  for (const pattern of passivePatterns) {
    const match = text.match(pattern);
    if (!passiveFound && match) {
      suggestions.push({
        id: `sent-passive-${idCounter++}`,
        type: 'sentence',
        label: 'Passive Voice',
        original: `Passive construction (e.g., "${match[0]}")`,
        suggestion: 'Restructure using active voice (Subject + Verb + Object)',
        reason: 'Passive voice can create ambiguity about which party bears an obligation. Active voice provides unambiguous attribution of rights, duties, and liabilities.',
      });
      passiveFound = true;
    }
  }

  // 5. Run-on sentences
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 45);
  if (longSentences.length > 0) {
    const excerpt = longSentences[0].trim().split(/\s+/).slice(0, 10).join(' ') + '…';
    suggestions.push({
      id: `sent-long-${idCounter++}`,
      type: 'sentence',
      label: 'Run-On Sentence',
      original: excerpt,
      suggestion: 'Split into shorter, single-concept sentences.',
      reason: 'Sentences exceeding 45 words reduce readability. Each legal sentence should express one clear obligation, right, or condition to prevent ambiguous interpretation.',
    });
  }

  // 6. Vague terms
  for (const term of VAGUE_TERMS) {
    if (textLower.includes(term.toLowerCase())) {
      suggestions.push({
        id: `word-vague-${idCounter++}`,
        type: 'word',
        label: 'Vague Language',
        original: term,
        suggestion: 'Enumerate all applicable items explicitly',
        reason: `"${term}" is imprecise and unenforceable in legal drafting. Courts may interpret such language narrowly. All covered items must be explicitly listed.`,
      });
    }
  }

  // 7. First-person pronouns
  if (/\b(I|we|my|our|I've|I'll|I'd|we've|we'll)\b/.test(text)) {
    suggestions.push({
      id: `style-fp-${idCounter++}`,
      type: 'style',
      label: 'First-Person Pronoun',
      original: '"I", "We", "My", or "Our"',
      suggestion: 'The Party / The Licensor / The Contractor (as defined)',
      reason: 'First-person pronouns are informal in legal instruments. Replace with defined party designations (e.g., "the Licensor", "the Obligor") to avoid ambiguity in multi-party contexts.',
    });
  }

  // 8. Double negatives
  if (/\b(not\s+un\w+|cannot\s+not|not\s+without\s+not)\b/gi.test(text)) {
    suggestions.push({
      id: `sent-double-neg-${idCounter++}`,
      type: 'sentence',
      label: 'Double Negative',
      original: 'Double negative construction',
      suggestion: 'Rephrase using clear affirmative or negative language',
      reason: 'Double negatives create interpretive ambiguity in legal texts. Courts and parties may disagree on the intended meaning. Use unambiguous positive or negative statements.',
    });
  }

  // 9. Informal paragraph check (short document)
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount > 0 && wordCount < 30) {
    suggestions.push({
      id: `para-short-${idCounter++}`,
      type: 'paragraph',
      label: 'Incomplete Document',
      original: 'Document is too brief for a legal instrument',
      suggestion: 'Add: Title, Parties, Recitals, Definitions, Operative Clauses, Term, Termination, Governing Law, Signature Block',
      reason: 'A complete legal document requires standardized structural elements. Missing sections may render the document unenforceable or create interpretive disputes.',
    });
  }

  // 10. Informal writing style detection (colloquial phrases)
  const colloquialPhrases = ['as soon as possible', 'asap', 'feel free', 'please note', 'please be advised', 'kindly'];
  for (const phrase of colloquialPhrases) {
    if (textLower.includes(phrase)) {
      suggestions.push({
        id: `style-coll-${idCounter++}`,
        type: 'style',
        label: 'Colloquial Expression',
        original: phrase,
        suggestion: phrase === 'asap' || phrase === 'as soon as possible' ? 'within [X] business days of notice' : 'Remove or rephrase formally',
        reason: `"${phrase}" is informal or ambiguous. Legal documents require precise timeframes and formal language that leaves no room for subjective interpretation.`,
      });
    }
  }

  return suggestions;
}

// ─────────────────────────────────────────────
// Color Palettes
// ─────────────────────────────────────────────
const TEXT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Navy', value: '#152A38' },
  { name: 'Dark Green', value: '#2D5A27' },
  { name: 'Dark Red', value: '#8B1A1A' },
  { name: 'Dark Blue', value: '#1A3A6B' },
  { name: 'Grey', value: '#555555' },
  { name: 'White', value: '#FFFFFF' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Lime', value: '#CCFF99' },
  { name: 'Cyan', value: '#B3ECFF' },
  { name: 'Pink', value: '#FFB6C1' },
  { name: 'Orange', value: '#FFD580' },
  { name: 'None', value: 'none' },
];

const FONTS = [
  'Times New Roman',
  'Arial',
  'Calibri',
  'Georgia',
  'Garamond',
  'Book Antiqua',
  'Palatino Linotype',
  'Courier New',
];

const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '36', '48', '72'];

const FONT_SIZE_MAP: Record<string, string> = {
  '8': '1', '9': '1', '10': '2', '11': '2', '12': '3',
  '14': '4', '16': '4', '18': '5', '20': '5', '24': '6',
  '28': '6', '36': '7', '48': '7', '72': '7',
};

const HEADING_STYLES = [
  { label: 'Normal Text', cmd: 'p' },
  { label: 'Heading 1', cmd: 'h1' },
  { label: 'Heading 2', cmd: 'h2' },
  { label: 'Heading 3', cmd: 'h3' },
  { label: 'Heading 4', cmd: 'h4' },
  { label: 'Blockquote', cmd: 'blockquote' },
  { label: 'Preformatted', cmd: 'pre' },
];

const SUGGESTION_CONFIG: Record<SuggestionType, { color: string; bg: string; icon: React.ReactNode; badge: string }> = {
  word:      { color: '#f87171', bg: 'rgba(248,113,113,0.15)',  icon: <AlertTriangle className="size-3.5" />, badge: 'Word Choice' },
  sentence:  { color: '#fb923c', bg: 'rgba(251,146,60,0.15)',   icon: <Info className="size-3.5" />,          badge: 'Sentence'    },
  paragraph: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',   icon: <FileText className="size-3.5" />,      badge: 'Paragraph'   },
  style:     { color: '#c084fc', bg: 'rgba(192,132,252,0.15)',  icon: <Wand2 className="size-3.5" />,         badge: 'Style'       },
};

// ─────────────────────────────────────────────
// Toolbar primitives
// ─────────────────────────────────────────────
function TBtn({
  children, onClick, onMouseDown, title, active = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      onMouseDown={onMouseDown}
      onClick={onClick}
      title={title}
      className="p-1.5 rounded transition-colors flex items-center justify-center"
      style={{
        color: theme.colors.font,
        backgroundColor: active ? `${theme.colors.theme}30` : 'transparent',
      }}
      onMouseEnter={e => !active && (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)')}
      onMouseLeave={e => !active && (e.currentTarget.style.backgroundColor = active ? `${theme.colors.theme}30` : 'transparent')}
    >
      {children}
    </button>
  );
}

function TDivider() {
  return <div className="w-px h-5 mx-1 opacity-25 flex-shrink-0" style={{ backgroundColor: theme.colors.font }} />;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
interface DocumentDraftingProps {
  onBack: () => void;
}

export function DocumentDrafting({ onBack }: DocumentDraftingProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const [docTitle, setDocTitle] = useState('Untitled Legal Document');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiPanelWidth, setAiPanelWidth] = useState(360);
  const [isResizing, setIsResizing] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Active toolbar states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Current font/size
  const [currentFont, setCurrentFont] = useState('Times New Roman');
  const [currentSize, setCurrentSize] = useState('12');
  const [currentStyle, setCurrentStyle] = useState('Normal Text');

  // Constants for resize limits
  const MIN_PANEL_WIDTH = 280;
  const MAX_PANEL_WIDTH = 600;

  // ── Handle resize ───────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= MIN_PANEL_WIDTH && newWidth <= MAX_PANEL_WIDTH) {
        setAiPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // ── execCommand helper ──────────────────────
  const execCmd = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value ?? '');
    // Update active states
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  }, []);

  // Prevent focus loss when clicking toolbar
  const noFocus = (e: React.MouseEvent) => e.preventDefault();

  // Close all dropdowns
  const closeDropdowns = () => setOpenDropdown(null);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenDropdown(prev => (prev === name ? null : name));
  };

  // ── Cursor state tracking ───────────────────
  const updateCursorState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  // ── Word/char count ─────────────────────────
  const updateCounts = () => {
    const text = editorRef.current?.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.replace(/\s/g, '').length);
  };

  // ── AI Analysis ─────────────────────────────
  const handleAnalyze = async () => {
    if (!editorRef.current) return;
    setIsAnalyzing(true);
    setIsAIPanelOpen(true);
    setHasAnalyzed(false);

    const text = editorRef.current.innerText || '';

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const results = analyzeText(text);
    setSuggestions(results);
    setIsAnalyzing(false);
    setHasAnalyzed(true);
  };

  // ── Accept suggestion ───────────────────────
  const acceptSuggestion = (suggestion: AISuggestion) => {
    if (editorRef.current) {
      const original = suggestion.original;
      const isReplaceableText =
        !original.includes('(e.g.') &&
        !original.includes('Current') &&
        !original.includes('"I"') &&
        !original.includes('Passive') &&
        !original.includes('Double') &&
        !original.includes('Document') &&
        !original.includes('too brief');

      if (isReplaceableText) {
        const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
          regex,
          `<mark style="background: rgba(144,238,144,0.3); border-bottom: 2px solid #2D5A27; border-radius: 2px;">${suggestion.suggestion}</mark>`
        );
      }
    }
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  // ── Download ────────────────────────────────
  const handleDownload = () => {
    const content = editorRef.current?.innerText || '';
    const blob = new Blob(
      [`${docTitle}\n${'─'.repeat(Math.min(docTitle.length, 60))}\n\n${content}`],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => closeDropdowns();
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: theme.colors.dominant }}
    >
      {/* ── Top Bar ─────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0 shadow-sm"
        style={{ backgroundColor: theme.colors.theme }}
      >
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-opacity hover:opacity-70 flex-shrink-0"
            style={{ backgroundColor: theme.colors.accent, color: theme.colors.dominant }}
            title="Save document"
          >
            <Save className="size-4" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <div className="w-px h-5 opacity-30 flex-shrink-0" style={{ backgroundColor: theme.colors.dominant }} />

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-opacity hover:opacity-70 flex-shrink-0"
            style={{ color: theme.colors.dominant }}
          >
            <ArrowLeft className="size-4" />
            <span>Back</span>
          </button>

          <div className="w-px h-5 opacity-30 flex-shrink-0" style={{ backgroundColor: theme.colors.dominant }} />

          {/* Document Title */}
          <input
            type="text"
            value={docTitle}
            onChange={e => setDocTitle(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium min-w-0 flex-1 max-w-xs"
            style={{ color: theme.colors.dominant }}
            placeholder="Document title…"
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs opacity-50 hidden sm:block" style={{ color: theme.colors.dominant }}>
            {wordCount} words · {charCount} chars
          </span>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────── */}
      <div
        className="flex items-center gap-0.5 px-2 py-1 border-b flex-shrink-0 flex-wrap"
        style={{ backgroundColor: '#EEF0EA', borderColor: `${theme.colors.font}18` }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Undo / Redo */}
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('undo')} title="Undo (Ctrl+Z)">
          <Undo2 className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('redo')} title="Redo (Ctrl+Y)">
          <Redo2 className="size-4" />
        </TBtn>

        <TDivider />

        {/* Paragraph Style */}
        <div className="relative" onMouseDown={e => e.stopPropagation()}>
          <button
            onMouseDown={e => toggleDropdown('style', e)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-black/10 transition-colors"
            style={{ color: theme.colors.font }}
          >
            <span className="w-24 text-left truncate">{currentStyle}</span>
            <ChevronDown className="size-3 flex-shrink-0" />
          </button>
          {openDropdown === 'style' && (
            <div
              className="absolute top-full left-0 mt-1 rounded-lg shadow-xl z-50 min-w-[168px] py-1 overflow-hidden"
              style={{ backgroundColor: '#fff', border: `1px solid ${theme.colors.font}18` }}
            >
              {HEADING_STYLES.map(h => (
                <button
                  key={h.cmd}
                  onMouseDown={e => {
                    e.preventDefault();
                    execCmd('formatBlock', h.cmd);
                    setCurrentStyle(h.label);
                    closeDropdowns();
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-black/5 transition-colors"
                  style={{ color: theme.colors.font }}
                >
                  {h.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <TDivider />

        {/* Font Family */}
        <div className="relative" onMouseDown={e => e.stopPropagation()}>
          <button
            onMouseDown={e => toggleDropdown('font', e)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-black/10 transition-colors"
            style={{ color: theme.colors.font }}
          >
            <span className="w-32 text-left truncate" style={{ fontFamily: currentFont }}>
              {currentFont}
            </span>
            <ChevronDown className="size-3 flex-shrink-0" />
          </button>
          {openDropdown === 'font' && (
            <div
              className="absolute top-full left-0 mt-1 rounded-lg shadow-xl z-50 min-w-[200px] py-1"
              style={{ backgroundColor: '#fff', border: `1px solid ${theme.colors.font}18` }}
            >
              {FONTS.map(f => (
                <button
                  key={f}
                  onMouseDown={e => {
                    e.preventDefault();
                    execCmd('fontName', f);
                    setCurrentFont(f);
                    closeDropdowns();
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-black/5 transition-colors"
                  style={{ fontFamily: f, color: theme.colors.font }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="relative" onMouseDown={e => e.stopPropagation()}>
          <button
            onMouseDown={e => toggleDropdown('size', e)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-black/10 transition-colors"
            style={{ color: theme.colors.font }}
          >
            <span className="w-7 text-center">{currentSize}</span>
            <ChevronDown className="size-3 flex-shrink-0" />
          </button>
          {openDropdown === 'size' && (
            <div
              className="absolute top-full left-0 mt-1 rounded-lg shadow-xl z-50 min-w-[72px] py-1 max-h-52 overflow-y-auto"
              style={{ backgroundColor: '#fff', border: `1px solid ${theme.colors.font}18` }}
            >
              {FONT_SIZES.map(s => (
                <button
                  key={s}
                  onMouseDown={e => {
                    e.preventDefault();
                    execCmd('fontSize', FONT_SIZE_MAP[s] || '3');
                    setCurrentSize(s);
                    closeDropdowns();
                  }}
                  className="w-full text-center px-3 py-1 text-sm hover:bg-black/5 transition-colors"
                  style={{ color: theme.colors.font }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <TDivider />

        {/* Bold / Italic / Underline / Strikethrough */}
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('bold')} title="Bold (Ctrl+B)" active={isBold}>
          <Bold className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('italic')} title="Italic (Ctrl+I)" active={isItalic}>
          <Italic className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('underline')} title="Underline (Ctrl+U)" active={isUnderline}>
          <Underline className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('strikeThrough')} title="Strikethrough">
          <Strikethrough className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('subscript')} title="Subscript">
          <Subscript className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('superscript')} title="Superscript">
          <Superscript className="size-4" />
        </TBtn>

        <TDivider />

        {/* Text Color */}
        <div className="relative" onMouseDown={e => e.stopPropagation()}>
          <button
            onMouseDown={e => toggleDropdown('textcolor', e)}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-black/10 transition-colors"
            title="Text color"
          >
            <Palette className="size-4" style={{ color: theme.colors.font }} />
            <ChevronDown className="size-3" style={{ color: theme.colors.font }} />
          </button>
          {openDropdown === 'textcolor' && (
            <div
              className="absolute top-full left-0 mt-1 rounded-lg shadow-xl z-50 p-2.5"
              style={{ backgroundColor: '#fff', border: `1px solid ${theme.colors.font}18` }}
            >
              <p className="text-xs mb-1.5 opacity-50" style={{ color: theme.colors.font }}>Text Color</p>
              <div className="flex gap-1.5 flex-wrap w-28">
                {TEXT_COLORS.map(c => (
                  <button
                    key={c.value}
                    onMouseDown={e => {
                      e.preventDefault();
                      execCmd('foreColor', c.value);
                      closeDropdowns();
                    }}
                    className="w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 hover:shadow-md"
                    style={{
                      backgroundColor: c.value,
                      borderColor: c.value === '#FFFFFF' ? '#ccc' : 'transparent',
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative" onMouseDown={e => e.stopPropagation()}>
          <button
            onMouseDown={e => toggleDropdown('highlight', e)}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-black/10 transition-colors"
            title="Highlight color"
          >
            <Highlighter className="size-4" style={{ color: theme.colors.font }} />
            <ChevronDown className="size-3" style={{ color: theme.colors.font }} />
          </button>
          {openDropdown === 'highlight' && (
            <div
              className="absolute top-full left-0 mt-1 rounded-lg shadow-xl z-50 p-2.5"
              style={{ backgroundColor: '#fff', border: `1px solid ${theme.colors.font}18` }}
            >
              <p className="text-xs mb-1.5 opacity-50" style={{ color: theme.colors.font }}>Highlight</p>
              <div className="flex gap-1.5 flex-wrap w-28">
                {HIGHLIGHT_COLORS.map(c => (
                  <button
                    key={c.value}
                    onMouseDown={e => {
                      e.preventDefault();
                      if (c.value === 'none') {
                        execCmd('hiliteColor', '#ffffff');
                      } else {
                        execCmd('hiliteColor', c.value);
                      }
                      closeDropdowns();
                    }}
                    className="w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 hover:shadow-md flex items-center justify-center"
                    style={{
                      backgroundColor: c.value === 'none' ? '#fff' : c.value,
                      borderColor: '#ccc',
                    }}
                    title={c.name}
                  >
                    {c.value === 'none' && <X className="size-3 text-gray-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <TDivider />

        {/* Alignment */}
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('justifyLeft')} title="Align Left">
          <AlignLeft className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('justifyCenter')} title="Align Center">
          <AlignCenter className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('justifyRight')} title="Align Right">
          <AlignRight className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('justifyFull')} title="Justify">
          <AlignJustify className="size-4" />
        </TBtn>

        <TDivider />

        {/* Lists & Indent */}
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('insertUnorderedList')} title="Bullet List">
          <List className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('insertOrderedList')} title="Numbered List">
          <ListOrdered className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('outdent')} title="Decrease Indent">
          <Outdent className="size-4" />
        </TBtn>
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('indent')} title="Increase Indent">
          <Indent className="size-4" />
        </TBtn>

        <TDivider />

        {/* Insert link */}
        <TBtn
          onMouseDown={noFocus}
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) execCmd('createLink', url);
          }}
          title="Insert Link"
        >
          <Link className="size-4" />
        </TBtn>

        {/* Horizontal Rule */}
        <TBtn onMouseDown={noFocus} onClick={() => execCmd('insertHorizontalRule')} title="Insert Horizontal Rule">
          <Minus className="size-4" />
        </TBtn>
      </div>

      {/* ── Content Area ─────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Paper / Editor */}
        <div
          className="flex-1 overflow-auto py-8 px-4 md:px-8"
          style={{ backgroundColor: '#D8DBD2' }}
          onClick={closeDropdowns}
        >
          {/* Ruler (decorative) */}
          <div
            className="mx-auto mb-1 flex items-center select-none"
            style={{ maxWidth: '816px', height: '16px', backgroundColor: '#EEF0EA', borderRadius: '2px' }}
          >
            {Array.from({ length: 17 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 flex justify-center items-end"
                style={{ borderRight: i < 16 ? '1px solid #ccc' : 'none', height: '100%' }}
              >
                <span className="text-[8px] text-gray-400 pb-0.5">{i > 0 ? i : ''}</span>
              </div>
            ))}
          </div>

          {/* A4 Paper */}
          <div
            className="mx-auto shadow-2xl"
            style={{
              maxWidth: '816px',
              backgroundColor: '#ffffff',
              minHeight: '1056px',
              borderRadius: '2px',
            }}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={updateCounts}
              onKeyUp={updateCursorState}
              onMouseUp={updateCursorState}
              className="w-full outline-none"
              style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: '12pt',
                lineHeight: '2',
                color: '#000',
                minHeight: '1056px',
                padding: '72px 80px',
              }}
              data-placeholder="Begin drafting your legal document here…"
            />
          </div>

          {/* Bottom ruler space */}
          <div className="h-8" />
        </div>

        {/* ── AI Panel ──────────────────────── */}
        <AnimatePresence>
          {isAIPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: aiPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-shrink-0 overflow-hidden flex flex-col border-l relative"
              style={{
                backgroundColor: '#0f1e2e',
                borderColor: `${theme.colors.font}30`,
              }}
            >
              {/* Resize Handle */}
              <div
                onMouseDown={handleMouseDown}
                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-white/20 transition-colors z-10"
                style={{ 
                  backgroundColor: isResizing ? 'rgba(255,255,255,0.2)' : 'transparent',
                }}
              />

              {/* Fixed-width inner so content doesn't compress during animation */}
              <div className="flex flex-col h-full" style={{ width: `${aiPanelWidth}px` }}>

                {/* Panel Header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0"
                  style={{ borderColor: 'rgba(209,212,201,0.12)' }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5" style={{ color: theme.colors.dominant }} />
                    <div>
                      <p className="text-sm font-medium tracking-wide uppercase" style={{ color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        AI Writing Assistant
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAIPanelOpen(false)}
                    className="p-0.5 rounded transition-opacity hover:opacity-60"
                    style={{ color: theme.colors.dominant }}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                {/* Legend */}
                <div
                  className="flex flex-wrap gap-x-3 gap-y-1 px-4 py-2 border-b flex-shrink-0"
                  style={{ borderColor: 'rgba(209,212,201,0.1)', backgroundColor: 'rgba(0,0,0,0.15)' }}
                >
                  {(Object.entries(SUGGESTION_CONFIG) as [SuggestionType, typeof SUGGESTION_CONFIG[SuggestionType]][]).map(([type, cfg]) => (
                    <span key={type} className="flex items-center gap-1 text-[10px]" style={{ color: cfg.color, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {cfg.icon}
                      {cfg.badge}
                    </span>
                  ))}
                </div>

                {/* Suggestions List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isAnalyzing ? (
                    /* Loading state */
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="size-7" style={{ color: theme.colors.dominant }} />
                      </motion.div>
                      <p className="text-xs text-center opacity-70" style={{ color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        Analyzing your document…
                      </p>
                      <div className="w-full space-y-2">
                        {[90, 70, 80, 60, 75, 50].map((w, i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 0.6, 0.2] }}
                            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18 }}
                            className="h-2.5 rounded-full"
                            style={{ width: `${w}%`, backgroundColor: `${theme.colors.dominant}35` }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : !hasAnalyzed ? (
                    /* Initial state */
                    <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(209,212,201,0.08)' }}
                      >
                        <Sparkles className="size-7" style={{ color: `${theme.colors.dominant}60` }} />
                      </div>
                      <div>
                        <p className="text-xs mb-1.5" style={{ color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          Ready to assist
                        </p>
                        <p className="text-[10px] opacity-50 leading-relaxed px-2" style={{ color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          Write your legal document then click "AI Assist" to receive suggestions on word choice, sentence structure, and writing style.
                        </p>
                      </div>
                      <button
                        onClick={handleAnalyze}
                        className="mt-1 px-4 py-1.5 rounded text-[10px] flex items-center gap-1.5 transition-opacity hover:opacity-80"
                        style={{ backgroundColor: theme.colors.theme, color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      >
                        <Sparkles className="size-3.5" />
                        Analyze Document
                      </button>
                    </div>
                  ) : suggestions.length === 0 ? (
                    /* No suggestions */
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(144,238,144,0.12)' }}
                      >
                        <Check className="size-7" style={{ color: '#86efac' }} />
                      </div>
                      <p className="text-xs" style={{ color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        No issues found
                      </p>
                      <p className="text-[10px] opacity-50" style={{ color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        Your document appears to meet formal legal writing standards.
                      </p>
                      <button
                        onClick={handleAnalyze}
                        className="mt-2 px-4 py-1.5 rounded text-[10px] flex items-center gap-1.5 transition-opacity hover:opacity-80"
                        style={{ backgroundColor: theme.colors.theme, color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      >
                        <Sparkles className="size-3.5" />
                        Re-analyze
                      </button>
                    </div>
                  ) : (
                    /* Suggestions list */
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] opacity-50" style={{ color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} found
                        </p>
                        <button
                          onClick={handleAnalyze}
                          className="text-[10px] transition-opacity hover:opacity-70"
                          style={{ color: `${theme.colors.dominant}80`, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                        >
                          Re-analyze
                        </button>
                      </div>

                      <AnimatePresence>
                        {suggestions.map(suggestion => {
                          const cfg = SUGGESTION_CONFIG[suggestion.type];
                          return (
                            <motion.div
                              key={suggestion.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 30, transition: { duration: 0.2 } }}
                              className="rounded-lg p-3 space-y-2"
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                              }}
                            >
                              {/* Badge */}
                              <span
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: cfg.bg, color: cfg.color, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                              >
                                {cfg.icon}
                                {suggestion.label}
                              </span>

                              {/* Found */}
                              <div>
                                <p className="text-[10px] mb-1 opacity-40" style={{ color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                  Found:
                                </p>
                                <p
                                  className="text-[10px] px-2 py-1 rounded font-mono leading-relaxed"
                                  style={{ backgroundColor: 'rgba(248,113,113,0.15)', color: '#fca5a5' }}
                                >
                                  "{suggestion.original}"
                                </p>
                              </div>

                              {/* Suggestion */}
                              <div>
                                <p className="text-[10px] mb-1 opacity-40" style={{ color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                  Suggested:
                                </p>
                                <p
                                  className="text-[10px] px-2 py-1 rounded font-mono leading-relaxed"
                                  style={{ backgroundColor: 'rgba(134,239,172,0.15)', color: '#86efac' }}
                                >
                                  "{suggestion.suggestion}"
                                </p>
                              </div>

                              {/* Reason */}
                              <p
                                className="text-[10px] leading-relaxed"
                                style={{ color: `${theme.colors.dominant}90`, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                              >
                                {suggestion.reason}
                              </p>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => acceptSuggestion(suggestion)}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] transition-opacity hover:opacity-80"
                                  style={{ backgroundColor: theme.colors.theme, color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                >
                                  <Check className="size-3" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => dismissSuggestion(suggestion.id)}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] transition-opacity hover:opacity-70"
                                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                >
                                  <X className="size-3" />
                                  Dismiss
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </>
                  )}
                </div>

                {/* Panel Footer */}
                <div
                  className="px-4 py-2.5 border-t flex-shrink-0"
                  style={{ borderColor: 'rgba(209,212,201,0.1)' }}
                >
                  <p className="text-[9px] text-center opacity-40" style={{ color: theme.colors.dominant, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Suggestions are AI-simulated for demonstration. Not legal advice.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Draggable AI Assist Button */}
      <DraggableAIButton
        onClick={() => {
          setIsAIPanelOpen(!isAIPanelOpen);
          if (!isAIPanelOpen) {
            handleAnalyze();
          }
        }}
        isActive={isAIPanelOpen}
      />

      {/* Placeholder CSS */}
      <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #b0b0b0;
          pointer-events: none;
          font-style: italic;
        }
        .drafting-editor h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        .drafting-editor h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
        .drafting-editor h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
        .drafting-editor h4 { font-weight: bold; margin: 1.12em 0; }
        .drafting-editor blockquote { border-left: 3px solid #ccc; margin-left: 1.5em; padding-left: 1em; color: #555; }
        .drafting-editor ul { list-style: disc; padding-left: 2em; }
        .drafting-editor ol { list-style: decimal; padding-left: 2em; }
        .drafting-editor a { color: #1a3a6b; text-decoration: underline; }
        .drafting-editor hr { border: none; border-top: 1px solid #ccc; margin: 1em 0; }
      `}</style>
    </div>
  );
}