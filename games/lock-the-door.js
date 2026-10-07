// T08 — did you lock the door beanie
// Lock the deadbolt, drive off. At 70% of the way: "did you lock the door?" You can't keep
// driving until you turn round and look. Usually it was locked. One time in five it wasn't:
// lock it, and that's the round that counts.
export default function mount(kit) {
  const ink = kit.colors.ink || '#0D0D0E';
  const accent = kit.colors.accent || '#00A862';
  const muted = kit.colors.muted || '#6B6A66';
  const NIGHT = '#1B2230', CLAY = '#C9764F', DUSTY = '#8FA6B8';
  const DRIVE_MS = 2400;

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: DUSTY, opacity: 0.18 }));
  svg.append(kit.svg('line', { x1: 60, y1: 700, x2: 940, y2: 700, stroke: muted, 'stroke-width': 10, 'stroke-opacity': 0.3 }));
  const house = kit.svg('g');
  house.append(kit.svg('rect', { x: 60, y: 440, width: 200, height: 260, fill: '#fff', opacity: 0.6 }));
  const door = kit.svg('rect', { x: 140, y: 560, width: 50, height: 140, fill: '#2F4F46' });
  house.append(door);
  svg.append(house);
  const car = kit.svg('g');
  car.append(kit.svg('rect', { x: -40, y: -20, width: 80, height: 40, rx: 12, fill: ink }));
  car.append(kit.svg('circle', { cx: -22, cy: 22, r: 10, fill: muted }));
  car.append(kit.svg('circle', { cx: 22, cy: 22, r: 10, fill: muted }));
  svg.append(car);
  const caption = kit.svg('text', { x: 500, y: 130, 'text-anchor': 'middle', 'font-size': 28, fill: ink, 'font-family': 'var(--display)', 'font-weight': 600 });
  const sub = kit.svg('text', { x: 500, y: 170, 'text-anchor': 'middle', 'font-size': 16, fill: muted, 'font-family': 'var(--mono)' });
  svg.append(caption, sub);

  const lockBtn = kit.el('button', { class: 'g-btn solid', text: 'lock up & drive' });
  const backBtn = kit.el('button', { class: 'g-btn solid', text: 'go back and check', style: { display: 'none' } });
  const driveOnBtn = kit.el('button', { class: 'g-btn', text: 'drive on', style: { display: 'none' } });
  const lockItBtn = kit.el('button', { class: 'g-btn solid', text: 'lock it', style: { display: 'none' } });
  const wrap = kit.el('div', { class: 'g-center', style: { pointerEvents: 'none', alignItems: 'flex-end', paddingBottom: '6%' } }, [lockBtn, backBtn, driveOnBtn, lockItBtn]);
  for (const b of [lockBtn, backBtn, driveOnBtn, lockItBtn]) b.style.pointerEvents = 'auto';
  kit.stage.append(wrap);

  let round = 0, locked = false, running = false;

  function positionCar(p) { car.setAttribute('transform', `translate(${120 + 760 * p}, 700)`); }
  positionCar(0);

  function startRound() {
    caption.textContent = 'locked up. driving off.';
    sub.textContent = `round ${round + 1}`;
    lockBtn.style.display = 'none'; backBtn.style.display = 'none'; driveOnBtn.style.display = 'none'; lockItBtn.style.display = 'none';
    door.setAttribute('fill', '#0D3B2A');
    locked = true;
    running = true;
    const t0 = performance.now();
    kit.loop(() => {
      if (!running) return false;
      const p = Math.min(0.7, (performance.now() - t0) / DRIVE_MS);
      positionCar(p);
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
    const wasUnlocked = Math.random() < 0.2; // one time in five
    if (wasUnlocked) {
      door.setAttribute('fill', CLAY);
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
    door.setAttribute('fill', '#0D3B2A');
    caption.textContent = 'locked. now it counts.';
    lockItBtn.style.display = 'none';
    kit.after(600, () => kit.win('locked. every time, basically.'));
  });

  kit.on(driveOnBtn, 'click', () => {
    round++;
    driveOnBtn.style.display = 'none';
    const t0 = performance.now();
    running = true;
    kit.loop(() => {
      if (!running) return false;
      const p = Math.min(1, 0.7 + ((performance.now() - t0) / (DRIVE_MS * 0.3)) * 0.3);
      positionCar(p);
      if (p >= 1) { running = false; kit.after(400, startRound); return false; }
    });
  });

  kit.on(lockBtn, 'click', startRound);
  caption.textContent = 'lock up and drive off.';
}
