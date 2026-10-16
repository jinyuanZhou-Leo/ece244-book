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

## C++ memory visualizer (Chapter 3 style, optional)

Inside the body, escape `<` as `&lt;` and `&` as `&amp;`. Annotation keys are line numbers.

```markdown
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
    ...
  </c-visualizer>
```

Generating the traces needs extra steps: `jupyter-book build --all textbook`, then `cd textbook && python viztrace_cpp_folder.py chapters`, then `cp -r textbook/trace textbook/_build/html`.
