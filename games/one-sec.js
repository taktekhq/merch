// T14 — one sec. wall clock
// The actual product: a white-faced 10" wall clock, ticks, "one sec." at the six.
// Start the sweep, stop it at exactly 1.000s (+/- 0.03) and the clock is yours.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, accent = art.ACCENT, muted = art.MUTED;
  const TARGET = 1000, TOL = 30;
  const head = art.heading(kit, 'one sec.', 'start it, stop it on the tick');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const r = art.room(kit, { wall: '#F2F0EB', floor: art.OAT, floorY: 880 });
  svg.append(r.el);

  const CX = 500, CY = 480, R = 270;
  // hung slightly off the wall: a soft contact shadow, a wire, a nail
  svg.append(kit.svg('ellipse', { cx: CX + 16, cy: CY + 24, rx: R + 6, ry: R + 2, fill: ink, opacity: 0.08 }));
  svg.append(kit.svg('path', { d: `M ${CX - 60} ${CY - R + 30} Q ${CX} ${CY - R - 30} ${CX + 60} ${CY - R + 30}`, stroke: muted, 'stroke-width': 3, fill: 'none', opacity: 0.5 }));
  svg.append(kit.svg('circle', { cx: CX, cy: CY - R - 26, r: 5, fill: muted, opacity: 0.6 }));

  // bezel + face, with a quiet top-left highlight
  svg.append(kit.svg('circle', { cx: CX, cy: CY, r: R, fill: art.shade(ink, 0.12) }));
  svg.append(kit.svg('circle', { cx: CX, cy: CY, r: R - 16, fill: '#FFFFFF' }));
  svg.append(kit.svg('path', { d: `M ${CX - R * 0.55} ${CY - R * 0.6} A ${R * 0.92} ${R * 0.92} 0 0 1 ${CX + R * 0.2} ${CY - R * 0.86}`, stroke: '#fff', 'stroke-width': R * 0.22, fill: 'none', opacity: 0.2, 'stroke-linecap': 'round' }));

  const ticks = kit.svg('g', { stroke: ink, 'stroke-linecap': 'round' });
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const major = i % 5 === 0;
    const r1 = major ? R - 54 : R - 36, r2 = R - 24;
    ticks.append(kit.svg('line', { x1: CX + Math.cos(a) * r1, y1: CY + Math.sin(a) * r1, x2: CX + Math.cos(a) * r2, y2: CY + Math.sin(a) * r2, opacity: major ? 0.85 : 0.3, 'stroke-width': major ? 6 : 3 }));
  }
  svg.append(ticks);

  // the target tick at 12, green, breathing quietly
  svg.append(kit.svg('line', { x1: CX, y1: CY - R + 16, x2: CX, y2: CY - R + 46, stroke: accent, 'stroke-width': 9, 'stroke-linecap': 'round' }));
  const targetPulse = kit.svg('circle', { cx: CX, cy: CY - R + 6, r: 7, fill: accent });
  svg.append(targetPulse);

  // the product's own line, printed at the six
  svg.append(kit.svg('text', { x: CX, y: CY + R * 0.58, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-weight': 500, 'font-size': 24, fill: ink, opacity: 0.78 }, ['one sec.']));

  const hourHand = kit.svg('line', { x1: CX, y1: CY, x2: CX, y2: CY - R * 0.5, stroke: ink, 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0.85 });
  const hand = kit.svg('line', { x1: CX, y1: CY, x2: CX, y2: CY - R + 30, stroke: ink, 'stroke-width': 7, 'stroke-linecap': 'round' });
  svg.append(hourHand, hand);
  svg.append(kit.svg('circle', { cx: CX, cy: CY, r: 13, fill: ink }));
  svg.append(kit.svg('circle', { cx: CX, cy: CY, r: 4, fill: accent }));

  const readout = kit.svg('text', { x: 500, y: 840, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 52, 'font-weight': 600, fill: muted });
  readout.textContent = '0.000';
  svg.append(readout);

  kit.stage.append(svg);

  const button = kit.el('button', { class: 'g-btn solid', text: 'start', style: { position: 'absolute', left: '50%', bottom: '6%', transform: 'translateX(-50%)' } });
  kit.stage.append(button);

  let t0 = null, stopLoop = null, started = false;

  // idle life before the player starts: the target tick breathes
  kit.loop(() => {
    if (t0 != null) return;
    const p = (performance.now() % 2000) / 2000;
    targetPulse.setAttribute('opacity', 0.5 + Math.sin(p * Math.PI * 2) * 0.35);
  });

  const setHand = (ms) => {
    const a = ((ms % TARGET) / TARGET) * Math.PI * 2 - Math.PI / 2;
    hand.setAttribute('x2', CX + Math.cos(a) * (R - 30));
    hand.setAttribute('y2', CY + Math.sin(a) * (R - 30));
  };

  const toggle = () => {
    if (!started) { started = true; head.hide(); }
    if (t0 == null) {
      t0 = performance.now();
      button.textContent = 'stop';
      readout.setAttribute('fill', muted);
      kit.status('go.');
      stopLoop = kit.loop(() => {
        const elapsed = performance.now() - t0;
        setHand(elapsed);
        readout.textContent = (elapsed / 1000).toFixed(3);
      });
      return;
    }
    if (stopLoop) stopLoop();
    const got = performance.now() - t0;
    t0 = null;
    setHand(got);
    readout.textContent = (got / 1000).toFixed(3);
    if (Math.abs(got - TARGET) <= TOL) {
      button.disabled = true;
      readout.setAttribute('fill', accent);
      kit.status('to the tick.');
      kit.after(500, () => {
        art.winBeat(kit, 'one sec.');
        kit.after(1100, () => kit.win('one second. to the tick. it’s yours.'));
      });
    } else {
      button.textContent = 'again';
      kit.status(got < TARGET ? 'too early.' : 'too late.');
    }
  };

  kit.on(button, 'click', toggle);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
