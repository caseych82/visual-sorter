import type { SortState } from '../algorithms/types';

interface Props {
  status: SortState;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onStep: () => void;
  onSpeedChange: (ms: number) => void;
  speed: number;
}

// Map slider position (0–100) → delay ms (1–500, exponential feel)
function sliderToMs(val: number): number {
  return Math.round(Math.exp((100 - val) / 100 * Math.log(500)));
}
function msToSlider(ms: number): number {
  return Math.round(100 - (Math.log(ms) / Math.log(500)) * 100);
}

export function Controls({ status, onPlay, onPause, onResume, onStop, onReset, onStep, onSpeedChange, speed }: Props) {
  const sliderVal = msToSlider(speed);
  const isActive  = status === 'running' || status === 'paused';

  return (
    <div className="flex items-center gap-1.5 md:gap-2 flex-1 flex-wrap">
      {/* Play / Pause / Resume */}
      {status === 'idle' || status === 'done' ? (
        <button
          onClick={onPlay}
          disabled={status === 'done'}
          className="h-9 px-4 flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-30 transition-colors text-white text-sm font-medium"
          title="Play"
        >
          ▶ Play
        </button>
      ) : status === 'running' ? (
        <button
          onClick={onPause}
          className="h-9 px-4 flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 transition-colors text-white text-sm font-medium"
          title="Pause"
        >
          ⏸ Pause
        </button>
      ) : (
        <button
          onClick={onResume}
          className="h-9 px-4 flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 transition-colors text-white text-sm font-medium"
          title="Resume"
        >
          ▶ Resume
        </button>
      )}

      {/* Step */}
      <button
        onClick={onStep}
        disabled={status === 'running' || status === 'done'}
        className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors text-white text-sm"
        title="Step"
      >
        ⏭
      </button>

      {/* Stop — halts and freezes current array */}
      <button
        onClick={onStop}
        disabled={!isActive}
        className="h-9 px-3 flex items-center gap-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 disabled:opacity-30 transition-colors text-white text-sm font-medium"
        title="Stop — freeze at current state"
      >
        ■ Stop
      </button>

      {/* Reset — restore original unsorted array */}
      <button
        onClick={onReset}
        disabled={status === 'idle'}
        className="h-9 px-3 flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors text-white text-sm font-medium"
        title="Reset — restore original array"
      >
        ↺ Reset
      </button>

      {/* Speed slider */}
      <div className="flex items-center gap-2 flex-1 min-w-[100px] max-w-xs">
        <span className="text-white/40 text-xs shrink-0">Slow</span>
        <input
          type="range"
          min={1}
          max={100}
          value={sliderVal}
          onChange={(e) => onSpeedChange(sliderToMs(Number(e.target.value)))}
          className="flex-1 accent-orange-500"
        />
        <span className="text-white/40 text-xs shrink-0">Fast</span>
      </div>
    </div>
  );
}
