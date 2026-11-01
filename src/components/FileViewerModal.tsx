import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download, FileCode, MonitorPlay, Maximize2 } from 'lucide-react';
import { WebAsset } from '../types';

interface FileViewerModalProps {
  asset: WebAsset | null;
  onClose: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ asset, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<'code' | 'sandbox'>('code');

  if (!asset) return null;

  const handleCopy = () => {
    if (typeof asset.content === 'string') {
      navigator.clipboard.writeText(asset.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
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

  const isImage = asset.category === 'image';
  const isHtml = asset.category === 'html';
  const isMedia = asset.category === 'media';
  const isCode = !isImage && !isMedia;

  const textContent = typeof asset.content === 'string' ? asset.content : '';

  // For image preview
  let imageSrc = '';
  if (isImage) {
    if (asset.content instanceof Uint8Array) {
      const blob = new Blob([asset.content as unknown as BlobPart], { type: asset.mimeType || 'image/png' });
      imageSrc = URL.createObjectURL(blob);
    } else if (typeof asset.content === 'string' && asset.content.startsWith('<svg')) {
      const blob = new Blob([asset.content], { type: 'image/svg+xml' });
      imageSrc = URL.createObjectURL(blob);
    } else {
      imageSrc = asset.url;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-4xl max-h-[90vh] liquid-glass rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4 bg-black/40">
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-2 rounded-lg bg-white/10">
              <FileCode className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate">{asset.normalizedPath}</h3>
              <p className="text-[11px] text-zinc-400 font-mono truncate">{asset.url}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isHtml && (
              <div className="flex items-center p-0.5 bg-black/50 rounded-lg border border-white/10 text-xs">
                <button
                  onClick={() => setPreviewTab('code')}
                  className={`px-2.5 py-1 rounded-md font-medium ${
                    previewTab === 'code' ? 'liquid-glass text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Mã nguồn
                </button>
                <button
                  onClick={() => setPreviewTab('sandbox')}
                  className={`px-2.5 py-1 rounded-md font-medium ${
                    previewTab === 'sandbox' ? 'liquid-glass text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Xem thử Render
                </button>
              </div>
            )}

            {isCode && textContent && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg liquid-glass-subtle text-xs text-zinc-200 hover:text-white border border-white/15"
                title="Sao chép nội dung"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg liquid-glass-subtle text-zinc-300 hover:text-white border border-white/15"
              title="Tải tệp này"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-auto p-4 sm:p-5 bg-black/60 font-mono text-xs text-zinc-200">
          {isHtml && previewTab === 'sandbox' ? (
            <div className="w-full h-[60vh] rounded-xl overflow-hidden border border-white/15 bg-white">
              <iframe
                title="Preview"
                srcDoc={textContent}
                sandbox="allow-scripts"
                className="w-full h-full border-none"
              />
            </div>
          ) : isImage ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-black/40 rounded-xl border border-white/10">
              <img
                src={imageSrc}
                alt={asset.normalizedPath}
                className="max-h-[50vh] max-w-full object-contain rounded-lg shadow-lg border border-white/10"
              />
              <div className="mt-4 flex items-center gap-4 text-xs font-mono text-zinc-400">
                <span>Dung lượng: {(asset.sizeBytes / 1024).toFixed(1)} KB</span>
                <span>Định dạng: {asset.mimeType}</span>
              </div>
            </div>
          ) : isMedia ? (
            <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-xl">
              <audio controls className="w-full max-w-md">
                <source src={asset.url} type={asset.mimeType} />
                Trình duyệt của bạn không hỗ trợ phần tử âm thanh này.
              </audio>
            </div>
          ) : (
            <div className="relative">
              {asset.status === 'failed' ? (
                <div className="p-6 text-center text-red-400 font-sans">
                  <p className="font-semibold mb-1">Không thể tải nội dung tệp</p>
                  <p className="text-xs text-zinc-400">{asset.error || 'Lỗi kết nối hoặc máy chủ từ chối yêu cầu CORS.'}</p>
                </div>
              ) : textContent ? (
                <pre className="whitespace-pre-wrap break-all leading-relaxed select-text">
                  {textContent.length > 50000 ? textContent.slice(0, 50000) + '\n\n... [Nội dung quá dài, tải về để xem đầy đủ]' : textContent}
                </pre>
              ) : (
                <div className="p-6 text-center text-zinc-500">
                  Tệp nhị phân hoặc chưa có nội dung văn bản. Vui lòng tải về máy để mở bằng ứng dụng tương thích.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] font-mono text-zinc-400 px-5">
          <span>Loại: {asset.category.toUpperCase()} | MIME: {asset.mimeType || 'unknown'}</span>
          <span>Dung lượng: {(asset.sizeBytes / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </div>
  );
};
