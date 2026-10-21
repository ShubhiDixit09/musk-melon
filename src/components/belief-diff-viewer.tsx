'use client';

interface DiffData {
  topic: string;
  period1: { start: string; end: string; belief: string };
  period2: { start: string; end: string; belief: string };
  explanation: string;
}

export function BeliefDiffViewer({ diff }: { diff: DiffData }) {
  return (
    <div className="bg-[#141413] border border-[#1e1e1c] rounded-2xl p-6 w-full max-w-4xl mx-auto mb-6">
      <h3 className="text-lg font-semibold text-[#f3951f] mb-6 capitalize">{diff.topic} Shift</h3>
      
      <div className="grid grid-cols-2 gap-6 mb-6 relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#1e1e1c] -translate-x-1/2"></div>
        
        <div className="pr-4">
          <div className="text-xs text-[#7a7974] mb-2">{diff.period1.start} to {diff.period1.end}</div>
          <div className="text-sm text-[#e8e6e1] p-4 bg-[#1a1a18] rounded-xl border border-[#2a2926]">
            {diff.period1.belief}
          </div>
        </div>
        
        <div className="pl-4">
          <div className="text-xs text-[#7a7974] mb-2">{diff.period2.start} to {diff.period2.end}</div>
          <div className="text-sm text-[#e8e6e1] p-4 bg-[#1a1a18] rounded-xl border border-[#2a2926]">
            {diff.period2.belief}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-[#f3951f]/10 rounded-xl border border-[#f3951f]/20">
        <h4 className="text-xs font-bold text-[#f3951f] uppercase tracking-wider mb-2">Analysis of Change</h4>
        <p className="text-sm text-[#e8e6e1] leading-relaxed">{diff.explanation}</p>
      </div>
    </div>
  );
}
