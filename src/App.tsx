import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSortEngine }         from './hooks/useSortEngine';
import { SortCanvas }            from './components/SortCanvas';
import type { VizMode }          from './components/SortCanvas';
import { AlgoSelector }          from './components/AlgoSelector';
import { Controls }              from './components/Controls';
import { StatsPanel }            from './components/StatsPanel';
import { Timer }                 from './components/Timer';
import { RaceLayout }            from './components/RaceLayout';
import { ActivityBackground }    from './components/ActivityBackground';
import { IntroScreen }           from './components/IntroScreen';
import { AlgoInfoPanel }         from './components/AlgoInfoPanel';
import { algorithms }            from './algorithms';
import type { AlgorithmMeta }    from './algorithms/types';
import { audioEngine }           from './engine/AudioEngine';

type Mode      = 'single' | 'race';
type ArrayType = 'random' | 'nearly-sorted' | 'reversed' | 'few-unique';

// ─── Array generators ─────────────────────────────────────────────────────────

function buildArray(size: number, type: ArrayType): number[] {
  const a = Array.from({ length: size }, (_, i) => i + 1);
  switch (type) {
    case 'random':
      return a.sort(() => Math.random() - 0.5);
    case 'nearly-sorted': {
      const swaps = Math.max(1, Math.floor(size * 0.05));
      for (let i = 0; i < swaps; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        [a[x], a[y]] = [a[y], a[x]];
      }
      return a;
    }
    case 'reversed':
      return a.reverse();
    case 'few-unique':
      return a.map(() => Math.ceil(Math.random() * Math.max(4, Math.floor(size / 8))));
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [showIntro, setShowIntro]       = useState(true);
  const [infoAlgo, setInfoAlgo]         = useState<AlgorithmMeta | null>(null);
  const [mode, setMode]                 = useState<Mode>('single');
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmMeta | null>(null);
  const [arrayType, setArrayType]       = useState<ArrayType>('random');
  const [arraySize, setArraySize]       = useState(80);
  const [speed, setSpeed]               = useState(3);
  const [audioReady, setAudioReady]     = useState(false);
  const [vizMode, setVizMode]           = useState<VizMode>('tetris');
  const [muted, setMuted]               = useState(false);
  const [volume, setVolume]             = useState(75); // 0–100
  const [isFullscreen, setIsFullscreen] = useState(false);

  const elapsedRef   = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  // ── Fullscreen ───────────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const engine = useSortEngine();

  // Force single mode on narrow screens (race mode needs side-by-side space)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const enforce = (e: MediaQueryList | MediaQueryListEvent) => {
      if (e.matches) setMode('single');
    };
    enforce(mq);
    mq.addEventListener('change', enforce as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener('change', enforce as (e: MediaQueryListEvent) => void);
  }, []);

  // ── Build & load a fresh array ──────────────────────────────────────────────
  const loadFresh = useCallback((algo: AlgorithmMeta | null, size: number, type: ArrayType) => {
    if (!algo) return;
    engine.load(algo, buildArray(size, type));
    startTimeRef.current = null;
    elapsedRef.current   = 0;
  }, [engine]);

  // Seed canvas on first mount with a random array (no algo yet — just visuals)
  useEffect(() => {
    engine.load(
      {
        id: '__preview__', name: 'Preview',
        timeComplexity: { best: '-', average: '-', worst: '-' },
        spaceComplexity: '-', description: '', explanation: '', codeExample: '',
        generator: function* () {},
      },
      buildArray(80, 'random'),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track elapsed time
  useEffect(() => {
    if (engine.status === 'running' && startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }
    if (engine.status === 'idle') {
      startTimeRef.current = null;
      elapsedRef.current   = 0;
    }
    if (engine.status === 'done' && startTimeRef.current !== null) {
      elapsedRef.current = performance.now() - startTimeRef.current;
    }
  }, [engine.status]);

  // ── Audio ───────────────────────────────────────────────────────────────────
  const handleFirstInteraction = useCallback(async () => {
    if (audioReady) return;
    await audioEngine.init();
    setAudioReady(true);
  }, [audioReady]);

  const handleMuteToggle = () => {
    const next = !muted;
    setMuted(next);
    next ? audioEngine.mute() : audioEngine.unmute();
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    // Map 0–100 → -40 dB–0 dB (–Infinity at 0 = silence)
    const db = val === 0 ? -Infinity : -40 + (val / 100) * 40;
    audioEngine.setVolume(db);
    if (muted && val > 0) { audioEngine.unmute(); setMuted(false); }
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAlgoSelect = (algo: AlgorithmMeta) => {
    handleFirstInteraction();
    setSelectedAlgo(algo);
    loadFresh(algo, arraySize, arrayType);
  };

  const handleNewArray = () => loadFresh(selectedAlgo, arraySize, arrayType);

  const ARRAY_TYPES: { value: ArrayType; label: string }[] = [
    { value: 'random',        label: 'Random'        },
    { value: 'nearly-sorted', label: 'Nearly Sorted' },
    { value: 'reversed',      label: 'Reversed'      },
    { value: 'few-unique',    label: 'Few Unique'    },
  ];

  return (
    <AnimatePresence mode="wait">
      {showIntro && (
        <IntroScreen key="intro" onStart={() => setShowIntro(false)} />
      )}
      {!showIntro && (
    <motion.div
      key="main"
      className="min-h-screen text-white flex flex-col select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55 }}
    >

      {/* ── Animated gradient background ── */}
      <ActivityBackground status={engine.status} swapCount={engine.frame.swaps} />

      {/* ── Header — glassmorphism ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-black/30 backdrop-blur-xl shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight leading-none">
            Visual<span className="text-orange-400">Sorter</span>
          </h1>
          <a
            href="https://github.com/caseych82"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/25 hover:text-white/50 text-[10px] font-mono tracking-wider transition-colors leading-none mt-0.5"
          >
            github.com/caseych82
          </a>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Viz mode toggle */}
          <div className="flex rounded-lg border border-white/10 overflow-hidden bg-white/5">
            <button
              onClick={() => setVizMode('bars')}
              title="Bar chart"
              className={`px-3 py-1.5 text-sm transition-colors ${
                vizMode === 'bars' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              ▐▐▐▐
            </button>
            <button
              onClick={() => setVizMode('tetris')}
              title="Tetris grid"
              className={`px-3 py-1.5 text-sm transition-colors border-l border-white/10 ${
                vizMode === 'tetris' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              ⊞
            </button>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleMuteToggle}
              title={muted ? 'Unmute' : 'Mute'}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm"
            >
              {muted || volume === 0 ? '🔇' : volume < 40 ? '🔉' : '🔊'}
            </button>
            <input
              type="range" min={0} max={100} value={muted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 accent-orange-500 hidden sm:block"
              title="Volume"
            />
          </div>

          {/* Mode toggle — desktop only (race needs horizontal space) */}
          <div className="hidden md:flex gap-1 rounded-lg border border-white/10 overflow-hidden bg-white/5">
            {(['single', 'race'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  mode === m ? 'bg-orange-600 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen'}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/60 hover:text-white"
          >
            {isFullscreen ? '⊡' : '⛶'}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col gap-3 p-3 md:p-4 min-h-0">
        {mode === 'single' ? (
          <>
            {/* ── Row 1: algo picker ── */}
            <AlgoSelector
              algorithms={algorithms}
              selected={selectedAlgo}
              onSelect={handleAlgoSelect}
              onInfo={setInfoAlgo}
            />

            {/* ── Row 2: array controls ── */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm shrink-0">
              <div className="flex gap-1.5 flex-wrap">
                {ARRAY_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setArrayType(value);
                      if (selectedAlgo) loadFresh(selectedAlgo, arraySize, value);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      arrayType === value
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white/40 text-xs">n =</span>
                <input
                  type="range" min={10} max={300} value={arraySize}
                  onChange={(e) => {
                    const s = Number(e.target.value);
                    setArraySize(s);
                    if (selectedAlgo) loadFresh(selectedAlgo, s, arrayType);
                  }}
                  className="w-24 md:w-28 accent-indigo-500"
                />
                <span className="text-white/60 text-xs font-mono w-8">{arraySize}</span>
              </div>

              <button
                onClick={handleNewArray}
                className="px-3 py-1 rounded text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                ⟳ New Array
              </button>
            </div>

            {/* ── Row 3: controls bar ── */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 shrink-0 px-3 py-2 rounded-2xl bg-black/20 backdrop-blur-md border border-white/5">
              <Timer status={engine.status} />
              <Controls
                status={engine.status}
                onPlay={engine.play}
                onPause={engine.pause}
                onResume={engine.resume}
                onStop={engine.stop}
                onReset={engine.reset}
                onStep={engine.step}
                onSpeedChange={(ms) => { setSpeed(ms); engine.setSpeed(ms); }}
                speed={speed}
              />
              <StatsPanel
                frame={engine.frame}
                algorithm={selectedAlgo}
                elapsed={elapsedRef.current}
              />
            </div>

            {/* ── Row 4: canvas (flex-1) ── */}
            <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d14]/90 backdrop-blur-sm">
              <SortCanvas
                frame={engine.frame}
                vizMode={vizMode}
                label={selectedAlgo?.name}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0">
            <RaceLayout vizMode={vizMode} />
          </div>
        )}
      </main>

      <AlgoInfoPanel algo={infoAlgo} onClose={() => setInfoAlgo(null)} />
    </motion.div>
      )}
    </AnimatePresence>
  );
}
