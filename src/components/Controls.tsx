import type { SortState } from '../algorithms/types';

interface Props {
  status: SortState;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStep: () => void;
  onSpeedChange: (ms: number) => void;
  speed: number;
}

// Map slider position (0–100) → delay ms (1–500, exponential feel)
function sliderToMs(val: number): number {
  return Math.round(Math.exp((100 - val) / 100 * Math.log(500)) );
}
function msToSlider(ms: number): number {
  return Math.round(100 - (Math.log(ms) / Math.log(500)) * 100);
}

export function Controls({ status, onPlay, onPause, onResume, onReset, onStep, onSpeedChange, speed }: Props) {
  const sliderVal = msToSlider(speed);

  return (
    <div className="flex items-center gap-3 flex-1">
      {/* Play / Pause / Resume */}
      {status === 'idle' || status === 'done' ? (
        <button
          onClick={onPlay}
          disabled={status === 'done'}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30 transition-colors text-white text-lg"
          title="Play"
        >
          ▶
        </button>
      ) : status === 'running' ? (
        <button
          onClick={onPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-400 transition-colors text-white text-lg"
          title="Pause"
        >
          ⏸
        </button>
      ) : (
        <button
          onClick={onResume}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 transition-colors text-white text-lg"
          title="Resume"
        >
          ▶
        </button>
      )}

      {/* Step */}
      <button
        onClick={onStep}
        disabled={status === 'running' || status === 'done'}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors text-white text-sm"
        title="Step"
      >
        ⏭
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        disabled={status === 'idle'}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors text-white text-sm"
        title="Reset"
      >
        ↺
      </button>

      {/* Speed slider */}
      <div className="flex items-center gap-2 flex-1 max-w-xs">
        <span className="text-white/40 text-xs shrink-0">Slow</span>
        <input
          type="range"
          min={1}
          max={100}
          value={sliderVal}
          onChange={(e) => onSpeedChange(sliderToMs(Number(e.target.value)))}
          className="flex-1 accent-purple-500"
        />
        <span className="text-white/40 text-xs shrink-0">Fast</span>
      </div>
    </div>
  );
}
