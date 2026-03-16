import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  let comparisons = 0;
  let swaps = 0;

  function* partition(low: number, high: number): Generator<SortFrame, number, unknown> {
    const pivot = a[high];
    let i = low - 1;

    yield { array: [...a], highlights: { [high]: 'pivot' }, comparisons, swaps };

    for (let j = low; j < high; j++) {
      comparisons++;
      yield { array: [...a], highlights: { [high]: 'pivot', [j]: 'comparing', [i + 1]: 'comparing' }, comparisons, swaps };
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        swaps++;
        yield { array: [...a], highlights: { [high]: 'pivot', [i]: 'swapping', [j]: 'swapping' }, comparisons, swaps };
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    swaps++;
    yield { array: [...a], highlights: { [i + 1]: 'swapping', [high]: 'swapping' }, comparisons, swaps };
    return i + 1;
  }

  function* quickSort(low: number, high: number): Generator<SortFrame, void, unknown> {
    if (low >= high) return;
    const pivotIdx: number = (yield* partition(low, high)) as number;
    yield { array: [...a], highlights: { [pivotIdx]: 'sorted' }, comparisons, swaps };
    yield* quickSort(low, pivotIdx - 1);
    yield* quickSort(pivotIdx + 1, high);
  }

  yield* quickSort(0, a.length - 1);

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < a.length; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const quickSort: AlgorithmMeta = {
  id: 'quick',
  name: 'Quick Sort',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
  spaceComplexity: 'O(log n)',
  description: 'Selects a pivot element and partitions the array around it, recursively sorting each partition.',
  explanation:
    'Picks a pivot (here: the last element) and rearranges the array so every element ≤ pivot is to its left and every element > pivot is to its right. The pivot is then in its final sorted position. Recursively repeat on each side. Averages O(n log n) with excellent cache performance due to in-place partitioning — fastest comparison sort in practice. Worst case is O(n²) when the pivot is always the extreme (e.g. sorted input with a last-element pivot).',
  codeExample: `function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]]; // place pivot
  quickSort(arr, lo, i - 1);
  quickSort(arr, i + 1, hi);
  return arr;
}`,
  generator,
};
