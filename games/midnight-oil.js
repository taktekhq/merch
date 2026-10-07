// T11 — leave the light on. candle
// A dark room, a jar candle on a table, gusts from the sides. Cup your hand on the windy
// side (hold pointer/touch there, or hold the matching arrow key) to shield the flame.
// Keep it lit 30 real seconds.
import * as art from './_art.js';

export default function mount(kit) {
  const WIN_SECONDS = 30;
  const head = art.heading(kit, 'leave the light on.', 'hold the windy side', { dark: true });

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const r = art.room(kit, { wall: art.NIGHT, floor: art.shade(art.NIGHT, -0.08), floorY: 780, window: { x: 60, y: 140, w: 190, h: 240, night: true, curtain: art.DUSTY } });
  svg.append(r.el);

  const tbl = art.table(kit, 500, 860, { w: 320, h: 22, legH: 150, color: '#2A3245' });
  svg.append(tbl);

  // a warm pool of light under the jar on the table
  const pool = kit.svg('ellipse', { cx: 500, cy: 714, rx: 160, ry: 30, fill: art.BUTTER, opacity: 0.12 });
  svg.append(pool);

  const jar = kit.svg('g');
  jar.append(
    kit.svg('rect', { x: 420, y: 560, width: 160, height: 160, rx: 16, fill: 'rgba(232,223,207,0.1)', stroke: art.OAT, 'stroke-width': 6 }),
    kit.svg('rect', { x: 408, y: 540, width: 184, height: 24, rx: 9, fill: art.OAT, opacity: 0.9 }),
  );
  svg.append(jar);

  const flameGroup = kit.svg('g', { transform: 'translate(500 538)' });
  const flameOuter = kit.svg('path', { fill: art.CLAY, opacity: 0.9 });
  const flameInner = kit.svg('path', { fill: art.BUTTER });
  const wick = kit.svg('rect', { x: -4, y: 22, width: 8, height: 22, rx: 3, fill: '#1B140E' });
  const glow = kit.svg('circle', { cx: 0, cy: -30, r: 70, fill: art.BUTTER, opacity: 0.1 });
  flameGroup.append(glow, wick, flameOuter, flameInner);
  svg.append(flameGroup);

  const gustMark = kit.svg('g', { opacity: 0 });
  const gustLines = [0, 1, 2].map((i) => kit.svg('path', { stroke: art.DUSTY, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: 0.85 - i * 0.2 }));
  gustMark.append(...gustLines);
  svg.append(gustMark);

  // curtain reacting extra to the gust, on top of its own idle sway
  const gustCurtain = r.window.curtainL;

  kit.stage.append(svg);

  const zoneStyle = { position: 'absolute', top: '0', bottom: '0', width: '50%' };
  const leftZone = kit.el('div', { style: { ...zoneStyle, left: '0' } });
  const rightZone = kit.el('div', { style: { ...zoneStyle, right: '0' } });
  kit.stage.append(leftZone, rightZone);

  let leftHeld = false, rightHeld = false, started = false;
  const touch = () => { if (!started) { started = true; head.hide(); } };
  const setLeft = (v) => { leftHeld = v; if (v) touch(); leftZone.style.background = v ? 'rgba(0,168,98,0.08)' : ''; };
  const setRight = (v) => { rightHeld = v; if (v) touch(); rightZone.style.background = v ? 'rgba(0,168,98,0.08)' : ''; };

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
    glow.setAttribute('opacity', 0.06 + flame * 0.1);
    glow.setAttribute('r', 50 + flame * 30);
  };
  const drawGust = () => {
    gustMark.setAttribute('opacity', gustOn ? 1 : 0);
    const x0 = gustSide === 'left' ? 70 : 930;
    const dir = gustSide === 'left' ? 1 : -1;
    gustLines.forEach((p, i) => {
      const y = 460 + i * 36;
      p.setAttribute('d', `M ${x0} ${y} q ${40 * dir} -16 ${80 * dir} 0 t ${80 * dir} 0`);
    });
    if (gustCurtain) {
      const push = gustOn ? (gustSide === 'left' ? 10 : -4) : 0;
      gustCurtain.style.transition = 'none';
    }
  };
  drawFlame(); drawGust();

  const resetFlame = () => {
    flame = 1; lit = 0; gustOn = false; nextGustIn = 900 + Math.random() * 900;
    kit.status('the wind got it. again.');
  };

  kit.loop((dt) => {
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
    if (lit >= WIN_SECONDS * 1000) {
      kit.status(`${WIN_SECONDS}s / ${WIN_SECONDS}s`);
      art.winBeat(kit, 'leave the light on.');
      kit.after(1100, () => kit.win('still lit. leave it.'));
      return false;
    }
  });

  window.__ltlo = { skip: () => { lit = (WIN_SECONDS - 0.4) * 1000; gustOn = false; nextGustIn = 1e9; } };
}
