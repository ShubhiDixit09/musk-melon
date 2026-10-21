'use client';
import { cn } from "@/lib/utils";
import { AnswerReceipt } from "./answer-receipt";
import Image from "next/image";

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  receipt?: any;
}

export function ChatMessage({ role, content, receipt }: MessageProps) {
  const isUser = role === 'user';
  
  return (
    <div className={cn("flex w-full mb-3", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[90%] md:max-w-[80%] rounded-2xl p-4 transition-all shadow-md",
        isUser 
          ? "bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-br-none" 
          : "bg-[#090d16]/90 border border-[#1e293b] text-[#f1f5f9] rounded-bl-none"
      )}>
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/5">
          {isUser ? (
            <div className="flex items-center gap-2 text-xs font-mono text-[#38bdf8]">
              <span className="font-semibold">YOU / INTERVIEWER</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5 rounded-full overflow-hidden border border-[#f3951f]">
                <Image
                  src="/muskmelon-logo.png"
                  alt="MuskMelon"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-bold text-[#f3951f] font-mono">MUSKMELON</span>
              {receipt && (
                <span 
                  className="w-2 h-2 rounded-full animate-pulse" 
                  style={{ 
                    backgroundColor: (receipt.groundingConfidence || receipt.confidence || 0.9) > 0.8 ? '#22c55e' : '#eab308' 
                  }}
                  title="Grounded"
                />
              )}
            </div>
          )}
        </div>
        
        <div className="whitespace-pre-wrap leading-relaxed text-xs md:text-sm font-sans text-slate-200">
          {content}
        </div>
        
        {!isUser && receipt && (
          <div className="mt-2">
            <AnswerReceipt receipt={receipt} />
          </div>
        )}
      </div>
    </div>
  );
}
