import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0, swaps = 0;

  function* flip(k: number): Generator<SortFrame, void, unknown> {
    let lo = 0, hi = k;
    while (lo < hi) {
      [a[lo], a[hi]] = [a[hi], a[lo]];
      swaps++;
      yield { array: [...a], highlights: { [lo]: 'swapping', [hi]: 'swapping' }, comparisons, swaps };
      lo++; hi--;
    }
  }

  for (let size = n - 1; size > 0; size--) {
    // Find index of maximum in a[0..size]
    let maxIdx = 0;
    for (let i = 1; i <= size; i++) {
      comparisons++;
      yield { array: [...a], highlights: { [i]: 'comparing', [maxIdx]: 'pivot' }, comparisons, swaps };
      if (a[i] > a[maxIdx]) maxIdx = i;
    }

    if (maxIdx === size) continue; // already in place

    // Flip max to front, then flip into final position
    if (maxIdx !== 0) yield* flip(maxIdx);
    yield* flip(size);
  }

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const pancakeSort: AlgorithmMeta = {
  id: 'pancake',
  name: 'Pancake Sort',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Repeatedly finds the maximum and flips it into position using prefix reversals — dramatic full-array flips.',
  generator,
};
