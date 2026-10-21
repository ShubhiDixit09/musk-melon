'use client';
import { useEffect, useState } from 'react';
import { Terminal, ShieldCheck, Sparkles } from 'lucide-react';

interface CRTScreenProps {
  text: string;
  isStreaming?: boolean;
  mode: string;
  asOfDate?: string;
}

export function CRTScreen({ text, isStreaming = false, mode, asOfDate }: CRTScreenProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(interval);
  }, []);

  // Smooth typewriter effect
  useEffect(() => {
    if (!text) {
      setDisplayedText('System Ready. Starbase link connected. Ask MuskMelon anything...');
      return;
    }

    let index = 0;
    const clean = text.replace(/AI Identity Watermark:.*$/i, '').trim();
    setDisplayedText('');

    const interval = setInterval(() => {
      index += 2;
      setDisplayedText(clean.slice(0, index));
      if (index >= clean.length) {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="relative rounded-2xl bg-[#080d08] border-2 border-[#1f3a1f] p-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden font-mono text-emerald-400 text-xs md:text-sm leading-relaxed backdrop-blur-md">
      {/* Scanline overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0px, rgba(0, 0, 0, 0.6) 1px, transparent 2px, transparent 4px)'
        }}
      />

      {/* Screen header */}
      <div className="flex items-center justify-between border-b border-emerald-950 pb-2 mb-3 text-[11px] text-emerald-500/80 uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-emerald-400 animate-pulse" />
          <span>MUSKMELON // STARBASE TX-01</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50 text-emerald-300">
            {mode === 'now' ? 'ERA: 2025+ NOW' : mode === 'time-lens' ? `ERA: ${asOfDate || '2021'}` : 'MODE: BELIEF DIFF'}
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            ONLINE
          </span>
        </div>
      </div>

      {/* Main text area */}
      <div className="min-h-[90px] max-h-[160px] overflow-y-auto whitespace-pre-wrap selection:bg-emerald-800 selection:text-white pr-2 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
        {displayedText}
        <span className={`inline-block w-2 h-4 ml-1 bg-emerald-400 align-middle ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* Screen footer */}
      <div className="mt-2 pt-2 border-t border-emerald-950/60 flex items-center justify-between text-[10px] text-emerald-600/80">
        <span className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-emerald-400" />
          KNOWLEDGE-VOICE FIREWALL ACTIVE
        </span>
        <span className="flex items-center gap-1">
          <Sparkles size={11} className="text-[#f3951f]" />
          SWYTCHCODE RUNTIME
        </span>
      </div>
    </div>
  );
}
