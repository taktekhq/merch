// the wifi password is on the fridge. — drag the clutter off, read the note,
// type it in. Three things are covering it; everything else is just scenery.
export default function mount(kit) {
  const INK = '#0D0D0E', MUTED = '#6B6A66', PAPER = '#F7F5F1', GREEN = kit.colors.accent || '#00A862';
  const OAT = '#E8DFCF', CLAY = '#C9764F', BUTTER = '#F2D98A', DUSTY = '#8FA6B8';
  const PASSWORD = 'butteredtoast';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#DAD6CC' }));
  svg.append(kit.svg('rect', { x: 80, y: 40, width: 840, height: 920, rx: 26, fill: '#F3F1EC', stroke: INK, 'stroke-width': 8 }));
  svg.append(kit.svg('rect', { x: 80, y: 520, width: 840, height: 10, fill: INK, opacity: 0.15 })); // freezer seam
  svg.append(kit.svg('rect', { x: 860, y: 140, width: 18, height: 90, rx: 8, fill: INK, opacity: 0.5 })); // handle
  svg.append(kit.svg('rect', { x: 860, y: 600, width: 18, height: 90, rx: 8, fill: INK, opacity: 0.5 }));

  // the note, sitting on the door, under the clutter
  const note = kit.svg('g', { transform: 'translate(420 430) rotate(-4)' });
  note.append(
    kit.svg('rect', { x: -130, y: -70, width: 260, height: 150, fill: BUTTER, stroke: '#B99A3C', 'stroke-width': 3 }),
  );
  const noteLabel = kit.svg('text', { x: 0, y: -28, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 18, fill: INK, opacity: 0.7 });
  noteLabel.textContent = 'wifi:';
  const notePw = kit.svg('text', { x: 0, y: 18, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 30, 'font-weight': 700, fill: INK });
  notePw.textContent = PASSWORD;
  note.append(noteLabel, notePw);
  svg.append(note);

  kit.stage.append(svg);

  // draggable clutter: magnets, a takeaway menu, a kid's drawing.
  // the first three cover the note and must be moved off to reveal it.
  const items = [
    { home: { x: 360, y: 400 }, covers: true, kind: 'menu', label: 'Mimi’s Pizza', color: PAPER },
    { home: { x: 470, y: 470 }, covers: true, kind: 'magnet', label: '★', color: CLAY },
    { home: { x: 400, y: 340 }, covers: true, kind: 'drawing', label: null, color: '#FDFBF6' },
    { home: { x: 700, y: 300 }, covers: false, kind: 'magnet', label: '●', color: GREEN },
    { home: { x: 250, y: 650 }, covers: false, kind: 'menu', label: 'Dry clean', color: OAT },
    { home: { x: 650, y: 700 }, covers: false, kind: 'drawing', label: null, color: '#FDFBF6' },
  ];

  const REMOVE_DIST = 230;
  let coveringLeft = items.filter((i) => i.covers).length;

  const drawItem = (it) => {
    const g = kit.svg('g', { transform: `translate(${it.home.x} ${it.home.y})`, 'data-covers': it.covers ? '1' : '0', style: { cursor: 'grab', touchAction: 'none' } });
    if (it.kind === 'menu') {
      g.append(kit.svg('rect', { x: -70, y: -50, width: 140, height: 100, rx: 6, fill: it.color, stroke: INK, 'stroke-width': 3 }));
      g.append(kit.svg('text', { x: 0, y: -10, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 13, fill: MUTED, 'font-weight': 700 }, [it.label]));
      g.append(kit.svg('line', { x1: -45, y1: 10, x2: 45, y2: 10, stroke: MUTED, 'stroke-width': 3 }));
      g.append(kit.svg('line', { x1: -45, y1: 24, x2: 30, y2: 24, stroke: MUTED, 'stroke-width': 3 }));
    } else if (it.kind === 'drawing') {
      g.append(kit.svg('rect', { x: -60, y: -46, width: 120, height: 92, rx: 4, fill: it.color, stroke: INK, 'stroke-width': 3 }));
      g.append(kit.svg('circle', { cx: 0, cy: -8, r: 24, fill: 'none', stroke: DUSTY, 'stroke-width': 5 }));
      g.append(kit.svg('path', { d: 'M -30 20 L 30 20', stroke: CLAY, 'stroke-width': 5, 'stroke-linecap': 'round' }));
    } else {
      g.append(kit.svg('circle', { r: 30, fill: it.color, stroke: INK, 'stroke-width': 3 }));
      g.append(kit.svg('text', { x: 0, y: 9, 'text-anchor': 'middle', 'font-size': 24, fill: '#fff' }, [it.label]));
    }
    svg.append(g);
    return g;
  };

  const els = items.map((it) => ({ it, el: drawItem(it), x: it.home.x, y: it.home.y, removed: false }));

  let dragging = null, offset = { x: 0, y: 0 };
  const toUnits = (e) => { const p = kit.point(e); return { x: p.x * 1000, y: p.y * 1000 }; };

  for (const rec of els) {
    kit.on(rec.el, 'pointerdown', (e) => {
      if (rec.removed) return;
      e.preventDefault();
      rec.el.setPointerCapture?.(e.pointerId);
      const u = toUnits(e);
      offset = { x: rec.x - u.x, y: rec.y - u.y };
      dragging = rec;
      rec.el.style.cursor = 'grabbing';
    });
  }
  kit.on(window, 'pointermove', (e) => {
    if (!dragging) return;
    const u = toUnits(e);
    dragging.x = u.x + offset.x; dragging.y = u.y + offset.y;
    dragging.el.setAttribute('transform', `translate(${dragging.x} ${dragging.y})`);
  });
  kit.on(window, 'pointerup', () => {
    if (!dragging) return;
    const rec = dragging; dragging = null; rec.el.style.cursor = 'grab';
    if (!rec.it.covers) return;
    const d = Math.hypot(rec.x - rec.it.home.x, rec.y - rec.it.home.y);
    if (d >= REMOVE_DIST) {
      rec.removed = true;
      rec.el.style.transition = 'opacity .3s ease';
      rec.el.style.opacity = '0';
      rec.el.style.pointerEvents = 'none';
      coveringLeft--;
      if (coveringLeft === 0) reveal();
    }
  });

  const form = kit.el('form', {
    id: 'wifi-form',
    style: { position: 'absolute', left: '6%', right: '6%', bottom: '5%', display: 'none', gap: '8px' },
  });
  const input = kit.el('input', { id: 'wifi-input', type: 'text', placeholder: 'network password', autocomplete: 'off', style: { flex: '1', font: '16px var(--mono)', padding: '10px 12px', border: '1px solid #cfcabd', borderRadius: '10px' } });
  const submit = kit.el('button', { class: 'g-btn solid', type: 'submit', text: 'Connect' });
  form.style.display = 'none';
  form.append(input, submit);
  kit.stage.append(form);

  function reveal() {
    kit.status('there it is. type it in.');
    form.style.display = 'flex';
    input.focus();
  }

  kit.on(form, 'submit', (e) => {
    e.preventDefault();
    const val = input.value.trim().toLowerCase().replace(/\s+/g, '');
    if (val === PASSWORD) kit.win('connected.');
    else kit.status('nope. look again.');
  });

  kit.status('something’s on the fridge. move it.');
}
