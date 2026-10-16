---
name: ece244-chapter-writing
description: Writes and edits ECE244 textbook chapter pages (Jupyter Book / MyST markdown under textbook/chapters/) in the house style established by Chapters 1-5 — voice, page structure, code-runner and code-block markup, interactive examples (code-runner, c-visualizer memory stepper and its traces), admonitions, problem/solution callouts, output blocks, _toc.yml registration, spell check and build steps. Use when creating or revising a chapter, section page, or intro.md in this repo, or when the user asks to write content "in the same style" as the existing book.
---

# ECE244 Chapter Writing

House style extracted from Chapters 1-5. When the chapters disagree, these rules follow the convention most of them use. For figures, use the `ece244-figures` skill. For exercises, use the `ece244-exercises` skill. Copy-paste templates are in [templates.md](templates.md).

## Page structure

- Chapter folder: `textbook/chapters/chapterNN-kebab-name/`. It contains `intro.md`, one kebab-case file per topic (`separate-compilation.md`), `testing-exercises.md`, and `images/`.
- No YAML front-matter. Every page starts with a single `# Title` (Title Case, or a question like `# Why do we need destructors?`). Use `##` for sections and `###` for subsections. Never number headings by hand, because `_toc.yml` has `numbered: True`.
- `intro.md` is the title plus **one paragraph**, starting "In this chapter, we discuss …" and listing the topics. It has no subsections.
- Do not create a legacy `exercises.md` (chapters 1, 2, 4 and 5 still have one, but it is not built).
- **Register every new page in `textbook/_toc.yml`.** `only_build_toc_files: true` silently drops pages that aren't registered. Paths are relative to `textbook/` and include `.md`. `testing-exercises.md` stays last in `sections:`.

## Voice and flow

- Use "we" for the shared walkthrough ("we create an object") and "you" for rules or instructions ("you must use a pointer"). Use "I" only in meta text.
- Write for 2nd-year students who already know C. Keep the tone conversational, with short-to-medium sentences, paragraphs of 2-5 sentences, and plenty of bullet lists.
- Open the page by recapping the previous one: "In the previous section, we discussed … In this section, we will …".
- Follow this concept arc: **motivation/problem → code → explanation by line number → output → takeaway**. `chapter02-classes/structs-and-classes.md` is the model page.
- Close the page with a forward pointer ("In the next section, we will discuss …"). Optionally add a `## Summary` before it with bullets of the form "we have learned how to …".
- Put the takeaway in a bold sentence: `**In short, we cannot use pass-by-value when …**`.
- Use American spelling (`initialize`, `behavior`), and write *i.e.* and *e.g.* in italics.

## Inline formatting

- **Bold** a term where it is first defined ("a special function called the **destructor**"), and bold key rules.
- You can use bold questions as lead-ins inside a section: `**What is a destructor?**`, `**When is it called?**`.
- Put every identifier, keyword, operator, file name and literal in backticks: `` `Student` ``, `` `<<` ``, `` `Student.h` ``.
- Write math with `$...$` (dollarmath), for example `$\binom{n}{k}$`.
- Cross-reference figures with ``{numref}`label` ``. Refer to other pages in prose only ("as we discussed in the previous section").
- Credit a borrowed image with a footnote: `[^1]`.

## Problem / Solution callouts

These are inline coloured spans, not admonitions:

```markdown
**<span style="color:red">Problem!</span>** In line 16, when we printed …

**<span style="color:green">Solution 1.</span>** We can create a function …

**<span style="color:blue">Alternative Approach</span>** We could add a `setID()` function …
```

You can also tag erroneous code lines in an explanation: `**Line 7 [Erroneous].**`.

## Code

Pick the format by purpose:

| Purpose | Format |
|---|---|
| Complete runnable program whose output matters | `<code-runner>` (interactive) |
| Short program whose point is how memory changes step by step | `<c-visualizer>` (interactive, see [Interactive examples](#interactive-examples)) |
| Multi-file listing (`.h`/`.cpp`), evolving class, snippet | `` ```{code-block} cpp `` with `:linenos:` and `:emphasize-lines:` |
| Shell commands | `` ```bash `` |
| Tiny fragment | plain `` ```cpp `` |

`<code-runner>` rules (full template in [templates.md](templates.md)):
- `{{code_runner_header}}` goes directly before every `<pre class="code-runner-wrapper">`.
- Escape `#include <x>` as `&#35;include &lt;x&gt;`. You can leave `<<` and `>>` elsewhere raw.
- Put blank lines between the includes, prototypes and functions as `<br>` on their own line.
- Use `language="c++"`, `highlight-lines="4 9 14"` (space-separated), `input="7"` for stdin, and `output="…"` (multi-line allowed). In `output`, wrap user-typed input in `<b>…</b>`.
- Don't put spaces around `=` in attributes. `highlight = "20"` breaks the runner.
- Write full programs with `using namespace std;` and `int main(void)`. Order them prototypes → `main` → implementations, and label the parts `// Function Prototypes`, `// Main Function`, `// Function Implementations` when it helps.
- Inside a list item, indent the whole block 4 spaces.

Code style:
- Use 2-space indentation, K&R braces, and `nullptr` in new code.
- Comments are short trailing ones (`// Default constructor`).
- Reuse the running examples: `Student` (`name`, `ID`, `print()`, later `grades`) and `Complex` (`real`, `imag`). Use `rhs` for right-hand-side parameters.

Label each block with a bold line: `**Code**`, ``**Code in `Student.h`**``, ``**Code in `main.cpp`**``, `**Output**`.
- For a multi-file program, show one block per file.
- When a class evolves, re-show the whole file and `:emphasize-lines:` the new lines.
- Don't use `:caption:` and don't leave a trailing space after `cpp`.

Explain code **after** the block and by line number. Use either prose ("In line 5, we declare …") or bold lead-ins (`**[Line 4]**`, `**[Line 15 to 17]**`, `**Line 5.**`). When you count lines in a `<code-runner>`, include the `<br>` lines.

Show output as a raw `<pre>` under `**Output**`, with user input in `<b>`:

```markdown
**Output**
<pre>
Enter a value: <b>7</b>
The value entered is 7
</pre>
```

## Interactive examples

Use interactive examples where they help, not on every page. The book has two:

- **`<code-runner>`**: the reader edits and runs the code. Use it for any complete program whose output is the point. Invite the reader to change something ("Try changing `3` to `5` and run it again").
- **`<c-visualizer>`**: a Python Tutor style memory view that steps through the code line by line, showing stack frames, heap blocks and pointer arrows, with your note for each line. Use it when the lesson is how memory changes over time and a static figure would need many steps: pointers, `new`/`delete`, dangling pointers, double pointers, copy constructor vs. assignment, linked list insertion and deletion, recursion stack frames. The model pages are `chapter03-dma-pointers/dma.md` and `array-of-pointers.md`.

Rules for `<c-visualizer>`:
- It is an **extra**, not a replacement. Keep the static figure sequence (the PDF and print readers need it) and add the visualizer after it under `**Try out this!**`, with one sentence on what to watch, *e.g.* "Step through the code and watch `y.grades` get its own array in the heap." It can also replace a `<code-runner>` when only the memory matters.
- Keep the program small: under about 30 lines, no `cin` (stdin is empty), and well under 10,000 executed steps (no big loops). Use `int` arrays, not `string` or STL containers, because the view shows their internals.
- Don't visualize programs that crash or have undefined behavior (double free, use after free). The trace is wrong or stops early. Show those with figures and a `<code-runner>`.
- The trace is generated ahead of time from the code in the page. **Every time you change the code, regenerate the trace** (see [templates.md](templates.md)).

## Admonitions

- Default to a plain `{admonition}` with a custom title (`Important!`, `Note`, `Order of deletion!`, `Equivalent in C`, `Pointers Recap`).
- For pitfalls, add `:class: warning`.
- **Use a 4-backtick fence (````` ```` `````) on any admonition that contains a code block, figure or code-runner.**

## Before finishing

```
- [ ] Page registered in textbook/_toc.yml (testing-exercises.md still last)
- [ ] Every `In line N` matches the rendered numbering (count <br> lines)
- [ ] Every {numref} label exists as a figure :name:
- [ ] Each <c-visualizer> has a regenerated trace in textbook/trace/<chapter>/<page>/exampleN/
      whose last event is "return", and its annotation keys match its code lines
- [ ] Spell check: cd spell-check && pyspelling -c spell-check.yml
      (add new technical terms to spell-check/dictionary.txt, one per line, case variants separately)
- [ ] Build: jupyter-book build textbook  (use --all after toc/config changes)
- [ ] Preview: cd textbook/_build/html && python -m http.server 8000
- [ ] If content changed for search: python embeddings/generate.py && cp -r embeddings/outputs textbook/_build/html
```

Verifying code and building locally:
- Compile and run every example (`g++ -std=c++17 -Wall`) before you write its `output=`, `**Output**` or any claim about its behavior. Put scratch files in `.scratch/`, which is gitignored.
- To check `In line N` references, extract each `<code-runner>` body: turn `<br>` lines into blank lines, unescape `&#35;`/`&lt;`/`&gt;`, number the lines, then compile the result.
- Check behavioral claims (undefined behavior, double free, use after free) with `-fsanitize=address` instead of reasoning alone.
- If the book toolchain is missing, use `uv venv --python 3.8 .scratch/venv && VIRTUAL_ENV=.scratch/venv uv pip install -r requirements.txt pyspelling` (needs `full_network`), then `.scratch/venv/bin/jupyter-book build --all textbook` (needs `all`). `pyspelling` also needs the system `aspell`. If it is missing, ask the user before installing it.
- After building, grep the log for warnings in the chapter you changed. Warnings from `cover.md` and Chapters 3–4 were there before this work.

Known defects in the existing text that you should not copy:
- "its not"
- `highlight = "20"`
- figure file names containing `*`
- the missing `rhs.img` in `friend-functions.md`
- `error-detection-handling.md` opening with `##` instead of `#`
