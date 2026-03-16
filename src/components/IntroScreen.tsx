import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// ── 5×7 pixel font (5 bits per row, MSB = leftmost pixel) ─────────────────────
const FONT: Record<string, number[]> = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  'A': [0b00100, 0b01010, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  'B': [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  'C': [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  'E': [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  'I': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  'L': [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  'O': [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'R': [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  'S': [0b01110, 0b10001, 0b10000, 0b01110, 0b00001, 0b10001, 0b01110],
  'T': [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  'U': [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  'V': [0b10001, 0b10001, 0b10001, 0b01010, 0b01010, 0b00100, 0b00100],
  'Y': [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  'H': [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111],
};

const TITLE_LINES = ['VISUAL SORTER'];
const CHAR_W = 5, CHAR_H = 7, GAP_X = 1, GAP_Y = 3;

interface TitleCell { col: number; row: number; lineIdx: number; fraction: number; }

function buildTitleCells(numCols: number, numRows: number): TitleCell[] {
  const lineStride = CHAR_H + GAP_Y; // 10 rows per line
  const totalH = TITLE_LINES.length * lineStride - GAP_Y; // 17 rows total
  const startRow = Math.floor((numRows - totalH) / 2);
  const cells: TitleCell[] = [];

  TITLE_LINES.forEach((line, li) => {
    const lineW = line.length * (CHAR_W + GAP_X) - GAP_X;
    const startCol = Math.floor((numCols - lineW) / 2);
    const rowOff = startRow + li * lineStride;

    [...line].forEach((ch, ci) => {
      const bitmap = FONT[ch];
      if (!bitmap) return;
      const colOff = startCol + ci * (CHAR_W + GAP_X);
      bitmap.forEach((bits, ri) => {
        for (let b = 0; b < CHAR_W; b++) {
          if (bits & (1 << (CHAR_W - 1 - b))) {
            const col = colOff + b;
            const row = rowOff + ri;
            if (col >= 0 && col < numCols && row >= 0 && row < numRows) {
              const fraction = lineW > 0 ? (col - startCol) / lineW : 0;
              cells.push({ col, row, lineIdx: li, fraction });
            }
          }
        }
      });
    });
  });

  return cells;
}

function getTitleColor(lineIdx: number, fraction: number): string {
  if (lineIdx === 0) {
    // "VISUAL SORTER" — cyan → magenta
    const h = 180 + fraction * 130;
    return `hsl(${h}, 100%, 65%)`;
  }
  // "CASEYCH82" — gold → bright yellow
  const h = 42 + fraction * 18;
  return `hsl(${h}, 100%, 62%)`;
}

interface Stream { col: number; y: number; speed: number; hue: number; }

interface SimState {
  streams: Stream[];
  brightness: Float32Array;
  hues: Float32Array;       // -1 = white head
  isTitleCell: Uint8Array;
  titleCells: TitleCell[];
  numCols: number;
  numRows: number;
  cell: number;
  frameCount: number;
}

export function IntroScreen({ onStart }: { onStart: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<SimState | null>(null);
  const rafRef    = useRef<number>(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width;
    const H = canvas.height;

    // Fit "VISUAL SORTER" (77 font-units wide) into 90% of viewport width
    const lineUnits = TITLE_LINES[0].length * (CHAR_W + GAP_X) - GAP_X; // = 77
    const cell = Math.max(4, Math.min(15, Math.floor(W * 0.90 / lineUnits)));
    const numCols = Math.ceil(W / cell);
    const numRows = Math.ceil(H / cell);
    const n = numCols * numRows;

    const brightness  = new Float32Array(n);
    const hues        = new Float32Array(n);
    const isTitleCell = new Uint8Array(n);
    for (let i = 0; i < n; i++) hues[i] = Math.random() * 360;

    const titleCells = buildTitleCells(numCols, numRows);
    for (const { col, row } of titleCells) {
      isTitleCell[row * numCols + col] = 1;
    }

    // 1–2 streams per column, staggered randomly across screen height
    const streams: Stream[] = [];
    for (let col = 0; col < numCols; col++) {
      const count = 1 + (Math.random() < 0.45 ? 1 : 0);
      for (let k = 0; k < count; k++) {
        streams.push({
          col,
          y: -Math.random() * numRows,
          speed: 0.35 + Math.random() * 0.55,
          hue: Math.floor(Math.random() * 360),
        });
      }
    }

    stateRef.current = {
      streams, brightness, hues, isTitleCell, titleCells,
      numCols, numRows, cell, frameCount: 0,
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas || !s) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { streams, brightness, hues, isTitleCell, titleCells, numCols, numRows, cell } = s;
    const box = Math.max(2, cell - 2);
    s.frameCount++;

    // ── Simulation tick (every 2 rAF frames → ~30Hz) ──────────────────────────
    if (s.frameCount % 2 === 0) {
      // Fade all cells
      for (let i = 0; i < brightness.length; i++) brightness[i] *= 0.88;

      for (const stream of streams) {
        stream.y += stream.speed;
        if (stream.y > numRows + 8) {
          stream.y   = -4 - Math.random() * 20;
          stream.hue = Math.floor(Math.random() * 360);
        }
        const head = Math.floor(stream.y);
        for (let t = 0; t < 8; t++) {
          const row = head - t;
          if (row < 0 || row >= numRows) continue;
          const idx = row * numCols + stream.col;
          const b = Math.max(0, 1 - t * 0.15);
          if (b > brightness[idx]) {
            brightness[idx] = b;
            hues[idx] = t === 0 ? -1 : stream.hue; // -1 = white head
          }
        }
      }
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rain cells (non-title only)
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const idx = row * numCols + col;
        if (isTitleCell[idx]) continue;
        const b = brightness[idx];
        if (b < 0.04) continue;
        const h = hues[idx];
        if (h < 0) {
          // White head
          const a = (b * 0.9).toFixed(2);
          ctx.fillStyle = `rgba(255,255,255,${a})`;
        } else {
          ctx.fillStyle = `hsl(${h | 0},100%,${Math.round(b * 62)}%)`;
        }
        ctx.fillRect(col * cell + 1, row * cell + 1, box, box);
      }
    }

    // Title glow pass (blurred for halo effect)
    const pulse = 0.85 + 0.15 * Math.sin(s.frameCount * 0.05);
    ctx.filter = 'blur(6px)';
    ctx.globalAlpha = 0.5 * pulse;
    for (const { col, row, lineIdx, fraction } of titleCells) {
      ctx.fillStyle = getTitleColor(lineIdx, fraction);
      ctx.fillRect(col * cell + 1, row * cell + 1, box, box);
    }

    // Title sharp pass
    ctx.filter = 'none';
    ctx.globalAlpha = 0.9 + 0.1 * pulse;
    for (const { col, row, lineIdx, fraction } of titleCells) {
      ctx.fillStyle = getTitleColor(lineIdx, fraction);
      ctx.fillRect(col * cell + 1, row * cell + 1, box, box);
    }

    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    init();
    window.addEventListener('resize', init);
    const loop = () => { draw(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', init);
    };
  }, [init, draw]);

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* START button — positioned below the vertically-centred title */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-5"
        style={{ top: '76%' }}
      >
        <motion.button
          onClick={onStart}
          className="start-btn"
          whileHover={{ scale: 1.06, y: -3 }}
          whileTap={{ y: 6, scale: 0.97 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          START
        </motion.button>

        <motion.p
          className="insert-coin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          PRESS TO PLAY
        </motion.p>

        <motion.a
          href="https://github.com/caseych82"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/30 hover:text-white/60 text-xs font-mono tracking-widest transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          github.com/caseych82
        </motion.a>
      </div>
    </motion.div>
  );
}
