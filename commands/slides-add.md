---
description: "Add a new slide to the deck"
argument-hint: "<position> <layout> <content description>"
---

# /slides-add - Add Slide

Add a new slide to the deck at the specified position.

## Arguments

- `position`: Where to insert (e.g., "after 3", "end", "beginning", or just a number)
- `layout`: Slide type - title, content, chart, diagram, quote, split
- `content`: Description of what should be on the slide

## Examples

```
/slides-add end content "Key benefits of our solution"
/slides-add after 2 chart "Revenue growth Q1-Q4"
/slides-add 5 quote "Customer testimonial from Acme Corp"
```

## Execution

1. Read `slides/slides.json` to understand the current deck structure
2. Read `slides/theme.css` for styling
3. Generate the HTML for the new slide based on the content description and chosen layout
4. Determine the correct slide number based on position
5. Renumber subsequent slides if inserting in the middle
6. Update `slides/slides.json` manifest
7. Report what was created

## If Arguments Are Missing

If the user didn't provide all arguments, make reasonable defaults:
- Position defaults to "end"
- Layout defaults to "content"
- Content: use any context from the conversation, or create a placeholder

Report what was created and suggest edits if needed.
