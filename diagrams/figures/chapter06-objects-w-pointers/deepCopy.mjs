import {
  figure, title, columns, segments, stackFrame, stackObject, ptr, field, heapArray, code, arrow, lineOf,
} from '../../lib/components.mjs';
import { studentClass, copyCtor } from './studentCode.mjs';

const src = `${studentClass(copyCtor)}

int main(void) {
  Student x(3);
  x.setGrade(0, 90);
  Student y = x;
  y.setGrade(0, 70);
  return 0;
}`;

const ctor = lineOf(src, 'Student(const Student& other)');

export default [
  figure('deep-copy', {
    title: title(null, 'Our copy constructor allocates a new array for `y` and copies the grades of `x` into it'),
    body: columns([
      segments({
        stack: [
          stackFrame('main'),
          stackObject('x', [ptr('grades', { id: 'x-grades' }), field('numGrades', '3')]),
          stackObject('y', [ptr('grades', { id: 'y-grades' }), field('numGrades', '3')]),
        ],
        heap: [
          heapArray(['70', '0', '0'], { id: 'arr-y', note: 'Array of `y`' }),
          heapArray(['90', '0', '0'], { id: 'arr-x', note: 'Array of `x`' }),
        ],
        gap: 120,
      }),
      code(src, { classes: ['Student'], highlight: [`${ctor}-${ctor + 4}`, lineOf(src, 'Student y = x;')] }),
    ]),
    arrows: [
      arrow('x-grades', 'arr-x', { route: 'elbow', elbow: 34 }),
      arrow('y-grades', 'arr-y', { route: 'elbow', elbow: 16 }),
    ],
  }),
];
