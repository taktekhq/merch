// T05 — first one up mug
// Four bedroom doors, one alarm. When it rings, turn it off before anyone else wakes
// (under 300 ms). Three mornings in a row.
export default function mount(kit) {
  const ink = kit.colors.ink || '#0D0D0E';
  const accent = kit.colors.accent || '#00A862';
  const muted = kit.colors.muted || '#6B6A66';
  const NIGHT = '#1B2230', OAT = '#E8DFCF';
  const REACT_MS = 300;

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const bg = kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: NIGHT });
  svg.append(bg);
  const doors = [0, 1, 2, 3].map((i) => {
    const x = 90 + i * 210;
    const g = kit.svg('g');
    g.append(kit.svg('rect', { x, y: 380, width: 160, height: 420, rx: 8, fill: '#2a3347' }));
    g.append(kit.svg('circle', { cx: x + 130, cy: 600, r: 7, fill: muted }));
    return g;
  });
  svg.append(...doors);
  const alarm = kit.svg('g');
  const clockBody = kit.svg('circle', { cx: 500, cy: 230, r: 80, fill: '#fff' });
  const clockFace = kit.svg('text', { x: 500, y: 250, 'text-anchor': 'middle', 'font-size': 60, fill: ink });
  alarm.append(clockBody, clockFace);
  svg.append(alarm);
  const caption = kit.svg('text', { x: 500, y: 850, 'text-anchor': 'middle', 'font-size': 28, fill: '#fff', 'font-family': 'var(--display)', 'font-weight': 600 });
  svg.append(caption);
  const dots = [0, 1, 2].map((i) => kit.svg('circle', { cx: 440 + i * 60, cy: 920, r: 9, fill: 'none', stroke: '#fff', 'stroke-opacity': 0.35, 'stroke-width': 3 }));
  svg.append(...dots);

  const btn = kit.el('button', { class: 'g-btn solid', text: 'ready', style: { position: 'absolute', left: '50%', bottom: '6%', transform: 'translateX(-50%)' } });
  kit.stage.append(btn);

  let streak = 0, waiting = false, ringAt = 0, doorOpening = -1;

  function nightDraw() {
    clockFace.textContent = '';
    clockBody.setAttribute('fill', '#fff');
    caption.textContent = 'asleep. everyone.';
    btn.textContent = 'ready';
    btn.disabled = false;
  }
  nightDraw();
  kit.status('0/3 mornings');

  kit.on(btn, 'click', handleClick);

  function handleClick() {
    if (!waiting) { // first click of a round: arm it
      waiting = true;
      btn.disabled = true;
      caption.textContent = 'quiet…';
      const delay = 900 + Math.random() * 2200;
      kit.after(delay, () => {
        ringAt = performance.now();
        clockBody.setAttribute('fill', accent);
        clockFace.setAttribute('fill', '#fff');
        clockFace.textContent = '⏰';
        caption.textContent = 'now.';
        btn.disabled = false;
        btn.textContent = 'off';
      });
      return;
    }
    if (!ringAt) return; // still waiting for the ring, button is disabled anyway
    const dt = performance.now() - ringAt;
    ringAt = 0;
    if (dt <= REACT_MS) succeed();
    else fail('too slow. someone stirred.');
  }

  function succeed() {
    dots[streak].setAttribute('fill', accent);
    dots[streak].setAttribute('stroke', accent);
    streak++;
    kit.status(`${streak}/3 mornings`);
    caption.textContent = 'off. nobody woke up.';
    if (streak >= 3) { kit.after(500, () => kit.win('first one up. every time.')); return; }
    kit.after(900, reset);
  }

  function fail(msg) {
    streak = 0;
    dots.forEach((d) => { d.setAttribute('fill', 'none'); d.setAttribute('stroke', '#fff'); });
    kit.status('0/3 mornings');
    caption.textContent = msg;
    waiting = false; ringAt = 0;
    kit.after(900, reset);
  }

  function reset() {
    waiting = false; ringAt = 0;
    nightDraw();
  }
}
