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
  generator,
};
