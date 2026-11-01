import React, { useState } from 'react';
import { Globe, Code2, UploadCloud, Play, StopCircle, Sliders, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { ExtractionConfig } from '../types';
import { CORS_PROXIES } from '../utils/cors';

interface InputPanelProps {
  onStartExtraction: (
    mode: 'url' | 'html' | 'file',
    target: string | File,
    baseUrl: string,
    config: ExtractionConfig
  ) => void;
  isExtracting: boolean;
  onStopExtraction: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  onStartExtraction,
  isExtracting,
  onStopExtraction,
}) => {
  const [mode, setMode] = useState<'url' | 'html' | 'file'>('url');
  const [urlInput, setUrlInput] = useState('https://news.ycombinator.com');
  const [htmlInput, setHtmlInput] = useState(`<!DOCTYPE html>
<html>
<head>
  <title>Trang mẫu thử nghiệm</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
</head>
<body>
  <h1>Xin chào thế giới</h1>
  <img src="https://vitejs.dev/logo.svg" alt="Vite Logo" />
</body>
</html>`);
  const [htmlBaseUrl, setHtmlBaseUrl] = useState('https://example.com/');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<ExtractionConfig>({
    maxDepth: 2,
    extractScripts: true,
    extractStylesheets: true,
    extractImages: true,
    extractFonts: true,
    extractMedia: true,
    rewritePathsInZip: true,
    corsProxy: 'corsproxy',
    concurrencyLimit: 4,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExtracting) {
      onStopExtraction();
      return;
    }

    if (mode === 'url') {
      let finalUrl = urlInput.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      onStartExtraction('url', finalUrl, finalUrl, config);
    } else if (mode === 'html') {
      onStartExtraction('html', htmlInput, htmlBaseUrl.trim() || 'https://example.com/', config);
    } else if (mode === 'file' && uploadedFile) {
      onStartExtraction('file', uploadedFile, htmlBaseUrl.trim() || 'https://example.com/', config);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full liquid-glass rounded-2xl p-5 sm:p-7 border border-white/15 shadow-2xl relative">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 w-fit mb-5">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'url'
              ? 'liquid-glass text-white border border-white/25 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Nhập URL trực tiếp
        </button>
        <button
          type="button"
          onClick={() => setMode('html')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'html'
              ? 'liquid-glass text-white border border-white/25 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Dán mã HTML
        </button>
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'file'
              ? 'liquid-glass text-white border border-white/25 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Tải tệp .HTML
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'url' && (
          <div className="relative">
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Địa chỉ trang web mục tiêu (Website Target URL)
            </label>
            <div className="flex items-center relative">
              <span className="absolute left-3.5 text-zinc-500 font-mono text-xs">
                https://
              </span>
              <input
                type="text"
                value={urlInput.replace(/^https?:\/\//i, '')}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="news.ycombinator.com hoặc en.wikipedia.org/wiki/HTML"
                disabled={isExtracting}
                className="w-full bg-black/50 border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/40 rounded-xl pl-19 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center justify-between">
              <span>Hệ thống sẽ tải trang HTML, phân tích mọi liên kết (script, css, image, font) và đóng gói lại.</span>
              <span className="text-zinc-500 font-mono">Đang dùng: {CORS_PROXIES.find(p => p.id === config.corsProxy)?.name}</span>
            </p>
          </div>
        )}

        {mode === 'html' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Mã nguồn HTML (Dán từ Ctrl+U hoặc DevTools)
              </label>
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                rows={5}
                disabled={isExtracting}
                placeholder="<!DOCTYPE html><html>...</html>"
                className="w-full bg-black/50 border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/40 rounded-xl p-3 text-xs text-zinc-200 font-mono outline-none resize-y placeholder-zinc-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Base URL gốc (để chuẩn hóa đường dẫn tương đối như ./app.js hoặc /css/style.css)
              </label>
              <input
                type="text"
                value={htmlBaseUrl}
                onChange={(e) => setHtmlBaseUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isExtracting}
                className="w-full bg-black/50 border border-white/15 focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>
        )}

        {mode === 'file' && (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Chọn tệp HTML từ máy tính của bạn
            </label>
            <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition bg-black/30">
              <input
                type="file"
                accept=".html,.htm,.txt"
                onChange={handleFileUpload}
                disabled={isExtracting}
                id="file-upload"
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-200">
                  {uploadedFile ? uploadedFile.name : 'Bấm vào đây để chọn tệp .html'}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : 'Định dạng được hỗ trợ: HTML, HTM'}
                </span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Base URL gốc (để tải các tài nguyên phụ thuộc được liên kết trong file)
              </label>
              <input
                type="text"
                value={htmlBaseUrl}
                onChange={(e) => setHtmlBaseUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isExtracting}
                className="w-full bg-black/50 border border-white/15 focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>
        )}

        {/* Configuration toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>Tùy chỉnh trích xuất nâng cao & Proxy</span>
            {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showConfig && (
            <div className="mt-3 p-4 rounded-xl liquid-glass-subtle border border-white/10 space-y-4 text-xs">
              <div>
                <span className="text-zinc-300 font-medium block mb-2">Loại tài nguyên cần trích xuất:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.extractScripts}
                      onChange={(e) => setConfig({ ...config, extractScripts: e.target.checked })}
                      className="accent-white"
                    />
                    <span>Scripts (.js, modules)</span>
                  </label>
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.extractStylesheets}
                      onChange={(e) => setConfig({ ...config, extractStylesheets: e.target.checked })}
                      className="accent-white"
                    />
                    <span>Stylesheets (.css)</span>
                  </label>
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.extractImages}
                      onChange={(e) => setConfig({ ...config, extractImages: e.target.checked })}
                      className="accent-white"
                    />
                    <span>Hình ảnh (png, svg, jpg)</span>
                  </label>
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.extractFonts}
                      onChange={(e) => setConfig({ ...config, extractFonts: e.target.checked })}
                      className="accent-white"
                    />
                    <span>Phông chữ (woff2, ttf)</span>
                  </label>
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.extractMedia}
                      onChange={(e) => setConfig({ ...config, extractMedia: e.target.checked })}
                      className="accent-white"
                    />
                    <span>Media (video, audio)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Cổng CORS Gateway (Tránh lỗi chặn CORS trình duyệt):
                  </label>
                  <select
                    value={config.corsProxy}
                    onChange={(e) => setConfig({ ...config, corsProxy: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none text-xs"
                  >
                    {CORS_PROXIES.map((p) => (
                      <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Độ sâu quét liên kết CSS (@import, url()):
                  </label>
                  <select
                    value={config.maxDepth}
                    onChange={(e) => setConfig({ ...config, maxDepth: Number(e.target.value) })}
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-zinc-200 outline-none text-xs"
                  >
                    <option value={1} className="bg-zinc-900 text-white">Cấp 1 (Chỉ các file trực tiếp trong HTML)</option>
                    <option value={2} className="bg-zinc-900 text-white">Cấp 2 (Quét thêm file được gọi trong CSS)</option>
                    <option value={3} className="bg-zinc-900 text-white">Cấp 3 (Quét sâu toàn diện)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rewrite-paths"
                  checked={config.rewritePathsInZip}
                  onChange={(e) => setConfig({ ...config, rewritePathsInZip: e.target.checked })}
                  className="accent-white"
                />
                <label htmlFor="rewrite-paths" className="text-zinc-300 cursor-pointer select-none">
                  Tự động ghi đè đường dẫn cục bộ trong tệp ZIP (để mở index.html offline xem được ngay mà không lỗi liên kết)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-zinc-500 font-mono">
            {isExtracting ? 'Đang trích xuất dữ liệu...' : 'Sẵn sàng phân tích'}
          </div>

          <div className="flex items-center gap-3">
            {isExtracting ? (
              <button
                type="button"
                onClick={onStopExtraction}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-900/40 hover:text-white transition font-medium text-xs shadow-lg"
              >
                <StopCircle className="w-4 h-4" />
                Dừng trích xuất
              </button>
            ) : (
              <button
                type="submit"
                className="glass-specular relative flex items-center gap-2 px-6 py-2.5 rounded-xl liquid-glass-interactive text-white font-semibold text-xs border border-white/30 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Bắt đầu trích xuất tài nguyên
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
