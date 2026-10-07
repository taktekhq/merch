// T05 — first one up mug
// Four bedroom doors, one alarm. When it rings, turn it off before anyone else wakes
// (under 300 ms). Three mornings in a row.
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, accent = art.ACCENT, muted = art.MUTED;
  const REACT_MS = 300;
  const head = art.heading(kit, 'first one up.', 'wait for the ring, then be first');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);

  const r = art.room(kit, { wall: art.NIGHT, floor: art.shade(art.NIGHT, -0.08), floorY: 780, window: { x: 54, y: 150, w: 140, h: 170, night: true } });
  svg.append(r.el);

  // a rug in front of the doors
  svg.append(kit.svg('rect', { x: 230, y: 800, width: 540, height: 110, rx: 16, fill: art.shade(art.NIGHT, 0.16), opacity: 0.5 }));
  svg.append(kit.svg('rect', { x: 250, y: 818, width: 500, height: 74, rx: 10, fill: 'none', stroke: art.shade(art.NIGHT, 0.3), 'stroke-width': 3, opacity: 0.4 }));

  // a light switch on the wall, clear of the last door
  svg.append(kit.svg('rect', { x: 950, y: 420, width: 34, height: 48, rx: 6, fill: '#E8E2D6', opacity: 0.85 }));
  svg.append(kit.svg('rect', { x: 959, y: 428, width: 16, height: 10, rx: 3, fill: art.shade(art.NIGHT, 0.1) }));

  // four bedroom doors with frames and brass handles
  const doorXs = [100, 320, 540, 760];
  const doors = doorXs.map((x, i) => art.door(kit, x, 360, { w: 170, h: 410, color: '#2a3347', handleSide: i % 2 ? -1 : 1 }));
  doors.forEach((d) => svg.append(d.el));
  // warm light that can spill from under a door on a fail
  const spill = doorXs.map((x) => kit.svg('rect', { x: x + 6, y: 762, width: 158, height: 14, fill: art.BUTTER, opacity: 0 }));
  spill.forEach((s) => svg.append(s));

  // the alarm clock on a small table in front of the doors, on the rug
  const tableX = 500, tableY = 880;
  const tbl = art.table(kit, tableX, tableY, { w: 160, h: 16, legH: 70, color: '#5A6372' });
  svg.append(tbl);
  const clock = kit.svg('g', { transform: `translate(${tableX} ${tableY - 134})` });
  art.shadow(clock, 0, 44, 90);
  clock.append(kit.svg('circle', { cx: -30, cy: -28, r: 11, fill: muted }));
  clock.append(kit.svg('circle', { cx: 30, cy: -28, r: 11, fill: muted }));
  const clockBody = kit.svg('circle', { cx: 0, cy: 0, r: 38, fill: '#fff' });
  const clockFace = kit.svg('text', { x: 0, y: 8, 'text-anchor': 'middle', 'font-size': 30, fill: ink });
  clock.append(clockBody, clockFace);
  svg.append(clock);

  const caption = kit.svg('text', { x: 500, y: 232, 'text-anchor': 'middle', 'font-size': 22, fill: '#fff', 'font-family': 'var(--display)', 'font-weight': 600 });
  svg.append(caption);
  const dots = [0, 1, 2].map((i) => kit.svg('circle', { cx: 460 + i * 40, cy: 935, r: 7, fill: 'none', stroke: '#fff', 'stroke-opacity': 0.4, 'stroke-width': 3 }));
  svg.append(...dots);

  const btn = kit.el('button', { class: 'g-btn solid', text: 'ready', style: { position: 'absolute', left: '50%', bottom: '5%', transform: 'translateX(-50%)' } });
  kit.stage.append(btn);

  let streak = 0, waiting = false, ringAt = 0, started = false;

  function nightDraw() {
    clockFace.textContent = '';
    clockBody.setAttribute('fill', '#fff');
    caption.textContent = 'asleep. everyone.';
    btn.textContent = 'ready';
    btn.disabled = false;
    spill.forEach((s) => s.setAttribute('opacity', 0));
  }
  nightDraw();
  kit.status('0/3 mornings');

  kit.on(btn, 'click', handleClick);
  kit.on(window, 'keydown', (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); handleClick(); } });

  function handleClick() {
    if (!started) { started = true; head.hide(); }
    if (!waiting) {
      waiting = true;
      btn.disabled = true;
      caption.textContent = 'quiet…';
      const delay = 900 + Math.random() * 2200;
      kit.after(delay, () => {
        ringAt = performance.now();
        clockBody.setAttribute('fill', accent);
        clockFace.setAttribute('fill', '#fff');
        clockFace.textContent = '!';
        caption.textContent = 'now.';
        btn.disabled = false;
        btn.textContent = 'off';
      });
      return;
    }
    if (!ringAt) return;
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
    if (streak >= 3) {
      kit.after(500, () => {
        art.winBeat(kit, 'first one up.');
        kit.after(1100, () => kit.win('first one up. every time.'));
      });
      return;
    }
    kit.after(900, reset);
  }

  function fail(msg) {
    streak = 0;
    dots.forEach((d) => { d.setAttribute('fill', 'none'); d.setAttribute('stroke', '#fff'); });
    kit.status('0/3 mornings');
    caption.textContent = msg;
    const s = spill[Math.floor(Math.random() * spill.length)];
    s.setAttribute('opacity', 0.75);
    waiting = false; ringAt = 0;
    kit.after(900, reset);
  }

  function reset() {
    waiting = false; ringAt = 0;
    nightDraw();
  }
}
