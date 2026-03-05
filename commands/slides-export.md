---
description: "Export slides to PPTX or PNG screenshot format"
---

# /slides-export - Export Slides

Export the slides to PowerPoint or screenshot format.

## Export Formats

### PPTX (Default)
Editable PowerPoint file using **dom-to-pptx**. Converts HTML slides to native PowerPoint shapes.

```bash
node ~/.claude/lib/slide-maker/pptx-export.js slides/
```

Output: `slides/exports/deck.pptx`

### Screenshots
High-fidelity PNG images of each slide using Playwright.

```bash
node ~/.claude/lib/slide-maker/pptx-export.js slides/ --screenshot
```

Output: `slides/exports/screenshots/slide-01.png`, etc.

## Options

| Option | Description |
|--------|-------------|
| `--output=filename.pptx` | Specify output filename (default: `deck.pptx`) |
| `--screenshot` | Export as PNG screenshots instead of PPTX |
| `--legacy` | Use legacy pptxgenjs export |

## Export Comparison

| Feature | PPTX (dom-to-pptx) | Screenshots | Legacy (pptxgenjs) |
|---------|-------------------|-------------|-------------------|
| File format | .pptx | .png images | .pptx |
| Editable | Yes | No | Simple layouts only |
| Fidelity | High | Pixel-perfect | Medium |
| Charts | Editable shapes | Exact | Screenshot (image) |
| Custom CSS | Preserved | Exact | Partial |
| Use case | Presentations | Print/archive | Fallback |

## When to Use Each Format

- **PPTX (default)**: When you need to edit slides in PowerPoint, present in meetings, or share editable files
- **Screenshots**: When you need pixel-perfect images for printing, web embedding, or archiving
- **Legacy**: Fallback when dom-to-pptx fails or for simpler slide layouts

Ask the user which format they prefer, then run the appropriate command.
