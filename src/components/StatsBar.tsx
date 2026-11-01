import React from 'react';
import { Download, CheckCircle2, AlertCircle, FileArchive, HardDrive, Loader2 } from 'lucide-react';
import { ExtractionStats, WebAsset } from '../types';

interface StatsBarProps {
  stats: ExtractionStats;
  assets: WebAsset[];
  onDownloadZip: () => void;
  isZipping: boolean;
  zipProgress: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  assets,
  onDownloadZip,
  isZipping,
  zipProgress,
}) => {
  const successfulCount = assets.filter((a) => a.status === 'success').length;
  const failedCount = assets.filter((a) => a.status === 'failed').length;
  const pendingCount = assets.filter((a) => a.status === 'pending' || a.status === 'fetching').length;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const percentComplete = stats.totalDiscovered > 0
    ? Math.round(((successfulCount + failedCount) / stats.totalDiscovered) * 100)
    : 0;

  return (
    <div className="w-full liquid-glass rounded-2xl p-4 sm:p-5 border border-white/15 shadow-xl">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg liquid-glass flex items-center justify-center border border-white/15">
              <FileArchive className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Tập tin phát hiện</span>
              <span className="text-base font-bold text-white font-mono">{stats.totalDiscovered}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Đã tải thành công</span>
              <span className="text-base font-bold text-emerald-300 font-mono">{successfulCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Lỗi / Chặn CORS</span>
              <span className="text-base font-bold text-red-300 font-mono">{failedCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg liquid-glass flex items-center justify-center border border-white/15">
              <HardDrive className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Dung lượng tải về</span>
              <span className="text-base font-bold text-zinc-200 font-mono">{formatSize(stats.totalBytes)}</span>
            </div>
          </div>
        </div>

        {/* Download ZIP Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-4">
          <button
            onClick={onDownloadZip}
            disabled={successfulCount === 0 || isZipping}
            className={`glass-specular relative flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-xl ${
              successfulCount > 0 && !isZipping
                ? 'liquid-glass-interactive text-white border border-white/30 hover:scale-[1.02] cursor-pointer'
                : 'bg-zinc-900/50 text-zinc-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            {isZipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang nén ZIP ({zipProgress}%)...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Tải xuống gói ZIP ({successfulCount} tệp)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Line */}
      {stats.totalDiscovered > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-mono">
            <span>Tiến độ tải dữ liệu ({percentComplete}%)</span>
            <span>{pendingCount > 0 ? `Đang xử lý ${pendingCount} tệp...` : 'Hoàn tất trích xuất'}</span>
          </div>
          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-zinc-400 via-white to-zinc-200 transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
