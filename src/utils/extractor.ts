import { AssetCategory, WebAsset } from '../types';

export function resolveUrl(relativeOrAbsolute: string, baseUrl: string): string {
  try {
    const cleaned = relativeOrAbsolute.trim().replace(/^['"]|['"]$/g, '');
    if (cleaned.startsWith('data:') || cleaned.startsWith('blob:') || cleaned.startsWith('javascript:')) {
      return cleaned;
    }
    // Handle protocol-relative URLs
    if (cleaned.startsWith('//')) {
      const baseProto = new URL(baseUrl).protocol;
      return `${baseProto}${cleaned}`;
    }
    return new URL(cleaned, baseUrl).href;
  } catch {
    return relativeOrAbsolute;
  }
}

export function detectCategory(url: string, mime?: string): AssetCategory {
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  
  if (mime) {
    if (mime.includes('text/html')) return 'html';
    if (mime.includes('javascript') || mime.includes('ecmascript')) return 'script';
    if (mime.includes('text/css')) return 'style';
    if (mime.includes('image/')) return 'image';
    if (mime.includes('font/') || mime.includes('font-') || mime.includes('woff')) return 'font';
    if (mime.includes('video/') || mime.includes('audio/')) return 'media';
  }

  if (cleanUrl.endsWith('.html') || cleanUrl.endsWith('.htm') || cleanUrl.endsWith('.xhtml')) return 'html';
  if (cleanUrl.endsWith('.js') || cleanUrl.endsWith('.mjs') || cleanUrl.endsWith('.cjs') || cleanUrl.endsWith('.ts')) return 'script';
  if (cleanUrl.endsWith('.css') || cleanUrl.endsWith('.scss') || cleanUrl.endsWith('.less')) return 'style';
  if (/\.(png|jpe?g|gif|webp|svg|ico|bmp|avif)$/.test(cleanUrl)) return 'image';
  if (/\.(woff2?|ttf|otf|eot)$/.test(cleanUrl)) return 'font';
  if (/\.(mp4|webm|ogg|mp3|wav|flac|m4a|aac)$/.test(cleanUrl)) return 'media';

  return 'other';
}

export function isBinaryCategory(category: AssetCategory, url: string): boolean {
  if (category === 'image' && !url.toLowerCase().split('?')[0].endsWith('.svg')) return true;
  if (category === 'font' || category === 'media') return true;
  return false;
}

export function getCleanFilename(url: string, category: AssetCategory, index: number): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);
    let name = parts[parts.length - 1];
    if (!name || name.indexOf('.') === -1) {
      const extMap: Record<AssetCategory, string> = {
        html: 'html',
        script: 'js',
        style: 'css',
        image: 'png',
        font: 'woff2',
        media: 'mp4',
        other: 'bin',
      };
      name = `asset_${index}.${extMap[category] || 'bin'}`;
    }
    // Sanitize illegal chars
    return name.replace(/[<>:"/\\|?*]/g, '_');
  } catch {
    return `resource_${index}`;
  }
}

export function getNormalizedPath(url: string, category: AssetCategory, index: number, isEntryHtml: boolean = false): string {
  if (isEntryHtml) return 'index.html';
  
  const filename = getCleanFilename(url, category, index);
  switch (category) {
    case 'script':
      return `assets/js/${filename}`;
    case 'style':
      return `assets/css/${filename}`;
    case 'image':
      return `assets/images/${filename}`;
    case 'font':
      return `assets/fonts/${filename}`;
    case 'media':
      return `assets/media/${filename}`;
    default:
      return `assets/other/${filename}`;
  }
}

export function extractHtmlLinks(htmlText: string, baseUrl: string): Array<{ url: string; originalSrc: string; category: AssetCategory }> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const found: Array<{ url: string; originalSrc: string; category: AssetCategory }> = [];
  const seenUrls = new Set<string>();

  const add = (raw: string | null | undefined, cat: AssetCategory) => {
    if (!raw) return;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('javascript:')) return;
    const resolved = resolveUrl(trimmed, baseUrl);
    if (!resolved.startsWith('http://') && !resolved.startsWith('https://') && !resolved.startsWith('data:')) return;
    if (seenUrls.has(resolved)) return;
    seenUrls.add(resolved);
    found.push({ url: resolved, originalSrc: trimmed, category: cat });
  };

  // 1. Script tags
  doc.querySelectorAll('script[src]').forEach((el) => {
    add(el.getAttribute('src'), 'script');
  });

  // 2. Link tags (stylesheets, icons, preloads)
  doc.querySelectorAll('link[href]').forEach((el) => {
    const rel = (el.getAttribute('rel') || '').toLowerCase();
    const href = el.getAttribute('href');
    if (rel.includes('stylesheet')) {
      add(href, 'style');
    } else if (rel.includes('icon')) {
      add(href, 'image');
    } else if (rel.includes('preload') || rel.includes('prefetch')) {
      const asType = el.getAttribute('as') || '';
      if (asType === 'style') add(href, 'style');
      else if (asType === 'script') add(href, 'script');
      else if (asType === 'image') add(href, 'image');
      else if (asType === 'font') add(href, 'font');
      else add(href, detectCategory(href || ''));
    } else {
      add(href, detectCategory(href || ''));
    }
  });

  // 3. Images and Picture sources
  doc.querySelectorAll('img[src]').forEach((el) => {
    add(el.getAttribute('src'), 'image');
  });
  doc.querySelectorAll('img[srcset], source[srcset]').forEach((el) => {
    const srcset = el.getAttribute('srcset') || '';
    srcset.split(',').forEach((part) => {
      const src = part.trim().split(/\s+/)[0];
      if (src) add(src, 'image');
    });
  });

  // 4. Video / Audio / Sources
  doc.querySelectorAll('video[src], audio[src], source[src]').forEach((el) => {
    const parentTag = el.parentElement?.tagName.toLowerCase();
    const cat = parentTag === 'video' || el.tagName.toLowerCase() === 'video' ? 'media' : 'media';
    add(el.getAttribute('src'), cat);
  });

  // 5. Video posters
  doc.querySelectorAll('video[poster]').forEach((el) => {
    add(el.getAttribute('poster'), 'image');
  });

  return found;
}

export function extractCssLinks(cssText: string, cssUrl: string): Array<{ url: string; originalSrc: string; category: AssetCategory }> {
  const found: Array<{ url: string; originalSrc: string; category: AssetCategory }> = [];
  const seenUrls = new Set<string>();

  const add = (raw: string, cat: AssetCategory) => {
    const trimmed = raw.trim().replace(/^['"]|['"]$/g, '');
    if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('#')) return;
    const resolved = resolveUrl(trimmed, cssUrl);
    if (!resolved.startsWith('http://') && !resolved.startsWith('https://')) return;
    if (seenUrls.has(resolved)) return;
    seenUrls.add(resolved);
    found.push({ url: resolved, originalSrc: trimmed, category: cat });
  };

  // 1. @import statements: @import "file.css"; or @import url("file.css");
  const importRegex = /@import\s+(?:url\(['"]?([^'"\)]+)['"]?\)|['"]([^'"]+)['"])/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(cssText)) !== null) {
    const importUrl = match[1] || match[2];
    if (importUrl) add(importUrl, 'style');
  }

  // 2. url(...) statements in CSS rules
  const urlRegex = /url\(\s*['"]?([^'"\)]+)['"]?\s*\)/g;
  while ((match = urlRegex.exec(cssText)) !== null) {
    const rawUrl = match[1];
    if (rawUrl && !rawUrl.startsWith('data:')) {
      const cat = detectCategory(rawUrl);
      add(rawUrl, cat);
    }
  }

  return found;
}
