import { useRef, useEffect, useCallback } from 'react';
import type { SortFrame, HighlightType } from '../algorithms/types';

// ─── Color System ─────────────────────────────────────────────────────────────

const HIGHLIGHT: Record<HighlightType, { fill: string; glow: string }> = {
  comparing: { fill: '#FFE000', glow: 'rgba(255,224,0,0.7)'  },
  swapping:  { fill: '#FF3C3C', glow: 'rgba(255,60,60,0.8)'  },
  pivot:     { fill: '#00FFCC', glow: 'rgba(0,255,204,0.7)'  },
  sorted:    { fill: '#00FF88', glow: 'rgba(0,255,136,0.5)'  },
};

function defaultColor(norm: number): string {
  const hue  = Math.round(norm * 260 + 10);
  const lite = 45 + norm * 15;
  return `hsl(${hue}, 90%, ${lite}%)`;
}

// ─── Renderers ────────────────────────────────────────────────────────────────

function drawBars(
  ctx: CanvasRenderingContext2D,
  array: number[],
  highlights: SortFrame['highlights'],
  smoothed: Float32Array,
  W: number,
  H: number,
) {
  const n      = array.length;
  const maxVal = Math.max(...array);
  const gap    = Math.max(1, Math.floor(W / n * 0.08));
  const barW   = W / n - gap;

  ctx.clearRect(0, 0, W, H);

  for (let i = 0; i < n; i++) {
    const barH      = smoothed[i];
    const x         = i * (W / n) + gap / 2;
    const y         = H - barH;
    const norm      = array[i] / maxVal;
    const hlType    = highlights[i] as HighlightType | undefined;
    const hlColors  = hlType ? HIGHLIGHT[hlType] : null;
    const fillColor = hlColors ? hlColors.fill : defaultColor(norm);

    if (hlColors) {
      ctx.save();
      ctx.shadowColor = hlColors.glow;
      ctx.shadowBlur  = 18;
      ctx.fillStyle   = fillColor;
      ctx.fillRect(x, y, barW, barH);
      ctx.shadowBlur  = 8;
      ctx.fillRect(x, y, barW, barH);
      ctx.restore();
    } else {
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, barW, barH);
    }

    ctx.fillStyle = hlColors ? fillColor : `hsl(${Math.round(norm * 260 + 10)}, 100%, 80%)`;
    ctx.fillRect(x, y, barW, Math.min(2, barH));
  }
}

function drawTetris(
  ctx: CanvasRenderingContext2D,
  array: number[],
  highlights: SortFrame['highlights'],
  smoothed: Float32Array,
  W: number,
  H: number,
) {
  const n      = array.length;
  const maxVal = Math.max(...array);

  const colSlot    = W / n;
  const colGap     = Math.max(1, Math.floor(colSlot * 0.12));
  const cellW      = Math.max(2, colSlot - colGap);
  const targetRows = Math.max(12, Math.min(40, Math.floor(H / 10)));
  const cellH      = Math.max(2, Math.floor(H / targetRows));
  const cellGap    = cellH <= 3 ? 0 : 1;
  const numRows    = Math.floor(H / (cellH + cellGap));

  ctx.clearRect(0, 0, W, H);

  for (let i = 0; i < n; i++) {
    const norm       = array[i] / maxVal;
    const filledRows = Math.round((smoothed[i] / (H - 2)) * numRows);
    const x          = i * colSlot + colGap / 2;
    const hlType     = highlights[i] as HighlightType | undefined;
    const hlColors   = hlType ? HIGHLIGHT[hlType] : null;
    const baseColor  = hlColors ? hlColors.fill : defaultColor(norm);
    const rounded    = cellH >= 6 && cellW >= 6;
    const r          = rounded ? Math.min(2, cellH / 4, cellW / 4) : 0;

    if (hlColors) {
      ctx.save();
      ctx.shadowColor = hlColors.glow;
      ctx.shadowBlur  = 10;
    }

    for (let row = 0; row < filledRows; row++) {
      const y = H - (row + 1) * (cellH + cellGap);
      if (y < 0) break;

      if (hlColors) {
        ctx.fillStyle = baseColor;
      } else {
        const rowNorm = row / Math.max(1, filledRows - 1);
        const hue     = Math.round(norm * 260 + 10);
        const lite    = Math.round(35 + rowNorm * 25);
        ctx.fillStyle = `hsl(${hue}, 90%, ${lite}%)`;
      }

      if (rounded) {
        ctx.beginPath();
        ctx.roundRect(x, y, cellW, cellH, r);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, cellW, cellH);
      }
    }

    if (hlColors) ctx.restore();

    if (filledRows > 0) {
      const topY = H - filledRows * (cellH + cellGap);
      if (topY >= 0) {
        ctx.fillStyle = hlColors
          ? baseColor
          : `hsl(${Math.round(norm * 260 + 10)}, 100%, 82%)`;
        const capH = Math.min(2, cellH);
        if (rounded) {
          ctx.beginPath();
          ctx.roundRect(x, topY, cellW, capH, Math.min(r, capH / 2));
          ctx.fill();
        } else {
          ctx.fillRect(x, topY, cellW, capH);
        }
      }
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export type VizMode = 'bars' | 'tetris';

interface Props {
  frame:   SortFrame;
  vizMode: VizMode;
  label?:  string;
}

export function SortCanvas({ frame, vizMode, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number | null>(null);
  const smoothedRef  = useRef<Float32Array>(new Float32Array(0));

  // Refs so the stable draw() can always read the latest values without
  // being recreated — this is what prevents the flicker.
  const frameRef   = useRef(frame);
  const vizModeRef = useRef(vizMode);

  // Sync refs every render (synchronous, no useEffect lag)
  frameRef.current = frame;
  if (vizModeRef.current !== vizMode) {
    vizModeRef.current  = vizMode;
    smoothedRef.current = new Float32Array(0); // force reinit on next draw
  }

  // Stable draw — created once, never recreated
  const draw = useCallback(() => {
    rafRef.current = null;

    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { array, highlights } = frameRef.current;
    if (array.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const W      = canvas.width;
    const H      = canvas.height;
    const maxVal = Math.max(...array);
    const n      = array.length;

    if (smoothedRef.current.length !== n) {
      smoothedRef.current = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        smoothedRef.current[i] = (array[i] / maxVal) * (H - 2);
      }
    }

    let stillMoving = false;
    for (let i = 0; i < n; i++) {
      const target = (array[i] / maxVal) * (H - 2);
      const next   = smoothedRef.current[i] + (target - smoothedRef.current[i]) * 0.3;
      smoothedRef.current[i] = next;
      if (Math.abs(next - target) > 0.4) stillMoving = true;
    }

    if (vizModeRef.current === 'tetris') {
      drawTetris(ctx, array, highlights, smoothedRef.current, W, H);
    } else {
      drawBars(ctx, array, highlights, smoothedRef.current, W, H);
    }

    if (stillMoving) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, []); // intentionally empty — reads everything from refs

  // When a new frame arrives, ensure the loop is running.
  // Never cancel a running loop — just make sure one is scheduled.
  useEffect(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, [frame, draw]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // Resize canvas to match container
  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        canvas.width  = Math.round(width);
        canvas.height = Math.round(height);
        smoothedRef.current = new Float32Array(0);
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(draw);
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {label && (
        <div className="absolute top-3 left-4 text-sm font-semibold text-white/60 tracking-wide pointer-events-none">
          {label}
        </div>
      )}
    </div>
  );
}
