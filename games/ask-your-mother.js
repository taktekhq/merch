// T09 — ask your mother crewneck
// Ask dad: "ask your mother." Ask mum: "ask your father." Forever. The only way out: ask
// both at once (two fingers, or both keys together).
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, muted = art.MUTED;
  const HOLD_MS = 150;
  const head = art.heading(kit, 'ask your mother.', 'ask one, then the other — or both, together');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const r = art.room(kit, { wall: '#E7E2D6', floor: art.OAT, floorY: 780 });
  svg.append(r.el);
  for (let i = 0; i < 3; i++) svg.append(kit.svg('rect', { x: 0, y: i * 80, width: 1000, height: 78, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.25 }));

  // dad's armchair, reading the paper
  const chairX = 240;
  const chair = kit.svg('g', { transform: `translate(${chairX} 760)` });
  art.shadow(chair, 0, 10, 300);
  chair.append(kit.svg('rect', { x: -140, y: -210, width: 280, height: 220, rx: 30, fill: art.SPRUCE }));
  chair.append(kit.svg('rect', { x: -150, y: -70, width: 60, height: 90, rx: 20, fill: art.shade(art.SPRUCE, -0.1) }));
  chair.append(kit.svg('rect', { x: 90, y: -70, width: 60, height: 90, rx: 20, fill: art.shade(art.SPRUCE, -0.1) }));
  chair.append(kit.svg('rect', { x: -120, y: -30, width: 240, height: 34, rx: 14, fill: art.shade(art.SPRUCE, 0.1) }));
  svg.append(chair);
  const dad = art.person(kit, { x: chairX, standOn: 710, scale: 0.72, facing: 1, shirt: '#8C6A4A', skin: art.SKINS[2], hair: 'short', hairColor: art.HAIRS.grey, pose: 'stand', legs: false, mood: 'calm' });
  svg.append(dad.el);
  // newspaper held up in front of dad
  const paper = kit.svg('g', { transform: `translate(${chairX + 70} 600)` });
  paper.append(kit.svg('path', { d: 'M -70 -70 L 70 -82 L 76 40 L -76 50 Z', fill: art.PAPER, stroke: art.shade(art.PAPER, -0.2), 'stroke-width': 3 }));
  for (let i = 0; i < 4; i++) paper.append(kit.svg('line', { x1: -50, y1: -40 + i * 20, x2: 50, y2: -46 + i * 20, stroke: muted, 'stroke-width': 2.4, opacity: 0.5 }));
  svg.append(paper);

  // mum at a laptop at the table
  const tableX = 760;
  const tbl = art.table(kit, tableX, 780, { w: 260, h: 20, legH: 110, color: '#C9A36A' });
  svg.append(tbl);
  const laptop = kit.svg('g', { transform: `translate(${tableX} 650)` });
  laptop.append(kit.svg('path', { d: 'M -70 0 L 70 0 L 60 -14 L -60 -14 Z', fill: art.shade('#B9B2A2', -0.1) }));
  laptop.append(kit.svg('rect', { x: -58, y: -96, width: 116, height: 82, rx: 6, fill: '#3A3F46' }));
  laptop.append(kit.svg('rect', { x: -50, y: -88, width: 100, height: 66, rx: 3, fill: art.DUSTY, opacity: 0.6 }));
  svg.append(laptop);
  const mum = art.person(kit, { x: tableX, standOn: 780, scale: 0.72, facing: -1, shirt: art.CLAY, skin: art.SKINS[0], hair: 'bun', pose: 'stand', legs: true, mood: 'calm' });
  svg.append(mum.el);

  // speech bubbles that bounce up from whichever parent was asked
  function bubble(x, y) {
    const g = kit.svg('g', { opacity: 0, transform: `translate(${x} ${y})` });
    g.append(kit.svg('rect', { x: -110, y: -54, width: 220, height: 58, rx: 14, fill: '#fff', stroke: ink, 'stroke-width': 3 }));
    g.append(kit.svg('path', { d: 'M -12 4 L 12 4 L 0 24 Z', fill: '#fff', stroke: ink, 'stroke-width': 3 }));
    const t = kit.svg('text', { x: 0, y: -20, 'text-anchor': 'middle', 'font-size': 19, fill: ink, 'font-family': 'var(--display)', 'font-weight': 600 });
    g.append(t);
    svg.append(g);
    return { g, t };
  }
  const bubbleDad = bubble(chairX, 440);
  const bubbleMum = bubble(tableX, 440);
  const fineBubble = kit.svg('g', { opacity: 0 });
  fineBubble.append(kit.svg('rect', { x: 400, y: 380, width: 200, height: 70, rx: 16, fill: '#fff', stroke: ink, 'stroke-width': 3 }));
  fineBubble.append(kit.svg('text', { x: 500, y: 422, 'text-anchor': 'middle', 'font-size': 24, fill: ink, 'font-family': 'var(--display)', 'font-weight': 600 }, 'fine.'));
  svg.append(fineBubble);

  const nudge = kit.svg('text', { x: 500, y: 960, 'text-anchor': 'middle', 'font-size': 16, fill: muted, 'font-family': 'var(--mono)' });
  svg.append(nudge);

  const askDad = kit.el('button', { class: 'g-btn solid', text: 'ask dad', style: { position: 'absolute', left: '22%', bottom: '6%', transform: 'translateX(-50%)' } });
  const askMum = kit.el('button', { class: 'g-btn solid', text: 'ask mum', style: { position: 'absolute', left: '78%', bottom: '6%', transform: 'translateX(-50%)' } });
  kit.stage.append(askDad, askMum);

  let dadDown = false, mumDown = false, dadSince = 0, mumSince = 0, asks = 0, started = false, settled = false;

  function showBubble(b, text) { b.t.textContent = text; b.g.setAttribute('opacity', 1); }
  function hideBubble(b) { b.g.setAttribute('opacity', 0); }

  const press = (which) => (e) => {
    e?.preventDefault?.();
    if (!started) { started = true; head.hide(); }
    if (settled) return;
    if (which === 'dad') {
      dadDown = true; dadSince = performance.now();
      if (!mumDown) { showBubble(bubbleDad, 'ask your mother.'); asks++; }
    } else {
      mumDown = true; mumSince = performance.now();
      if (!dadDown) { showBubble(bubbleMum, 'ask your father.'); asks++; }
    }
    if (asks > 2) nudge.textContent = 'try asking them both. at once.';
  };
  const release = (which) => () => {
    if (settled) return;
    if (which === 'dad') { dadDown = false; hideBubble(bubbleDad); }
    else { mumDown = false; hideBubble(bubbleMum); }
  };

  kit.on(askDad, 'pointerdown', press('dad'));
  kit.on(askMum, 'pointerdown', press('mum'));
  kit.on(askDad, 'pointerup', release('dad'));
  kit.on(askMum, 'pointerup', release('mum'));
  kit.on(askDad, 'pointerleave', release('dad'));
  kit.on(askMum, 'pointerleave', release('mum'));

  const keyDown = new Set();
  kit.on(window, 'keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'd') { if (!keyDown.has('d')) press('dad')(e); keyDown.add('d'); }
    if (k === 'm') { if (!keyDown.has('m')) press('mum')(e); keyDown.add('m'); }
  });
  kit.on(window, 'keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'd') { keyDown.delete('d'); release('dad')(); }
    if (k === 'm') { keyDown.delete('m'); release('mum')(); }
  });

  nudge.textContent = 'ask one. then the other. forever.';

  kit.loop(() => {
    if (kit.won || settled) return;
    if (dadDown && mumDown && performance.now() - Math.max(dadSince, mumSince) >= HOLD_MS) {
      settled = true;
      hideBubble(bubbleDad); hideBubble(bubbleMum);
      // both parents turn to look at each other
      dad.head.setAttribute('transform', 'translate(0 -92) scale(-1 1)');
      mum.head.setAttribute('transform', 'translate(0 -92) scale(-1 1)');
      fineBubble.setAttribute('opacity', 1);
      nudge.textContent = '';
      kit.after(900, () => {
        art.winBeat(kit, 'ask your mother.');
        kit.after(1100, () => kit.win('asked both. at once. done.'));
      });
    }
  });

  window.__aym = {
    both: () => {
      press('dad')(); press('mum')();
    },
  };
}
