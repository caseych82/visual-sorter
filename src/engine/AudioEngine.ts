import * as Tone from 'tone';

// Pentatonic C major scale across 3 octaves — sounds musical regardless of which notes play
const PENTATONIC_NOTES = [
  'C3', 'D3', 'E3', 'G3', 'A3',
  'C4', 'D4', 'E4', 'G4', 'A4',
  'C5', 'D5', 'E5', 'G5', 'A5',
];

class AudioEngine {
  private compSynth: Tone.PolySynth | null = null;
  private swapSynth: Tone.MetalSynth | null = null;
  private completeSynth: Tone.PolySynth | null = null;
  private masterVol: Tone.Volume | null = null;
  private initialized = false;
  private _muted = false;

  async init() {
    if (this.initialized) return;
    await Tone.start();

    this.masterVol = new Tone.Volume(-6).toDestination();

    // Comparison: soft sine ping
    this.compSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
    }).connect(this.masterVol);
    this.compSynth.volume.value = -12;

    // Swap: metallic click
    this.swapSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
      harmonicity: 3.1,
      modulationIndex: 16,
      resonance: 800,
      octaves: 0.5,
    }).connect(this.masterVol);
    this.swapSynth.frequency.value = 300;
    this.swapSynth.volume.value = -20;

    // Completion cascade: warm triangle wave
    this.completeSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.05, release: 0.6 },
    }).connect(this.masterVol);
    this.completeSynth.volume.value = -10;

    this.initialized = true;
  }

  private valueToNote(normalizedValue: number): string {
    const clamped = Math.max(0, Math.min(1, normalizedValue));
    const idx = Math.round(clamped * (PENTATONIC_NOTES.length - 1));
    return PENTATONIC_NOTES[idx];
  }

  playComparison(normalizedValue: number) {
    if (!this.initialized || this._muted || !this.compSynth) return;
    try {
      this.compSynth.triggerAttackRelease(this.valueToNote(normalizedValue), '32n');
    } catch { /* suppress overlapping note errors */ }
  }

  playSwap(normalizedValue: number) {
    if (!this.initialized || this._muted || !this.swapSynth) return;
    try {
      // Pitch-shift the metal synth frequency based on value
      this.swapSynth.frequency.value = 150 + normalizedValue * 600;
      this.swapSynth.triggerAttackRelease('16n', Tone.now());
    } catch { /* suppress */ }
  }

  // Call once sort completes — plays a rising arpeggio across all bars
  playSortedCascade(totalBars: number) {
    if (!this.initialized || this._muted || !this.completeSynth) return;
    const stepCount = Math.min(totalBars, PENTATONIC_NOTES.length);
    for (let i = 0; i < stepCount; i++) {
      try {
        this.completeSynth.triggerAttackRelease(
          PENTATONIC_NOTES[i],
          '8n',
          Tone.now() + i * 0.04
        );
      } catch { /* suppress */ }
    }
  }

  setVolume(db: number) {
    if (this.masterVol) this.masterVol.volume.value = db;
  }

  mute() { this._muted = true; }
  unmute() { this._muted = false; }
  get muted() { return this._muted; }
}

// Singleton — one audio context for the whole app
export const audioEngine = new AudioEngine();
