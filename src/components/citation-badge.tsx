'use client';
import { useState } from 'react';
import { Info } from 'lucide-react';

interface CitationProps {
  citation: {
    id: string;
    sourceName: string;
    excerpt: string;
  };
}

export function CitationBadge({ citation }: CitationProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-[#1e1d1b] border border-[#2a2926] rounded-md text-[#a3a3a3] hover:text-[#f3951f] hover:border-[#f3951f]/50 transition-colors"
      >
        <Info className="w-3 h-3" />
        {citation.sourceName}
      </button>

      {showTooltip && (
        <div className="absolute z-10 w-64 p-3 mt-2 text-sm bg-[#111111] border border-[#2a2926] rounded-xl shadow-xl -left-2 top-full text-[#e0e0e0]">
          <div className="font-medium text-[#f3951f] mb-1">{citation.sourceName}</div>
          <div className="text-xs text-[#a3a3a3] line-clamp-4">{citation.excerpt}</div>
        </div>
      )}
    </div>
  );
}
