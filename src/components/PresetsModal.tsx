import React from 'react';
import { X, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { DEMO_PRESETS, DemoPreset } from '../utils/presets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: DemoPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({ isOpen, onClose, onSelectPreset }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl liquid-glass rounded-2xl border border-white/20 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Mẫu trang web thử nghiệm</h3>
              <p className="text-xs text-zinc-400">Chọn một cấu trúc mẫu để kiểm tra khả năng trích xuất và đóng gói</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {DEMO_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-3.5 rounded-xl liquid-glass-subtle border border-white/10 hover:border-white/25 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="truncate pr-3">
                <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-white flex items-center gap-2">
                  {preset.name}
                  {preset.htmlContent && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                      Offline HTML
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{preset.description}</p>
                <span className="text-[10px] font-mono text-zinc-500 block mt-1 truncate">{preset.url}</span>
              </div>
              <div className="p-2 rounded-lg liquid-glass-interactive text-zinc-300 group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
