import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, RotateCcw } from 'lucide-react';
import { theme } from '../config/theme';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  outputFontSize: number;
  onFontSizeChange: (size: number) => void;
}

const FONT_SIZE_MIN = 11;
const FONT_SIZE_MAX = 22;
const FONT_SIZE_DEFAULT = 15;
const FONT_SIZE_STEP = 1;

export function SettingsPanel({
  isOpen,
  onClose,
  outputFontSize,
  onFontSizeChange,
}: SettingsPanelProps) {
  const increase = () => {
    if (outputFontSize < FONT_SIZE_MAX) onFontSizeChange(outputFontSize + FONT_SIZE_STEP);
  };

  const decrease = () => {
    if (outputFontSize > FONT_SIZE_MIN) onFontSizeChange(outputFontSize - FONT_SIZE_STEP);
  };

  const reset = () => onFontSizeChange(FONT_SIZE_DEFAULT);

  const percentage = ((outputFontSize - FONT_SIZE_MIN) / (FONT_SIZE_MAX - FONT_SIZE_MIN)) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(21,42,56,0.45)', backdropFilter: 'blur(3px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="settings-panel"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-0 top-0 h-full z-50 flex flex-col shadow-2xl"
            style={{
              width: '320px',
              backgroundColor: theme.colors.accent,
              color: theme.colors.dominant,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: `${theme.colors.dominant}20` }}
            >
              <h2
                className="text-xl tracking-wide"
                style={{ fontFamily: theme.fonts.heading, color: theme.colors.dominant }}
              >
                Settings
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                style={{ color: theme.colors.dominant }}
                aria-label="Close settings"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

              {/* AI Output Font Size */}
              <section>
                <p
                  className="text-xs uppercase tracking-widest mb-4 opacity-60"
                  style={{ color: theme.colors.dominant }}
                >
                  AI Output Text
                </p>

                {/* Label + reset */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm opacity-90" style={{ color: theme.colors.dominant }}>
                    Font Size
                  </span>
                  <button
                    onClick={reset}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-opacity hover:opacity-70"
                    style={{
                      backgroundColor: `${theme.colors.dominant}18`,
                      color: theme.colors.dominant,
                    }}
                    title="Reset to default"
                  >
                    <RotateCcw className="size-3" />
                    Reset
                  </button>
                </div>

                {/* Controls */}
                <div
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ backgroundColor: `${theme.colors.dominant}12` }}
                >
                  {/* Decrease */}
                  <button
                    onClick={decrease}
                    disabled={outputFontSize <= FONT_SIZE_MIN}
                    className="p-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    style={{ backgroundColor: theme.colors.theme, color: theme.colors.dominant }}
                    aria-label="Decrease font size"
                  >
                    <Minus className="size-4" />
                  </button>

                  {/* Slider track */}
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${theme.colors.dominant}25` }}>
                      <motion.div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{ backgroundColor: theme.colors.dominant }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    </div>
                    <span
                      className="text-sm tabular-nums"
                      style={{ color: theme.colors.dominant, opacity: 0.9 }}
                    >
                      {outputFontSize}px
                    </span>
                  </div>

                  {/* Increase */}
                  <button
                    onClick={increase}
                    disabled={outputFontSize >= FONT_SIZE_MAX}
                    className="p-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    style={{ backgroundColor: theme.colors.theme, color: theme.colors.dominant }}
                    aria-label="Increase font size"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {/* Range labels */}
                <div className="flex justify-between mt-1.5 px-1">
                  <span className="text-xs opacity-40" style={{ color: theme.colors.dominant }}>
                    {FONT_SIZE_MIN}px (min)
                  </span>
                  <span className="text-xs opacity-40" style={{ color: theme.colors.dominant }}>
                    {FONT_SIZE_MAX}px (max)
                  </span>
                </div>

                {/* Live preview */}
                <div
                  className="mt-5 p-4 rounded-xl"
                  style={{ backgroundColor: `${theme.colors.dominant}10`, border: `1px solid ${theme.colors.dominant}18` }}
                >
                  <p
                    className="opacity-40 text-xs mb-2 uppercase tracking-wider"
                    style={{ color: theme.colors.dominant }}
                  >
                    Preview
                  </p>
                  <p
                    style={{
                      fontSize: `${outputFontSize}px`,
                      color: theme.colors.dominant,
                      lineHeight: 1.65,
                      fontFamily: theme.fonts.body,
                      transition: 'font-size 0.2s ease',
                    }}
                  >
                    Policy recommendations for non-biodegradable waste management will appear at this size.
                  </p>
                </div>
              </section>

              {/* Divider */}
              <div className="border-t" style={{ borderColor: `${theme.colors.dominant}15` }} />

              {/* Info note */}
              <p className="text-xs opacity-40 leading-relaxed" style={{ color: theme.colors.dominant }}>
                Font size changes apply immediately to AI-generated output. Range is limited to {FONT_SIZE_MIN}–{FONT_SIZE_MAX}px for optimal readability.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
