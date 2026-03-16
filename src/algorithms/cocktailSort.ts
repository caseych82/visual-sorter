import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0, swaps = 0;
  let start = 0, end = n - 1;
  const sorted = new Set<number>();

  while (start < end) {
    let swapped = false;

    // Forward pass — bubbles largest to the right
    for (let i = start; i < end; i++) {
      comparisons++;
      yield { array: [...a], highlights: { [i]: 'comparing', [i + 1]: 'comparing' }, comparisons, swaps };
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swaps++;
        swapped = true;
        yield { array: [...a], highlights: { [i]: 'swapping', [i + 1]: 'swapping' }, comparisons, swaps };
      }
    }
    sorted.add(end);
    end--;

    // Backward pass — bubbles smallest to the left
    for (let i = end - 1; i >= start; i--) {
      comparisons++;
      yield { array: [...a], highlights: { [i]: 'comparing', [i + 1]: 'comparing' }, comparisons, swaps };
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swaps++;
        swapped = true;
        yield { array: [...a], highlights: { [i]: 'swapping', [i + 1]: 'swapping' }, comparisons, swaps };
      }
    }
    sorted.add(start);
    start++;

    if (!swapped) break;
  }

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const cocktailSort: AlgorithmMeta = {
  id: 'cocktail',
  name: 'Cocktail Sort',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Bidirectional bubble sort — sweeps left-to-right then right-to-left each pass.',
  generator,
};
