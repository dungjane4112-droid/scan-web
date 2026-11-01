import React from 'react';
import { Layers, ShieldCheck, Cpu, Download, RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasAssets: boolean;
  onOpenPresets: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, hasAssets, onOpenPresets }) => {
  return (
    <header className="sticky top-0 z-40 w-full liquid-glass border-b border-white/10 px-4 sm:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl liquid-glass border border-white/25 shadow-lg shadow-black/60 group">
            <Layers className="w-5 h-5 text-white transition-transform group-hover:scale-110 duration-300" />
            <div className="absolute -inset-0.5 rounded-xl bg-white/10 blur opacity-40 group-hover:opacity-75 transition" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                LiquidWeb <span className="text-zinc-400 font-normal text-xs sm:text-sm tracking-normal">Extractor</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full bg-white/10 text-zinc-300 border border-white/15">
                v2.0 Glass
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Trích xuất tài nguyên website theo liên kết phụ thuộc & đóng gói ZIP thuần client-side
            </p>
          </div>
        </div>

        {/* Feature Badges & Quick actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg liquid-glass-subtle text-zinc-300 text-[11px] border border-white/10">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              100% In-Browser (No Backend)
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg liquid-glass-subtle text-zinc-300 text-[11px] border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              Safe Archiving
            </span>
          </div>

          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg liquid-glass-interactive text-xs font-medium text-zinc-200 border border-white/15 hover:text-white"
            title="Chọn mẫu website có sẵn để thử nghiệm"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            Mẫu thử nghiệm
          </button>

          {hasAssets && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg liquid-glass-subtle text-xs font-medium text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
              title="Xóa danh sách hiện tại và bắt đầu lại"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm mới
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
