// T18 — just a splash. rocks glass
// A bar counter, bottles with real necks and labels, a proper rocks glass with thickness.
// Hold to pour, let go. Land in the thin band near the bottom. Too much and it's a drink.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, muted = art.MUTED, accent = art.ACCENT;
  const BAND = [0.08, 0.17];
  const CEILING = 0.4;
  const POUR_MS = 1600;
  const head = art.heading(kit, 'just a splash.', 'hold to pour, let go');
  const [hLabel, hHint] = head.el.children;
  hLabel.style.color = '#F2EFE8';
  hHint.style.color = '#9BA2B0';

  function drawBottle(x, y, opts = {}) {
    const { color = art.CLAY, scale = 1, label = true, hand = false } = opts;
    const w = 70 * scale, bodyH = 190 * scale, neckH = 70 * scale, neckW = 22 * scale, shoulder = 16 * scale;
    const parts = [];
    parts.push(kit.svg('rect', { x: x - neckW / 2, y: y - neckH - bodyH - shoulder, width: neckW, height: neckH, rx: 4, fill: art.shade(color, -0.1) }));
    parts.push(kit.svg('rect', { x: x - 6 * scale, y: y - neckH - bodyH - shoulder - 9 * scale, width: 12 * scale, height: 9 * scale, fill: art.shade(color, -0.3) }));
    parts.push(kit.svg('path', { d: `M ${x - neckW / 2} ${y - bodyH - shoulder} L ${x - w / 2} ${y - bodyH + shoulder} L ${x - w / 2} ${y - shoulder} Q ${x - w / 2} ${y} ${x - w / 2 + 10 * scale} ${y} L ${x + w / 2 - 10 * scale} ${y} Q ${x + w / 2} ${y} ${x + w / 2} ${y - shoulder} L ${x + w / 2} ${y - bodyH + shoulder} L ${x + neckW / 2} ${y - bodyH - shoulder} Z`, fill: color }));
    parts.push(kit.svg('rect', { x: x + w * 0.18, y: y - bodyH + 10 * scale, width: w * 0.16, height: bodyH - 30 * scale, rx: 6, fill: art.shade(color, 0.16), opacity: 0.5 }));
    if (label) {
      parts.push(kit.svg('rect', { x: x - w / 2 + 6, y: y - bodyH * 0.42, width: w - 12, height: bodyH * 0.3, fill: '#F2EFE8', opacity: 0.92 }));
      parts.push(kit.svg('line', { x1: x - w / 2 + 16, y1: y - bodyH * 0.3, x2: x + w / 2 - 16, y2: y - bodyH * 0.3, stroke: muted, 'stroke-width': 2, opacity: 0.6 }));
    }
    if (hand) parts.push(kit.svg('ellipse', { cx: x - 4, cy: y - bodyH - shoulder - neckH * 0.55, rx: 28 * scale, ry: 22 * scale, fill: art.SKINS[2] }));
    return parts;
  }

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: art.NIGHT }));

  // back shelf, real little bottles
  const shelf = kit.svg('g', { opacity: 0.5 });
  shelf.append(kit.svg('rect', { x: 60, y: 300, width: 880, height: 14, fill: art.shade(art.NIGHT, 0.1) }));
  for (const b of [{ x: 150, c: art.CLAY }, { x: 280, c: art.SPRUCE }, { x: 420, c: '#8B5E3C' }, { x: 700, c: art.SPRUCE }, { x: 840, c: art.CLAY }]) {
    for (const part of drawBottle(b.x, 300, { color: b.c, scale: 0.7, label: false })) shelf.append(part);
  }
  svg.append(shelf);

  // the counter, quiet grain
  svg.append(kit.svg('rect', { x: 0, y: 740, width: 1000, height: 260, fill: '#3A2A1E' }));
  svg.append(kit.svg('rect', { x: 0, y: 740, width: 1000, height: 10, fill: '#0D0D0E', opacity: 0.3 }));
  const grain = kit.svg('g', { stroke: '#2A1D14', 'stroke-width': 2, opacity: 0.35 });
  for (let i = 0; i < 9; i++) grain.append(kit.svg('path', { d: `M 0 ${772 + i * 20} Q 500 ${766 + i * 20} 1000 ${774 + i * 20}`, fill: 'none' }));
  svg.append(grain);

  // the glass, drawn with real thickness
  const GX = 500, GTOP = 500, GBOT = 730, GW_TOP = 220, GW_BOT = 186, WALL = 10;
  const outerPath = `M ${GX - GW_TOP / 2} ${GTOP} L ${GX - GW_BOT / 2} ${GBOT} L ${GX + GW_BOT / 2} ${GBOT} L ${GX + GW_TOP / 2} ${GTOP}`;
  art.shadow(svg, GX, GBOT + 10, GW_BOT * 1.3, 0.3);
  svg.append(kit.svg('path', { d: outerPath, fill: 'rgba(255,255,255,0.05)', stroke: '#D9D4C8', 'stroke-width': WALL, 'stroke-linejoin': 'round' }));
  svg.append(kit.svg('line', { x1: GX - GW_TOP / 2 + WALL, y1: GTOP + 8, x2: GX - GW_BOT / 2 + WALL, y2: GBOT - 8, stroke: '#fff', 'stroke-width': 4, opacity: 0.18, 'stroke-linecap': 'round' }));

  const clipId = 'splashClip' + Math.floor(Math.random() * 1e6);
  svg.append(kit.svg('clipPath', { id: clipId }, [kit.svg('path', { d: `${outerPath} Z` })]));
  const liquid = kit.svg('rect', { x: GX - GW_TOP, y: GBOT, width: GW_TOP * 2, height: 0, fill: art.CLAY, 'clip-path': `url(#${clipId})` });
  svg.append(liquid);

  const bandTop = GBOT - (GBOT - GTOP) * BAND[1], bandBot = GBOT - (GBOT - GTOP) * BAND[0];
  svg.append(kit.svg('line', { x1: GX - GW_BOT / 2 - 18, y1: bandTop, x2: GX - GW_BOT / 2 - 18, y2: bandBot, stroke: accent, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.85 }));

  // the pour bottle, pivoted exactly at its mouth so the stream always starts in the same place
  const bx = 350, by = 560, mouthY = by - 276;
  const bottleRoot = kit.svg('g', { transform: `translate(${bx} ${by})` });
  for (const part of drawBottle(0, 0, { color: art.CLAY, scale: 1, label: true, hand: true })) bottleRoot.append(part);
  svg.append(bottleRoot);

  const stream = kit.svg('path', { d: '', stroke: art.CLAY, 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', opacity: 0 });
  svg.append(stream);
  const splash = kit.svg('g', { opacity: 0 });
  for (let i = 0; i < 4; i++) splash.append(kit.svg('circle', { r: 4, fill: art.CLAY }));
  svg.append(splash);

  kit.stage.append(svg);

  let level = 0, pouring = false, settled = false, tilt = 0, started = false;

  const renderLiquid = () => {
    const h = (GBOT - GTOP) * level;
    liquid.setAttribute('y', GBOT - h);
    liquid.setAttribute('height', h);
  };
  const renderStream = () => {
    if (!pouring) { stream.setAttribute('opacity', 0); return; }
    const surfaceY = GBOT - (GBOT - GTOP) * level;
    stream.setAttribute('d', `M ${bx} ${mouthY} Q ${bx + 10} ${(mouthY + surfaceY) / 2} ${GX} ${surfaceY}`);
    stream.setAttribute('opacity', 0.9);
  };

  const burst = (x, y) => {
    const pts = [...splash.children];
    splash.setAttribute('opacity', 1);
    const t0 = performance.now();
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / 360);
      pts.forEach((pt, i) => {
        const ang = (-50 + i * 34) * Math.PI / 180;
        pt.setAttribute('cx', x); pt.setAttribute('cy', y);
        pt.setAttribute('transform', `translate(${Math.cos(ang) * 34 * p} ${Math.sin(ang) * 34 * p - 20 * p})`);
        pt.setAttribute('opacity', 1 - p);
      });
      if (p < 1) requestAnimationFrame(step); else splash.setAttribute('opacity', 0);
    };
    step();
  };

  const tiltTo = (deg, dur) => {
    const t0 = performance.now(), from = tilt;
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      tilt = from + (deg - from) * p;
      bottleRoot.setAttribute('transform', `translate(${bx} ${by}) rotate(${tilt} 0 -276)`);
      if (p < 1) requestAnimationFrame(step);
    };
    step();
  };

  const finishPour = () => {
    pouring = false;
    tiltTo(0, 260);
    stream.setAttribute('opacity', 0);
    burst(GX, GBOT - (GBOT - GTOP) * level);
    if (level >= BAND[0] && level <= BAND[1]) {
      settled = true;
      kit.after(300, () => {
        const b = art.winBeat(kit, 'just a splash.');
        b.style.color = '#F2EFE8';
        kit.after(1100, () => kit.win('just a splash. exactly.'));
      });
    } else if (level < BAND[0]) {
      kit.status('not even a splash.');
      kit.after(500, () => { level = 0; renderLiquid(); });
    } else {
      kit.status("that's a drink.");
      kit.after(500, () => { level = 0; renderLiquid(); });
    }
  };

  const start = () => {
    if (!started) { started = true; head.hide(); }
    if (settled || pouring) return;
    pouring = true;
    kit.status('pouring…');
    tiltTo(34, 220);
  };
  const stop = () => { if (pouring) finishPour(); };

  kit.on(kit.stage, 'pointerdown', (e) => { e.preventDefault(); start(); });
  kit.on(window, 'pointerup', stop);
  kit.on(window, 'keydown', (e) => { if ((e.code === 'Space' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } });
  kit.on(window, 'keyup', (e) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); stop(); } });

  kit.loop((dt) => {
    if (!pouring || settled) return;
    level = Math.max(0, level + dt / POUR_MS);
    renderLiquid();
    renderStream();
    if (level >= CEILING) { level = CEILING; renderLiquid(); finishPour(); }
  });
}
