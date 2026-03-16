import { bubbleSort }     from './bubbleSort';
import { selectionSort }  from './selectionSort';
import { insertionSort }  from './insertionSort';
import { mergeSort }      from './mergeSort';
import { quickSort }      from './quickSort';
import { heapSort }       from './heapSort';
import { shellSort }      from './shellSort';
import { radixSort }      from './radixSort';
import { cocktailSort }   from './cocktailSort';
import { combSort }       from './combSort';
import { gnomeSort }      from './gnomeSort';
import { oddEvenSort }    from './oddEvenSort';
import { pancakeSort }    from './pancakeSort';

export const algorithms = [
  bubbleSort,
  cocktailSort,
  combSort,
  gnomeSort,
  oddEvenSort,
  pancakeSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  shellSort,
  radixSort,
];

export type { AlgorithmMeta } from './types';
