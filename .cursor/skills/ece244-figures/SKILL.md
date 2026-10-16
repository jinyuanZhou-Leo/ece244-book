---
name: ece244-figures
description: Creates, renders, names, and embeds figures for the ECE244 textbook in the visual style of Chapters 1-5 (memory diagrams with stack frames, heap segments, pointer arrows, yellow highlights, step sequences, syntax-coloured code panels) using the HTML/SVG pipeline in diagrams/ (JS spec -> Playwright -> PNG + PDF). Use when adding or editing a diagram, memory/stack/heap illustration, or image in textbook/chapters/*/images, or when writing MyST {figure} directives in this repo.
---

# ECE244 Figures

New figures are written as JS specs in `diagrams/figures/<chapter-folder>/<topic>.mjs` and rendered to `<stem>.png` + `<stem>.pdf`. Chapters 1–4 contain older figures drawn in OmniGraffle (`images/chapterNN-images.graffle`). Leave those as they are unless the user asks you to redraw one. For the component API, see [pipeline.md](pipeline.md).

## Embedding (MyST)

Keep the options in exactly this order, then a blank line, then the caption:

````markdown
```{figure} ./images/swapByPointer-a.png
:alt: Pass by pointer
:class: with-shadow
:width: 600px
:align: center
:name: swapByPointer-a

`a` and `b` are passed by pointer to the `swapByPointers` function.
```
````

- The path is always `./images/<stem>.png`. Reference only the PNG, never the PDF.
- `:width:`:
  - `600px` is the default.
  - Use `400px` for small concept figures.
  - Use `700px`–`800px` for wide code-plus-memory figures.
- `:name:` is the file stem. It is required whenever the text uses ``{numref}`stem` ``. Never put `*` in a name.
- Captions are 1–2 full sentences that end with a period, with identifiers in backticks. Every figure gets a caption.
- Don't put a blank line between options, and don't use `:figclass:`. Both happen in Chapters 4–5 and both are mistakes.
- Introduce the figure in prose: "In {numref}`hello-program`, we show …". For a multi-step sequence, use consecutive `{figure}` blocks with one caption per step. In Chapter 3 these are narrated as `**Step N:**`.

## File naming and sources

- Use kebab-case descriptive stems: `pass-by-value-factorial`, `lifecycle-object`. Keep the camelCase of C++ identifiers: `swapByValue-b`.
- Name sequences `<stem>-a/-b/-c` or `step1-<what>`, `step2-<what>`, and so on.
- Write `*` in a type as `_`: `allocate-array-int_`, `delete-entire-Student_-array`. Write operators literally: `operator=-implement`.
- Use one spec file per figure or sequence: `diagrams/figures/<chapter-folder>/<topic>.mjs`. Its `export default [figure('<stem>', …), …]` produces one **PDF + PNG pair with the same stem** per entry.
- PNGs are rendered at 4× (about 4000 px wide) and scaled down by `:width:`. PDFs are vector.

## Visual language

Copy these conventions so new diagrams match the existing ones:

- **Code panels**
  - Monospace font, syntax-coloured to match the site theme:
    - keywords in bold green
    - `int`/`double` in brown-red
    - class and function names in blue
    - comments in italic teal-grey
    - operators in grey
  - Optional line numbers on the left.
- **Typography:** labels and callouts use a Helvetica-like sans-serif.
- **Memory layout (stack frames)**
  - Use a bold-outlined "Main memory" box.
  - Each frame is a labelled band (`main`, `swapByValue`) with the function name in blue monospace.
  - Variable rows show the type on the left (brown), then the name, then a value box.
- **Memory layout (segments)**
  - Use this when stack and heap matter, as in Chapter 3.
  - Draw a vertical column with Stack (light lavender), a gap with growth arrows and a dashed line, Heap (lighter purple), Const + Global (mid purple), and Code (dark purple, white text).
  - Put stack variable names to the left of the column.
- **Values**
  - Draw uninitialized values as `?`.
  - Draw a pointer as a filled dot inside its box with an arrow to the target (`●→`), or write `&a` in the value box for simple cases.
- **State changes**
  - Highlight the updated value in yellow.
  - Strike through the old value and write the new one next to it.
  - Fade or grey out a returned frame and label it ("`swapByValue` frame is erased").
  - Mark freed heap cells "Freed" with `?`. Show leaked cells in pink/red.
  - Show a deleted object with a dark-red X, and point it to a magenta `nullptr`/`NULL` after reset.
- **Annotations**
  - Put a light-yellow bar across the current line of code.
  - Mark steps with yellow numbered circles with a black outline.
  - Use black arrows with sans-serif callout text, and yellow boxes around the tokens being explained.
- **Objects:** draw a rounded box with the class name in bold and one row per data member. Draw arrays of pointers as a row of thick-bordered `Student*` cells.
- **Errors:** use a pink/red band and strikethrough on the offending line, with the reason as a callout ("Cannot access private members").
- **Scope and lifetime:** use coloured bands (teal and pink) spanning the lines where each object lives. Use circled `A`/`B` labels to tell objects apart.
- **Progressive reveal:** in step sequences, hide code that is not yet discussed behind a dark-grey box labelled "Will reveal in the next figure". Dim unchanged code.
- **Consistency within a sequence:** every step has the same canvas size and layout, with the code on one side and memory on the other. Only the changed elements differ.
- **Small concept figures** (Chapters 4–5 style): large monospace text, thick strokes, pastel highlights (pink, yellow, blue) tying parts of an expression together (`x + y ↔ x.operator+(y)`), and curved arrows. Keep them minimal.

The `diagrams/lib` components already implement the code panel, stack-frame memory box, value states, step titles, notes, arrows, error and box marks, and the reveal box. Segment (stack/heap) columns, object boxes, pointer-dot arrows and scope bands are **not built yet**. When a figure needs one, add it to `lib/components.mjs` and `lib/style.css` following the rules above, then reuse it everywhere.

## Workflow

```
- [ ] Plan: what the figure shows; for state changes, a -a/-b/-c (or stepN) sequence in ONE spec file
- [ ] Write diagrams/figures/<chapter-folder>/<topic>.mjs (copy figures/chapter01-basics/swapByPointer.mjs)
- [ ] Draft render to scratch: cd diagrams && node render.mjs figures/<chapter>/<topic>.mjs --out out
- [ ] Read every out/<stem>.png and check it against the visual language above; fix and re-render
- [ ] Final render without --out (writes textbook/chapters/<chapter>/images/<stem>.{png,pdf})
- [ ] Embed with the directive above; add :name: if referenced via {numref}
- [ ] Verify the path exists exactly (case, `_` vs `*`) and the build shows no missing-image warning
```

Setup and gotchas:
- First run: `cd diagrams && npm install`. This installs only `playwright-core`; the renderer drives the system Google Chrome (`channel: 'chrome'`), so no browser download is needed.
- **Chrome is killed inside the agent sandbox.** Run `render.mjs` with `required_permissions: ["all"]`, and read `out/` with the same permission.
- Never render over an existing OmniGraffle-era PNG unless the user asked for that redraw. Pick a new stem, or use `--out out` to compare.
