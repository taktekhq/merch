// T04 — fix it this weekend apron
// Monday–Friday the page shows a dripping tap and a drip counter. Saturday and Sunday
// (your clock), it opens.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, accent = art.ACCENT, muted = art.MUTED;
  const head = art.heading(kit, "i'll fix it this weekend.", 'checks your clock — come back on a weekend');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const scene = kit.svg('g');
  svg.append(scene);

  let drips = 0, weekend = false;
  const fixBtn = kit.el('button', { class: 'g-btn solid', text: 'fix it', style: { position: 'absolute', left: '50%', bottom: '7%', transform: 'translateX(-50%)', display: 'none' } });
  kit.stage.append(fixBtn);
  kit.on(fixBtn, 'click', () => {
    art.winBeat(kit, "i'll fix it this weekend.");
    kit.after(1100, () => kit.win('fixed. this weekend, after all.'));
  });

  const WALL = '#EFE7DA', COUNTER = '#D8D2C4';

  function kitchenBase(weekendMode) {
    const g = [];
    const r = art.room(kit, { wall: WALL, floor: COUNTER, floorY: 780 });
    g.push(r.el);
    for (let row = 0; row < 7; row++) for (let c = 0; c < 14; c++) g.push(mk('rect', { x: c * 72, y: row * 72, width: 68, height: 68, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.3 }));
    // counter + sink basin
    g.push(mk('rect', { x: 230, y: 660, width: 420, height: 160, fill: COUNTER }));
    g.push(mk('rect', { x: 230, y: 660, width: 420, height: 14, fill: art.shade(COUNTER, -0.16) }));
    g.push(mk('rect', { x: 310, y: 674, width: 260, height: 70, rx: 18, fill: art.shade(COUNTER, -0.42) }));
    g.push(mk('rect', { x: 322, y: 682, width: 236, height: 52, rx: 14, fill: art.shade(COUNTER, -0.55) }));
    g.push(mk('ellipse', { cx: 440, cy: 706, rx: 14, ry: 7, fill: art.shade(COUNTER, -0.7) }));
    // tap
    g.push(mk('rect', { x: 428, y: 560, width: 24, height: 110, rx: 10, fill: weekendMode ? accent : art.DUSTY }));
    g.push(mk('path', { d: 'M 440 560 L 440 512 Q 440 498 456 498 L 482 498 Q 500 498 500 516 L 500 548', stroke: weekendMode ? accent : art.DUSTY, 'stroke-width': 20, fill: 'none', 'stroke-linecap': 'round' }));
    return { g, r };
  }

  // a wall calendar: 7 day cells with the live weekday marked
  function calendar(now, weekendMode) {
    const g = [];
    const cx = 790, cy = 300, w = 190, h = 150;
    g.push(mk('rect', { x: cx - w / 2 - 6, y: cy - h / 2 - 6, width: w + 12, height: h + 12, rx: 10, fill: '#fff', opacity: 0.0 }));
    g.push(mk('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 10, fill: '#fff' }));
    g.push(mk('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: 32, rx: 10, fill: weekendMode ? accent : art.CLAY }));
    g.push(mk('rect', { x: cx - w / 2, y: cy - h / 2 + 16, width: w, height: 16, fill: weekendMode ? accent : art.CLAY }));
    g.push(mk('circle', { cx: cx - w / 2 + 24, cy: cy - h / 2, r: 6, fill: muted }));
    g.push(mk('circle', { cx: cx + w / 2 - 24, cy: cy - h / 2, r: 6, fill: muted }));
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const todayIdx = (now.getDay() + 6) % 7; // Monday = 0
    for (let i = 0; i < 7; i++) {
      const dx = cx - w / 2 + 16 + i * ((w - 32) / 6);
      const isToday = i === todayIdx;
      const isWeekendCol = i >= 5;
      if (isToday) g.push(mk('circle', { cx: dx, cy: cy + 18, r: 17, fill: weekendMode ? accent : art.CLAY }));
      const letter = mk('text', { x: dx, y: cy - 10, 'text-anchor': 'middle', 'font-size': 13, fill: isWeekendCol ? art.shade(muted, -0.1) : muted, 'font-family': 'var(--mono)', text: days[i] });
      const num = mk('text', { x: dx, y: cy + 23, 'text-anchor': 'middle', 'font-size': 15, fill: isToday ? '#fff' : ink, 'font-family': 'var(--mono)', 'font-weight': isToday ? 700 : 400, text: String(10 + i) });
      g.push(letter, num);
    }
    return g;
  }

  function drawWeekday(now) {
    const { g } = kitchenBase(false);
    g.push(...calendar(now, false));
    // forming + falling drip
    const drop = mk('ellipse', { cx: 500, cy: 556, rx: 7, ry: 9, fill: art.DUSTY });
    g.push(drop);
    const ripple = mk('circle', { cx: 500, cy: 706, r: 4, fill: 'none', stroke: art.DUSTY, 'stroke-width': 3, opacity: 0 });
    g.push(ripple);
    kit.cleanup(kit.every(1300 + Math.random() * 500, () => {
      if (weekend) return;
      animateDrip(drop, ripple);
      drips++;
      kit.status(`${drips} drip${drips === 1 ? '' : 's'} so far. it can wait.`);
    }));
    return g;
  }

  function animateDrip(drop, ripple) {
    let t0 = performance.now();
    const fall = () => {
      const p = Math.min(1, (performance.now() - t0) / 650);
      drop.setAttribute('cy', 556 + p * p * 150);
      drop.setAttribute('opacity', p > 0.92 ? 0 : 1);
      if (p < 1) requestAnimationFrame(fall);
      else {
        ripple.setAttribute('opacity', 0.6);
        ripple.setAttribute('r', 4);
        let r0 = performance.now();
        const grow = () => {
          const q = Math.min(1, (performance.now() - r0) / 400);
          ripple.setAttribute('r', 4 + q * 20);
          ripple.setAttribute('opacity', 0.6 * (1 - q));
          if (q < 1) requestAnimationFrame(grow);
        };
        grow();
        drop.setAttribute('cy', 556);
        drop.setAttribute('opacity', 1);
      }
    };
    fall();
  }

  function drawWeekend(now) {
    const { g } = kitchenBase(true);
    g.push(...calendar(now, true));
    // an open toolbox on the counter
    const tb = mk('g', { transform: 'translate(660 700)' });
    art.shadow(tb, 0, 56, 150);
    tb.append(mk('path', { d: 'M -80 0 L 80 0 L 70 -30 L -70 -30 Z', fill: art.CLAY }));
    tb.append(mk('rect', { x: -80, y: 0, width: 160, height: 48, rx: 8, fill: art.CLAY }));
    tb.append(mk('rect', { x: -80, y: 0, width: 160, height: 10, fill: art.shade(art.CLAY, -0.18) }));
    tb.append(mk('path', { d: 'M -70 -30 L -56 -72 L 56 -72 L 70 -30 Z', fill: art.shade(art.CLAY, 0.1), opacity: 0.9 }));
    tb.append(mk('path', { d: 'M -30 -70 Q 0 -96 30 -70', stroke: art.shade(art.CLAY, -0.3), 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }));
    tb.append(mk('rect', { x: -14, y: -58, width: 10, height: 50, rx: 4, fill: art.MUTED, transform: 'rotate(-18 -9 -33)' }));
    tb.append(mk('circle', { cx: -9 - 46 * Math.sin(0.31), cy: -33 - 46 * Math.cos(0.31), r: 10, fill: 'none', stroke: art.MUTED, 'stroke-width': 5 }));
    tb.append(mk('rect', { x: 6, y: -62, width: 8, height: 54, rx: 3, fill: art.shade(art.BUTTER, -0.1), transform: 'rotate(14 10 -35)' }));
    g.push(tb);
    return g;
  }

  function draw() {
    const now = kit.now();
    const day = now.getDay();
    weekend = day === 0 || day === 6;
    scene.replaceChildren(...(weekend ? drawWeekend(now) : drawWeekday(now)));
    if (weekend) {
      head.hide();
      fixBtn.style.display = 'block';
      kit.status('open.');
    } else {
      fixBtn.style.display = 'none';
      kit.status(drips ? `${drips} drips so far.` : 'a tap, dripping.');
    }
  }

  draw();
  kit.every(15000, draw);
  window.__fitw = { draw }; // testing hook, harmless (see earned/README.md)
  function mk(tag, attrs) { return kit.svg(tag, attrs); }
}
