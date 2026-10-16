# Implementing the Assignment Operator

In the previous section, we implemented a copy constructor that makes a deep copy of a `Student` with dynamically allocated grades. However, the copy constructor is only called when a **new** object is created. When we assign one **existing** object to another, *e.g.* `y = x;`, `operator=` is called instead. In this section, we will see that the default `operator=` makes a shallow copy too, and we will implement our own.

## The problem with the default `operator=`

Recall from the Operator Overloading chapter that C++ provides a default `operator=` that assigns every data member of the right-hand side object to the corresponding data member of the left-hand side object. In the following code, `Student` has the copy constructor from the previous section, but no `operator=`.

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="40 41" output="x: 70 0 0
y: 70 0 0">
&#35;include &lt;iostream&gt;
using namespace std;
<br>
class Student {
  private:
    int* grades;
    int numGrades;
  public:
    Student(int n) {
      numGrades = n;
      grades = new int[numGrades];
      for (int i = 0; i < numGrades; i++) {
        grades[i] = 0;
      }
    }
    Student(const Student& other) {
      numGrades = other.numGrades;
      grades = new int[numGrades];
      for (int i = 0; i < numGrades; i++) {
        grades[i] = other.grades[i];
      }
    }
    ~Student() {
      delete[] grades;
    }
    void setGrade(int index, int grade) {
      grades[index] = grade;
    }
    void print() {
      for (int i = 0; i < numGrades; i++) {
        cout << grades[i] << " ";
      }
      cout << endl;
    }
};
<br>
int main(void) {
  Student x(3);
  x.setGrade(0, 90);
  Student y(2);
  y = x; // Default operator=
  y.setGrade(0, 70);
  cout << "x: ";
  x.print();
  cout << "y: ";
  y.print();
  return 0;
}
</code-runner>
</pre>

**[Line 40]** `y` is created using the constructor `Student(int n)`, so it has its own array of 2 grades.

**[Line 41]** `y` already exists, so `y = x;` calls `operator=`, not the copy constructor. We did not implement `operator=`, so the default `operator=` is called.

**Output**
<pre>
x: 70 0 0
y: 70 0 0
</pre>

The default `operator=` copies the address stored in `x.grades` into `y.grades`, just like the default copy constructor. As a result, we get the same two problems we saw in the previous section: `x` and `y` share the same array, and both destructors free it when `main` returns, which usually crashes the program after the output is printed.

**<span style="color:red">Problem 3: memory leak!</span>** There is one more problem. Before line 41, `y.grades` pointed to the array of 2 grades that the constructor of `y` allocated. The default `operator=` overwrote `y.grades` with the address of the array of `x`, so no pointer stores the address of the old array of `y` anymore. As we show in {numref}`assignment-leak`, this array can never be freed.

```{figure} ./images/assignment-leak.png
:alt: Memory leak after the default operator=
:class: with-shadow
:width: 700px
:align: center
:name: assignment-leak

After `y = x;` with the default `operator=`, `x.grades` and `y.grades` point to the same array, and the old array of `y` is leaked.
```

## Implementing `operator=` with a deep copy

**<span style="color:green">Solution.</span>** We implement our own `operator=`. Compared to the copy constructor, `operator=` has one extra job: the left-hand side object already exists, so it already owns an array that we must free before we allocate a new one.

**Step 1: Write the function header**

As we discussed in the Operator Overloading chapter, `y = x` is interpreted as `y.operator=(x)`. `operator=` is a member function that takes the right-hand side object as a `const` reference and returns a reference to the left-hand side object to allow chained assignments, *e.g.* `z = y = x;`.

```{code-block} cpp
Student& operator=(const Student& rhs);
```

**Step 2: Free the old array**

The left-hand side object, `y`, will receive a copy of the grades of `rhs`, so it no longer needs its old array. We free it using `delete[] grades;`, as we show in {numref}`deep-assignment-a`.

```{figure} ./images/deep-assignment-a.png
:alt: Free the old array of y
:class: with-shadow
:width: 700px
:align: center
:name: deep-assignment-a

`delete[] grades;` frees the old array of `y`, so it is not leaked. `y.grades` still stores the address of the freed array until we change it in the next step.
```

**Step 3: Allocate a new array and copy the grades**

Like the copy constructor, we copy `numGrades`, allocate a new array, and copy every grade from `rhs`, as we show in {numref}`deep-assignment-b`.

```{figure} ./images/deep-assignment-b.png
:alt: Allocate a new array for y and copy the grades
:class: with-shadow
:width: 700px
:align: center
:name: deep-assignment-b

`y.grades` now points to a new array that holds a copy of the grades of `x`. `x` and `y` have their own arrays.
```

**Step 4: Return the left-hand side object**

Finally, we return the left-hand side object using `return *this;`, as we did for `Complex` in the Operator Overloading chapter.

Putting it all together:

**Code in `Student` class**
```{code-block} cpp
:linenos:
:emphasize-lines: 2-4
Student& operator=(const Student& rhs) {
  if (this == &rhs) {
    return *this;
  }
  delete[] grades;
  numGrades = rhs.numGrades;
  grades = new int[numGrades];
  for (int i = 0; i < numGrades; i++) {
    grades[i] = rhs.grades[i];
  }
  return *this;
}
```

**Line 5.** We free the old array of the left-hand side object (Step 2).

**Line 6 to 10.** We make a deep copy of `rhs`, exactly as in the copy constructor (Step 3).

**Line 11.** We return the left-hand side object (Step 4).

### Self-assignment

**What are lines 2 to 4 for?** They handle **self-assignment**, where an object is assigned to itself, *e.g.* `x = x;`. You will rarely write `x = x;` directly, but it can happen indirectly, *e.g.* `arr[i] = arr[j];` when `i` and `j` are equal.

**<span style="color:red">Problem!</span>** Without lines 2 to 4, `x = x;` would execute `delete[] grades;` and free the array of `x`. Since `rhs` is `x` itself, `rhs.grades` and `grades` are the same data member. After line 7 allocates a new array, both refer to this new array, which holds garbage values. Lines 8 to 10 then copy the garbage values into themselves, and the original grades of `x` are lost.

**<span style="color:green">Solution.</span>** In line 2, we compare the address of the left-hand side object, `this`, with the address of the right-hand side object, `&rhs`. If they are equal, the object is assigned to itself, and there is nothing to copy. We return immediately in line 3.

**Try both.** Step through `x = x;` for a `Student x` with the grades `90 85 70`, with and without lines 2 to 4.

<memory-stepper>
<script type="application/json">
{
  "code": [
    "Student& operator=(const Student& rhs) {",
    "  if (this == &rhs) {",
    "    return *this;",
    "  }",
    "  delete[] grades;",
    "  numGrades = rhs.numGrades;",
    "  grades = new int[numGrades];",
    "  for (int i = 0; i < numGrades; i++) {",
    "    grades[i] = rhs.grades[i];",
    "  }",
    "  return *this;",
    "}"
  ],
  "modes": [
    {
      "label": "With lines 2 to 4",
      "steps": [
        {
          "line": 2,
          "note": "`x = x;` calls `x.operator=(x)`. `this` points to `x`, and `rhs` refers to `x` too, so `this == &rhs` is true.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
              "id": "X",
              "fields": [
                {
                  "name": "grades",
                  "ptr": "A"
                },
                {
                  "name": "numGrades",
                  "value": "3"
                }
              ]
            },
            {
              "frame": "operator=  (x = x;)"
            },
            {
              "name": "this",
              "ptr": "X"
            },
            {
              "name": "rhs",
              "ptr": "X"
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                85,
                70
              ],
              "state": "alloc"
            }
          ]
        },
        {
          "line": 3,
          "note": "We return right away. The grades of `x` are untouched.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
              "id": "X",
              "fields": [
                {
                  "name": "grades",
                  "ptr": "A"
                },
                {
                  "name": "numGrades",
                  "value": "3"
                }
              ]
            },
            {
              "frame": "operator=  (x = x;)"
            },
            {
              "name": "this",
              "ptr": "X"
            },
            {
              "name": "rhs",
              "ptr": "X"
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                85,
                70
              ],
              "state": "alloc"
            }
          ]
        }
      ]
    },
    {
      "label": "Without lines 2 to 4",
      "dim": [
        2,
        3,
        4
      ],
      "steps": [
        {
          "line": 5,
          "note": "`delete[] grades;` frees the array of `x`. Since `rhs` is `x`, `rhs.grades` is this same pointer.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
              "id": "X",
              "fields": [
                {
                  "name": "grades",
                  "ptr": "A",
                  "dangling": true
                },
                {
                  "name": "numGrades",
                  "value": "3"
                }
              ]
            },
            {
              "frame": "operator=  (x = x;)"
            },
            {
              "name": "this",
              "ptr": "X"
            },
            {
              "name": "rhs",
              "ptr": "X"
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                85,
                70
              ],
              "state": "freed"
            }
          ]
        },
        {
          "line": 7,
          "note": "A new array is allocated, and `grades` points to it. `rhs.grades` is the same data member, so it also refers to the new array, which holds garbage values.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
              "id": "X",
              "fields": [
                {
                  "name": "grades",
                  "ptr": "B"
                },
                {
                  "name": "numGrades",
                  "value": "3"
                }
              ]
            },
            {
              "frame": "operator=  (x = x;)"
            },
            {
              "name": "this",
              "ptr": "X"
            },
            {
              "name": "rhs",
              "ptr": "X"
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                85,
                70
              ],
              "state": "freed"
            },
            {
              "id": "B",
              "values": [
                "?",
                "?",
                "?"
              ],
              "state": "garbage"
            }
          ]
        },
        {
          "line": 9,
          "note": "The loop copies `rhs.grades[i]` into `grades[i]`, which is the same element. Each garbage value is copied onto itself.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
              "id": "X",
              "fields": [
                {
                  "name": "grades",
                  "ptr": "B"
                },
                {
                  "name": "numGrades",
                  "value": "3"
                }
              ]
            },
            {
              "frame": "operator=  (x = x;)"
            },
            {
              "name": "this",
              "ptr": "X"
            },
            {
              "name": "rhs",
              "ptr": "X"
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                85,
                70
              ],
              "state": "freed"
            },
            {
              "id": "B",
              "values": [
                "?",
                "?",
                "?"
              ],
              "state": "garbage",
              "hl": [
                0,
                1,
                2
              ]
            }
          ]
        },
        {
          "line": 11,
          "note": "`operator=` returns, and `x` holds garbage.",
          "error": "The original grades of `x`, `90 85 70`, are lost.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
              "id": "X",
              "fields": [
                {
                  "name": "grades",
                  "ptr": "B"
                },
                {
                  "name": "numGrades",
                  "value": "3"
                }
              ]
            },
            {
              "frame": "operator=  (x = x;)"
            },
            {
              "name": "this",
              "ptr": "X"
            },
            {
              "name": "rhs",
              "ptr": "X"
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                85,
                70
              ],
              "state": "freed"
            },
            {
              "id": "B",
              "values": [
                "?",
                "?",
                "?"
              ],
              "state": "garbage"
            }
          ]
        }
      ]
    }
  ]
}
</script>
</memory-stepper>

We add `operator=` to the `Student` class and run the same `main` function again.

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="23 24 25 26 27 28 29 30 31 32 33 34 53" output="x: 90 0 0
y: 70 0 0">
&#35;include &lt;iostream&gt;
using namespace std;
<br>
class Student {
  private:
    int* grades;
    int numGrades;
  public:
    Student(int n) {
      numGrades = n;
      grades = new int[numGrades];
      for (int i = 0; i < numGrades; i++) {
        grades[i] = 0;
      }
    }
    Student(const Student& other) {
      numGrades = other.numGrades;
      grades = new int[numGrades];
      for (int i = 0; i < numGrades; i++) {
        grades[i] = other.grades[i];
      }
    }
    Student& operator=(const Student& rhs) {
      if (this == &rhs) {
        return *this;
      }
      delete[] grades;
      numGrades = rhs.numGrades;
      grades = new int[numGrades];
      for (int i = 0; i < numGrades; i++) {
        grades[i] = rhs.grades[i];
      }
      return *this;
    }
    ~Student() {
      delete[] grades;
    }
    void setGrade(int index, int grade) {
      grades[index] = grade;
    }
    void print() {
      for (int i = 0; i < numGrades; i++) {
        cout << grades[i] << " ";
      }
      cout << endl;
    }
};
<br>
int main(void) {
  Student x(3);
  x.setGrade(0, 90);
  Student y(2);
  y = x; // Our operator=
  y.setGrade(0, 70);
  cout << "x: ";
  x.print();
  cout << "y: ";
  y.print();
  return 0;
}
</code-runner>
</pre>

**Output**
<pre>
x: 90 0 0
y: 70 0 0
</pre>

In line 53, our `operator=` is called. `x` and `y` have their own arrays, the old array of `y` is freed, and each destructor frees a different array when `main` returns. The program ends without errors or memory leaks.

**Try out this!** Step through the code below and follow Steps 2 to 4 of our `operator=` on the heap. The old array of `y` is freed, a new array of 3 grades is allocated, and the grades of `x` are copied into it. At the end, `x.grades` and `y.grades` point to different arrays.

{{cpp_visualizer}}
<c-visualizer example="1" lang="cpp">
  <script type="application/json" data-kind="annotation">
    {
    "annotation": {
      "50": "Create x with an array of 3 grades",
      "51": "Set the first grade of x to 90",
      "52": "Create y with its own array of 2 grades",
      "53": "y already exists, so y = x calls our operator=",
      "24": "Self-assignment check: this is &y and &rhs is &x, so they are different",
      "27": "Step 2: free the old array of y",
      "29": "Step 3: allocate a new array of 3 grades for y",
      "31": "Copy each grade of x into the new array of y",
      "33": "Step 4: return the left-hand side object y",
      "54": "Change the first grade of y. The array of x is not affected",
      "59": "main returns: each destructor frees a different array"
    }
  }
  </script>
  #include &lt;iostream&gt;
  using namespace std;

  class Student {
    private:
      int* grades;
      int numGrades;
    public:
      Student(int n) {
        numGrades = n;
        grades = new int[numGrades];
        for (int i = 0; i &lt; numGrades; i++) {
          grades[i] = 0;
        }
      }
      Student(const Student&amp; other) {
        numGrades = other.numGrades;
        grades = new int[numGrades];
        for (int i = 0; i &lt; numGrades; i++) {
          grades[i] = other.grades[i];
        }
      }
      Student&amp; operator=(const Student&amp; rhs) {
        if (this == &amp;rhs) {
          return *this;
        }
        delete[] grades;
        numGrades = rhs.numGrades;
        grades = new int[numGrades];
        for (int i = 0; i &lt; numGrades; i++) {
          grades[i] = rhs.grades[i];
        }
        return *this;
      }
      ~Student() {
        delete[] grades;
      }
      void setGrade(int index, int grade) {
        grades[index] = grade;
      }
      void print() {
        for (int i = 0; i &lt; numGrades; i++) {
          cout &lt;&lt; grades[i] &lt;&lt; " ";
        }
        cout &lt;&lt; endl;
      }
  };

  int main(void) {
    Student x(3);
    x.setGrade(0, 90);
    Student y(2);
    y = x; // Our operator=
    y.setGrade(0, 70);
    cout &lt;&lt; "x: ";
    x.print();
    cout &lt;&lt; "y: ";
    y.print();
    return 0;
  }
</c-visualizer>

## The Rule of Three

Look at the three member functions we implemented for `Student`:

- The **destructor** frees the dynamically allocated memory that the object owns.
- The **copy constructor** makes a deep copy when a new object is created from an existing object.
- **`operator=`** frees the old memory of an existing object, then makes a deep copy into it.

All three are needed for the same reason: the object owns dynamically allocated memory, and the default versions provided by C++ do not manage it correctly. This leads to a well-known guideline.

```{admonition} The Rule of Three
:class: warning
If a class needs a user-defined destructor, copy constructor, or `operator=`, it almost certainly needs **all three**.
```

In practice, if your class has a pointer to memory that it dynamically allocates, start by writing the destructor, the copy constructor, and `operator=` together.

## Summary

In this chapter, we have learned:

- the copy constructor is called when a new object is created from an existing object, including when an object is passed or returned by value,
- the default copy constructor and the default `operator=` copy each data member, which makes a shallow copy of pointers,
- how to implement a copy constructor that makes a deep copy,
- how to implement `operator=` that frees the old memory, handles self-assignment, and makes a deep copy, and
- the Rule of Three.

In the next chapter, we will use these ideas to build linked lists, where objects point to other dynamically allocated objects.
