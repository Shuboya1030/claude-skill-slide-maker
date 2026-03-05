---
description: "Regenerate a slide from the storyline"
argument-hint: "<slide-number>"
---

# /slides-regenerate - Regenerate Slide

The user wants to regenerate slide number $ARGUMENTS from the storyline.

1. Read `slides/storyline.md` to get the content for slide $ARGUMENTS
2. Read `slides/theme.css` for styling information
3. Determine the appropriate layout template based on the storyline content
4. Generate a fresh HTML file at `slides/slide-$ARGUMENTS.html` (zero-pad to 2 digits)
5. Update `slides/slides.json` manifest if needed
6. Confirm the slide was regenerated

This is useful after updating the storyline content and wanting the slide to reflect those changes.

If no slide number is provided, ask the user which slide they want to regenerate.
