import JSZip from 'jszip';
import { WebAsset } from '../types';

export async function createZipArchive(
  assets: WebAsset[],
  options: {
    rewriteLinks: boolean;
    zipFilename?: string;
    onProgress?: (percent: number, currentFile: string) => void;
  }
): Promise<{ blob: Blob; filename: string }> {
  const zip = new JSZip();
  const successfulAssets = assets.filter((a) => a.status === 'success' && a.content !== undefined);

  // Map original URLs and relative paths to their normalized paths
  const urlToLocalPathMap = new Map<string, string>();
  for (const asset of successfulAssets) {
    urlToLocalPathMap.set(asset.url, asset.normalizedPath);
    if (asset.originalSrc) {
      urlToLocalPathMap.set(asset.originalSrc, asset.normalizedPath);
    }
  }

  const total = successfulAssets.length;
  let processed = 0;

  for (const asset of successfulAssets) {
    let finalContent = asset.content;

    // Optional link rewriting for index.html or other HTML/CSS files
    if (options.rewriteLinks && typeof finalContent === 'string') {
      if (asset.category === 'html') {
        let rewrittenHtml = finalContent;
        // Rewrite each asset reference
        for (const target of successfulAssets) {
          if (target.id === asset.id) continue;
          // Calculate relative path from this asset to target
          const targetRelPath = target.normalizedPath; // for index.html at root, assets/css/... is direct
          if (target.originalSrc) {
            rewrittenHtml = rewrittenHtml.split(target.originalSrc).join(targetRelPath);
          }
          rewrittenHtml = rewrittenHtml.split(target.url).join(targetRelPath);
        }
        finalContent = rewrittenHtml;
      } else if (asset.category === 'style') {
        let rewrittenCss = finalContent;
        // From assets/css/style.css to assets/images/pic.png is ../images/pic.png
        for (const target of successfulAssets) {
          if (target.id === asset.id) continue;
          let relPath = target.normalizedPath;
          if (relPath.startsWith('assets/')) {
            relPath = `../${relPath.replace('assets/', '')}`;
          }
          if (target.originalSrc) {
            rewrittenCss = rewrittenCss.split(target.originalSrc).join(relPath);
          }
          rewrittenCss = rewrittenCss.split(target.url).join(relPath);
        }
        finalContent = rewrittenCss;
      }
    }

    if (asset.isBinary && asset.content instanceof Uint8Array) {
      zip.file(asset.normalizedPath, asset.content, { binary: true });
    } else if (typeof finalContent === 'string') {
      zip.file(asset.normalizedPath, finalContent);
    }

    processed++;
    if (options.onProgress) {
      options.onProgress(Math.round((processed / total) * 50), asset.normalizedPath);
    }
  }

  // Also include a README.md summary in the zip
  const manifest = [
    `# LiquidWeb Extracted Assets Archive`,
    `Generated on: ${new Date().toISOString()}`,
    `Total assets extracted: ${successfulAssets.length}`,
    ``,
    `## File Structure:`,
    ...successfulAssets.map((a) => `- ${a.normalizedPath} (${(a.sizeBytes / 1024).toFixed(1)} KB) <- ${a.url}`),
  ].join('\n');
  zip.file('README_MANIFEST.txt', manifest);

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (options.onProgress) {
        options.onProgress(50 + Math.round(metadata.percent * 0.5), 'Compressing files...');
      }
    }
  );

  const filename = options.zipFilename || `liquidweb-extract-${Date.now()}.zip`;
  return { blob: zipBlob, filename };
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
