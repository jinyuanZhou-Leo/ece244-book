# Lightweight interactive widgets

`textbook/_static/interactive.js` and `interactive.css` define two custom
elements. Sphinx includes every file in `_static` on every page, so a page only
needs the raw HTML. Each element reads its content from a JSON child:

```html
<memory-stepper>
<script type="application/json">
{ ... }
</script>
</memory-stepper>
```

**No blank lines anywhere between `<memory-stepper>` and `</memory-stepper>`**.
A blank line ends the raw HTML block in MyST, and the rest of the JSON is
rendered as text. Write the JSON with a script and check it with `json.loads`.

Text in `note`, `error`, `why`, `options` and mode labels supports `` `code` ``
and `**bold**`.

## When to use which

| Need | Use |
|---|---|
| Real program, every executed line, exact addresses | `<c-visualizer>` (trace from pythontutor) |
| A few hand-picked states, comparing two versions (shallow vs deep, with vs without a check), a leak (pythontutor hides leaked blocks), or garbage values | `<memory-stepper>` |
| "Which of these calls X?", classify lines of code | `<choice-quiz>` |
| Show/hide a solution, switch between two listings | sphinx-design `{dropdown}` / `{tab-set}` (no JS) |

Put the widget **after** the static figure that shows the same idea, with a
bold lead-in sentence that says what to try (`**Compare the two.** Step through …`).

## `<memory-stepper>`

```json
{
  "code": ["Student y = x;", "y.setGrade(0, 70);"],
  "firstLine": 1,
  "modes": [
    {
      "label": "Default copy constructor (shallow copy)",
      "dim": [2],
      "code": ["optional: replaces the top-level code for this mode"],
      "steps": [
        {
          "line": 1,
          "note": "`y.grades` gets the address stored in `x.grades`.",
          "output": "70 85 70",
          "error": "free(): double free detected",
          "stack": [
            { "frame": "main" },
            { "name": "x", "id": "X", "fields": [
              { "name": "grades", "ptr": "A" },
              { "name": "numGrades", "value": "3", "hl": true }
            ] },
            { "name": "p", "ptr": "X", "dangling": true },
            { "name": "y", "state": "erased", "fields": [ ... ] }
          ],
          "heap": [
            { "id": "A", "values": ["90", "0", "0"], "hl": [0], "state": "alloc" }
          ]
        }
      ]
    }
  ]
}
```

- Without tabs, give a top-level `"steps"` and leave out `"modes"`.
- `line` is the line that **just ran**; the widget's legend says so. (In
  `<c-visualizer>` the highlighted line is the one **about to run**.)
- Stack item: `{frame}` is a frame label. A variable is `{name, ptr | value}`
  and an object is `{name, id?, state?, fields}`. `ptr` is the `id` of a heap
  block or a stack object, and the widget draws the arrow. Use `dangling: true`
  for a pointer to freed memory. `state: "erased"` shows an object that has
  gone out of scope.
- Heap block `state`: `alloc` (default), `freed`, `leak` or `garbage` (the
  values are shown in red italics, use `"?"`). `label` overrides the tag.
- `hl` highlights the values that changed in this step.
- Switching tabs keeps the step number, so make the steps line up when two
  modes are meant to be compared.

## `<choice-quiz>`

```json
{
  "setup": "Student a(\"Kenya\", 1001);\nStudent c;",
  "options": ["Copy constructor", "`operator=`", "Neither"],
  "items": [
    { "code": "Student b(a);", "answer": 0, "why": "`b` is being created, so ..." }
  ]
}
```

`answer` is the index into `options`. Every item needs a one-sentence `why`,
which is shown whether the answer is right or wrong.

## Fixed height (no layout jumps)

Interactive examples must not change height while the reader uses them:
anything below would jump.

- `<memory-stepper>` renders every step of every mode when it loads, and when
  the width changes, and fixes the height of the code, memory, note and
  output/error areas to the largest step.
- `<choice-quiz>` reserves the space for each explanation before it is answered.
- `<c-visualizer>` is handled by `_static/visualizer-tweaks.js`: it steps through
  the trace once and fixes `min-height` to the tallest step. The same script
  adds the "Next line to run: N  code" readout under the step counter and
  corrects the legend to "next line to run".

When you add a new widget or style, keep this working: don't change font
weight, padding or borders on state changes (a wider button can wrap its row),
and keep the margins of children inside the measured box (`display: flow-root`).
Preview with a local build. Before you finish, step through every mode from
the first step to the last and check that the page below doesn't move.
