---
name: ece244-exercises
description: Authors and validates ECE244 textbook exercises in TOML (textbook/exercises/<chapter>/testing-exercises.toml) including tracing, explanation, multiple-choice, table, programming and function-programming questions with testcases, then converts and validates them. Use when adding, editing, or debugging exercises, testcases, question IDs, or the testing-exercises page of any chapter in this repo.
---

# ECE244 Exercises

Exercises live in `textbook/exercises/<chapter-folder>/testing-exercises.toml`. The page `testing-exercises.md` only embeds them (see the `ece244-chapter-writing` templates). Never write exercises as markdown, because the old `exercises.md` format is not built.

## Required keys (every `[[exercises]]`)

`question-id`, `title`, `difficulty`, `type`, `question`, `table` (bool), `multipart` (bool), `answer`.

- `question-id` has the form `chapter-NN-QM`, for example `chapter-05-Q2`, and must be unique within the file.
- `title` gives the exam it came from: `"Question 6 in Fall 2021 Final Exam"`, or `"Modified Question 9 in Fall 2021 Midterm Exam"`.
- `difficulty` is `"Easy"`, `"Intermediate"` or `"Challenging"`. The validator does **not** actually reject bad values, so check these yourself.
- `type` is one of `"tracing"`, `"explaination"`, `"programming"`, `"function programming"` or `"multiple-choice"`. **Keep the misspelling `explaination`**, because the validator and renderer require it.

Type-specific keys:

| Condition | Extra keys |
|---|---|
| `programming` | `starter-code` |
| `function programming` | `starter-code`, `main-function` |
| `multiple-choice` | `choices` (array of strings), `answer` (array of **0-based** indices) |
| `table = true` | `headers` (array), `rows` (array of arrays, same length as `headers`), `answer` (filled rows) |
| `multipart = true` (non-MC) | `LLM`: the full problem context, used by the hint model |

The optional keys are `explanation`, `append-before` (e.g. includes prepended before student code), and `[[exercises.testcases]]`.

## Content conventions

- Put code in `question` as ```` ```{code-block} cpp ```` inside `'''…'''` strings. The renderer handles markdown-it and MathJax (`$…$`).
- A multipart exam question becomes **one `[[exercises]]` entry per sub-part**. Label the sub-parts in the text as `(1)`, `a.`, `b.`, and repeat the shared context in `LLM`.
- In `multiple-choice`, number the choices visibly (`"(1) `cout << r;`"`). Note that `answer = [3,4,7]` means choices (4), (5) and (8).
- A `tracing` answer is the exact output, one line per line.

Template:

```toml
[[exercises]]
question-id = "chapter-01-Q3"
title = "Question 6 in Fall 2022 Midterm Exam"
difficulty = "Easy"
type = "function programming"
table = false
multipart = true

LLM = '''
<full problem statement incl. all sub-parts and starter code>
'''

question = '''
<problem statement>

(1) Write the implementations ...

a. Version 1
'''

starter-code = '''
void swap_by_p(int* a, int* b) {

  // Your code here

}
'''

answer = '''
void swap_by_p(int* a, int* b) {
  int temp = *a;
  *a = *b;
  *b = temp;
}
'''

main-function = '''
#include <iostream>
using namespace std;

int main() {
  int a, b;
  while (cin >> a >> b) {
    cout << "Before: " << a << " " << b << endl;
    swap_by_p(&a, &b);
    cout << "After: " << a << " " << b << endl;
  }
  return 0;
}
'''

[[exercises.testcases]]
input = "Q3.T1.in"
output = "Q3.T1.out"
```

## Testcases

Testcase files go in `textbook/testcases/<chapter-folder>/Q<n>.T<m>.in` and `.out`. The converter inlines their contents. A `main-function` should loop over its input (`while (cin >> …)`) so that one file can exercise several cases.

## Workflow

```
- [ ] Edit textbook/exercises/<chapter>/testing-exercises.toml (+ testcase files)
- [ ] node ./textbook/_static/add_question_ids.js      # fills missing IDs, drops duplicates
- [ ] node ./textbook/_static/toml_to_js_convertor.js  # regenerates .js next to each .toml
- [ ] node textbook/exercises/toml-parser.js           # must print "All done." (reports only the first error per file)
- [ ] jupyter-book build --all textbook
- [ ] cp -r textbook/exercises/ textbook/_build/html/exercises
- [ ] Preview via python -m http.server in textbook/_build/html; run a programming question against its testcases
```
