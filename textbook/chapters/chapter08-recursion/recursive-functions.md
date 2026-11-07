# Recursive Functions

## What is recursion?

A function can call itself. This is called **recursion**. Recursion solves a problem using the solution to a **smaller instance of the same problem**. A recursive function has two kinds of cases:

- A **base case** gives the answer directly, without another recursive call.
- A **recursive case** calls the function on a smaller problem, and uses its result.

Each recursive call must make progress toward a base case. Otherwise, the function would keep calling itself forever.

## Example 1: Factorial

For a nonnegative integer $n$, the factorial of $n$ is

$$
n! = n \times (n - 1) \times \cdots \times 2 \times 1, \quad \text{and} \quad 0! = 1.
$$

Notice that $(n - 1)! = (n - 1) \times \cdots \times 2 \times 1$ is part of $n!$. Therefore, the factorial of $n$ can be computed from the factorial of the smaller problem $n - 1$:

$$
n! =
\begin{cases}
1 & \text{if } n = 0 \text{ or } n = 1, \\
n \times (n - 1)! & \text{if } n > 1.
\end{cases}
$$

For example, $3! = 3 \times 2! = 3 \times 2 \times 1! = 3 \times 2 \times 1 = 6$.

```{code-block} cpp
:linenos:
int factorial(int n) {
  if (n == 0 || n == 1) {
    return 1;  // Base case.
  }
  return n * factorial(n - 1);  // Recursive case.
}
```

**Line 2 to 4.** The base case: $0! = 1! = 1$, so we return `1` without another recursive call.

**Line 5.** The recursive case: we call `factorial` on the smaller problem `n - 1`, and multiply its result by `n`. Each call decreases `n` by one, so we eventually reach the base case.

## What happens behind `f = factorial(3)`?

Recall from the Dynamic Memory Allocation chapter that local variables and parameters are stored in the **stack** region of the memory. Every time a function is called, a **stack frame** is pushed on the stack, which stores the local variables and parameters of that call. When the call returns, its stack frame is popped. This is why the stack of function calls is called the **call stack**:

- it is stored in the stack region of the memory, and
- like the stack data structure in the Linked Lists chapter, it is **Last In, First Out (LIFO)**: the function called last returns first.

Each recursive call has its own stack frame, so it has its **own** copy of the parameter `n`.

**First, the problem is reduced until we reach a base case.** `main` calls `factorial(3)`, which calls `factorial(2)`, which calls `factorial(1)`. Each earlier call waits for the call above it to return.

<pre>
Call stack (grows upward)

+--------------------------+
| factorial(1)    n = 1    |  active: return 1
+--------------------------+
| factorial(2)    n = 2    |  waits: 2 * factorial(1)
+--------------------------+
| factorial(3)    n = 3    |  waits: 3 * factorial(2)
+--------------------------+
| main()        f pending  |  waits to initialize f
+--------------------------+
</pre>

**Second, the base case returns, and consequently the other calls return** in the reverse order in which they were called:

<pre>
 Base case          After return 1     After return 2     Back in main

+--------------+
| factorial(1) |
| n = 1        |
+--------------+   +--------------+
| factorial(2) |   | factorial(2) |
| n = 2        |   | n = 2        |
+--------------+   +--------------+   +--------------+
| factorial(3) |   | factorial(3) |   | factorial(3) |
| n = 3        |   | n = 3        |   | n = 3        |
+--------------+   +--------------+   +--------------+   +--------------+
| main()       |   | main()       |   | main()       |   | main()       |
| f pending    |   | f pending    |   | f pending    |   | f = 6        |
+--------------+   +--------------+   +--------------+   +--------------+
   return 1          return 2 * 1       return 3 * 2       only main left
</pre>

**Time complexity.** `factorial(n)` makes $n$ calls in total: `factorial(n)`, `factorial(n - 1)`, ..., `factorial(1)`. Apart from its recursive call, each call does a constant amount of work: one comparison, and at most one multiplication. Therefore, `factorial(n)` is $O(n)$. We analyze more recursive functions in the Complexity Analysis chapter.

## Example 2: Sum of an array range

Given an array `a`, we want to sum the elements from index `left` through index `right`, inclusive. For example, for

```{code-block} cpp
int a[] = {1, 2, 3, 4, 5};
```

the sum from index `0` through index `4` is `15`. Let $S(\text{left}, \text{right})$ be the sum of that range. To find a smaller instance of the same problem, we take out the first element of the range:

- **Base case:** an empty range, *i.e.* $\text{left} > \text{right}$, has a sum of $0$.
- **Recursive case:** $S(\text{left}, \text{right}) = a[\text{left}] + S(\text{left} + 1, \text{right})$.

For example, $S(0, 4) = 1 + S(1, 4) = 1 + 2 + S(2, 4) = \cdots = 1 + 2 + 3 + 4 + 5 + S(5, 4) = 15 + 0 = 15$.

```{code-block} cpp
:linenos:
int sumOfArray(const int a[], int left, int right) {
  if (left > right) {
    return 0;  // Empty range.
  }
  return a[left] + sumOfArray(a, left + 1, right);
}
```

**Line 2 to 4.** The base case: the range is empty, so its sum is `0`.

**Line 5.** The recursive case: the range from `left + 1` through `right` has one element less, so each call makes progress toward the base case.

**Time complexity.** Let $n = \text{right} - \text{left} + 1$ be the number of elements in the range. There are $n + 1$ calls, including the call with the empty range, and each call does a constant amount of work apart from its recursive call. Therefore, `sumOfArray` is $O(n)$.

## Putting it all together

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="19 20 21 22 23 24" output="6
1 120
15
9">
&#35;include &lt;iostream&gt;
using namespace std;
<br>
int factorial(int n) {
  if (n == 0 || n == 1) {
    return 1;  // Base case.
  }
  return n * factorial(n - 1);  // Recursive case.
}
<br>
int sumOfArray(const int a[], int left, int right) {
  if (left &gt; right) {
    return 0;  // Empty range.
  }
  return a[left] + sumOfArray(a, left + 1, right);
}
<br>
int main(void) {
  int f = factorial(3);
  cout &lt;&lt; f &lt;&lt; endl;
  cout &lt;&lt; factorial(0) &lt;&lt; " " &lt;&lt; factorial(5) &lt;&lt; endl;
  int a[] = {1, 2, 3, 4, 5};
  cout &lt;&lt; sumOfArray(a, 0, 4) &lt;&lt; endl;
  cout &lt;&lt; sumOfArray(a, 1, 3) &lt;&lt; endl;
  return 0;
}
</code-runner>
</pre>

**[Line 19 and 20]** `factorial(3)` returns `3 * 2 * 1 = 6`, as we traced above.

**[Line 21]** `factorial(0)` reaches the base case immediately, and `factorial(5)` is `5 * 4 * 3 * 2 * 1 = 120`.

**[Line 23 and 24]** The sum of the whole array is `1 + 2 + 3 + 4 + 5 = 15`, and the sum from index `1` through index `3` is `2 + 3 + 4 = 9`.

**Output**
<pre>
6
1 120
15
9
</pre>

## Termination of recursive functions

To make sure that a recursive function always terminates, two conditions should hold:

1. **Base cases return directly.** They solve the simplest inputs without making another recursive call.
2. **All other cases progress toward a base case.** Each recursive call reduces the remaining problem, so a base case is reached after a finite number of calls.

**<span style="color:red">Problem: What if a recursive call does not progress toward a base case?</span>** For example, `factorial(-1)` is not a base case, and it calls `factorial(-2)`, which calls `factorial(-3)`, and so on, moving away from the base cases. Similarly, if we wrote `sumOfArray(a, left, right)` in line 5 instead of `sumOfArray(a, left + 1, right)`, the range would never get smaller. In both cases, the function keeps calling itself, and every call pushes a new stack frame. The call stack eventually runs out of memory, which is called a **stack overflow**, and the program usually crashes. This is why `factorial` is defined only for nonnegative integers.

```{admonition} Looking ahead: Quicksort
:class: note
**Sorting** rearranges the elements of an array in order, *e.g.* `7 2 9 2 5 1` becomes `1 2 2 5 7 9`. A famous sorting algorithm, **quicksort**, is recursive. It was invented by Tony Hoare, who graduated from Oxford in 1956 with a degree in classics, and developed quicksort in 1959 while studying machine translation in Moscow. A Russian-to-English dictionary was sorted alphabetically and stored on magnetic tape. Looking up the words of a sentence in their original order could require scanning the tape many times, but if the words are sorted first, then one forward scan of the tape finds all their translations. Hoare received the ACM Turing Award in 1980, and in 2000, quicksort was included in the Top Ten Algorithms of the Century, together with the Monte Carlo method, the Fortran compiler and the Fast Fourier Transform (FFT).
```

## Summary

In this section, we have learned:

- a recursive function solves a problem using the solution to a smaller instance of the same problem,
- a recursive function has base cases, which return directly, and recursive cases, which call the function on a smaller problem,
- every call has its own stack frame on the call stack, which is Last In, First Out,
- the time complexity of a recursive function can be found by counting the calls and the work done in each call, *e.g.* `factorial(n)` and `sumOfArray` are $O(n)$, and
- to terminate, a recursive function needs base cases, and every other case must progress toward a base case.
