# What is a copy constructor?

In the previous chapter, we overloaded the assignment operator `operator=` to copy one **existing** object into another **existing** object, *e.g.* `z = x;`. But what if the object is being created at the same time as it is copied, *e.g.* `Student b = a;`? In this case, there is no existing `b` to assign to. Instead, `b` is constructed from `a` using a special constructor called the copy constructor.

A **copy constructor** is a special constructor that initializes a new object as a copy of an existing object of the same class.

## When is the copy constructor called?

Given that `a` is an object of the `Student` class, the copy constructor is called when:

1. **An object is created from an existing object using parentheses**, *e.g.* `Student b(a);`

    `a` is an existing object, and `b` is being created as a copy of `a`. We are passing `a` to the constructor of `b`.

2. **An object is created from an existing object using `=`**, *e.g.* `Student b = a;`

    Although the `=` syntax is used, `b` is being created in this same line, so this calls the copy constructor. **`operator=` is not called here.**

3. **An object is passed by value to a function.**

    For example, if the function prototype is `void printStudent(Student s);` and the function call is `printStudent(a);`, a new object `s` is created in the function's scope. The copy constructor is called to initialize `s` with the value of `a`.

4. **An object is returned by value from a function.**

    For example, if the function prototype is `Student getCopy(Student& s);` and the function returns `s` using `return s;`, a new object is created to hold the returned value. The copy constructor is called to initialize this new object with the value of `s`.

The copy constructor is also called when we **dynamically allocate** a new object as a copy of an existing one, *e.g.* `Student* p = new Student(a);`. Here, the new object is created on the heap, and it is initialized from `a` using the copy constructor, just like in case 1.

**Try out this!** In the following code, we define our own copy constructor that prints a message every time it is called. We then trigger each of the four cases in `main`.

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="15 35 36 37 38" output="Constructor called for Kenya
Copy constructor called for Kenya
Copy constructor called for Kenya
Copy constructor called for Kenya
Name: Kenya, ID: 8012
Copy constructor called for Kenya">
&#35;include &lt;iostream&gt;
&#35;include &lt;string&gt;
using namespace std;
<br>
class Student {
  private:
    string name;
    int ID;
  public:
    Student(string n, int id) {
      name = n;
      ID = id;
      cout << "Constructor called for " << name << endl;
    }
    Student(const Student& other) {
      name = other.name;
      ID = other.ID;
      cout << "Copy constructor called for " << name << endl;
    }
    void print() {
      cout << "Name: " << name << ", ID: " << ID << endl;
    }
};
<br>
void printStudent(Student s) {
  s.print();
}
<br>
Student getCopy(Student& s) {
  return s;
}
<br>
int main(void) {
  Student a("Kenya", 8012);
  Student b(a);           // Case 1
  Student c = a;          // Case 2
  printStudent(a);        // Case 3
  Student d = getCopy(a); // Case 4
  return 0;
}
</code-runner>
</pre>

**[Line 15 to 19]** We define the copy constructor. Like any constructor, it has the same name as the class and no return type. Its only parameter is a reference to an existing `Student` object, which we name `other`. We copy `other.name` and `other.ID` into the data members of the object being created.

**[Line 34]** `a` is created using the regular constructor `Student(string n, int id)`, which prints `Constructor called for Kenya`.

**[Line 35 and 36]** `b` and `c` are created as copies of `a`. Each line calls the copy constructor once.

**[Line 37]** `a` is passed by value to `printStudent`. The copy constructor creates the parameter `s` as a copy of `a`, then `s.print()` prints the name and ID.

**[Line 38]** `getCopy` returns `s` by value. The copy constructor creates the returned object as a copy of `s`, and this object becomes `d`.

**Output**
<pre>
Constructor called for Kenya
Copy constructor called for Kenya
Copy constructor called for Kenya
Copy constructor called for Kenya
Name: Kenya, ID: 8012
Copy constructor called for Kenya
</pre>

**Watch it step by step.** Step through the same code and watch the stack. Every time a copy is made, a new frame for the copy constructor `Student::Student(Student const&)` appears on top of the stack. Count them: there are four.

{{cpp_visualizer}}
<c-visualizer example="1" lang="cpp">
  <script type="application/json" data-kind="annotation">
    {
    "annotation": {
      "34": "Create a with the regular constructor",
      "35": "Case 1: create b as a copy of a",
      "36": "Case 2: create c as a copy of a",
      "37": "Case 3: pass a by value, so the parameter s is created as a copy of a",
      "38": "Case 4: getCopy returns s by value, so the returned object is created as a copy of s",
      "16": "Inside the copy constructor: copy the data members of other into the new object",
      "26": "s is a copy of a in the frame of printStudent",
      "30": "Return s by value: the copy constructor creates the returned object"
    }
  }
  </script>
  #include &lt;iostream&gt;
  #include &lt;string&gt;
  using namespace std;

  class Student {
    private:
      string name;
      int ID;
    public:
      Student(string n, int id) {
        name = n;
        ID = id;
        cout &lt;&lt; "Constructor called for " &lt;&lt; name &lt;&lt; endl;
      }
      Student(const Student&amp; other) {
        name = other.name;
        ID = other.ID;
        cout &lt;&lt; "Copy constructor called for " &lt;&lt; name &lt;&lt; endl;
      }
      void print() {
        cout &lt;&lt; "Name: " &lt;&lt; name &lt;&lt; ", ID: " &lt;&lt; ID &lt;&lt; endl;
      }
  };

  void printStudent(Student s) {
    s.print();
  }

  Student getCopy(Student&amp; s) {
    return s;
  }

  int main(void) {
    Student a("Kenya", 8012);
    Student b(a);           // Case 1
    Student c = a;          // Case 2
    printStudent(a);        // Case 3
    Student d = getCopy(a); // Case 4
    return 0;
  }
</c-visualizer>

````{admonition} Copies the compiler can skip
The compiler is allowed to skip some copies to make the program faster. This is called **copy elision**. For example, if `getCopy` returned a local object instead of its parameter, the compiler would usually build the returned object directly in `d`, and the copy constructor would not be called at all:

```{code-block} cpp
Student makeStudent() {
  Student temp("Cindy", 2023);
  return temp; // The copy is usually skipped
}
```

This is why `getCopy` returns its reference parameter `s` in our example: `s` is not local to `getCopy`, so a copy must be made. Do not rely on a copy being skipped or not; your copy constructor should be correct either way.
````

## The default copy constructor

**What if we do not define a copy constructor?** Just like the default `operator=` we discussed in the previous chapter, if we do not declare a copy constructor, the compiler generates a **default copy constructor** for us. The default copy constructor performs a **member-wise copy**: it copies every data member of the existing object into the corresponding data member of the new object.

For the `Student` class, the default copy constructor behaves as if we wrote:

```{code-block} cpp
Student(const Student& other) {
  name = other.name;
  ID = other.ID;
}
```

This is exactly what we need for `Student`, so we did not have to write our own copy constructor, except to print a message.

**How is each data member copied?** Each data member is copied according to its own type. Consider the following class with an `int`, a `string` and a pointer to an `int`.

```{code-block} cpp
:linenos:
class Example {
  public:
    int id;
    string name;
    int* ptr;
    Example(int i, string n, int* p) {
      id = i;
      name = n;
      ptr = p;
    }
};

int main(void) {
  int value = 10;
  Example a(1, "Alice", &value);
  Example b(a); // Default copy constructor
  return 0;
}
```

In line 16, the default copy constructor creates `b` from `a`:

- `b.id` gets the value `1`.
- `b.name` gets **its own copy** of the characters `"Alice"`, because `string` has its own copy constructor that copies the characters. Changing `b.name` later does not change `a.name`.
- `b.ptr` gets the **same address** stored in `a.ptr`. Only the address is copied, so `a.ptr` and `b.ptr` point to the same `int`, `value`.

In the next section, we will see that copying only the address of a pointer is **not** what we want when the pointer points to dynamically allocated memory that the object owns.

## When the default copy constructor is not available

Stream objects, such as `cin` (an `istream`), `cout` (an `ostream`), file streams (`ifstream` and `ofstream`) and string streams (`stringstream`), **cannot be copied**. This is why, when a function takes a stream as a parameter, *e.g.* `operator<<` in the Operator Overloading chapter, we pass the stream by reference. **Why can't we pass a stream by value?** Passing an object by value calls its copy constructor (case 3 above). The copy constructor of the stream classes, *e.g.* `istream`, is **deleted**, which means it is declared, but calling it is a compile-time error.

```{code-block} cpp
void readData(istream input) { /* ... */ } // input would be a copy

int main(void) {
  readData(cin); // Error: the copy constructor of istream is deleted
  return 0;
}
```

The solution is to pass the stream by reference, *i.e.* `void readData(istream& input)`, so no copy is made.

Similarly, the compiler can only generate a default copy constructor if every data member can be copied. If a data member cannot be copied, such as a `stringstream`, the default copy constructor is **deleted**.

```{code-block} cpp
class Example {
  public:
    stringstream stream; // stringstream cannot be copied
};

int main(void) {
  Example a;    // OK: the default constructor is fine
  Example b(a); // Error: the default copy constructor is deleted
  return 0;
}
```

Copying `a` would require copying `a.stream`, which is not allowed. `g++` reports `error: use of deleted function 'Example::Example(const Example&)'`.

We can also delete the copy constructor **ourselves** when objects of a class should never be copied. We write `= delete` after its declaration:

```{code-block} cpp
class Example {
  public:
    // ... other members
    Example(const Example& other) = delete; // Forbid copying
};
```

Now any line that would call the copy constructor, *e.g.* `Example b(a);` or passing an `Example` object by value, causes a compile-time error.

## Why is the parameter a `const` reference?

The copy constructor takes its parameter as `const Student&`. Both the `&` and the `const` are important.

**<span style="color:red">Problem!</span>** What if we pass the existing object by value, *i.e.* `Student(Student other)`? Passing an object by value creates a copy of it (case 3 above). To create this copy, the copy constructor is called. This call passes its argument by value again, which calls the copy constructor again, and so on forever. The compiler does not allow this. For example, `clang++` reports:

<pre>
error: copy constructor must pass its first argument by reference
    Student(Student other) {
                    ^
                    const &
</pre>

**<span style="color:green">Solution.</span>** We pass the existing object by reference, `Student& other`, so no copy is needed to call the copy constructor.

We also make the reference `const` for two reasons:

- The copy constructor should not modify the object it copies from. `const` makes the compiler enforce this.
- It allows us to copy from `const` objects, *e.g.* `const Student a("Kenya", 8012); Student b = a;`. A non-`const` reference cannot refer to a `const` object, so without `const` this line would not compile.

````{admonition} Copy constructor or operator=?
Whether `=` calls the copy constructor or `operator=` depends on whether the object on the left-hand side is being created.

```{code-block} cpp
Student a("Kenya", 8012);
Student b = a; // b is being created: copy constructor
Student c("Cindy", 2023);
c = a;         // c already exists: operator=
```
````

**Check your understanding.** For each line below, decide whether it calls the copy constructor, `operator=`, or neither.

<choice-quiz>
<script type="application/json">
{
  "options": [
    "Copy constructor",
    "`operator=`",
    "Neither"
  ],
  "setup": "Student a(\"Kenya\", 8012);\nStudent c(\"Cindy\", 2023);\nvoid printStudent(Student s);\nvoid printRef(Student& s);\nStudent getCopy(Student& s);",
  "items": [
    {
      "code": "Student b(a);",
      "answer": 0,
      "why": "`b` is being created from `a` using parentheses (case 1)."
    },
    {
      "code": "c = a;",
      "answer": 1,
      "why": "`c` already exists, so this is an assignment: `c.operator=(a)`."
    },
    {
      "code": "Student b = a;",
      "answer": 0,
      "why": "Although `=` is used, `b` is being created in this line (case 2)."
    },
    {
      "code": "printStudent(a);",
      "answer": 0,
      "why": "`a` is passed by value, so the parameter `s` is created as a copy of `a` (case 3)."
    },
    {
      "code": "printRef(a);",
      "answer": 2,
      "why": "`a` is passed by reference, so `s` refers to `a` itself. No new object is created."
    },
    {
      "code": "Student d = getCopy(a);",
      "answer": 0,
      "why": "`getCopy` returns by value, so the returned object is created as a copy of `s` (case 4)."
    },
    {
      "code": "Student* p = &a;",
      "answer": 2,
      "why": "Only the address of `a` is stored in the pointer `p`. No `Student` object is created."
    },
    {
      "code": "Student* q = new Student(a);",
      "answer": 0,
      "why": "A new `Student` object is created on the heap from the existing object `a`, so the copy constructor is called."
    },
    {
      "code": "Student e(\"Ana\", 1234);",
      "answer": 2,
      "why": "`e` is created from a name and an ID, so the regular constructor `Student(string n, int id)` is called."
    }
  ]
}
</script>
</choice-quiz>

In the next section, we will see why the default copy constructor causes serious problems when a class has a pointer to dynamically allocated memory.
