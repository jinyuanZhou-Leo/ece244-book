# When do we need to implement a copy constructor?

In the previous section, we discussed that C++ provides a default copy constructor that copies every data member of an existing object into the new object. This member-wise copy works well for a `Student` with a `name` and an `ID`. In this section, we will see that it causes serious problems when a data member is a pointer to dynamically allocated memory, and we will implement our own copy constructor to fix them.

## Recap: `Student` with dynamically allocated grades

Recall from the Dynamic Memory Allocation chapter that a `Student` can store its grades in an array that is dynamically allocated in the constructor. The size of the array is only known when the object is created. The destructor frees the array when the object goes out of scope, so there is no memory leak.

In the following code, we create a `Student x` with 3 grades, then create `y` as a copy of `x`. We did **not** define a copy constructor, so the default copy constructor is called.

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="33 34" output="x: 70 0 0
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
  Student y = x; // Default copy constructor
  y.setGrade(0, 70);
  cout << "x: ";
  x.print();
  cout << "y: ";
  y.print();
  return 0;
}
</code-runner>
</pre>

**[Line 9 to 15]** The constructor sets `numGrades`, dynamically allocates an array of `numGrades` integers, and sets every grade to `0`.

**[Line 16 to 18]** The destructor frees the dynamically allocated array.

**[Line 33]** `y` is created as a copy of `x` using the default copy constructor.

**[Line 34]** We change the first grade of `y` to `70`. We never changed the grades of `x` after setting its first grade to `90`.

**Output**
<pre>
x: 70 0 0
y: 70 0 0
</pre>

## The problem with the default copy constructor

**<span style="color:red">Problem 1: the grades are shared!</span>** The output shows that the first grade of `x` is `70`, although we only changed the grades of `y`.

The default copy constructor copies each data member of `x` into `y`. The data member `grades` is a pointer, so the default copy constructor copies the **address** stored in `x.grades` into `y.grades`. It does not copy the array that `x.grades` points to. As we show in {numref}`shallow-copy-a`, `x.grades` and `y.grades` now point to the same array on the heap.

```{figure} ./images/shallow-copy-a.png
:alt: x.grades and y.grades point to the same array
:class: with-shadow
:width: 700px
:align: center
:name: shallow-copy-a

The default copy constructor copies the address stored in `x.grades` into `y.grades`. Both pointers point to the same array on the heap.
```

When we change a grade of `y` in line 34, we change the only array there is. In {numref}`shallow-copy-b`, we see that this change also appears when we print the grades of `x`.

```{figure} ./images/shallow-copy-b.png
:alt: Changing y also changes x
:class: with-shadow
:width: 700px
:align: center
:name: shallow-copy-b

`y.setGrade(0, 70)` changes the first element of the shared array, so the first grade of `x` also becomes `70`.
```

**<span style="color:red">Problem 2: the array is freed twice!</span>** When `main` returns, `x` and `y` go out of scope, and the destructor of each object is called. Objects on the stack are destroyed in the reverse order of their creation, so `y` is destroyed first. As we show in {numref}`shallow-copy-c`, the destructor of `y` frees the array. `x.grades` still stores the address of the freed array.

```{figure} ./images/shallow-copy-c.png
:alt: y frees the shared array
:class: with-shadow
:width: 700px
:align: center
:name: shallow-copy-c

`y` goes out of scope first, and its destructor frees the shared array. `x.grades` now points to memory that has been freed.
```

Next, the destructor of `x` is called, and it executes `delete[] grades;` on the same address again. **Freeing the same memory twice is undefined behavior.** In practice, the program usually crashes after printing its output. If you run the code above, you may see an error such as `free(): double free detected in tcache 2` after the output.

**Try out this!** Step through the code below. After line 33, the arrows from `x.grades` and `y.grades` point to the same array on the heap. When `main` returns, the destructor of `y` frees this array, and the destructor of `x` tries to free it again. The visualizer stops at that line with the error `Invalid free() / delete / delete[]`.

{{cpp_visualizer}}
<c-visualizer example="1" lang="cpp">
  <script type="application/json" data-kind="annotation">
    {
    "annotation": {
      "31": "Create x: the constructor allocates an array of 3 grades on the heap",
      "32": "Set the first grade of x to 90",
      "33": "Default copy constructor: y.grades gets the same address as x.grades",
      "34": "Change the first grade of y, and watch the array that x points to",
      "36": "Print x: its first grade is now 70",
      "39": "main returns: y is destroyed first, then x",
      "17": "Free the array. The second time, it is the same array again: double free!"
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
    Student y = x; // Default copy constructor
    y.setGrade(0, 70);
    cout &lt;&lt; "x: ";
    x.print();
    cout &lt;&lt; "y: ";
    y.print();
    return 0;
  }
</c-visualizer>

````{admonition} Shallow copy
:class: warning
A copy that only copies the pointers, and not the memory they point to, is called a **shallow copy**. The default copy constructor makes a shallow copy. After a shallow copy, two objects share the same dynamically allocated memory:

- changing the memory through one object changes it for the other object, and
- both destructors free the same memory.
````

## Deep copy

**<span style="color:green">Solution.</span>** We implement our own copy constructor that makes a **deep copy**: instead of copying the address, it allocates a **new** array for the new object and copies every element of the existing array into it.

**Code in `Student` class**
```{code-block} cpp
:linenos:
Student(const Student& other) {
  numGrades = other.numGrades;
  grades = new int[numGrades];
  for (int i = 0; i < numGrades; i++) {
    grades[i] = other.grades[i];
  }
}
```

**Line 2.** We copy the number of grades. `numGrades` is an `int`, so copying its value is all we need.

**Line 3.** We dynamically allocate a new array for the object being created. `grades` now points to this new array, not to the array of `other`.

**Line 4 to 6.** We copy every grade from the array of `other` into the new array.

We add the copy constructor to the `Student` class and run the same `main` function again.

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="16 17 18 19 20 21 22 40" output="x: 90 0 0
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
  Student y = x; // Our copy constructor
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

In line 40, our copy constructor is called to create `y`. As we show in {numref}`deep-copy`, `x` and `y` now have their own arrays. Changing a grade of `y` does not change the grades of `x`, and when `x` and `y` go out of scope, each destructor frees a different array. The program ends without errors.

```{figure} ./images/deep-copy.png
:alt: x and y have their own arrays
:class: with-shadow
:width: 700px
:align: center
:name: deep-copy

Our copy constructor allocates a new array for `y` and copies the grades of `x` into it. `x.grades` and `y.grades` point to different arrays.
```

**Compare the two.** Step through `main` below with the default copy constructor and with ours. You can switch between them at any step to see how the memory differs.

<memory-stepper>
<script type="application/json">
{
  "code": [
    "int main(void) {",
    "  Student x(3);",
    "  x.setGrade(0, 90);",
    "  Student y = x;",
    "  y.setGrade(0, 70);",
    "  x.print();",
    "  return 0;",
    "}"
  ],
  "modes": [
    {
      "label": "Default copy constructor (shallow copy)",
      "steps": [
        {
          "line": 2,
          "note": "The constructor of `x` allocates an array of 3 grades on the heap.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                0,
                0,
                0
              ],
              "state": "alloc"
            }
          ]
        },
        {
          "line": 3,
          "note": "Set the first grade of `x` to `90`.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                0,
                0
              ],
              "state": "alloc",
              "hl": [
                0
              ]
            }
          ]
        },
        {
          "line": 4,
          "note": "The default copy constructor copies the **address** stored in `x.grades` into `y.grades`. Both pointers point to the same array.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
              "name": "y",
              "fields": [
                {
                  "name": "grades",
                  "ptr": "A",
                  "hl": true
                },
                {
                  "name": "numGrades",
                  "value": "3"
                }
              ]
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                0,
                0
              ],
              "state": "alloc"
            }
          ]
        },
        {
          "line": 5,
          "note": "`y.setGrade(0, 70)` changes the only array there is.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
              "name": "y",
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
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                70,
                0,
                0
              ],
              "state": "alloc",
              "hl": [
                0
              ]
            }
          ]
        },
        {
          "line": 6,
          "note": "`x.print()` prints `70 0 0`: the grades of `x` changed too!",
          "output": "70 0 0",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
              "name": "y",
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
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                70,
                0,
                0
              ],
              "state": "alloc"
            }
          ]
        },
        {
          "line": 8,
          "note": "At the end of `main`, `y` is destroyed first. Its destructor frees the shared array, so `x.grades` now points to freed memory.",
          "output": "70 0 0",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
              "name": "y",
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
              ],
              "state": "erased"
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                70,
                0,
                0
              ],
              "state": "freed"
            }
          ]
        },
        {
          "line": 8,
          "note": "Then `x` is destroyed, and its destructor calls `delete[]` on the same array again.",
          "output": "70 0 0",
          "error": "Double free! The array was already freed by the destructor of `y`.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
              ],
              "state": "erased"
            },
            {
              "name": "y",
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
              ],
              "state": "erased"
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                70,
                0,
                0
              ],
              "state": "freed"
            }
          ]
        }
      ]
    },
    {
      "label": "Our copy constructor (deep copy)",
      "steps": [
        {
          "line": 2,
          "note": "The constructor of `x` allocates an array of 3 grades on the heap.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                0,
                0,
                0
              ],
              "state": "alloc"
            }
          ]
        },
        {
          "line": 3,
          "note": "Set the first grade of `x` to `90`.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                0,
                0
              ],
              "state": "alloc",
              "hl": [
                0
              ]
            }
          ]
        },
        {
          "line": 4,
          "note": "Our copy constructor allocates a **new** array for `y` and copies the grades of `x` into it.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
              "name": "y",
              "fields": [
                {
                  "name": "grades",
                  "ptr": "B",
                  "hl": true
                },
                {
                  "name": "numGrades",
                  "value": "3"
                }
              ]
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                0,
                0
              ],
              "state": "alloc"
            },
            {
              "id": "B",
              "values": [
                90,
                0,
                0
              ],
              "state": "alloc"
            }
          ]
        },
        {
          "line": 5,
          "note": "`y.setGrade(0, 70)` changes the array of `y` only.",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
              "name": "y",
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
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                0,
                0
              ],
              "state": "alloc"
            },
            {
              "id": "B",
              "values": [
                70,
                0,
                0
              ],
              "state": "alloc",
              "hl": [
                0
              ]
            }
          ]
        },
        {
          "line": 6,
          "note": "`x.print()` prints `90 0 0`: `x` is not affected.",
          "output": "90 0 0",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
              "name": "y",
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
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                0,
                0
              ],
              "state": "alloc"
            },
            {
              "id": "B",
              "values": [
                70,
                0,
                0
              ],
              "state": "alloc"
            }
          ]
        },
        {
          "line": 8,
          "note": "At the end of `main`, `y` is destroyed first, and its destructor frees the array of `y`.",
          "output": "90 0 0",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
              "name": "y",
              "fields": [
                {
                  "name": "grades",
                  "ptr": "B",
                  "dangling": true
                },
                {
                  "name": "numGrades",
                  "value": "3"
                }
              ],
              "state": "erased"
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                0,
                0
              ],
              "state": "alloc"
            },
            {
              "id": "B",
              "values": [
                70,
                0,
                0
              ],
              "state": "freed"
            }
          ]
        },
        {
          "line": 8,
          "note": "Then `x` is destroyed, and its destructor frees the array of `x`. Each array is freed exactly once.",
          "output": "90 0 0",
          "stack": [
            {
              "frame": "main"
            },
            {
              "name": "x",
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
              ],
              "state": "erased"
            },
            {
              "name": "y",
              "fields": [
                {
                  "name": "grades",
                  "ptr": "B",
                  "dangling": true
                },
                {
                  "name": "numGrades",
                  "value": "3"
                }
              ],
              "state": "erased"
            }
          ],
          "heap": [
            {
              "id": "A",
              "values": [
                90,
                0,
                0
              ],
              "state": "freed"
            },
            {
              "id": "B",
              "values": [
                70,
                0,
                0
              ],
              "state": "freed"
            }
          ]
        }
      ]
    }
  ]
}
</script>
</memory-stepper>

**In short, if a class has a pointer to dynamically allocated memory, we need to implement a copy constructor that makes a deep copy.** Otherwise, the default copy constructor makes a shallow copy, and the copies share the same memory.

In the next section, we will see that the default `operator=` has the same problem, and we will implement our own.
