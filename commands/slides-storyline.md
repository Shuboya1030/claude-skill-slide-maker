---
description: "View or modify the storyline document"
argument-hint: "<action> <details>"
---

# /slides-storyline - Storyline

View or modify the storyline document for the slide deck.

## Usage

Without arguments: displays the current storyline.
With arguments: modifies the storyline.

## View Mode (no arguments)

1. Read `slides/storyline.md`
2. Present the storyline to the user in a readable format
3. Highlight key information:
   - Number of slides
   - Key messages per slide
   - Visual directions
   - Any notes or speaker notes

If the storyline doesn't exist, inform the user and suggest running `/slides` to create one.

## Edit Mode (with arguments)

### Arguments

- `action`: What to do - add, remove, modify, reorder
- `details`: Specifics about the change

### Examples

```
/slides-storyline add "New slide about market opportunity after slide 3"
/slides-storyline remove slide 5
/slides-storyline modify slide 2 "Change message to focus on cost savings"
/slides-storyline reorder "Move slide 4 to position 2"
```

### Execution

1. Read `slides/storyline.md` to see current content
2. Apply the requested changes
3. Save the updated `slides/storyline.md`
4. Report what was changed

**Note**: Updating the storyline doesn't automatically update the HTML slides. After modifying the storyline, suggest using `/slides-regenerate N` to regenerate specific slides.
