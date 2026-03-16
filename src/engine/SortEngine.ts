import type { SortFrame, SortState, AlgorithmMeta } from '../algorithms/types';

export interface SortEngineCallbacks {
  onFrame: (frame: SortFrame) => void;
  onStatusChange: (status: SortState) => void;
  onComplete: (frame: SortFrame) => void;
}

export class SortEngine {
  private gen: Generator<SortFrame, void, unknown> | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private _status: SortState = 'idle';
  private _speed: number = 50; // ms between steps
  private lastFrame: SortFrame | null = null;
  private callbacks: SortEngineCallbacks;
  private algorithm: AlgorithmMeta | null = null;
  private initialArray: number[] = [];

  constructor(callbacks: SortEngineCallbacks) {
    this.callbacks = callbacks;
  }

  load(algorithm: AlgorithmMeta, array: number[]) {
    this.clearTimer();
    this.algorithm = algorithm;
    this.initialArray = [...array];
    this.gen = null;
    this.lastFrame = null;
    this.setStatus('idle');
  }

  play() {
    if (this._status === 'running' || this._status === 'done') return;
    if (!this.gen) {
      if (!this.algorithm) return;
      this.gen = this.algorithm.generator([...this.initialArray]);
    }
    this.setStatus('running');
    this.schedule();
  }

  pause() {
    if (this._status !== 'running') return;
    this.clearTimer();
    this.setStatus('paused');
  }

  resume() {
    if (this._status !== 'paused') return;
    this.setStatus('running');
    this.schedule();
  }

  // Stop: halt mid-sort and freeze at current array state (no restore)
  stop() {
    if (this._status === 'idle') return;
    this.clearTimer();
    this.gen = null;
    if (this.lastFrame) {
      this.callbacks.onFrame({ ...this.lastFrame, highlights: {} });
    }
    this.setStatus('idle');
  }

  // Reset: restore the original unsorted array
  reset() {
    this.clearTimer();
    this.gen = null;
    this.lastFrame = null;
    this.setStatus('idle');
    if (this.algorithm) {
      const resetFrame: SortFrame = {
        array: [...this.initialArray],
        highlights: {},
        comparisons: 0,
        swaps: 0,
      };
      this.callbacks.onFrame(resetFrame);
    }
  }

  step() {
    if (this._status === 'done') return;
    if (!this.gen) {
      if (!this.algorithm) return;
      this.gen = this.algorithm.generator([...this.initialArray]);
    }
    this.clearTimer();
    if (this._status === 'idle') this.setStatus('paused');
    this.tick();
  }

  setSpeed(ms: number) {
    this._speed = Math.max(1, ms);
    if (this._status === 'running') {
      this.clearTimer();
      this.schedule();
    }
  }

  get status(): SortState {
    return this._status;
  }

  private schedule() {
    this.timer = setTimeout(() => this.tick(), this._speed);
  }

  private tick() {
    if (!this.gen) return;
    const result = this.gen.next();
    if (result.done) {
      this.setStatus('done');
      if (this.lastFrame) this.callbacks.onComplete(this.lastFrame);
      return;
    }
    this.lastFrame = result.value;
    this.callbacks.onFrame(result.value);
    if (this._status === 'running') {
      this.schedule();
    }
  }

  private clearTimer() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private setStatus(s: SortState) {
    this._status = s;
    this.callbacks.onStatusChange(s);
  }
}
