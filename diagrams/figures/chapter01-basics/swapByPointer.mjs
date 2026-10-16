import { figure, title, columns, memory, frame, variable, code, arrow, fn, s } from '../../lib/components.mjs';

const src = `
void swapByValue(int* pa, int* pb);

int main(void) {
  int a = 5, b = 10;

  swapByValue(&a, &b);

  return 0;
}

void swapByValue(int* pa, int* pb) {
  int temp = *pa;
  *pa = *pb;
  *pb = temp;
}`;

const srcWithComments = `
void swapByValue(int* pa, int* pb);

int main(void) {
  int a = 5, b = 10;

  swapByValue(&a, &b);

  return 0;
}

void swapByValue(int* pa, int* pb) {
  int temp = *pa; // temp = *(&a) = a
  *pa = *pb;      // *(&b) = *(&a) → b = a
  *pb = temp;     // *(&b) = temp → b = temp
}`;

const mem = { gutter: 170, tail: 90 };

export default [
  figure('swapByPointer-a', {
    title: title(1, 'Pass-By-Pointer'),
    body: columns([
      memory([
        frame('main', [variable('int', 'a', '5'), variable('int', 'b', '10')], { caller: true, pad: 40 }),
        frame('swapByValue', [
          variable('int*', 'pa', '&a', { hl: true }),
          variable('int*', 'pb', '&b', { hl: true }),
          variable('int', 'temp', ''),
        ]),
      ], mem),
      code(src, {
        highlight: [11],
        marks: [
          { line: 6, text: '&a', id: 'arg-a' },
          { line: 6, text: '&b', id: 'arg-b' },
          { line: 11, text: 'int* pa', id: 'param-pa' },
          { line: 11, text: 'int* pb', id: 'param-pb' },
        ],
      }),
    ]),
    arrows: [arrow('arg-a', 'param-pa'), arrow('arg-b', 'param-pb')],
  }),

  figure('swapByPointer-b', {
    title: title(2, ['Dereference `pa` and `pb` to get access to `a` and `b` in ', fn('main'), ' function']),
    body: columns([
      memory([
        frame('main', [
          variable('int', 'a', [s('5'), ' 10'], { hl: true, id: 'val-a' }),
          variable('int', 'b', [s('10'), ' 5'], { hl: true, id: 'val-b' }),
        ], { caller: true, pad: 40 }),
        frame('swapByValue', [
          variable('int*', 'pa', '&a'),
          variable('int*', 'pb', '&b'),
          variable('int', 'temp', '5', { hl: true }),
        ], { note: ['`pa` and `pb` were used to access `a` and `b` in the ', fn('main'), ' function'] }),
      ], mem),
      code(srcWithComments, { highlight: ['12-14'] }),
    ]),
    arrows: [arrow('val-a', 'val-b', { fromSide: 'right', toSide: 'right', heads: 'both', curve: 34 })],
  }),

  figure('swapByPointer-c', {
    title: title(3, ['Return to ', fn('main'), ' function']),
    body: columns([
      memory([
        frame('main', [variable('int', 'a', '10'), variable('int', 'b', '5')], { pad: 40 }),
        frame('swapByValue', [
          variable('int*', 'pa', '&a'),
          variable('int*', 'pb', '&b'),
          variable('int', 'temp', '5'),
        ], { erased: true, note: [fn('swapByValue'), ' frame is erased'] }),
      ], mem),
      code(src, { highlight: [6] }),
    ]),
  }),
];
