# ECE244 Page Templates

## intro.md

```markdown
# Dynamic Memory Allocation and Classes

In this chapter, we discuss <topic A>, <topic B>, and <topic C>. We also discuss <topic D>.
```

## testing-exercises.md

Only the last line changes between chapters. Its path must match `textbook/exercises/<chapter-folder>/testing-exercises.toml`.

```markdown
# Exercises

Many of these exercises are taken from past exams of ECE 244 Programming Fundamentals courses at University of Toronto. The solutions are provided in the answer boxes.

Headings in this page classify the exercises into different categories: **[Easy]**, **[Intermediate]**, and **[Challenging]**. I suggest you start by easy exercises and work your way up to the challenging ones.

{{code_runner_quizzes}}

{{exercise_embed | replace("%%FILENAME%%", "chapterNN-name/testing-exercises") }}
```

## _toc.yml entry

```yaml
    - file: chapters/chapterNN-name/intro.md
      sections:
        - file: chapters/chapterNN-name/first-topic.md
        - file: chapters/chapterNN-name/second-topic.md
        - file: chapters/chapterNN-name/testing-exercises.md
```

## Section page skeleton

````markdown
# Section Title

In the previous section, we discussed … In this section, we will discuss …

## Concept Heading

Motivating sentence. For example, in the following code, we …

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="8 10" input="7" output="Enter a value: <b>7</b>
The value entered is 7">
&#35;include &lt;iostream&gt;
using namespace std;
<br>
int main(void) {
  int value = 0;
  cout << "Enter a value: ";

  cin >> value; // operator to input is >>

  cout << "The value entered is " << value << endl;
  return 0;
}
</code-runner>
</pre>

In line 8, we … In line 10, we …

**<span style="color:red">Problem!</span>** …

**<span style="color:green">Solution.</span>** …

```{admonition} Important!
:class: warning
…
```

**In short, …**

In the next section, we will discuss …
````

## Multi-file class listing (evolving example)

````markdown
**Code in `Student.h`**
```{code-block} cpp
:linenos:
:emphasize-lines: 9
#ifndef STUDENT_H
#define STUDENT_H
#include <string>
using namespace std;

class Student {
 private:
  string name;
  int ID;

 public:
  Student();
  void print();
};
#endif
```

**Code in `Student.cpp`**
```{code-block} cpp
:linenos:
:emphasize-lines: 5-8
#include <iostream>
#include "Student.h"
using namespace std;

Student::Student() {
  ID = 0;
  name = "no name";
}
```

**Lines 5 to 8.** We define the default constructor …
````

## Admonition containing code (4-backtick fence)

`````markdown
````{admonition} Pointers Recap
A pointer is a variable that stores the memory address of another variable.

```{code-block} cpp
int a;
int* ptr = &a;
```
````
`````

## C++ memory visualizer (`<c-visualizer>`)

```markdown
**Try out this!**

Step through the code below and watch how the stack and the heap change.

{{cpp_visualizer}}
<c-visualizer example="1" lang="cpp">
  <script type="application/json" data-kind="annotation">
    {
    "annotation": {
      "5": "Define integer variable x = 10",
      "6": "Define pointer p and initialize to nullptr"
    },
    "folds": [{ "start": 13, "end": 16 }]
  }
  </script>
  #include &lt;iostream&gt;
  using namespace std;

  int main(void) {
    int x = 10;
    int* p = nullptr;
    ...
  }
</c-visualizer>
```

How it works: the component **ignores the code in the page**. It fetches the trace `/trace/<chapter-folder>/<page-stem>/example<N>/trace.json`, which was generated ahead of time from that code by pythontutor.com (g++ 9.3). Netlify copies `textbook/trace/` into the site (see `netlify.toml`).

Body rules:
- `example="N"`: number the visualizers on a page 1, 2, 3 … with no duplicates. The number picks the trace folder.
- Put `{{cpp_visualizer}}` once before each `<c-visualizer>` (that's how Chapter 3 does it).
- Escape `<` as `&lt;`, `>` as `&gt;` and `&` as `&amp;`. The generator unescapes them, and a raw `&p` or `<iostream>` may be parsed as markup.
- Don't put a blank line between `<c-visualizer>` and `</script>`. MyST ends the HTML block at the first blank line, and the JSON must stay inside the element. Blank lines in the code itself are fine.
- Annotation keys are 1-based line numbers of the code, counting from the first non-blank line (`#include`) and including blank lines. Every key must point at a statement that executes. The note is shown when that line is reached.
- `folds` (optional) collapses lines `start`–`end` in the code view.

Generate the trace for **one page only**. The script's normal entry point re-runs every page in the book and rewrites the traces of finished chapters. Run from `textbook/`, needs `full_network`; `requests` and `bs4` are in the book venv:

```bash
cd textbook && ../.scratch/venv/bin/python -c "
from pathlib import Path; import viztrace_cpp_folder as v
v.handle_file(Path('chapters/<chapter-folder>/<page>.md').resolve(),
              Path('trace').resolve(), Path('chapters').resolve())"
```

Check the result:
- `python3 -c "import json;t=json.load(open('trace/<chapter-folder>/<page>/example1/trace.json'))['trace'];print(len(t), t[-1]['event'])"` should end in `return`. `instruction_limit_reached`, an exception, or an empty trace means the program is too long or not supported.
- Commit `code.cpp` and `trace.json` together with the page.
- If you remove a visualizer or renumber them, delete the stale `exampleN/` folders.

Local preview: build, then `cp -r textbook/trace textbook/_build/html/`, and serve from `textbook/_build/html`. The trace URL starts at the site root `/trace/…`, so a server started in a subfolder won't find it.
