// T01 — told you so. cap
// "Time it." Three little scenes where someone ignores a warning. Press "told you so."
// the moment it goes wrong: too early doesn't count, too late nobody hears. Three perfect ones.
export default function mount(kit) {
  const ink = kit.colors.ink || '#0D0D0E';
  const accent = kit.colors.accent || '#00A862';
  const muted = kit.colors.muted || '#6B6A66';
  const CLAY = '#C9764F', DUSTY = '#8FA6B8', OAT = '#E8DFCF';

  const scenes = [
    { label: 'the umbrella stays by the door.', draw: drawRain, dur: 3000, at: 0.62 },
    { label: 'the pan just came off the flame.', draw: drawPan, dur: 2600, at: 0.58 },
    { label: "it's not going to fit.", draw: drawSofa, dur: 3200, at: 0.66 },
  ];
  const TOL = kit.reducedMotion ? 0.09 : 0.055; // fraction of scene duration, each side

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const scenery = kit.svg('g');
  const track = kit.svg('line', { x1: 120, y1: 760, x2: 880, y2: 760, stroke: muted, 'stroke-opacity': 0.3, 'stroke-width': 6, 'stroke-linecap': 'round' });
  const marker = kit.svg('line', { y1: 730, y2: 790, stroke: CLAY, 'stroke-width': 8, 'stroke-linecap': 'round' });
  const cursor = kit.svg('circle', { r: 16, fill: ink, cy: 760 });
  const caption = kit.svg('text', { x: 500, y: 150, 'text-anchor': 'middle', 'font-size': 34, fill: ink, 'font-family': 'var(--display)', 'font-weight': 600 });
  const sub = kit.svg('text', { x: 500, y: 185, 'text-anchor': 'middle', 'font-size': 18, fill: muted, 'font-family': 'var(--mono)' });
  const flash = kit.svg('text', { x: 500, y: 300, 'text-anchor': 'middle', 'font-size': 30, fill: accent, 'font-family': 'var(--display)', 'font-weight': 600, opacity: 0 });
  svg.append(scenery, track, marker, cursor, caption, sub, flash);

  const dots = [0, 1, 2].map((i) => kit.svg('circle', { cx: 440 + i * 60, cy: 920, r: 9, fill: 'none', stroke: muted, 'stroke-opacity': 0.4, 'stroke-width': 3 }));
  svg.append(...dots);

  const btn = kit.el('button', { class: 'g-btn solid', text: 'told you so', style: { position: 'absolute', left: '50%', bottom: '6%', transform: 'translateX(-50%)' } });
  kit.stage.append(btn);

  let scene = 0, perfect = 0, running = false, t0 = 0, resolved = false;

  function layoutScene() {
    const s = scenes[scene];
    scenery.replaceChildren(...s.draw());
    caption.textContent = s.label;
    sub.textContent = 'press the moment it goes wrong';
    marker.setAttribute('x1', 120 + 760 * s.at);
    marker.setAttribute('x2', 120 + 760 * s.at);
    cursor.setAttribute('cx', 120);
    flash.setAttribute('opacity', 0);
  }

  function startScene() {
    layoutScene();
    resolved = false;
    t0 = performance.now();
    running = true;
  }

  kit.after(500, startScene);

  kit.loop(() => {
    if (!running) return;
    const s = scenes[scene];
    const p = Math.min(1, (performance.now() - t0) / s.dur);
    cursor.setAttribute('cx', 120 + 760 * p);
    if (p >= 1 && !resolved) { resolved = true; miss('too late. nobody heard it.'); }
  });

  function miss(text) {
    running = false;
    flash.textContent = text;
    flash.setAttribute('fill', CLAY);
    flash.setAttribute('opacity', 1);
    kit.after(900, startScene);
  }

  function press() {
    if (!running || resolved) return;
    const s = scenes[scene];
    const p = (performance.now() - t0) / s.dur;
    const diff = p - s.at;
    if (diff < -TOL) { resolved = true; miss("too early. it hasn't happened yet."); return; }
    if (diff > TOL) { resolved = true; miss('too late. nobody heard it.'); return; }
    resolved = true;
    running = false;
    flash.textContent = 'told you so.';
    flash.setAttribute('fill', accent);
    flash.setAttribute('opacity', 1);
    dots[perfect].setAttribute('fill', accent);
    dots[perfect].setAttribute('stroke', accent);
    perfect++;
    kit.status(`${perfect}/3`);
    if (perfect >= 3) { kit.after(700, () => kit.win("told you so.")); return; }
    scene = (scene + 1) % scenes.length;
    kit.after(1000, startScene);
  }

  kit.on(btn, 'click', press);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); press(); } });
  kit.status('0/3');

  function drawRain() {
    const g = [];
    g.push(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 650, fill: DUSTY, opacity: 0.25 }));
    g.push(kit.svg('rect', { x: 700, y: 400, width: 160, height: 280, fill: '#fff', opacity: 0.5, rx: 6 }));
    for (let i = 0; i < 14; i++) g.push(kit.svg('line', { x1: 60 + i * 65, y1: 60, x2: 30 + i * 65, y2: 220, stroke: DUSTY, 'stroke-width': 5, 'stroke-linecap': 'round' }));
    // the friend, by the door, umbrella leaning against the wall
    g.push(kit.svg('rect', { x: 460, y: 540, width: 90, height: 160, rx: 20, fill: ink }));
    g.push(kit.svg('circle', { cx: 505, cy: 520, r: 26, fill: ink }));
    g.push(kit.svg('line', { x1: 610, y1: 420, x2: 610, y2: 560, stroke: muted, 'stroke-width': 8, 'stroke-linecap': 'round' }));
    g.push(kit.svg('path', { d: 'M 560 420 A 50 50 0 0 1 660 420 Z', fill: CLAY }));
    return g;
  }
  function drawPan() {
    const g = [];
    g.push(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 650, fill: OAT, opacity: 0.5 }));
    g.push(kit.svg('rect', { x: 380, y: 500, width: 240, height: 24, rx: 12, fill: ink }));
    g.push(kit.svg('ellipse', { cx: 460, cy: 500, rx: 90, ry: 20, fill: muted }));
    for (let i = 0; i < 5; i++) g.push(kit.svg('line', { x1: 420 + i * 18, y1: 480, x2: 420 + i * 18, y2: 440 - i * 4, stroke: CLAY, 'stroke-width': 5, opacity: 0.6, 'stroke-linecap': 'round' }));
    g.push(kit.svg('circle', { cx: 790, cy: 570, r: 26, fill: ink }));
    g.push(kit.svg('rect', { x: 745, y: 590, width: 90, height: 150, rx: 20, fill: ink }));
    return g;
  }
  function drawSofa() {
    const g = [];
    g.push(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 650, fill: DUSTY, opacity: 0.18 }));
    g.push(kit.svg('rect', { x: 560, y: 320, width: 260, height: 340, fill: muted, opacity: 0.25 }));
    g.push(kit.svg('rect', { x: 150, y: 420, width: 420, height: 150, rx: 24, fill: CLAY }));
    g.push(kit.svg('rect', { x: 150, y: 380, width: 70, height: 100, rx: 20, fill: CLAY }));
    g.push(kit.svg('rect', { x: 500, y: 380, width: 70, height: 100, rx: 20, fill: CLAY }));
    g.push(kit.svg('circle', { cx: 150, cy: 600, r: 24, fill: ink }));
    g.push(kit.svg('rect', { x: 105, y: 620, width: 90, height: 140, rx: 20, fill: ink }));
    return g;
  }
}
