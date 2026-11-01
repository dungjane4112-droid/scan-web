export type AssetCategory = 'html' | 'script' | 'style' | 'image' | 'font' | 'media' | 'other';

export type AssetStatus = 'pending' | 'fetching' | 'success' | 'failed' | 'skipped';

export interface WebAsset {
  id: string;
  url: string; // Absolute URL
  originalSrc: string; // The raw src/href as written in the document
  normalizedPath: string; // e.g., 'assets/css/main.css'
  category: AssetCategory;
  mimeType: string;
  sizeBytes: number;
  status: AssetStatus;
  content?: string | Uint8Array; // string for text, Uint8Array for binary
  isBinary: boolean;
  depth: number;
  parentUrl?: string;
  error?: string;
}

export interface DependencyNode {
  url: string;
  name: string;
  category: AssetCategory;
  children: DependencyNode[];
  sizeBytes?: number;
  status: AssetStatus;
}

export interface ExtractionConfig {
  maxDepth: number; // typically 1 or 2 (page -> linked assets -> CSS nested assets)
  extractScripts: boolean;
  extractStylesheets: boolean;
  extractImages: boolean;
  extractFonts: boolean;
  extractMedia: boolean;
  rewritePathsInZip: boolean;
  corsProxy: string; // 'allorigins' | 'corsproxy' | 'codetabs' | 'direct'
  concurrencyLimit: number;
}

export interface ExtractionStats {
  totalDiscovered: number;
  downloaded: number;
  failed: number;
  totalBytes: number;
  durationMs: number;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  text: string;
  details?: string;
}
