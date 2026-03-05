/**
 * Theme Parser Utility
 * Parses CSS theme files and extracts variables for PPTX export
 */

const fs = require('fs');

/**
 * Default theme values
 */
const THEME_DEFAULTS = {
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F3F4F6',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  accentPrimary: '#3B82F6',
  accentSecondary: '#2563EB',
  fontHeading: 'Arial',
  fontBody: 'Arial',
  titleSize: 44,
  headingSize: 36,
  bodySize: 18,
};

/**
 * Parse CSS file to extract theme variables
 * @param {string} cssPath - Path to theme.css
 * @returns {Object} Theme variables
 */
function parseTheme(cssPath) {
  if (!fs.existsSync(cssPath)) {
    console.log('No theme.css found, using defaults');
    return { ...THEME_DEFAULTS };
  }

  const css = fs.readFileSync(cssPath, 'utf8');
  const theme = { ...THEME_DEFAULTS };

  // Extract CSS variables
  const varRegex = /--([a-z-]+):\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(css)) !== null) {
    const [, name, value] = match;
    const cleanValue = value.trim();

    switch (name) {
      case 'bg-primary':
        theme.bgPrimary = cleanValue;
        break;
      case 'bg-secondary':
        theme.bgSecondary = cleanValue;
        break;
      case 'text-primary':
        theme.textPrimary = cleanValue;
        break;
      case 'text-secondary':
        theme.textSecondary = cleanValue;
        break;
      case 'accent-primary':
        theme.accentPrimary = cleanValue;
        break;
      case 'accent-secondary':
        theme.accentSecondary = cleanValue;
        break;
      case 'font-heading':
        theme.fontHeading = cleanValue.replace(/['"]/g, '').split(',')[0].trim();
        break;
      case 'font-body':
        theme.fontBody = cleanValue.replace(/['"]/g, '').split(',')[0].trim();
        break;
      case 'title-size':
        theme.titleSize = parseInt(cleanValue) / 1.5; // Convert px to pt roughly
        break;
      case 'heading-size':
        theme.headingSize = parseInt(cleanValue) / 1.5;
        break;
      case 'body-size':
        theme.bodySize = parseInt(cleanValue) / 1.5;
        break;
    }
  }

  return theme;
}

/**
 * Convert hex color to PPTX-compatible format
 * @param {string} color - Hex color like #RRGGBB
 * @returns {string} Color without hash
 */
function toHexColor(color) {
  if (!color) return '000000';
  return color.replace('#', '').toUpperCase();
}

/**
 * Extract CSS variables from :root declaration
 * @param {string} css - CSS content
 * @returns {Object} Map of variable names to values
 */
function extractCssVariables(css) {
  const variables = {};
  const varRegex = /--([a-z-]+):\s*([^;]+);/gi;
  let match;
  while ((match = varRegex.exec(css)) !== null) {
    variables[match[1]] = match[2].trim();
  }
  return variables;
}

/**
 * Resolve CSS variables in a CSS string to their actual values
 * @param {string} css - CSS content
 * @param {Object} variables - Map of variable names to values
 * @returns {string} CSS with variables resolved
 */
function resolveCssVariables(css, variables) {
  return css.replace(/var\(--([a-z-]+)(?:,\s*([^)]+))?\)/gi, (match, name, fallback) => {
    const value = variables[name];
    if (value) {
      return value;
    }
    return fallback ? fallback.trim() : match;
  });
}

/**
 * Replace custom fonts with PowerPoint-safe system fonts
 * @param {string} css - CSS content
 * @returns {string} CSS with fonts replaced
 */
function replaceWithSystemFonts(css) {
  const fontReplacements = {
    "'Inter'": "'Segoe UI'",
    '"Inter"': '"Segoe UI"',
    'Inter,': 'Segoe UI,',
    'Inter ': 'Segoe UI ',
  };

  let result = css;
  for (const [from, to] of Object.entries(fontReplacements)) {
    result = result.split(from).join(to);
  }
  return result;
}

module.exports = {
  THEME_DEFAULTS,
  parseTheme,
  toHexColor,
  extractCssVariables,
  resolveCssVariables,
  replaceWithSystemFonts,
};
