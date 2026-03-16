import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  const maxVal = Math.max(...a);
  let exp = 1;

  while (Math.floor(maxVal / exp) > 0) {
    const output = new Array<number>(n).fill(0);
    const count  = new Array<number>(10).fill(0);

    // Count occurrences of each digit
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(a[i] / exp) % 10;
      count[digit]++;
      yield { array: [...a], highlights: { [i]: 'comparing' }, comparisons: ++comparisons, swaps };
    }

    // Prefix sums
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    // Build output (traverse right to left for stability)
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(a[i] / exp) % 10;
      output[--count[digit]] = a[i];
      swaps++;
    }

    // Copy back and animate each placement
    for (let i = 0; i < n; i++) {
      a[i] = output[i];
      yield { array: [...a], highlights: { [i]: 'swapping' }, comparisons, swaps };
    }

    // Flash pass complete
    const hl: SortFrame['highlights'] = {};
    for (let i = 0; i < n; i++) hl[i] = 'pivot';
    yield { array: [...a], highlights: hl, comparisons, swaps };

    exp *= 10;
  }

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const radixSort: AlgorithmMeta = {
  id: 'radix',
  name: 'Radix Sort',
  timeComplexity: { best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)' },
  spaceComplexity: 'O(n + k)',
  description: 'Sorts integers digit by digit from least significant to most significant using counting sort as a subroutine.',
  explanation:
    'Never compares elements directly. Instead it distributes them into 10 buckets (0–9) based on a single digit, then reads them back in order — repeating this stable counting-sort pass for each digit position from least to most significant. After k passes (one per digit), the array is fully sorted. Runs in O(nk) time where k is the number of digits, which is effectively O(n) for fixed-range integers. Only works on data with a discrete key (integers, strings).',
  codeExample: `function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10)
    countingSort(arr, exp);
  return arr;
}

function countingSort(arr, exp) {
  const n = arr.length;
  const output = new Array(n);
  const count  = new Array(10).fill(0);
  // Count digit occurrences
  for (let i = 0; i < n; i++)
    count[Math.floor(arr[i] / exp) % 10]++;
  // Cumulative count
  for (let i = 1; i < 10; i++)
    count[i] += count[i - 1];
  // Build output (right-to-left keeps it stable)
  for (let i = n - 1; i >= 0; i--) {
    const d = Math.floor(arr[i] / exp) % 10;
    output[--count[d]] = arr[i];
  }
  for (let i = 0; i < n; i++) arr[i] = output[i];
}`,
  generator,
};
