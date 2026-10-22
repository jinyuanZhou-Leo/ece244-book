# Analyzing Code with Big-O

In this section, we find the Big-O bound of the worst-case running time of several pieces of code. In each example, we count how many times the constant-time work is repeated as a function of $n$.

## Example 1: Matrix addition

The following code adds the corresponding entries of two $n \times n$ integer matrices `A` and `B`, and stores the result in `C`.

```{code-block} cpp
:linenos:
// A, B, and C are already allocated n-by-n matrices.
for (int i = 0; i < n; ++i) {
  for (int j = 0; j < n; ++j) {
    C[i][j] = A[i][j] + B[i][j];
  }
}
```

- Each iteration of the inner loop performs constant work, $O(1)$.
- The inner loop runs $n$ times for each iteration of the outer loop.
- The outer loop runs $n$ times.

In total, line 4 is executed $n \times n = n^2$ times, so

$$T(n) = O(n^2).$$

## Example 2: A nested loop that depends on the outer loop

```{code-block} cpp
:linenos:
for (int i = 0; i < n; ++i) {
  for (int j = 0; j < i; ++j) {
    // Constant work: O(1)
  }
}
```

This time, the number of iterations of the inner loop depends on `i`: the inner loop runs `i` times for each iteration of the outer loop.

| `i` | $0$ | $1$ | $2$ | $\cdots$ | $n - 1$ |
|---|---|---|---|---|---|
| Executions of the inner-loop body | $0$ | $1$ | $2$ | $\cdots$ | $n - 1$ |

The total number of executions of the inner-loop body is

$$0 + 1 + 2 + \cdots + (n - 1) = \frac{n(n - 1)}{2} = \frac{1}{2}n^2 - \frac{1}{2}n.$$

The dominant term is $\frac{1}{2}n^2$, so

$$T(n) = O(n^2).$$

Although the inner loop runs fewer times than in Example 1, about half as many, the running time still grows quadratically.

## Example 3: A loop that halves its counter

```{code-block} cpp
:linenos:
int j = n;
do {
  // Constant work: O(1)
  j = j / 2;
} while (j > 0);
```

`j` is halved in each iteration using integer division, so it takes the values

$$n, \quad \lfloor n/2 \rfloor, \quad \lfloor n/4 \rfloor, \quad \ldots, \quad 1, \quad 0.$$

The loop stops when `j` becomes `0`. It runs $\lfloor \log_2 n \rfloor + 1$ times, with constant work per iteration, so

$$T(n) = O(\log n).$$

This is the same reason binary search is $O(\log n)$: the problem size is halved in each step.

## Example 4: A recursive function that halves its input

A recursive function calls itself on a smaller input until it reaches a base case. To analyze it, we count the work done in each call and the number of calls.

```{code-block} cpp
:linenos:
int rfunc(int n) {
  if (n <= 1) {
    return 1;
  } else {
    return rfunc(n / 2);
  }
}
```

Each call that is not a base case performs constant work, say $c$, and makes **one** recursive call on half of the input. The base case, $n \leq 1$, performs constant work, say $d$. We can describe the running time using a **recurrence**:

$$T(n) = c + T(n/2), \qquad T(1) = d.$$

To simplify the expansion, assume $n$ is a power of two. We expand the recurrence by substituting $T(n/2) = c + T(n/4)$, and so on:

$$
\begin{aligned}
T(n) &= c + T(n/2) \\
     &= 2c + T(n/4) \\
     &= 3c + T(n/8) \\
     &\;\;\vdots \\
     &= kc + T(n/2^k).
\end{aligned}
$$

The base case is reached when $n/2^k = 1$, so $k = \log_2 n$. Therefore,

$$T(n) = c \log_2 n + d = O(\log n).$$

The same growth bound holds for any positive $n$, not only for powers of two.

## Example 5: A recursive function with two recursive calls

```{code-block} cpp
:linenos:
int rfunc(int n) {
  if (n <= 1) {
    return 1;
  } else {
    return 3 * rfunc(n - 1) + rfunc(n - 1);
  }
}
```

Each call that is not a base case makes **two** recursive calls in line 5, each on an input of size $n - 1$. The multiplication by `3` is constant work: it does **not** create three recursive calls. The recurrence is

$$T(n) = c + 2T(n - 1), \qquad T(1) = d.$$

We expand the recurrence:

$$
\begin{aligned}
T(n) &= c + 2T(n - 1) \\
     &= 3c + 4T(n - 2) \\
     &= 7c + 8T(n - 3) \\
     &\;\;\vdots \\
     &= (2^k - 1)c + 2^k T(n - k).
\end{aligned}
$$

The base case is reached when $n - k = 1$, so $k = n - 1$. Therefore,

$$T(n) = (2^{n-1} - 1)c + 2^{n-1}d = O(2^n).$$

The number of calls doubles at each level of recursion, so the running time grows **exponentially**.

```{admonition} Avoid repeated recursive calls
:class: tip
Both recursive calls in Example 5 compute the same value, `rfunc(n - 1)`. If we call it once, store the result, and compute `4 * result`, there is only one recursive call per level, and the running time becomes $T(n) = c + T(n - 1) = O(n)$.
```

## Summary

In this chapter, we have learned:

- complexity analysis studies how the time or memory an algorithm needs grows with the input size $n$,
- linear search needs $n$ comparisons in the worst case, while binary search on a sorted array needs only about $\log_2 n$,
- the measured running time depends on the hardware, compiler, language and input, but the time complexity of the algorithm dominates for large inputs,
- asymptotic analysis focuses on growth as $n$ becomes very large, ignoring constant factors and lower-order terms,
- Big-O notation expresses an asymptotic upper bound: $T(n) = O(g(n))$ means $T(n)$ is at most a constant multiple of $g(n)$ for sufficiently large $n$, and
- how to find the Big-O bound of loops and recursive functions.

We will use these techniques to analyze the data structures and algorithms in the rest of this book.
