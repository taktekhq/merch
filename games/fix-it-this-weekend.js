// T04 — fix it this weekend apron
// Monday–Friday the page shows a dripping tap and a drip counter. Saturday and Sunday
// (your clock), it opens.
export default function mount(kit) {
  const ink = kit.colors.ink || '#0D0D0E';
  const accent = kit.colors.accent || '#00A862';
  const muted = kit.colors.muted || '#6B6A66';
  const CLAY = '#C9764F', OAT = '#E8DFCF', DUSTY = '#8FA6B8';

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const scene = kit.svg('g');
  const caption = kit.svg('text', { x: 500, y: 130, 'text-anchor': 'middle', 'font-size': 32, fill: ink, 'font-family': 'var(--display)', 'font-weight': 600 });
  const sub = kit.svg('text', { x: 500, y: 165, 'text-anchor': 'middle', 'font-size': 18, fill: muted, 'font-family': 'var(--mono)' });
  svg.append(scene, caption, sub);

  let drips = 0, weekend = false;
  const box = kit.el('div', { class: 'g-center', style: { pointerEvents: 'none' } });
  kit.stage.append(box);
  const fixBtn = kit.el('button', { class: 'g-btn solid', text: "fix it", style: { position: 'absolute', left: '50%', bottom: '9%', transform: 'translateX(-50%)', display: 'none', pointerEvents: 'auto' } });
  kit.stage.append(fixBtn);
  kit.on(fixBtn, 'click', () => kit.win('fixed. this weekend, after all.'));

  function drawWeekday() {
    const g = [];
    g.push(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: OAT, opacity: 0.5 }));
    g.push(kit.svg('rect', { x: 330, y: 560, width: 340, height: 180, rx: 16, fill: '#fff', opacity: 0.6 }));
    g.push(kit.svg('rect', { x: 460, y: 420, width: 80, height: 150, rx: 16, fill: DUSTY }));
    g.push(kit.svg('path', { d: 'M 500 420 L 500 380 L 560 380', stroke: DUSTY, 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }));
    const drop = kit.svg('circle', { cx: 500, cy: 580, r: 10, fill: DUSTY });
    g.push(drop);
    kit.cleanup(kit.every(1100 + Math.random() * 500, () => {
      if (weekend) return;
      drop.setAttribute('cy', 580);
      drops();
    }));
    return g;
  }

  function drops() {
    drips++;
    kit.status(`${drips} drip${drips === 1 ? '' : 's'} so far. it can wait.`);
  }

  function drawWeekend() {
    const g = [];
    g.push(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: '#fff', opacity: 0.4 }));
    g.push(kit.svg('circle', { cx: 820, cy: 180, r: 70, fill: '#F2D98A' }));
    g.push(kit.svg('rect', { x: 330, y: 560, width: 340, height: 180, rx: 16, fill: '#fff', opacity: 0.7 }));
    g.push(kit.svg('rect', { x: 460, y: 420, width: 80, height: 150, rx: 16, fill: accent }));
    g.push(kit.svg('path', { d: 'M 500 420 L 500 380 L 560 380', stroke: accent, 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }));
    return g;
  }

  function draw() {
    const now = kit.now();
    const day = now.getDay();
    weekend = day === 0 || day === 6;
    scene.replaceChildren(...(weekend ? drawWeekend() : drawWeekday()));
    if (weekend) {
      caption.textContent = 'open.';
      sub.textContent = now.toLocaleDateString(undefined, { weekday: 'long' }) + ', your time';
      fixBtn.style.display = 'block';
      kit.status('');
    } else {
      caption.textContent = "i'll fix it this weekend.";
      sub.textContent = now.toLocaleDateString(undefined, { weekday: 'long' }) + ' · not yet';
      fixBtn.style.display = 'none';
      kit.status(drips ? `${drips} drips so far.` : 'a tap, dripping.');
    }
  }

  draw();
  kit.every(15000, draw);
}
