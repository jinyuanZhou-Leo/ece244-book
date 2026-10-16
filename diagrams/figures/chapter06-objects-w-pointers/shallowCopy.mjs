import {
  figure, title, columns, segments, stackFrame, stackObject, ptr, field, heapArray, code, arrow, lineOf, s, color,
} from '../../lib/components.mjs';
import { studentClass } from './studentCode.mjs';

const src = `${studentClass('    // No copy constructor defined')}

int main(void) {
  Student x(3);
  x.setGrade(0, 90);
  Student y = x;
  y.setGrade(0, 70);
  return 0;
}`;

const L = (text, nth) => lineOf(src, text, nth);
const classLines = `1-${L('};')}`;
const opts = { classes: ['Student'] };

const xObj = (o = {}) => stackObject('x', [ptr('grades', { id: 'x-grades' }), field('numGrades', '3')], o);
const yObj = (o = {}) => stackObject('y', [ptr('grades', { id: 'y-grades' }), field('numGrades', '3')], o);
const xArrow = arrow('x-grades', 'arr', { route: 'elbow', elbow: 34 });
const yArrow = arrow('y-grades', 'arr', { route: 'elbow', elbow: 16 });

export default [
  figure('shallow-copy-a', {
    title: title(1, 'The default copy constructor copies the pointer `grades`, not the array it points to'),
    body: columns([
      segments({
        stack: [stackFrame('main'), xObj(), yObj()],
        heap: [heapArray(['90', '0', '0'], { id: 'arr', note: '`x.grades` and `y.grades` point to the same array' })],
      }),
      code(src, { ...opts, highlight: [L('Student y = x;')], dim: [classLines] }),
    ]),
    arrows: [xArrow, yArrow],
  }),

  figure('shallow-copy-b', {
    title: title(2, 'Changing the grades of `y` also changes the grades of `x`'),
    body: columns([
      segments({
        stack: [stackFrame('main'), xObj(), yObj()],
        heap: [heapArray([[s('90'), ' 70'], '0', '0'], { id: 'arr', hl: [0] })],
      }),
      code(src, { ...opts, highlight: [L('y.setGrade')], dim: [classLines] }),
    ]),
    arrows: [xArrow, yArrow],
  }),

  figure('shallow-copy-c', {
    title: title(3, '`y` goes out of scope first. Its destructor frees the array that `x.grades` still points to'),
    body: columns([
      segments({
        stack: [stackFrame('main'), xObj(), yObj({ state: 'erased' })],
        heap: [heapArray(['?', '?', '?'], { id: 'arr', state: 'freed', note: [color('var(--seg-note)', 'Freed'), ' by the destructor of `y`'] })],
      }),
      code(src, { ...opts, highlight: [`${L('~Student')}-${L('~Student') + 2}`, src.trim().split('\n').length] }),
    ]),
    arrows: [xArrow],
  }),
];
