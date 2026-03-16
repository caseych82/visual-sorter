export type SortState = 'idle' | 'running' | 'paused' | 'done';
export type HighlightType = 'comparing' | 'swapping' | 'sorted' | 'pivot';

export interface SortFrame {
  array: number[];
  highlights: Partial<Record<number, HighlightType>>;
  comparisons: number;
  swaps: number;
}

export interface AlgorithmMeta {
  id: string;
  name: string;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  description: string;
  generator: (arr: number[]) => Generator<SortFrame, void, unknown>;
}
