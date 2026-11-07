# Ordered Linked Lists

In an **ordered linked list**, the values are stored in **nondecreasing** order from the head to the tail. Unlike a stack or a queue, we can insert or remove a node anywhere in the list, as long as the list stays ordered. An ordered linked list provides:

- `dataExists(d)`: search for the value `d`.
- `insertData(d)`: insert a new node that stores `d`, at the position that keeps the list ordered.
- `deleteData(d)`: remove the first node that stores `d`.
- a copy constructor and a copy assignment operator.

<pre>
         +---------+---------+     +---------+---------+
head --> | data: 1 | next: --+---->| data: 2 | next: --+--> ...
         +---------+---------+     +---------+---------+
</pre>

## The `OrderedList` class

Like a stack, an ordered linked list only needs a pointer to its first node, `head`. We use the `Node` class from the From Arrays to Linked Lists section.

**Code in `OrderedList.h`**
```{code-block} cpp
:linenos:
class OrderedList {
  private:
    Node* head;

  public:
    OrderedList() { head = nullptr; }
    ~OrderedList() { delete head; }
    bool dataExists(int d) const;
    void insertData(int d);
    bool deleteData(int d);
    OrderedList(const OrderedList& original);
    OrderedList& operator=(const OrderedList& original);
};
```

**Line 6 and 7.** As in `Stack`, an empty list has `head` equal to `nullptr`, and the destructor frees all the nodes by deleting the first one.

**Line 8.** `dataExists` does not change the list, so it is a `const` member function.

**Line 11 and 12.** The class owns dynamically allocated nodes and has a destructor, so by the Rule of Three it also needs its own copy constructor and copy assignment operator. We implement them at the end of this section.

## `dataExists`

```{code-block} cpp
:linenos:
bool OrderedList::dataExists(int d) const {
  Node* current = head;
  while (current != nullptr && current->getData() <= d) {
    if (current->getData() == d) {
      return true;
    }
    current = current->getNext();
  }
  return false;
}
```

**Line 2.** We start at the first node.

**Line 3.** We keep walking while there is a node, and its value is not larger than `d`. Since the list is ordered, once we reach a value larger than `d`, every value after it is also larger than `d`, so we can stop early. Note that the order of the two conditions matters: `&&` evaluates `current != nullptr` first, so we never call `current->getData()` on `nullptr`.

**Line 4 to 6.** If the current node stores `d`, we found it.

**Line 9.** We reached the end of the list or a larger value, so `d` is not in the list.

For example, searching for `3` in `[1, 3]` walks past `1` and returns `true` at the second node. Searching for `2` in `[1, 3]` walks past `1`, then stops at `3` because `3 <= 2` is false, and returns `false` without reaching the end of the list:

<pre>
Search for 2 in [1, 3]:

Step 1: start at the head.
         current
            |
            v
         +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+---->| data: 3 | next: nullptr |
         +---------+---------+     +---------+---------------+

Step 2: 1 <= 2 and 1 != 2, so advance.
                                       current
                                          |
                                          v
         +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+---->| data: 3 | next: nullptr |
         +---------+---------+     +---------+---------------+

Step 3: 3 <= 2 is false, so the loop stops and we return false.
</pre>

If the list is empty, `current` starts as `nullptr`, so we skip the loop and return `false`.

| Case | Result |
|---|---|
| Empty list | Return `false` immediately |
| Target smaller than the head value | Stop at the head; return `false` |
| Target equals the head value | Return `true` immediately |
| Target larger than every value | Visit every node; return `false` |

**Time complexity.** Let $n$ be the number of nodes. In the worst case, *e.g.* when the target is larger than every value, we visit all $n$ nodes, so `dataExists` is $O(n)$. In the best case, the list is empty or the head stores the target, so it is $O(1)$.

```{admonition} Why not binary search?
:class: note
The values are sorted, and we saw in the Complexity Analysis chapter that binary search on a sorted array is $O(\log n)$, which is better than the $O(n)$ of linear search. However, binary search needs to jump to the middle element. An array supports **random access**: `arr[i]` takes $O(1)$ time. A linked list does not: to reach the middle node, we have to follow $n/2$ `next` pointers from the head, which already takes $O(n)$ time. Therefore, binary search does not help on a linked list.
```

## `insertData`

```{code-block} cpp
:linenos:
void OrderedList::insertData(int d) {
  Node* previous = nullptr;
  Node* current = head;
  while (current != nullptr && current->getData() < d) {
    previous = current;
    current = current->getNext();
  }
  Node* new_node = new Node(d, current);
  if (previous == nullptr) {
    head = new_node;
  } else {
    previous->setNext(new_node);
  }
}
```

To insert a node, we need to change the `next` of the node **before** the insertion position. Since a node only points to the node after it, we walk through the list with two pointers: `current`, and `previous`, which is always one node behind `current`.

**Line 4 to 7.** We advance both pointers while the value of `current` is smaller than `d`. When the loop stops, the new node belongs between `previous` and `current`. Note that we use `<`, and not `<=`: if `d` is already in the list, we stop at the first node that stores `d`, so the new node is inserted **before** the first equal value.

**Line 8.** The new node stores `d`, and its `next` points to `current`. If `current` is `nullptr`, the new node becomes the last node.

**Line 9 to 13.** If `previous` is `nullptr`, the loop did not advance, so the new node is the new first node and `head` must point to it. Otherwise, we link `previous` to the new node.

<pre>
Insert 2 into [1, 3]:

Step 1: locate the insertion position.
         previous                  current
            |                         |
            v                         v
         +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+---->| data: 3 | next: nullptr |
         +---------+---------+     +---------+---------------+

Step 2: Node* new_node = new Node(d, current);
         previous                  current
            |                         |
            v                         v
         +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+---->| data: 3 | next: nullptr |
         +---------+---------+     +---------+---------------+
                                      ^
                                      |
             +---------+---------+    |
new_node --> | data: 2 | next: --+----+
             +---------+---------+

Step 3: previous->setNext(new_node);
         +---------+---------+     +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+---->| data: 2 | next: --+---->| data: 3 | next: nullptr |
         +---------+---------+     +---------+---------+     +---------+---------------+
</pre>

**What if the new value belongs before the head?** For example, to insert `2` into `[3]`, the loop is skipped because `3 < 2` is false, so `previous` is still `nullptr`. The new node points to the old first node, and `head` moves to the new node:

<pre>
Insert 2 into [3]:
previous: nullptr                  current
                                      |
                                      v
         +---------+---------+     +---------+---------------+
head --> | data: 2 | next: --+---->| data: 3 | next: nullptr |
         +---------+---------+     +---------+---------------+
</pre>

**What if the list is empty?** Both `previous` and `current` are `nullptr`, so the new node's `next` is `nullptr`, and `head` points to it. The same code handles both cases.

| Case | Result |
|---|---|
| Empty list | `head` points to the new node; its `next` is `nullptr` |
| Value smaller than the head value | Insert at the front and update `head` |
| Value larger than every value | Append at the tail; the new node's `next` is `nullptr` |
| Duplicate value | Insert before the first equal value |

**Time complexity.** In the worst case, *e.g.* when the new value is larger than every value, we walk through all $n$ nodes to find the insertion position, so `insertData` is $O(n)$. In the best case, the list is empty or the new value belongs before the head, so it is $O(1)$.

## `deleteData`

```{code-block} cpp
:linenos:
bool OrderedList::deleteData(int d) {
  Node* previous = nullptr;
  Node* current = head;
  while (current != nullptr && current->getData() < d) {
    previous = current;
    current = current->getNext();
  }
  if (current == nullptr || current->getData() != d) {
    return false;
  }
  if (previous == nullptr) {
    head = current->getNext();
  } else {
    previous->setNext(current->getNext());
  }
  current->setNext(nullptr);
  delete current;
  return true;
}
```

**Line 2 to 7.** The same loop as in `insertData` stops at the first node whose value is not smaller than `d`, with `previous` one node behind.

**Line 8 to 10.** If we reached the end of the list, or the value of `current` is larger than `d`, then `d` is not in the list. We return `false` without changing any link.

**Line 11 to 15.** We unlink `current`. If it is the first node, `head` moves to the second node. Otherwise, `previous` is linked to the node after `current`. If `current` is the last node, `current->getNext()` is `nullptr`, so `previous` becomes the new last node.

**Line 16 and 17.** As in `pop` and `dequeue`, we must detach `current` before deleting it. Otherwise, the destructor of `Node` would also delete every node after it.

<pre>
Delete 2 from [1, 2, 4]:

Step 1: locate the matching node.
         previous                  current
            |                         |
            v                         v
         +---------+---------+     +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+---->| data: 2 | next: --+---->| data: 4 | next: nullptr |
         +---------+---------+     +---------+---------+     +---------+---------------+

Step 2: previous->setNext(current->getNext());
                               +------------------------------+
                               |                              v
         +---------+---------+ |   +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+-+   | data: 2 | next: --+---->| data: 4 | next: nullptr |
         +---------+---------+     +---------+---------+     +---------+---------------+
             previous                  current

Step 3: current->setNext(nullptr);

Step 4: delete current; return true;
         +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+---->| data: 4 | next: nullptr |
         +---------+---------+     +---------+---------------+
</pre>

| Case | Result |
|---|---|
| Empty list | Return `false` |
| Target absent | Return `false`; change no links |
| Remove the head | Advance `head` |
| Remove the only node | `head` becomes `nullptr` |
| Remove the tail | The predecessor's `next` becomes `nullptr` |
| Repeated equal values | Remove only the first matching node |

**Time complexity.** In the worst case, *e.g.* when the target is larger than every value, we walk through all $n$ nodes, so `deleteData` is $O(n)$. In the best case, the list is empty or the target is at the head, so it is $O(1)$.

## Copy constructor

Recall from the Objects with Pointers chapter that the default copy constructor copies each data member. For `OrderedList`, it copies the pointer `head`, and not the nodes: a **shallow copy**. Both lists would share the same nodes, so when one list is destroyed, the other list's `head` becomes a dangling pointer, and the nodes would be deleted twice when the other list is destroyed.

<pre>
OrderedList b = a;   // shallow copy (default copy constructor)

           +---------+---------+     +---------+---------------+
a.head --> | data: 1 | next: --+---->| data: 3 | next: nullptr |
           +---------+---------+     +---------+---------------+
           ^
           |
b.head ----+

OrderedList b = a;   // deep copy (our copy constructor)

           +---------+---------+     +---------+---------------+
a.head --> | data: 1 | next: --+---->| data: 3 | next: nullptr |
           +---------+---------+     +---------+---------------+

           +---------+---------+     +---------+---------------+
b.head --> | data: 1 | next: --+---->| data: 3 | next: nullptr |
           +---------+---------+     +---------+---------------+
</pre>

Our copy constructor makes a **deep copy**: it allocates a new node for every node of `original`, in the same order.

```{code-block} cpp
:linenos:
OrderedList::OrderedList(const OrderedList& original) {
  Node* cur_orig = original.head;
  Node* cur_copy = nullptr;
  Node* prev_copy = nullptr;
  head = nullptr;
  while (cur_orig != nullptr) {
    cur_copy = new Node(cur_orig->getData(), nullptr);
    if (prev_copy == nullptr) {
      head = cur_copy;
    } else {
      prev_copy->setNext(cur_copy);
    }
    cur_orig = cur_orig->getNext();
    prev_copy = cur_copy;
  }
}
```

**Line 2 to 5.** `cur_orig` walks through the original list. `prev_copy` points to the last node of the new list built so far. The new list starts empty.

**Line 7.** We allocate a copy of the current original node. For now, it is the last node of the new list, so its `next` is `nullptr`.

**Line 8 to 12.** If this is the first copied node, `head` points to it. Otherwise, we append it after the last copied node.

**Line 13 and 14.** We advance to the next original node, and the node we just copied becomes the last node of the new list.

<pre>
Copy [1, 3]:

After copying the first node:
             cur_orig
               |
               v
           +---------+---------+     +---------+---------------+
a.head --> | data: 1 | next: --+---->| data: 3 | next: nullptr |
           +---------+---------+     +---------+---------------+

           +---------+---------------+
b.head --> | data: 1 | next: nullptr |
           +---------+---------------+
               ^
               |
         prev_copy, cur_copy

After copying the second node, and advancing:     cur_orig: nullptr
           +---------+---------+     +---------+---------------+
a.head --> | data: 1 | next: --+---->| data: 3 | next: nullptr |
           +---------+---------+     +---------+---------------+

           +---------+---------+     +---------+---------------+
b.head --> | data: 1 | next: --+---->| data: 3 | next: nullptr |
           +---------+---------+     +---------+---------------+
                                         ^
                                         |
                                   prev_copy, cur_copy
</pre>

If `original` is empty, `cur_orig` starts as `nullptr`, the loop is skipped, and the new list is empty.

**Time complexity.** For an original list of $n$ nodes, we visit every node and allocate one copy of each, so the copy constructor is $O(n)$ in **both** the best case and the worst case: every node must be copied.

## Copy assignment operator

The copy assignment operator replaces the nodes of an **existing** list with a deep copy of another list. One way is to free the old nodes, and then repeat the code of the copy constructor:

```{code-block} cpp
:linenos:
OrderedList& OrderedList::operator=(const OrderedList& original) {
  if (this == &original) {
    return *this;  // self-assignment
  }
  delete head;  // free the old list
  // begin code copied directly from the copy constructor
  Node* cur_orig = original.head;
  Node* cur_copy = nullptr;
  Node* prev_copy = nullptr;
  head = nullptr;
  while (cur_orig != nullptr) {
    cur_copy = new Node(cur_orig->getData(), nullptr);
    if (prev_copy == nullptr) {
      head = cur_copy;
    } else {
      prev_copy->setNext(cur_copy);
    }
    cur_orig = cur_orig->getNext();
    prev_copy = cur_copy;
  }
  // end code copied directly from the copy constructor
  return *this;  // assignment returns the destination
}
```

**Line 2 to 4.** As we discussed in the Objects with Pointers chapter, we must check for self-assignment, *e.g.* `a = a;`. Otherwise, line 5 would free the nodes of `original` before we copy them.

**Line 22.** We return the destination by reference, so that assignments can be chained, *e.g.* `a = b = c;`.

Repeating code is error-prone. Instead, we can let the copy constructor do the copying:

```{code-block} cpp
:linenos:
OrderedList& OrderedList::operator=(const OrderedList& original) {
  if (this == &original) {
    return *this;  // self-assignment
  }
  OrderedList new_list(original);  // call the copy constructor
  delete head;                     // free the old list
  head = new_list.head;            // take the copied nodes
  new_list.head = nullptr;         // detach new_list from the nodes
  return *this;
}
```

**Line 5.** `new_list` is a local deep copy of `original`.

**Line 6 and 7.** We free our old nodes, and take over the nodes of `new_list`.

**Line 8.** `new_list` is a local object, so its destructor is called when the function returns, and it deletes the nodes that `new_list.head` points to. By setting `new_list.head` to `nullptr`, its destructor runs `delete nullptr;`, which does nothing.

**<span style="color:red">Problem: What if we forget line 8?</span>** Then `head` and `new_list.head` point to the same nodes. When the function returns, the destructor of `new_list` deletes these nodes, so `head` becomes a **dangling pointer**. Any later use of the list is undefined behavior, and the nodes are deleted a second time when the list itself is destroyed.

**Time complexity.** Let $n$ be the number of nodes in `original`, and $m$ the number of old nodes in the destination. In the worst case, we copy $n$ nodes and delete $m$ nodes, so the copy assignment operator is $O(n + m)$. In the best case, *i.e.* self-assignment, the function returns immediately, so it is $O(1)$.

## The Rule of Three for `OrderedList`

| Operation | Responsibility |
|---|---|
| Destructor | Release the nodes that the list owns |
| Copy constructor | Build a new, independent list of nodes |
| Copy assignment operator | Replace the existing nodes with an independent copy |

## Putting it all together

The following program uses every member function of `OrderedList`. We added a member function `print` that prints the values in the list, so we can see its contents.

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131" output="1 1 3 4 
1 0
1 1 3 4 
1 3 4 
1 3 4 ">
&#35;include &lt;iostream&gt;
using namespace std;
<br>
class Node {
  private:
    int data;
    Node* next;
<br>
  public:
    Node(int d, Node* n) { data = d; next = n; }
    ~Node() { delete next; }
    int getData() const { return data; }
    Node* getNext() const { return next; }
    void setData(int d) { data = d; }
    void setNext(Node* n) { next = n; }
};
<br>
class OrderedList {
  private:
    Node* head;
<br>
  public:
    OrderedList() { head = nullptr; }
    ~OrderedList() { delete head; }
    bool dataExists(int d) const;
    void insertData(int d);
    bool deleteData(int d);
    OrderedList(const OrderedList&amp; original);
    OrderedList&amp; operator=(const OrderedList&amp; original);
    void print() const;
};
<br>
bool OrderedList::dataExists(int d) const {
  Node* current = head;
  while (current != nullptr &amp;&amp; current-&gt;getData() &lt;= d) {
    if (current-&gt;getData() == d) {
      return true;
    }
    current = current-&gt;getNext();
  }
  return false;
}
<br>
void OrderedList::insertData(int d) {
  Node* previous = nullptr;
  Node* current = head;
  while (current != nullptr &amp;&amp; current-&gt;getData() &lt; d) {
    previous = current;
    current = current-&gt;getNext();
  }
  Node* new_node = new Node(d, current);
  if (previous == nullptr) {
    head = new_node;
  } else {
    previous-&gt;setNext(new_node);
  }
}
<br>
bool OrderedList::deleteData(int d) {
  Node* previous = nullptr;
  Node* current = head;
  while (current != nullptr &amp;&amp; current-&gt;getData() &lt; d) {
    previous = current;
    current = current-&gt;getNext();
  }
  if (current == nullptr || current-&gt;getData() != d) {
    return false;
  }
  if (previous == nullptr) {
    head = current-&gt;getNext();
  } else {
    previous-&gt;setNext(current-&gt;getNext());
  }
  current-&gt;setNext(nullptr);
  delete current;
  return true;
}
<br>
OrderedList::OrderedList(const OrderedList&amp; original) {
  Node* cur_orig = original.head;
  Node* cur_copy = nullptr;
  Node* prev_copy = nullptr;
  head = nullptr;
  while (cur_orig != nullptr) {
    cur_copy = new Node(cur_orig-&gt;getData(), nullptr);
    if (prev_copy == nullptr) {
      head = cur_copy;
    } else {
      prev_copy-&gt;setNext(cur_copy);
    }
    cur_orig = cur_orig-&gt;getNext();
    prev_copy = cur_copy;
  }
}
<br>
OrderedList&amp; OrderedList::operator=(const OrderedList&amp; original) {
  if (this == &amp;original) {
    return *this;
  }
  OrderedList new_list(original);
  delete head;
  head = new_list.head;
  new_list.head = nullptr;
  return *this;
}
<br>
void OrderedList::print() const {
  for (Node* p = head; p != nullptr; p = p-&gt;getNext()) {
    cout &lt;&lt; p-&gt;getData() &lt;&lt; " ";
  }
  cout &lt;&lt; endl;
}
<br>
int main(void) {
  OrderedList a;
  a.insertData(3);
  a.insertData(1);
  a.insertData(4);
  a.insertData(1);
  a.print();
  cout &lt;&lt; a.dataExists(4) &lt;&lt; " " &lt;&lt; a.dataExists(2) &lt;&lt; endl;
  OrderedList b = a;
  b.deleteData(1);
  b.deleteData(5);
  a.print();
  b.print();
  a = b;
  a = a;
  a.print();
  return 0;
}
</code-runner>
</pre>

**[Line 115 to 120]** We insert `3`, `1`, `4` and `1` in an arbitrary order, but the list always stays ordered. The second `1` is inserted before the first `1`.

**[Line 121]** `4` is in the list and `2` is not. `cout` prints `true` as `1` and `false` as `0`.

**[Line 122 to 126]** `b` is a deep copy of `a`, so deleting the first `1` from `b` does not change `a`. Deleting `5` returns `false`, since `5` is not in `b`.

**[Line 127 and 128]** `a = b;` replaces the nodes of `a` with a copy of the nodes of `b`. `a = a;` is a self-assignment, so it does nothing.

**[Line 131]** When `a` and `b` go out of scope, their destructors free their own nodes. Since each list owns separate nodes, no node is deleted twice.

**Output**
<pre>
1 1 3 4
1 0
1 1 3 4
1 3 4
1 3 4
</pre>

## Time complexity

Let $n$ be the number of nodes in the list. For the copy assignment operator, the source list has $n$ nodes and the destination list has $m$ old nodes.

| Operation | Best case | Worst case |
|---|---|---|
| Search (`dataExists`) | $O(1)$ | $O(n)$ |
| Insert in order (`insertData`) | $O(1)$ | $O(n)$ |
| Delete by value (`deleteData`) | $O(1)$ | $O(n)$ |
| Copy constructor | $O(n)$ | $O(n)$ |
| Copy assignment operator | $O(1)$ | $O(n + m)$ |
| Destructor | $O(n)$ | $O(n)$ |

Unlike `push`, `pop`, `enqueue` and `dequeue`, which only work at the ends of a list, searching, inserting and deleting in an ordered list may need to walk through the whole list to find the right position.

## Summary

In this chapter, we have learned:

- a linked list is a collection of dynamically allocated nodes linked by pointers, which can grow and shrink without copying elements,
- the destructor of a node can delete the rest of the list, so we must detach a node before deleting it on its own,
- a stack inserts and removes at the head (LIFO), and a queue inserts at the tail and removes at the head (FIFO),
- an ordered linked list keeps its values sorted, and finds the position to insert or delete a node by walking through the list with a `previous` and a `current` pointer,
- a linked list does not support random access, so binary search does not help on a linked list,
- a class that owns the nodes of a linked list needs a destructor, a copy constructor and a copy assignment operator that make deep copies (the Rule of Three),
- to always think of the special cases: an empty list, a list with only one node, and changes at the head or the tail of the list, and
- `push`, `pop`, `enqueue` and `dequeue` are $O(1)$, searching, inserting and deleting in an ordered list are $O(n)$ in the worst case, and destroying or copying a list of $n$ nodes is $O(n)$.
