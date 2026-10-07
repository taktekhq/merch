// T04 — it needs salt. apron
// A warm kitchen: soup on a low flame, steam rising. Tap the shaker to add a pinch (a hidden
// random amount), then taste. The verdict climbs "still flat." -> "better." -> "almost." ->
// "perfect." — overshoot and it's "too salty.", the pot gets dumped and refilled. Stop at
// perfect.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, muted = art.MUTED;
  const WALL = '#EFE7DA', FLOORY = 760;
  const head = art.heading(kit, 'it needs salt.', 'pinch the shaker, then taste');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const r = art.room(kit, { wall: WALL, floor: '#D8D2C4', floorY: FLOORY, window: { x: 700, y: 150, w: 210, h: 250, curtain: art.DUSTY, sun: true, light: true } });
  svg.append(r.el);

  // quiet tile grid on the wall, like a kitchen splashback
  const tiles = kit.svg('g');
  for (let row = 0; row < 7; row++) for (let c = 0; c < 14; c++) {
    tiles.append(kit.svg('rect', { x: c * 72, y: row * 72, width: 68, height: 68, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.22 }));
  }
  svg.append(tiles);

  // counter + stove
  svg.append(kit.svg('rect', { x: 180, y: 600, width: 560, height: 170, fill: '#C9C2B2' }));
  svg.append(kit.svg('rect', { x: 180, y: 600, width: 560, height: 14, fill: art.shade('#C9C2B2', -0.16) }));
  svg.append(kit.svg('rect', { x: 340, y: 636, width: 240, height: 28, rx: 5, fill: art.shade('#C9C2B2', -0.22) }));
  svg.append(kit.svg('circle', { cx: 460, cy: 652, r: 36, fill: art.shade(ink, 0.08), opacity: 0.55 }));
  svg.append(kit.svg('circle', { cx: 460, cy: 652, r: 36, fill: 'none', stroke: ink, 'stroke-width': 4, opacity: 0.45 }));

  // flame licking the pot's base — flicker loop, always alive
  const flameG = kit.svg('g');
  const flameMk = (dx, col) => kit.svg('path', { d: 'M 0 0 C 8 -10 6 -26 0 -36 C -6 -26 -8 -10 0 0 Z', fill: col });
  const flames = [flameMk(-18, art.CLAY), flameMk(0, art.BUTTER), flameMk(18, art.CLAY)];
  flames.forEach((f, i) => f.setAttribute('transform', `translate(${[-18, 0, 18][i]} 648)`));
  flameG.append(...flames);
  svg.append(flameG);

  // the pot
  const potG = kit.svg('g', { transform: 'translate(460 560)' });
  art.shadow(potG, 0, 94, 220, 0.14);
  potG.append(kit.svg('rect', { x: -110, y: -10, width: 220, height: 100, rx: 14, fill: '#9AA3A8' }));
  potG.append(kit.svg('rect', { x: -110, y: 60, width: 220, height: 30, fill: art.shade('#9AA3A8', -0.16) }));
  potG.append(kit.svg('rect', { x: -132, y: 10, width: 24, height: 14, rx: 6, fill: '#9AA3A8' }));
  potG.append(kit.svg('rect', { x: 108, y: 10, width: 24, height: 14, rx: 6, fill: '#9AA3A8' }));
  potG.append(kit.svg('ellipse', { cx: 0, cy: -10, rx: 110, ry: 20, fill: art.shade('#9AA3A8', 0.12) }));
  const liquid = kit.svg('ellipse', { cx: 0, cy: -10, rx: 98, ry: 15, fill: art.CLAY });
  const liquidHi = kit.svg('ellipse', { cx: -24, cy: -14, rx: 30, ry: 6, fill: art.shade(art.CLAY, 0.2), opacity: 0.6 });
  potG.append(liquid, liquidHi);
  svg.append(potG);

  // steam, always rising
  const steamLines = [-34, 2, 38].map(() => kit.svg('path', { stroke: '#fff', 'stroke-width': 6, opacity: 0.5, fill: 'none', 'stroke-linecap': 'round' }));
  svg.append(...steamLines);

  // salt shaker, on the counter — the tap target
  const shakerG = kit.svg('g', { transform: 'translate(660 606)', style: { cursor: 'pointer' } });
  art.shadow(shakerG, 0, 58, 72);
  shakerG.append(kit.svg('rect', { x: -27, y: -42, width: 54, height: 92, rx: 16, fill: 'rgba(255,255,255,0.45)', stroke: art.shade(muted, -0.1), 'stroke-width': 3 }));
  shakerG.append(kit.svg('rect', { x: -31, y: -64, width: 62, height: 26, rx: 10, fill: '#B9AE86' }));
  for (let i = 0; i < 5; i++) shakerG.append(kit.svg('circle', { cx: -16 + i * 8, cy: -60, r: 2, fill: art.shade('#B9AE86', -0.2) }));
  shakerG.append(kit.svg('circle', { cx: 0, cy: 40, r: 64, fill: ink, opacity: 0.0001 }));
  svg.append(shakerG);

  // the person tasting, reaching toward the pot with a spoon
  const pers = art.person(kit, { x: 300, standOn: FLOORY, scale: 0.72, facing: 1, shirt: art.SPRUCE, skin: art.SKINS[1], hair: 'short', pose: 'reach', reachTo: { x: 170, y: -40 }, legs: true });
  svg.append(pers.el);
  const HAND = { x: 422, y: 532 };
  const spoon = kit.svg('g', { transform: `translate(${HAND.x} ${HAND.y}) rotate(-12)` });
  spoon.append(kit.svg('line', { x1: 0, y1: 0, x2: 42, y2: 20, stroke: '#B9AE86', 'stroke-width': 7, 'stroke-linecap': 'round' }));
  spoon.append(kit.svg('ellipse', { cx: 48, cy: 24, rx: 15, ry: 11, fill: '#B9AE86' }));
  svg.append(spoon);

  // the reaction, as a speech bubble above the person's head
  const bubbleG = kit.svg('g', { opacity: 0, transform: 'translate(150 330)' });
  bubbleG.append(kit.svg('rect', { x: 0, y: 0, width: 230, height: 64, rx: 14, fill: '#fff', stroke: ink, 'stroke-width': 3 }));
  bubbleG.append(kit.svg('path', { d: 'M 60 64 L 86 64 L 66 90 Z', fill: '#fff', stroke: ink, 'stroke-width': 3 }));
  const bubbleTxt = kit.svg('text', { x: 115, y: 40, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-size': 21, fill: ink });
  bubbleG.append(bubbleTxt);
  svg.append(bubbleG);

  const btn = kit.el('button', { class: 'g-btn solid', text: 'taste', style: { position: 'absolute', left: '50%', bottom: '5%', transform: 'translateX(-50%)' } });
  kit.stage.append(btn);

  // ---- motion: steam + flame, always alive ----
  kit.loop((dt, t) => {
    if (kit.reducedMotion) return;
    steamLines.forEach((s, i) => {
      const p = ((t / 1900) + i * 0.33) % 1;
      const dx = -34 + i * 36;
      const wob = Math.sin(t / 420 + i) * 10;
      s.setAttribute('d', `M ${460 + dx} ${538 - p * 150} Q ${460 + dx + wob} ${538 - p * 150 - 30} ${460 + dx} ${538 - p * 150 - 60}`);
      s.setAttribute('opacity', 0.5 * (1 - p));
    });
    flames.forEach((f, i) => {
      const s2 = 0.85 + Math.sin(t / 170 + i * 2) * 0.14;
      f.setAttribute('transform', `translate(${[-18, 0, 18][i]} 648) scale(${s2})`);
    });
  });

  // ---- tween helper ----
  function easeOutCubic(p) { return 1 - (1 - p) ** 3; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function tween(duration, draw, done) {
    if (kit.reducedMotion) { draw(1); if (done) done(); return; }
    const t0 = performance.now();
    kit.loop((dt, t) => {
      const p = Math.min(1, (t - t0) / duration);
      draw(easeOutCubic(p));
      if (p >= 1) { if (done) done(); return false; }
    });
  }

  // ---- the game ----
  let level = 0, pinches = 0, started = false, busy = false;
  const MIN_ADD = 10, MAX_ADD = 20;
  const WIN_LO = 68, WIN_HI = 88;

  const LINES = { flat: 'still flat.', better: 'better.', almost: 'almost.', perfect: 'perfect.', salty: 'too salty.' };
  const MOUTHS = {
    flat: 'M -14 34 Q 0 27 14 34',
    better: 'M -14 30 Q 0 36 14 30',
    almost: 'M -18 26 Q 0 42 18 26',
    perfect: 'M -20 24 Q 0 48 20 24',
    salty: 'M -16 30 a 10 10 0 1 0 0.1 0',
  };
  pers.face.mouth.setAttribute('d', MOUTHS.flat);

  function touch() { if (!started) { started = true; head.hide(); } }
  function classify(v) {
    if (v > WIN_HI) return 'salty';
    if (v >= WIN_LO) return 'perfect';
    if (v >= 46) return 'almost';
    if (v >= 22) return 'better';
    return 'flat';
  }
  function showBubble(text) { bubbleTxt.textContent = text; bubbleG.setAttribute('opacity', 1); }
  function hideBubble() { bubbleG.setAttribute('opacity', 0); }

  function shakeShaker() {
    tween(220, (p) => {
      const a = Math.sin(p * Math.PI * 5) * 8 * (1 - p);
      shakerG.setAttribute('transform', `translate(660 606) rotate(${a})`);
    }, () => shakerG.setAttribute('transform', 'translate(660 606)'));
  }
  function dropGrains() {
    for (let i = 0; i < 5; i++) {
      kit.after(i * 45, () => {
        if (kit.won) return;
        const g = kit.svg('circle', { cx: 640, cy: 562, r: 2.6, fill: '#fff' });
        svg.append(g);
        tween(420, (p) => {
          g.setAttribute('cx', lerp(640, 470, p));
          g.setAttribute('cy', lerp(562, 555, p));
          g.setAttribute('opacity', 1 - p * 0.5);
        }, () => g.remove());
      });
    }
  }

  function pinch() {
    touch();
    if (busy || kit.won) return;
    pinches++;
    level += MIN_ADD + Math.random() * (MAX_ADD - MIN_ADD);
    kit.status(`${pinches} pinch${pinches === 1 ? '' : 'es'} in`);
    shakeShaker();
    dropGrains();
  }

  function liftSpoon(onPeak) {
    tween(220, (p) => {
      spoon.setAttribute('transform', `translate(${HAND.x} ${HAND.y}) rotate(${lerp(-12, -140, p)})`);
    }, () => {
      onPeak();
      kit.after(420, () => {
        tween(220, (p) => {
          spoon.setAttribute('transform', `translate(${HAND.x} ${HAND.y}) rotate(${lerp(-140, -12, p)})`);
        });
      });
    });
  }

  function resetPot() {
    tween(260, (p) => {
      liquid.setAttribute('ry', 15 * (1 - p));
      liquidHi.setAttribute('opacity', 0.6 * (1 - p));
    }, () => {
      level = 0; pinches = 0;
      kit.status('fresh pot');
      hideBubble();
      pers.face.mouth.setAttribute('d', MOUTHS.flat);
      tween(300, (p) => {
        liquid.setAttribute('ry', 15 * p);
        liquidHi.setAttribute('opacity', 0.6 * p);
      }, () => { busy = false; });
    });
  }

  function win() {
    art.winBeat(kit, 'it needs salt.');
    kit.after(1100, () => kit.win('perfect.'));
  }

  function taste() {
    touch();
    if (busy || kit.won) return;
    busy = true;
    liftSpoon(() => {
      const cat = classify(level);
      pers.face.mouth.setAttribute('d', MOUTHS[cat]);
      showBubble(LINES[cat]);
      if (cat === 'perfect') { kit.after(500, win); return; }
      if (cat === 'salty') { kit.after(700, resetPot); return; }
      kit.after(850, () => { hideBubble(); busy = false; });
    });
  }

  kit.on(shakerG, 'pointerdown', pinch);
  kit.on(btn, 'click', taste);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); taste(); } });
  kit.status('0 pinches in');

  // Testing hook so check.mjs can drive a deterministic win without guessing the hidden
  // random amounts. Harmless: the game is the fun, not a lock (see earned/README.md).
  window.__salt = { pinch, taste, forceLevel: (v) => { level = v; } };
}
