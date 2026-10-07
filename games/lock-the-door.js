// T08 — did you lock the door beanie
// Lock the deadbolt, drive off. At 70% of the way: "did you lock the door?" You can't keep
// driving until you turn round and look. Usually it was locked. One time in five it wasn't:
// lock it, and that's the round that counts.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, muted = art.MUTED;
  const DRIVE_MS = 2600;
  const head = art.heading(kit, 'did you lock the door?', 'lock up, drive off — go back if it nags you');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const houseLayer = kit.svg('g');
  const roadLayer = kit.svg('g');
  svg.append(houseLayer, roadLayer);

  function drawHouse() {
    const g = [];
    const r = art.room(kit, { wall: '#DCE2E6', floor: art.shade(art.OAT, -0.03), floorY: 560, window: { x: 560, y: 160, w: 180, h: 200, curtain: art.DUSTY, sun: true } });
    g.push(r.el);
    g.push(kit.svg('rect', { x: 0, y: 560, width: 1000, height: 440, fill: '#8C9398' }));
    g.push(kit.svg('line', { x1: 0, y1: 760, x2: 1000, y2: 760, stroke: '#D9D4C8', 'stroke-width': 8, 'stroke-dasharray': '46 36', opacity: 0.6 }));
    return g;
  }
  houseLayer.replaceChildren(...drawHouse());

  const d = art.door(kit, 380, 230, { w: 220, h: 330, color: art.SPRUCE, handleSide: 1 });
  houseLayer.append(d.el);
  // the deadbolt: a small brass plate with a turning knob, beside the handle
  const bolt = kit.svg('g', { transform: 'translate(560 400)' });
  bolt.append(kit.svg('rect', { x: -22, y: -16, width: 44, height: 32, rx: 6, fill: art.shade(art.SPRUCE, -0.25) }));
  const boltKnob = kit.svg('g');
  boltKnob.append(kit.svg('circle', { cx: 0, cy: 0, r: 13, fill: art.BUTTER, stroke: art.shade(art.BUTTER, -0.25), 'stroke-width': 2 }));
  boltKnob.append(kit.svg('rect', { x: -3, y: -13, width: 6, height: 13, fill: art.shade(art.BUTTER, -0.3) }));
  bolt.append(boltKnob);
  houseLayer.append(bolt);
  const boltStatus = kit.svg('text', { x: 490, y: 540, 'text-anchor': 'middle', 'font-size': 15, fill: muted, 'font-family': 'var(--mono)' });
  houseLayer.append(boltStatus);

  function setLocked(v) {
    boltKnob.setAttribute('transform', v ? 'rotate(90)' : 'rotate(0)');
    boltStatus.textContent = v ? 'locked.' : 'unlocked.';
  }
  setLocked(false);

  // the road scene: a little car, houses passing
  function roadHouse(x) {
    const g = kit.svg('g', { transform: `translate(${x} 700)` });
    g.append(kit.svg('rect', { x: -44, y: -70, width: 88, height: 70, fill: '#E7E1D2' }));
    g.append(kit.svg('path', { d: 'M -52 -70 L 0 -110 L 52 -70 Z', fill: art.shade('#E7E1D2', -0.2) }));
    g.append(kit.svg('rect', { x: -14, y: -34, width: 28, height: 34, fill: art.SPRUCE }));
    return g;
  }
  const scrollHouses = kit.svg('g');
  const housePositions = [120, 420, 720, 1020, 1320];
  const houseEls = housePositions.map((x) => { const h = roadHouse(x); scrollHouses.append(h); return h; });

  function drawCar() {
    const g = kit.svg('g');
    art.shadow(g, 0, 26, 170);
    g.append(kit.svg('rect', { x: -78, y: -44, width: 156, height: 48, rx: 18, fill: art.CLAY }));
    g.append(kit.svg('path', { d: 'M -46 -44 L -28 -78 L 38 -78 L 52 -44 Z', fill: art.CLAY }));
    g.append(kit.svg('path', { d: 'M -40 -46 L -24 -72 L 32 -72 L 44 -46 Z', fill: art.shade(art.CLAY, 0.22) }));
    g.append(kit.svg('circle', { cx: 2, cy: -58, r: 15, fill: art.SKINS[2] }));
    g.append(kit.svg('rect', { x: -78, y: -16, width: 156, height: 8, fill: art.shade(art.CLAY, -0.2), opacity: 0.6 }));
    g.append(kit.svg('circle', { cx: -46, cy: 4, r: 20, fill: art.INK }));
    g.append(kit.svg('circle', { cx: 46, cy: 4, r: 20, fill: art.INK }));
    g.append(kit.svg('circle', { cx: -46, cy: 4, r: 8, fill: muted }));
    g.append(kit.svg('circle', { cx: 46, cy: 4, r: 8, fill: muted }));
    g.append(kit.svg('rect', { x: 70, y: -32, width: 10, height: 10, rx: 3, fill: art.BUTTER }));
    return g;
  }
  const car = drawCar();
  roadLayer.append(scrollHouses, car);

  const caption = kit.svg('text', { x: 500, y: 650, 'text-anchor': 'middle', 'font-size': 26, fill: '#fff', 'font-family': 'var(--display)', 'font-weight': 600 });
  const sub = kit.svg('text', { x: 500, y: 684, 'text-anchor': 'middle', 'font-size': 16, fill: 'rgba(255,255,255,0.7)', 'font-family': 'var(--mono)' });
  svg.append(caption, sub);
  roadLayer.style.display = 'none';

  const lockBtn = kit.el('button', { class: 'g-btn solid', text: 'lock up & drive' });
  const backBtn = kit.el('button', { class: 'g-btn solid', text: 'go back and check', style: { display: 'none' } });
  const driveOnBtn = kit.el('button', { class: 'g-btn', text: 'drive on', style: { display: 'none' } });
  const lockItBtn = kit.el('button', { class: 'g-btn solid', text: 'lock it', style: { display: 'none' } });
  const wrap = kit.el('div', { class: 'g-center', style: { pointerEvents: 'none', alignItems: 'flex-end', paddingBottom: '6%' } }, [lockBtn, backBtn, driveOnBtn, lockItBtn]);
  for (const b of [lockBtn, backBtn, driveOnBtn, lockItBtn]) b.style.pointerEvents = 'auto';
  kit.stage.append(wrap);

  let locked = false, running = false, started = false;

  function positionCar(p) { car.setAttribute('transform', `translate(${120 + 760 * p}, 760)`); }
  function scrollRoad(p) {
    for (let i = 0; i < houseEls.length; i++) {
      let x = housePositions[i] - p * 900;
      x = ((x % 1500) + 1500) % 1500 - 150;
      houseEls[i].setAttribute('transform', `translate(${x} 700)`);
    }
  }
  positionCar(0); scrollRoad(0);

  function showHouse() { houseLayer.style.display = ''; roadLayer.style.display = 'none'; }
  function showRoad() { houseLayer.style.display = 'none'; roadLayer.style.display = ''; }
  showHouse();

  function startRound() {
    if (!started) { started = true; head.hide(); }
    caption.textContent = 'driving off.';
    sub.textContent = '';
    lockBtn.style.display = 'none'; backBtn.style.display = 'none'; driveOnBtn.style.display = 'none'; lockItBtn.style.display = 'none';
    setLocked(true);
    showRoad();
    running = true;
    const t0 = performance.now();
    kit.loop(() => {
      if (!running) return false;
      const p = Math.min(0.7, (performance.now() - t0) / DRIVE_MS);
      positionCar(p); scrollRoad(p);
      if (p >= 0.7) { running = false; prompt(); return false; }
    });
  }

  function prompt() {
    caption.textContent = 'did you lock the door?';
    sub.textContent = '';
    backBtn.style.display = 'inline-block';
  }

  kit.on(backBtn, 'click', () => {
    backBtn.style.display = 'none';
    const wasUnlocked = window.__ltdForceUnlocked ?? Math.random() < 0.2; // one time in five
    showHouse();
    if (wasUnlocked) {
      setLocked(false);
      caption.textContent = "it wasn't.";
      sub.textContent = 'go lock it.';
      lockItBtn.style.display = 'inline-block';
    } else {
      caption.textContent = 'it was locked.';
      sub.textContent = 'drive on.';
      driveOnBtn.style.display = 'inline-block';
    }
  });

  kit.on(lockItBtn, 'click', () => {
    setLocked(true);
    caption.textContent = 'locked. now it counts.';
    lockItBtn.style.display = 'none';
    kit.after(500, () => {
      art.winBeat(kit, 'did you lock the door?');
      kit.after(1100, () => kit.win('locked. every time, basically.'));
    });
  });

  kit.on(driveOnBtn, 'click', () => {
    driveOnBtn.style.display = 'none';
    showRoad();
    const t0 = performance.now();
    running = true;
    kit.loop(() => {
      if (!running) return false;
      const p = Math.min(1, 0.7 + ((performance.now() - t0) / (DRIVE_MS * 0.3)) * 0.3);
      positionCar(p); scrollRoad(p);
      if (p >= 1) { running = false; kit.after(400, startRound); return false; }
    });
  });

  kit.on(lockBtn, 'click', startRound);
  caption.textContent = 'lock up and drive off.';

  window.__ltd = { startRound, forceUnlockedCheck: () => { backBtn.dispatchEvent(new MouseEvent('click')); } };
}
