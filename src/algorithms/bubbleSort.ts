import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const sorted = new Set<number>();

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      yield { array: [...a], highlights: { [j]: 'comparing', [j + 1]: 'comparing' }, comparisons, swaps };

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swapped = true;
        yield { array: [...a], highlights: { [j]: 'swapping', [j + 1]: 'swapping' }, comparisons, swaps };
      }
    }
    sorted.add(n - i - 1);
    const sortedHighlights = Object.fromEntries([...sorted].map(idx => [idx, 'sorted' as const]));
    yield { array: [...a], highlights: sortedHighlights, comparisons, swaps };
    if (!swapped) break;
  }

  // Mark everything sorted
  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const bubbleSort: AlgorithmMeta = {
  id: 'bubble',
  name: 'Bubble Sort',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if out of order.',
  generator,
};
