'use client';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: any[];
}

interface SessionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

export function SessionsDrawer({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SessionsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-[#090d16]/95 backdrop-blur-xl border-r border-[#1e293b] z-50 flex flex-col shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-[#38bdf8]" />
          <h2 className="font-semibold text-[#f1f5f9] text-sm tracking-wide">Chat Sessions</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* New Session Button */}
      <div className="p-4 border-b border-[#1e293b]/60">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1e293b] hover:bg-[#273549] text-[#f1f5f9] font-medium text-xs rounded-xl border border-[#334155] transition-all shadow-sm"
        >
          <Plus size={15} className="text-[#38bdf8]" />
          <span>New Session</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#64748b]">
            No previous conversations.
          </div>
        ) : (
          sessions.map(session => {
            const isSelected = session.id === currentSessionId;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex items-start justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-[#1e293b]/90 border-[#38bdf8]/50 shadow-md shadow-[#38bdf8]/10'
                    : 'bg-[#0f172a]/60 border-[#1e293b] hover:bg-[#1e293b]/50 text-[#94a3b8]'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className={`text-xs font-medium truncate ${isSelected ? 'text-[#f1f5f9]' : 'text-[#cbd5e1]'}`}>
                    {session.title || 'New Conversation'}
                  </p>
                  <p className="text-[10px] text-[#64748b] mt-1 font-mono">
                    {session.timestamp}
                  </p>
                </div>

                <button
                  onClick={(e) => onDeleteSession(session.id, e)}
                  title="Delete Session"
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#64748b] hover:text-red-400 rounded transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1e293b] text-[11px] text-[#64748b] flex items-center justify-between">
        <span>Persistent localStorage</span>
        <span className="text-[#38bdf8] font-mono">{sessions.length} sessions</span>
      </div>
    </div>
  );
}
