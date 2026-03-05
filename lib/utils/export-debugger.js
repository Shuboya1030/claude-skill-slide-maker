/**
 * PPTX Export Debugger
 * Captures what dom-to-pptx generates for comparison with HTML positions
 */

const fs = require('fs');
const path = require('path');
const { generateCompositeHtml } = require('./html-processor');

/**
 * Debug the export process for a single slide
 */
async function debugExport(slidesDir) {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    console.error('Playwright not installed');
    return;
  }

  // Read manifest
  const manifestPath = path.join(slidesDir, 'slides.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Generate composite HTML (same as export does)
  const compositeHtml = generateCompositeHtml(slidesDir, manifest);

  // Write to temp file for inspection
  const tempDir = path.join(slidesDir, '.debug');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempHtmlPath = path.join(tempDir, 'composite-debug.html');
  fs.writeFileSync(tempHtmlPath, compositeHtml);
  console.log(`Composite HTML written to: ${tempHtmlPath}`);

  // Launch browser and check positions
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 2560, height: 1440 });

  await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Capture positions from composite
  const positions = await page.evaluate(() => {
    const results = {
      slides: [],
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    // Find all slides
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, slideIdx) => {
      const slideRect = slide.getBoundingClientRect();
      const slideData = {
        index: slideIdx,
        rect: {
          x: slideRect.x,
          y: slideRect.y,
          width: slideRect.width,
          height: slideRect.height
        },
        elements: []
      };

      // Get key elements within this slide
      const selectors = ['h1', 'h2', 'h3', '.section-title', '.code-block', 'table', 'pre'];
      selectors.forEach(selector => {
        slide.querySelectorAll(selector).forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          slideData.elements.push({
            selector: selector,
            text: el.textContent?.substring(0, 30).trim() || '',
            // Position relative to slide
            relX: rect.x - slideRect.x,
            relY: rect.y - slideRect.y,
            // Absolute position
            absX: rect.x,
            absY: rect.y,
            width: rect.width,
            height: rect.height,
            textAlign: style.textAlign
          });
        });
      });

      results.slides.push(slideData);
    });

    return results;
  });

  await browser.close();

  console.log('\n=== COMPOSITE HTML ANALYSIS ===');
  console.log(`Viewport: ${positions.viewport.width} x ${positions.viewport.height}`);
  console.log(`Found ${positions.slides.length} slides\n`);

  positions.slides.forEach((slide, idx) => {
    console.log(`--- Slide ${idx + 1} ---`);
    console.log(`  Container: (${slide.rect.x}, ${slide.rect.y}) - ${slide.rect.width}x${slide.rect.height}`);

    slide.elements.forEach(el => {
      console.log(`  ${el.selector}: "${el.text}"`);
      console.log(`    Relative: (${el.relX.toFixed(1)}, ${el.relY.toFixed(1)})`);
      console.log(`    Absolute: (${el.absX.toFixed(1)}, ${el.absY.toFixed(1)})`);
      console.log(`    Size: ${el.width.toFixed(1)} x ${el.height.toFixed(1)}, textAlign: ${el.textAlign}`);
    });
    console.log('');
  });

  return positions;
}

// CLI
if (require.main === module) {
  const slidesDir = process.argv[2] || 'slides';
  debugExport(path.resolve(slidesDir));
}

module.exports = { debugExport };
