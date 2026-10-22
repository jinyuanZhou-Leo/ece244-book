# Queues: First In, First Out

A **queue** is a linked list where we insert nodes at the **tail** and remove nodes at the **head**. Think of a line of people waiting at a store: new people join at the end of the line, and the person at the front is served first. This is called **FIFO: First In, First Out**. A queue has two operations:

- `enqueue(d)`: insert the value `d` at the tail.
- `dequeue()`: remove and return the oldest value, which is at the head.

For example, after `q.enqueue(1); q.enqueue(2);`, the queue looks like this, and the next `q.dequeue()` returns `1`:

<pre>
         +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+---->| data: 2 | next: nullptr | <-- tail
         +---------+---------+     +---------+---------------+
</pre>

Unlike a stack, a queue inserts and removes at **different** ends.

## The `Queue` class

To insert at the tail without walking through the whole list, a queue keeps a second pointer, `tail`, to its last node. We use the `Node` class from the From Arrays to Linked Lists section.

**Code in `queue.h`**
```{code-block} cpp
:linenos:
class Queue {
  private:
    Node* head;
    Node* tail;

  public:
    Queue() { head = nullptr; tail = nullptr; }
    ~Queue() { delete head; }
    void enqueue(int d);
    int dequeue();
};
```

**Line 7.** An empty queue has no nodes, so both `head` and `tail` are `nullptr`.

**Line 8.** Like the destructor of `Stack`, deleting the first node frees all the nodes in the queue.

## `enqueue`

```{code-block} cpp
:linenos:
void Queue::enqueue(int d) {
  Node* new_tail = new Node(d, nullptr);
  if (tail != nullptr) {
    tail->setNext(new_tail);
  }
  tail = new_tail;
  if (head == nullptr) {
    head = new_tail;
  }
}
```

**Line 2.** The new node will be the last node, so its `next` is `nullptr`.

**Line 3 to 5.** If the queue is not empty, we link the old last node to the new node.

**Line 6.** `tail` points to the new last node.

**Line 7 to 9.** If the queue was empty, the new node is also the first node, so `head` points to it too.

<pre>
Enqueue into a nonempty queue:

Before q.enqueue(2):
         +---------+---------------+
head --> | data: 1 | next: nullptr | <-- tail
         +---------+---------------+

After q.enqueue(2):
         +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+---->| data: 2 | next: nullptr | <-- tail
         +---------+---------+     +---------+---------------+

Enqueue into an empty queue:

Before q.enqueue(1):  head: nullptr    tail: nullptr

After q.enqueue(1):
         +---------+---------------+
head --> | data: 1 | next: nullptr | <-- tail
         +---------+---------------+
</pre>

## `dequeue`

```{code-block} cpp
:linenos:
int Queue::dequeue() {
  if (head == nullptr) {
    return -1;
  }
  Node* old_head = head;
  int d = old_head->getData();
  head = old_head->getNext();
  if (head == nullptr) {
    tail = nullptr;
  }
  old_head->setNext(nullptr);
  delete old_head;
  return d;
}
```

`dequeue` is the same as `pop` of a stack, except for lines 8 to 10.

**Line 2 to 4.** If the queue is empty, we return `-1`.

**Line 5 to 7.** We save the data of the first node, and `head` moves to the second node.

**Line 8 to 10.** If we removed the only node, the queue is now empty, so `tail` must become `nullptr` too.

**Line 11 to 13.** We detach the old first node, delete it, and return its data.

<pre>
Dequeue from a queue with two nodes:

Before q.dequeue():
         +---------+---------+     +---------+---------------+
head --> | data: 1 | next: --+---->| data: 2 | next: nullptr | <-- tail
         +---------+---------+     +---------+---------------+

After q.dequeue() returns 1:
                              +---------+---------------+
                     head --> | data: 2 | next: nullptr | <-- tail
                              +---------+---------------+

Dequeue when there is only one node:

Before q.dequeue():
         +---------+---------------+
head --> | data: 1 | next: nullptr | <-- tail
         +---------+---------------+

After q.dequeue() returns 1:  head: nullptr    tail: nullptr
</pre>

Like `pop`, `dequeue` must check whether `head` is `nullptr` before dereferencing it, and must call `old_head->setNext(nullptr)` before `delete old_head;`. Otherwise, it dereferences `nullptr` on an empty queue, or deletes the entire linked list.

**<span style="color:red">Problem: What if we do not reset `tail` after removing the last node?</span>** Without lines 8 to 10, dequeuing the only node frees it, but `tail` still stores its address:

<pre>
After deleting the only node without resetting tail:
head: nullptr    tail --> freed node (dangling pointer)
</pre>

The next `enqueue` sees `tail != nullptr` and calls `tail->setNext(new_tail)` on freed memory, which is undefined behavior. **An empty queue must have both pointers equal to `nullptr`.**

## Putting it all together

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="57 58 59 60 61 62 63 64 65" output="1 2 3
4">
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
    int getData() { return data; }
    Node* getNext() { return next; }
    void setData(int d) { data = d; }
    void setNext(Node* n) { next = n; }
};
<br>
class Queue {
  private:
    Node* head;
    Node* tail;
<br>
  public:
    Queue() { head = nullptr; tail = nullptr; }
    ~Queue() { delete head; }
    void enqueue(int d);
    int dequeue();
};
<br>
void Queue::enqueue(int d) {
  Node* new_tail = new Node(d, nullptr);
  if (tail != nullptr) {
    tail->setNext(new_tail);
  }
  tail = new_tail;
  if (head == nullptr) {
    head = new_tail;
  }
}
<br>
int Queue::dequeue() {
  if (head == nullptr) {
    return -1;
  }
  Node* old_head = head;
  int d = old_head->getData();
  head = old_head->getNext();
  if (head == nullptr) {
    tail = nullptr;
  }
  old_head->setNext(nullptr);
  delete old_head;
  return d;
}
<br>
int main(void) {
  Queue q;
  q.enqueue(1);
  q.enqueue(2);
  q.enqueue(3);
  cout << q.dequeue() << " ";
  cout << q.dequeue() << " ";
  cout << q.dequeue() << endl;
  q.enqueue(4);
  cout << q.dequeue() << endl;
  return 0;
}
</code-runner>
</pre>

**Output**
<pre>
1 2 3
4
</pre>

The values leave the queue in the **same** order they entered. After the third `dequeue`, both `head` and `tail` are `nullptr`, so the next `enqueue(4)` correctly treats the queue as empty. If any nodes were left in the queue, its destructor would free them when `q` goes out of scope.

## Special cases

| Case | What happens? |
|---|---|
| Enqueue into an empty queue | Both pointers point to the new node |
| Enqueue into a nonempty queue | Link the old tail to the new node, then move `tail` |
| Dequeue from an empty queue | Return `-1`; do not dereference `head` |
| Dequeue the only node | Both pointers become `nullptr` |
| Destroy an empty queue | `delete nullptr;` is safe |

## Time complexity

Let $n$ be the number of nodes in the queue.

| Operation | Work performed | Time complexity |
|---|---|---|
| Constructor | Initialize `head` and `tail` | $O(1)$ |
| `enqueue(d)` | Allocate one node and update the links | $O(1)$ |
| `dequeue()` | Detach and delete the first node | $O(1)$ |
| Destructor | Delete all nodes | $O(n)$ |

Thanks to the `tail` pointer, `enqueue` does not need to walk through the list to find the last node, so it is $O(1)$.

## Comparing stacks and queues

| | Stack | Queue |
|---|---|---|
| Rule | LIFO | FIFO |
| Insert | `push` at the head | `enqueue` at the tail |
| Remove | `pop` at the head | `dequeue` at the head |
| Pointers to nodes | `head` | `head` and `tail` |
| Removal order after inserting 1, 2, 3 | 3, 2, 1 | 1, 2, 3 |

Each insertion or removal changes a constant number of pointers, so it takes $O(1)$ time. Destroying a stack or a queue with $n$ nodes takes $O(n)$ time.

## Summary

In this chapter, we have learned:

- a linked list is a collection of dynamically allocated nodes linked by pointers, which can grow and shrink without copying elements,
- the destructor of a node can delete the rest of the list, so we must detach a node before deleting it on its own,
- a stack inserts and removes at the head (LIFO), and a queue inserts at the tail and removes at the head (FIFO),
- to always think of the special cases: an empty list and a list with only one node, and
- `push`, `pop`, `enqueue` and `dequeue` are $O(1)$, while destroying a list of $n$ nodes is $O(n)$.
