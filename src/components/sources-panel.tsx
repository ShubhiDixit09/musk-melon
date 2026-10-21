'use client';
import { FileText } from 'lucide-react';

interface Source {
  id: string;
  score: number;
  date: string;
  preview: string;
}

export function SourcesPanel({ sources }: { sources: Source[] }) {
  if (!sources?.length) return null;

  return (
    <div className="w-80 border-l border-[#1e1e1c] bg-[#0a0a0a] p-4 h-full overflow-y-auto hidden lg:block">
      <h3 className="text-sm font-semibold text-[#e8e6e1] mb-4 flex items-center gap-2">
        <FileText size={16} className="text-[#f3951f]" /> Relevant Chunks
      </h3>
      <div className="space-y-4">
        {sources.map(src => (
          <div key={src.id} className="bg-[#141413] border border-[#1e1e1c] rounded-xl p-3 text-xs">
            <div className="flex justify-between text-[#7a7974] mb-2">
              <span>{src.date}</span>
              <span>{(src.score * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#1a1a18] h-1 rounded-full mb-2 overflow-hidden">
              <div className="bg-[#f3951f] h-full" style={{ width: `${src.score * 100}%` }} />
            </div>
            <p className="text-[#e8e6e1] line-clamp-3">{src.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
