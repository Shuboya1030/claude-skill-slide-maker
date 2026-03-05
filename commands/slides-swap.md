---
description: "Swap the positions of two slides"
argument-hint: "<slide-N> <slide-M>"
---

# /slides-swap - Swap Slides

The user wants to swap slides $ARGUMENTS.

1. Parse the two slide numbers from the arguments (e.g., "2 5" means swap slides 2 and 5)
2. Read `slides/slides.json` manifest
3. Swap the entries in the manifest
4. Rename the HTML files:
   - slide-N.html -> slide-temp.html
   - slide-M.html -> slide-N.html
   - slide-temp.html -> slide-M.html
5. Update the manifest with new file references
6. Save the updated manifest
7. Confirm the swap was completed

If arguments are missing or invalid, ask the user which two slides they want to swap.
