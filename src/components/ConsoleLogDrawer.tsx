import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { LogMessage } from '../types';

interface ConsoleLogDrawerProps {
  logs: LogMessage[];
  onClearLogs: () => void;
}

export const ConsoleLogDrawer: React.FC<ConsoleLogDrawerProps> = ({ logs, onClearLogs }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 px-4 sm:px-8 pb-3 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div className="liquid-glass rounded-2xl border border-white/15 shadow-2xl overflow-hidden transition-all">
          {/* Header Toggle Bar */}
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2.5 bg-black/60 flex items-center justify-between cursor-pointer hover:bg-black/80 transition"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-mono text-zinc-300 font-medium">
                Nhật ký trích xuất & kết nối ({logs.length} bản ghi)
              </span>
              {logs.length > 0 && (
                <span className="text-[10px] text-zinc-500 font-mono truncate max-w-xs sm:max-w-md hidden sm:inline">
                  — {logs[logs.length - 1].text}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearLogs();
                  }}
                  className="p-1 text-zinc-500 hover:text-zinc-300"
                  title="Xóa nhật ký"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
            </div>
          </div>

          {/* Expanded logs console */}
          {isOpen && (
            <div className="p-3 bg-black/90 max-h-48 overflow-y-auto font-mono text-[11px] space-y-1.5 divide-y divide-white/5 border-t border-white/10">
              {logs.length === 0 ? (
                <div className="text-zinc-600 py-2 text-center">Chưa có bản ghi hoạt động.</div>
              ) : (
                logs.map((log) => {
                  const color =
                    log.type === 'error'
                      ? 'text-red-400'
                      : log.type === 'warning'
                      ? 'text-amber-400'
                      : log.type === 'success'
                      ? 'text-emerald-400'
                      : 'text-zinc-400';
                  return (
                    <div key={log.id} className="pt-1 flex items-start gap-2">
                      <span className="text-zinc-600 text-[10px] select-none">{log.timestamp}</span>
                      <span className={`flex-1 break-all ${color}`}>{log.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
