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
  explanation:
    'The only allowed operation is a "flip": reverse the subarray from index 0 to k. To place the largest unsorted element: first flip the prefix ending at that element (bringing it to index 0), then flip the entire unsorted prefix (sending it to its final position at the end). Two flips per element, n elements = at most 2(n−1) flips total. Originally studied as a mathematical curiosity — Bill Gates co-authored a paper on it in 1979. It is the only algorithm here that cannot directly swap arbitrary elements.',
  codeExample: `function pancakeSort(arr) {
  for (let size = arr.length; size > 1; size--) {
    // Find index of max in arr[0..size-1]
    let maxIdx = 0;
    for (let i = 1; i < size; i++)
      if (arr[i] > arr[maxIdx]) maxIdx = i;
    if (maxIdx === size - 1) continue;
    // Flip max to front, then flip to final position
    if (maxIdx !== 0) flip(arr, maxIdx);
    flip(arr, size - 1);
  }
  return arr;
}

function flip(arr, k) {
  let lo = 0, hi = k;
  while (lo < hi) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    lo++; hi--;
  }
}`,
  generator,
};
