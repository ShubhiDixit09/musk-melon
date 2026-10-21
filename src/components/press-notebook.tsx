'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, AlertCircle } from 'lucide-react';
import { createSpeechRecognizer } from '@/lib/voice';

interface PressNotebookProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  placeholder?: string;
}

export function PressNotebook({
  input,
  setInput,
  onSubmit,
  isLoading,
  isSpeaking,
  voiceEnabled,
  onToggleVoice,
  placeholder = "Type your question to Elon Musk..."
}: PressNotebookProps) {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState('Tuesday, August 23, 2026');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      setCurrentDate(formatted);
    } catch {
      // keep fallback
    }
  }, []);

  const handleMicToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    const recognition = createSpeechRecognizer(
      (transcript) => {
        setInput(input ? `${input} ${transcript}` : transcript);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      (err) => {
        setVoiceError(err);
        setIsListening(false);
      }
    );

    if (recognition) {
      try {
        setIsListening(true);
        recognition.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Physical Clipboard top clamp / clip styling */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-gradient-to-b from-[#2a2926] to-[#1a1a18] rounded-t-lg border-t border-x border-[#403e39] z-20 shadow-md flex items-center justify-center">
        <div className="w-12 h-1.5 rounded-full bg-[#111110] border-b border-[#52504a]"></div>
      </div>

      {/* Notebook Paper Card */}
      <div className="relative bg-[#f5f1e8] text-[#1c1917] rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] border-4 border-[#33312b] pt-5 pb-3 px-5 transition-all focus-within:shadow-[0_20px_45px_rgba(243,149,31,0.2)] focus-within:border-[#4d483d]">
        {/* Subtle lined paper background */}
        <div 
          className="pointer-events-none absolute inset-0 rounded-lg opacity-40"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e3dac9 28px)'
          }}
        />

        {/* Notebook Header */}
        <div className="relative flex items-center justify-between border-b-2 border-[#b82a2a]/60 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs md:text-sm font-bold text-[#b82a2a] tracking-widest uppercase">
              PRESS NOTEBOOK
            </span>
            <span className="text-[10px] bg-[#b82a2a]/10 text-[#b82a2a] px-1.5 py-0.5 rounded font-mono font-medium">
              STARBASE DESK
            </span>
          </div>
          <span className="font-serif italic text-xs text-[#78716c]">
            {currentDate}
          </span>
        </div>

        {/* Text Input Area */}
        <form onSubmit={onSubmit} className="relative z-10">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            maxLength={2000}
            rows={2}
            className="w-full bg-transparent text-[#1c1917] placeholder:text-[#a8a29e] placeholder:italic font-serif text-sm md:text-base focus:outline-none resize-none leading-7 min-h-[58px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />

          {voiceError && (
            <div className="flex items-center gap-1 text-xs text-red-600 mb-2 font-sans">
              <AlertCircle size={13} />
              <span>{voiceError}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#e2d8c3] mt-1">
            {/* Character count */}
            <span className="font-mono text-[11px] text-[#78716c]">
              {input.length} / 2000
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Mic / Voice Input button */}
              <button
                type="button"
                onClick={handleMicToggle}
                title={isListening ? "Listening... click to stop" : "Voice Input (Speech to Text)"}
                className={`p-2 rounded-lg transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30' 
                    : 'bg-[#e7dfcf] hover:bg-[#dbd0bd] text-[#44403c]'
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Speaker / Voice Output toggle */}
              <button
                type="button"
                onClick={onToggleVoice}
                title={voiceEnabled ? "Voice Synthesizer Enabled" : "Voice Synthesizer Muted"}
                className={`p-2 rounded-lg transition-all ${
                  voiceEnabled 
                    ? 'bg-[#f3951f]/20 text-[#b45309] hover:bg-[#f3951f]/30' 
                    : 'bg-[#e7dfcf] text-[#a8a29e] hover:bg-[#dbd0bd]'
                }`}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Ask Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-lg font-mono text-xs md:text-sm font-semibold tracking-wide shadow transition-all disabled:opacity-40 disabled:pointer-events-none hover:shadow-md"
              >
                <span>Ask</span>
                <Send size={14} className={isLoading ? 'animate-bounce' : ''} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
