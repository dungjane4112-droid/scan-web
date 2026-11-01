export interface DemoPreset {
  id: string;
  name: string;
  description: string;
  url: string;
  htmlContent?: string;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'cyber-minimalist',
    name: 'Cyber Minimalist Portfolio',
    description: 'Trang web với cấu trúc CSS phân nhánh, phông chữ WOFF2, ảnh SVG và script JS module liên kết.',
    url: 'https://example.com/demo-app',
    htmlContent: `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Cyber Minimalist Studio</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap">
  <link rel="icon" type="image/svg+xml" href="https://vitejs.dev/logo.svg">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
</head>
<body>
  <div class="hero">
    <h1>Liquid Cyber Minimalist</h1>
    <p>Hệ thống tự động phát hiện mọi liên kết tập tin và đóng gói ZIP.</p>
    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80" alt="Liquid 3D Texture">
    <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80" alt="Tech Architecture">
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</body>
</html>`,
  },
  {
    id: 'wikipedia-article',
    name: 'Wikipedia Article (Live URL)',
    description: 'Trang bách khoa trực tiếp với hàng loạt stylesheet, script, icon và ảnh tư liệu.',
    url: 'https://en.wikipedia.org/wiki/Web_crawler',
  },
  {
    id: 'hacker-news',
    name: 'Hacker News (Minimalist Web)',
    description: 'Trang web chuẩn với file CSS thuần, favicon gif và liên kết bài viết.',
    url: 'https://news.ycombinator.com',
  },
  {
    id: 'custom-paste',
    name: 'Dán mã HTML tùy ý',
    description: 'Dán trực tiếp mã nguồn HTML từ trình duyệt (Inspect Element) để trích xuất ngay lập tức.',
    url: 'https://mysite.local/index.html',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
</head>
<body>
  <h2>Trang thử nghiệm trích xuất tài nguyên kết nối</h2>
  <img src="https://picsum.photos/600/400" alt="Test image">
</body>
</html>`,
  },
];
