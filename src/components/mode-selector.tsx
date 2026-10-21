'use client';
import { cn } from "@/lib/utils";
import { Clock, GitCompare, Zap } from "lucide-react";

export type Mode = 'now' | 'time' | 'diff';

interface Props {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  asOfDate: string;
  onDateChange: (d: string) => void;
  compareDates: [string, string];
  onCompareDatesChange: (d: [string, string]) => void;
}

export function ModeSelector({ mode, onModeChange, asOfDate, onDateChange, compareDates, onCompareDatesChange }: Props) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto mb-6">
      <div className="flex bg-[#141413] p-1 rounded-xl border border-[#1e1e1c]">
        <button
          onClick={() => onModeChange('now')}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200", mode === 'now' ? "bg-[#f3951f] text-black" : "text-[#7a7974] hover:text-[#e8e6e1]")}
        >
          <Zap size={16} /> Now Mode
        </button>
        <button
          onClick={() => onModeChange('time')}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200", mode === 'time' ? "bg-[#f3951f] text-black" : "text-[#7a7974] hover:text-[#e8e6e1]")}
        >
          <Clock size={16} /> Time Lens
        </button>
        <button
          onClick={() => onModeChange('diff')}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200", mode === 'diff' ? "bg-[#f3951f] text-black" : "text-[#7a7974] hover:text-[#e8e6e1]")}
        >
          <GitCompare size={16} /> Belief Diff
        </button>
      </div>
      
      {mode === 'time' && (
        <div className="flex items-center gap-2 text-sm justify-center">
          <span className="text-[#7a7974]">As of date:</span>
          <input type="date" value={asOfDate} onChange={e => onDateChange(e.target.value)} className="bg-[#1a1a18] border border-[#2a2926] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#f3951f]" />
        </div>
      )}
      
      {mode === 'diff' && (
        <div className="flex items-center gap-2 text-sm justify-center">
          <span className="text-[#7a7974]">Compare:</span>
          <input type="date" value={compareDates[0]} onChange={e => onCompareDatesChange([e.target.value, compareDates[1]])} className="bg-[#1a1a18] border border-[#2a2926] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#f3951f]" />
          <span className="text-[#7a7974]">to</span>
          <input type="date" value={compareDates[1]} onChange={e => onCompareDatesChange([compareDates[0], e.target.value])} className="bg-[#1a1a18] border border-[#2a2926] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#f3951f]" />
        </div>
      )}
    </div>
  );
}
