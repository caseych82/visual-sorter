import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  function* heapify(size: number, root: number): Generator<SortFrame, void, unknown> {
    let largest = root;
    const left  = 2 * root + 1;
    const right = 2 * root + 2;

    if (left < size) {
      comparisons++;
      yield { array: [...a], highlights: { [largest]: 'pivot', [left]: 'comparing' }, comparisons, swaps };
      if (a[left] > a[largest]) largest = left;
    }
    if (right < size) {
      comparisons++;
      yield { array: [...a], highlights: { [largest]: 'pivot', [right]: 'comparing' }, comparisons, swaps };
      if (a[right] > a[largest]) largest = right;
    }

    if (largest !== root) {
      [a[root], a[largest]] = [a[largest], a[root]];
      swaps++;
      yield { array: [...a], highlights: { [root]: 'swapping', [largest]: 'swapping' }, comparisons, swaps };
      yield* heapify(size, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }

  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    swaps++;
    yield { array: [...a], highlights: { [0]: 'swapping', [i]: 'sorted' }, comparisons, swaps };
    yield* heapify(i, 0);
  }

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const heapSort: AlgorithmMeta = {
  id: 'heap',
  name: 'Heap Sort',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(1)',
  description: 'Builds a max-heap from the data, then repeatedly extracts the maximum to produce a sorted array.',
  generator,
};
