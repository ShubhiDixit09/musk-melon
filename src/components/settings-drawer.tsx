'use client';
import { useState } from 'react';
import { Settings, X, Volume2, Shield, Trash2, CheckCircle2, AlertTriangle, Layers, Cpu, Database } from 'lucide-react';
import { AnswerReceipt } from './answer-receipt';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  immersiveMode: boolean;
  onToggleImmersive: () => void;
  messageCount: number;
  topics: string[];
  activeReceipt?: any;
  onClearCurrent: () => void;
  onClearAll: () => void;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  voiceEnabled,
  onToggleVoice,
  immersiveMode,
  onToggleImmersive,
  messageCount,
  topics,
  activeReceipt,
  onClearCurrent,
  onClearAll
}: SettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'receipt'>('settings');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#090d16]/95 backdrop-blur-xl border-l border-[#1e293b] z-50 flex flex-col shadow-2xl transition-transform animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-[#f3951f]" />
          <h2 className="font-semibold text-[#f1f5f9] text-sm tracking-wide">Settings & Memory</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e293b] text-xs">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 font-medium transition-colors ${
            activeTab === 'settings' 
              ? 'text-[#f3951f] border-b-2 border-[#f3951f] bg-[#1e293b]/40' 
              : 'text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          Settings & Tools
        </button>
        <button
          onClick={() => setActiveTab('receipt')}
          className={`flex-1 py-2.5 font-medium transition-colors ${
            activeTab === 'receipt' 
              ? 'text-[#38bdf8] border-b-2 border-[#38bdf8] bg-[#1e293b]/40' 
              : 'text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          Answer Receipt
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-[#cbd5e1]">
        {activeTab === 'receipt' ? (
          <div>
            {activeReceipt ? (
              <AnswerReceipt receipt={activeReceipt} />
            ) : (
              <div className="text-center py-12 text-[#64748b]">
                <Database size={24} className="mx-auto mb-2 opacity-50" />
                <p>No query executed yet.</p>
                <p className="text-[11px] mt-1">Ask a question to see claim-level provenance and verification receipts.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Settings Options */}
            <div className="space-y-3">
              <h3 className="font-mono uppercase text-[11px] text-[#64748b] tracking-wider font-semibold">
                Voice & Display
              </h3>
              
              <label className="flex items-center justify-between p-3 bg-[#0f172a] border border-[#1e293b] rounded-xl cursor-pointer hover:bg-[#1e293b]/50">
                <div className="flex items-center gap-2.5">
                  <Volume2 size={15} className={voiceEnabled ? "text-[#f3951f]" : "text-[#64748b]"} />
                  <span className="text-xs">Enable Voice Synthesizer</span>
                </div>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={onToggleVoice}
                  className="rounded bg-[#1e293b] border-[#334155] text-[#f3951f] focus:ring-0 focus:ring-offset-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#0f172a] border border-[#1e293b] rounded-xl cursor-pointer hover:bg-[#1e293b]/50">
                <div className="flex items-center gap-2.5">
                  <Layers size={15} className={immersiveMode ? "text-[#38bdf8]" : "text-[#64748b]"} />
                  <span className="text-xs">Enable Immersive Control Room</span>
                </div>
                <input
                  type="checkbox"
                  checked={immersiveMode}
                  onChange={onToggleImmersive}
                  className="rounded bg-[#1e293b] border-[#334155] text-[#38bdf8] focus:ring-0 focus:ring-offset-0"
                />
              </label>
            </div>

            {/* Session Info Cards */}
            <div className="space-y-2">
              <h3 className="font-mono uppercase text-[11px] text-[#64748b] tracking-wider font-semibold">
                Session Stats
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-[#0f172a] border border-[#1e293b] rounded-xl text-center">
                  <p className="text-lg font-bold text-[#38bdf8] font-mono">{messageCount}</p>
                  <p className="text-[10px] text-[#64748b]">Messages</p>
                </div>
                <div className="p-3 bg-[#0f172a] border border-[#1e293b] rounded-xl text-center">
                  <p className="text-lg font-bold text-[#f3951f] font-mono">{topics.length}</p>
                  <p className="text-[10px] text-[#64748b]">Topics</p>
                </div>
                <div className="p-3 bg-[#0f172a] border border-[#1e293b] rounded-xl text-center">
                  <p className="text-lg font-bold text-emerald-400 font-mono">10</p>
                  <p className="text-[10px] text-[#64748b]">APIs</p>
                </div>
              </div>
            </div>

            {/* Topics Discussed */}
            <div className="space-y-2">
              <h3 className="font-mono uppercase text-[11px] text-[#64748b] tracking-wider font-semibold">
                Topics Discussed
              </h3>
              <div className="flex flex-wrap gap-1.5 p-3 bg-[#0f172a] border border-[#1e293b] rounded-xl min-h-[50px]">
                {topics.length === 0 ? (
                  <span className="text-[11px] text-[#64748b] italic">No topics yet</span>
                ) : (
                  topics.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#1e293b] text-[#38bdf8] text-[10px] font-mono">
                      #{t}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Swytchcode Toolkits Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-mono uppercase text-[11px] text-[#64748b] tracking-wider font-semibold">
                  Swytchcode API Toolkits
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Ready
                </span>
              </div>
              <div className="p-3 bg-[#0f172a] border border-[#1e293b] rounded-xl space-y-2">
                {[
                  { name: 'Google Drive Sync', status: 'Active (OAuth)' },
                  { name: 'Notion Workspace', status: 'Active' },
                  { name: 'GitHub Repositories', status: 'Active' },
                  { name: 'YouTube Captions', status: 'Active' },
                  { name: 'Gmail / Resend', status: 'Policy: Approval Required' },
                  { name: 'Slack / Telegram', status: 'Policy: Rate Limited' },
                  { name: 'Firecrawl Scraper', status: 'Active' }
                ].map((tool, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-[#cbd5e1]">{tool.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} /> {tool.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={onClearCurrent}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#1e293b] hover:bg-[#28374d] text-slate-300 rounded-xl transition-colors text-xs"
              >
                <Trash2 size={13} />
                <span>Clear Current Conversation</span>
              </button>

              <button
                onClick={onClearAll}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-950/40 hover:bg-red-950/70 border border-red-800/40 text-red-300 rounded-xl transition-colors text-xs"
              >
                <AlertTriangle size={13} />
                <span>Clear All Conversations</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
