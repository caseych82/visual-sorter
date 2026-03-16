import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0, swaps = 0;
  let isSorted = false;

  while (!isSorted) {
    isSorted = true;

    // Odd phase — compare pairs (1,2), (3,4), (5,6) …
    for (let i = 1; i < n - 1; i += 2) {
      comparisons++;
      yield { array: [...a], highlights: { [i]: 'comparing', [i + 1]: 'comparing' }, comparisons, swaps };
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swaps++;
        isSorted = false;
        yield { array: [...a], highlights: { [i]: 'swapping', [i + 1]: 'swapping' }, comparisons, swaps };
      }
    }

    // Even phase — compare pairs (0,1), (2,3), (4,5) …
    for (let i = 0; i < n - 1; i += 2) {
      comparisons++;
      yield { array: [...a], highlights: { [i]: 'comparing', [i + 1]: 'comparing' }, comparisons, swaps };
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swaps++;
        isSorted = false;
        yield { array: [...a], highlights: { [i]: 'swapping', [i + 1]: 'swapping' }, comparisons, swaps };
      }
    }
  }

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const oddEvenSort: AlgorithmMeta = {
  id: 'odd-even',
  name: 'Odd-Even Sort',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Alternates between comparing odd-indexed and even-indexed adjacent pairs — creates mesmerizing wave patterns.',
  explanation:
    'Alternates between two phases: in the "odd" phase it compares and swaps pairs at indices (1,2), (3,4), (5,6)…; in the "even" phase it compares (0,1), (2,3), (4,5)…. Because each phase operates on non-overlapping pairs, all comparisons within a phase are fully independent — a parallel processor could perform them all simultaneously. On single-core hardware it is just O(n²) like Bubble Sort, but the alternating phases produce the characteristic diagonal wave patterns visible in the visualizer.',
  codeExample: `function oddEvenSort(arr) {
  let sorted = false;
  while (!sorted) {
    sorted = true;
    // Odd phase: pairs at (1,2), (3,4), …
    for (let i = 1; i < arr.length - 1; i += 2) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        sorted = false;
      }
    }
    // Even phase: pairs at (0,1), (2,3), …
    for (let i = 0; i < arr.length - 1; i += 2) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        sorted = false;
      }
    }
  }
  return arr;
}`,
  generator,
};
