import { useEffect, useRef, useState } from 'react';
import type { SortState } from '../algorithms/types';

interface Props {
  status: SortState;
  swapCount: number;
}

export function ActivityBackground({ status, swapCount }: Props) {
  const [swapFlash, setSwapFlash] = useState(false);
  const lastSwapRef = useRef(0);

  useEffect(() => {
    if (status === 'idle') { lastSwapRef.current = 0; return; }
    if (swapCount > lastSwapRef.current && status === 'running') {
      lastSwapRef.current = swapCount;
      setSwapFlash(true);
      const t = setTimeout(() => setSwapFlash(false), 180);
      return () => clearTimeout(t);
    }
  }, [swapCount, status]);

  const running = status === 'running';
  const done    = status === 'done';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Purple blob — top-left */}
      <div
        style={{
          position: 'absolute',
          width: 700, height: 700,
          top: -200, left: -200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 65%)',
          opacity: running ? 1 : 0.35,
          animation: running ? 'blobDrift1 9s ease-in-out infinite' : undefined,
          transition: 'opacity 2s ease',
        }}
      />

      {/* Blue blob — bottom-right */}
      <div
        style={{
          position: 'absolute',
          width: 560, height: 560,
          bottom: -140, right: -140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,78,216,0.18) 0%, transparent 65%)',
          opacity: running ? 1 : 0.3,
          animation: running ? 'blobDrift2 13s ease-in-out infinite' : undefined,
          transition: 'opacity 2s ease',
        }}
      />

      {/* Reactive center blob — teal → red on swap → green on done */}
      <div
        style={{
          position: 'absolute',
          width: 460, height: 460,
          top: '35%', left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: swapFlash
            ? 'radial-gradient(circle, rgba(239,68,68,0.22) 0%, transparent 65%)'
            : done
            ? 'radial-gradient(circle, rgba(0,255,136,0.18) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 65%)',
          opacity: running || done ? 1 : 0.25,
          transition: 'background 0.12s ease, opacity 1.5s ease',
        }}
      />
    </div>
  );
}
