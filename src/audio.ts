let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let isMuted = false;

export const volumes = {
  ambience: 0,
  moves: 0.5,
  celebration: 0.5,
  clicks: 0.3,
};

export function setMuted(muted: boolean) {
  isMuted = muted;
  updateAmbienceVolume();
}

export function setVolume(type: keyof typeof volumes, val: number) {
  volumes[type] = val;
  if (type === 'ambience') {
    updateAmbienceVolume();
  }
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; // Small size for simple visualizer
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
  return audioCtx;
}

export function getAnalyserData(dataArray: Uint8Array) {
  if (analyser && !isMuted) {
    analyser.getByteFrequencyData(dataArray);
  } else {
    dataArray.fill(0);
  }
}

let ambienceOscillator: OscillatorNode | null = null;
let ambienceGain: GainNode | null = null;

function updateAmbienceVolume() {
  if (ambienceGain && audioCtx) {
    const targetVol = isMuted ? 0 : volumes.ambience;
    ambienceGain.gain.setTargetAtTime(targetVol * 0.1, audioCtx.currentTime, 0.5);
  }
}

export function startAmbience() {
  if (ambienceOscillator) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    ambienceOscillator = ctx.createOscillator();
    ambienceGain = ctx.createGain();

    ambienceOscillator.type = 'sine';
    ambienceOscillator.frequency.setValueAtTime(110, ctx.currentTime); // Low A

    // Add a slight LFO for texture
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(ambienceOscillator.frequency);
    lfo.start();

    ambienceGain.gain.setValueAtTime(0, ctx.currentTime);
    ambienceOscillator.connect(ambienceGain);
    ambienceGain.connect(masterGain!);

    ambienceOscillator.start();
    updateAmbienceVolume();
  } catch (e) {
    console.error("Ambience playback failed", e);
  }
}

function playTone(frequency: number, type: OscillatorType, duration: number, startTimeOffset = 0, vol = 0.1) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    const startTime = ctx.currentTime + startTimeOffset;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(vol, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain!);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
}

export function playMoveSound(player: 'X' | 'O') {
  if (player === 'X') {
    playTone(440, 'sine', 0.1, 0, volumes.moves); // A4
  } else {
    playTone(523.25, 'sine', 0.1, 0, volumes.moves); // C5
  }
}

export function playWinSound() {
  playTone(440, 'triangle', 0.1, 0, volumes.celebration);
  playTone(554.37, 'triangle', 0.1, 0.1, volumes.celebration);
  playTone(659.25, 'triangle', 0.2, 0.2, volumes.celebration);
  playTone(880, 'triangle', 0.4, 0.3, volumes.celebration);
}

export function playDrawSound() {
  playTone(300, 'square', 0.2, 0, volumes.celebration * 0.3);
  playTone(250, 'square', 0.3, 0.2, volumes.celebration * 0.3);
}

export function playClickSound() {
  playTone(800, 'sine', 0.05, 0, volumes.clicks);
}
