// T15 — the wifi password is on the fridge. magnets
// A real fridge: kids' drawings, takeaway menus, fruit magnets. Three things cover the
// password. Drag them off, then a phone appears to type it in.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, muted = art.MUTED, accent = art.ACCENT;
  const PASSWORD = 'butteredtoast';
  const head = art.heading(kit, 'the wifi password is on the fridge.', 'three things are in the way');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const r = art.room(kit, { wall: '#ECE6D8', floor: '#D8D2C4', floorY: 920 });
  svg.append(r.el);

  // the fridge: body, seam, handles, a contact shadow (pushed down, clear of the heading)
  const FX = 90, FY = 140, FW = 760, FH = 780;
  art.shadow(svg, FX + FW / 2, FY + FH + 8, FW * 0.9, 0.14);
  svg.append(kit.svg('rect', { x: FX, y: FY, width: FW, height: FH, rx: 22, fill: '#F2F0EB', stroke: ink, 'stroke-width': 6 }));
  svg.append(kit.svg('rect', { x: FX, y: FY, width: FW * 0.16, height: FH, rx: 22, fill: art.shade('#F2F0EB', 0.12), opacity: 0.7 }));
  svg.append(kit.svg('rect', { x: FX + FW * 0.84, y: FY, width: FW * 0.16, height: FH, rx: 22, fill: art.shade('#F2F0EB', -0.14), opacity: 0.55 }));
  svg.append(kit.svg('rect', { x: FX, y: FY + FH * 0.58, width: FW, height: 10, fill: art.shade('#F2F0EB', -0.2), opacity: 0.6 })); // freezer seam
  svg.append(kit.svg('rect', { x: FX + FW - 26, y: FY + 120, width: 16, height: 110, rx: 8, fill: muted, opacity: 0.55 }));
  svg.append(kit.svg('rect', { x: FX + FW - 26, y: FY + FH * 0.58 + 36, width: 16, height: 90, rx: 8, fill: muted, opacity: 0.55 }));

  const door = kit.svg('g');
  svg.append(door);

  // the note, sitting on the door, under the clutter — a real sticky note
  const note = kit.svg('g', { transform: 'translate(430 510) rotate(-4)' });
  note.append(kit.svg('path', { d: 'M -120 -64 L 110 -70 L 118 70 L -112 76 Z', fill: art.BUTTER, stroke: art.shade(art.BUTTER, -0.3), 'stroke-width': 2 }));
  note.append(kit.svg('path', { d: 'M -120 -64 L -80 -64 L -112 -26 Z', fill: art.shade(art.BUTTER, -0.18) })); // folded corner
  const noteLabel = kit.svg('text', { x: 0, y: -16, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 16, fill: ink, opacity: 0.65 });
  noteLabel.textContent = 'wifi:';
  const notePw = kit.svg('text', { x: 0, y: 22, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 26, 'font-weight': 700, fill: ink });
  notePw.textContent = PASSWORD;
  note.append(noteLabel, notePw);
  door.append(note);

  // draggable clutter: proper little drawings, menus, fruit magnets
  const items = [
    { home: { x: 360, y: 470 }, covers: true, kind: 'menu', label: 'mimi’s pizza', color: '#F6F2E8' },
    { home: { x: 500, y: 560 }, covers: true, kind: 'magnet-strawberry', color: '#D23F4A' },
    { home: { x: 390, y: 400 }, covers: true, kind: 'drawing', color: '#FDFBF6' },
    { home: { x: 700, y: 330 }, covers: false, kind: 'magnet-lemon', color: art.BUTTER },
    { home: { x: 220, y: 690 }, covers: false, kind: 'menu', label: 'dry clean', color: art.OAT },
    { home: { x: 630, y: 760 }, covers: false, kind: 'drawing', color: '#FDFBF6' },
    { home: { x: 560, y: 240 }, covers: false, kind: 'magnet-dot', color: accent },
  ];

  const REMOVE_DIST = 230;
  let coveringLeft = items.filter((i) => i.covers).length;

  const drawItem = (it) => {
    const g = kit.svg('g', { transform: `translate(${it.home.x} ${it.home.y})`, style: { cursor: 'grab', touchAction: 'none' } });
    art.shadow(g, 2, 48, 90, 0.07);
    if (it.kind === 'menu') {
      g.append(kit.svg('rect', { x: -70, y: -50, width: 140, height: 100, rx: 6, fill: it.color, stroke: ink, 'stroke-width': 3 }));
      g.append(kit.svg('circle', { cx: -40, cy: -28, r: 13, fill: art.CLAY, opacity: 0.8 }));
      g.append(kit.svg('text', { x: 6, y: -24, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 12, fill: muted, 'font-weight': 700 }, [it.label]));
      g.append(kit.svg('line', { x1: -45, y1: 6, x2: 45, y2: 6, stroke: muted, 'stroke-width': 3, opacity: 0.6 }));
      g.append(kit.svg('line', { x1: -45, y1: 22, x2: 30, y2: 22, stroke: muted, 'stroke-width': 3, opacity: 0.6 }));
      g.append(kit.svg('line', { x1: -45, y1: 38, x2: 40, y2: 38, stroke: muted, 'stroke-width': 3, opacity: 0.6 }));
    } else if (it.kind === 'drawing') {
      g.append(kit.svg('rect', { x: -58, y: -44, width: 116, height: 88, rx: 4, fill: it.color, stroke: ink, 'stroke-width': 3 }));
      g.append(kit.svg('circle', { cx: 4, cy: -14, r: 20, fill: 'none', stroke: art.CLAY, 'stroke-width': 5 }));
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.append(kit.svg('line', { x1: 4 + Math.cos(a) * 24, y1: -14 + Math.sin(a) * 24, x2: 4 + Math.cos(a) * 32, y2: -14 + Math.sin(a) * 32, stroke: art.CLAY, 'stroke-width': 4, 'stroke-linecap': 'round' })); }
      g.append(kit.svg('path', { d: 'M -34 24 L 34 24', stroke: art.DUSTY, 'stroke-width': 5, 'stroke-linecap': 'round' }));
      g.append(kit.svg('path', { d: 'M -34 24 Q -20 8 0 24 Q 20 40 34 24', stroke: art.SPRUCE, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }));
    } else if (it.kind === 'magnet-strawberry') {
      g.append(kit.svg('path', { d: 'M 0 -26 Q 28 -8 20 20 Q 10 34 0 34 Q -10 34 -20 20 Q -28 -8 0 -26 Z', fill: it.color, stroke: art.shade(it.color, -0.25), 'stroke-width': 2 }));
      for (const [sx, sy] of [[-7, -2], [7, -2], [0, 8], [-9, 14], [9, 14]]) g.append(kit.svg('circle', { cx: sx, cy: sy, r: 2.6, fill: art.BUTTER }));
      g.append(kit.svg('path', { d: 'M -10 -24 Q 0 -36 10 -24', stroke: art.SPRUCE, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }));
    } else if (it.kind === 'magnet-lemon') {
      g.append(kit.svg('ellipse', { cx: 0, cy: 0, rx: 24, ry: 19, fill: it.color, stroke: art.shade(it.color, -0.25), 'stroke-width': 2 }));
      g.append(kit.svg('ellipse', { cx: -7, cy: -6, rx: 9, ry: 6, fill: '#fff', opacity: 0.35 }));
    } else {
      g.append(kit.svg('circle', { cx: 0, cy: 0, r: 20, fill: it.color, stroke: art.shade(it.color, -0.25), 'stroke-width': 2 }));
      g.append(kit.svg('circle', { cx: -6, cy: -7, r: 6, fill: '#fff', opacity: 0.3 }));
    }
    door.append(g);
    return g;
  };

  const els = items.map((it) => ({ it, el: drawItem(it), x: it.home.x, y: it.home.y, removed: false }));

  let dragging = null, offset = { x: 0, y: 0 }, started = false;
  const toUnits = (e) => { const p = kit.point(e); return { x: p.x * 1000, y: p.y * 1000 }; };

  for (const rec of els) {
    kit.on(rec.el, 'pointerdown', (e) => {
      if (rec.removed) return;
      if (!started) { started = true; head.hide(); }
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
      kit.status(coveringLeft > 0 ? `${coveringLeft} left on the note` : 'there it is.');
      if (coveringLeft === 0) reveal();
    }
  });

  // a phone appears to type the password in — drawn, with a real screen
  const PX = 500, PY = 920, PW = 300, PH = 230;
  const phone = kit.svg('g', { transform: `translate(${PX} ${PY}) scale(0.4)`, opacity: 0 });
  phone.append(kit.svg('rect', { x: -PW / 2, y: -PH / 2, width: PW, height: PH, rx: 30, fill: '#1B2230', stroke: ink, 'stroke-width': 4 }));
  phone.append(kit.svg('rect', { x: -PW / 2 + 10, y: -PH / 2 + 18, width: PW - 20, height: PH - 50, rx: 14, fill: '#EAF6EF' }));
  phone.append(kit.svg('circle', { cx: 0, cy: -PH / 2 + 10, r: 3, fill: '#0D0D0E', opacity: 0.6 }));
  phone.append(kit.svg('rect', { x: -26, y: PH / 2 - 16, width: 52, height: 5, rx: 2.5, fill: '#fff', opacity: 0.6 }));
  svg.append(phone);

  kit.stage.append(svg);

  const form = kit.el('form', {
    style: { position: 'absolute', left: '32%', width: '36%', top: '79%', display: 'none', flexDirection: 'column', gap: '6px', alignItems: 'center' },
  });
  const input = kit.el('input', { type: 'text', placeholder: 'password', autocomplete: 'off', style: { width: '100%', font: '13px var(--mono)', padding: '7px 8px', border: '1px solid #cfcabd', borderRadius: '8px', textAlign: 'center' } });
  const submit = kit.el('button', { class: 'g-btn solid', type: 'submit', text: 'connect', style: { padding: '8px 18px', fontSize: '13px' } });
  form.append(input, submit);
  kit.stage.append(form);

  function reveal() {
    kit.status('there it is. type it in.');
    phone.style.transition = 'opacity .4s ease, transform .4s cubic-bezier(.2,1.4,.4,1)';
    phone.setAttribute('opacity', 1);
    phone.setAttribute('transform', `translate(${PX} ${PY}) scale(1)`);
    kit.after(300, () => { form.style.display = 'flex'; input.focus(); });
  }

  kit.on(form, 'submit', (e) => {
    e.preventDefault();
    const val = input.value.trim().toLowerCase().replace(/\s+/g, '');
    if (val === PASSWORD) {
      kit.after(10, () => {
        art.winBeat(kit, 'the wifi password is on the fridge.');
        kit.after(1100, () => kit.win('connected.'));
      });
    } else {
      kit.status('nope. look again.');
      input.value = '';
    }
  });

  kit.status('something’s on the fridge. move it.');
}
