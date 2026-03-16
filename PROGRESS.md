# Visual Sorter — Build Progress

> Living document. Update as phases complete.
> Started: 2026-03-15

---

## Stack
- React 19 + TypeScript + Vite 8
- Tone.js v15 (audio)
- Framer Motion v12 (UI animation)
- Tailwind CSS v3 + PostCSS (styling)
- Canvas 2D API (visualization)
- GitHub Pages (deployment target)

---

## Phase 1 — Foundation
**Status:** `[x] Complete`

- [x] Init repo: `npm create vite@latest visual-sorter -- --template react-ts`
- [x] Install deps: Tone.js, Framer Motion, Tailwind v3 + PostCSS
- [x] Scaffold component tree (empty shells)
- [x] Build `SortEngine.ts` — generator runner with play/pause/speed/reset
- [x] Build `AudioEngine.ts` — value → pitch (pentatonic C major), swap → MetalSynth click

---

## Phase 2 — Visualization Core
**Status:** `[x] Complete`

- [x] `SortCanvas.tsx` — Canvas 2D renderer with ResizeObserver
- [x] Color system: HSL rainbow by value + highlight overlay (yellow/red/cyan/green) with glow
- [x] Top cap highlight per bar for depth
- [x] Smooth lerp animation between frames via rAF
- [x] **Flicker fix** — `draw` is a stable function (no deps); reads `frame` + `vizMode` via refs. Never cancels a running rAF loop, only schedules one if none is active.

---

## Phase 3 — Algorithms
**Status:** `[x] Complete`

- [x] Bubble Sort
- [x] Selection Sort
- [x] Insertion Sort
- [x] Merge Sort
- [x] Quick Sort
- [x] Heap Sort
- [x] Shell Sort
- [x] Radix Sort

Each exports: `{ name, timeComplexity, spaceComplexity, description, generator }`

---

## Phase 3.5 — Additional Algorithms (unplanned addition)
**Status:** `[x] Complete`

- [x] Cocktail Shaker Sort — bidirectional bubble; forward then backward pass each iteration
- [x] Comb Sort — shrinking-gap bubble (gap ÷ 1.3); long-range swaps early, very aggressive
- [x] Gnome Sort — chaotic back-and-forth; advances on order, swaps and retreats on disorder
- [x] Odd-Even Sort — alternating odd/even adjacent pair passes; creates wave-like visual patterns
- [x] Pancake Sort — finds max, flips it to front, flips to position; dramatic full prefix reversals

---

## Phase 4 — Single Algorithm Mode
**Status:** `[x] Complete`

- [x] Algorithm picker (pill buttons, purple highlight)
- [x] Array size slider (10–300 elements)
- [x] Speed slider (exponential — slow↔fast feel)
- [x] Live stats: comparisons, swaps, element count, complexity badges
- [x] Array type selector: random / nearly-sorted / reversed / few-unique
- [x] New Array shuffle button
- [x] Play / Pause / Resume / Step controls
- [x] **Stop** button — halts mid-sort, freezes partial array, returns to idle (gen discarded, no restore)
- [x] **Reset** button — restores original unsorted array, returns to idle
- [x] rAF-based Timer component

---

## Phase 5 — Race Mode
**Status:** `[x] Complete`

- [x] `RaceLayout.tsx` — two `SortCanvas` side by side with shared array
- [x] Algo picker per side (opposing algo greyed out to prevent duplicates)
- [x] Synchronized countdown: 3 → 2 → 1 → GO! (Framer Motion animated)
- [x] Independent rAF timers per side, freeze on completion
- [x] Winner: gold glow border + pulsing 🏆 WINNER! overlay / 🤝 TIE!
- [x] Post-race comparison table (time, comparisons, swaps, complexity)
- [x] Array type + size controls in race mode
- [x] Race Again + Reset buttons

---

## Phase 5.5 — Visualization Modes (unplanned addition)
**Status:** `[x] Complete`

- [x] `VizMode` type: `'bars' | 'tetris'`
- [x] Toggle in header (pill button group, persists across Single and Race modes)
- [x] **Bars** — original vertical bar chart with glow highlights and top cap
- [x] **Tetris** — stacked discrete square cells per column; brightness gradient bottom→top; rounded corners when cells ≥ 6px; same glow highlight system as bars
- [x] Seamless hot-swap mid-sort (smoothed buffer resets, snaps to current positions)
- [x] `vizMode` threaded through `App → RaceLayout → RaceSide → SortCanvas`

---

## Phase 6 — Polish & Deploy
**Status:** `[x] Complete`

- [x] Responsive layout (mobile: single mode only; race tab hidden below md breakpoint; controls wrap gracefully)
- [x] Glassmorphism UI (header: `bg-black/30 backdrop-blur-xl`; bottom bar: `bg-black/20 backdrop-blur-md rounded-2xl`; viz toggle + mode toggle get `bg-white/5` backing)
- [x] `ActivityBackground.tsx` — 3 radial-gradient blobs: purple (top-left) + blue (bottom-right) drift with CSS keyframe animations when sorting runs; center teal blob flashes red on each swap, turns green on completion
- [x] Mute/unmute button (🔊/🔉/🔇) + volume slider (0–100 → −40 dB–0 dB) in header
- [x] `gh-pages` deploy scripts added (`npm run deploy`); vite base set to `'./'` for build; repo pushed to GitHub

---

## Notes / Decisions Log

| Date | Decision |
|---|---|
| 2026-03-15 | Chose React + TS + Vite over Python/Pygame and Swift for web shareability and Web Audio API |
| 2026-03-15 | Algorithms as async generators yielding SortFrame — decouples logic from render/audio |
| 2026-03-15 | Pentatonic C major scale for audio mapping — sounds musical not random |
| 2026-03-15 | Tailwind v3 + PostCSS used instead of `@tailwindcss/vite` — incompatible with Vite 8 |
| 2026-03-15 | Tetris viz mode added as user request between Phase 5 and Phase 6 |
| 2026-03-15 | Canvas flicker fix: stable `draw` fn reads from refs, never cancels a running rAF loop |
| 2026-03-15 | Phase 6: ActivityBackground blobs use inline `animation` style (not Tailwind) so keyframe names don't need safelist |
| 2026-03-15 | StrictMode RAF bug fixed: cleanup now resets `rafRef.current = null` after cancel so remount can schedule draws |
| 2026-03-15 | Stop vs Reset distinction: Stop keeps partial array (useful for inspection), Reset restores original unsorted |
| 2026-03-15 | 5 additional algorithms added post-Phase 6; Pancake uses `yield*` generator delegation for flip subroutine |
