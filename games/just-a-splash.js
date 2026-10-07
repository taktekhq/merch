// just a splash. — a bar counter, a rocks glass. Hold to pour, let go.
// Land in the thin band at the bottom. Too much and it's a drink.
export default function mount(kit) {
  const INK = '#0D0D0E', MUTED = '#6B6A66', GREEN = kit.colors.accent || '#00A862', CLAY = '#C9764F', NIGHT = '#1B2230';
  const BAND = [0.08, 0.17]; // thin band near the bottom, fraction of glass height
  const CEILING = 0.4; // past this while still pouring, it's a drink
  const POUR_MS = 1600; // ms to fill 0..1

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: NIGHT }));
  // bar counter + a blurry row of bottles up top, decorative
  svg.append(kit.svg('rect', { x: 0, y: 760, width: 1000, height: 240, fill: '#3A2A1E' }));
  svg.append(kit.svg('rect', { x: 0, y: 760, width: 1000, height: 10, fill: '#0D0D0E', opacity: 0.3 }));
  const bottles = kit.svg('g', { opacity: 0.35 });
  for (let i = 0; i < 6; i++) bottles.append(kit.svg('rect', { x: 90 + i * 150, y: 90 + (i % 2) * 20, width: 46, height: 150, rx: 10, fill: i % 2 ? CLAY : '#2F4F46' }));
  svg.append(bottles);

  // glass geometry
  const GX = 500, GTOP = 480, GBOT = 740, GW_TOP = 220, GW_BOT = 190;
  const glassPath = `M ${GX - GW_TOP / 2} ${GTOP} L ${GX - GW_BOT / 2} ${GBOT} L ${GX + GW_BOT / 2} ${GBOT} L ${GX + GW_TOP / 2} ${GTOP}`;
  svg.append(kit.svg('path', { d: glassPath, fill: 'rgba(255,255,255,0.06)', stroke: '#D9D4C8', 'stroke-width': 6, 'stroke-linejoin': 'round' }));

  const clip = kit.svg('clipPath', { id: 'glassClip' }, [kit.svg('path', { d: `${glassPath} Z` })]);
  svg.append(clip);
  const liquid = kit.svg('rect', { id: 'liquid', x: GX - GW_TOP, y: GBOT, width: GW_TOP * 2, height: 0, fill: CLAY, 'data-level': '0', 'clip-path': 'url(#glassClip)' });
  svg.append(liquid);

  const bandTop = GBOT - (GBOT - GTOP) * BAND[1];
  const bandBot = GBOT - (GBOT - GTOP) * BAND[0];
  svg.append(kit.svg('line', { x1: GX - GW_BOT / 2 - 18, y1: bandTop, x2: GX - GW_BOT / 2 - 18, y2: bandBot, stroke: GREEN, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.8 }));

  kit.stage.append(svg);

  const hint = kit.el('p', { class: 'g-mono', text: 'hold to pour', style: { position: 'absolute', left: '0', right: '0', bottom: '6%', textAlign: 'center', color: MUTED, margin: '0' } });
  kit.stage.append(hint);

  let level = 0, pouring = false, settled = false;

  const render = () => {
    const h = (GBOT - GTOP) * level;
    liquid.setAttribute('y', GBOT - h);
    liquid.setAttribute('height', h);
    liquid.setAttribute('data-level', level.toFixed(3));
    liquid.setAttribute('data-pouring', pouring ? '1' : '0');
  };

  const finishPour = () => {
    pouring = false;
    if (level >= BAND[0] && level <= BAND[1]) {
      settled = true;
      kit.win('just a splash. exactly.');
    } else if (level < BAND[0]) {
      kit.status('not even a splash.');
      kit.after(500, () => { level = 0; render(); });
    } else {
      kit.status("that's a drink.");
      kit.after(500, () => { level = 0; render(); });
    }
  };

  const start = () => {
    if (settled || pouring) return;
    pouring = true;
    kit.status('pouring…');
  };
  const stop = () => { if (pouring) finishPour(); };

  kit.on(kit.stage, 'pointerdown', (e) => { e.preventDefault(); start(); });
  kit.on(window, 'pointerup', stop);
  kit.on(window, 'keydown', (e) => { if ((e.code === 'Space' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } });
  kit.on(window, 'keyup', (e) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); stop(); } });

  kit.loop((dt) => {
    if (!pouring || settled) return;
    level = Math.max(0, level + dt / POUR_MS);
    render();
    if (level >= CEILING) { level = CEILING; render(); finishPour(); }
  });
}
