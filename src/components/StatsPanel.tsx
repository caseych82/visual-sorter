import type { SortFrame, AlgorithmMeta } from '../algorithms/types';

interface Props {
  frame: SortFrame;
  algorithm: AlgorithmMeta | null;
  elapsed: number; // ms
}

export function StatsPanel({ frame, algorithm, elapsed: _elapsed }: Props) {
  return (
    <div className="flex items-center gap-6 text-sm shrink-0">
      <Stat label="Comparisons" value={frame.comparisons.toLocaleString()} color="text-yellow-400" />
      <Stat label="Swaps"       value={frame.swaps.toLocaleString()}       color="text-red-400"    />
      <Stat label="Elements"    value={frame.array.length.toLocaleString()} color="text-blue-400"  />
      {algorithm && (
        <>
          <Stat label="Avg"   value={algorithm.timeComplexity.average} color="text-purple-400" />
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
