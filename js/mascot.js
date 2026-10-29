const SPRITES = {
  idle: { frames: 24, fps: 12, loop: true },
  wave: { frames: 24, fps: 16, loop: true },
  cheer: { frames: 30, fps: 24, loop: false },
  sad: { frames: 20, fps: 20, loop: false },
  sleep: { frames: 24, fps: 10, loop: true },
};
const SPRITE_COLUMNS = 6;

Object.keys(SPRITES).forEach((name) => {
  new Image().src = `assets/mascot/${name}.png`;
});

function createMascot(size = 160, firstAnimation = 'idle') {
  const mascot = el('div', { class: 'mascot' });
  mascot.style.width = mascot.style.height = `${size}px`;
  let frameRequest = 0;
  let runId = 0;
  let wasAttached = false;

  function showFrame(name, frame) {
    const rows = Math.ceil(SPRITES[name].frames / SPRITE_COLUMNS);
    const column = frame % SPRITE_COLUMNS;
    const row = Math.floor(frame / SPRITE_COLUMNS);
    mascot.style.backgroundImage = `url(assets/mascot/${name}.png)`;
    mascot.style.backgroundSize = `${SPRITE_COLUMNS * 100}% ${rows * 100}%`;
    mascot.style.backgroundPosition = `${(column / (SPRITE_COLUMNS - 1)) * 100}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`;
  }

  mascot.play = (name, then = 'idle', once = false) => {
    cancelAnimationFrame(frameRequest);
    const id = ++runId;
    const { frames, fps, loop } = SPRITES[name];
    const repeats = loop && !once;
    let frame = 0;
    let startedAt = performance.now();
    showFrame(name, 0);

    const tick = (now) => {
      if (id !== runId) return;
      if (mascot.isConnected) wasAttached = true;
      else if (wasAttached) return;

      const next = Math.floor(((now - startedAt) / 1000) * fps);
      if (next !== frame) {
        frame = next;
        if (frame >= frames) {
          if (repeats) {
            startedAt = now;
            frame = 0;
          } else {
            if (then) mascot.play(then);
            return;
          }
        }
        showFrame(name, frame);
      }
      frameRequest = requestAnimationFrame(tick);
    };
    frameRequest = requestAnimationFrame(tick);
  };

  mascot.play(firstAnimation);
  return mascot;
}

let soundMuted = localStorage.getItem('mute') === '1';
let audioContext;

const SOUNDS = {
  pop: [[700, 0, 0.07]],
  tap: [[520, 0, 0.04]],
  flip: [
    [380, 0, 0.05],
    [300, 0.04, 0.06],
  ],
  ok: [
    [523, 0, 0.1],
    [659, 0.09, 0.1],
    [784, 0.18, 0.2],
  ],
  bad: [
    [240, 0, 0.12],
    [190, 0.12, 0.22],
  ],
};

function setSoundMuted(muted) {
  soundMuted = muted;
  localStorage.setItem('mute', muted ? '1' : '0');
}

function playSound(name) {
  if (soundMuted) return;
  try {
    audioContext = audioContext || new AudioContext();
    const now = audioContext.currentTime;
    SOUNDS[name].forEach(([frequency, offset, length]) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.1, now + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + length);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + length + 0.02);
    });
  } catch {
    soundMuted = true;
  }
}
