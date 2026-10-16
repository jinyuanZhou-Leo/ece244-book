// Building blocks for ECE244 figures. Every helper returns an Html value;
// plain strings passed as content are escaped, and `backticks` become inline
// monospace code.

import { escapeHtml, tokenize, renderLine, highlightInline } from './cpp-highlight.mjs';

export class Html {
  constructor(html) { this.html = html; }
  toString() { return this.html; }
}
export const raw = (html) => new Html(html);

export function render(content) {
  if (content == null || content === false) return '';
  if (Array.isArray(content)) return content.map(render).join('');
  if (content instanceof Html) return content.html;
  return escapeHtml(String(content)).replace(/`([^`]+)`/g, '<span class="mono">$1</span>');
}

// ---------- inline text ----------

/** Inline code in the default colour. */
export const c = (text) => raw(`<span class="mono">${escapeHtml(text)}</span>`);
/** Inline function name (blue monospace), e.g. fn('main'). */
export const fn = (text) => raw(`<span class="mono fn">${escapeHtml(text)}</span>`);
/** Inline C++ snippet with syntax colours, e.g. cpp('int* p'). */
export const cpp = (src, opts) => raw(`<span class="mono">${highlightInline(src, opts)}</span>`);
/** Struck-through old value, e.g. [s('5'), ' 10']. */
export const s = (content) => raw(`<span class="strike">${render(content)}</span>`);
/** Bold text. */
export const b = (content) => raw(`<b>${render(content)}</b>`);
/** Text in a custom colour, e.g. color('red', 'fails'). */
export const color = (col, content) => raw(`<span style="color:${col}">${render(content)}</span>`);

// ---------- layout ----------

/** Numbered step title: title(2, 'Dereference `pa` ...'). Use step = null for no circle. */
export function title(step, content) {
  const circle = step == null ? '' : `<span class="step">${step}</span>`;
  return raw(`<div class="title">${circle}<div class="title-text">${render(content)}</div></div>`);
}

/** Horizontal arrangement of blocks, top-aligned. */
export function columns(items, { gap = 48, align = 'flex-start' } = {}) {
  return raw(
    `<div class="columns" style="gap:${gap}px;align-items:${align}">` +
      items.map((i) => `<div>${render(i)}</div>`).join('') +
      '</div>',
  );
}

/** Vertical stack of blocks. */
export function stack(items, { gap = 16, align = 'stretch' } = {}) {
  return raw(
    `<div class="stack" style="gap:${gap}px;align-items:${align}">` +
      items.map((i) => `<div>${render(i)}</div>`).join('') +
      '</div>',
  );
}

/** Free-floating annotation text, e.g. next to a code block. */
export function note(content, { align = 'left', width } = {}) {
  const w = width ? `width:${width}px;` : '';
  return raw(`<div class="note-block" style="text-align:${align};${w}">${render(content)}</div>`);
}

// ---------- memory diagrams (stack frames) ----------

/**
 * Main memory box.
 *   frames  : array of frame(...)
 *   tail    : empty space below the last frame (px)
 *   gutter  : width reserved on the left for frame notes (px). Keep it the
 *             same across all steps of a sequence so the box does not move.
 */
export function memory(frames, { label = 'Main memory', width = 220, tail = 80, gutter = 0 } = {}) {
  return raw(
    `<div class="memory" style="padding-left:${gutter}px;--note-w:${Math.max(gutter - 16, 0)}px">` +
      (label ? `<div class="memory-label">${render(label)}</div>` : '') +
      `<div class="memory-box" style="width:${width}px">` +
      frames.map(render).join('') +
      `<div class="memory-tail" style="height:${tail}px"></div>` +
      '</div></div>',
  );
}

const LOCK = `<svg class="lock" viewBox="0 0 30 30" width="30" height="30"><rect width="30" height="30" rx="2" fill="#555"/><path d="M10.5 14v-3.2a4.5 4.5 0 0 1 9 0V14" fill="none" stroke="#f3c623" stroke-width="2.4"/><rect x="8" y="13.5" width="14" height="11" rx="1.5" fill="#f3c623"/></svg>`;

/**
 * Stack frame.
 *   caller : grey fill + padlock (frame of a function waiting on a call)
 *   erased : faded out (frame popped after return)
 *   pad    : empty space below the variables (px)
 *   note   : text shown in the memory gutter, beside this frame
 */
export function frame(name, vars = [], { caller = false, erased = false, pad = 0, note: noteContent, id } = {}) {
  const cls = ['frame', caller && 'caller', erased && 'erased'].filter(Boolean).join(' ');
  return raw(
    `<div class="${cls}"${id ? ` id="${id}"` : ''}>` +
      `<div class="frame-head"><span class="mono fn">${escapeHtml(name)}</span>${caller ? LOCK : ''}</div>` +
      vars.map(render).join('') +
      (pad ? `<div class="frame-pad" style="height:${pad}px"></div>` : '') +
      (noteContent ? `<div class="frame-note">${render(noteContent)}</div>` : '') +
      '</div>',
  );
}

function valueHtml(value) {
  if (value instanceof Html || Array.isArray(value)) return render(value);
  if (value == null) return '';
  return escapeHtml(String(value)).replace(/^((?:&amp;|\*)+)/, '<span class="op">$1</span>');
}

/**
 * One variable row: variable('int*', 'pa', '&a', { hl: true, id: 'pa' }).
 *   value : string, Html, or array (e.g. [s('5'), ' 10']); '?' for uninitialized
 *   hl    : yellow value box (value changed / being discussed)
 *   id    : id on the value box, for arrows
 */
export function variable(type, name, value, { hl = false, id, classes } = {}) {
  const decl = highlightInline(type ? `${type} ${name}` : name, { classes });
  return raw(
    `<div class="var"><span class="mono decl">${decl}</span>` +
      `<span class="val${hl ? ' hl' : ''}"${id ? ` id="${id}"` : ''}><span>${valueHtml(value)}</span></span></div>`,
  );
}

// ---------- memory diagrams (stack/heap segments, Chapter 3 style) ----------

/**
 * Vertical memory column: Stack header, stack items, growth gap, heap items,
 * then the Heap / Const + Global / Code bands.
 *   stack  : array of stackFrame(...) / stackObject(...) / stackVar(...)
 *   heap   : array of heapArray(...), listed top to bottom
 *   gap    : height of the free space between stack and heap (px)
 *   gutter : width reserved on the left for object names, notes and arrows
 */
export function segments({ stack = [], heap = [], gap = 140, label = 'Main memory', width = 210, gutter = 200 } = {}) {
  return raw(
    `<div class="segments" style="padding-left:${gutter}px;--seg-gutter:${gutter}px">` +
      (label ? `<div class="memory-label">${render(label)}</div>` : '') +
      `<div class="seg-col" style="width:${width}px">` +
      '<div class="seg-band seg-stack">Stack</div>' +
      stack.map(render).join('') +
      `<div class="seg-gap" style="height:${gap}px"><span class="grow grow-down"></span><span class="grow-dash"></span><span class="grow grow-up"></span></div>` +
      heap.map(render).join('') +
      '<div class="seg-band seg-heap">Heap</div>' +
      '<div class="seg-band seg-global">Const + Global</div>' +
      '<div class="seg-band seg-code">Code</div>' +
      '</div></div>',
  );
}

/** Function label band inside the stack, e.g. stackFrame('main'). */
export const stackFrame = (name) => raw(`<div class="seg-frame"><span class="mono fn">${escapeHtml(name)}</span></div>`);

/** Pointer member: box with a dot. The arrow should start at `id` (the dot). */
export const ptr = (name, { id, nullptr: isNull = false } = {}) =>
  raw(
    `<div class="seg-row"><span class="ptr-box">${isNull ? '<span class="ptr-null">/</span>' : `<span class="ptr-dot"${id ? ` id="${id}"` : ''}></span>`}</span>` +
      `<span class="mono">${escapeHtml(name)}</span></div>`,
  );

/** Plain member with a value, e.g. field('numGrades', '3'). */
export const field = (name, value, { hl = false } = {}) =>
  raw(`<div class="seg-row"><span class="seg-val${hl ? ' hl' : ''}"><span>${valueHtml(value)}</span></span><span class="mono">${escapeHtml(name)}</span></div>`);

/**
 * Object on the stack: its name is drawn left of the column, its members as rows.
 *   state : '' | 'erased' (faded, after it goes out of scope)
 */
export function stackObject(name, members, { state = '', note: noteContent, id } = {}) {
  return raw(
    `<div class="seg-obj ${state}"${id ? ` id="${id}"` : ''}>` +
      `<div class="seg-name mono">${escapeHtml(name)}</div>` +
      members.map(render).join('') +
      (noteContent ? `<div class="seg-note">${render(noteContent)}</div>` : '') +
      '</div>',
  );
}

/** Single variable on the stack: stackVar('x', '5') or stackVar('p', ptr) */
export const stackVar = (name, value, opts = {}) =>
  stackObject(name, [raw(`<div class="seg-row seg-center"><span>${valueHtml(value)}</span></div>`)], opts);

/**
 * Dynamically allocated array (or single value) on the heap.
 *   values : one string per element ('?' for garbage)
 *   state  : 'alloc' (reserved), 'leak' (pink), 'freed' (white, dotted)
 *   id     : arrow target; set on the first element (where a pointer points).
 *            The whole block gets `${id}-block`.
 *   note   : text left of the column, e.g. 'Freed', 'memory leak'
 */
export function heapArray(values, { state = 'alloc', id, note: noteContent, hl = [] } = {}) {
  const hlSet = new Set(hl);
  return raw(
    `<div class="heap-block ${state}"${id ? ` id="${id}-block"` : ''}>` +
      values
        .map((v, i) => `<div class="heap-cell${hlSet.has(i) ? ' hl' : ''}"${id && i === 0 ? ` id="${id}"` : ''}><span>${valueHtml(v)}</span></div>`)
        .join('') +
      (noteContent ? `<div class="seg-note">${render(noteContent)}</div>` : '') +
      '</div>',
  );
}

// ---------- code panels ----------

/**
 * 1-based line number of the nth line containing `text` in a code() source,
 * e.g. highlight: [lineOf(src, 'Student y = x;')]. Throws if not found.
 */
export function lineOf(src, text, nth = 1) {
  const lines = src.replace(/^\n/, '').split('\n');
  let seen = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(text) && ++seen === nth) return i + 1;
  }
  throw new Error(`lineOf: "${text}" (#${nth}) not found`);
}

function expandLines(spec = []) {
  const out = new Set();
  for (const item of [].concat(spec)) {
    if (typeof item === 'number') out.add(item);
    else {
      const [a, b] = String(item).split('-').map(Number);
      for (let i = a; i <= (b || a); i++) out.add(i);
    }
  }
  return out;
}

/**
 * Syntax-coloured code panel.
 *   highlight   : lines with the yellow bar, e.g. [11] or ['12-14']
 *   dim         : lines drawn faded (unchanged / not relevant yet)
 *   hide        : { from, to, label } dark box covering future lines
 *   marks       : [{ line, text, nth = 1, id, cls }] wraps the nth occurrence of
 *                 `text` on `line`. cls: 'box' (yellow box), 'err' (red strike),
 *                 'strike', or '' (anchor only, for arrows).
 *   lineNumbers : show line numbers on the left
 *   classes     : user-defined class names to colour as classes (e.g. ['Student'])
 *   alignMemory : push the panel down so line 1 lines up with the first frame
 */
export function code(src, {
  highlight, dim, hide, marks = [], lineNumbers = false, classes = [], alignMemory = true, id,
} = {}) {
  const lines = tokenize(src.replace(/^\n/, '').replace(/\s+$/, ''), { classes });
  const hl = expandLines(highlight);
  const dm = expandLines(dim);
  const plain = lines.map((l) => l.map((t) => t.text).join(''));
  const marksByLine = new Map();
  for (const m of marks) {
    const text = plain[m.line - 1] ?? '';
    let start = -1;
    for (let n = 0; n < (m.nth ?? 1); n++) start = text.indexOf(m.text, start + 1);
    if (start < 0) throw new Error(`code mark "${m.text}" not found on line ${m.line}: ${text}`);
    const list = marksByLine.get(m.line) ?? [];
    list.push({ start, end: start + m.text.length, id: m.id, cls: m.cls });
    marksByLine.set(m.line, list);
  }
  let body = lines
    .map((l, i) => {
      const n = i + 1;
      const cls = ['line', hl.has(n) && 'hl', dm.has(n) && 'dim'].filter(Boolean).join(' ');
      const ln = lineNumbers ? `<span class="ln">${n}</span>` : '';
      return `<div class="${cls}" data-line="${n}">${ln}${renderLine(l, marksByLine.get(n)) || ' '}</div>`;
    })
    .join('');
  if (hide) {
    body += `<div class="hide-box" data-from="${hide.from}" data-to="${hide.to}">${render(hide.label ?? 'Will reveal in the next figure')}</div>`;
  }
  return raw(
    `<div class="code${alignMemory ? ' align-memory' : ''}${lineNumbers ? ' numbered' : ''}"${id ? ` id="${id}"` : ''}>${body}</div>`,
  );
}

// ---------- arrows ----------

/**
 * Arrow between two elements (by id), drawn after layout.
 *   from/to          : element ids (value boxes, code marks, frames...)
 *   fromSide/toSide  : 'top' | 'bottom' | 'left' | 'right' | 'auto'
 *   curve            : control-point distance in px (0 = straight line)
 *   heads            : 'end' | 'both' | 'none'
 *   color, width, dashed
 *   route            : 'curve' (default) | 'elbow' (leave left, run outside the
 *                      memory column, enter `to` from the left; `elbow` = px
 *                      left of the column, use different values for parallel arrows)
 */
export function arrow(from, to, opts = {}) {
  return { from, to, fromSide: 'auto', toSide: 'auto', heads: 'end', color: '#000', width: 2.5, route: 'curve', ...opts };
}

// ---------- figure ----------

/**
 * A figure = one exported PNG + PDF pair named `${name}.png/.pdf`.
 *   body   : main content (usually columns([memory(...), code(...)]))
 *   arrows : array of arrow(...)
 */
export function figure(name, { title: t, body, arrows = [] }) {
  return { name, html: render([t, body]), arrows };
}
