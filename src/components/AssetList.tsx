import React, { useState, useMemo } from 'react';
import { 
  FileCode, FileText, Image as ImageIcon, Music, Type, Box, 
  ExternalLink, Download, Eye, Search, Filter, CheckCircle2, 
  AlertCircle, Loader2, GitFork, List, Grid3X3, Copy, Check
} from 'lucide-react';
import { WebAsset, AssetCategory } from '../types';
import { DependencyGraphView } from './DependencyGraphView';

interface AssetListProps {
  assets: WebAsset[];
  onSelectAsset: (asset: WebAsset) => void;
  onRetryAsset?: (asset: WebAsset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ assets, onSelectAsset, onRetryAsset }) => {
  const [activeTab, setActiveTab] = useState<'all' | AssetCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'graph'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesTab = activeTab === 'all' || asset.category === activeTab;
      const matchesSearch =
        !searchQuery ||
        asset.normalizedPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.url.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [assets, activeTab, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSingle = (asset: WebAsset) => {
    if (!asset.content) return;
    let blob: Blob;
    if (asset.isBinary && asset.content instanceof Uint8Array) {
      blob = new Blob([asset.content as unknown as BlobPart], { type: asset.mimeType });
    } else {
      blob = new Blob([asset.content as string], { type: asset.mimeType || 'text/plain' });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = asset.normalizedPath.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const getCategoryBadge = (category: AssetCategory) => {
    const config: Record<AssetCategory, { label: string; color: string; icon: React.ReactNode }> = {
      html: { label: 'HTML', color: 'bg-zinc-700/50 text-white border-zinc-500/30', icon: <FileCode className="w-3 h-3" /> },
      script: { label: 'JS Script', color: 'bg-amber-950/40 text-amber-200 border-amber-500/25', icon: <FileCode className="w-3 h-3" /> },
      style: { label: 'CSS Style', color: 'bg-sky-950/40 text-sky-200 border-sky-500/25', icon: <FileText className="w-3 h-3" /> },
      image: { label: 'Image', color: 'bg-emerald-950/40 text-emerald-200 border-emerald-500/25', icon: <ImageIcon className="w-3 h-3" /> },
      font: { label: 'Font', color: 'bg-purple-950/40 text-purple-200 border-purple-500/25', icon: <Type className="w-3 h-3" /> },
      media: { label: 'Media', color: 'bg-rose-950/40 text-rose-200 border-rose-500/25', icon: <Music className="w-3 h-3" /> },
      other: { label: 'File', color: 'bg-zinc-800/40 text-zinc-300 border-zinc-600/25', icon: <Box className="w-3 h-3" /> },
    };
    const c = config[category] || config.other;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border ${c.color}`}>
        {c.icon}
        {c.label}
      </span>
    );
  };

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: assets.length };
    for (const a of assets) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [assets]);

  return (
    <div className="w-full liquid-glass rounded-2xl border border-white/15 shadow-2xl overflow-hidden">
      {/* Top Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên file, đuôi mở rộng hoặc URL..."
            className="w-full bg-black/40 border border-white/10 focus:border-white/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs transition ${
              viewMode === 'table' ? 'liquid-glass text-white border border-white/20' : 'text-zinc-400 hover:text-white'
            }`}
            title="Dạng bảng chi tiết"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs transition ${
              viewMode === 'grid' ? 'liquid-glass text-white border border-white/20' : 'text-zinc-400 hover:text-white'
            }`}
            title="Dạng lưới thẻ"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              viewMode === 'graph' ? 'liquid-glass text-white border border-white/20' : 'text-zinc-400 hover:text-white'
            }`}
            title="Sơ đồ cây liên kết phụ thuộc"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Cây phụ thuộc</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="px-4 py-2.5 border-b border-white/10 bg-black/20 flex items-center gap-1.5 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
            activeTab === 'all'
              ? 'liquid-glass text-white border border-white/25 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Tất cả ({countsByCategory.all || 0})
        </button>
        {(['html', 'script', 'style', 'image', 'font', 'media'] as AssetCategory[]).map((cat) => {
          const count = countsByCategory[cat] || 0;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap capitalize ${
                activeTab === cat
                  ? 'liquid-glass text-white border border-white/25 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Content View */}
      {viewMode === 'graph' ? (
        <DependencyGraphView assets={filteredAssets} onSelectAsset={onSelectAsset} />
      ) : filteredAssets.length === 0 ? (
        <div className="p-16 text-center text-zinc-500 font-medium text-xs">
          {assets.length === 0
            ? 'Chưa có tập tin nào. Hãy nhập URL hoặc dán mã HTML để bắt đầu trích xuất.'
            : 'Không tìm thấy tập tin phù hợp với bộ lọc hiện tại.'}
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 font-mono text-[11px] bg-black/30">
                <th className="py-3 px-4 font-medium">Tên file & Đường dẫn ZIP</th>
                <th className="py-3 px-3 font-medium">Loại</th>
                <th className="py-3 px-3 font-medium">Dung lượng</th>
                <th className="py-3 px-3 font-medium">Trạng thái</th>
                <th className="py-3 px-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-white/[0.03] transition group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5 max-w-md">
                      <div className="truncate">
                        <span 
                          onClick={() => onSelectAsset(asset)}
                          className="font-medium text-zinc-200 hover:text-white cursor-pointer hover:underline block truncate"
                        >
                          {asset.normalizedPath}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate font-mono">
                          {asset.url}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getCategoryBadge(asset.category)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-zinc-300">
                    {asset.status === 'success' ? `${(asset.sizeBytes / 1024).toFixed(1)} KB` : '—'}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {asset.status === 'success' && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã tải
                      </span>
                    )}
                    {asset.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 text-red-400 font-medium" title={asset.error}>
                        <AlertCircle className="w-3.5 h-3.5" /> Thất bại
                      </span>
                    )}
                    {asset.status === 'fetching' && (
                      <span className="inline-flex items-center gap-1 text-zinc-300 font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tải...
                      </span>
                    )}
                    {asset.status === 'pending' && (
                      <span className="text-zinc-500">Đang chờ</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onSelectAsset(asset)}
                        className="p-1.5 rounded-lg liquid-glass-subtle text-zinc-300 hover:text-white hover:border-white/30"
                        title="Xem trước nội dung"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {asset.status === 'success' && (
                        <button
                          onClick={() => handleDownloadSingle(asset)}
                          className="p-1.5 rounded-lg liquid-glass-subtle text-zinc-300 hover:text-white hover:border-white/30"
                          title="Tải tệp này về máy"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(asset.id, asset.url)}
                        className="p-1.5 rounded-lg liquid-glass-subtle text-zinc-300 hover:text-white hover:border-white/30"
                        title="Sao chép liên kết gốc"
                      >
                        {copiedId === asset.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg liquid-glass-subtle text-zinc-400 hover:text-white"
                        title="Mở URL gốc trên tab mới"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-4 rounded-xl liquid-glass-subtle border border-white/10 hover:border-white/25 transition flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  {getCategoryBadge(asset.category)}
                  <span className="text-[11px] font-mono text-zinc-400">
                    {asset.status === 'success' ? `${(asset.sizeBytes / 1024).toFixed(1)} KB` : asset.status}
                  </span>
                </div>
                <h4
                  onClick={() => onSelectAsset(asset)}
                  className="text-xs font-semibold text-zinc-100 hover:text-white cursor-pointer truncate"
                  title={asset.normalizedPath}
                >
                  {asset.normalizedPath}
                </h4>
                <p className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">{asset.url}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {asset.mimeType || 'unknown mime'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectAsset(asset)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300"
                    title="Xem trước"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {asset.status === 'success' && (
                    <button
                      onClick={() => handleDownloadSingle(asset)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300"
                      title="Tải về"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
