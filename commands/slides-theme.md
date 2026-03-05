---
description: "Modify theme settings (colors, fonts, spacing)"
argument-hint: "<setting> <value>"
---

# /slides-theme - Update Theme

Modify the theme settings for the slide deck.

## Arguments

- `setting`: What to change (colors, fonts, style, or specific variable)
- `value`: The new value or style name

## Examples

```
/slides-theme style professional
/slides-theme style bold
/slides-theme accent-primary #3b82f6
/slides-theme font-heading "Playfair Display"
/slides-theme colors "dark blue and gold"
```

## Available Settings

**Preset styles:**
- `professional` - Clean, corporate look (white/blue)
- `playful` - Warm, friendly colors (yellow/orange)
- `minimal` - Simple black and white
- `bold` - Dark background with vibrant accents

**Individual variables:**
- `bg-primary`, `bg-secondary` - Background colors
- `text-primary`, `text-secondary` - Text colors
- `accent-primary`, `accent-secondary` - Accent colors
- `font-heading`, `font-body` - Font families
- `title-size`, `heading-size`, `body-size` - Font sizes

## Execution

1. Read `slides/theme.css` to see current settings
2. Apply the requested changes:
   - If a preset style, replace the entire :root block
   - If a specific variable, update just that variable
   - If a description like "dark blue", interpret and apply appropriate colors
3. Save the updated `slides/theme.css`
4. Report what was changed

Changes apply to all slides on preview refresh.

## If Arguments Are Missing

If no arguments provided, show the current theme settings and list available options.
