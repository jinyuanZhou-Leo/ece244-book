// Small interactive widgets for the textbook. Each widget reads its content
// from a <script type="application/json"> child, so a page only needs:
//
//   <memory-stepper>
//   <script type="application/json">{ ... }</script>
//   </memory-stepper>
//
// See .cursor/skills/ece244-chapter-writing/interactive.md for the JSON format.
(function () {
  const KEYWORDS = new Set([
    "if", "else", "for", "while", "return", "new", "delete", "const", "this",
    "class", "public", "private", "using", "namespace", "nullptr", "operator",
  ]);
  const TYPES = new Set(["int", "void", "double", "char", "bool", "string"]);
  const TOKEN = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(\b\d+\b)|([A-Za-z_]\w*)|([^\w\s"]+|\s+)/g;

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlight(line) {
    return line.replace(TOKEN, function (m, com, str, num, word) {
      if (com) return '<span class="iw-com">' + esc(m) + "</span>";
      if (str) return '<span class="iw-str">' + esc(m) + "</span>";
      if (num) return '<span class="iw-num">' + m + "</span>";
      if (word && KEYWORDS.has(word)) return '<span class="iw-kw">' + m + "</span>";
      if (word && TYPES.has(word)) return '<span class="iw-type">' + m + "</span>";
      return esc(m);
    });
  }

  function readSpec(el) {
    const script = el.querySelector('script[type="application/json"]');
    try {
      return JSON.parse(script.textContent);
    } catch (e) {
      el.innerHTML = '<p class="iw-error">Widget JSON is invalid: ' + esc(e.message) + "</p>";
      console.error("[interactive]", e, el);
      return null;
    }
  }

  function make(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  // ---------------------------------------------------------------- stepper

  class MemoryStepper extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      const spec = readSpec(this);
      if (!spec) return;
      this.modes = spec.modes || [{ label: "", steps: spec.steps }];
      this.baseCode = spec.code || [];
      this.firstLine = spec.firstLine || 1;
      this.mode = 0;
      this.step = 0;
      this.build(spec);
      this.render();
      new ResizeObserver(() => this.drawArrows()).observe(this.memory);
      let width = 0;
      new ResizeObserver(() => {
        if (this.offsetWidth === width) return;
        width = this.offsetWidth;
        this.lockHeights();
      }).observe(this);
      if (document.fonts) document.fonts.ready.then(() => this.lockHeights());
      if (document.readyState !== "complete") {
        window.addEventListener("load", () => this.lockHeights(), { once: true });
      }
    }

    // Render every step of every mode once and give each changing region its
    // largest height, so the widget doesn't change height (and push the page
    // around) while the reader steps through it.
    lockHeights() {
      const regions = [this.codeCol, this.memory, this.note, this.msgs];
      regions.forEach((r) => (r.style.minHeight = ""));
      const max = regions.map(() => 0);
      const [mode, step] = [this.mode, this.step];
      this.locking = true;
      this.modes.forEach((m, mi) => {
        m.steps.forEach((_, si) => {
          this.mode = mi;
          this.step = si;
          this.render();
          regions.forEach((r, i) => (max[i] = Math.max(max[i], r.offsetHeight)));
        });
      });
      regions.forEach((r, i) => (r.style.minHeight = max[i] + "px"));
      this.locking = false;
      this.mode = mode;
      this.step = step;
      this.render();
    }

    build(spec) {
      this.innerHTML = "";
      this.classList.add("iw");
      if (spec.title) this.append(make("div", "iw-title", esc(spec.title)));

      if (this.modes.length > 1) {
        const tabs = make("div", "iw-tabs");
        tabs.setAttribute("role", "tablist");
        this.tabs = this.modes.map((m, i) => {
          const b = make("button", "iw-tab", esc(m.label));
          b.type = "button";
          b.setAttribute("role", "tab");
          b.addEventListener("click", () => {
            this.mode = i;
            this.step = Math.min(this.step, this.modes[i].steps.length - 1);
            this.render();
          });
          tabs.append(b);
          return b;
        });
        this.append(tabs);
      }

      const body = make("div", "iw-body");
      this.codeBox = make("pre", "iw-code");
      this.memory = make("div", "iw-memory");
      this.stackCol = make("div", "iw-seg iw-stack");
      this.heapCol = make("div", "iw-seg iw-heap");
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svg.classList.add("iw-arrows");
      this.memory.append(this.stackCol, this.heapCol, this.svg);
      this.codeCol = make("div", "iw-codecol");
      this.codeCol.append(
        this.codeBox,
        make("div", "iw-legend", '<span class="iw-swatch"></span>line that just ran'),
      );
      body.append(this.codeCol, this.memory);
      this.append(body);

      this.note = make("div", "iw-note");
      this.note.setAttribute("aria-live", "polite");
      this.msgs = make("div", "iw-msgs");
      this.output = make("pre", "iw-output");
      this.error = make("div", "iw-err");
      this.msgs.append(this.output, this.error);
      this.append(this.note, this.msgs);

      const nav = make("div", "iw-nav");
      this.prev = make("button", "iw-btn", "&lt; Prev");
      this.next = make("button", "iw-btn", "Next &gt;");
      this.prev.type = this.next.type = "button";
      this.counter = make("span", "iw-counter");
      this.prev.addEventListener("click", () => this.go(-1));
      this.next.addEventListener("click", () => this.go(1));
      nav.append(this.prev, this.counter, this.next);
      this.append(nav);
    }

    go(d) {
      const n = this.modes[this.mode].steps.length;
      this.step = Math.max(0, Math.min(n - 1, this.step + d));
      this.render();
    }

    render() {
      const mode = this.modes[this.mode];
      const s = mode.steps[this.step];
      const code = mode.code || this.baseCode;
      const dim = new Set(mode.dim || []);

      (this.tabs || []).forEach((t, i) => {
        t.classList.toggle("iw-on", i === this.mode);
        t.setAttribute("aria-selected", String(i === this.mode));
      });

      this.codeBox.innerHTML = code
        .map((line, i) => {
          const n = i + this.firstLine;
          const cls = ["iw-line"];
          if (n === s.line) cls.push("iw-cur");
          if (dim.has(n)) cls.push("iw-dim");
          return (
            '<span class="' + cls.join(" ") + '"><span class="iw-ln">' + n +
            "</span>" + (highlight(line) || " ") + "</span>"
          );
        })
        .join("");

      this.stackCol.innerHTML = '<div class="iw-seglabel">Stack</div>';
      (s.stack || []).forEach((item) => this.stackCol.append(this.stackItem(item)));
      this.heapCol.innerHTML = '<div class="iw-seglabel">Heap</div>';
      (s.heap || []).forEach((b) => this.heapCol.append(this.heapBlock(b)));

      this.note.innerHTML = s.note ? inline(s.note) : "";
      this.output.textContent = s.output || "";
      this.output.hidden = !s.output;
      this.error.innerHTML = s.error ? inline(s.error) : "";
      this.error.hidden = !s.error;

      const n = mode.steps.length;
      this.counter.textContent = "Step " + (this.step + 1) + " of " + n;
      this.prev.disabled = this.step === 0;
      this.next.disabled = this.step === n - 1;
      if (!this.locking) {
        [this.codeCol, this.memory, this.note, this.msgs].forEach((r) => {
          if (r.offsetHeight > parseFloat(r.style.minHeight || 0)) {
            r.style.minHeight = r.offsetHeight + "px";
          }
        });
      }
      requestAnimationFrame(() => this.drawArrows());
    }

    stackItem(item) {
      if (item.frame) return make("div", "iw-frame", esc(item.frame));
      const box = make("div", "iw-obj" + (item.state ? " iw-" + item.state : ""));
      if (item.id) box.dataset.id = item.id;
      box.append(make("div", "iw-objname", esc(item.name)));
      const fields = make("div", "iw-fields");
      (item.fields || [item]).forEach((f) => {
        const row = make("div", "iw-field");
        if (item.fields) row.append(make("span", "iw-fname", esc(f.name)));
        const val = make("span", "iw-val" + (f.hl ? " iw-hl" : ""));
        if (f.ptr) {
          const dot = make("span", "iw-dot");
          dot.dataset.ptr = f.ptr;
          if (f.dangling) dot.dataset.dangling = "1";
          val.append(dot);
        } else {
          val.textContent = f.value === undefined ? "?" : f.value;
        }
        row.append(val);
        fields.append(row);
      });
      box.append(fields);
      if (item.state === "erased") box.append(make("div", "iw-tag", "destroyed"));
      return box;
    }

    heapBlock(b) {
      const block = make("div", "iw-block iw-" + (b.state || "alloc"));
      block.dataset.id = b.id;
      const cells = make("div", "iw-cells");
      const hl = new Set(b.hl || []);
      b.values.forEach((v, i) => {
        cells.append(make("span", "iw-cell" + (hl.has(i) ? " iw-hl" : ""), esc(v)));
      });
      block.append(cells);
      const label = b.label || { freed: "freed", leak: "leaked", garbage: "garbage values" }[b.state];
      if (label) block.append(make("div", "iw-tag", esc(label)));
      return block;
    }

    drawArrows() {
      const svg = this.svg;
      const box = this.memory.getBoundingClientRect();
      svg.setAttribute("width", box.width);
      svg.setAttribute("height", box.height);
      const id = "iw-head-" + (this._uid || (this._uid = Math.random().toString(36).slice(2)));
      let html =
        '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
        '<path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>';
      this.memory.querySelectorAll(".iw-dot").forEach((dot) => {
        const target = this.memory.querySelector('[data-id="' + dot.dataset.ptr + '"]');
        if (!target) return;
        const cell = target.querySelector(".iw-cell, .iw-fields") || target;
        const a = dot.getBoundingClientRect();
        const t = cell.getBoundingClientRect();
        const x1 = a.left + a.width / 2 - box.left;
        const y1 = a.top + a.height / 2 - box.top;
        const toLeft = t.left - box.left > x1;
        const x2 = toLeft ? t.left - box.left : t.right - box.left;
        const y2 = t.top + Math.min(t.height / 2, 14) - box.top;
        // To the right: an S-curve. Back to the left (a pointer to an object
        // above it on the stack): loop out to the right and come back in.
        const bend = toLeft ? Math.max(30, (x2 - x1) / 2) : 40;
        const c1 = x1 + bend;
        const c2 = toLeft ? x2 - bend : x2 + bend;
        const cls = dot.dataset.dangling ? "iw-arrow iw-dangling" : "iw-arrow";
        html +=
          '<path class="' + cls + '" d="M' + x1 + "," + y1 + " C" + c1 + "," + y1 + " " + c2 + "," + y2 + " " + x2 + "," + y2 +
          '" marker-end="url(#' + id + ')"/>';
      });
      svg.innerHTML = html;
    }
  }

  // ----------------------------------------------------------------- quiz

  class ChoiceQuiz extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      const spec = readSpec(this);
      if (spec) this.init(spec);
    }

    init(spec) {
      this.innerHTML = "";
      this.classList.add("iw");
      if (spec.title) this.append(make("div", "iw-title", esc(spec.title)));
      if (spec.setup) {
        this.append(make("div", "iw-given", "Given:"));
        this.append(make("pre", "iw-code iw-setup", spec.setup.split("\n").map(highlight).join("\n")));
      }
      this.score = make("div", "iw-score");
      this.answered = 0;
      this.right = 0;
      this.total = spec.items.length;
      spec.items.forEach((item) => this.append(this.row(item, spec.options)));
      const reset = make("button", "iw-btn", "Try again");
      reset.type = "button";
      reset.addEventListener("click", () => this.init(spec));
      const foot = make("div", "iw-foot");
      foot.append(this.score, reset);
      this.append(foot);
      this.updateScore();
    }

    row(item, options) {
      const row = make("div", "iw-q");
      row.append(make("code", "iw-qcode", highlight(item.code)));
      const btns = make("div", "iw-choices");
      // The explanation's space is reserved (invisible) from the start, so
      // answering doesn't push the rest of the page down.
      const why = make("div", "iw-why iw-pending");
      why.innerHTML = "<strong>Not quite.</strong> " + inline(item.why || "");
      const buttons = options.map((opt, i) => {
        const b = make("button", "iw-choice", inline(opt));
        b.type = "button";
        b.addEventListener("click", () => {
          if (row.dataset.done) return;
          row.dataset.done = "1";
          const ok = i === item.answer;
          b.classList.add(ok ? "iw-right" : "iw-wrong");
          buttons[item.answer].classList.add("iw-right");
          buttons.forEach((x) => (x.disabled = true));
          why.style.minHeight = why.offsetHeight + "px";
          why.innerHTML = "<strong>" + (ok ? "Correct." : "Not quite.") + "</strong> " + inline(item.why || "");
          why.className = "iw-why " + (ok ? "iw-why-right" : "iw-why-wrong");
          this.answered += 1;
          if (ok) this.right += 1;
          this.updateScore();
        });
        btns.append(b);
        return b;
      });
      row.append(btns, why);
      return row;
    }

    updateScore() {
      this.score.textContent =
        this.answered === this.total
          ? "You got " + this.right + " of " + this.total + " right."
          : this.answered + " of " + this.total + " answered";
    }
  }

  // `code` and **bold** in notes and explanations, like Markdown.
  function inline(text) {
    return esc(text)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  // This file is loaded in <head>. Define the elements after parsing, so the
  // JSON child already exists when connectedCallback runs.
  function define() {
    customElements.define("memory-stepper", MemoryStepper);
    customElements.define("choice-quiz", ChoiceQuiz);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", define);
  } else {
    define();
  }
})();
