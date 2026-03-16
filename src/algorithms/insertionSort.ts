import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 1; i < n; i++) {
    let j = i;
    yield { array: [...a], highlights: { [j]: 'pivot' }, comparisons, swaps };

    while (j > 0 && a[j - 1] > a[j]) {
      comparisons++;
      yield { array: [...a], highlights: { [j]: 'comparing', [j - 1]: 'comparing' }, comparisons, swaps };
      [a[j], a[j - 1]] = [a[j - 1], a[j]];
      swaps++;
      yield { array: [...a], highlights: { [j]: 'swapping', [j - 1]: 'swapping' }, comparisons, swaps };
      j--;
    }
    if (j > 0) comparisons++; // the final comparison that broke the loop
  }

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const insertionSort: AlgorithmMeta = {
  id: 'insertion',
  name: 'Insertion Sort',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Builds the sorted array one item at a time by inserting each element into its correct position.',
  explanation:
    'Takes the next unsorted element and scans backward through the already-sorted region, shifting elements right until it finds the correct insertion point. Like sorting a hand of playing cards. Exceptionally fast on small or nearly-sorted arrays — it approaches O(n) when the input is almost ordered. Because of this it is used as the finishing pass inside hybrid algorithms like Timsort (Python\'s sort).',
  codeExample: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]; // shift right
      j--;
    }
    arr[j + 1] = key; // insert
  }
  return arr;
}`,
  generator,
};
