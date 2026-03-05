# Slide Maker Skills

A Claude Code skill for creating professional slide decks. Generate HTML slides with live preview, then export to PPTX or PNG.

## Features

- Conversational slide creation with AI-powered content generation
- 6 slide layouts: title, content, chart, quote, split, diagram
- 4 theme presets: professional, playful, minimal, bold
- Live preview server with hot reload
- PPTX export (editable PowerPoint via dom-to-pptx)
- PNG screenshot export (pixel-perfect via Playwright)
- Chart.js and Mermaid diagram support

## Installation

### One-line install

**macOS / Linux / Git Bash on Windows:**
```bash
git clone https://github.com/user/claude-skill-slide-maker.git && cd claude-skill-slide-maker && bash install.sh
```

**Windows PowerShell:**
```powershell
git clone https://github.com/user/claude-skill-slide-maker.git; cd claude-skill-slide-maker; .\install.ps1
```

### Manual install

1. Copy `commands/*.md` to `~/.claude/commands/`
2. Copy `lib/` and `templates/` to `~/.claude/lib/slide-maker/`
3. Run `cd ~/.claude/lib/slide-maker && npm install`
4. (Optional) Run `npx playwright install chromium` for export support

## Usage

### Create a presentation

In Claude Code, type:

```
/slides
```

Then describe what you want:
- "Create a presentation about Q4 results for the executive team"
- "Make slides for my product launch, bold and exciting, about 8 slides"

### Edit and iterate

| Command | Description |
|---------|-------------|
| `/slides-edit N` | Edit slide N |
| `/slides-regenerate N` | Regenerate slide N from storyline |
| `/slides-swap N M` | Swap positions of slides N and M |
| `/slides-add` | Add a new slide |
| `/slides-delete N` | Remove slide N |
| `/slides-theme` | Change theme settings |
| `/slides-storyline` | View or modify the storyline |

### Preview

```
/slides-preview
```

Opens a browser at http://localhost:3456 with live reload.

### Export

```
/slides-export
```

Export options:
- **PPTX (default)** - Editable PowerPoint file
- **Screenshots** - Pixel-perfect PNG images

## Theme Presets

| Preset | Style |
|--------|-------|
| `professional` | Clean white background, dark blue accents |
| `playful` | Warm yellow/orange tones |
| `minimal` | Black and white only |
| `bold` | Dark background with vibrant red/yellow accents |

Customize individual CSS variables with `/slides-theme accent-primary #3b82f6`.

## File Structure

After creating a presentation:

```
slides/
├── slides.json         # Manifest
├── theme.css           # Theme variables
├── storyline.md        # Storyline document
├── slide-01.html       # Individual slides
├── slide-02.html
├── ...
└── exports/
    ├── deck.pptx       # Exported PowerPoint
    └── screenshots/    # Exported PNGs
```

## Requirements

- [Claude Code](https://claude.com/claude-code) CLI
- Node.js >= 16
- (Optional) Playwright for PPTX/PNG export: `npx playwright install chromium`

## License

MIT
