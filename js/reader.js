const TURN_DURATION = 780;
const SWIPE_DISTANCE = 60;
const FLAME_ICON =
  '<svg viewBox="0 0 24 24"><defs><linearGradient id="flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a18"/><stop offset="1" stop-color="#ffc83d"/></linearGradient></defs><path fill="url(#flame)" d="M12.5 2c.6 3.6 4.5 5.4 4.5 10a5 5 0 01-10 0c0-1.800.8-3.200 2-4.200.1 1.600.8 2.600 1.800 2.900C10.200 7.300 11 4.200 12.500 2z"/></svg>';

function showReader() {
  const data = session.data;
  const settings = data.set;
  let isTurning = false;
  let swipeStartX = null;

  const currentPage = () => data.pages[session.pageIndex];
  const pageHasText = (page) => plainText(page.html).trim().length > 0;
  const pageIsEmpty = (page) => !pageHasText(page) && !page.img && !(page.ink && page.ink.length);
  const stripToken = (html) => html.split(CARET_TOKEN).join('');

  const editor = el('div', { class: 'editor', contenteditable: 'false', spellcheck: 'false' });
  const dateText = el('span');
  const dateInput = el('input', {
    type: 'date',
    class: 'date-input',
    onchange: () => {
      if (!dateInput.value) return;
      currentPage().date = dateInput.value;
      dateText.textContent = formatDate(dateInput.value);
      queueSave();
    },
  });
  const dateLabel = el(
    'span',
    {
      class: 'date',
      onclick: () => {
        if (!session.editing) return;
        if (dateInput.showPicker) dateInput.showPicker();
        else dateInput.click();
      },
    },
    dateText,
    icon('pen'),
  );
  const chapterLabel = el('div', { class: 'chapter' });
  const pageNumber = el('div', { class: 'page-number' });
  const backgroundImage = el('img', { class: 'bg-image', alt: '', hidden: '' });
  const pageBody = el(
    'div',
    { class: 'page-body' },
    el('div', { class: 'page-head' }, dateLabel, dateInput),
    chapterLabel,
    editor,
    pageNumber,
  );
  const sheet = el('div', { class: 'sheet' }, backgroundImage, pageBody);

  const ink = createInkLayer({
    sheet,
    getPage: currentPage,
    onChange: () => {
      queueSave();
      refreshInkButtons();
    },
  });
  sheet.append(ink.canvas, ink.preview);

  const statusText = el('small', {}, 'Saved');
  const titleBlock = el('div', { class: 'title' }, el('b', {}, session.record.name), statusText);
  const saveSoon = debounce(async () => {
    await saveSession();
    showStatus(false);
  }, 700);

  function showStatus(isSaving) {
    titleBlock.classList.toggle('unsaved', isSaving);
    statusText.textContent = isSaving ? 'Saving…' : `Saved · ${wordCount(currentPage().html)} words`;
  }

  function queueSave() {
    showStatus(true);
    saveSoon();
  }

  function applyPaperStyle() {
    sheet.classList.toggle('paper-dark', settings.paper === 'dark');
    sheet.classList.toggle('paper-light', settings.paper !== 'dark');
    pageBody.classList.toggle('ruled', settings.rule !== 'plain');
    pageBody.classList.toggle('plain', settings.rule === 'plain');
    paperLabel.textContent = settings.paper === 'dark' ? 'Dark paper' : 'Light paper';
    ruleLabel.textContent = settings.rule === 'plain' ? 'Plain' : 'Lines';
    ink.render();
  }

  function renderBackgroundImage() {
    const image = currentPage().img;
    backgroundImage.hidden = !image;
    imageControls.hidden = !image;
    if (!image) return;
    backgroundImage.src = image.src;
    backgroundImage.style.cssText = `left:${image.x}%;top:${image.y}%;width:${image.s}%;opacity:${image.o / 100}`;
    imageControls.querySelectorAll('input').forEach((input) => (input.value = image[input.dataset.key]));
  }

  function renderPage() {
    const page = currentPage();
    const hasToken = page.html.includes(CARET_TOKEN);
    if (hasToken && !session.editing) page.html = stripToken(page.html);

    editor.innerHTML = sanitize(parseHtml(page.html)) || '<div><br></div>';
    dateText.textContent = formatDate(page.date);
    dateInput.value = page.date;
    chapterLabel.textContent = page.chapter ? `Chapter: ${page.chapter}` : '';
    chapterLabel.hidden = !page.chapter;
    pageNumber.textContent = session.pageIndex + 1;
    prevButton.disabled = session.pageIndex === 0;
    renderBackgroundImage();
    applyPaperStyle();
    refreshInkButtons();
    showStatus(false);

    if (hasToken && session.editing) {
      editor.focus({ preventScroll: true });
      restoreCaretFromToken(editor);
      page.html = stripToken(sanitize(editor));
    }
  }

  function commitText() {
    const page = currentPage();
    page.html = stripToken(sanitize(editor));
    if (pageHasText(page)) celebrateStreak();
    queueSave();
  }

  function celebrateStreak() {
    const streak = recordWritingDay(data);
    if (!streak) return;
    toast(streak > 1 ? `${streak}-day writing streak` : 'First entry today');
    playSound('ok');
    burstConfetti(innerWidth / 2, innerHeight * 0.3);
  }

  function handleInput() {
    normalizeBlocks(editor);
    if (isOverflowing(editor)) reflowOverflow();
    else commitText();
  }

  function addContinuationPages(source, htmlList) {
    const insertAt = session.pageIndex + 1;
    const following = data.pages[insertAt];
    const reuseFirst = following && pageIsEmpty(following);
    htmlList.forEach((html, offset) => {
      if (offset === 0 && reuseFirst) following.html = html;
      else data.pages.splice(insertAt + offset, 0, { ...createPage(source.date), html });
    });
  }

  function reflowOverflow() {
    if (session.editing) insertCaretToken(editor);
    const overflow = spillOverflow(editor);
    const kept = sanitize(editor);

    const continuation = [];
    for (let rest = overflow; rest;) {
      editor.innerHTML = rest;
      const next = spillOverflow(editor);
      continuation.push(sanitize(editor));
      rest = next;
    }

    const page = currentPage();
    const caretOffset = continuation.findIndex((html) => html.includes(CARET_TOKEN));
    page.html = caretOffset >= 0 ? stripToken(kept) : kept;
    addContinuationPages(page, continuation);
    const target = caretOffset >= 0 ? session.pageIndex + 1 + caretOffset : session.pageIndex;

    renderPage();
    celebrateStreak();
    queueSave();
    if (target !== session.pageIndex) turnTo(target);
  }

  function snapshotSheet() {
    const clone = sheet.cloneNode(true);
    clone.classList.add('snapshot');
    clone.querySelector('.editor').removeAttribute('contenteditable');
    const [inkCopy] = clone.querySelectorAll('.ink-layer');
    if (inkCopy) inkCopy.getContext('2d').drawImage(ink.canvas, 0, 0);
    return clone;
  }

  function buildLeaf(front) {
    const shade = el('div', { class: 'leaf-shade' });
    const leaf = el(
      'div',
      { class: 'leaf' },
      el('div', { class: 'leaf-face leaf-front' }, front, shade),
      el('div', { class: 'leaf-face leaf-back' }),
    );
    const cast = el('div', { class: 'leaf-cast' });
    return { leaf, shade, cast };
  }

  async function turnLeaf(forward, index) {
    const from = session.pageIndex;
    let front;
    if (forward) {
      front = snapshotSheet();
      session.pageIndex = index;
      renderPage();
    } else {
      session.pageIndex = index;
      renderPage();
      front = snapshotSheet();
      session.pageIndex = from;
      renderPage();
    }

    const { leaf, shade, cast } = buildLeaf(front);
    sheet.append(cast, leaf);
    const timing = { duration: TURN_DURATION, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' };
    const order = (values) => (forward ? values : [...values].reverse());
    shade.animate(order([{ opacity: 0 }, { opacity: 0.55 }]), timing);
    cast.animate(order([{ opacity: 0 }, { opacity: 0.5 }, { opacity: 0 }]), timing);
    await leaf.animate(order([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }]), timing).finished;

    if (!forward) {
      session.pageIndex = index;
      renderPage();
    }
    leaf.remove();
    cast.remove();
  }

  async function crossfade(index) {
    const timing = { duration: 180, fill: 'forwards' };
    await sheet.animate([{ opacity: 1 }, { opacity: 0 }], timing).finished;
    session.pageIndex = index;
    renderPage();
    await sheet.animate([{ opacity: 0 }, { opacity: 1 }], timing).finished;
    sheet.getAnimations().forEach((animation) => animation.cancel());
  }

  async function turnTo(index) {
    if (isTurning || index === session.pageIndex || index < 0 || index >= data.pages.length) return;
    isTurning = true;
    playSound('flip');
    if (navigator.vibrate) navigator.vibrate(6);
    const distance = Math.abs(index - session.pageIndex);
    if (distance === 1) await turnLeaf(index > session.pageIndex, index);
    else await crossfade(index);
    isTurning = false;
  }

  async function insertPage(chapter = '') {
    const page = createPage();
    page.chapter = chapter;
    data.pages.splice(session.pageIndex + 1, 0, page);
    await saveSession();
    await turnTo(session.pageIndex + 1);
  }

  function goNext() {
    if (session.pageIndex < data.pages.length - 1) turnTo(session.pageIndex + 1);
    else if (pageHasText(currentPage())) insertPage();
    else toast('Write something first.');
  }

  function setMode(mode) {
    session.editing = mode === 'type';
    session.drawing = mode === 'draw';
    reader.classList.toggle('editing', session.editing);
    reader.classList.toggle('drawing', session.drawing);
    editor.contentEditable = String(session.editing);
    editor.spellcheck = session.editing;
    ink.setActive(session.drawing);
    writeLabel.textContent = session.editing ? 'Done' : 'Write';
    drawButton.classList.toggle('active', session.drawing);
    refreshStyleButtons();
    refreshInkButtons();
    if (session.editing && isOverflowing(editor)) reflowOverflow();
    if (!session.editing && !session.drawing) saveSession();
  }

  const toggleMode = (mode) => setMode((mode === 'type' ? session.editing : session.drawing) ? 'view' : mode);

  function toolButton(iconName, label, onClick, extraClass = '') {
    const text = el('span', {}, label);
    const button = el(
      'button',
      { class: `tool-button ${extraClass}`, title: label, onpointerdown: (event) => event.preventDefault(), onclick: onClick },
      icon(iconName),
      label ? text : null,
    );
    button.label = text;
    return button;
  }

  function createStyleButton(command, label, className = '') {
    const button = el(
      'button',
      {
        class: 'style-button',
        title: command,
        onpointerdown: (event) => event.preventDefault(),
        onclick: () => {
          if (command === 'hiliteColor') {
            const current = document.queryCommandValue('hiliteColor');
            document.execCommand('hiliteColor', false, isVisibleColor(current) ? 'transparent' : '#ffe27a');
          } else {
            document.execCommand(command);
          }
          handleInput();
          refreshStyleButtons();
        },
      },
      el('span', { class: className }, label),
    );
    button.command = command;
    return button;
  }

  const historyButton = (iconName, command) =>
    el(
      'button',
      {
        class: 'style-button',
        title: command,
        onpointerdown: (event) => event.preventDefault(),
        onclick: () => document.execCommand(command),
      },
      icon(iconName),
    );

  const styleButtons = [
    createStyleButton('bold', 'B'),
    createStyleButton('italic', 'I', 'italic'),
    createStyleButton('underline', 'U', 'underline'),
    createStyleButton('strikeThrough', 'S', 'strike'),
    createStyleButton('hiliteColor', 'A', 'highlight'),
  ];
  const autoButton = el(
    'button',
    {
      class: 'style-button',
      title: 'Auto capital letters and small fixes',
      onpointerdown: (event) => event.preventDefault(),
      onclick: () => {
        settings.auto = settings.auto === false;
        refreshStyleButtons();
        queueSave();
      },
    },
    el('span', {}, 'Aa'),
  );

  function refreshStyleButtons() {
    styleButtons.forEach((button) => {
      let isOn = false;
      try {
        isOn =
          button.command === 'hiliteColor'
            ? isVisibleColor(document.queryCommandValue('hiliteColor'))
            : document.queryCommandState(button.command);
      } catch {
        isOn = false;
      }
      button.classList.toggle('on', Boolean(isOn));
    });
    autoButton.classList.toggle('on', settings.auto !== false);
  }

  const paperButton = toolButton('paper', 'Light paper', () => {
    settings.paper = settings.paper === 'dark' ? 'light' : 'dark';
    applyPaperStyle();
    queueSave();
  });
  const paperLabel = paperButton.label;
  const ruleButton = toolButton('lines', 'Lines', () => {
    settings.rule = settings.rule === 'plain' ? 'lines' : 'plain';
    applyPaperStyle();
    queueSave();
  });
  const ruleLabel = ruleButton.label;

  const imagePicker = el('input', {
    type: 'file',
    accept: 'image/*',
    hidden: '',
    onchange: () => {
      const file = imagePicker.files[0];
      if (!file) return;
      const picture = new Image();
      picture.onload = () => {
        const scale = Math.min(1, 800 / Math.max(picture.width, picture.height));
        const canvas = document.createElement('canvas');
        canvas.width = picture.width * scale;
        canvas.height = picture.height * scale;
        canvas.getContext('2d').drawImage(picture, 0, 0, canvas.width, canvas.height);
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        currentPage().img = { src: canvas.toDataURL(type, 0.82), o: 30, s: 60, x: 50, y: 50 };
        renderBackgroundImage();
        queueSave();
      };
      picture.src = URL.createObjectURL(file);
      imagePicker.value = '';
    },
  });
  const imageControls = el(
    'div',
    { class: 'image-controls', hidden: '' },
    [
      ['o', 'Fade', 5, 100],
      ['s', 'Image size', 10, 150],
      ['x', 'Left / right', 0, 100],
      ['y', 'Up / down', 0, 100],
    ].map(([key, label, min, max]) => {
      const input = el('input', {
        type: 'range',
        min,
        max,
        oninput: () => {
          currentPage().img[key] = Number(input.value);
          renderBackgroundImage();
          queueSave();
        },
      });
      input.dataset.key = key;
      return el('label', {}, label, input);
    }),
    toolButton('trash', 'Remove', () => {
      delete currentPage().img;
      renderBackgroundImage();
      queueSave();
    }),
  );

  const insertAtCaret = (text) => {
    editor.focus();
    document.execCommand('insertText', false, text);
  };
  const textTools = el(
    'div',
    { class: 'toolbar text-tools' },
    el('div', { class: 'style-row' }, historyButton('undo', 'undo'), historyButton('redo', 'redo'), styleButtons, autoButton),
    toolButton('topic', 'Topic', () => {
      insertTopic(editor);
      handleInput();
    }),
    toolButton('bulb', 'Idea', () => {
      insertTopic(editor);
      document.execCommand('insertText', false, pickPrompt());
      handleInput();
    }),
    toolButton('clock', 'Time', () => insertAtCaret(`${new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} `)),
    toolButton('photo', 'Image', () => imagePicker.click()),
    paperButton,
    ruleButton,
    imageControls,
    imagePicker,
  );

  const toolOptions = [
    ['pen', 'draw', 'Pen'],
    ['highlighter', 'marker', 'Marker'],
    ['eraser', 'eraser', 'Eraser'],
  ];
  const toolButtons = toolOptions.map(([tool, iconName, label]) => {
    const button = toolButton(iconName, label, () => {
      ink.setTool(tool);
      toolButtons.forEach((item) => item.classList.toggle('on', item === button));
    });
    button.classList.toggle('on', tool === 'pen');
    return button;
  });
  const swatchButtons = INK_COLORS.map((color) => {
    const button = el('button', {
      class: `swatch-button${color === 'auto' ? ' on' : ''}`,
      title: color === 'auto' ? 'Matches the paper' : color,
      style: color === 'auto' ? '' : `background:${color}`,
      onclick: () => {
        ink.setColor(color);
        swatchButtons.forEach((item) => item.classList.toggle('on', item === button));
      },
    });
    if (color === 'auto') button.classList.add('auto');
    return button;
  });
  const sizeInput = el('input', { type: 'range', min: 2, max: 14, value: 5, oninput: () => ink.setSize(Number(sizeInput.value) / 1000) });
  const undoInk = toolButton('undo', 'Undo', () => ink.undo());
  const redoInk = toolButton('redo', 'Redo', () => ink.redo());
  const clearInk = toolButton('trash', 'Clear page', () => ink.clear());

  function refreshInkButtons() {
    undoInk.disabled = !ink.canUndo();
    redoInk.disabled = !ink.canRedo();
    clearInk.disabled = !(currentPage().ink && currentPage().ink.length);
  }

  const penTools = el(
    'div',
    { class: 'toolbar pen-tools' },
    el('div', { class: 'style-row' }, toolButtons),
    el('div', { class: 'style-row' }, swatchButtons, el('label', { class: 'size-control' }, 'Size', sizeInput)),
    el('div', { class: 'style-row' }, undoInk, redoInk, clearInk),
  );

  const prevButton = createArrow('prev');
  const nextButton = createArrow('next');

  function createArrow(direction) {
    const path = direction === 'prev' ? 'M13 6l-6 6 6 6M19 6l-6 6 6 6' : 'M5 6l6 6-6 6M11 6l6 6-6 6';
    return el('button', {
      class: `arrow ${direction}`,
      title: direction === 'prev' ? 'Previous page' : 'Next page',
      onclick: () => (direction === 'prev' ? turnTo(session.pageIndex - 1) : goNext()),
      html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`,
    });
  }

  const writeLabel = el('span', {}, 'Write');
  const drawButton = el(
    'button',
    { class: 'button secondary small', title: 'Draw with a pen', onclick: () => toggleMode('draw') },
    icon('draw'),
  );
  const writeButton = el('button', { class: 'button small', onclick: () => toggleMode('type') }, icon('pen'), writeLabel);

  const topBar = el(
    'div',
    { class: 'top-bar' },
    el(
      'button',
      {
        class: 'icon-button',
        title: 'Lock',
        onclick: async () => {
          await lockDiary();
          showLibrary();
        },
      },
      icon('lock'),
    ),
    titleBlock,
    drawButton,
    writeButton,
    el('button', { class: 'icon-button', title: 'Menu', onclick: openMenu }, icon('menu')),
  );

  const reader = el('div', { class: 'reader' }, topBar, el('div', { class: 'desk' }, prevButton, sheet, nextButton), textTools, penTools);

  function openSearchDialog() {
    const input = el('input', { placeholder: 'Search your pages' });
    const results = el('div', { class: 'results' });
    const close = openDialog('Search', input, results);
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      results.replaceChildren();
      if (query.length < 2) return;
      data.pages.forEach((page, index) => {
        const text = plainText(page.html);
        const found = text.toLowerCase().indexOf(query);
        if (found < 0) return;
        results.append(
          el(
            'button',
            {
              class: 'result',
              onclick: () => {
                close();
                turnTo(index);
              },
            },
            el('b', {}, `Page ${index + 1} · ${formatDate(page.date)}`),
            el('small', {}, (found > 24 ? '…' : '') + text.slice(Math.max(0, found - 24), found + 60)),
          ),
        );
      });
      if (!results.children.length) results.append(el('small', {}, 'Nothing found.'));
    });
    input.focus();
  }

  function openChapterDialog() {
    const input = el('input', { placeholder: 'Chapter title' });
    const close = openDialog(
      'New chapter',
      input,
      el(
        'button',
        {
          class: 'button',
          onclick: () => {
            if (!input.value.trim()) return;
            close();
            insertPage(titleCase(input.value.trim()));
          },
        },
        'Start chapter',
      ),
    );
    input.focus();
  }

  function goToToday() {
    const index = data.pages.findIndex((page) => page.date === todayIso());
    if (index >= 0) turnTo(index);
    else insertPage();
  }

  function deletePage() {
    if (!confirm('Delete this page for good?')) return;
    data.pages.splice(session.pageIndex, 1);
    if (!data.pages.length) data.pages.push(createPage());
    session.pageIndex = Math.min(session.pageIndex, data.pages.length - 1);
    renderPage();
    saveSession();
  }

  function deleteWholeDiary() {
    if (!confirm('Delete the whole diary from this device? Save a backup first if you want to keep it.')) return;
    deleteDiary(session.record.id);
    session = null;
    showLibrary();
  }

  function buildStatsCard() {
    const stats = collectStats(data);
    const streak = el('b', {}, '0');
    const figure = (value, label) => {
      const number = el('b', {}, '0');
      countUp(number, value);
      return el('div', {}, number, el('small', {}, label));
    };
    countUp(streak, stats.streak);
    return el(
      'div',
      { class: 'stats-card' },
      el(
        'div',
        { class: 'streak' },
        el('span', { class: 'flame', html: FLAME_ICON }),
        el('div', {}, streak, el('small', {}, 'day streak')),
      ),
      el('div', { class: 'stats-row' }, figure(stats.pages, 'pages'), figure(stats.words, 'words'), figure(stats.days, 'days written')),
    );
  }

  function openMenu() {
    const overlay = el('div', {
      class: 'overlay drawer-overlay',
      onclick: (event) => {
        if (event.target === overlay) close();
      },
    });
    const close = () => {
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 300);
    };
    const item = (iconName, title, hint, action) =>
      el(
        'button',
        {
          class: 'menu-item',
          onclick: () => {
            close();
            setTimeout(action, 300);
          },
        },
        icon(iconName),
        el('span', {}, el('b', {}, title), el('small', {}, hint)),
      );

    const onThisDay = findOnThisDay(data);
    overlay.append(
      el(
        'aside',
        { class: 'drawer' },
        el('h3', {}, 'Menu'),
        buildStatsCard(),
        item('search', 'Search', 'Find words across your pages', openSearchDialog),
        item('sun', 'Today’s page', 'Jump to today, or start it', goToToday),
        item('plus', 'New page', 'Add a page after this one', () => insertPage()),
        item('book', 'New chapter', 'Begin a chapter on a fresh page', openChapterDialog),
        item('photo', 'Save page as image', 'A picture of this page', () => exportPageAsImage(session.pageIndex)),
        item('file', 'Export as PDF', 'Cover, every page, thank you', exportPdf),
        item('download', 'Save a backup', 'Encrypted file you can import later', () => {
          downloadBackup();
          toast('Encrypted backup saved');
        }),
        item('lock', 'Lock the diary', 'Tip: press Esc twice', async () => {
          await lockDiary();
          showLibrary();
        }),
        item('trash', 'Delete this page', 'This cannot be undone', deletePage),
        item('trash', 'Delete this diary', 'Removes it from this device', deleteWholeDiary),
        onThisDay.length ? el('h4', {}, 'On this day') : null,
        onThisDay.length
          ? el(
              'div',
              { class: 'page-chips' },
              onThisDay.map(({ page, index }) =>
                el(
                  'button',
                  {
                    class: 'chip wide',
                    onclick: () => {
                      close();
                      turnTo(index);
                    },
                  },
                  page.date.slice(0, 4),
                ),
              ),
            )
          : null,
        el('h4', {}, 'Jump to a page'),
        el(
          'div',
          { class: 'page-chips' },
          data.pages.map((page, index) =>
            el(
              'button',
              {
                class: `chip${index === session.pageIndex ? ' on' : ''}${page.chapter ? ' has-chapter' : ''}`,
                title: page.chapter,
                onclick: () => {
                  close();
                  turnTo(index);
                },
              },
              index + 1,
            ),
          ),
        ),
      ),
    );
    document.body.append(overlay);
  }

  editor.addEventListener('input', handleInput);
  editor.addEventListener('paste', (event) => {
    event.preventDefault();
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
  });
  editor.addEventListener('keydown', (event) => {
    const block = getCaretBlock(editor);
    if (event.key !== 'Enter' || !block || !block.classList.contains('topic')) return;
    event.preventDefault();
    const next = el('div', {}, el('br'));
    block.after(next);
    placeCaretAtStart(next);
    handleInput();
  });
  enableAutocorrect(editor, () => settings.auto !== false);

  sheet.addEventListener('pointerdown', (event) => {
    swipeStartX = event.clientX;
  });
  sheet.addEventListener('pointerup', (event) => {
    if (session.editing || session.drawing || swipeStartX === null) return;
    const distance = event.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(distance) < SWIPE_DISTANCE) return;
    if (distance < 0) goNext();
    else turnTo(session.pageIndex - 1);
  });

  document.onselectionchange = () => {
    if (session && session.editing) refreshStyleButtons();
  };
  document.onkeydown = (event) => {
    if (!session) return;
    const modifier = event.ctrlKey || event.metaKey;
    if (session.drawing && modifier && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) ink.redo();
      else ink.undo();
    } else if (session.drawing && modifier && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      ink.redo();
    } else if (!session.editing && !session.drawing) {
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') turnTo(session.pageIndex - 1);
    }
  };

  renderPage();
  setMode('view');
  mount(reader).then(() => ink.fit());
}
