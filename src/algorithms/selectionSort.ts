import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const sorted = new Set<number>();

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const sortedHL = Object.fromEntries([...sorted].map(idx => [idx, 'sorted' as const]));
      yield {
        array: [...a],
        highlights: { ...sortedHL, [minIdx]: 'pivot', [j]: 'comparing' },
        comparisons, swaps,
      };
      if (a[j] < a[minIdx]) minIdx = j;
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      swaps++;
      yield { array: [...a], highlights: { [i]: 'swapping', [minIdx]: 'swapping' }, comparisons, swaps };
    }

    sorted.add(i);
  }
  sorted.add(n - 1);

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const selectionSort: AlgorithmMeta = {
  id: 'selection',
  name: 'Selection Sort',
  timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Finds the minimum element from the unsorted portion and places it at the beginning.',
  generator,
};
