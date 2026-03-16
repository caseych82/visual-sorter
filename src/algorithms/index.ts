import { bubbleSort }    from './bubbleSort';
import { selectionSort } from './selectionSort';
import { insertionSort } from './insertionSort';
import { mergeSort }     from './mergeSort';
import { quickSort }     from './quickSort';
import { heapSort }      from './heapSort';
import { shellSort }     from './shellSort';
import { radixSort }     from './radixSort';

export const algorithms = [
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  shellSort,
  radixSort,
];

export type { AlgorithmMeta } from './types';
