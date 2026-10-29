const EFFECT_SCALE = 480 / 330;
const UNLOCK_FRAMES = {
  lift: { folder: 'assets/unlock/lift/', count: 20, fps: 24, layer: 'front', extension: 'webp' },
  open: { folder: 'assets/unlock/open/', count: 36, fps: 24, layer: 'back', extension: 'webp' },
};
const LOCK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>';

function preloadImage(source) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

async function playFrames(name, book, stage) {
  const { folder, count, fps, layer, extension } = UNLOCK_FRAMES[name];
  if (!count) return;
  const urls = Array.from({ length: count }, (_, i) => `${folder}${String(i + 1).padStart(3, '0')}.${extension}`);
  const images = await Promise.all(urls.map(preloadImage));
  if (images.includes(null)) return;

  const bookBounds = book.getBoundingClientRect();
  const stageBounds = stage.getBoundingClientRect();
  const overlay = el('img', { class: `frame-overlay frame-${layer}`, alt: '' });
  overlay.style.left = `${bookBounds.left - stageBounds.left + bookBounds.width / 2}px`;
  overlay.style.top = `${bookBounds.top - stageBounds.top + bookBounds.height / 2}px`;
  overlay.style.width = `${bookBounds.width * EFFECT_SCALE}px`;
  stage.append(overlay);
  for (const image of images) {
    overlay.src = image.src;
    await sleep(1000 / fps);
  }
  overlay.remove();
}

function showCover(record) {
  let step = 'closed';
  const mascot = createMascot(120, 'idle');
  const message = el('p', { class: 'message' }, 'Tap the diary to open it up');
  const password = el('input', {
    type: 'password',
    placeholder: 'secret word',
    autocomplete: 'off',
    onkeydown: (event) => {
      if (event.key === 'Enter') unlock();
    },
  });
  const form = el(
    'div',
    { class: 'password-form', hidden: '' },
    password,
    el('button', { class: 'button', onclick: unlock }, icon('key'), 'Unlock'),
  );

  const book = el(
    'div',
    { class: 'book3d' },
    el('i', { class: 'page-edge-right' }),
    el('i', { class: 'page-edge-bottom' }),
    el('div', { class: 'book-inner' }),
    el(
      'div',
      { class: 'book-cover' },
      el('div', { class: 'cover-front' }, buildCoverArt(record)),
      el('div', { class: 'cover-back' }),
      el('div', { class: 'strap', html: LOCK_ICON }),
    ),
  );

  const stage = el(
    'div',
    {
      class: 'stage',
      onpointermove: (event) => {
        if (step === 'opening') return;
        const bounds = stage.getBoundingClientRect();
        book.style.setProperty('--tilt-x', ((event.clientX - bounds.left) / bounds.width - 0.5) * 14);
        book.style.setProperty('--tilt-y', -((event.clientY - bounds.top) / bounds.height - 0.5) * 10);
      },
    },
    el('button', { class: 'button secondary small back-button', onclick: showLibrary }, icon('left'), 'Library'),
    book,
    el('div', { class: 'mascot-row' }, mascot, el('div', { class: 'bubble tail-left' }, message)),
    form,
  );

  book.addEventListener('click', async () => {
    if (step !== 'closed') return;
    step = 'lifted';
    book.classList.add('lift');
    playSound('pop');
    mascot.play('wave', 'idle', true);
    playFrames('lift', book, stage);
    await sleep(700);
    message.textContent = 'Say the secret word';
    form.hidden = false;
    password.focus();
  });

  async function unlock() {
    if (step === 'opening') return;
    try {
      await unlockDiary(record, password.value);
    } catch {
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
      message.textContent = 'Not quite. Try again.';
      mascot.play('sad');
      playSound('bad');
      return;
    }
    step = 'opening';
    form.hidden = true;
    message.textContent = 'Welcome back!';
    mascot.play('cheer');
    playSound('ok');
    burstConfetti();
    book.style.setProperty('--tilt-x', 0);
    book.style.setProperty('--tilt-y', 0);
    const effect = playFrames('open', book, stage);
    book.classList.add('open');
    await Promise.all([sleep(1600), effect]);
    stage.classList.add('zoom');
    await sleep(750);
    showReader();
  }

  mount(stage);
}
