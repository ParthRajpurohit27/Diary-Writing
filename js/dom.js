const $ = (selector, root = document) => root.querySelector(selector);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function debounce(callback, delay) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(callback, delay);
  };
}

function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (name === 'class') node.className = value;
    else if (name === 'html') node.innerHTML = value;
    else if (name.startsWith('on')) node.addEventListener(name.slice(2), value);
    else node.setAttribute(name, value);
  }
  node.append(...children.flat().filter((child) => child !== null && child !== undefined && child !== false));
  return node;
}

const ICON_PATHS = {
  plus: 'M12 5v14M5 12h14',
  left: 'M15 5l-7 7 7 7',
  menu: 'M4 7h16M4 12h16M4 17h16',
  pen: 'M4 20l4-1 11-11-3-3L5 16zM14 7l3 3',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  upload: 'M12 16V5M7 9l5-5 5 5M5 20h14',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',
  key: 'M8 14a4 4 0 110-8 4 4 0 010 8zM11 11l9 9M16 16l-2 2',
  book: 'M5 4h12a2 2 0 012 2v14H7a2 2 0 01-2-2zM5 18a2 2 0 012-2h12',
  trash: 'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
  paper: 'M12 3a9 9 0 109 9 7 7 0 01-9-9z',
  lines: 'M4 8h16M4 12h16M4 16h16',
  topic: 'M5 6h14M12 6v13M9 19h6',
  file: 'M7 3h7l4 4v14H7zM14 3v5h5',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',
  sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5',
  sound: 'M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 010 7',
  undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3',
  redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3',
  draw: 'M4 20c3 0 4-2 6-4M13 7l4 4-7 7-4-4zM15 5l2-2 4 4-2 2',
  marker: 'M8 21l-4-4 9-9 4 4zM15 6l2-2 4 4-2 2M4 21h5',
  eraser: 'M7 20h13M5 15l9-9a2 2 0 013 0l3 3a2 2 0 010 3l-7 7H8z',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 00-4-10z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z',
  photo: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4',
};

function icon(name) {
  return el('span', {
    class: 'icon',
    html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON_PATHS[name]}"/></svg>`,
  });
}

function mount(node) {
  const swap = () => $('#app').replaceChildren(node);
  if (!document.startViewTransition) {
    swap();
    return Promise.resolve();
  }
  return document.startViewTransition(swap).updateCallbackDone;
}

function toast(message) {
  const node = el('div', { class: 'toast' }, message);
  document.body.append(node);
  setTimeout(() => node.remove(), 2400);
}

function burstConfetti(x = innerWidth / 2, y = innerHeight / 2) {
  const colors = ['#111113', '#e8272d', '#8a8a8e', '#ffffff', '#c9c9c2'];
  for (let i = 0; i < 34; i++) {
    const dot = el('i', { class: 'confetti-dot' });
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 170;
    dot.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]};--dx:${Math.cos(angle) * distance}px;--dy:${Math.sin(angle) * distance - 70}px`;
    document.body.append(dot);
    setTimeout(() => dot.remove(), 1200);
  }
}

function openDialog(title, ...content) {
  const overlay = el(
    'div',
    {
      class: 'overlay',
      onclick: (event) => {
        if (event.target === overlay) close();
      },
    },
    el('div', { class: 'dialog' }, el('h3', {}, title), content),
  );
  const close = () => {
    overlay.classList.add('closing');
    setTimeout(() => overlay.remove(), 250);
  };
  document.body.append(overlay);
  return close;
}

async function typeText(node, text, delay = 42) {
  node.textContent = '';
  for (const character of text) {
    node.textContent += character;
    await sleep(delay);
  }
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = el('script', { src: url });
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}
