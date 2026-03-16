import type { AlgorithmMeta, SortFrame } from './types';

const SHRINK = 1.3;

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0, swaps = 0;
  let gap = n;
  let sorted = false;

  while (!sorted) {
    gap = Math.max(1, Math.floor(gap / SHRINK));
    if (gap === 1) sorted = true;

    for (let i = 0; i + gap < n; i++) {
      comparisons++;
      yield { array: [...a], highlights: { [i]: 'comparing', [i + gap]: 'comparing' }, comparisons, swaps };
      if (a[i] > a[i + gap]) {
        [a[i], a[i + gap]] = [a[i + gap], a[i]];
        swaps++;
        sorted = false;
        yield { array: [...a], highlights: { [i]: 'swapping', [i + gap]: 'swapping' }, comparisons, swaps };
      }
    }
  }

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const combSort: AlgorithmMeta = {
  id: 'comb',
  name: 'Comb Sort',
  timeComplexity: { best: 'O(n log n)', average: 'O(n²/2ᵖ)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Improves bubble sort by using a shrinking gap (÷1.3) to eliminate small values near the end early.',
  explanation:
    'The core problem with Bubble Sort is "turtles" — small values near the end of the array that can only move one position left per full pass. Comb Sort fixes this by comparing elements separated by a large gap (initially ≈ array length) and shrinking it by a factor of 1.3 each round. The large early gaps fling turtles to the left in a single swap. Once the gap reaches 1, it behaves exactly like Bubble Sort for cleanup, but by then the array is nearly sorted.',
  codeExample: `function combSort(arr) {
  let gap = arr.length;
  let sorted = false;
  while (gap > 1 || !sorted) {
    // Shrink gap by factor 1.3 (empirically optimal)
    gap = Math.max(1, Math.floor(gap / 1.3));
    sorted = true;
    for (let i = 0; i + gap < arr.length; i++) {
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        sorted = false;
      }
    }
  }
  return arr;
}`,
  generator,
};
