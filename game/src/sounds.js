// Tiny WebAudio sound effects, synthesised at play time — no audio files, no
// network. Each effect is a short oscillator sweep or a couple of notes, kept
// quiet so a long shift never gets shrill. Sound starts only after a user
// gesture, as browsers require, and M toggles it.

export function createSounds() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context) {
      if (context.state === 'suspended') context.resume();
      return context;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
    return context;
  }

  function tone(freqStart, freqEnd, seconds, type, gain, delay) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const at = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freqStart, at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqEnd), at + seconds);
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(gain || 0.08, at + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(at);
    osc.stop(at + seconds + 0.05);
  }

  function noise(seconds, gain) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    const amp = ctx.createGain();
    source.buffer = buffer;
    amp.gain.value = gain || 0.05;
    source.connect(amp);
    amp.connect(ctx.destination);
    source.start();
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    pickup() {
      tone(520, 720, 0.09, 'triangle', 0.07);
    },
    chop() {
      noise(0.07, 0.09);
      tone(180, 90, 0.07, 'square', 0.04);
    },
    sizzle() {
      noise(0.35, 0.05);
    },
    ding() {
      tone(880, 880, 0.12, 'sine', 0.09);
      tone(1320, 1320, 0.18, 'sine', 0.07, 0.1);
    },
    serve() {
      tone(660, 660, 0.1, 'triangle', 0.09);
      tone(880, 880, 0.1, 'triangle', 0.09, 0.09);
      tone(1100, 1100, 0.22, 'triangle', 0.09, 0.18);
    },
    error() {
      tone(220, 160, 0.16, 'sawtooth', 0.05);
    },
    expire() {
      tone(392, 392, 0.14, 'triangle', 0.08);
      tone(311, 311, 0.22, 'triangle', 0.08, 0.13);
    },
    rush() {
      tone(440, 660, 0.2, 'triangle', 0.08);
      tone(660, 880, 0.2, 'triangle', 0.08, 0.18);
    },
  };
}
