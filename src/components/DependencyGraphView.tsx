import React, { useMemo } from 'react';
import { FileCode, FileText, Image as ImageIcon, Music, Type, Box, ArrowRight, CornerDownRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { WebAsset, AssetCategory } from '../types';

interface DependencyGraphViewProps {
  assets: WebAsset[];
  onSelectAsset: (asset: WebAsset) => void;
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({ assets, onSelectAsset }) => {
  // Group assets into root (HTML) and their direct/nested children
  const entryAssets = useMemo(() => {
    return assets.filter((a) => a.category === 'html' || a.depth === 0);
  }, [assets]);

  const level1Assets = useMemo(() => {
    return assets.filter((a) => a.depth === 1);
  }, [assets]);

  const level2Assets = useMemo(() => {
    return assets.filter((a) => a.depth >= 2);
  }, [assets]);

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'html':
        return <FileCode className="w-4 h-4 text-zinc-100" />;
      case 'script':
        return <FileCode className="w-4 h-4 text-amber-200" />;
      case 'style':
        return <FileText className="w-4 h-4 text-sky-200" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-200" />;
      case 'font':
        return <Type className="w-4 h-4 text-purple-200" />;
      case 'media':
        return <Music className="w-4 h-4 text-rose-200" />;
      default:
        return <Box className="w-4 h-4 text-zinc-300" />;
    }
  };

  const getStatusBadge = (asset: WebAsset) => {
    if (asset.status === 'success') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
          <CheckCircle className="w-3 h-3" /> {(asset.sizeBytes / 1024).toFixed(1)} KB
        </span>
      );
    }
    if (asset.status === 'failed') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-red-400 font-mono">
          <XCircle className="w-3 h-3" /> Lỗi
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
        <Clock className="w-3 h-3 animate-spin" /> Đang tải
      </span>
    );
  };

  if (assets.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-500 font-medium text-xs">
        Chưa có tài nguyên nào. Hãy bắt đầu quét để xem sơ đồ cây phụ thuộc.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="text-xs text-zinc-400 flex items-center justify-between">
        <span>Sơ đồ liên kết tài nguyên theo thứ tự phụ thuộc (Dependency Hierarchy Graph):</span>
        <span className="font-mono text-[11px] text-zinc-500">{assets.length} nút tài nguyên kết nối</span>
      </div>

      <div className="space-y-4">
        {/* Entry Level (Root HTML) */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">
            Gốc trang chủ / Entry Point (HTML)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entryAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className="p-3 rounded-xl liquid-glass-interactive border border-white/20 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="p-1.5 rounded-lg bg-white/10">{getCategoryIcon(asset.category)}</div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-white block truncate">{asset.normalizedPath}</span>
                    <span className="text-[10px] text-zinc-400 truncate block font-mono">{asset.url}</span>
                  </div>
                </div>
                <div>{getStatusBadge(asset)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Level 1: Assets directly referenced by HTML (scripts, links, images) */}
        {level1Assets.length > 0 && (
          <div className="pl-4 border-l-2 border-white/15 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-300">
              <CornerDownRight className="w-3.5 h-3.5 text-zinc-400" />
              <span>Tài nguyên cấp 1 (Được gọi trực tiếp từ thẻ &lt;script src&gt;, &lt;link href&gt;, &lt;img&gt;):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {level1Assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="p-2.5 rounded-xl liquid-glass-interactive border border-white/10 cursor-pointer flex items-center justify-between hover:border-white/25"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="p-1.5 rounded-lg bg-black/40">{getCategoryIcon(asset.category)}</div>
                    <div className="truncate">
                      <span className="text-xs font-medium text-zinc-200 block truncate">{asset.normalizedPath}</span>
                      <span className="text-[10px] text-zinc-500 truncate block font-mono">{asset.category}</span>
                    </div>
                  </div>
                  <div>{getStatusBadge(asset)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level 2: Nested assets (e.g. Fonts & background images referenced inside CSS) */}
        {level2Assets.length > 0 && (
          <div className="pl-8 border-l-2 border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <CornerDownRight className="w-3.5 h-3.5 text-zinc-500" />
              <span>Tài nguyên cấp 2+ (Được gọi bên trong file CSS như @import, url fonts & icons):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {level2Assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="p-2.5 rounded-xl liquid-glass-subtle border border-white/10 cursor-pointer flex items-center justify-between hover:border-white/20"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="p-1.5 rounded-lg bg-black/40">{getCategoryIcon(asset.category)}</div>
                    <div className="truncate">
                      <span className="text-xs font-medium text-zinc-300 block truncate">{asset.normalizedPath}</span>
                      <span className="text-[10px] text-zinc-500 truncate block font-mono">gọi từ: {asset.parentUrl ? asset.parentUrl.split('/').pop() : 'css'}</span>
                    </div>
                  </div>
                  <div>{getStatusBadge(asset)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
