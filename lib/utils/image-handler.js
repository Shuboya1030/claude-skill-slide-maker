/**
 * Image Handler Utility
 * Handles image processing for PPTX export
 */

const fs = require('fs');
const path = require('path');

/**
 * MIME type mapping for common image formats
 */
const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
};

/**
 * Convert an image file to a base64 data URL
 * @param {string} imagePath - Path to the image file
 * @returns {string|null} Base64 data URL or null if failed
 */
function imageToBase64(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.warn(`  Warning: Image not found: ${imagePath}`);
      return null;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'image/png';
    const base64 = imageBuffer.toString('base64');

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.warn(`  Warning: Failed to convert image ${imagePath}: ${error.message}`);
    return null;
  }
}

/**
 * Replace image src attributes with base64 data URLs
 * @param {string} html - HTML content
 * @param {string} baseDir - Base directory for resolving relative paths
 * @returns {string} HTML with embedded base64 images
 */
function embedImagesAsBase64(html, baseDir) {
  // Match src attributes that are not already http/https or data URLs
  return html.replace(/src=["'](?!http|https|data:)([^"']+)["']/g, (match, src) => {
    const imagePath = path.join(baseDir, src);
    const base64Url = imageToBase64(imagePath);

    if (base64Url) {
      return `src="${base64Url}"`;
    }
    // If conversion failed, keep original (will show as broken in PPTX)
    return match;
  });
}

/**
 * Take screenshots of chart/diagram/complex slides using Playwright
 * @param {string} slidesDir - Slides directory
 * @param {Object[]} slides - Array of slide objects with file info
 * @param {boolean} captureAll - Whether to capture all slides as screenshots
 * @returns {Promise<Object>} Map of slide file to screenshot path
 */
async function captureScreenshots(slidesDir, slides, captureAll) {
  const screenshots = {};

  // Check if Playwright is available
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    console.log('Playwright not installed - charts/diagrams/complex slides will show as placeholders');
    console.log('Install with: npm install playwright');
    return screenshots;
  }

  const screenshotsDir = path.join(slidesDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Capturing screenshots for slides...');

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 2560, height: 1440 });

  for (const slide of slides) {
    const needsScreenshot = captureAll ||
      slide.layout === 'chart' ||
      slide.layout === 'diagram' ||
      slide.layout === 'complex';

    if (needsScreenshot) {
      const htmlPath = path.join(slidesDir, slide.file);
      const screenshotPath = path.join(screenshotsDir, slide.file.replace('.html', '.png'));

      try {
        await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
        // Wait a bit for charts/diagrams to render
        await page.waitForTimeout(1000);
        await page.screenshot({ path: screenshotPath });
        screenshots[slide.file] = screenshotPath;
        console.log(`  Captured: ${slide.file}`);
      } catch (e) {
        console.warn(`  Failed to capture ${slide.file}: ${e.message}`);
      }
    }
  }

  await browser.close();
  return screenshots;
}

module.exports = {
  MIME_TYPES,
  imageToBase64,
  embedImagesAsBase64,
  captureScreenshots,
};
