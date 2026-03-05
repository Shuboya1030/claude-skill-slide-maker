/**
 * HTML Processor Utility
 * Parses HTML slides and extracts content for PPTX export
 */

const fs = require('fs');
const path = require('path');
const { extractCssVariables, resolveCssVariables, replaceWithSystemFonts } = require('./theme-parser');
const { embedImagesAsBase64 } = require('./image-handler');

/**
 * Preprocess HTML for PPTX export to work around dom-to-pptx limitations
 * @param {string} html - Raw HTML content
 * @returns {string} Preprocessed HTML
 */
function preprocessForPptx(html) {
  let processed = html;

  // Fix 1: Convert newlines in code blocks to <br> tags
  // dom-to-pptx sets white-space: nowrap which collapses newlines
  processed = processed.replace(
    /(<div[^>]*class="[^"]*code-block[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/gi,
    (match, openTag, content, closeTag) => {
      // Replace newlines with <br> tags, but preserve the content
      const fixedContent = content
        .replace(/\r\n/g, '\n')
        .replace(/\n/g, '<br>');
      return openTag + fixedContent + closeTag;
    }
  );

  // Also handle <pre> tags
  processed = processed.replace(
    /(<pre[^>]*>)([\s\S]*?)(<\/pre>)/gi,
    (match, openTag, content, closeTag) => {
      const fixedContent = content
        .replace(/\r\n/g, '\n')
        .replace(/\n/g, '<br>');
      return openTag + fixedContent + closeTag;
    }
  );

  // Fix 2: Add explicit text-align to headings to prevent flex-based centering
  // dom-to-pptx incorrectly centers text when parent uses flexbox
  processed = processed.replace(
    /<h([1-6])([^>]*)>/gi,
    (match, level, attrs) => {
      // Only add if no inline style exists
      if (attrs.includes('style=')) {
        // Append to existing style
        return match.replace(/style="([^"]*)"/, 'style="$1; text-align: left;"');
      }
      return `<h${level}${attrs} style="text-align: left;">`;
    }
  );

  // Fix 3: Add explicit text-align to section titles
  processed = processed.replace(
    /(<div[^>]*class="[^"]*section-title[^"]*"[^>]*)>/gi,
    (match, prefix) => {
      if (prefix.includes('style=')) {
        return match.replace(/style="([^"]*)"/, 'style="$1; text-align: left;"');
      }
      return prefix + ' style="text-align: left;">';
    }
  );

  return processed;
}

/**
 * Parse HTML slide and extract content
 * @param {string} htmlPath - Path to slide HTML file
 * @returns {Object} Parsed slide content
 */
function parseSlide(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const slide = {
    layout: 'content',
    title: '',
    subtitle: '',
    points: [],
    content: '',
    quote: '',
    attribution: '',
    chartConfig: null,
    diagram: null,
    imageSrc: null,
  };

  // Detect layout from class
  if (html.includes('slide-title')) {
    slide.layout = 'title';
  } else if (html.includes('slide-chart')) {
    slide.layout = 'chart';
  } else if (html.includes('slide-diagram')) {
    slide.layout = 'diagram';
  } else if (html.includes('slide-quote')) {
    slide.layout = 'quote';
  } else if (html.includes('slide-split')) {
    slide.layout = 'split';
  }

  // Detect complex layouts (grids, cards, custom structures)
  if (slide.layout === 'content') {
    if (html.includes('content-grid') ||
        html.includes('grid-template') ||
        html.includes('card-header') ||
        html.includes('case-study') ||
        ((html.match(/<style>/g) || []).length > 0 && html.length > 5000)) {
      slide.layout = 'complex';
    }
  }

  // Extract title (h1 or h2)
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/);
  slide.title = (h1Match?.[1] || h2Match?.[1] || '').trim();

  // Extract subtitle
  const subtitleMatch = html.match(/class="subtitle"[^>]*>([^<]+)</);
  slide.subtitle = (subtitleMatch?.[1] || '').trim();

  // Extract bullet points
  const liRegex = /<li[^>]*>([^<]+)<\/li>/g;
  let liMatch;
  while ((liMatch = liRegex.exec(html)) !== null) {
    slide.points.push(liMatch[1].trim());
  }

  // Extract paragraph content
  const pMatch = html.match(/<p[^>]*>([^<]+)<\/p>/);
  if (pMatch && !pMatch[1].includes('subtitle') && !pMatch[1].includes('quote')) {
    slide.content = pMatch[1].trim();
  }

  // Extract quote
  const quoteMatch = html.match(/class="quote"[^>]*>[""]?([^<]+)[""]?<\/p>/);
  slide.quote = (quoteMatch?.[1] || '').replace(/^[""]|[""]$/g, '').trim();

  // Extract attribution
  const attrMatch = html.match(/class="attribution"[^>]*>—?\s*([^<]+)<\/p>/);
  slide.attribution = (attrMatch?.[1] || '').trim();

  // Extract Chart.js config
  const chartMatch = html.match(/new Chart\(ctx,\s*(\{[\s\S]+?\})\);/);
  if (chartMatch) {
    try {
      slide.chartConfig = chartMatch[1];
    } catch (e) {
      console.warn('Could not parse chart config');
    }
  }

  // Extract Mermaid diagram
  const mermaidMatch = html.match(/<div class="mermaid">([\s\S]+?)<\/div>/);
  if (mermaidMatch) {
    slide.diagram = mermaidMatch[1].trim();
  }

  // Extract image
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) {
    slide.imageSrc = imgMatch[1];
  }

  return slide;
}

/**
 * Scope CSS rules to a specific slide by prefixing selectors with slide ID
 * @param {string} css - CSS content
 * @param {string} slideId - Unique slide ID (e.g., "slide-1")
 * @returns {string} Scoped CSS
 */
function scopeCssToSlide(css, slideId) {
  // Parse CSS into rules and scope each selector
  // This approach extracts complete selectors before the { and processes them

  let result = '';
  let i = 0;
  let inAtRule = false;
  let atRuleDepth = 0;

  while (i < css.length) {
    // Skip whitespace
    if (/\s/.test(css[i])) {
      result += css[i];
      i++;
      continue;
    }

    // Handle comments
    if (css.slice(i, i + 2) === '/*') {
      const endComment = css.indexOf('*/', i + 2);
      if (endComment === -1) {
        result += css.slice(i);
        break;
      }
      result += css.slice(i, endComment + 2);
      i = endComment + 2;
      continue;
    }

    // Handle @rules (@keyframes, @media, etc.)
    if (css[i] === '@') {
      const atRuleStart = i;
      // Find the end of the @rule name
      while (i < css.length && css[i] !== '{' && css[i] !== ';') {
        i++;
      }

      if (css[i] === ';') {
        // @import or similar - just copy it
        result += css.slice(atRuleStart, i + 1);
        i++;
        continue;
      }

      if (css[i] === '{') {
        // @keyframes, @media, etc. - copy the whole block
        result += css.slice(atRuleStart, i + 1);
        i++;
        atRuleDepth = 1;
        inAtRule = true;

        // Copy until we close all braces
        while (i < css.length && atRuleDepth > 0) {
          if (css[i] === '{') atRuleDepth++;
          else if (css[i] === '}') atRuleDepth--;
          result += css[i];
          i++;
        }
        inAtRule = false;
        continue;
      }
    }

    // Handle closing brace
    if (css[i] === '}') {
      result += css[i];
      i++;
      continue;
    }

    // Find the selector (everything up to {)
    const selectorStart = i;
    while (i < css.length && css[i] !== '{') {
      i++;
    }

    if (i >= css.length) break;

    const selector = css.slice(selectorStart, i).trim();

    // Skip empty selectors
    if (!selector) {
      result += css[i];
      i++;
      continue;
    }

    // Scope the selector
    const scopedSelector = selector
      .split(',')
      .map(sel => {
        sel = sel.trim();
        if (!sel) return sel;

        // Replace .slide with the specific slide ID
        if (sel === '.slide') {
          return `#${slideId}`;
        }
        // If selector starts with .slide followed by space
        if (sel.startsWith('.slide ')) {
          return `#${slideId} ${sel.substring(7)}`;
        }
        // If selector starts with .slide followed by another class or pseudo
        if (sel.startsWith('.slide.') || sel.startsWith('.slide:') || sel.startsWith('.slide[')) {
          return `#${slideId}${sel.substring(6)}`;
        }
        // For other selectors, scope them under this slide
        return `#${slideId} ${sel}`;
      })
      .join(', ');

    result += scopedSelector + ' {';
    i++; // Skip the {

    // Copy the rule body until closing brace
    let braceDepth = 1;
    while (i < css.length && braceDepth > 0) {
      if (css[i] === '{') braceDepth++;
      else if (css[i] === '}') braceDepth--;
      result += css[i];
      i++;
    }
  }

  return result;
}

/**
 * Generate composite HTML page containing all slides
 * @param {string} slidesDir - Slides directory
 * @param {Object} manifest - Slides manifest
 * @returns {string} HTML content
 */
function generateCompositeHtml(slidesDir, manifest) {
  const slides = manifest.slides || [];
  const themePath = path.join(slidesDir, 'theme.css');
  let themeCSS = '';
  let cssVariables = {};
  if (fs.existsSync(themePath)) {
    themeCSS = fs.readFileSync(themePath, 'utf8');
    cssVariables = extractCssVariables(themeCSS);
  }

  // Track if we need Chart.js or Mermaid
  let needsChartJs = false;
  let needsMermaid = false;
  const chartScripts = [];

  // Collect all slide HTML content and styles
  const slideContents = slides.map((slide, index) => {
    const htmlPath = path.join(slidesDir, slide.file);
    const slideId = `pptx-slide-${index + 1}`;
    let html = '';
    let styles = '';
    if (fs.existsSync(htmlPath)) {
      const fullHtml = fs.readFileSync(htmlPath, 'utf8');

      // Check for Chart.js usage
      if (fullHtml.includes('chart.js') || fullHtml.includes('Chart(')) {
        needsChartJs = true;

        // Extract chart initialization script
        const scriptMatch = fullHtml.match(/<script>[\s\S]*?(new Chart\([\s\S]*?\);)[\s\S]*?<\/script>/i);
        if (scriptMatch) {
          // Make canvas ID unique for this slide
          let chartScript = scriptMatch[1];
          // Replace getElementById('chart') or getElementById("chart") with slide-specific ID
          chartScript = chartScript.replace(
            /getElementById\(['"](\w+)['"]\)/g,
            `getElementById('${slideId}-$1')`
          );
          chartScripts.push({
            slideId,
            script: chartScript
          });
        }
      }

      // Check for Mermaid usage
      if (fullHtml.includes('mermaid')) {
        needsMermaid = true;
      }

      // Extract all style blocks from the entire document
      const styleMatches = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      styles = styleMatches.map(s => {
        const content = s.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        return content ? content[1] : '';
      }).join('\n');

      // Extract body content
      const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        html = bodyMatch[1];
      } else {
        html = fullHtml;
      }

      // Remove style tags from the extracted HTML content
      html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      // Remove script tags (we'll add them back properly)
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

      // Make canvas IDs unique for this slide
      html = html.replace(
        /id=['"](\w+)['"]([\s\S]*?<\/canvas>)/gi,
        `id="${slideId}-$1"$2`
      );

      // Add unique ID to the slide container
      // Replace class="slide" or class="slide ..." with id="slideId" class="slide..."
      html = html.replace(
        /<div([^>]*)\bclass="([^"]*\bslide\b[^"]*)"/,
        `<div$1id="${slideId}" class="$2"`
      );

      // Embed images as base64 data URLs for PPTX compatibility
      html = embedImagesAsBase64(html, slidesDir);

      // Preprocess HTML for PPTX export (fix newlines, alignment issues)
      html = preprocessForPptx(html);

      // Resolve CSS variables in the styles
      styles = resolveCssVariables(styles, cssVariables);

      // Replace custom fonts with system fonts for PPTX compatibility
      styles = replaceWithSystemFonts(styles);

      // Scope CSS rules to this specific slide
      styles = scopeCssToSlide(styles, slideId);

      return { html, styles, file: slide.file, slideId };
    }
    return { html: '', styles: '', file: slide.file, slideId };
  });

  // Resolve CSS variables in theme CSS
  let resolvedThemeCSS = resolveCssVariables(themeCSS, cssVariables);
  resolvedThemeCSS = replaceWithSystemFonts(resolvedThemeCSS);

  // Build external scripts section
  const externalScripts = [];
  if (needsChartJs) {
    externalScripts.push('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>');
  }
  if (needsMermaid) {
    externalScripts.push('<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>');
  }

  // Build chart initialization scripts
  const chartInitScripts = chartScripts.map(({ slideId, script }) => {
    return `
    // Chart for ${slideId}
    (function() {
      const canvas = document.getElementById('${slideId}-chart');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ${script}
      }
    })();`;
  }).join('\n');

  // Build composite page
  const compositeHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${externalScripts.join('\n  ')}
  <style>
    /* Theme CSS (with resolved variables) */
    ${resolvedThemeCSS}

    /* Reset for composite page */
    html, body {
      margin: 0;
      padding: 0;
      background: #f0f0f0;
    }

    /* Slide-specific styles (with resolved variables) */
    ${slideContents.map((s, i) => s.styles).join('\n\n')}
  </style>
</head>
<body>
  ${slideContents.map((s, i) => `
    <!-- Slide ${i + 1}: ${s.file} -->
    ${s.html}
  `).join('\n')}

  <script>
    // Wait for fonts and images to load, then initialize charts
    document.fonts.ready.then(() => {
      console.log('Fonts loaded');
    });

    // Initialize charts after DOM is ready
    window.addEventListener('DOMContentLoaded', function() {
      ${chartInitScripts}
      ${needsMermaid ? 'mermaid.init();' : ''}
    });
  </script>
</body>
</html>`;

  return compositeHtml;
}

module.exports = {
  parseSlide,
  generateCompositeHtml,
  preprocessForPptx,
  scopeCssToSlide,
};
