// T17 — who touched the thermostat. sweater
// Someone keeps nudging it down. A hand sneaks in from the side; hold 22° for 20 seconds
// while the person in the jumper shivers whenever it drops.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, accent = art.ACCENT;
  const TARGET = 22, TOL = 0.5, MIN = 10, MAX = 30, HOLD_MS = 20000;
  const head = art.heading(kit, 'who touched the thermostat.', 'hold it at 22°');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const r = art.room(kit, { wall: '#EFECE6', floor: art.OAT, floorY: 820 });
  svg.append(r.el);

  const personX = 190, personScale = 0.8, personStandOn = 820;
  const personY = personStandOn - 276 * personScale;
  const pers = art.person(kit, { x: personX, standOn: personStandOn, scale: personScale, facing: 1, shirt: art.SPRUCE, skin: art.SKINS[2], hair: 'short', pose: 'stand', legs: true });
  svg.append(pers.el);

  const dialC = { x: 640, y: 420, r: 230 };
  svg.append(kit.svg('ellipse', { cx: dialC.x + 12, cy: dialC.y + 18, rx: dialC.r + 14, ry: dialC.r + 6, fill: ink, opacity: 0.08 }));
  const angleFor = (t) => { const f = (t - MIN) / (MAX - MIN); return -220 + f * 260; };
  const toXY = (deg, rr) => { const a = (deg - 90) * Math.PI / 180; return { x: dialC.x + Math.cos(a) * rr, y: dialC.y + Math.sin(a) * rr }; };
  const arcPath = (a0, a1, rr) => { const p0 = toXY(a0, rr), p1 = toXY(a1, rr); const large = Math.abs(a1 - a0) > 180 ? 1 : 0; return `M ${p0.x} ${p0.y} A ${rr} ${rr} 0 ${large} 1 ${p1.x} ${p1.y}`; };

  svg.append(kit.svg('circle', { cx: dialC.x, cy: dialC.y, r: dialC.r, fill: art.shade('#FFFFFF', -0.1) }));
  svg.append(kit.svg('circle', { cx: dialC.x, cy: dialC.y, r: dialC.r - 14, fill: '#FFFFFF' }));
  svg.append(kit.svg('path', { d: arcPath(angleFor(MIN), angleFor(MAX), dialC.r - 46), fill: 'none', stroke: art.DUSTY, 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0.35 }));
  svg.append(kit.svg('path', { d: arcPath(angleFor(TARGET - TOL), angleFor(TARGET + TOL), dialC.r - 46), fill: 'none', stroke: accent, 'stroke-width': 16, 'stroke-linecap': 'round' }));

  const needle = kit.svg('g');
  needle.append(kit.svg('line', { x1: dialC.x, y1: dialC.y, x2: dialC.x, y2: dialC.y - (dialC.r - 40), stroke: ink, 'stroke-width': 7, 'stroke-linecap': 'round' }));
  svg.append(needle);
  svg.append(kit.svg('circle', { cx: dialC.x, cy: dialC.y, r: 12, fill: ink }));

  const reading = kit.svg('text', { x: dialC.x, y: dialC.y + 128, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-size': 44, 'font-weight': 700, fill: ink });
  svg.append(reading);

  // a sneaky forearm that slides in from the edge to nudge the dial
  const armStartX = dialC.x + dialC.r + 190, armTargetX = dialC.x + dialC.r - 24;
  const armG = kit.svg('g', { transform: `translate(${armStartX} ${dialC.y - 6})`, opacity: 0 });
  armG.append(kit.svg('rect', { x: -4, y: -28, width: 200, height: 56, rx: 28, fill: art.DUSTY }));
  armG.append(kit.svg('rect', { x: -4, y: -28, width: 60, height: 56, rx: 28, fill: art.shade(art.DUSTY, -0.12) }));
  armG.append(kit.svg('circle', { cx: -16, cy: 0, r: 32, fill: art.SKINS[0] }));
  svg.append(armG);

  kit.stage.append(svg);

  const controls = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', bottom: '6%', display: 'flex', justifyContent: 'center', gap: '18px' } });
  const minus = kit.el('button', { class: 'g-btn', text: '–' });
  const plus = kit.el('button', { class: 'g-btn solid', text: '+' });
  controls.append(minus, plus);
  kit.stage.append(controls);

  let temp = 19, held = 0, started = false, shivering = false;

  const render = () => {
    needle.setAttribute('transform', `rotate(${angleFor(temp)} ${dialC.x} ${dialC.y})`);
    reading.textContent = `${temp.toFixed(1)}°`;
  };
  const touch = () => { if (!started) { started = true; head.hide(); } };
  const nudge = (d) => { touch(); temp = Math.max(MIN, Math.min(MAX, +(temp + d).toFixed(1))); render(); };

  minus.onclick = () => nudge(-0.5);
  plus.onclick = () => nudge(0.5);
  kit.on(window, 'keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === '+') { touch(); e.preventDefault(); nudge(0.5); }
    if (e.key === 'ArrowDown' || e.key === '-') { touch(); e.preventDefault(); nudge(-0.5); }
  });

  function sabotage() {
    const drop = 1 + Math.random() * 1.5;
    armG.setAttribute('opacity', 1);
    let t0 = performance.now();
    const slideIn = () => {
      const p = Math.min(1, (performance.now() - t0) / 420);
      armG.setAttribute('transform', `translate(${armStartX + (armTargetX - armStartX) * easeOut(p)} ${dialC.y - 6})`);
      if (p < 1) requestAnimationFrame(slideIn);
      else { temp = Math.max(MIN, +(temp - drop).toFixed(1)); render(); kit.after(240, slideOut); }
    };
    slideIn();
    function slideOut() {
      const t1 = performance.now();
      const step = () => {
        const p = Math.min(1, (performance.now() - t1) / 420);
        armG.setAttribute('transform', `translate(${armTargetX + (armStartX - armTargetX) * easeOut(p)} ${dialC.y - 6})`);
        if (p < 1) requestAnimationFrame(step); else armG.setAttribute('opacity', 0);
      };
      step();
    }
    kit.after(kit.reducedMotion ? 6000 : 3400 + Math.random() * 2600, sabotage);
  }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  kit.after(2600, sabotage);

  render();
  kit.status('0.0s / 20s');

  kit.loop((dt) => {
    const inRange = Math.abs(temp - TARGET) <= TOL;
    held = inRange ? held + dt : Math.max(0, held - dt * 1.5);
    kit.status(`${Math.min(20, held / 1000).toFixed(1)}s / 20s`);

    const cold = temp < TARGET - 2.5;
    if (cold && !kit.reducedMotion) {
      shivering = true;
      const j = (Math.random() - 0.5) * 3;
      pers.el.setAttribute('transform', `translate(${personX} ${personY}) rotate(${j})`);
    } else if (shivering) {
      shivering = false;
      pers.el.setAttribute('transform', `translate(${personX} ${personY})`);
    }

    if (held >= HOLD_MS) {
      kit.status('22. held.');
      kit.after(10, () => { art.winBeat(kit, 'who touched the thermostat.'); kit.after(1100, () => kit.win('22. finally. it’s yours.')); });
      return false;
    }
  });
}
