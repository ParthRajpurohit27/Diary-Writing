const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const PDF_WIDTH = 1240;
const PDF_HEIGHT = 1754;
const COVER_GRADIENTS = {
  sky: ['#5aa0e6', '#2b64b3'],
  coral: ['#f58a74', '#c9473a'],
  mint: ['#5cc4a6', '#2a8672'],
  sun: ['#f6c453', '#d08a1a'],
  rose: ['#ea8cb0', '#b84d7a'],
  ink: ['#27396a', '#0e1626'],
  oxblood: ['#74222f', '#2a0b11'],
  forest: ['#2a5444', '#0d1d17'],
  graphite: ['#454955', '#17181c'],
  umber: ['#7a5532', '#2b1b0e'],
};
const PAPER_COLORS = {
  light: { paper: '#f4eddc', ink: '#26272f', rule: 'rgba(70,100,130,.34)', border: 'rgba(138,122,90,.42)', margin: 'rgba(190,70,70,.4)' },
  dark: {
    paper: '#1b1e27',
    ink: '#e7e1d0',
    rule: 'rgba(255,255,255,.14)',
    border: 'rgba(214,178,100,.4)',
    margin: 'rgba(232,100,100,.35)',
  },
};

function loadImage(source) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

function drawCoverPage(isBackCover) {
  const canvas = document.createElement('canvas');
  canvas.width = PDF_WIDTH;
  canvas.height = PDF_HEIGHT;
  const ctx = canvas.getContext('2d');
  const [from, to] = COVER_GRADIENTS[session.record.cover] || COVER_GRADIENTS.sky;
  const gradient = ctx.createLinearGradient(0, 0, PDF_WIDTH, PDF_HEIGHT);
  gradient.addColorStop(0, from);
  gradient.addColorStop(1, to);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, PDF_WIDTH, PDF_HEIGHT);

  ctx.strokeStyle = 'rgba(255,243,207,.8)';
  ctx.lineWidth = 3;
  ctx.setLineDash([16, 12]);
  ctx.strokeRect(PDF_WIDTH * 0.08, PDF_HEIGHT * 0.05, PDF_WIDTH * 0.84, PDF_HEIGHT * 0.9);
  ctx.setLineDash([]);
  ctx.fillStyle = '#fff6dc';
  ctx.textAlign = 'center';

  if (isBackCover) {
    ctx.font = '700 190px Caveat, cursive';
    ctx.fillText('Thank you', PDF_WIDTH / 2, PDF_HEIGHT * 0.5);
    ctx.font = 'italic 50px Inter, sans-serif';
    ctx.fillText('for reading', PDF_WIDTH / 2, PDF_HEIGHT * 0.5 + 90);
    return canvas;
  }

  const name = session.record.name;
  let size = 130;
  do ctx.font = `600 ${(size -= 4)}px Inter, sans-serif`;
  while (ctx.measureText(name).width > PDF_WIDTH * 0.68 && size > 24);
  ctx.fillText(name, PDF_WIDTH / 2, PDF_HEIGHT * 0.34 + 150);
  ctx.font = 'italic 56px Inter, sans-serif';
  ctx.fillText('Welcome to', PDF_WIDTH / 2, PDF_HEIGHT * 0.34);
  ctx.fillText('diary', PDF_WIDTH / 2, PDF_HEIGHT * 0.34 + 230);
  ctx.font = '600 84px Caveat, cursive';
  ctx.fillText(`written by ${writerName() || 'Me'}`, PDF_WIDTH / 2, PDF_HEIGHT * 0.68);
  return canvas;
}

function collectRuns(node, style, runs) {
  const flags = { B: 'bold', I: 'italic', U: 'underline', S: 'strike', MARK: 'mark' };
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) runs.push({ text: child.textContent, ...style });
    else if (child.nodeName === 'BR') runs.push({ lineBreak: true });
    else if (child.nodeType === Node.ELEMENT_NODE)
      collectRuns(child, flags[child.nodeName] ? { ...style, [flags[child.nodeName]]: true } : style, runs);
  });
}

function parseBlocks(html) {
  return [...parseHtml(html).childNodes].map((node) => {
    const runs = [];
    if (node.nodeType === Node.TEXT_NODE) runs.push({ text: node.textContent });
    else collectRuns(node, {}, runs);
    return { isTopic: Boolean(node.classList && node.classList.contains('topic')), runs };
  });
}

async function renderPageCanvases(page, number, width = PDF_WIDTH, height = PDF_HEIGHT) {
  const settings = session.data.set;
  const colors = PAPER_COLORS[settings.paper === 'dark' ? 'dark' : 'light'];
  const ruled = settings.rule !== 'plain';
  const image = page.img ? await loadImage(page.img.src) : null;
  const fontSize = width * 0.06;
  const lineHeight = fontSize * 1.65;
  const left = width * 0.12;
  const right = width * 0.09;
  const top = width * 0.17;
  const bottom = height - width * 0.11;
  const textWidth = width - left - right;
  const canvases = [];
  let canvas;
  let ctx;
  let y;

  const startCanvas = () => {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = colors.paper;
    ctx.fillRect(0, 0, width, height);
    if (image) {
      ctx.globalAlpha = page.img.o / 100;
      const imageWidth = (width * page.img.s) / 100;
      const imageHeight = (imageWidth * image.height) / image.width;
      ctx.drawImage(
        image,
        (width * page.img.x) / 100 - imageWidth / 2,
        (height * page.img.y) / 100 - imageHeight / 2,
        imageWidth,
        imageHeight,
      );
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(width * 0.036, width * 0.036, width * 0.928, height - width * 0.072);
    if (ruled) {
      ctx.strokeStyle = colors.rule;
      for (let line = top + lineHeight; line <= bottom; line += lineHeight) {
        ctx.beginPath();
        ctx.moveTo(left - width * 0.02, line);
        ctx.lineTo(width - right + width * 0.01, line);
        ctx.stroke();
      }
      ctx.fillStyle = colors.margin;
      ctx.fillRect(width * 0.095, width * 0.036, 2, height - width * 0.072);
    }
    ctx.fillStyle = colors.ink;
    ctx.globalAlpha = 0.8;
    ctx.textAlign = 'right';
    ctx.font = `${width * 0.038}px Caveat, cursive`;
    ctx.fillText(formatDate(page.date), width - right, width * 0.12);
    if (page.chapter) {
      ctx.textAlign = 'center';
      ctx.font = `${width * 0.042}px Caveat, cursive`;
      ctx.fillText(`Chapter: ${page.chapter}`, width / 2, width * 0.17);
    }
    ctx.globalAlpha = 0.5;
    ctx.textAlign = 'center';
    ctx.font = `${width * 0.036}px Caveat, cursive`;
    ctx.fillText(number, width / 2, height - width * 0.055);
    ctx.globalAlpha = 1;
    y = top;
    canvases.push(canvas);
  };

  startCanvas();
  for (const block of parseBlocks(page.html)) {
    const size = block.isTopic ? fontSize * 1.4 : fontSize;
    const rowHeight = block.isTopic ? lineHeight * 2 : lineHeight;
    const fontFor = (run) => `${run.italic ? 'italic ' : ''}${run.bold ? 700 : block.isTopic ? 600 : 400} ${size}px Caveat, cursive`;

    let rows = [[]];
    let rowWidth = 0;
    for (const run of block.runs) {
      if (run.lineBreak) {
        rows.push([]);
        rowWidth = 0;
        continue;
      }
      for (const token of run.text.split(/(\s+)/)) {
        if (!token) continue;
        ctx.font = fontFor(run);
        const tokenWidth = ctx.measureText(token).width;
        const isSpace = !token.trim();
        const row = rows[rows.length - 1];
        if (rowWidth + tokenWidth > textWidth && !isSpace && row.length) {
          rows.push([]);
          rowWidth = 0;
        }
        if (isSpace && !rows[rows.length - 1].length) continue;
        rows[rows.length - 1].push({ token, tokenWidth, run });
        rowWidth += tokenWidth;
      }
    }

    for (const row of rows) {
      if (y + rowHeight > bottom + 1) startCanvas();
      const total = row.reduce((sum, item) => sum + item.tokenWidth, 0);
      const baseline = y + rowHeight * (block.isTopic ? 0.66 : 0.72);
      let x = block.isTopic ? left + (textWidth - total) / 2 : left;
      for (const { token, tokenWidth, run } of row) {
        ctx.font = fontFor(run);
        if (run.mark) {
          ctx.fillStyle = 'rgba(255,214,90,.55)';
          ctx.fillRect(x, baseline - size * 0.8, tokenWidth, size * 1.05);
        }
        ctx.fillStyle = colors.ink;
        ctx.textAlign = 'left';
        ctx.fillText(token, x, baseline);
        const barHeight = Math.max(2, size * 0.05);
        if (run.underline) ctx.fillRect(x, baseline + size * 0.1, tokenWidth, barHeight);
        if (run.strike) ctx.fillRect(x, baseline - size * 0.28, tokenWidth, barHeight);
        x += tokenWidth;
      }
      y += rowHeight;
    }
  }
  if (page.ink && page.ink.length) drawInk(canvases[0].getContext('2d'), page.ink, width, height, colors.ink);
  return canvases;
}

async function waitForFonts() {
  await Promise.all(['40px Caveat', '600 40px Caveat', '700 40px Caveat', '600 40px Inter'].map((font) => document.fonts.load(font)));
}

async function exportPdf() {
  toast('Building your PDF…');
  try {
    if (!window.jspdf) await loadScript(JSPDF_URL);
    await waitForFonts();
    const document_ = new window.jspdf.jsPDF({ unit: 'px', format: [PDF_WIDTH, PDF_HEIGHT], orientation: 'portrait', compress: true });
    const canvases = [drawCoverPage(false)];
    for (let i = 0; i < session.data.pages.length; i++) canvases.push(...(await renderPageCanvases(session.data.pages[i], i + 1)));
    canvases.push(drawCoverPage(true));
    canvases.forEach((canvas, index) => {
      if (index) document_.addPage([PDF_WIDTH, PDF_HEIGHT], 'portrait');
      document_.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, PDF_WIDTH, PDF_HEIGHT);
    });
    document_.save(`${session.record.name.replace(/\W+/g, '_')}.pdf`);
    toast('PDF saved');
  } catch (error) {
    console.error(error);
    toast('Could not build the PDF. Check your internet and try again.');
  }
}

async function exportPageAsImage(pageIndex) {
  await waitForFonts();
  const [canvas] = await renderPageCanvases(session.data.pages[pageIndex], pageIndex + 1);
  canvas.toBlob((blob) => {
    el('a', { href: URL.createObjectURL(blob), download: `${session.record.name.replace(/\W+/g, '_')}_page_${pageIndex + 1}.png` }).click();
    toast('Page saved as an image');
  });
}
