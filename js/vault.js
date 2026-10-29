const STORAGE_KEY = 'diaries_v1';
const PBKDF2_ITERATIONS = 250000;
const DEFAULT_SETTINGS = { paper: 'light', rule: 'lines', auto: true };

let session = null;

function toBase64(buffer) {
  let binary = '';
  new Uint8Array(buffer).forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function fromBase64(text) {
  return Uint8Array.from(atob(text), (character) => character.charCodeAt(0));
}

async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function listDiaries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function writeDiaries(diaries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(diaries));
}

function createPage(date = todayIso()) {
  return { id: crypto.randomUUID(), date, chapter: '', html: '<div><br></div>' };
}

function migratePage(page) {
  if (page.html == null) {
    const lines = page.lines || [['', 0]];
    page.html = lines.map(([text, isTopic]) => `<div${isTopic ? ' class="topic"' : ''}>${text ? escapeHtml(text) : '<br>'}</div>`).join('');
  }
  return page;
}

async function saveSession() {
  const current = session;
  if (!current) return;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(current.data));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, current.key, plain);
  current.record.iv = toBase64(iv);
  current.record.ct = toBase64(cipher);

  const diaries = listDiaries();
  const index = diaries.findIndex((diary) => diary.id === current.record.id);
  if (index < 0) diaries.push(current.record);
  else diaries[index] = current.record;
  try {
    writeDiaries(diaries);
  } catch {
    toast('Storage is full. Remove a background image.');
  }
}

async function unlockDiary(record, password) {
  const key = await deriveKey(password, fromBase64(record.salt));
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(record.iv) }, key, fromBase64(record.ct));
  const data = JSON.parse(new TextDecoder().decode(plain));
  data.pages.forEach(migratePage);
  data.set = { ...DEFAULT_SETTINGS, ...data.set };
  data.stats = data.stats || { days: [] };
  session = { record, key, data, pageIndex: 0, editing: false };
}

async function createDiary({ name, cover, password }) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  session = {
    record: { id: crypto.randomUUID(), name, cover, salt: toBase64(salt) },
    key: await deriveKey(password, salt),
    data: { pages: [createPage()], set: { ...DEFAULT_SETTINGS }, stats: { days: [] } },
    pageIndex: 0,
    editing: false,
  };
  await saveSession();
  session = null;
}

function deleteDiary(id) {
  writeDiaries(listDiaries().filter((diary) => diary.id !== id));
}

async function lockDiary() {
  await saveSession();
  session = null;
}

function downloadBackup() {
  localStorage.setItem('last_backup', todayIso());
  const file = new Blob([JSON.stringify({ fmt: 'diary-v1', ...session.record })], { type: 'application/json' });
  el('a', { href: URL.createObjectURL(file), download: `${session.record.name.replace(/\W+/g, '_')}.diary.json` }).click();
}

async function importBackup(file) {
  const record = JSON.parse(await file.text());
  if (record.fmt !== 'diary-v1' || !record.salt || !record.iv || !record.ct) throw new Error('Not a diary backup');
  delete record.fmt;
  const diaries = listDiaries();
  if (diaries.some((diary) => diary.id === record.id)) record.id = crypto.randomUUID();
  diaries.push(record);
  writeDiaries(diaries);
}
