import { Send, Upload, Mic } from 'lucide-react';
import { useState, useRef } from 'react';
import { theme } from '../config/theme';

interface PromptSectionProps {
  onSend: (prompt: string) => void;
}

export function PromptSection({ onSend }: PromptSectionProps) {
  const [prompt, setPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string>('');
  const [isListening, setIsListening] = useState(false);

  const lawDocRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (prompt.trim()) {
      onSend(prompt);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-0">
      {/* Prompt Input Area */}
      <div className="rounded-xl p-2 shadow-lg" style={{ backgroundColor: theme.colors.theme }}>
        <div className="rounded-lg" style={{ backgroundColor: theme.colors.dominant }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about waste management policies..."
            className="w-full min-h-32 p-4 rounded-t-lg resize-none focus:outline-none"
            style={{ backgroundColor: theme.colors.dominant, color: theme.colors.font }}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between px-4 pb-3 gap-3">
            {/* Left: Upload + Voice */}
            <div className="flex items-center gap-2">
              {/* Hidden file input */}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                ref={lawDocRef}
                onChange={handleFileChange}
                className="hidden"
              />
              {/* Upload Law Document */}
              <button
                onClick={() => lawDocRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-opacity hover:opacity-80 text-xs sm:text-sm whitespace-nowrap"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.dominant }}
                title="Upload Law Document"
              >
                <Upload className="size-3.5 sm:size-4 flex-shrink-0" />
                <span className="truncate max-w-[160px]">
                  {uploadedFile ? uploadedFile : 'Upload Law Document'}
                </span>
              </button>

              {/* Voice Search */}
              <button
                onClick={handleVoiceSearch}
                className="p-2 rounded-lg transition-all hover:opacity-80 flex-shrink-0 relative"
                style={{
                  backgroundColor: isListening ? theme.colors.font : theme.colors.accent,
                  color: theme.colors.dominant,
                }}
                title="Search by voice"
              >
                <Mic className="size-4 sm:size-5" />
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            </div>

            {/* Right: Send Icon Only */}
            <button
              onClick={handleSend}
              className="p-2 sm:p-3 rounded-lg transition-opacity hover:opacity-80 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: theme.colors.accent, color: theme.colors.dominant }}
              title="Send"
            >
              <Send className="size-4 sm:size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center">
        {[
          'What are best practices for waste segregation?',
          'How can we reduce plastic waste in urban areas?',
          'Policy recommendations for recycling programs',
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setPrompt(suggestion)}
            className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: theme.colors.theme, color: theme.colors.dominant }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}