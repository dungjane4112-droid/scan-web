/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { LiquidBackground } from './components/LiquidBackground';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { StatsBar } from './components/StatsBar';
import { AssetList } from './components/AssetList';
import { FileViewerModal } from './components/FileViewerModal';
import { PresetsModal } from './components/PresetsModal';
import { ConsoleLogDrawer } from './components/ConsoleLogDrawer';

import { WebAsset, ExtractionConfig, ExtractionStats, LogMessage, AssetCategory } from './types';
import { fetchWithProxy } from './utils/cors';
import { 
  extractHtmlLinks, 
  extractCssLinks, 
  getNormalizedPath, 
  isBinaryCategory, 
  detectCategory 
} from './utils/extractor';
import { createZipArchive, triggerDownload } from './utils/zipper';
import { DemoPreset } from './utils/presets';

export default function App() {
  const [assets, setAssets] = useState<WebAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<WebAsset | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);

  const [stats, setStats] = useState<ExtractionStats>({
    totalDiscovered: 0,
    downloaded: 0,
    failed: 0,
    totalBytes: 0,
    durationMs: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const addLog = (type: LogMessage['type'], text: string, details?: string) => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      text,
      details,
    };
    setLogs((prev) => [...prev.slice(-100), newLog]);
  };

  const resetAll = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setAssets([]);
    setSelectedAsset(null);
    setIsExtracting(false);
    setIsZipping(false);
    setZipProgress(0);
    setStats({
      totalDiscovered: 0,
      downloaded: 0,
      failed: 0,
      totalBytes: 0,
      durationMs: 0,
    });
    addLog('info', 'Đã thiết lập lại dữ liệu.');
  };

  const handleStopExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsExtracting(false);
    addLog('warning', 'Đã dừng quá trình trích xuất theo yêu cầu của bạn.');
  };

  const handleStartExtraction = async (
    mode: 'url' | 'html' | 'file',
    target: string | File,
    baseUrl: string,
    config: ExtractionConfig
  ) => {
    resetAll();
    setIsExtracting(true);
    abortControllerRef.current = new AbortController();

    const startTime = Date.now();
    addLog('info', `Bắt đầu trích xuất theo phương thức: ${mode.toUpperCase()} (Base: ${baseUrl})`);

    let htmlContent = '';
    let entryUrl = baseUrl;

    try {
      // 1. Obtain root HTML
      if (mode === 'url' && typeof target === 'string') {
        entryUrl = target;
        addLog('info', `Đang tải mã HTML gốc từ: ${target}...`);
        const res = await fetchWithProxy(target, config.corsProxy, false);
        htmlContent = res.data as string;
      } else if (mode === 'html' && typeof target === 'string') {
        htmlContent = target;
        entryUrl = baseUrl;
      } else if (mode === 'file' && target instanceof File) {
        htmlContent = await target.text();
        entryUrl = baseUrl;
      }

      // Create root asset
      const rootAsset: WebAsset = {
        id: 'root-index',
        url: entryUrl,
        originalSrc: '',
        normalizedPath: 'index.html',
        category: 'html',
        mimeType: 'text/html',
        sizeBytes: new Blob([htmlContent]).size,
        status: 'success',
        content: htmlContent,
        isBinary: false,
        depth: 0,
      };

      const collectedAssets: WebAsset[] = [rootAsset];
      const seenUrls = new Set<string>([entryUrl]);

      setAssets([...collectedAssets]);
      setStats({
        totalDiscovered: 1,
        downloaded: 1,
        failed: 0,
        totalBytes: rootAsset.sizeBytes,
        durationMs: Date.now() - startTime,
      });

      addLog('success', `Đã tải thành công trang chính (${(rootAsset.sizeBytes / 1024).toFixed(1)} KB)`);

      // 2. Discover Level 1 links from HTML
      const links = extractHtmlLinks(htmlContent, entryUrl);
      addLog('info', `Phát hiện ${links.length} tài nguyên liên kết trong HTML.`);

      let assetCounter = 1;
      for (const link of links) {
        // Filter based on user config
        if (link.category === 'script' && !config.extractScripts) continue;
        if (link.category === 'style' && !config.extractStylesheets) continue;
        if (link.category === 'image' && !config.extractImages) continue;
        if (link.category === 'font' && !config.extractFonts) continue;
        if (link.category === 'media' && !config.extractMedia) continue;

        if (!seenUrls.has(link.url)) {
          seenUrls.add(link.url);
          const isBin = isBinaryCategory(link.category, link.url);
          const newAsset: WebAsset = {
            id: `asset-${assetCounter}`,
            url: link.url,
            originalSrc: link.originalSrc,
            normalizedPath: getNormalizedPath(link.url, link.category, assetCounter, false),
            category: link.category,
            mimeType: '',
            sizeBytes: 0,
            status: 'pending',
            isBinary: isBin,
            depth: 1,
            parentUrl: entryUrl,
          };
          collectedAssets.push(newAsset);
          assetCounter++;
        }
      }

      setAssets([...collectedAssets]);
      setStats((prev) => ({
        ...prev,
        totalDiscovered: collectedAssets.length,
      }));

      // 3. Queue and download assets concurrently
      const queue = [...collectedAssets.filter((a) => a.status === 'pending')];
      const activeDownloads = new Set<Promise<void>>();

      const downloadItem = async (asset: WebAsset) => {
        if (abortControllerRef.current?.signal.aborted) return;

        // Mark as fetching
        setAssets((prev) =>
          prev.map((a) => (a.id === asset.id ? { ...a, status: 'fetching' } : a))
        );

        try {
          const res = await fetchWithProxy(asset.url, config.corsProxy, asset.isBinary);
          
          asset.content = res.data;
          asset.mimeType = res.mimeType;
          asset.sizeBytes = res.size;
          asset.status = 'success';

          addLog('success', `Đã tải: ${asset.normalizedPath} (${(res.size / 1024).toFixed(1)} KB)`);

          // 4. Recursive discovery: If it's a CSS file and maxDepth >= 2, scan for url() and @import
          if (asset.category === 'style' && typeof res.data === 'string' && config.maxDepth >= 2) {
            const nested = extractCssLinks(res.data, asset.url);
            if (nested.length > 0) {
              addLog('info', `Tìm thấy ${nested.length} tài nguyên con trong CSS (${asset.normalizedPath}).`);
              for (const item of nested) {
                if (item.category === 'font' && !config.extractFonts) continue;
                if (item.category === 'image' && !config.extractImages) continue;

                if (!seenUrls.has(item.url)) {
                  seenUrls.add(item.url);
                  const isBin = isBinaryCategory(item.category, item.url);
                  const childAsset: WebAsset = {
                    id: `asset-${assetCounter++}`,
                    url: item.url,
                    originalSrc: item.originalSrc,
                    normalizedPath: getNormalizedPath(item.url, item.category, assetCounter, false),
                    category: item.category,
                    mimeType: '',
                    sizeBytes: 0,
                    status: 'pending',
                    isBinary: isBin,
                    depth: asset.depth + 1,
                    parentUrl: asset.url,
                  };
                  collectedAssets.push(childAsset);
                  queue.push(childAsset);
                }
              }
            }
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          asset.status = 'failed';
          asset.error = errMsg;
          addLog('error', `Lỗi khi tải ${asset.normalizedPath}: ${errMsg}`);
        } finally {
          // Update state and stats
          setAssets([...collectedAssets]);
          setStats((prev) => {
            const success = collectedAssets.filter((a) => a.status === 'success');
            const failed = collectedAssets.filter((a) => a.status === 'failed');
            const totalBytes = success.reduce((acc, curr) => acc + curr.sizeBytes, 0);
            return {
              totalDiscovered: collectedAssets.length,
              downloaded: success.length,
              failed: failed.length,
              totalBytes,
              durationMs: Date.now() - startTime,
            };
          });
        }
      };

      // Concurrency worker runner
      while (queue.length > 0 && !abortControllerRef.current?.signal.aborted) {
        while (activeDownloads.size < config.concurrencyLimit && queue.length > 0) {
          const nextAsset = queue.shift();
          if (!nextAsset) break;

          const promise: Promise<void> = downloadItem(nextAsset).finally(() => {
            activeDownloads.delete(promise);
          });
          activeDownloads.add(promise);
        }

        if (activeDownloads.size > 0) {
          await Promise.race(activeDownloads);
        }
      }

      // Await remaining in-flight downloads
      await Promise.all(activeDownloads);

      const finalSuccess = collectedAssets.filter((a) => a.status === 'success').length;
      addLog('success', `Hoàn thành trích xuất! Đã sẵn sàng ${finalSuccess} tệp để đóng gói ZIP.`);
    } catch (globalErr: unknown) {
      const msg = globalErr instanceof Error ? globalErr.message : String(globalErr);
      addLog('error', `Lỗi tiến trình: ${msg}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadZip = async () => {
    if (assets.length === 0 || isZipping) return;
    setIsZipping(true);
    setZipProgress(10);
    addLog('info', 'Đang nén các tệp tài nguyên vào gói ZIP...');

    try {
      const result = await createZipArchive(assets, {
        rewriteLinks: true,
        onProgress: (percent, currentFile) => {
          setZipProgress(percent);
          if (percent % 25 === 0) {
            addLog('info', `Tiến trình nén ZIP (${percent}%): ${currentFile}`);
          }
        },
      });

      triggerDownload(result.blob, result.filename);
      addLog('success', `Tệp nén đã được tạo thành công: ${result.filename}`);
    } catch (zipErr: unknown) {
      const msg = zipErr instanceof Error ? zipErr.message : String(zipErr);
      addLog('error', `Lỗi khi đóng gói ZIP: ${msg}`);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  const handleSelectPreset = (preset: DemoPreset) => {
    if (preset.htmlContent) {
      handleStartExtraction('html', preset.htmlContent, preset.url, {
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
    } else {
      handleStartExtraction('url', preset.url, preset.url, {
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
    }
  };

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col relative selection:bg-white/20 selection:text-white pb-20">
      <LiquidBackground />

      <Header
        onReset={resetAll}
        hasAssets={assets.length > 0}
        onOpenPresets={() => setIsPresetsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Input Panel */}
        <InputPanel
          onStartExtraction={handleStartExtraction}
          isExtracting={isExtracting}
          onStopExtraction={handleStopExtraction}
        />

        {/* Stats & Actions */}
        <StatsBar
          stats={stats}
          assets={assets}
          onDownloadZip={handleDownloadZip}
          isZipping={isZipping}
          zipProgress={zipProgress}
        />

        {/* Assets List & Visual Graph */}
        <AssetList
          assets={assets}
          onSelectAsset={(asset) => setSelectedAsset(asset)}
        />
      </main>

      {/* File Inspector Modal */}
      <FileViewerModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />

      {/* Presets Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Bottom Collapsible Logs Console */}
      <ConsoleLogDrawer
        logs={logs}
        onClearLogs={() => setLogs([])}
      />
    </div>
  );
}
