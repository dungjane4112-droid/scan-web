/**
 * Utility to fetch remote web resources in a 100% browser-side environment
 * using CORS proxies with automatic failover.
 */

export const CORS_PROXIES = [
  { id: 'corsproxy', name: 'CorsProxy.io', template: (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}` },
  { id: 'allorigins', name: 'AllOrigins Win (Raw)', template: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
  { id: 'codetabs', name: 'CodeTabs Proxy', template: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}` },
  { id: 'direct', name: 'Direct (No Proxy)', template: (url: string) => url },
];

export async function fetchWithProxy(
  url: string,
  preferredProxyId: string = 'corsproxy',
  asBinary: boolean = false
): Promise<{ data: string | Uint8Array; mimeType: string; size: number }> {
  // If it's a data URL or blob URL, handle directly
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    const res = await fetch(url);
    const mimeType = res.headers.get('content-type') || 'application/octet-stream';
    if (asBinary) {
      const buffer = await res.arrayBuffer();
      return { data: new Uint8Array(buffer), mimeType, size: buffer.byteLength };
    } else {
      const text = await res.text();
      return { data: text, mimeType, size: new Blob([text]).size };
    }
  }

  // Build proxy order starting with preferred proxy
  const sortedProxies = [...CORS_PROXIES].sort((a, b) => {
    if (a.id === preferredProxyId) return -1;
    if (b.id === preferredProxyId) return 1;
    return 0;
  });

  let lastError: Error | null = null;

  for (const proxy of sortedProxies) {
    try {
      const targetUrl = proxy.template(url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'Accept': '*/*',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const mimeType = response.headers.get('content-type')?.split(';')[0].trim() || 'application/octet-stream';

      if (asBinary) {
        const buffer = await response.arrayBuffer();
        return {
          data: new Uint8Array(buffer),
          mimeType,
          size: buffer.byteLength,
        };
      } else {
        const text = await response.text();
        return {
          data: text,
          mimeType,
          size: new Blob([text]).size,
        };
      }
    } catch (err: unknown) {
      const errObj = err instanceof Error ? err : new Error(String(err));
      lastError = errObj;
      // Continue to next proxy in list
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} through available CORS gateways`);
}
