#!/usr/bin/env node

/**
 * PPTX Export for Slides
 *
 * Converts HTML slides to PowerPoint format.
 * Uses dom-to-pptx by default for high-fidelity exports.
 * Falls back to pptxgenjs for compatibility.
 *
 * Usage: node pptx-export.js [slides-directory] [options]
 *
 * Options:
 *   --output=<file>   Output filename (default: deck.pptx)
 *   --legacy          Use pptxgenjs instead of dom-to-pptx
 *   --screenshot      Export as PNG screenshots instead of PPTX
 *   --screenshot-all  Screenshot all slides (legacy mode only)
 */

const path = require('path');
const { exportViaDomToPptx } = require('./exporters/dom-to-pptx-exporter');
const { exportViaPptxGenJS } = require('./exporters/pptxgenjs-exporter');
const { exportAsScreenshots } = require('./exporters/screenshot-exporter');

// Re-export utilities for backwards compatibility
const { parseTheme } = require('./utils/theme-parser');
const { parseSlide } = require('./utils/html-processor');

// Parse arguments
const args = process.argv.slice(2);
let slidesDir = 'slides';
let outputFile = 'deck.pptx';
let screenshotAll = false;
let useLegacy = false;
let useScreenshot = false;

for (const arg of args) {
  if (arg.startsWith('--output=')) {
    outputFile = arg.split('=')[1];
  } else if (arg === '--screenshot-all') {
    screenshotAll = true;
  } else if (arg === '--screenshot') {
    useScreenshot = true;
  } else if (arg === '--legacy') {
    useLegacy = true;
  } else if (!arg.startsWith('--')) {
    slidesDir = arg;
  }
}

slidesDir = path.resolve(slidesDir);

/**
 * Main export function - uses dom-to-pptx by default with fallback to legacy
 */
async function exportToPptx() {
  // Screenshot export mode
  if (useScreenshot) {
    console.log('Exporting as screenshots...');
    await exportAsScreenshots(slidesDir);
    return;
  }

  if (useLegacy) {
    console.log('Using legacy pptxgenjs export...');
    await exportViaPptxGenJS(slidesDir, outputFile, screenshotAll);
    return;
  }

  // Try dom-to-pptx first
  const success = await exportViaDomToPptx(slidesDir, outputFile);

  if (!success) {
    console.log('\nFalling back to legacy pptxgenjs export...');
    await exportViaPptxGenJS(slidesDir, outputFile, screenshotAll);
  }
}

/**
 * Legacy export function (for backwards compatibility)
 */
async function exportToPptxLegacy() {
  await exportViaPptxGenJS(slidesDir, outputFile, screenshotAll);
}

// Run if executed directly
if (require.main === module) {
  exportToPptx().catch(e => {
    console.error('Export failed:', e.message);
    process.exit(1);
  });
}

module.exports = {
  exportToPptx,
  exportToPptxLegacy,
  exportViaDomToPptx,
  exportViaPptxGenJS,
  exportAsScreenshots,
  parseTheme,
  parseSlide,
};
