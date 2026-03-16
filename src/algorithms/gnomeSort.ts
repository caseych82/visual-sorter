import type { AlgorithmMeta, SortFrame } from './types';

function* generator(arr: number[]): Generator<SortFrame, void, unknown> {
  const a = [...arr];
  const n = a.length;
  let comparisons = 0, swaps = 0;
  let pos = 0;

  while (pos < n) {
    if (pos === 0) { pos++; continue; }

    comparisons++;
    yield { array: [...a], highlights: { [pos - 1]: 'comparing', [pos]: 'comparing' }, comparisons, swaps };

    if (a[pos] >= a[pos - 1]) {
      pos++;
    } else {
      [a[pos], a[pos - 1]] = [a[pos - 1], a[pos]];
      swaps++;
      yield { array: [...a], highlights: { [pos - 1]: 'swapping', [pos]: 'swapping' }, comparisons, swaps };
      pos--;
    }
  }

  const final: SortFrame['highlights'] = {};
  for (let i = 0; i < n; i++) final[i] = 'sorted';
  yield { array: [...a], highlights: final, comparisons, swaps };
}

export const gnomeSort: AlgorithmMeta = {
  id: 'gnome',
  name: 'Gnome Sort',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Moves forward when elements are in order, swaps and steps back when they aren\'t — chaotic but correct.',
  explanation:
    'Named after a garden gnome sorting flower pots: look at the pot in front of you and the one behind. If they\'re in order, step forward. If not, swap them and step back. Repeat. Conceptually the simplest sorting algorithm — just one rule at each step — but the constant back-and-forth makes it O(n²) and very slow in practice. The erratic movement pattern creates a distinctive visual signature that is completely unlike any other algorithm here.',
  codeExample: `function gnomeSort(arr) {
  let i = 0;
  while (i < arr.length) {
    if (i === 0 || arr[i] >= arr[i - 1]) {
      i++; // in order — advance
    } else {
      [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]]; // swap
      i--;  // step back
    }
  }
  return arr;
}`,
  generator,
};
