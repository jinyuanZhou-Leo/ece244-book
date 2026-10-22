# What is Complexity Analysis?

An **algorithm** is a sequence of steps for solving a problem, *e.g.* searching for a value in an array of $n$ elements. There is usually more than one algorithm that solves the same problem. **Complexity analysis** studies how the resources an algorithm needs grow with the **input size** $n$. There are two types of complexity:

- **Time complexity**: how the number of operations an algorithm needs grows with $n$.
- **Space complexity**: how the memory an algorithm needs grows with $n$.

In this chapter, we focus on time complexity. To see why it matters, let's compare two algorithms that search an array for a value.

## Linear search

**Linear search** checks the elements of the array one by one from left to right, until it finds the value or reaches the end of the array.

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="4 5 6 7 8 9 10" output="Found 11 after 4 comparisons
Found 23 after 8 comparisons
Did not find 3 after 8 comparisons">
&#35;include &lt;iostream&gt;
using namespace std;
<br>
bool linearSearch(int a[], int n, int x, int& comparisons) {
  comparisons = 0;
  for (int i = 0; i < n; i++) {
    comparisons++;
    if (a[i] == x) {
      return true;
    }
  }
  return false;
}
<br>
void search(int a[], int n, int x) {
  int comparisons;
  if (linearSearch(a, n, x, comparisons)) {
    cout << "Found " << x << " after " << comparisons << " comparisons" << endl;
  } else {
    cout << "Did not find " << x << " after " << comparisons << " comparisons" << endl;
  }
}
<br>
int main(void) {
  int a[8] = {2, 5, 8, 11, 14, 17, 20, 23};
  search(a, 8, 11);
  search(a, 8, 23);
  search(a, 8, 3);
  return 0;
}
</code-runner>
</pre>

**[Line 4 to 13]** `linearSearch` compares `x` with `a[0]`, `a[1]`, `a[2]`, and so on. It returns `true` as soon as it finds `x`, or `false` after it checks every element. We count the element comparisons in `comparisons`, which is passed by reference.

Searching for `11` in the array below takes 4 element comparisons:

<pre>
 Index:    0    1    2    3    4    5    6    7
        +----+----+----+----+----+----+----+----+
 Value: |  2 |  5 |  8 | 11 | 14 | 17 | 20 | 23 |
        +----+----+----+----+----+----+----+----+
           ↑    ↑    ↑    ↑
 Check:   !=   !=   !=   ==
</pre>

**How many comparisons does linear search need in an array of $n$ elements?**

- **Best case:** the first element matches, so we need only **one** element comparison.
- **Worst case:** the value is the last element or is not in the array, so we need $n$ element comparisons.

## Binary search

If the array is **sorted** in ascending order, we can do much better. **Binary search** works as follows:

1. Compare the value with the **middle** element of the search range, which is initially the whole array.
2. If the value equals the middle element, it is found.
3. If the value is smaller than the middle element, it can only be in the left half, so we continue searching the left half.
4. If the value is larger than the middle element, it can only be in the right half, so we continue searching the right half.

For example, searching for `11` in the same sorted array takes only 3 comparisons:

<pre>
 Index:    0    1    2    3    4    5    6    7
        +----+----+----+----+----+----+----+----+
 Value: |  2 |  5 |  8 | 11 | 14 | 17 | 20 | 23 |
        +----+----+----+----+----+----+----+----+

 First comparison:  11 < a[4], continue in a[0..3]
 Second comparison: 11 > a[2], continue in a[3..3]
 Third comparison:  11 == a[3], found!
</pre>

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19" output="Found 11 after 3 comparisons
Found 23 after 3 comparisons
Did not find 3 after 4 comparisons">
&#35;include &lt;iostream&gt;
using namespace std;
<br>
bool binarySearch(int a[], int n, int x, int& comparisons) {
  comparisons = 0;
  int low = 0;
  int high = n - 1;
  while (low <= high) {
    int mid = (low + high + 1) / 2;
    comparisons++;
    if (x == a[mid]) {
      return true;
    } else if (x < a[mid]) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return false;
}
<br>
void search(int a[], int n, int x) {
  int comparisons;
  if (binarySearch(a, n, x, comparisons)) {
    cout << "Found " << x << " after " << comparisons << " comparisons" << endl;
  } else {
    cout << "Did not find " << x << " after " << comparisons << " comparisons" << endl;
  }
}
<br>
int main(void) {
  int a[8] = {2, 5, 8, 11, 14, 17, 20, 23};
  search(a, 8, 11);
  search(a, 8, 23);
  search(a, 8, 3);
  return 0;
}
</code-runner>
</pre>

**[Line 6 and 7]** The search range is from index `low` to index `high`. Initially, it is the whole array.

**[Line 9]** `mid` is the index of the middle element of the search range. When the range has an even number of elements, there are two middle elements, and we pick the right one, *e.g.* index 4 for the range 0 to 7, as in the example above.

**[Line 11 to 17]** If `x` equals `a[mid]`, we found it. Otherwise, we shrink the search range to its left half or its right half. In this implementation, each iteration compares `x` with one element, `a[mid]`, so we count it as one comparison.

**[Line 8]** If the search range becomes empty, *i.e.* `low > high`, `x` is not in the array.

**How many comparisons does binary search need in an array of $n$ elements?**

- **Best case:** the middle element matches, so we need only **one** comparison.
- **Worst case:** the search continues until there is only one element left in the search range. Each comparison **halves** the search range:
  - After 1 comparison, the search range has $n/2 = n/2^1$ elements.
  - After 2 comparisons, the search range has $n/4 = n/2^2$ elements.
  - ...
  - After $k$ comparisons, the search range has about $n/2^k$ elements.

  The search range has one element left when $n/2^k \approx 1$, *i.e.* $2^k \approx n$, so $k \approx \log_2 n$. In the worst case, binary search needs approximately $\log_2 n$ comparisons.

The worst-case number of comparisons of linear search grows **linearly** with $n$, while that of binary search grows **logarithmically** with $n$. For an array of one million elements, linear search may need one million comparisons, while binary search needs only about 20, since $2^{20} \approx 10^6$.

## Why not just measure the running time?

**Why do we count operations instead of measuring the running time of a program in seconds?** The measured running time of a program depends on many things other than the algorithm:

- the hardware, *e.g.* a faster or slower computer,
- the compiler,
- the programming language, and
- the input.

However, the choice of algorithm matters, especially for large inputs. Suppose we run linear search on a **faster** computer, and binary search on a much **slower** computer, and we measure the worst-case running time:

| Input size $n$ | Linear search: faster computer | Binary search: slower computer |
|---|---|---|
| $10$ | $10$ ns | $1000$ ns |
| $1000$ | $1000$ ns | $3000$ ns |
| $10{,}000{,}000$ | $10{,}000{,}000$ ns | $7000$ ns |

For small inputs, the faster computer wins. As the input size grows, binary search wins, even though it runs on the slower computer. **The time complexity of the algorithm matters as the input size increases.**

In short:

- **Measurements** evaluate how an implementation performs for a given input on a given computer.
- **Complexity analysis** predicts how an algorithm performs for large inputs, regardless of the computer.

In the next section, we will make this idea more formal.
