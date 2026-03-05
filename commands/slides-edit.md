---
description: "Edit a specific slide in the deck"
argument-hint: "<slide-number>"
---

# /slides-edit - Edit Slide

The user wants to edit slide number $ARGUMENTS.

1. Read the slide file at `slides/slide-$ARGUMENTS.html` (zero-pad to 2 digits, e.g., slide 3 = slide-03.html)
2. Show the user the current content (title, layout, key content)
3. Ask what they'd like to change: title, content, layout, chart data, styling, etc.
4. Make the requested changes to the HTML file
5. Confirm the changes were made

If no slide number is provided, ask the user which slide they want to edit.
