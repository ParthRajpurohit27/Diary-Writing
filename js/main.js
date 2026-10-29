const IDLE_LOCK_MS = 5 * 60 * 1000;
const AWAY_LOCK_MS = 60 * 1000;
const TAP_TARGETS = '.button,.menu-item,.book-card,.chip,.tool-button,.style-button,.arrow,.icon-button,.swatch-button';

let idleTimer;
let hiddenAt = 0;
let lastEscape = 0;

async function lockNow(message) {
  if (!session) return;
  await lockDiary();
  showSleepingMascot = true;
  showLibrary();
  toast(message);
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => lockNow('Locked after 5 quiet minutes'), IDLE_LOCK_MS);
}

['pointerdown', 'keydown', 'touchstart'].forEach((name) => addEventListener(name, resetIdleTimer, { passive: true }));

addEventListener('pointerdown', (event) => {
  if (event.target.closest && event.target.closest(TAP_TARGETS)) playSound('tap');
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    hiddenAt = Date.now();
  } else if (hiddenAt && Date.now() - hiddenAt > AWAY_LOCK_MS) {
    lockNow('Locked while you were away');
  }
});

addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !session) return;
  const now = Date.now();
  if (now - lastEscape < 600) lockNow('Locked');
  lastEscape = now;
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

resetIdleTimer();
if (localStorage.getItem('writer_name')) showLibrary();
else showWelcome();
