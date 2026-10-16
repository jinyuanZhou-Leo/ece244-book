import {
  figure, title, columns, segments, stackFrame, stackObject, ptr, field, heapArray, code, arrow, lineOf, s,
} from '../../lib/components.mjs';
import { studentClass, copyCtor } from './studentCode.mjs';

const src = `${studentClass(`${copyCtor}\n    // No operator= defined`)}

int main(void) {
  Student x(3);
  x.setGrade(0, 90);
  Student y(2);
  y = x;
  return 0;
}`;

export default [
  figure('assignment-leak', {
    title: title(null, 'The default `operator=` copies the pointer `grades`. The old array of `y` is never freed'),
    body: columns([
      segments({
        stack: [
          stackFrame('main'),
          stackObject('x', [ptr('grades', { id: 'x-grades' }), field('numGrades', '3')]),
          stackObject('y', [ptr('grades', { id: 'y-grades' }), field('numGrades', [s('2'), ' 3'], { hl: true })]),
        ],
        heap: [
          heapArray(['0', '0'], { id: 'arr-y-old', state: 'leak', note: 'Memory leak: the old array of `y`' }),
          heapArray(['90', '0', '0'], { id: 'arr-x', note: '`x.grades` and `y.grades` point to the same array' }),
        ],
        gap: 120,
      }),
      code(src, { classes: ['Student'], highlight: [lineOf(src, 'y = x;')], dim: [`1-${lineOf(src, '};')}`] }),
    ]),
    arrows: [
      arrow('x-grades', 'arr-x', { route: 'elbow', elbow: 34 }),
      arrow('y-grades', 'arr-x', { route: 'elbow', elbow: 16 }),
    ],
  }),
];
