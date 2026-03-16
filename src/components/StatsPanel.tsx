import type { SortFrame, AlgorithmMeta } from '../algorithms/types';

interface Props {
  frame: SortFrame;
  algorithm: AlgorithmMeta | null;
  elapsed: number; // ms
}

export function StatsPanel({ frame, algorithm, elapsed: _elapsed }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm">
      <Stat label="Cmps" value={frame.comparisons.toLocaleString()} color="text-yellow-400" />
      <Stat label="Swaps" value={frame.swaps.toLocaleString()}       color="text-red-400"    />
      {algorithm && (
        <>
          <Stat label="Avg"   value={algorithm.timeComplexity.average} color="text-orange-400" />
          <Stat label="Space" value={algorithm.spaceComplexity}        color="text-green-400"  />
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`font-mono font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-white/30 text-xs">{label}</span>
    </div>
  );
}
