/**
 * DOM-to-PPTX Exporter
 * High-fidelity export using dom-to-pptx library via Playwright
 */

const fs = require('fs');
const path = require('path');
const { generateCompositeHtml } = require('../utils/html-processor');

/**
 * Export slides using dom-to-pptx library
 * @param {string} slidesDir - Slides directory
 * @param {string} outputFile - Output filename
 * @returns {Promise<boolean>} True if successful
 */
async function exportViaDomToPptx(slidesDir, outputFile) {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    console.error('Playwright not installed. Required for dom-to-pptx export.');
    console.error('Install with: npm install playwright');
    return false;
  }

  // Read manifest
  const manifestPath = path.join(slidesDir, 'slides.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Error: slides.json manifest not found');
    return false;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const slides = manifest.slides || [];

  if (slides.length === 0) {
    console.error('Error: No slides found in manifest');
    return false;
  }

  console.log(`\nExporting ${slides.length} slides via dom-to-pptx...`);

  // Generate composite HTML
  const compositeHtml = generateCompositeHtml(slidesDir, manifest);

  // Write to temp file
  const tempDir = path.join(slidesDir, '.temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempHtmlPath = path.join(tempDir, 'composite.html');
  fs.writeFileSync(tempHtmlPath, compositeHtml);

  // Read dom-to-pptx bundle
  const bundlePath = path.join(__dirname, '..', 'vendor', 'dom-to-pptx.bundle.js');
  if (!fs.existsSync(bundlePath)) {
    console.error('Error: dom-to-pptx bundle not found at', bundlePath);
    return false;
  }
  const domToPptxBundle = fs.readFileSync(bundlePath, 'utf8');

  // Launch browser and export
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 2560, height: 1440 });

  try {
    // Load composite page
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle' });

    // Wait for dynamic content (charts, diagrams) to render
    console.log('  Waiting for dynamic content to render...');
    await page.waitForTimeout(2000);

    // Inject dom-to-pptx bundle
    await page.addScriptTag({ content: domToPptxBundle });

    // Wait for library to be available
    await page.waitForFunction(() => typeof window.domToPptx !== 'undefined', { timeout: 5000 });

    console.log('  Converting DOM to PPTX...');

    // Execute export in browser
    const base64Pptx = await page.evaluate(async () => {
      // Look for slides with .slide class, or fall back to direct children of body
      let slideElements = document.querySelectorAll('.slide');
      if (slideElements.length === 0) {
        slideElements = document.querySelectorAll('body > div');
      }
      if (slideElements.length === 0) {
        throw new Error('No slide elements found');
      }

      // Convert NodeList to Array
      const slides = Array.from(slideElements);

      // Export using dom-to-pptx
      const blob = await window.domToPptx.exportToPptx(slides, {
        skipDownload: true,
        autoEmbedFonts: false,
      });

      // Convert blob to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });

    // Ensure exports directory exists
    const exportsDir = path.join(slidesDir, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Decode base64 and save to file
    const outputPath = path.join(exportsDir, outputFile);
    const pptxBuffer = Buffer.from(base64Pptx, 'base64');
    fs.writeFileSync(outputPath, pptxBuffer);

    console.log(`\nExport complete: ${outputPath}`);

    // Cleanup temp files
    fs.unlinkSync(tempHtmlPath);
    if (fs.readdirSync(tempDir).length === 0) {
      fs.rmdirSync(tempDir);
    }

    await browser.close();
    return true;

  } catch (error) {
    console.error('dom-to-pptx export failed:', error.message);
    await browser.close();

    // Cleanup temp files
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }

    return false;
  }
}

module.exports = {
  exportViaDomToPptx,
};
