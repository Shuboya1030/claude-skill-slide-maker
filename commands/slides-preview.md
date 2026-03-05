---
description: "Start or restart the slide preview server with live reload"
---

# /slides-preview - Preview Slides

Start the preview server to view slides in the browser.

```bash
node ~/.claude/lib/slide-maker/preview-server.js slides/
```

This opens a browser with live reload at http://localhost:3456

The preview will auto-refresh when slide files are modified.

If the server is already running, this will restart it. Use Ctrl+C to stop the preview server.
