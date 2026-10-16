import {
  figure, title, columns, segments, stackFrame, stackObject, ptr, field, heapArray, code, arrow, lineOf, s, color,
} from '../../lib/components.mjs';
import { studentClass, assignOp } from './studentCode.mjs';

const src = `${studentClass(assignOp)}

int main(void) {
  Student x(3);
  x.setGrade(0, 90);
  Student y(2);
  y = x;
  return 0;
}`;

const opts = { classes: ['Student'] };
const xObj = stackObject('x', [ptr('grades', { id: 'x-grades' }), field('numGrades', '3')]);
const yObj = (n, hl = false) => stackObject('y', [ptr('grades', { id: 'y-grades' }), field('numGrades', n, { hl })]);
const xArrow = arrow('x-grades', 'arr-x', { route: 'elbow', elbow: 34 });
const freed = color('var(--seg-note)', 'Freed');

const del = lineOf(src, 'delete[] grades;');
const ret = lineOf(src, 'return *this;', 2);
const call = lineOf(src, 'y = x;');

export default [
  figure('deep-assignment-a', {
    title: title(1, 'Free the old array of `y`. `y.grades` still holds its address'),
    body: columns([
      segments({
        stack: [stackFrame('main'), xObj, yObj('2')],
        heap: [
          heapArray(['?', '?'], { id: 'arr-y-old', state: 'freed', note: freed }),
          heapArray(['90', '0', '0'], { id: 'arr-x' }),
        ],
        gap: 120,
      }),
      code(src, { ...opts, highlight: [del, call] }),
    ]),
    arrows: [xArrow, arrow('y-grades', 'arr-y-old', { route: 'elbow', elbow: 16 })],
  }),

  figure('deep-assignment-b', {
    title: title(2, 'Allocate a new array for `y` and copy the grades of `x` into it'),
    body: columns([
      segments({
        stack: [stackFrame('main'), xObj, yObj([s('2'), ' 3'], true)],
        heap: [
          heapArray(['90', '0', '0'], { id: 'arr-y', note: 'New array of `y`' }),
          heapArray(['?', '?'], { id: 'arr-y-old', state: 'freed', note: freed }),
          heapArray(['90', '0', '0'], { id: 'arr-x' }),
        ],
        gap: 120,
      }),
      code(src, { ...opts, highlight: [`${del + 1}-${ret}`, call] }),
    ]),
    arrows: [xArrow, arrow('y-grades', 'arr-y', { route: 'elbow', elbow: 16 })],
  }),
];
