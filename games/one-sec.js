// one sec. — a wall clock whose hand laps once a second. Start it, stop it
// at exactly 1.000s (+/- 0.03) and the clock is yours.
export default function mount(kit) {
  const INK = '#0D0D0E', GREEN = kit.colors.accent || '#00A862', MUTED = '#6B6A66';
  const TARGET = 1000, TOL = 30;

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#F7F5F1' }));
  svg.append(kit.svg('circle', { cx: 500, cy: 440, r: 320, fill: '#FFFFFF', stroke: INK, 'stroke-width': 10 }));

  const ticks = kit.svg('g', { stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round' });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const r1 = i % 3 === 0 ? 278 : 292, r2 = 310;
    ticks.append(kit.svg('line', {
      x1: 500 + Math.cos(a) * r1, y1: 440 + Math.sin(a) * r1,
      x2: 500 + Math.cos(a) * r2, y2: 440 + Math.sin(a) * r2,
    }));
  }
  svg.append(ticks);

  // the target tick, at 12, in green
  svg.append(kit.svg('line', { x1: 500, y1: 130, x2: 500, y2: 150, stroke: GREEN, 'stroke-width': 10, 'stroke-linecap': 'round' }));
  svg.append(kit.svg('circle', { cx: 500, cy: 440, r: 14, fill: INK }));

  const hand = kit.svg('line', { x1: 500, y1: 440, x2: 500, y2: 150, stroke: INK, 'stroke-width': 10, 'stroke-linecap': 'round' });
  svg.append(hand);

  const readout = kit.svg('text', { x: 500, y: 700, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 48, fill: MUTED });
  readout.textContent = '0.000';
  svg.append(readout);

  kit.stage.append(svg);

  const controls = kit.el('div', { style: { position: 'absolute', left: '0', right: '0', bottom: '8%', display: 'flex', justifyContent: 'center' } });
  const button = kit.el('button', { class: 'g-btn solid', text: 'Start' });
  controls.append(button);
  kit.stage.append(controls);

  let t0 = null, stopLoop = null;

  const setHand = (ms) => {
    const a = ((ms % TARGET) / TARGET) * Math.PI * 2 - Math.PI / 2;
    hand.setAttribute('x2', 500 + Math.cos(a) * 310);
    hand.setAttribute('y2', 440 + Math.sin(a) * 310);
  };

  const toggle = () => {
    if (t0 == null) {
      t0 = performance.now();
      button.textContent = 'Stop';
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
      kit.status('to the tick.');
      kit.win('one second. to the tick. it’s yours.');
    } else {
      button.textContent = 'Again';
      kit.status(got < TARGET ? 'too early.' : 'too late.');
    }
  };

  button.onclick = toggle;
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
