// T03 — five more minutes blanket
// An alarm rings. The only button is snooze. Then touch nothing for five real minutes;
// any move and the alarm rings again.
//
// STILL_SECONDS is the one line to change for a local timing test (see check.mjs steps);
// always revert it to 300 before shipping.
const STILL_SECONDS = 300;

export default function mount(kit) {
  const ink = kit.colors.ink || '#0D0D0E';
  const accent = kit.colors.accent || '#00A862';
  const muted = kit.colors.muted || '#6B6A66';
  const NIGHT = '#1B2230';
  const total = STILL_SECONDS * 1000;
  const C = 2 * Math.PI * 170;

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const bg = kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: NIGHT });
  const ring = kit.svg('circle', { cx: 500, cy: 430, r: 170, fill: 'none', stroke: accent, 'stroke-width': 16, 'stroke-dasharray': C, 'stroke-dashoffset': C, transform: 'rotate(-90 500 430)', 'stroke-linecap': 'round' });
  const track = kit.svg('circle', { cx: 500, cy: 430, r: 170, fill: 'none', stroke: '#fff', 'stroke-opacity': 0.12, 'stroke-width': 16 });
  const clockFace = kit.svg('text', { x: 500, y: 450, 'text-anchor': 'middle', 'font-size': 60, fill: '#fff', 'font-family': 'var(--mono)' });
  const label = kit.svg('text', { x: 500, y: 650, 'text-anchor': 'middle', 'font-size': 30, fill: '#fff', 'font-family': 'var(--display)', 'font-weight': 600 });
  svg.append(bg, track, ring, clockFace, label);
  kit.stage.append(svg);

  const btn = kit.el('button', { class: 'g-btn solid', text: 'snooze', style: { position: 'absolute', left: '50%', bottom: '10%', transform: 'translateX(-50%)' } });
  kit.stage.append(btn);

  let quiet = false, since = 0;

  function ringing() {
    quiet = false;
    clockFace.textContent = '⏰';
    clockFace.setAttribute('font-size', 110);
    label.textContent = 'five more minutes.';
    ring.setAttribute('stroke-dashoffset', C);
    btn.hidden = false;
    kit.status('');
  }
  ringing();

  kit.on(btn, 'click', () => {
    quiet = true;
    since = performance.now();
    btn.hidden = true;
    clockFace.setAttribute('font-size', 60);
    label.textContent = 'stay still.';
  });

  kit.onActivity(() => {
    if (!quiet || kit.won) return;
    quiet = false;
    label.textContent = 'moved. it rings again.';
    kit.after(500, ringing);
  });

  kit.loop(() => {
    if (!quiet || kit.won) return;
    const elapsed = performance.now() - since;
    const p = Math.min(1, elapsed / total);
    ring.setAttribute('stroke-dashoffset', C * (1 - p));
    const left = Math.max(0, total - elapsed);
    const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
    clockFace.textContent = `${m}:${String(s).padStart(2, '0')}`;
    kit.status(`${m}:${String(s).padStart(2, '0')} left`);
    if (p >= 1) { label.textContent = 'still dark out.'; kit.win('five minutes. nobody moved.'); return false; }
  });
}
