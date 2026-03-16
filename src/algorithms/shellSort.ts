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
  explanation:
    'Runs Insertion Sort multiple times, each time with a different "gap" between the elements being compared. Starting with a large gap allows far-apart elements to move toward their correct positions quickly — something plain Insertion Sort cannot do. The gap shrinks each pass (here: halved) until it reaches 1, at which point a final ordinary Insertion Sort runs on a nearly-sorted array and finishes very cheaply. Performance depends heavily on the gap sequence chosen.',
  codeExample: `function shellSort(arr) {
  let gap = Math.floor(arr.length / 2);
  while (gap > 0) {
    for (let i = gap; i < arr.length; i++) {
      const temp = arr[i];
      let j = i;
      // Insertion sort with this gap
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
    gap = Math.floor(gap / 2);
  }
  return arr;
}`,
  generator,
};
