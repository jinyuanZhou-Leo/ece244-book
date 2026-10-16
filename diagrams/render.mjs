#!/usr/bin/env node
// Renders figure specs (figures/<chapter-folder>/<topic>.mjs) to PNG + PDF.
//
//   node render.mjs figures/chapter01-basics/swapByPointer.mjs [more specs...]
//     --out <dir>    output directory (default: ../textbook/chapters/<chapter-folder>/images)
//     --only <name>  render only the figure with this name
//     --scale <n>    PNG device scale factor (default 4)
//     --html         also write the intermediate .html (for debugging)
//
// All figures exported from one spec file share the same canvas size, so the
// steps of a sequence (-a/-b/-c, step1..stepN) line up exactly.

import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, basename, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, 'lib/style.css'), 'utf8');

function parseArgs(argv) {
  const opts = { specs: [], scale: 4, html: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') opts.out = argv[++i];
    else if (a === '--only') opts.only = argv[++i];
    else if (a === '--scale') opts.scale = Number(argv[++i]);
    else if (a === '--html') opts.html = true;
    else opts.specs.push(a);
  }
  if (!opts.specs.length) {
    console.error('usage: node render.mjs <spec.mjs...> [--out dir] [--only name] [--scale n] [--html]');
    process.exit(1);
  }
  return opts;
}

function pageHtml(fig) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body><div class="canvas">${fig.html}<svg class="arrows"></svg></div></body></html>`;
}

// Runs inside the page: positions hide boxes and draws arrows.
function layout(arrows) {
  const canvas = document.querySelector('.canvas');
  const cr = canvas.getBoundingClientRect();

  for (const box of document.querySelectorAll('.hide-box')) {
    const codeEl = box.parentElement;
    const top = codeEl.querySelector(`.line[data-line="${box.dataset.from}"]`);
    const bottom = codeEl.querySelector(`.line[data-line="${box.dataset.to}"]`);
    box.style.top = `${top.offsetTop}px`;
    box.style.height = `${bottom.offsetTop + bottom.offsetHeight - top.offsetTop}px`;
  }

  const svg = canvas.querySelector('svg.arrows');
  const NS = 'http://www.w3.org/2000/svg';
  const normals = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0], center: [0, 0] };
  const rectOf = (id) => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`arrow endpoint #${id} not found`);
    const r = el.getBoundingClientRect();
    return { x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height };
  };
  const center = (r) => [r.x + r.w / 2, r.y + r.h / 2];
  const pointOn = (r, side) => ({
    top: [r.x + r.w / 2, r.y],
    bottom: [r.x + r.w / 2, r.y + r.h],
    left: [r.x, r.y + r.h / 2],
    right: [r.x + r.w, r.y + r.h / 2],
    center: [r.x + r.w / 2, r.y + r.h / 2],
  })[side];
  // Orthogonal path that leaves `from` to the left, runs down/up outside the
  // memory column, and enters `to` from the left (Chapter 3 pointer style).
  const elbowPath = (a, r1, r2) => {
    const col = document.getElementById(a.from).closest('.seg-col, .memory-box');
    const base = col ? col.getBoundingClientRect().left - cr.left : Math.min(r1.x, r2.x);
    const x = base - (a.elbow ?? 24);
    const [sx, sy] = [r1.x + r1.w / 2, r1.y + r1.h / 2];
    const ex = r2.x - (a.gap ?? 3);
    const ey = r2.y + r2.h / 2 + (a.toOffset?.[1] ?? 0);
    const rad = Math.min(10, Math.abs(ey - sy) / 2);
    const dir = ey > sy ? 1 : -1;
    return `M${sx},${sy} H${x + rad} Q${x},${sy} ${x},${sy + dir * rad} V${ey - dir * rad} Q${x},${ey} ${x + rad},${ey} H${ex}`;
  };
  const autoSide = (from, to) => {
    const [dx, dy] = [center(to)[0] - center(from)[0], center(to)[1] - center(from)[1]];
    if (Math.abs(dy) * 2 >= Math.abs(dx)) return dy > 0 ? ['bottom', 'top'] : ['top', 'bottom'];
    return dx > 0 ? ['right', 'left'] : ['left', 'right'];
  };

  const defs = document.createElementNS(NS, 'defs');
  svg.appendChild(defs);
  arrows.forEach((a, i) => {
    const r1 = rectOf(a.from);
    const r2 = rectOf(a.to);
    const [s1, s2] = autoSide(r1, r2);
    const side1 = a.fromSide === 'auto' ? s1 : a.fromSide;
    const side2 = a.toSide === 'auto' ? s2 : a.toSide;
    const n1 = normals[side1];
    const n2 = normals[side2];
    const gap = a.gap ?? 3;
    const p1 = pointOn(r1, side1).map((v, k) => v + n1[k] * gap + (a.fromOffset?.[k] ?? 0));
    const p2 = pointOn(r2, side2).map((v, k) => v + n2[k] * gap + (a.toOffset?.[k] ?? 0));
    const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const k = a.curve ?? Math.max(24, dist * 0.35);
    const c1 = [p1[0] + n1[0] * k, p1[1] + n1[1] * k];
    const c2 = [p2[0] + n2[0] * k, p2[1] + n2[1] * k];

    const marker = document.createElementNS(NS, 'marker');
    marker.setAttribute('id', `head-${i}`);
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '5');
    marker.setAttribute('markerHeight', '5');
    marker.setAttribute('orient', 'auto-start-reverse');
    marker.innerHTML = `<path d="M0,0 L10,5 L0,10 z" fill="${a.color}"/>`;
    defs.appendChild(marker);

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', a.route === 'elbow' ? elbowPath(a, r1, r2) : `M${p1} C${c1} ${c2} ${p2}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', a.color);
    path.setAttribute('stroke-width', a.width);
    path.setAttribute('stroke-linecap', 'round');
    if (a.dashed) path.setAttribute('stroke-dasharray', '8 6');
    if (a.heads !== 'none') path.setAttribute('marker-end', `url(#head-${i})`);
    if (a.heads === 'both') path.setAttribute('marker-start', `url(#head-${i})`);
    svg.appendChild(path);
  });
}

async function load(page, fig, size) {
  await page.setContent(pageHtml(fig), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  if (size) {
    await page.evaluate(({ w, h }) => {
      const s = document.querySelector('.canvas').style;
      s.width = `${w}px`;
      s.height = `${h}px`;
    }, size);
  }
  return page.$eval('.canvas', (el) => {
    const r = el.getBoundingClientRect();
    return { w: Math.ceil(r.width), h: Math.ceil(r.height) };
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 2400, height: 1600 }, deviceScaleFactor: opts.scale });
  const page = await context.newPage();

  try {
    for (const spec of opts.specs) {
      const specPath = resolve(spec);
      const chapter = basename(dirname(specPath));
      const outDir = opts.out ? resolve(opts.out) : resolve(here, '../textbook/chapters', chapter, 'images');
      mkdirSync(outDir, { recursive: true });

      const figs = (await import(pathToFileURL(specPath).href)).default;
      const sizes = [];
      for (const fig of figs) sizes.push(await load(page, fig));
      const size = { w: Math.max(...sizes.map((s) => s.w)), h: Math.max(...sizes.map((s) => s.h)) };

      for (const fig of figs) {
        if (opts.only && fig.name !== opts.only) continue;
        await load(page, fig, size);
        await page.evaluate(layout, fig.arrows);
        const base = join(outDir, fig.name);
        if (opts.html) writeFileSync(`${base}.html`, await page.content());
        await page.locator('.canvas').screenshot({ path: `${base}.png` });
        await page.pdf({ path: `${base}.pdf`, width: `${size.w}px`, height: `${size.h + 1}px`, printBackground: true, pageRanges: '1' });
        console.log(`${base}.{png,pdf}  ${size.w}x${size.h} css px @${opts.scale}x`);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
