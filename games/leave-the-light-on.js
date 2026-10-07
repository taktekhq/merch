// leave the light on. — a dark room, a jar candle, gusts from the sides.
// Cup your hand on the windy side (hold pointer/touch there, or hold the matching
// arrow key) to shield the flame. Keep it lit 30 real seconds.
export default function mount(kit) {
  const NIGHT = '#1B2230', OAT = '#E8DFCF', BUTTER = '#F2D98A', CLAY = '#C9764F', GREEN = kit.colors.accent || '#00A862';
  const WIN_SECONDS = 30;

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: NIGHT }));
  // a faint window/wall seam either side, purely scenery
  svg.append(kit.svg('rect', { x: 40, y: 60, width: 2, height: 880, fill: '#2A3346' }));
  svg.append(kit.svg('rect', { x: 958, y: 60, width: 2, height: 880, fill: '#2A3346' }));

  // jar + table
  svg.append(kit.svg('rect', { x: 260, y: 860, width: 480, height: 20, rx: 6, fill: '#121722' }));
  const jar = kit.svg('g');
  jar.append(
    kit.svg('rect', { x: 400, y: 640, width: 200, height: 230, rx: 18, fill: 'rgba(232,223,207,0.08)', stroke: OAT, 'stroke-width': 6 }),
    kit.svg('rect', { x: 384, y: 616, width: 232, height: 28, rx: 10, fill: OAT, opacity: 0.9 }),
  );
  svg.append(jar);

  const flameGroup = kit.svg('g', { transform: 'translate(500 610)' });
  const flameOuter = kit.svg('path', { fill: CLAY, opacity: 0.9 });
  const flameInner = kit.svg('path', { fill: BUTTER });
  const wick = kit.svg('rect', { x: -4, y: 28, width: 8, height: 26, rx: 3, fill: '#1B140E' });
  flameGroup.append(wick, flameOuter, flameInner);
  svg.append(flameGroup);

  const gustMark = kit.svg('g', { opacity: 0 });
  const gustLines = [0, 1, 2].map((i) => kit.svg('path', { stroke: '#8FA6B8', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: 0.85 - i * 0.2 }));
  gustMark.append(...gustLines);
  svg.append(gustMark);

  const hint = kit.svg('text', { x: 500, y: 940, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 22, fill: '#6B7694' });
  hint.textContent = 'hold the windy side';
  svg.append(hint);

  kit.stage.append(svg);

  // left/right capture zones (also serve as a subtle highlight when held)
  const zoneStyle = { position: 'absolute', top: '0', bottom: '0', width: '50%' };
  const leftZone = kit.el('div', { style: { ...zoneStyle, left: '0' } });
  const rightZone = kit.el('div', { style: { ...zoneStyle, right: '0' } });
  kit.stage.append(leftZone, rightZone);

  let leftHeld = false, rightHeld = false;
  const setLeft = (v) => { leftHeld = v; leftZone.style.background = v ? 'rgba(0,168,98,0.08)' : ''; };
  const setRight = (v) => { rightHeld = v; rightZone.style.background = v ? 'rgba(0,168,98,0.08)' : ''; };

  kit.on(leftZone, 'pointerdown', (e) => { e.preventDefault(); setLeft(true); });
  kit.on(leftZone, 'pointerup', () => setLeft(false));
  kit.on(leftZone, 'pointerleave', () => setLeft(false));
  kit.on(leftZone, 'pointercancel', () => setLeft(false));
  kit.on(rightZone, 'pointerdown', (e) => { e.preventDefault(); setRight(true); });
  kit.on(rightZone, 'pointerup', () => setRight(false));
  kit.on(rightZone, 'pointerleave', () => setRight(false));
  kit.on(rightZone, 'pointercancel', () => setRight(false));

  kit.on(window, 'keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') setLeft(true);
    if (e.key === 'ArrowRight' || e.key === 'd') setRight(true);
  });
  kit.on(window, 'keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') setLeft(false);
    if (e.key === 'ArrowRight' || e.key === 'd') setRight(false);
  });

  let flame = 1, lit = 0, gustSide = null, gustT = 0, gustOn = false, nextGustIn = 1200;
  const drawFlame = () => {
    const h = 34 + 70 * flame, w = 20 + 10 * flame;
    const lean = gustOn ? (gustSide === 'left' ? 18 : -18) * flame : 0;
    flameOuter.setAttribute('d', `M0 0 C ${w} ${-h * 0.35} ${w * 0.5 + lean} ${-h} 0 ${-h - 10} C ${-w * 0.5 + lean} ${-h} ${-w} ${-h * 0.35} 0 0 Z`);
    flameInner.setAttribute('d', `M0 -2 C ${w * 0.55} ${-h * 0.4} ${w * 0.25 + lean * 0.6} ${-h * 0.78} 0 ${-h * 0.86} C ${-w * 0.25 + lean * 0.6} ${-h * 0.78} ${-w * 0.55} ${-h * 0.4} 0 -2 Z`);
    flameGroup.style.opacity = 0.25 + flame * 0.75;
  };
  const drawGust = () => {
    gustMark.setAttribute('opacity', gustOn ? 1 : 0);
    const x0 = gustSide === 'left' ? 60 : 940;
    const dir = gustSide === 'left' ? 1 : -1;
    gustLines.forEach((p, i) => {
      const y = 520 + i * 36;
      p.setAttribute('d', `M ${x0} ${y} q ${40 * dir} -16 ${80 * dir} 0 t ${80 * dir} 0`);
    });
    gustMark.setAttribute('transform', `translate(${0} 0)`);
  };
  drawFlame(); drawGust();

  const resetFlame = () => {
    flame = 1; lit = 0; gustOn = false; nextGustIn = 900 + Math.random() * 900;
    kit.status('the wind got it. again.');
  };

  kit.loop((dt) => {
    // gust scheduling
    gustT += dt;
    if (!gustOn && gustT >= nextGustIn) {
      gustOn = true; gustT = 0; gustSide = Math.random() < 0.5 ? 'left' : 'right';
      nextGustIn = kit.reducedMotion ? 2600 : 1600 + Math.random() * 1400;
    } else if (gustOn && gustT >= (kit.reducedMotion ? 1400 : 1800)) {
      gustOn = false; gustT = 0;
    }
    drawGust();

    const shielded = gustOn && ((gustSide === 'left' && leftHeld) || (gustSide === 'right' && rightHeld));
    if (gustOn && !shielded) flame = Math.max(0, flame - dt / 900);
    else flame = Math.min(1, flame + dt / 500);
    drawFlame();

    if (flame <= 0) { resetFlame(); return; }
    lit += dt;
    kit.status(`${Math.min(WIN_SECONDS, Math.floor(lit / 1000))}s / ${WIN_SECONDS}s`);
    if (lit >= WIN_SECONDS * 1000) { kit.status(`${WIN_SECONDS}s / ${WIN_SECONDS}s`); kit.win('still lit. leave it.'); return false; }
  });
}
