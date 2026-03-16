import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  // Ciura gap sequence
  const gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(g => g < n);

  for (const gap of gaps) {
    for (let i = gap; i < n; i++) {
      let j = i;
      yield { array: [...a], highlights: { [j]: 'pivot' }, comparisons, swaps };

      while (j >= gap) {
        comparisons++;
        yield { array: [...a], highlights: { [j]: 'comparing', [j - gap]: 'comparing' }, comparisons, swaps };
        if (a[j - gap] > a[j]) {
          [a[j], a[j - gap]] = [a[j - gap], a[j]];
          swaps++;
          yield { array: [...a], highlights: { [j]: 'swapping', [j - gap]: 'swapping' }, comparisons, swaps };
          j -= gap;
        } else {
          break;
        }
      }
    }
  }

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const shellSort: AlgorithmMeta = {
  id: 'shell',
  name: 'Shell Sort',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log² n)', worst: 'O(n log² n)' },
  spaceComplexity: 'O(1)',
  description: 'Generalization of insertion sort that compares elements separated by a shrinking gap sequence.',
  generator,
};
