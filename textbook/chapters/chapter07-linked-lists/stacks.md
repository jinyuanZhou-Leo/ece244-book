# Stacks: Last In, First Out

A **stack** is a linked list where we insert and remove nodes only at the **head**. Think of a stack of plates: we put a new plate on top, and we take the plate on top first. This is called **LIFO: Last In, First Out**. A stack has two operations:

- `push(d)`: insert the value `d` at the head.
- `pop()`: remove and return the most recently pushed value, which is at the head.

For example, after `s.push(2); s.push(1);`, the stack looks like this, and the next `s.pop()` returns `1`:

<pre>
 head
   |
   v
 +------+------+     +------+---------+
 | data | next |     | data | next    |
 |  1   |  ----+---->|  2   | nullptr |
 +------+------+     +------+---------+
</pre>

## The `Stack` class

A stack only needs a pointer to its first node, `head`. We use the `Node` class from the previous section.

**Code in `stack.h`**
```{code-block} cpp
:linenos:
class Stack {
  private:
    Node* head;

  public:
    Stack() { head = nullptr; }
    ~Stack() { delete head; }
    void push(int d);
    int pop();
};
```

**Line 6.** An empty stack has no nodes, so `head` is `nullptr`.

**Line 7.** The destructor deletes the first node. Since the destructor of `Node` deletes the next node, this frees **all** the nodes in the stack. If the stack is empty, `delete nullptr;` does nothing.

## `push`

```{code-block} cpp
:linenos:
void Stack::push(int d) {
  head = new Node(d, head);
}
```

We allocate a new node that stores `d`, and whose `next` points to the current first node. Then, `head` points to the new node. For example, `s.push(1)` on a stack whose first node stores `2`:

<pre>
Before s.push(1):
                              +---------+---------+
                     head --> | data: 2 | next: --+--> ...
                              +---------+---------+

After s.push(1):
         +---------+---------+     +---------+---------+
head --> | data: 1 | next: --+---->| data: 2 | next: --+--> ...
         +---------+---------+     +---------+---------+
</pre>

**What if the stack is empty?** Then `head` is `nullptr`, so the new node's `next` is `nullptr`, and it becomes the only node. The same line works for both cases.

<pre>
Before s.push(1):  head: nullptr

After s.push(1):
         +---------+---------------+
head --> | data: 1 | next: nullptr |
         +---------+---------------+
</pre>

## `pop`

```{code-block} cpp
:linenos:
int Stack::pop() {
  if (head == nullptr) {
    return -1;
  }
  Node* old_head = head;
  int d = old_head->getData();
  head = old_head->getNext();
  old_head->setNext(nullptr);
  delete old_head;
  return d;
}
```

**Line 2 to 4.** If the stack is empty, there is nothing to pop. In this example, we return `-1` to indicate this. This is a simplification: `-1` can also be a valid value that was pushed, so the caller cannot always tell the two cases apart. A more complete stack would also provide a function such as `bool isEmpty()` that the caller checks before calling `pop`. The same applies to `dequeue` in the next section.

**Line 5 and 6.** We keep a pointer `old_head` to the first node, and we save its data in `d`.

**Line 7.** `head` moves to the second node. If there was only one node, `head` becomes `nullptr`.

**Line 8 and 9.** We detach the old first node from the list, and then delete it.

**Line 10.** We return the saved data.

<pre>
Before s.pop():
         +---------+---------+     +---------+---------+
head --> | data: 1 | next: --+---->| data: 2 | next: --+--> ...
         +---------+---------+     +---------+---------+

After s.pop() returns 1:
                              +---------+---------+
                     head --> | data: 2 | next: --+--> ...
                              +---------+---------+
</pre>

**<span style="color:red">Problem 1: What if we do not check whether `head` is `nullptr`?</span>** If the stack is empty, `old_head` is `nullptr`, and `old_head->getData()` dereferences `nullptr`. This is undefined behavior, and the program may crash.

**<span style="color:red">Problem 2: What if we do not call `old_head->setNext(nullptr)` before `delete old_head;`?</span>** Recall that the destructor of `Node` deletes the next node. `old_head->next` still points to the node that `head` now points to, so `delete old_head;` deletes the **entire** linked list! `head` is left pointing to freed memory, *i.e.* it becomes a **dangling pointer**.

<pre>
Without old_head->setNext(nullptr):
                                         head
                                           |
                                           v
             +---------+---------+     +---------+---------+
old_head --> | data: 1 | next: --+---->| data: 2 | next: --+--> ...
             +---------+---------+     +---------+---------+
delete old_head; frees ALL of these nodes, and head becomes dangling!

With old_head->setNext(nullptr):
                                               head
                                                 |
                                                 v
             +---------+---------------+     +---------+---------+
old_head --> | data: 1 | next: nullptr |     | data: 2 | next: --+--> ...
             +---------+---------------+     +---------+---------+
delete old_head; frees only the node that old_head points to.
</pre>

## Putting it all together

**Code**
{{code_runner_header}}
<pre class="code-runner-wrapper">
<code-runner language="c++" highlight-lines="46 47 48 49 50 51 52 53" output="1
2
-1">
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
class Stack {
  private:
    Node* head;
<br>
  public:
    Stack() { head = nullptr; }
    ~Stack() { delete head; }
    void push(int d);
    int pop();
};
<br>
void Stack::push(int d) {
  head = new Node(d, head);
}
<br>
int Stack::pop() {
  if (head == nullptr) {
    return -1;
  }
  Node* old_head = head;
  int d = old_head->getData();
  head = old_head->getNext();
  old_head->setNext(nullptr);
  delete old_head;
  return d;
}
<br>
int main(void) {
  Stack s;
  s.push(2);
  s.push(1);
  cout << s.pop() << endl;
  cout << s.pop() << endl;
  cout << s.pop() << endl;
  s.push(3);
  s.push(4);
  return 0;
}
</code-runner>
</pre>

**[Line 47 to 50]** After `s.push(2)` and `s.push(1)`, the stack is `head --> [1] --> [2] --> nullptr`. The first `pop` returns `1`, the value pushed **last**, and the second `pop` returns `2`.

**[Line 51]** The stack is empty, so `pop` returns `-1`.

**[Line 52 and 53]** We push two more values, and do not pop them. When `s` goes out of scope at the end of `main`, its destructor frees the two nodes that are still in the stack, so there is no memory leak.

**Output**
<pre>
1
2
-1
</pre>

```{admonition} What about copying a stack?
:class: warning
`Stack` has a destructor that frees the nodes it owns. Recall the Rule of Three from the Objects with Pointers chapter: such a class also needs a copy constructor and `operator=`. With the default ones, `Stack t = s;` would make a shallow copy: `t.head` and `s.head` would point to the same nodes, and both destructors would free them. If we do not need to copy stacks, the simplest fix is to forbid copying:

~~~cpp
Stack(const Stack& other) = delete;
Stack& operator=(const Stack& rhs) = delete;
~~~

Otherwise, the copy constructor and `operator=` must make a deep copy, *i.e.* allocate a new node for every node of `other`, in the same order. The same applies to the `Queue` class in the next section.
```

## Special cases

When we implement a linked data structure, we should always think of the special cases: **What if the stack is empty? What if it has only one node?**

| Case | What happens? |
|---|---|
| Push into an empty stack | The new node's `next` is `nullptr` |
| Pop from an empty stack | Return `-1`; do not dereference `head` |
| Pop the only node | `head` becomes `nullptr` |
| Destroy an empty stack | `delete nullptr;` is safe |

## Time complexity

Let $n$ be the number of nodes in the stack. Using the Big-O notation from the Complexity Analysis chapter:

| Operation | Work performed | Time complexity |
|---|---|---|
| Constructor | Set `head` to `nullptr` | $O(1)$ |
| `push(d)` | Allocate one node and update `head` | $O(1)$ |
| `pop()` | Move `head`, detach and delete one node | $O(1)$ |
| Destructor | Delete all nodes | $O(n)$ |

`push` and `pop` do the same amount of work regardless of how many nodes are in the stack, since they only change the first node. The destructor, however, is $O(n)$: although `delete head;` is one statement, it triggers a destructor call for every node in the list.
