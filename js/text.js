const AUTOCORRECT = {
  i: 'I',
  im: "I'm",
  ive: "I've",
  dont: "don't",
  cant: "can't",
  wont: "won't",
  didnt: "didn't",
  doesnt: "doesn't",
  isnt: "isn't",
  wasnt: "wasn't",
  couldnt: "couldn't",
  shouldnt: "shouldn't",
  wouldnt: "wouldn't",
  arent: "aren't",
  havent: "haven't",
  thats: "that's",
  whats: "what's",
  teh: 'the',
  recieve: 'receive',
  definately: 'definitely',
  becuase: 'because',
  tommorow: 'tomorrow',
  untill: 'until',
  thier: 'their',
};

const INLINE_TAGS = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', S: 's', STRIKE: 's', DEL: 's', MARK: 'mark' };

function titleCase(text) {
  return text.replace(/(^|[\s-])(\p{L})/gu, (_, lead, letter) => lead + letter.toUpperCase());
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}

function isVisibleColor(color) {
  return Boolean(color) && !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(color);
}

function sanitize(parent) {
  let html = '';
  parent.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      html += escapeHtml(node.textContent);
      return;
    }
    if (node.nodeName === 'BR') {
      html += '<br>';
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const inner = sanitize(node);
    if (node.nodeName === 'DIV' || node.nodeName === 'P') {
      html += serializeBlock(node, inner);
      return;
    }
    const highlighted = node.nodeName === 'SPAN' && isVisibleColor(node.style.backgroundColor);
    const tag = highlighted ? 'mark' : INLINE_TAGS[node.nodeName];
    html += tag ? `<${tag}>${inner}</${tag}>` : inner;
  });
  return html;
}

function serializeBlock(block, inner = sanitize(block)) {
  const isTopic = block.classList.contains('topic') || block.classList.contains('tp');
  return `<div${isTopic ? ' class="topic"' : ''}>${inner || '<br>'}</div>`;
}

function plainText(html) {
  return parseHtml(html).textContent;
}

function wordCount(html) {
  const text = plainText(html).trim();
  return text ? text.split(/\s+/).length : 0;
}

function isoDate(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const todayIso = () => isoDate(new Date());

function formatDate(iso) {
  return new Date(`${iso}T12:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
