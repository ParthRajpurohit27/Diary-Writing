async function showWelcome() {
  const greeting = el('h2', { class: 'greeting' });
  const mascot = createMascot(250, 'wave');
  const input = el('input', {
    placeholder: 'your good name',
    maxlength: 24,
    onkeydown: (event) => {
      if (event.key === 'Enter') submit();
    },
  });
  const form = el('div', { class: 'name-form', hidden: '' }, input, el('button', { class: 'button', onclick: submit }, 'That is me'));
  mount(el('div', { class: 'welcome' }, mascot, el('div', { class: 'bubble tail-up' }, greeting), form));

  async function submit() {
    const name = titleCase(input.value.trim());
    if (!name) {
      form.classList.add('shake');
      mascot.play('sad');
      playSound('bad');
      setTimeout(() => form.classList.remove('shake'), 450);
      return;
    }
    localStorage.setItem('writer_name', name);
    form.hidden = true;
    mascot.play('cheer');
    playSound('ok');
    burstConfetti();
    await typeText(greeting, `Nice to meet you, ${name}.`);
    await sleep(1700);
    showLibrary();
  }

  await sleep(300);
  await typeText(greeting, 'Hey there. Before we begin');
  await sleep(500);
  await typeText(greeting, 'what should I call you?');
  mascot.play('idle');
  form.hidden = false;
  input.focus();
}
