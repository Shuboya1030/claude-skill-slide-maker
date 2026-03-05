/**
 * PptxGenJS Exporter
 * Legacy/fallback export using pptxgenjs library
 */

const fs = require('fs');
const path = require('path');
const { parseTheme, toHexColor } = require('../utils/theme-parser');
const { parseSlide } = require('../utils/html-processor');
const { captureScreenshots } = require('../utils/image-handler');

let PptxGenJS;

/**
 * Load pptxgenjs dynamically
 */
async function loadPptxGenJS() {
  try {
    PptxGenJS = require('pptxgenjs');
  } catch (e) {
    console.error('Error: pptxgenjs is not installed.');
    console.error('Please run: npm install pptxgenjs');
    process.exit(1);
  }
}

/**
 * Add a title slide to the presentation
 */
function addTitleSlide(pptx, slide, theme) {
  const pptSlide = pptx.addSlide();
  pptSlide.background = { color: toHexColor(theme.bgPrimary) };

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: '40%',
    w: '90%',
    h: 1,
    fontSize: theme.titleSize,
    fontFace: theme.fontHeading,
    color: toHexColor(theme.accentPrimary),
    align: 'center',
    bold: true,
  });

  if (slide.subtitle) {
    pptSlide.addText(slide.subtitle, {
      x: 0.5,
      y: '55%',
      w: '90%',
      h: 0.6,
      fontSize: theme.headingSize * 0.7,
      fontFace: theme.fontBody,
      color: toHexColor(theme.textSecondary),
      align: 'center',
    });
  }
}

/**
 * Add a content slide with bullet points
 */
function addContentSlide(pptx, slide, theme) {
  const pptSlide = pptx.addSlide();
  pptSlide.background = { color: toHexColor(theme.bgPrimary) };

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.5,
    w: '90%',
    h: 0.8,
    fontSize: theme.headingSize,
    fontFace: theme.fontHeading,
    color: toHexColor(theme.accentPrimary),
    bold: true,
  });

  if (slide.points.length > 0) {
    const bullets = slide.points.map(p => ({
      text: p,
      options: {
        bullet: { type: 'bullet', color: toHexColor(theme.accentPrimary) },
        fontSize: theme.bodySize,
        fontFace: theme.fontBody,
        color: toHexColor(theme.textPrimary),
      },
    }));

    pptSlide.addText(bullets, {
      x: 0.5,
      y: 1.5,
      w: '90%',
      h: 4,
      valign: 'top',
    });
  }

  if (slide.content) {
    pptSlide.addText(slide.content, {
      x: 0.5,
      y: 1.5,
      w: '90%',
      h: 4,
      fontSize: theme.bodySize,
      fontFace: theme.fontBody,
      color: toHexColor(theme.textPrimary),
      valign: 'top',
    });
  }
}

/**
 * Add a quote slide
 */
function addQuoteSlide(pptx, slide, theme) {
  const pptSlide = pptx.addSlide();
  pptSlide.background = { color: toHexColor(theme.bgPrimary) };

  pptSlide.addText(`"${slide.quote}"`, {
    x: 0.5,
    y: '35%',
    w: '90%',
    h: 2,
    fontSize: theme.headingSize * 0.9,
    fontFace: theme.fontBody,
    color: toHexColor(theme.textPrimary),
    align: 'center',
    italic: true,
  });

  if (slide.attribution) {
    pptSlide.addText(`— ${slide.attribution}`, {
      x: 0.5,
      y: '60%',
      w: '90%',
      h: 0.5,
      fontSize: theme.bodySize,
      fontFace: theme.fontBody,
      color: toHexColor(theme.textSecondary),
      align: 'center',
    });
  }
}

/**
 * Add a split slide (text + image)
 */
function addSplitSlide(pptx, slide, theme, slidesDir) {
  const pptSlide = pptx.addSlide();
  pptSlide.background = { color: toHexColor(theme.bgPrimary) };

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.5,
    w: '45%',
    h: 0.8,
    fontSize: theme.headingSize,
    fontFace: theme.fontHeading,
    color: toHexColor(theme.accentPrimary),
    bold: true,
  });

  pptSlide.addText(slide.content || slide.points.join('\n'), {
    x: 0.5,
    y: 1.5,
    w: '45%',
    h: 3.5,
    fontSize: theme.bodySize,
    fontFace: theme.fontBody,
    color: toHexColor(theme.textPrimary),
    valign: 'top',
  });

  if (slide.imageSrc) {
    const imagePath = path.resolve(slidesDir, slide.imageSrc);
    if (fs.existsSync(imagePath)) {
      pptSlide.addImage({
        path: imagePath,
        x: '52%',
        y: 0.5,
        w: '45%',
        h: 4.5,
      });
    }
  }
}

/**
 * Add a chart slide (placeholder - charts need screenshot)
 */
function addChartSlide(pptx, slide, theme, screenshotPath) {
  const pptSlide = pptx.addSlide();
  pptSlide.background = { color: toHexColor(theme.bgPrimary) };

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.5,
    w: '90%',
    h: 0.8,
    fontSize: theme.headingSize,
    fontFace: theme.fontHeading,
    color: toHexColor(theme.accentPrimary),
    bold: true,
  });

  if (screenshotPath && fs.existsSync(screenshotPath)) {
    pptSlide.addImage({
      path: screenshotPath,
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4,
    });
  } else {
    pptSlide.addText('[Chart - see HTML version]', {
      x: 0.5,
      y: 2.5,
      w: '90%',
      h: 2,
      fontSize: theme.bodySize,
      fontFace: theme.fontBody,
      color: toHexColor(theme.textSecondary),
      align: 'center',
      italic: true,
    });
  }
}

/**
 * Add a diagram slide (placeholder - diagrams need screenshot)
 */
function addDiagramSlide(pptx, slide, theme, screenshotPath) {
  const pptSlide = pptx.addSlide();
  pptSlide.background = { color: toHexColor(theme.bgPrimary) };

  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.5,
    w: '90%',
    h: 0.8,
    fontSize: theme.headingSize,
    fontFace: theme.fontHeading,
    color: toHexColor(theme.accentPrimary),
    bold: true,
  });

  if (screenshotPath && fs.existsSync(screenshotPath)) {
    pptSlide.addImage({
      path: screenshotPath,
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4,
    });
  } else {
    pptSlide.addText('[Diagram - see HTML version]', {
      x: 0.5,
      y: 2.5,
      w: '90%',
      h: 2,
      fontSize: theme.bodySize,
      fontFace: theme.fontBody,
      color: toHexColor(theme.textSecondary),
      align: 'center',
      italic: true,
    });
  }
}

/**
 * Add a complex slide (full screenshot)
 */
function addComplexSlide(pptx, slide, theme, screenshotPath) {
  const pptSlide = pptx.addSlide();
  pptSlide.background = { color: toHexColor(theme.bgPrimary) };

  if (screenshotPath && fs.existsSync(screenshotPath)) {
    pptSlide.addImage({
      path: screenshotPath,
      x: 0,
      y: 0,
      w: 10,
      h: 5.625,
    });
  } else {
    pptSlide.addText(slide.title || 'Complex Slide', {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 1,
      fontSize: theme.headingSize,
      fontFace: theme.fontHeading,
      color: toHexColor(theme.accentPrimary),
      align: 'center',
    });
    pptSlide.addText('[Complex layout - see HTML version]', {
      x: 0.5,
      y: 3,
      w: '90%',
      h: 0.5,
      fontSize: theme.bodySize,
      fontFace: theme.fontBody,
      color: toHexColor(theme.textSecondary),
      align: 'center',
      italic: true,
    });
  }
}

/**
 * Export slides using pptxgenjs (legacy approach)
 * @param {string} slidesDir - Slides directory
 * @param {string} outputFile - Output filename
 * @param {boolean} screenshotAll - Whether to screenshot all slides
 * @returns {Promise<void>}
 */
async function exportViaPptxGenJS(slidesDir, outputFile, screenshotAll = false) {
  await loadPptxGenJS();

  // Read manifest
  const manifestPath = path.join(slidesDir, 'slides.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Error: slides.json manifest not found');
    console.error(`Expected at: ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const slides = manifest.slides || [];

  if (slides.length === 0) {
    console.error('Error: No slides found in manifest');
    process.exit(1);
  }

  // Parse theme
  const themePath = path.join(slidesDir, 'theme.css');
  const theme = parseTheme(themePath);

  // Parse each slide
  const parsedSlides = slides.map(s => ({
    ...s,
    ...parseSlide(path.join(slidesDir, s.file)),
  }));

  // Capture screenshots for charts/diagrams/complex slides
  const screenshots = await captureScreenshots(slidesDir, parsedSlides, screenshotAll);

  // Create presentation
  const pptx = new PptxGenJS();
  pptx.title = manifest.title || 'Presentation';
  pptx.subject = 'Generated by Slides Plugin';
  pptx.author = 'Slides Plugin';

  // Set slide size to 16:9
  pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 });
  pptx.layout = 'CUSTOM';

  console.log(`\nExporting ${parsedSlides.length} slides to PPTX...`);

  // Add each slide
  for (const slide of parsedSlides) {
    console.log(`  Processing: ${slide.title || slide.file}`);

    switch (slide.layout) {
      case 'title':
        addTitleSlide(pptx, slide, theme);
        break;
      case 'quote':
        addQuoteSlide(pptx, slide, theme);
        break;
      case 'split':
        addSplitSlide(pptx, slide, theme, slidesDir);
        break;
      case 'chart':
        addChartSlide(pptx, slide, theme, screenshots[slide.file]);
        break;
      case 'diagram':
        addDiagramSlide(pptx, slide, theme, screenshots[slide.file]);
        break;
      case 'complex':
        addComplexSlide(pptx, slide, theme, screenshots[slide.file]);
        break;
      default:
        addContentSlide(pptx, slide, theme);
    }
  }

  // Ensure exports directory exists
  const exportsDir = path.join(slidesDir, 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  // Save PPTX
  const outputPath = path.join(exportsDir, outputFile);
  await pptx.writeFile({ fileName: outputPath });

  console.log(`\nExport complete: ${outputPath}`);
}

module.exports = {
  exportViaPptxGenJS,
  addTitleSlide,
  addContentSlide,
  addQuoteSlide,
  addSplitSlide,
  addChartSlide,
  addDiagramSlide,
  addComplexSlide,
};
