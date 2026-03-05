/**
 * Screenshot Exporter
 * Exports HTML slides as PNG images using Playwright
 */

const fs = require('fs');
const path = require('path');

/**
 * Export slides as PNG screenshots
 * @param {string} slidesDir - Path to slides directory
 * @param {string} outputDir - Output directory for screenshots (default: slides/exports/screenshots)
 * @returns {Promise<boolean>} Success status
 */
async function exportAsScreenshots(slidesDir, outputDir = null) {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    console.error('Error: Playwright is required for screenshot export.');
    console.error('Install it with: npm install playwright');
    return false;
  }

  // Read manifest
  const manifestPath = path.join(slidesDir, 'slides.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Error: slides.json manifest not found');
    console.error('Expected at:', manifestPath);
    return false;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const slides = manifest.slides || [];

  if (slides.length === 0) {
    console.error('Error: No slides found in manifest');
    return false;
  }

  // Determine output directory
  const screenshotDir = outputDir || path.join(slidesDir, 'exports', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log(`Exporting ${slides.length} slides as screenshots...`);

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Set viewport to match slide dimensions (1920x1080)
  await page.setViewportSize({ width: 1920, height: 1080 });

  const exportedFiles = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const htmlPath = path.join(slidesDir, slide.file);

    if (!fs.existsSync(htmlPath)) {
      console.warn(`  Warning: Slide file not found: ${slide.file}`);
      continue;
    }

    const slideNum = String(i + 1).padStart(2, '0');
    const outputFile = path.join(screenshotDir, `slide-${slideNum}.png`);

    try {
      // Navigate to the slide
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

      // Wait for fonts and dynamic content
      await page.waitForTimeout(500);

      // Find the slide container and screenshot it
      const slideElement = await page.$('.slide');
      if (slideElement) {
        await slideElement.screenshot({
          path: outputFile,
          type: 'png'
        });
      } else {
        // Fallback: screenshot the viewport
        await page.screenshot({
          path: outputFile,
          type: 'png',
          clip: { x: 0, y: 0, width: 1920, height: 1080 }
        });
      }

      exportedFiles.push(outputFile);
      console.log(`  Exported: slide-${slideNum}.png`);
    } catch (err) {
      console.error(`  Error exporting slide ${i + 1}:`, err.message);
    }
  }

  await browser.close();

  console.log(`\nScreenshots exported to: ${screenshotDir}`);
  console.log(`Total: ${exportedFiles.length} images`);

  return true;
}

module.exports = {
  exportAsScreenshots
};
