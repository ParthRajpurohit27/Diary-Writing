const WRITING_PROMPTS = [
  'What made you smile today?',
  'Describe a moment you want to remember.',
  'Who did you think about most today, and why?',
  'What are you proud of this week?',
  'Write a letter to yourself one year from now.',
  'What did you learn recently that surprised you?',
  'Describe your day using only colors.',
  'What are you grateful for right now?',
  'What is worrying you, and what is one small step you can take?',
  'Describe a place where you feel completely calm.',
  'What would you tell your younger self?',
  'What small thing made today better?',
  'What do you want more of in your life?',
  'Describe a person who changed the way you think.',
  'Which memory feels like it happened yesterday?',
  'What are you looking forward to?',
  'Write about a meal you will never forget.',
  'What did you do today that you almost did not do?',
  'What song is stuck in your head, and what does it remind you of?',
  'Describe the best part of your morning.',
  'What is something you forgave recently?',
  'List three things you noticed today that you usually miss.',
  'What would a perfect day look like for you?',
  'What fear would you like to let go of?',
  'What are you curious about lately?',
];

let lastPromptIndex = -1;

function pickPrompt() {
  let index;
  do index = Math.floor(Math.random() * WRITING_PROMPTS.length);
  while (index === lastPromptIndex);
  lastPromptIndex = index;
  return WRITING_PROMPTS[index];
}

function calculateStreak(days) {
  const written = new Set(days);
  const cursor = new Date();
  if (!written.has(isoDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (written.has(isoDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function recordWritingDay(data) {
  const today = todayIso();
  if (data.stats.days.includes(today)) return null;
  data.stats.days.push(today);
  return calculateStreak(data.stats.days);
}

function collectStats(data) {
  return {
    pages: data.pages.length,
    words: data.pages.reduce((total, page) => total + wordCount(page.html), 0),
    days: data.stats.days.length,
    streak: calculateStreak(data.stats.days),
  };
}

function findOnThisDay(data) {
  const today = todayIso();
  return data.pages
    .map((page, index) => ({ page, index }))
    .filter(
      ({ page }) => page.date.slice(5) === today.slice(5) && page.date.slice(0, 4) !== today.slice(0, 4) && plainText(page.html).trim(),
    );
}

function countUp(node, target, duration = 900) {
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    node.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
