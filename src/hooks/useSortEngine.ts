import { useRef, useState, useCallback } from 'react';
import { SortEngine } from '../engine/SortEngine';
import { audioEngine } from '../engine/AudioEngine';
import type { SortFrame, SortState, AlgorithmMeta } from '../algorithms/types';

const EMPTY_FRAME: SortFrame = {
  array: [],
  highlights: {},
  comparisons: 0,
  swaps: 0,
};

export function useSortEngine() {
  const [frame, setFrame] = useState<SortFrame>(EMPTY_FRAME);
  const [status, setStatus] = useState<SortState>('idle');
  const prevHighlightsRef = useRef<SortFrame['highlights']>({});

  const engineRef = useRef<SortEngine>(
    new SortEngine({
      onFrame: (f) => {
        // Trigger audio for new highlights
        const maxVal = f.array.length; // used for normalization
        for (const [idxStr, type] of Object.entries(f.highlights)) {
          if (prevHighlightsRef.current[Number(idxStr)] === type) continue;
          const normalized = f.array[Number(idxStr)] / maxVal;
          if (type === 'comparing') audioEngine.playComparison(normalized);
          if (type === 'swapping')  audioEngine.playSwap(normalized);
        }
        prevHighlightsRef.current = f.highlights;
        setFrame(f);
      },
      onStatusChange: (s) => setStatus(s),
      onComplete: (f) => {
        setFrame(f);
        audioEngine.playSortedCascade(f.array.length);
      },
    })
  );

  const load = useCallback((algorithm: AlgorithmMeta, array: number[]) => {
    engineRef.current.load(algorithm, array);
    setFrame({ array: [...array], highlights: {}, comparisons: 0, swaps: 0 });
    setStatus('idle');
    prevHighlightsRef.current = {};
  }, []);

  const play   = useCallback(() => engineRef.current.play(),   []);
  const pause  = useCallback(() => engineRef.current.pause(),  []);
  const resume = useCallback(() => engineRef.current.resume(), []);
  const reset  = useCallback(() => engineRef.current.reset(),  []);
  const step   = useCallback(() => engineRef.current.step(),   []);
  const setSpeed = useCallback((ms: number) => engineRef.current.setSpeed(ms), []);

  return { frame, status, load, play, pause, resume, reset, step, setSpeed };
}
