import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortEngine } from '../hooks/useSortEngine';
import { SortCanvas }    from './SortCanvas';
import type { VizMode }  from './SortCanvas';
import { StatsPanel }    from './StatsPanel';
import { algorithms }    from '../algorithms';
import type { AlgorithmMeta } from '../algorithms/types';
import { audioEngine }   from '../engine/AudioEngine';

type RacePhase = 'idle' | 'countdown' | 'racing' | 'done';
type Winner    = 'left' | 'right' | 'tie' | null;
type ArrayType = 'random' | 'nearly-sorted' | 'reversed' | 'few-unique';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildArray(size: number, type: ArrayType): number[] {
  const a = Array.from({ length: size }, (_, i) => i + 1);
  switch (type) {
    case 'random':        return a.sort(() => Math.random() - 0.5);
    case 'nearly-sorted': {
      const s = Math.max(1, Math.floor(size * 0.05));
      for (let i = 0; i < s; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        [a[x], a[y]] = [a[y], a[x]];
      }
      return a;
    }
    case 'reversed':   return a.reverse();
    case 'few-unique': return a.map(() => Math.ceil(Math.random() * Math.max(4, Math.floor(size / 8))));
  }
}

// ─── Side Panel (algo picker + canvas + stats) ────────────────────────────────

interface SideProps {
  side:        'left' | 'right';
  algo:        AlgorithmMeta | null;
  onSelect:    (a: AlgorithmMeta) => void;
  engine:      ReturnType<typeof useSortEngine>;
  elapsed:     number;
  winner:      Winner;
  phase:       RacePhase;
  disabledIds: string[];
  vizMode:     VizMode;
}

function RaceSide({ side, algo, onSelect, engine, elapsed, winner, phase, disabledIds, vizMode }: SideProps) {
  const isWinner = winner === side;
  const isTie    = winner === 'tie';
  const isDone   = phase === 'done';

  return (
    <div className="flex-1 flex flex-col gap-2 min-w-0">
      {/* Algo picker for this side */}
      <div className="flex flex-wrap gap-1.5">
        {algorithms.map((a) => {
          const isSelected = algo?.id === a.id;
          const isDisabled = disabledIds.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => !isDisabled && onSelect(a)}
              disabled={phase === 'racing' || phase === 'countdown' || isDisabled}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors disabled:opacity-40 ${
                isSelected
                  ? 'bg-orange-600 border-orange-500 text-white'
                  : isDisabled
                  ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {a.name}
            </button>
          );
        })}
      </div>

      {/* Canvas wrapper with winner glow */}
      <div className={`relative flex-1 min-h-0 rounded-2xl overflow-hidden border transition-all duration-500 ${
        isDone && isWinner ? 'border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)]' :
        isDone && isTie    ? 'border-blue-400  shadow-[0_0_30px_rgba(96,165,250,0.3)]'  :
        'border-white/10'
      } bg-[#0d0d14]`}>
        <SortCanvas frame={engine.frame} vizMode={vizMode} label={algo?.name} />

        {/* Winner overlay */}
        <AnimatePresence>
          {isDone && (isWinner || isTie) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`px-8 py-4 rounded-2xl text-3xl font-black backdrop-blur-sm border ${
                  isTie
                    ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                    : 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300'
                }`}
              >
                {isTie ? '🤝 TIE!' : '🏆 WINNER!'}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer + stats */}
      <div className="flex items-center gap-4 shrink-0">
        <ElapsedDisplay ms={elapsed} running={engine.status === 'running'} done={engine.status === 'done'} />
        <StatsPanel frame={engine.frame} algorithm={algo} elapsed={elapsed} />
      </div>
    </div>
  );
}

// Live elapsed display — uses rAF while running, freezes on done
function ElapsedDisplay({ ms, running, done }: { ms: number; running: boolean; done: boolean }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      if (startRef.current === null) startRef.current = performance.now() - display;
      const tick = () => {
        setDisplay(performance.now() - startRef.current!);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (done) setDisplay(ms);
      if (!running && !done) { startRef.current = null; setDisplay(0); }
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, done]);

  return (
    <div className="font-mono text-xl font-bold tabular-nums text-white/80 shrink-0">
      {(display / 1000).toFixed(3)}s
    </div>
  );
}

// ─── Race Layout ──────────────────────────────────────────────────────────────

export function RaceLayout({ vizMode }: { vizMode: VizMode }) {
  const [phase,      setPhase]      = useState<RacePhase>('idle');
  const [countdown,  setCountdown]  = useState<number | string | null>(null);
  const [leftAlgo,   setLeftAlgo]   = useState<AlgorithmMeta | null>(null);
  const [rightAlgo,  setRightAlgo]  = useState<AlgorithmMeta | null>(null);
  const [winner,     setWinner]     = useState<Winner>(null);
  const [arraySize,  setArraySize]  = useState(80);
  const [arrayType,  setArrayType]  = useState<ArrayType>('random');

  const leftEngine  = useSortEngine();
  const rightEngine = useSortEngine();

  const leftDoneTimeRef  = useRef<number | null>(null);
  const rightDoneTimeRef = useRef<number | null>(null);
  const raceStartRef     = useRef<number>(0);

  const leftElapsedRef  = useRef(0);
  const rightElapsedRef = useRef(0);

  const loadBoth = useCallback((
    left: AlgorithmMeta | null,
    right: AlgorithmMeta | null,
    size: number,
    type: ArrayType,
  ) => {
    const arr = buildArray(size, type);
    if (left)  leftEngine.load(left,   [...arr]);
    if (right) rightEngine.load(right, [...arr]);
    setWinner(null);
    leftDoneTimeRef.current  = null;
    rightDoneTimeRef.current = null;
    leftElapsedRef.current   = 0;
    rightElapsedRef.current  = 0;
  }, [leftEngine, rightEngine]);

  // Detect race completion
  useEffect(() => {
    if (phase !== 'racing') return;
    const now = performance.now();

    if (leftEngine.status === 'done' && leftDoneTimeRef.current === null) {
      leftDoneTimeRef.current  = now - raceStartRef.current;
      leftElapsedRef.current   = leftDoneTimeRef.current;
    }
    if (rightEngine.status === 'done' && rightDoneTimeRef.current === null) {
      rightDoneTimeRef.current = now - raceStartRef.current;
      rightElapsedRef.current  = rightDoneTimeRef.current;
    }

    if (leftDoneTimeRef.current !== null && rightDoneTimeRef.current !== null) {
      const diff = leftDoneTimeRef.current - rightDoneTimeRef.current;
      setWinner(Math.abs(diff) < 100 ? 'tie' : diff < 0 ? 'left' : 'right');
      setPhase('done');
    }
  }, [leftEngine.status, rightEngine.status, phase]);

  const startRace = useCallback(async () => {
    if (!leftAlgo || !rightAlgo) return;
    await audioEngine.init();

    loadBoth(leftAlgo, rightAlgo, arraySize, arrayType);
    setPhase('countdown');

    for (const tick of [3, 2, 1]) {
      setCountdown(tick);
      await new Promise<void>((r) => setTimeout(r, 700));
    }
    setCountdown('GO!');
    await new Promise<void>((r) => setTimeout(r, 450));
    setCountdown(null);

    raceStartRef.current = performance.now();
    setPhase('racing');
    leftEngine.play();
    rightEngine.play();
  }, [leftAlgo, rightAlgo, arraySize, arrayType, loadBoth, leftEngine, rightEngine]);

  const resetRace = () => {
    setPhase('idle');
    setWinner(null);
    setCountdown(null);
    leftDoneTimeRef.current  = null;
    rightDoneTimeRef.current = null;
    if (leftAlgo)  leftEngine.load(leftAlgo,   buildArray(arraySize, arrayType));
    if (rightAlgo) rightEngine.load(rightAlgo, buildArray(arraySize, arrayType));
  };

  const canRace = leftAlgo && rightAlgo && phase === 'idle';

  const ARRAY_TYPES: { value: ArrayType; label: string }[] = [
    { value: 'random',        label: 'Random'        },
    { value: 'nearly-sorted', label: 'Nearly Sorted' },
    { value: 'reversed',      label: 'Reversed'      },
    { value: 'few-unique',    label: 'Few Unique'    },
  ];

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* ── Controls bar ── */}
      <div className="flex items-center gap-4 shrink-0 flex-wrap">
        {/* Array type */}
        <div className="flex gap-1.5">
          {ARRAY_TYPES.map(({ value, label }) => (
            <button key={value}
              onClick={() => setArrayType(value)}
              disabled={phase === 'racing' || phase === 'countdown'}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors disabled:opacity-40 ${
                arrayType === value
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Size slider */}
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs">n =</span>
          <input type="range" min={10} max={200} value={arraySize}
            disabled={phase === 'racing' || phase === 'countdown'}
            onChange={(e) => setArraySize(Number(e.target.value))}
            className="w-24 accent-indigo-500 disabled:opacity-40"
          />
          <span className="text-white/60 font-mono text-xs w-8">{arraySize}</span>
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        {phase === 'idle' || phase === 'done' ? (
          <div className="flex gap-2">
            {phase === 'done' && (
              <button onClick={resetRace}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-colors"
              >
                ↺ Reset
              </button>
            )}
            <button onClick={startRace} disabled={!canRace}
              className="px-6 py-2 rounded-lg text-sm font-bold bg-orange-600 hover:bg-orange-500 disabled:opacity-30 text-white transition-colors"
            >
              {phase === 'done' ? '▶ Race Again' : '▶ Race!'}
            </button>
          </div>
        ) : phase === 'countdown' ? (
          <div className="text-white/50 text-sm">Get ready…</div>
        ) : (
          <div className="text-white/50 text-sm animate-pulse">Racing…</div>
        )}
      </div>

      {/* ── Two sides ── */}
      <div className="flex gap-4 flex-1 min-h-0">
        <RaceSide
          side="left"
          algo={leftAlgo}
          onSelect={(a) => { setLeftAlgo(a); if (rightAlgo) loadBoth(a, rightAlgo, arraySize, arrayType); else leftEngine.load(a, buildArray(arraySize, arrayType)); }}
          engine={leftEngine}
          elapsed={leftElapsedRef.current}
          winner={winner}
          phase={phase}
          disabledIds={rightAlgo ? [rightAlgo.id] : []}
          vizMode={vizMode}
        />

        {/* ── Center divider / countdown ── */}
        <div className="flex flex-col items-center justify-center shrink-0 w-16 gap-3">
          <div className="text-white/20 text-xs font-medium">VS</div>
          <AnimatePresence mode="wait">
            {countdown !== null && (
              <motion.div
                key={String(countdown)}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                exit={{    scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`text-4xl font-black tabular-nums ${
                  countdown === 'GO!' ? 'text-green-400' : 'text-white'
                }`}
              >
                {countdown}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <RaceSide
          side="right"
          algo={rightAlgo}
          onSelect={(a) => { setRightAlgo(a); if (leftAlgo) loadBoth(leftAlgo, a, arraySize, arrayType); else rightEngine.load(a, buildArray(arraySize, arrayType)); }}
          engine={rightEngine}
          elapsed={rightElapsedRef.current}
          winner={winner}
          phase={phase}
          disabledIds={leftAlgo ? [leftAlgo.id] : []}
          vizMode={vizMode}
        />
      </div>

      {/* ── Post-race comparison table ── */}
      <AnimatePresence>
        {phase === 'done' && winner && leftAlgo && rightAlgo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{ opacity: 0 }}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <table className="w-full text-sm text-center">
              <thead>
                <tr className="text-white/40 text-xs uppercase tracking-wide">
                  <th className="pb-2 text-left">Metric</th>
                  <th className="pb-2">{leftAlgo.name}</th>
                  <th className="pb-2">{rightAlgo.name}</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                <CompareRow label="Time"
                  left={`${(leftDoneTimeRef.current! / 1000).toFixed(3)}s`}
                  right={`${(rightDoneTimeRef.current! / 1000).toFixed(3)}s`}
                  winnerSide={winner === 'tie' ? null : winner}
                  lowerIsBetter
                  leftVal={leftDoneTimeRef.current!}
                  rightVal={rightDoneTimeRef.current!}
                />
                <CompareRow label="Comparisons"
                  left={leftEngine.frame.comparisons.toLocaleString()}
                  right={rightEngine.frame.comparisons.toLocaleString()}
                  winnerSide={winner === 'tie' ? null : winner}
                  lowerIsBetter
                  leftVal={leftEngine.frame.comparisons}
                  rightVal={rightEngine.frame.comparisons}
                />
                <CompareRow label="Swaps"
                  left={leftEngine.frame.swaps.toLocaleString()}
                  right={rightEngine.frame.swaps.toLocaleString()}
                  winnerSide={winner === 'tie' ? null : winner}
                  lowerIsBetter
                  leftVal={leftEngine.frame.swaps}
                  rightVal={rightEngine.frame.swaps}
                />
                <tr className="text-white/40 text-xs">
                  <td className="pt-2 text-left">Avg complexity</td>
                  <td className="pt-2">{leftAlgo.timeComplexity.average}</td>
                  <td className="pt-2">{rightAlgo.timeComplexity.average}</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompareRow({ label, left, right, lowerIsBetter, leftVal, rightVal }: {
  label: string; left: string; right: string;
  lowerIsBetter: boolean; leftVal: number; rightVal: number;
  winnerSide: 'left' | 'right' | null;
}) {
  const leftWins  = lowerIsBetter ? leftVal < rightVal  : leftVal > rightVal;
  const rightWins = lowerIsBetter ? rightVal < leftVal  : rightVal > leftVal;
  return (
    <tr>
      <td className="py-1 text-left text-white/40">{label}</td>
      <td className={`py-1 font-mono ${leftWins ? 'text-green-400 font-bold' : ''}`}>{left}</td>
      <td className={`py-1 font-mono ${rightWins ? 'text-green-400 font-bold' : ''}`}>{right}</td>
    </tr>
  );
}
