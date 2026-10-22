# Big-O Notation

In the previous section, we counted the comparisons of linear search and binary search. In this section, we count operations more formally, and we introduce the **Big-O notation** to describe how the number of operations grows with the input size.

## Estimating the running time $T(n)$

We write $T(n)$ for the **estimated running time** of an algorithm as a function of its input size $n$. For an algorithm that works on an array, $n$ is usually the number of elements in the array.

We treat simple operations, such as integer arithmetic, array indexing, comparisons and assignments, as **constant-time operations**: they take the same time regardless of $n$. We count each of them as $1$. For example, each of the following has an estimated running time of $1$:

```{code-block} cpp
int i = 1;
a = b + c;
x < y;
```

### Example: computing a sum

Let's estimate $T(n)$ for the following code that computes $0 + 1 + \cdots + (n - 1)$.

```{code-block} cpp
:linenos:
int sum = 0;
for (int i = 0; i < n; ++i) {
  sum += i;
}
```

We count how many times each operation is executed:

| Operation | Executions |
|---|---|
| Initialize `sum` and `i` | $2$ |
| Test `i < n`, including the final test that fails | $n + 1$ |
| Increment `i` | $n$ |
| Update `sum` | $n$ |

Adding them up, we get

$$T(n) = 2 + (n + 1) + n + n = 3n + 3.$$

### Example: linear search

```{code-block} cpp
:linenos:
for (int i = 0; i < n; ++i) {
  if (a[i] == x) {
    return true;
  }
}
return false;
```

The number of operations depends on the input, not only on $n$:

- **Best case:** the first element matches. We initialize `i`, test `i < n` once, compare `a[0] == x` once, and return, so $T(n) = 4$.
- **Worst case:** `x` is not in the array. We initialize `i` once, test `i < n` $n + 1$ times, increment `i` $n$ times, compare `a[i] == x` $n$ times, and return once, so $T(n) = 1 + (n + 1) + n + n + 1 = 3n + 3$.
- **Average case:** if `x` is in the array and equally likely to be at each position, we check about half of the elements on average, so $T(n) \approx (3n + 3)/2$.

In this chapter, we will usually analyze the **worst case**, since it gives a guarantee: the algorithm never takes longer than that.

## Asymptotic analysis

**Which of the following running times is the worst (largest)?**

- $3n + 3$
- $2n + 100$
- $n^2$
- $2^n$

For small $n$, $2n + 100$ is the largest. But as $n$ grows, $2^n$ becomes much larger than all the others. **What truly makes a difference is the highest-order term, as it dominates when $n$ is very large.**

**Asymptotic** means describing the behavior as the input size approaches infinity ($n \to \infty$). **Asymptotic analysis** studies how the running time grows as $n$ becomes very large. It focuses on the **dominant term**, and ignores constant factors and lower-order terms. For example, $T(n) = 3n^2 + 10n + 5$ has **quadratic** growth, because the $n^2$ term eventually dominates. Asymptotic analysis helps us compare how algorithms **scale** as their inputs grow.

## Big-O notation

**Big-O notation** expresses an **asymptotic upper bound** on the running time. We write

$$T(n) = O(g(n))$$

if, for sufficiently large $n$, $T(n)$ is at most a constant multiple of $g(n)$. $g(n)$ is a simple function, such as $1$, $\log_2 n$, $n$, $n \log_2 n$, $n^2$ or $2^n$.

For example, for every $n \geq 1$, $10n \leq 10n^2$ and $5 \leq 5n^2$, so

$$T(n) = 3n^2 + 10n + 5 \leq 3n^2 + 10n^2 + 5n^2 = 18n^2.$$

$T(n)$ is at most $18$ times $n^2$, therefore

$$T(n) = O(n^2).$$

This reads as "$T$ of $n$ is Big-O of $n$ squared."

```{admonition} Big-O is a growth bound
:class: warning
Big-O describes how the running time **grows** with $n$. It is not an exact count of operations, and it is not a time in seconds.
```

In practice, to find the Big-O bound of a running time, **keep the dominant term and drop its constant coefficient**:

| Running time $T(n)$ | Dominant term | Big-O bound |
|---|---|---|
| $1$ | $1$ | $O(1)$ |
| $2 + 3n$ | $3n$ | $O(n)$ |
| $3n^2 + n + 1$ | $3n^2$ | $O(n^2)$ |
| $10000n^2 + 2n \log n + n^3$ | $n^3$ | $O(n^3)$ |

In the last row, even with a large coefficient on $n^2$, the $n^3$ term eventually dominates. For example, the sum and linear search examples above have $T(n) = 3n + 3 = O(n)$ in the worst case, and binary search needs about $\log_2 n$ comparisons, so it is $O(\log n)$ in the worst case.

## Which term is more dominant?

The following table shows the value of common functions for a few input sizes.

| $n$ | $\log_2 n$ | $n$ | $n \log_2 n$ | $n^2$ | $n^3$ | $2^n$ |
|---|---|---|---|---|---|---|
| $8$ | $3$ | $8$ | $24$ | $64$ | $512$ | $256$ |
| $16$ | $4$ | $16$ | $64$ | $256$ | $4096$ | $65{,}536$ |
| $32$ | $5$ | $32$ | $160$ | $1024$ | $32{,}768$ | $\approx 4.3 \times 10^9$ |
| $1024$ | $10$ | $1024$ | $10{,}240$ | $\approx 10^6$ | $\approx 10^9$ | $\approx 10^{308}$ |

For sufficiently large $n$, the functions are in increasing order of growth:

$$\log n < n < n \log n < n^2 < n^3 < 2^n.$$

An $O(\log n)$ algorithm scales much better than an $O(n)$ algorithm, which scales much better than an $O(n^2)$ algorithm, and an $O(2^n)$ algorithm quickly becomes impractical, even for inputs of a few dozen elements.

In the next section, we will find the Big-O bound of several pieces of code, including loops and recursive functions.
