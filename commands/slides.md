---
description: "Create professional slide decks with brainstorming, layout design, theme generation, HTML slides, preview, and PPTX export."
---

# /slides - Create Professional Slide Decks

You are an expert presentation designer. Help the user create professional slide decks.

## Step 1: Gather Requirements

Before creating slides, gather this information from the user:

**Required:**
- Topic: What is the presentation about?

**Optional (use defaults if not provided):**
- Audience: Who will view it? (default: general audience)
- Goal: Inform, persuade, inspire? (default: inform)
- Theme style: Professional, playful, minimal, bold? (default: professional)
- Slide count: Approximate number (default: decide based on content)
- Specific content: Any key points, data, or quotes to include

If requirements are clear from the user's message, proceed directly. Otherwise, ask clarifying questions.

## Step 2: Execute Slide Creation

Once requirements are gathered, execute in this order:

### 2.1 SETUP
```bash
mkdir -p slides/exports
```

### 2.2 STORYLINE
Create `slides/storyline.md` following this structure:

```markdown
# Storyline Template

## Presentation Overview
- **Topic:** [topic]
- **Audience:** [audience]
- **Desired Outcome:** [goal]
- **Tone:** [tone]
- **Duration:** [estimated time]

---

## Slides

### Slide 1: Title
- **Key Message:** [main headline]
- **Subtitle:** [tagline]
- **Visual Direction:** [layout direction]

### Slide N: [Name]
- **Key Message:** [one sentence]
- **Supporting Points:**
  - [point 1]
  - [point 2]
- **Visual Direction:** [chart/image/diagram/bullets]
- **Speaker Notes:** [what to say]

---

## Additional Notes
- **Key Transitions:** [how slides connect]
- **Must-Include Elements:** [logos, disclaimers, etc.]
```

### 2.3 THEME
Generate `slides/theme.css` based on the requested style.

**Professional (default):**
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --accent-primary: #0f172a;
  --accent-secondary: #334155;
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

**Playful:**
```css
:root {
  --bg-primary: #fef3c7;
  --bg-secondary: #fde68a;
  --text-primary: #78350f;
  --text-secondary: #92400e;
  --accent-primary: #f59e0b;
  --accent-secondary: #d97706;
}
```

**Minimal:**
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --text-primary: #171717;
  --text-secondary: #737373;
  --accent-primary: #171717;
  --accent-secondary: #404040;
}
```

**Bold:**
```css
:root {
  --bg-primary: #1e1e1e;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent-primary: #ff6b6b;
  --accent-secondary: #ffd93d;
}
```

### 2.4 GENERATE SLIDES
For each slide in the storyline:
1. Select the appropriate layout template (see below)
2. Fill in content from storyline
3. For charts, generate Chart.js configuration inline
4. For diagrams, generate Mermaid syntax inline
5. Save as `slides/slide-XX.html` (zero-padded)

**Available Layouts:**

**title.html** - Title slide with headline and subtitle:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TITLE</title>
  <link rel="stylesheet" href="theme.css">
  <style>
    .slide {
      width: 1920px; height: 1080px;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center; text-align: center;
      padding: var(--slide-padding, 80px); box-sizing: border-box;
      background: var(--bg-primary); color: var(--text-primary);
    }
    .slide h1 {
      font-size: var(--title-size, 72px); font-weight: var(--title-weight, 700);
      margin-bottom: 24px; color: var(--accent-primary);
    }
    .slide .subtitle {
      font-size: var(--subtitle-size, 36px); color: var(--text-secondary);
    }
  </style>
</head>
<body>
  <div class="slide slide-title">
    <h1>TITLE</h1>
    <p class="subtitle">SUBTITLE</p>
  </div>
</body>
</html>
```

**content.html** - Heading with bullet points:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TITLE</title>
  <link rel="stylesheet" href="theme.css">
  <style>
    .slide {
      width: 1920px; height: 1080px;
      display: flex; flex-direction: column;
      padding: var(--slide-padding, 80px); box-sizing: border-box;
      background: var(--bg-primary); color: var(--text-primary);
    }
    .slide h2 {
      font-size: var(--heading-size, 56px); font-weight: var(--heading-weight, 600);
      margin-bottom: 48px; color: var(--accent-primary);
    }
    .slide ul { font-size: var(--body-size, 32px); line-height: 1.6; list-style: none; padding: 0; }
    .slide li { margin-bottom: 24px; padding-left: 48px; position: relative; }
    .slide li::before {
      content: ""; position: absolute; left: 0; top: 12px;
      width: 16px; height: 16px; background: var(--accent-primary); border-radius: 50%;
    }
  </style>
</head>
<body>
  <div class="slide slide-content">
    <h2>TITLE</h2>
    <ul>
      <li>Point 1</li>
      <li>Point 2</li>
    </ul>
  </div>
</body>
</html>
```

**chart.html** - Chart.js visualization:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TITLE</title>
  <link rel="stylesheet" href="theme.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    .slide {
      width: 1920px; height: 1080px;
      display: flex; flex-direction: column;
      padding: var(--slide-padding, 80px); box-sizing: border-box;
      background: var(--bg-primary); color: var(--text-primary);
    }
    .slide h2 {
      font-size: var(--heading-size, 56px); font-weight: var(--heading-weight, 600);
      margin-bottom: 48px; color: var(--accent-primary);
    }
    .chart-container { flex: 1; display: flex; justify-content: center; align-items: center; max-height: 800px; }
    canvas { max-width: 100%; max-height: 100%; }
  </style>
</head>
<body>
  <div class="slide slide-chart">
    <h2>TITLE</h2>
    <div class="chart-container">
      <canvas id="chart"></canvas>
    </div>
  </div>
  <script>
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, CHART_CONFIG);
  </script>
</body>
</html>
```

**quote.html** - Centered quote with attribution:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TITLE</title>
  <link rel="stylesheet" href="theme.css">
  <style>
    .slide {
      width: 1920px; height: 1080px;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center; text-align: center;
      padding: var(--slide-padding, 80px); box-sizing: border-box;
      background: var(--bg-primary); color: var(--text-primary);
    }
    .slide .quote { font-size: 48px; font-style: italic; max-width: 1400px; line-height: 1.5; margin-bottom: 48px; }
    .slide .attribution { font-size: 28px; color: var(--text-secondary); }
  </style>
</head>
<body>
  <div class="slide slide-quote">
    <p class="quote">"QUOTE TEXT"</p>
    <p class="attribution">— ATTRIBUTION</p>
  </div>
</body>
</html>
```

**split.html** - Two-column with text and image:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TITLE</title>
  <link rel="stylesheet" href="theme.css">
  <style>
    .slide {
      width: 1920px; height: 1080px;
      display: flex; padding: var(--slide-padding, 80px); box-sizing: border-box;
      background: var(--bg-primary); color: var(--text-primary); gap: 80px;
    }
    .content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
    .slide h2 {
      font-size: var(--heading-size, 56px); font-weight: var(--heading-weight, 600);
      margin-bottom: 32px; color: var(--accent-primary);
    }
    .slide p { font-size: var(--body-size, 32px); line-height: 1.6; }
    .image-container { flex: 1; display: flex; justify-content: center; align-items: center; }
    .image-container img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: var(--border-radius, 16px); }
  </style>
</head>
<body>
  <div class="slide slide-split">
    <div class="content">
      <h2>TITLE</h2>
      <p>CONTENT</p>
    </div>
    <div class="image-container">
      <img src="IMAGE_SRC" alt="IMAGE_ALT">
    </div>
  </div>
</body>
</html>
```

**diagram.html** - Mermaid diagram:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TITLE</title>
  <link rel="stylesheet" href="theme.css">
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    .slide {
      width: 1920px; height: 1080px;
      display: flex; flex-direction: column;
      padding: var(--slide-padding, 80px); box-sizing: border-box;
      background: var(--bg-primary); color: var(--text-primary);
    }
    .slide h2 {
      font-size: var(--heading-size, 56px); font-weight: var(--heading-weight, 600);
      margin-bottom: 48px; color: var(--accent-primary);
    }
    .diagram-container { flex: 1; display: flex; justify-content: center; align-items: center; }
    .mermaid { font-size: 24px; }
  </style>
</head>
<body>
  <div class="slide slide-diagram">
    <h2>TITLE</h2>
    <div class="diagram-container">
      <div class="mermaid">
MERMAID_SYNTAX
      </div>
    </div>
  </div>
  <script>
    mermaid.initialize({
      startOnLoad: true, theme: 'base',
      themeVariables: {
        primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#3B82F6',
        primaryTextColor: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1F2937',
        primaryBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary').trim() || '#2563EB',
        lineColor: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#6B7280',
        secondaryColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#F3F4F6',
        tertiaryColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-tertiary').trim() || '#E5E7EB'
      }
    });
  </script>
</body>
</html>
```

### 2.5 CREATE MANIFEST
Create `slides/slides.json`:
```json
{
  "title": "Presentation Title",
  "created": "YYYY-MM-DD",
  "slides": [
    {"file": "slide-01.html", "title": "Title Slide", "layout": "title"},
    {"file": "slide-02.html", "title": "Agenda", "layout": "content"}
  ]
}
```

### 2.6 REPORT COMPLETION
After generating slides, provide:
- Number of slides created
- Layouts used
- Any content needing user review
- Suggest running preview: `/slides-preview`

## Layout Export Compatibility

**Fully Exportable (editable in PPTX):** title, content, quote, split
**Screenshot Export (image in PPTX):** chart, diagram, custom/complex layouts

## Chart Generation

Create valid Chart.js configurations:
```javascript
{
  type: 'bar',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Revenue',
      data: [12, 19, 3, 5],
      backgroundColor: 'rgba(59, 130, 246, 0.8)'
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'top' } }
  }
}
```

## Mermaid Diagrams

Generate valid Mermaid syntax:
```mermaid
graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
```

## File Organization

Always maintain this structure:
```
slides/
├── slides.json         # Manifest
├── theme.css           # Theme variables
├── storyline.md        # Storyline document
├── slide-01.html       # Individual slides
├── slide-02.html
├── ...
└── exports/
    └── deck.pptx       # Exported PowerPoint
```

## Quick Commands for Iteration

After slides are created, the user can use:
- `/slides-edit N` - Edit a specific slide
- `/slides-regenerate N` - Regenerate slide from storyline
- `/slides-swap N M` - Swap slide positions
- `/slides-add` - Add a new slide
- `/slides-delete N` - Remove a slide
- `/slides-theme` - Change theme settings
- `/slides-storyline` - View or modify the storyline
- `/slides-preview` - Preview in browser
- `/slides-export` - Export to PPTX or PNG

## Error Handling

- If content is ambiguous, make a reasonable choice and note it
- Always provide actionable next steps in your response
