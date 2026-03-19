# Slide Maker for Claude Code

**Create professional, presentation-ready slide decks entirely through conversation in [Claude Code](https://claude.ai/claude-code).**

No design tools. No drag-and-drop. Just describe what you want and get polished HTML slides with live preview and one-click export to PowerPoint or PNG.

---

## What It Does

Slide Maker adds 10 slash commands to Claude Code that give you a complete slide creation workflow:

1. **Describe your presentation** in natural language
2. Claude generates a storyline, picks a theme, and builds each slide as styled HTML
3. **Preview live** in your browser with hot reload
4. **Iterate** — edit, add, delete, swap, retheme slides conversationally
5. **Export** to editable PPTX or pixel-perfect PNG screenshots

### Slide Layouts

| Layout | Use Case |
|--------|----------|
| **Title** | Opening/closing slides with headline + subtitle |
| **Content** | Bullet points, key takeaways, text-heavy slides |
| **Chart** | Data visualization with Chart.js (bar, line, pie, etc.) |
| **Diagram** | Flowcharts and architecture diagrams via Mermaid |
| **Quote** | Centered quote with attribution |
| **Split** | Two-column layout (text + image or text + text) |

### Theme Presets

| Preset | Description |
|--------|-------------|
| `professional` | Clean white, dark blue accents — boardroom-ready |
| `playful` | Warm yellow/orange tones — energetic and approachable |
| `minimal` | Pure black and white — content speaks for itself |
| `bold` | Dark background, vibrant red/yellow — high-impact |

You can also customize individual CSS variables (colors, fonts, spacing) with `/slides-theme`.

---

## Installation

### Prerequisites

- **[Claude Code](https://claude.ai/claude-code)** CLI installed and working
- **Node.js** >= 16
- (Optional) **Playwright** for PPTX/PNG export

### Quick Install

**macOS / Linux / Git Bash (Windows):**

```bash
git clone https://github.com/Shuboya1030/claude-skill-slide-maker.git
cd claude-skill-slide-maker
bash install.sh
```

**Windows PowerShell:**

```powershell
git clone https://github.com/Shuboya1030/claude-skill-slide-maker.git
cd claude-skill-slide-maker
.\install.ps1
```

### Manual Install

If you prefer to install manually:

```bash
# 1. Copy slash commands
cp commands/*.md ~/.claude/commands/

# 2. Copy runtime library
mkdir -p ~/.claude/lib/slide-maker
cp -r lib/* ~/.claude/lib/slide-maker/
cp -r templates/* ~/.claude/lib/slide-maker/templates/

# 3. Install dependencies
cd ~/.claude/lib/slide-maker && npm install --production

# 4. (Optional) Enable PPTX/PNG export
npx playwright install chromium
```

### Verify Installation

Open Claude Code and type `/slides` — if you see the skill activate, you're good to go.

---

## Usage

### Create a New Deck

```
/slides
```

Claude will ask about your topic, audience, and style — or you can provide everything upfront:

```
/slides Create a 10-slide investor pitch for an AI startup, bold theme, focus on market opportunity and traction
```

### All Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/slides` | Create a new presentation from scratch | `/slides` |
| `/slides-preview` | Launch live preview at localhost:3456 | `/slides-preview` |
| `/slides-edit N` | Edit a specific slide | `/slides-edit 3` |
| `/slides-add` | Add a new slide to the deck | `/slides-add after 5` |
| `/slides-delete N` | Remove a slide | `/slides-delete 4` |
| `/slides-swap N M` | Swap two slides' positions | `/slides-swap 2 5` |
| `/slides-regenerate N` | Regenerate a slide from the storyline | `/slides-regenerate 3` |
| `/slides-storyline` | View or edit the storyline | `/slides-storyline` |
| `/slides-theme` | Change theme or individual style settings | `/slides-theme style bold` |
| `/slides-export` | Export to PPTX or PNG | `/slides-export` |

### Typical Workflow

```
You:  /slides
      "Quarterly business review for engineering leadership, ~8 slides, professional theme"

      ... Claude creates the full deck ...

You:  /slides-preview          # Check it in browser

You:  /slides-edit 3           # "Make the metrics more prominent"

You:  /slides-add after 5      # "Add a slide about hiring pipeline"

You:  /slides-theme accent-primary #2563eb    # Tweak brand color

You:  /slides-export           # Get the PPTX
```

---

## Output Structure

After creating a deck, your working directory will contain:

```
slides/
├── slides.json              # Deck manifest (slide order, metadata)
├── theme.css                # Theme CSS variables
├── storyline.md             # Narrative outline
├── slide-01.html            # Individual slide files (1920x1080)
├── slide-02.html
├── slide-03.html
├── ...
└── exports/
    ├── deck.pptx            # Exported PowerPoint
    └── screenshots/
        ├── slide-01.png     # Exported PNGs
        ├── slide-02.png
        └── ...
```

Each slide is a self-contained HTML file at 1920x1080px (16:9). You can open them directly in a browser.

---

## Export Options

### PPTX (Default)

Converts HTML slides to an editable PowerPoint file using dom-to-pptx. Text, shapes, and layout are preserved as native PowerPoint objects.

### PNG Screenshots

Pixel-perfect screenshots via Playwright. Ideal when you need exact visual fidelity.

```
/slides-export screenshots
```

> **Note:** Both export methods require Playwright. Install it with:
> ```bash
> cd ~/.claude/lib/slide-maker && npx playwright install chromium
> ```

---

## How It Works

Slide Maker is built as a set of **Claude Code slash commands** (markdown files in `~/.claude/commands/`) backed by a **Node.js runtime library** (in `~/.claude/lib/slide-maker/`).

- **Commands** define the conversational workflow — they tell Claude how to gather requirements, generate content, and orchestrate the build process
- **Runtime** handles the heavy lifting — preview server, PPTX conversion, screenshot capture, theme parsing
- **Templates** provide the HTML scaffolding for each slide layout, which Claude fills with styled content

Claude does the creative work (writing copy, choosing layouts, styling). The runtime does the mechanical work (serving, exporting, file management).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `/slides` not recognized | Verify `~/.claude/commands/slides.md` exists |
| Preview won't start | Check if port 3456 is in use: `lsof -i :3456` |
| Export fails | Run `cd ~/.claude/lib/slide-maker && npx playwright install chromium` |
| `npm install` errors | Make sure Node.js >= 16: `node --version` |
| Charts not rendering | Chart.js is loaded via CDN — check internet connection |

---

## Requirements

| Dependency | Required | Purpose |
|------------|----------|---------|
| Claude Code CLI | Yes | Runtime environment |
| Node.js >= 16 | Yes | Preview server, export scripts |
| npm | Yes | Installing dependencies |
| Playwright + Chromium | Optional | PPTX and PNG export |

---

## License

MIT
