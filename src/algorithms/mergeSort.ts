import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  let comparisons = 0;
  let swaps = 0;

  function* merge(left: number, mid: number, right: number): Generator<SortFrame, void, unknown> {
    const leftArr  = a.slice(left, mid + 1);
    const rightArr = a.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      yield { array: [...a], highlights: { [left + i]: 'comparing', [mid + 1 + j]: 'comparing' }, comparisons, swaps };
      if (leftArr[i] <= rightArr[j]) {
        a[k] = leftArr[i++];
      } else {
        a[k] = rightArr[j++];
        swaps++;
      }
      yield { array: [...a], highlights: { [k]: 'swapping' }, comparisons, swaps };
      k++;
    }
    while (i < leftArr.length) { a[k++] = leftArr[i++]; }
    while (j < rightArr.length) { a[k++] = rightArr[j++]; }

    // Flash merged region as sorted
    const hl: SortFrame['highlights'] = {};
    for (let x = left; x <= right; x++) hl[x] = 'sorted';
    yield { array: [...a], highlights: hl, comparisons, swaps };
  }

  function* mergeSort(left: number, right: number): Generator<SortFrame, void, unknown> {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    yield* mergeSort(left, mid);
    yield* mergeSort(mid + 1, right);
    yield* merge(left, mid, right);
  }

  yield* mergeSort(0, a.length - 1);

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < a.length; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const mergeSort: AlgorithmMeta = {
  id: 'merge',
  name: 'Merge Sort',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description: 'Divides the array in half recursively, then merges the sorted halves back together.',
  explanation:
    'Recursively splits the array in half until each piece has one element (trivially sorted), then merges pairs of sorted pieces by repeatedly picking the smaller front element from each half. Guaranteed O(n log n) in every case — best, average, and worst. The trade-off is O(n) extra memory for the temporary merge buffers. Preferred when stable ordering and consistent performance matter more than memory.',
  codeExample: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else                      result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}`,
  generator,
};
