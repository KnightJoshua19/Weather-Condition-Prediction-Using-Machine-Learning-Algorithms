import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { NavigationRail } from './components/navigation-rail';
import { PromptSection } from './components/prompt-section';
import { OutputView } from './components/output-view';
import { DocumentDrafting } from './components/document-drafting';
import { WaveBackground } from './components/wave-background';
import { SettingsPanel } from './components/settings-panel';
import { NewsCarousel } from './components/news-carousel';
import { theme } from './config/theme';

type ViewType = 'prompt' | 'output' | 'drafting';

const DEFAULT_OUTPUT_FONT_SIZE = 15;

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('prompt');
  const [userPrompt, setUserPrompt] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [outputFontSize, setOutputFontSize] = useState(DEFAULT_OUTPUT_FONT_SIZE);

  const handleSendPrompt = (prompt: string) => {
    setUserPrompt(prompt);
    setCurrentView('output');
  };

  const handleSignIn = () => setIsAuthenticated(true);
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  const handleNavigate = (view: string) => {
    if (view === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    setCurrentView(view as ViewType);
  };

  // Drafting view takes full screen
  if (currentView === 'drafting') {
    return (
      <DocumentDrafting
        onBack={() => setCurrentView('prompt')}
      />
    );
  }

  // Nav rail is w-28 = 7rem
  const NAV_WIDTH = '7rem';

  return (
    <div
      className="size-full flex overflow-hidden relative"
      style={{ backgroundColor: theme.colors.dominant }}
    >
      {/* Silky animated wave background */}
      <WaveBackground />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        outputFontSize={outputFontSize}
        onFontSizeChange={setOutputFontSize}
      />

      {/* Navigation Rail */}
      <div className="relative z-10">
        <NavigationRail
          isOpen={isNavOpen}
          isAuthenticated={isAuthenticated}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          activeView={currentView}
        />
      </div>

      {/* Hamburger Toggle Button */}
      <button
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 md:top-6 md:left-6"
        style={{
          marginLeft: isNavOpen ? NAV_WIDTH : '0',
          width: '40px',
          height: '40px',
          backgroundColor: `${theme.colors.dominant}CC`,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.13)',
          border: `1.5px solid ${theme.colors.theme}35`,
          color: theme.colors.theme,
        }}
        title={isNavOpen ? 'Hide Navigation' : 'Show Navigation'}
        aria-label={isNavOpen ? 'Hide Navigation' : 'Show Navigation'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isNavOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <X className="size-5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <Menu className="size-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative z-10">
        <AnimatePresence mode="wait">
          {/* ── PROMPT VIEW ── */}
          {currentView === 'prompt' ? (
            <motion.div
              key="prompt-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: theme.animation.transitionDuration }}
              className="min-h-full flex flex-col items-center justify-center px-4 py-8 md:py-12"
            >
              {/* Header */}
              <div className="text-center mb-8 md:mb-12">
                <h1
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-3 md:mb-4"
                  style={{ fontFamily: theme.fonts.heading, color: theme.colors.font }}
                >
                  {theme.text.appTitle}
                </h1>
                <h2
                  className="text-base sm:text-lg md:text-xl"
                  style={{ fontFamily: theme.fonts.heading, color: theme.colors.font }}
                >
                  {theme.text.appSubtitle}
                </h2>
              </div>

              {/* Prompt input */}
              <div className="w-full max-w-5xl">
                <PromptSection onSend={handleSendPrompt} />
              </div>

              {/* News carousel — prompt page only */}
              <NewsCarousel />
            </motion.div>

          ) : (
            /* ── OUTPUT VIEW ── */
            <motion.div
              key="output-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: theme.animation.transitionDuration }}
              className="min-h-full flex flex-col px-4 py-8 md:py-12"
            >
              {/* Compact header */}
              <div className="text-center mb-8 md:mb-10">
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl mb-2 md:mb-3"
                  style={{ fontFamily: theme.fonts.headingOutput, color: theme.colors.font }}
                >
                  {theme.text.appTitle}
                </h1>
                <h2
                  className="text-sm sm:text-base"
                  style={{ fontFamily: theme.fonts.headingOutput, color: theme.colors.font, opacity: 0.7 }}
                >
                  {theme.text.appSubtitle}
                </h2>
              </div>

              {/* Output + prompt section */}
              <div className="flex-1 flex flex-col items-center justify-start gap-8">
                <OutputView
                  prompt={userPrompt}
                  isAuthenticated={isAuthenticated}
                  onSignIn={handleSignIn}
                  onLogin={handleLogin}
                  outputFontSize={outputFontSize}
                />

                {/* Prompt section — style unchanged */}
                <div className="w-full max-w-5xl">
                  <PromptSection onSend={handleSendPrompt} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
