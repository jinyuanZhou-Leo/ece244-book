// Minimal C++ tokenizer producing the same colour classes as the book's
// Pygments "friendly" code theme (see lib/style.css).

const KEYWORDS = new Set([
  'return', 'if', 'else', 'for', 'while', 'do', 'new', 'delete', 'class', 'struct',
  'public', 'private', 'protected', 'using', 'namespace', 'const', 'static', 'this',
  'nullptr', 'NULL', 'true', 'false', 'break', 'continue', 'switch', 'case', 'default',
  'friend', 'operator', 'virtual', 'template', 'typename', 'sizeof',
]);
const TYPES = new Set([
  'int', 'void', 'double', 'float', 'char', 'bool', 'long', 'short', 'unsigned',
  'signed', 'auto', 'size_t', 'string',
]);
const NAMESPACES = new Set(['std']);

const TOKEN = new RegExp(
  [
    String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
    String.raw`(?<preproc>#\s*\w+)`,
    String.raw`(?<header>(?<=#\s*include\s*)<[\w./]+>)`,
    String.raw`(?<string>"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])')`,
    String.raw`(?<number>\b\d+(?:\.\d+)?[fFuUlL]*\b)`,
    String.raw`(?<ident>[A-Za-z_]\w*)`,
    String.raw`(?<op>::|->|[-+*/%=&|!<>^~?:]+)`,
    String.raw`(?<ws>\s+)`,
    String.raw`(?<punct>.)`,
  ].join('|'),
  'g',
);

export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Returns one array of {text, cls} tokens per source line.
export function tokenize(src, { classes = [] } = {}) {
  const classNames = new Set(classes);
  const tokens = [];
  let afterPreproc = false;
  for (const m of src.matchAll(TOKEN)) {
    const g = m.groups;
    const text = m[0];
    let cls = '';
    if (g.comment) cls = 'com';
    else if (g.preproc) { cls = 'pre'; afterPreproc = /include/.test(text); }
    else if (g.header) cls = 'prefile';
    else if (g.string) cls = afterPreproc ? 'prefile' : 'str';
    else if (g.number) cls = 'num';
    else if (g.ident) {
      if (KEYWORDS.has(text)) cls = 'kw';
      else if (TYPES.has(text)) cls = 'type';
      else if (NAMESPACES.has(text)) cls = 'ns';
      else if (classNames.has(text)) cls = 'cls';
    } else if (g.op) cls = 'op';
    if (text.includes('\n')) afterPreproc = false;
    tokens.push({ text, cls });
  }

  // A name followed by "(" is a function *declaration/definition* (blue) only
  // when preceded by a type, a class name, "::", "~", or a pointer/reference
  // declarator. Calls stay in the default colour, as in Pygments.
  const sig = tokens.map((t, i) => ({ t, i })).filter(({ t }) => !/^\s+$/.test(t.text));
  for (let k = 0; k < sig.length - 1; k++) {
    const { t } = sig[k];
    if (t.cls !== '' || !/^[A-Za-z_]\w*$/.test(t.text)) continue;
    if (sig[k + 1].t.text !== '(') continue;
    let p = k - 1;
    while (p >= 0 && /^[*&]+$/.test(sig[p].t.text)) p--;
    const prev = sig[p]?.t;
    if (prev && (prev.cls === 'type' || prev.cls === 'cls' || prev.text === '::' || prev.text === '~')) {
      t.cls = 'fn';
    }
  }

  const lines = [[]];
  for (const t of tokens) {
    const parts = t.text.split('\n');
    parts.forEach((part, idx) => {
      if (idx > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, cls: t.cls });
    });
  }
  return lines;
}

// Renders one tokenized line, wrapping the given column ranges in mark spans.
// marks: [{ start, end, id?, cls? }] (non-overlapping, columns in the plain line).
export function renderLine(tokens, marks = []) {
  const sorted = [...marks].sort((a, b) => a.start - b.start);
  let out = '';
  let col = 0;
  let mi = 0;
  let open = null;
  const openMark = (m) => {
    out += `<span class="mark ${m.cls ?? ''}"${m.id ? ` id="${m.id}"` : ''}>`;
    open = m;
  };
  for (const t of tokens) {
    let text = t.text;
    while (text.length) {
      if (!open && mi < sorted.length && sorted[mi].start === col) openMark(sorted[mi]);
      let take = text.length;
      if (open) take = Math.min(take, open.end - col);
      else if (mi < sorted.length && sorted[mi].start > col) take = Math.min(take, sorted[mi].start - col);
      const piece = text.slice(0, take);
      out += t.cls ? `<span class="${t.cls}">${escapeHtml(piece)}</span>` : escapeHtml(piece);
      col += take;
      text = text.slice(take);
      if (open && col === open.end) { out += '</span>'; open = null; mi++; }
    }
  }
  if (open) out += '</span>';
  return out;
}

export function highlightInline(src, opts) {
  return tokenize(src, opts).map((l) => renderLine(l)).join('\n');
}
