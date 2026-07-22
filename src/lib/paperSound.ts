// Synthesizes a short "paper turn" sound using the Web Audio API.
// Filtered white noise with a fast attack + decay envelope. No audio files
// to ship, works offline, and stays lightweight.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function playPaperTurn(volume = 0.25) {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") audio.resume().catch(() => {});

  const duration = 0.35;
  const sampleRate = audio.sampleRate;
  const frameCount = Math.floor(sampleRate * duration);
  const buffer = audio.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // Pink-ish noise with a swept amplitude to mimic a page swipe.
  for (let i = 0; i < frameCount; i++) {
    const t = i / frameCount;
    // Two-hump envelope: quick rustle + softer trailing shush.
    const env =
      Math.exp(-8 * t) * 0.9 + Math.exp(-3 * (t - 0.15) ** 2 * 40) * 0.6;
    data[i] = (Math.random() * 2 - 1) * env;
  }

  const src = audio.createBufferSource();
  src.buffer = buffer;

  const bandpass = audio.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 3200;
  bandpass.Q.value = 0.8;

  const highshelf = audio.createBiquadFilter();
  highshelf.type = "highshelf";
  highshelf.frequency.value = 5000;
  highshelf.gain.value = 4;

  const gain = audio.createGain();
  gain.gain.value = volume;

  src.connect(bandpass).connect(highshelf).connect(gain).connect(audio.destination);
  src.start();
  src.stop(audio.currentTime + duration + 0.05);
}
