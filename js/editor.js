const CARET_TOKEN = '\u2063';
const SENTENCE_END = /[.!?…]["'”)]*\s+$/;
const WORD_SEPARATOR = /^[\s.,!?;:)]$/;
const MAX_SPILL_STEPS = 200;

function getCaretBlock(editor) {
  let node = getSelection().anchorNode;
  if (!node || node === editor || !editor.contains(node)) return null;
  while (node.parentNode !== editor) node = node.parentNode;
  return node.nodeType === Node.ELEMENT_NODE ? node : null;
}

function placeCaretAtStart(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(true);
  const selection = getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function normalizeBlocks(editor) {
  if (!editor.childNodes.length) editor.append(el('div', {}, el('br')));
  [...editor.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE || node.nodeName === 'BR') {
      const block = document.createElement('div');
      node.replaceWith(block);
      block.append(node);
    }
  });
}

function textBeforeCaret(block, selection) {
  const range = document.createRange();
  range.selectNodeContents(block);
  range.setEnd(selection.anchorNode, selection.anchorOffset);
  return range.toString();
}

function correctWordBeforeCaret(selection, textBefore) {
  const match = /([A-Za-z]+)$/.exec(textBefore);
  if (!match) return;
  const word = match[1];
  let fix = AUTOCORRECT[word.toLowerCase()];
  if (!fix) return;
  if (word[0] === word[0].toUpperCase() && fix[0] !== 'I') fix = fix[0].toUpperCase() + fix.slice(1);
  if (fix === word) return;
  for (let i = 0; i < word.length; i++) selection.modify('extend', 'backward', 'character');
  document.execCommand('insertText', false, fix);
}

function enableAutocorrect(editor, isEnabled) {
  editor.addEventListener('beforeinput', (event) => {
    const typed = event.data;
    if (!isEnabled() || event.inputType !== 'insertText' || !typed || typed.length !== 1 || event.isComposing) return;

    const selection = getSelection();
    const block = getCaretBlock(editor);
    if (!block || !selection.isCollapsed) return;

    const textBefore = textBeforeCaret(block, selection);
    const startsSentence = !textBefore.trim() || SENTENCE_END.test(textBefore);
    if (/^[a-z]$/.test(typed) && startsSentence) {
      event.preventDefault();
      document.execCommand('insertText', false, typed.toUpperCase());
      return;
    }
    if (WORD_SEPARATOR.test(typed)) correctWordBeforeCaret(selection, textBefore);
  });
}

function insertTopic(editor) {
  const block = getCaretBlock(editor);
  let topic;
  if (block && !block.textContent.trim()) {
    topic = block;
  } else {
    topic = document.createElement('div');
    if (block) block.after(topic);
    else editor.append(topic);
  }
  topic.className = 'topic';
  topic.replaceChildren();
  editor.focus();
  placeCaretAtStart(topic);
}

function insertCaretToken(editor) {
  const selection = getSelection();
  if (!selection.rangeCount || !editor.contains(selection.anchorNode)) return false;
  const range = selection.getRangeAt(0).cloneRange();
  range.collapse(true);
  range.insertNode(document.createTextNode(CARET_TOKEN));
  return true;
}

function restoreCaretFromToken(editor) {
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const position = node.data.indexOf(CARET_TOKEN);
    if (position < 0) continue;
    node.data = node.data.replace(CARET_TOKEN, '');
    if (!node.data) node.after(document.createElement('br'));
    const range = document.createRange();
    range.setStart(node, position);
    range.collapse(true);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }
  return false;
}

function isOverflowing(editor) {
  return editor.scrollHeight > editor.clientHeight + 1;
}

function mapTextNodes(block) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let length = 0;
  while (walker.nextNode()) {
    nodes.push({ node: walker.currentNode, start: length });
    length += walker.currentNode.data.length;
  }
  return { nodes, length };
}

function pointAt(nodes, index) {
  let i = nodes.length - 1;
  while (i > 0 && nodes[i].start > index) i--;
  return { node: nodes[i].node, offset: index - nodes[i].start };
}

function firstOverflowingIndex(nodes, length, limit) {
  const range = document.createRange();
  const bottomOf = (from) => {
    for (let index = from; index < length; index++) {
      const { node, offset } = pointAt(nodes, index);
      range.setStart(node, offset);
      range.setEnd(node, offset + 1);
      const rect = range.getBoundingClientRect();
      if (rect.height) return rect.bottom;
    }
    return -1;
  };
  let low = 0;
  let high = length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (bottomOf(middle) > limit) high = middle;
    else low = middle + 1;
  }
  return low;
}

function splitBlockAtLimit(block, limit) {
  const { nodes, length } = mapTextNodes(block);
  const index = firstOverflowingIndex(nodes, length, limit);
  if (index >= length) return null;
  const { node, offset } = pointAt(nodes, index);
  const range = document.createRange();
  range.setStart(node, offset);
  range.setEndAfter(block.lastChild);
  return range.extractContents();
}

function spillOverflow(editor) {
  const moved = [];
  const limit = () => editor.getBoundingClientRect().top + editor.clientHeight;

  for (let step = 0; step < MAX_SPILL_STEPS && isOverflowing(editor); step++) {
    editor.scrollTop = 0;
    const last = editor.lastElementChild;
    if (!last) break;

    if (editor.children.length > 1 && last.getBoundingClientRect().top >= limit() - 1) {
      moved.unshift(serializeBlock(last));
      last.remove();
      continue;
    }

    const fragment = splitBlockAtLimit(last, limit());
    if (!fragment) break;
    const holder = document.createElement('div');
    holder.append(fragment);
    moved.unshift(serializeBlock(holder));
    if (!last.textContent && editor.children.length > 1) last.remove();
    else if (!last.firstChild) last.append(document.createElement('br'));
  }
  return moved.join('');
}
