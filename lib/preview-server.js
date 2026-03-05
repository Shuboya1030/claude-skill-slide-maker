#!/usr/bin/env node

/**
 * Preview Server for Slides
 *
 * Serves HTML slides with live reload capability.
 * Usage: node preview-server.js [slides-directory] [--port=3456]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// Configuration
const DEFAULT_PORT = 3456;
const DEBOUNCE_MS = 100;

// Parse arguments
const args = process.argv.slice(2);
let slidesDir = 'slides';
let port = DEFAULT_PORT;

for (const arg of args) {
  if (arg.startsWith('--port=')) {
    port = parseInt(arg.split('=')[1], 10);
  } else if (!arg.startsWith('--')) {
    slidesDir = arg;
  }
}

// Resolve to absolute path
slidesDir = path.resolve(slidesDir);

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// Track connected clients for live reload
const clients = new Set();

// Live reload script to inject into HTML
const LIVE_RELOAD_SCRIPT = `
<script>
(function() {
  const evtSource = new EventSource('/__live-reload');
  evtSource.onmessage = function(e) {
    if (e.data === 'reload') {
      location.reload();
    }
  };
  evtSource.onerror = function() {
    console.log('Live reload disconnected, retrying...');
    setTimeout(() => location.reload(), 2000);
  };
})();
</script>
`;

// Generate index page listing all slides
function generateIndexPage() {
  let slides = [];

  // Read manifest if it exists
  const manifestPath = path.join(slidesDir, 'slides.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      slides = manifest.slides || [];
    } catch (e) {
      console.error('Error reading manifest:', e.message);
    }
  }

  // Fallback: scan directory for HTML files
  if (slides.length === 0) {
    try {
      const files = fs.readdirSync(slidesDir)
        .filter(f => f.endsWith('.html') && f.startsWith('slide-'))
        .sort();
      slides = files.map(f => ({ file: f, title: f.replace('.html', '') }));
    } catch (e) {
      console.error('Error scanning directory:', e.message);
    }
  }

  const slideLinks = slides.map((s, i) =>
    `<li><a href="/${s.file}">${i + 1}. ${s.title || s.file}</a></li>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slides Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e;
      color: #eee;
      min-height: 100vh;
      padding: 40px;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 8px;
      color: #fff;
    }
    .subtitle {
      color: #888;
      margin-bottom: 32px;
    }
    .slides-list {
      list-style: none;
      max-width: 600px;
    }
    .slides-list li {
      margin-bottom: 12px;
    }
    .slides-list a {
      display: block;
      padding: 16px 20px;
      background: #16213e;
      color: #4cc9f0;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .slides-list a:hover {
      background: #1f3460;
      transform: translateX(4px);
    }
    .controls {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #333;
    }
    .controls a {
      display: inline-block;
      padding: 12px 24px;
      background: #4cc9f0;
      color: #1a1a2e;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-right: 12px;
    }
    .controls a:hover {
      background: #7dd8f5;
    }
    .empty {
      color: #666;
      font-style: italic;
    }
  </style>
</head>
<body>
  <h1>Slides Preview</h1>
  <p class="subtitle">Live reload enabled • ${slides.length} slide${slides.length !== 1 ? 's' : ''}</p>

  ${slides.length > 0
    ? `<ul class="slides-list">${slideLinks}</ul>`
    : '<p class="empty">No slides found. Generate some slides to see them here.</p>'
  }

  ${slides.length > 0 ? `
  <div class="controls">
    <a href="/${slides[0]?.file || '#'}">Start Presentation</a>
    <a href="/slideshow">Slideshow Mode</a>
  </div>
  ` : ''}

  ${LIVE_RELOAD_SCRIPT}
</body>
</html>`;
}

// Generate slideshow page (all slides in sequence)
function generateSlideshowPage() {
  let slides = [];

  const manifestPath = path.join(slidesDir, 'slides.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      slides = manifest.slides || [];
    } catch (e) {
      console.error('Error reading manifest:', e.message);
    }
  }

  if (slides.length === 0) {
    try {
      const files = fs.readdirSync(slidesDir)
        .filter(f => f.endsWith('.html') && f.startsWith('slide-'))
        .sort();
      slides = files.map(f => ({ file: f }));
    } catch (e) {
      console.error('Error scanning directory:', e.message);
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slideshow</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; background: #000; }
    .slideshow {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    iframe {
      width: 1920px;
      height: 1080px;
      border: none;
      transform-origin: center center;
    }
    .controls {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      background: rgba(0,0,0,0.8);
      padding: 12px 20px;
      border-radius: 8px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    body:hover .controls { opacity: 1; }
    .controls button {
      padding: 8px 16px;
      background: #4cc9f0;
      color: #000;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .controls button:hover { background: #7dd8f5; }
    .controls span {
      color: #fff;
      line-height: 32px;
    }
  </style>
</head>
<body>
  <div class="slideshow">
    <iframe id="slide-frame" src="/${slides[0]?.file || ''}"></iframe>
  </div>
  <div class="controls">
    <button onclick="prevSlide()">← Previous</button>
    <span id="counter">1 / ${slides.length}</span>
    <button onclick="nextSlide()">Next →</button>
    <button onclick="toggleFullscreen()">⛶ Fullscreen</button>
  </div>

  <script>
    const slides = ${JSON.stringify(slides.map(s => s.file))};
    let current = 0;
    const frame = document.getElementById('slide-frame');
    const counter = document.getElementById('counter');

    function updateSlide() {
      frame.src = '/' + slides[current];
      counter.textContent = (current + 1) + ' / ' + slides.length;
    }

    function nextSlide() {
      if (current < slides.length - 1) {
        current++;
        updateSlide();
      }
    }

    function prevSlide() {
      if (current > 0) {
        current--;
        updateSlide();
      }
    }

    function toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'f') toggleFullscreen();
      if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
    });

    // Scale iframe to fit viewport
    function scaleSlide() {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      const scale = Math.min(scaleX, scaleY);
      frame.style.transform = 'scale(' + scale + ')';
    }
    scaleSlide();
    window.addEventListener('resize', scaleSlide);
  </script>

  ${LIVE_RELOAD_SCRIPT}
</body>
</html>`;
}

// HTTP request handler
function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${port}`);
  let pathname = url.pathname;

  // Live reload SSE endpoint
  if (pathname === '/__live-reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('data: connected\n\n');

    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // Index page
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generateIndexPage());
    return;
  }

  // Slideshow page
  if (pathname === '/slideshow') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generateSlideshowPage());
    return;
  }

  // Serve static files
  let filePath = path.join(slidesDir, pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(slidesDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found: ' + pathname);
    return;
  }

  // Read and serve file
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    let content = fs.readFileSync(filePath);

    // Inject live reload script into HTML files
    if (ext === '.html') {
      content = content.toString().replace('</body>', LIVE_RELOAD_SCRIPT + '</body>');
    }

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  } catch (e) {
    res.writeHead(500);
    res.end('Error reading file: ' + e.message);
  }
}

// Notify all clients to reload
function notifyReload() {
  for (const client of clients) {
    client.write('data: reload\n\n');
  }
}

// File watcher with debounce
let watchTimeout = null;
function setupWatcher() {
  if (!fs.existsSync(slidesDir)) {
    console.log(`Creating slides directory: ${slidesDir}`);
    fs.mkdirSync(slidesDir, { recursive: true });
  }

  fs.watch(slidesDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    // Ignore hidden files and non-relevant files
    if (filename.startsWith('.')) return;

    // Debounce rapid changes
    clearTimeout(watchTimeout);
    watchTimeout = setTimeout(() => {
      console.log(`[${new Date().toLocaleTimeString()}] Change detected: ${filename}`);
      notifyReload();
    }, DEBOUNCE_MS);
  });
}

// Open browser (using execFile to avoid shell injection)
function openBrowser(url) {
  const platform = process.platform;

  if (platform === 'win32') {
    // On Windows, use cmd.exe with /c start
    execFile('cmd.exe', ['/c', 'start', '', url], (err) => {
      if (err) {
        console.log(`Could not open browser automatically. Please open: ${url}`);
      }
    });
  } else if (platform === 'darwin') {
    execFile('open', [url], (err) => {
      if (err) {
        console.log(`Could not open browser automatically. Please open: ${url}`);
      }
    });
  } else {
    execFile('xdg-open', [url], (err) => {
      if (err) {
        console.log(`Could not open browser automatically. Please open: ${url}`);
      }
    });
  }
}

// Start server
const server = http.createServer(handleRequest);

server.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`\n🎯 Slides Preview Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📂 Serving: ${slidesDir}`);
  console.log(`🌐 URL: ${url}`);
  console.log(`🔄 Live reload: enabled`);
  console.log(`\nPress Ctrl+C to stop\n`);

  setupWatcher();

  // Auto-open browser
  if (!args.includes('--no-open')) {
    openBrowser(url);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.close();
  process.exit(0);
});
