import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { playSelectedCelebrationSound, stopCelebrationAudio, validateCelebrationAudio } from './ceremony';

class FakeAudio extends EventTarget {
  static instances: FakeAudio[] = [];
  static playError: Error | null = null;
  static failLoad = false;
  src = '';
  currentTime = 0;
  duration = 4;
  volume = 1;
  muted = false;
  preload = '';
  readyState = 0;
  error: MediaError | null = null;
  paused = true;
  networkState = 1;
  currentSrc = '';
  isConnected = false;
  dataset: Record<string, string> = {};
  style: Record<string, string> = {};
  constructor() { super(); FakeAudio.instances.push(this); }
  load() { if (this.src && this.preload === 'auto') { this.readyState = 3; setTimeout(() => this.dispatchEvent(new Event(FakeAudio.failLoad ? 'error' : 'canplay')), 0); } }
  play(): Promise<void> { this.paused = false; if (FakeAudio.playError) return Promise.reject(FakeAudio.playError); return Promise.resolve().then(() => { this.currentSrc = this.src; this.dispatchEvent(new Event('play')); this.dispatchEvent(new Event('playing')); this.currentTime = 0.1; this.dispatchEvent(new Event('timeupdate')); }); }
  pause() { this.paused = true; }
  removeAttribute(name: string) { if (name === 'src') this.src = ''; }
  remove() { this.isConnected = false; }
}

describe('celebration audio playback', () => {
  beforeEach(() => {
    FakeAudio.instances = [];
    FakeAudio.playError = null;
    FakeAudio.failLoad = false;
    vi.stubGlobal('Audio', FakeAudio);
    vi.stubGlobal('window', { setTimeout, clearTimeout, setInterval, clearInterval, AudioContext: undefined });
    vi.stubGlobal('document', { body: { appendChild: (audio: FakeAudio) => { audio.isConnected = true; } } });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:celebration-test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });
  afterEach(() => { stopCelebrationAudio(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('uses the selected custom blob and resolves only after the browser media clock advances', async () => {
    const blob = new Blob(['audio-bytes'], { type: 'audio/mpeg' });
    await expect(playSelectedCelebrationSound(blob, 0.6)).resolves.toBeUndefined();
    expect(FakeAudio.instances).toHaveLength(1);
    expect(FakeAudio.instances[0].src).toBe('blob:celebration-test');
    expect(FakeAudio.instances[0].volume).toBe(0.6);
    expect(FakeAudio.instances[0].paused).toBe(false);
  });

  it('stops and revokes the previous player before starting a repeated test', async () => {
    await playSelectedCelebrationSound(new Blob(['first']), 0.5);
    const first = FakeAudio.instances[0];
    await playSelectedCelebrationSound(new Blob(['second']), 0.5);
    expect(first.paused).toBe(true);
    expect(first.src).toBe('');
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(FakeAudio.instances).toHaveLength(2);
  });

  it('validates that the browser can load and decode the selected audio', async () => {
    await expect(validateCelebrationAudio(new Blob(['valid-ish'], { type: 'audio/wav' }))).resolves.toBeUndefined();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it('reports autoplay denial instead of displaying a false success', async () => {
    FakeAudio.playError = new DOMException('Blocked', 'NotAllowedError');
    await expect(playSelectedCelebrationSound(new Blob(['bytes'], { type: 'audio/mpeg' }), 0.7)).rejects.toThrow('browser blocked audio playback');
  });

  it('rejects files the browser cannot decode', async () => {
    FakeAudio.failLoad = true;
    await expect(validateCelebrationAudio(new Blob(['bad'], { type: 'audio/ogg' }))).rejects.toThrow('could not decode');
  });

  it('rejects muted volume without attempting playback', async () => {
    await expect(playSelectedCelebrationSound(null, 0)).rejects.toThrow('volume is set to 0%');
    expect(FakeAudio.instances).toHaveLength(0);
  });

  it('rejects empty selected audio instead of falling through to the default', async () => {
    await expect(playSelectedCelebrationSound(new Blob([]), 0.7)).rejects.toThrow('empty');
  });
});
