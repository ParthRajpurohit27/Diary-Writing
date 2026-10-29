const INK_COLORS = ['auto', '#1d4ed8', '#d62839', '#1f9d63', '#f2a900', '#8a3ffc'];
const HIGHLIGHTER_SCALE = 5;
const ERASER_RADIUS = 0.022;

function resolveInkColor(color, autoColor) {
  return color === 'auto' ? autoColor : color;
}

function traceStroke(ctx, points, width, height) {
  const at = (index) => [points[index][0] * width, points[index][1] * height];
  ctx.beginPath();
  const [startX, startY] = at(0);
  ctx.moveTo(startX, startY);
  if (points.length === 1) ctx.lineTo(startX + 0.01, startY);
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = at(i);
    const [nextX, nextY] = at(i + 1);
    ctx.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2);
  }
  if (points.length > 1) {
    const [lastX, lastY] = at(points.length - 1);
    ctx.lineTo(lastX, lastY);
  }
}

function drawStroke(ctx, stroke, width, height, autoColor) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = resolveInkColor(stroke.color, autoColor);
  ctx.lineWidth = Math.max(1, stroke.width * width);
  ctx.globalAlpha = stroke.tool === 'highlighter' ? 0.35 : 1;
  traceStroke(ctx, stroke.points, width, height);
  ctx.stroke();
  ctx.restore();
}

function drawInk(ctx, strokes, width, height, autoColor) {
  strokes.forEach((stroke) => drawStroke(ctx, stroke, width, height, autoColor));
}

function createInkLayer({ sheet, getPage, onChange }) {
  const canvas = el('canvas', { class: 'ink-layer' });
  const preview = el('canvas', { class: 'ink-preview' });
  const context = canvas.getContext('2d');
  const previewContext = preview.getContext('2d');
  const histories = new Map();
  const options = { active: false, tool: 'pen', color: 'auto', size: 0.005 };
  let activeStroke = null;
  let erasedInGesture = null;
  let penSeen = false;

  const history = () => {
    const id = getPage().id;
    if (!histories.has(id)) histories.set(id, { undo: [], redo: [] });
    return histories.get(id);
  };
  const strokes = () => (getPage().ink = getPage().ink || []);
  const autoColor = () => getComputedStyle(sheet).getPropertyValue('--ink-color').trim() || '#26272f';

  function fitCanvases() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(sheet.clientWidth * ratio);
    const height = Math.round(sheet.clientHeight * ratio);
    if (!width || (canvas.width === width && canvas.height === height)) return;
    [canvas, preview].forEach((layer) => {
      layer.width = width;
      layer.height = height;
    });
    render();
  }

  function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawInk(context, strokes(), canvas.width, canvas.height, autoColor());
  }

  function pointFrom(event) {
    const bounds = canvas.getBoundingClientRect();
    const pressure = event.pointerType === 'pen' && event.pressure ? event.pressure : 0.5;
    return [(event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height, pressure];
  }

  function eraseAt(point) {
    const aspect = canvas.height / canvas.width;
    const hit = strokes().filter((stroke) =>
      stroke.points.some(([x, y]) => Math.hypot(x - point[0], (y - point[1]) * aspect) < ERASER_RADIUS + stroke.width / 2),
    );
    if (!hit.length) return;
    hit.forEach((stroke) => {
      erasedInGesture.push({ stroke, index: strokes().indexOf(stroke) });
      strokes().splice(strokes().indexOf(stroke), 1);
    });
    render();
  }

  function begin(event) {
    if (!options.active) return;
    if (event.pointerType === 'pen') penSeen = true;
    if (event.pointerType === 'touch' && penSeen) return;
    event.preventDefault();
    preview.setPointerCapture(event.pointerId);
    const point = pointFrom(event);
    if (options.tool === 'eraser') {
      erasedInGesture = [];
      eraseAt(point);
      return;
    }
    const scale = options.tool === 'highlighter' ? HIGHLIGHTER_SCALE : 1;
    activeStroke = { tool: options.tool, color: options.color, width: options.size * scale, points: [point] };
  }

  function move(event) {
    if (!activeStroke && !erasedInGesture) return;
    const events = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];
    events.forEach((item) => {
      const point = pointFrom(item);
      if (erasedInGesture) eraseAt(point);
      else activeStroke.points.push(point);
    });
    if (activeStroke) {
      previewContext.clearRect(0, 0, preview.width, preview.height);
      drawStroke(previewContext, activeStroke, preview.width, preview.height, autoColor());
    }
  }

  function end() {
    if (activeStroke) {
      strokes().push(activeStroke);
      history().undo.push({ type: 'add', stroke: activeStroke });
      history().redo.length = 0;
      previewContext.clearRect(0, 0, preview.width, preview.height);
      render();
      activeStroke = null;
      onChange();
    } else if (erasedInGesture) {
      if (erasedInGesture.length) {
        history().undo.push({ type: 'erase', items: erasedInGesture });
        history().redo.length = 0;
        onChange();
      }
      erasedInGesture = null;
    }
  }

  preview.addEventListener('pointerdown', begin);
  preview.addEventListener('pointermove', move);
  preview.addEventListener('pointerup', end);
  preview.addEventListener('pointercancel', end);
  new ResizeObserver(fitCanvases).observe(sheet);

  const reverse = {
    add: (action) => strokes().splice(strokes().indexOf(action.stroke), 1),
    erase: (action) => [...action.items].reverse().forEach(({ stroke, index }) => strokes().splice(index, 0, stroke)),
    clear: (action) => strokes().splice(0, 0, ...action.removed),
  };
  const replay = {
    add: (action) => strokes().push(action.stroke),
    erase: (action) => action.items.forEach(({ stroke }) => strokes().splice(strokes().indexOf(stroke), 1)),
    clear: () => strokes().splice(0),
  };

  return {
    canvas,
    preview,
    render,
    fit: fitCanvases,
    canUndo: () => history().undo.length > 0,
    canRedo: () => history().redo.length > 0,
    setActive: (active) => (options.active = active),
    setTool: (tool) => (options.tool = tool),
    setColor: (color) => (options.color = color),
    setSize: (size) => (options.size = size),
    undo() {
      const action = history().undo.pop();
      if (!action) return;
      reverse[action.type](action);
      history().redo.push(action);
      render();
      onChange();
    },
    redo() {
      const action = history().redo.pop();
      if (!action) return;
      replay[action.type](action);
      history().undo.push(action);
      render();
      onChange();
    },
    clear() {
      if (!strokes().length) return;
      const removed = strokes().splice(0);
      history().undo.push({ type: 'clear', removed });
      history().redo.length = 0;
      render();
      onChange();
    },
  };
}
