# diagrams/ pipeline reference

```
diagrams/
├── render.mjs                 # CLI: spec -> PNG + PDF (Playwright + system Chrome)
├── lib/components.mjs         # figure building blocks (below)
├── lib/cpp-highlight.mjs      # C++ tokenizer, Pygments "friendly" colour classes
├── lib/style.css              # all visual constants (palette, sizes, borders)
├── figures/<chapter-folder>/<topic>.mjs   # specs, one per figure or sequence
└── out/                       # scratch renders (gitignored)
```

## CLI

```bash
cd diagrams
node render.mjs figures/chapter01-basics/swapByPointer.mjs            # -> textbook/chapters/chapter01-basics/images/
node render.mjs figures/chapter01-basics/swapByPointer.mjs --out out  # scratch
#   --only <stem>   render one figure    --scale <n>  PNG scale (default 4)    --html  dump intermediate HTML
```

Every figure in one spec file shares the same canvas size (the largest one). A sequence therefore lines up step by step.

## Spec shape

```js
import { figure, title, columns, memory, frame, variable, code, arrow, fn, s } from '../../lib/components.mjs';

export default [
  figure('swapByPointer-b', {
    title: title(2, ['Dereference `pa` and `pb` ... in ', fn('main'), ' function']),
    body: columns([
      memory([
        frame('main', [
          variable('int', 'a', [s('5'), ' 10'], { hl: true, id: 'val-a' }),
          variable('int', 'b', [s('10'), ' 5'], { hl: true, id: 'val-b' }),
        ], { caller: true, pad: 40 }),
        frame('swapByValue', [variable('int*', 'pa', '&a'), variable('int', 'temp', '5', { hl: true })],
              { note: ['`pa` and `pb` were used to access `a` and `b`'] }),
      ], { gutter: 170, tail: 90 }),
      code(src, { highlight: ['12-14'] }),
    ]),
    arrows: [arrow('val-a', 'val-b', { fromSide: 'right', toSide: 'right', heads: 'both', curve: 34 })],
  }),
];
```

## Components

When a string is passed as content, it is escaped, and `` `x` `` inside it becomes inline monospace. Helpers return `Html` values, and arrays of content are concatenated.

| Helper | Purpose / key options |
|---|---|
| `figure(stem, { title, body, arrows })` | One exported PNG+PDF pair |
| `title(step \| null, content)` | Yellow numbered circle + sans text (centred) |
| `columns(items, { gap=48, align })` / `stack(items, { gap=16 })` | Layout |
| `memory(frames, { label='Main memory', width=220, tail=80, gutter=0 })` | Bold memory box. In a sequence, **set the same `gutter` on every step** if any step has frame notes |
| `frame(name, vars, { caller, erased, pad, note, id })` | `caller` = grey + padlock, `erased` = faded, `note` = text in the left gutter |
| `variable(type, name, value, { hl, id, classes })` | Row with a value box. `value`: `'5'`, `'&a'` (the `&`/`*` is greyed automatically), `'?'`, `''`, `[s('5'), ' 10']` |
| `code(src, opts)` | `highlight`, `dim` (line lists like `[6]` or `['12-14']`), `marks: [{ line, text, nth, id, cls: 'box'\|'err'\|'strike'\|'' }]`, `hide: { from, to, label }`, `lineNumbers`, `classes: ['Student']`, `alignMemory` (default true: line 1 aligns with the first frame) |
| `arrow(fromId, toId, opts)` | `fromSide`/`toSide`: `auto\|top\|bottom\|left\|right`. Also `curve` (px, 0 = straight), `heads: end\|both\|none`, `dashed`, `color`, `width`, `gap`, `fromOffset`/`toOffset: [dx, dy]` |
| `note(content, { align, width })` | Free annotation block |
| `c(text)`, `fn(text)`, `cpp(src)`, `s(x)`, `b(x)`, `color(css, x)`, `raw(html)` | Inline: code, blue function name, highlighted C++, strike, bold, colour, raw HTML |

Arrow endpoints are element ids. The usual targets are code marks (`marks[].id`), value boxes (`variable(..., { id })`) and frames (`frame(..., { id })`).

## Extending

Put new visual primitives (heap segment column, object box, pointer dot, scope band) in `lib/components.mjs`, with their CSS in `lib/style.css`, and take colours from the `:root` variables. Keep every component a pure function returning `raw(html)`, and give arrow targets an `id`. Render a scratch figure and inspect the PNG before using a new component in real specs.
