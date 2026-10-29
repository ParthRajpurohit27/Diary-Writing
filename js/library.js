const COVER_STYLES = ['sky', 'coral', 'mint', 'sun', 'rose'];
let showSleepingMascot = false;

const writerName = () => titleCase(localStorage.getItem('writer_name') || '');

function buildCoverArt(record) {
  return el(
    'div',
    { class: `cover-art cover-${record.cover}` },
    el('i', { class: 'hinge' }),
    el('i', { class: 'stitch' }),
    ['tl', 'tr', 'bl', 'br'].map((position) => el('i', { class: `corner ${position}` })),
    el('div', { class: 'name-plate' }, el('b', {}, record.name), el('u')),
    el('i', { class: 'ribbon' }),
  );
}

function daysSince(iso) {
  return Math.floor((Date.now() - new Date(`${iso}T12:00`).getTime()) / 86400000);
}

function pickGreeting(diaryCount) {
  if (showSleepingMascot) return 'Zzz… I locked up while you were away.';
  if (!diaryCount) return 'Let’s make your very first diary.';
  const lastBackup = localStorage.getItem('last_backup');
  if (!lastBackup || daysSince(lastBackup) > 14)
    return 'Psst. A backup keeps your diary safe. Open a diary, then Menu, then Save a backup.';
  const hour = new Date().getHours();
  if (hour < 5) return 'Burning the midnight oil?';
  if (hour < 12) return 'Good morning. What’s on your mind?';
  if (hour < 18) return 'Hey! Ready to write something?';
  return 'Good evening. How was your day?';
}

function buildLibraryHeader(diaryCount) {
  const mascot = createMascot(160, showSleepingMascot ? 'sleep' : 'idle');
  const message = pickGreeting(diaryCount);
  showSleepingMascot = false;
  mascot.addEventListener('click', () => {
    mascot.play('wave', 'idle', true);
    playSound('pop');
  });
  return el(
    'div',
    { class: 'library-header' },
    mascot,
    el(
      'div',
      { class: 'bubble tail-left' },
      el('b', {}, `Hi, ${writerName()}`),
      el('span', {}, message),
      el('button', { class: 'icon-button small', title: 'Change name', onclick: openNameDialog }, icon('pen')),
    ),
  );
}

function buildSoundButton() {
  const label = el('span', {}, soundMuted ? 'Sound off' : 'Sound on');
  return el(
    'button',
    {
      class: 'button secondary',
      onclick: () => {
        setSoundMuted(!soundMuted);
        label.textContent = soundMuted ? 'Sound off' : 'Sound on';
        playSound('pop');
      },
    },
    icon('sound'),
    label,
  );
}

function showLibrary() {
  session = null;
  const diaries = listDiaries();
  const shelf = el(
    'div',
    { class: 'shelf' },
    diaries.map((record, index) =>
      el(
        'button',
        { class: 'book-card', style: `--index:${index}`, title: record.name, onclick: () => showCover(record) },
        el('i', { class: 'page-edge-right' }),
        el('i', { class: 'page-edge-bottom' }),
        buildCoverArt(record),
      ),
    ),
    el(
      'button',
      { class: 'book-card new', style: `--index:${diaries.length}`, onclick: openNewDiaryDialog },
      icon('plus'),
      el('span', {}, 'New diary'),
    ),
  );
  const actions = el(
    'div',
    { class: 'library-actions' },
    createInstallButton(),
    buildSoundButton(),
    el('button', { class: 'button secondary', onclick: openImportDialog }, icon('upload'), 'Import a backup'),
  );
  mount(el('div', { class: 'library' }, buildLibraryHeader(diaries.length), el('h1', {}, 'Your diaries'), shelf, actions));
}

function openNameDialog() {
  const input = el('input', { value: writerName(), maxlength: 24 });
  const close = openDialog(
    'Your name',
    input,
    el('small', {}, 'This shows up on the first page of your PDF.'),
    el(
      'button',
      {
        class: 'button',
        onclick: () => {
          if (!input.value.trim()) return;
          localStorage.setItem('writer_name', titleCase(input.value.trim()));
          close();
          showLibrary();
        },
      },
      'Save',
    ),
  );
  input.focus();
}

function openNewDiaryDialog() {
  let cover = COVER_STYLES[0];
  const nameInput = el('input', { placeholder: 'Diary name', maxlength: 26 });
  const password = el('input', { type: 'password', placeholder: 'Secret word (6+ characters)' });
  const repeat = el('input', { type: 'password', placeholder: 'Repeat it' });
  const error = el('small', { class: 'error' });
  const swatches = el(
    'div',
    { class: 'swatches' },
    COVER_STYLES.map((style) =>
      el('button', {
        class: `cover-${style}${style === cover ? ' on' : ''}`,
        onclick: (event) => {
          cover = style;
          swatches.querySelectorAll('button').forEach((button) => button.classList.remove('on'));
          event.currentTarget.classList.add('on');
        },
      }),
    ),
  );

  async function create() {
    if (!nameInput.value.trim()) return (error.textContent = 'Give the diary a name.');
    if (password.value.length < 6) return (error.textContent = 'The secret word needs 6 or more characters.');
    if (password.value !== repeat.value) return (error.textContent = 'The two words do not match.');
    await createDiary({ name: titleCase(nameInput.value.trim()), cover, password: password.value });
    close();
    burstConfetti();
    playSound('ok');
    showLibrary();
  }

  const close = openDialog(
    'New diary',
    nameInput,
    swatches,
    password,
    repeat,
    el('small', {}, 'There is no recovery. If the secret word is lost, the diary stays locked.'),
    error,
    el('button', { class: 'button', onclick: create }, 'Create diary'),
  );
  nameInput.focus();
}

function openImportDialog() {
  const picker = el('input', {
    type: 'file',
    accept: '.json',
    onchange: async () => {
      try {
        await importBackup(picker.files[0]);
        toast('Imported. Open it with its original secret word.');
        showLibrary();
      } catch {
        toast('That file is not a diary backup.');
      }
    },
  });
  picker.click();
}
