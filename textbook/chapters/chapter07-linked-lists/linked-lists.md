# From Arrays to Linked Lists

## Why linked lists?

An array has a **fixed size**. For example, the following array can store exactly 3 integers:

```{code-block} cpp
int arr[3] = {1, 2, 3};
```

Even if we allocate the array dynamically, *e.g.* `int* arr = new int[3];`, its size cannot change after it is allocated. If we need space for more elements, we have to allocate a new, larger array, copy every element into it, and free the old array. Copying $n$ elements takes time that grows with $n$.

This is where **linked lists** are helpful. A linked list grows and shrinks one element at a time, without copying the other elements.

## What is a linked list?

A **linked list** is a collection of **nodes** that are linked together by pointers. Each node stores:

- **data**, *e.g.* an integer, and
- a pointer **next** to the next node in the list.

The pointer `head` points to the first node, and the `next` of the last node is `nullptr`, which marks the end of the list.

<pre>
 head
   |
   v
 +------+------+     +------+------+     +------+---------+
 | data | next |     | data | next |     | data | next    |
 |  1   |  ----+---->|  2   |  ----+---->|  3   | nullptr |
 +------+------+     +------+------+     +------+---------+
</pre>

Unlike the elements of an array, the nodes of a linked list are not next to each other in memory. Each node is dynamically allocated on its own, and the `next` pointers connect them in order.

## A `Node` class

We define a node as a class in C++.

**Code in `node.h`**
```{code-block} cpp
:linenos:
class Node {
  private:
    int data;
    Node* next;

  public:
    Node(int d, Node* n) { data = d; next = n; }
    ~Node() { delete next; }
    int getData() { return data; }
    Node* getNext() { return next; }
    void setData(int d) { data = d; }
    void setNext(Node* n) { next = n; }
};
```

**Line 3 and 4.** Each node stores an integer `data` and a pointer `next` to the next node.

**Line 7.** The constructor initializes both data members. To create a node that is not linked to another node, we pass `nullptr` as `n`.

**Line 8.** The destructor deletes the next node. As we discussed in the Dynamic Memory Allocation chapter, `delete next;` calls the destructor of the next node, which deletes the node after it, and so on. Therefore, deleting the first node deletes **every** node in the list, from the last node back to the first. The `next` of the last node is `nullptr`, and `delete nullptr;` is safe and does nothing, so the recursion stops at the last node.

**Line 9 to 12.** Since `data` and `next` are private, we provide getters and setters.

```{admonition} Be careful when deleting a single node
:class: warning
Since the destructor of `Node` deletes the next node, `delete p;` deletes the node that `p` points to **and all nodes after it**. To delete only one node, we must first set its `next` to `nullptr`, *e.g.* `p->setNext(nullptr);`. We will see why this matters in the next two sections.
```

There are many variants of linked lists. In the next two sections, we use `Node` to build two of them: a **stack** and a **queue**.
