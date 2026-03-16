// Phase 4/5: Visual countdown / elapsed timer

import { useEffect, useRef, useState } from 'react';
import type { SortState } from '../algorithms/types';

interface Props {
  status: SortState;
}

export function Timer({ status }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number | null>(null);

  useEffect(() => {
    if (status === 'running') {
      if (startRef.current === null) startRef.current = performance.now() - elapsed;
      const tick = () => {
        setElapsed(performance.now() - startRef.current!);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (status === 'idle') {
        startRef.current = null;
        setElapsed(0);
      }
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [status]);

  const secs = (elapsed / 1000).toFixed(3);

  return (
    <div className="font-mono text-2xl text-white/80 tabular-nums">
      {secs}s
    </div>
  );
}
