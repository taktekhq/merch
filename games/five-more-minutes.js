// T03 — five more minutes blanket
// An alarm rings. The only button is snooze. Then touch nothing for five real minutes;
// any move and the alarm rings again.
//
// STILL_SECONDS is the one line to change for a local timing test (see check.mjs steps);
// always revert it to 300 before shipping.
const STILL_SECONDS = 300;
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, accent = art.ACCENT, muted = art.MUTED;
  const DAWN = '#F2D98A';
  const total = STILL_SECONDS * 1000;
  const head = art.heading(kit, 'five more minutes.', 'snooze it, then stay still', { dark: true });

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const r = art.room(kit, { wall: art.NIGHT, floor: art.shade(art.NIGHT, -0.1), floorY: 760, window: { x: 700, y: 170, w: 210, h: 260, night: true, curtain: art.DUSTY } });
  svg.append(r.el);
  // a soft dawn wash that grows across the room as time passes
  const dawnWash = kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: DAWN, opacity: 0 });
  svg.append(dawnWash);

  // the bed: duvet, a sleeping shape, pillow, a bit of hair
  const bed = kit.svg('g');
  art.shadow(bed, 330, 790, 560);
  bed.append(kit.svg('rect', { x: 60, y: 560, width: 540, height: 230, rx: 40, fill: '#2A3245' }));
  bed.append(kit.svg('ellipse', { cx: 150, cy: 600, rx: 90, ry: 46, fill: '#3B445C' }));
  bed.append(kit.svg('path', { d: 'M 60 640 Q 330 560 600 640 L 600 760 Q 330 820 60 760 Z', fill: '#374260' }));
  for (let i = 0; i < 5; i++) bed.append(kit.svg('path', { d: `M ${140 + i * 90} 650 q 20 30 0 60`, stroke: art.shade('#374260', -0.1), 'stroke-width': 3, fill: 'none', opacity: 0.4 }));
  // sleeper: a head with hair poking out from under the duvet, eyes shut
  bed.append(kit.svg('circle', { cx: 190, cy: 605, r: 44, fill: art.SKINS[1] }));
  bed.append(kit.svg('path', { d: 'M 150 605 A 44 44 0 0 1 234 600 Q 230 568 190 562 Q 150 568 150 605 Z', fill: art.HAIRS.brown }));
  bed.append(kit.svg('path', { d: 'M 172 612 q 8 6 16 0', stroke: art.INK, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }));
  bed.append(kit.svg('path', { d: 'M 204 612 q 8 6 16 0', stroke: art.INK, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }));
  svg.append(bed);

  // bedside table with the alarm clock
  const tableX = 740, tableTop = 640;
  svg.append(kit.svg('rect', { x: tableX - 90, y: tableTop, width: 180, height: 140, rx: 10, fill: '#2A3245' }));
  svg.append(kit.svg('rect', { x: tableX - 90, y: tableTop, width: 180, height: 14, rx: 7, fill: art.shade('#2A3245', 0.12) }));

  const clock = kit.svg('g', { transform: `translate(${tableX} ${tableTop - 76})` });
  clock.append(kit.svg('rect', { x: -10, y: 56, width: 20, height: 16, rx: 4, fill: muted }));
  clock.append(kit.svg('circle', { cx: -46, cy: -40, r: 16, fill: muted }));
  clock.append(kit.svg('circle', { cx: 46, cy: -40, r: 16, fill: muted }));
  clock.append(kit.svg('circle', { cx: -38, cy: -34, r: 7, fill: '#fff' }));
  clock.append(kit.svg('circle', { cx: 38, cy: -34, r: 7, fill: '#fff' }));
  const face = kit.svg('circle', { cx: 0, cy: 0, r: 60, fill: '#fff' });
  clock.append(face);
  clock.append(kit.svg('circle', { cx: 0, cy: 0, r: 60, fill: 'none', stroke: muted, 'stroke-width': 5 }));
  const hourHand = kit.svg('line', { x1: 0, y1: 0, x2: 0, y2: -28, stroke: ink, 'stroke-width': 5, 'stroke-linecap': 'round' });
  const minHand = kit.svg('line', { x1: 0, y1: 0, x2: 22, y2: -34, stroke: ink, 'stroke-width': 4, 'stroke-linecap': 'round' });
  clock.append(hourHand, minHand, kit.svg('circle', { cx: 0, cy: 0, r: 5, fill: ink }));
  svg.append(clock);

  const label = kit.svg('text', { x: 500, y: 300, 'text-anchor': 'middle', 'font-size': 26, fill: '#fff', 'font-family': 'var(--display)', 'font-weight': 600 });
  svg.append(label);

  const btn = kit.el('button', { class: 'g-btn solid', text: 'snooze', style: { position: 'absolute', left: '50%', bottom: '7%', transform: 'translateX(-50%)' } });
  kit.stage.append(btn);

  let quiet = false, since = 0, started = false;

  function ringing() {
    quiet = false;
    label.textContent = 'five more minutes.';
    dawnWash.setAttribute('opacity', 0);
    r.window.sky.setAttribute('fill', art.NIGHT);
    btn.hidden = false;
    kit.status('');
  }
  ringing();

  kit.loop(() => {
    const t = performance.now() / 160;
    const wob = quiet ? 0 : Math.sin(t) * 7;
    clock.setAttribute('transform', `translate(${tableX} ${tableTop - 76}) rotate(${wob})`);
  });

  kit.on(btn, 'click', () => {
    if (!started) { started = true; head.hide(); }
    quiet = true;
    since = performance.now();
    btn.hidden = true;
    label.textContent = 'stay still.';
  });

  kit.onActivity(() => {
    if (!started) { started = true; head.hide(); }
    if (!quiet || kit.won) return;
    quiet = false;
    label.textContent = 'moved. it rings again.';
    kit.after(500, ringing);
  });

  kit.loop(() => {
    if (!quiet || kit.won) return;
    const elapsed = performance.now() - since;
    const p = Math.min(1, elapsed / total);
    dawnWash.setAttribute('opacity', p * 0.22);
    r.window.sky.setAttribute('fill', art.shade(art.NIGHT, Math.min(0.55, p * 0.55)));
    const left = Math.max(0, total - elapsed);
    const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
    kit.status(`${m}:${String(s).padStart(2, '0')} left`);
    const rad = p * Math.PI * 2;
    minHand.setAttribute('x2', 32 * Math.sin(rad));
    minHand.setAttribute('y2', -32 * Math.cos(rad));
    if (p >= 1) {
      label.textContent = 'still dark out.';
      kit.after(300, () => {
        art.winBeat(kit, 'five more minutes.');
        kit.after(1100, () => kit.win('five minutes. nobody moved.'));
      });
      return false;
    }
  });
}
