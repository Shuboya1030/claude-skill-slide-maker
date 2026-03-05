---
description: "Remove a slide from the deck"
argument-hint: "<slide-number>"
---

# /slides-delete - Delete Slide

The user wants to delete slide number $ARGUMENTS.

1. Confirm with the user that they want to delete slide $ARGUMENTS
2. Read `slides/slides.json` to verify the slide exists
3. Delete the HTML file `slides/slide-$ARGUMENTS.html` (zero-pad to 2 digits)
4. Renumber subsequent slides (slide-06.html becomes slide-05.html, etc.)
5. Update `slides/slides.json` manifest
6. Confirm the slide was deleted and remaining slides were renumbered

If no slide number is provided, ask the user which slide they want to delete.

**Warning**: This action cannot be undone easily. Always confirm before deleting.
