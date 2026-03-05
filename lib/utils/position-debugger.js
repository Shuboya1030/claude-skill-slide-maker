/**
 * Position Debugger Utility
 * Captures element positions from rendered HTML for debugging PPTX export issues
 */

const fs = require('fs');
const path = require('path');

/**
 * Capture element positions from a rendered slide using Playwright
 * @param {string} htmlPath - Path to HTML slide file
 * @returns {Promise<Object>} Position data for key elements
 */
async function capturePositions(htmlPath) {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    console.error('Playwright not installed');
    return null;
  }

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const positions = await page.evaluate(() => {
      const results = {
        slide: null,
        elements: []
      };

      // Get slide container
      const slide = document.querySelector('.slide');
      if (slide) {
        const slideRect = slide.getBoundingClientRect();
        results.slide = {
          x: slideRect.x,
          y: slideRect.y,
          width: slideRect.width,
          height: slideRect.height
        };
      }

      // Get key elements
      const selectors = [
        'h1', 'h2', 'h3',
        '.section-title',
        '.code-block',
        '.content-container',
        '.install-section',
        '.commands-section',
        'table',
        'pre'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          results.elements.push({
            selector: selector + (elements.length > 1 ? `[${idx}]` : ''),
            tag: el.tagName,
            text: el.textContent?.substring(0, 50).trim() || '',
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              right: rect.right,
              bottom: rect.bottom
            },
            style: {
              textAlign: style.textAlign,
              display: style.display,
              flexDirection: style.flexDirection,
              justifyContent: style.justifyContent,
              alignItems: style.alignItems,
              position: style.position
            }
          });
        });
      });

      return results;
    });

    await browser.close();
    return positions;

  } catch (error) {
    console.error('Error capturing positions:', error.message);
    await browser.close();
    return null;
  }
}

/**
 * Debug a slide's positions
 * @param {string} slidePath - Path to slide HTML
 */
async function debugSlide(slidePath) {
  console.log(`\nAnalyzing: ${slidePath}\n`);

  const positions = await capturePositions(slidePath);
  if (!positions) {
    console.error('Failed to capture positions');
    return;
  }

  console.log('=== SLIDE CONTAINER ===');
  if (positions.slide) {
    console.log(`  Position: (${positions.slide.x}, ${positions.slide.y})`);
    console.log(`  Size: ${positions.slide.width} x ${positions.slide.height}`);
  }

  console.log('\n=== ELEMENTS ===');
  positions.elements.forEach(el => {
    console.log(`\n${el.selector} <${el.tag}>`);
    console.log(`  Text: "${el.text}"`);
    console.log(`  Position: (${el.rect.x.toFixed(1)}, ${el.rect.y.toFixed(1)})`);
    console.log(`  Size: ${el.rect.width.toFixed(1)} x ${el.rect.height.toFixed(1)}`);
    console.log(`  Style: textAlign=${el.style.textAlign}, display=${el.style.display}`);
    if (el.style.display.includes('flex')) {
      console.log(`         flexDirection=${el.style.flexDirection}, justifyContent=${el.style.justifyContent}`);
    }
  });

  return positions;
}

// CLI usage
if (require.main === module) {
  const slidePath = process.argv[2];
  if (!slidePath) {
    console.log('Usage: node position-debugger.js <slide.html>');
    process.exit(1);
  }
  debugSlide(path.resolve(slidePath));
}

module.exports = {
  capturePositions,
  debugSlide
};
