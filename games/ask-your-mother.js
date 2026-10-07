// T09 — ask your mother crewneck
// Ask dad: "ask your mother." Ask mum: "ask your father." Forever. The only way out: ask
// both at once (two fingers, or both keys together).
export default function mount(kit) {
  const ink = kit.colors.ink || '#0D0D0E';
  const accent = kit.colors.accent || '#00A862';
  const muted = kit.colors.muted || '#6B6A66';
  const SPRUCE = '#2F4F46', DUSTY = '#8FA6B8';
  const HOLD_MS = 150;

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: DUSTY, opacity: 0.12 }));

  function person(cx, fill) {
    const g = kit.svg('g');
    g.append(kit.svg('circle', { cx, cy: 330, r: 60, fill }));
    g.append(kit.svg('rect', { x: cx - 80, cy: 390, y: 410, width: 160, height: 220, rx: 40, fill }));
    return g;
  }
  svg.append(person(280, SPRUCE), person(720, '#C9764F'));
  const bubbleDad = kit.svg('text', { x: 280, y: 230, 'text-anchor': 'middle', 'font-size': 20, fill: ink, 'font-family': 'var(--display)', opacity: 0 });
  const bubbleMum = kit.svg('text', { x: 720, y: 230, 'text-anchor': 'middle', 'font-size': 20, fill: ink, 'font-family': 'var(--display)', opacity: 0 });
  svg.append(bubbleDad, bubbleMum);
  const caption = kit.svg('text', { x: 500, y: 650, 'text-anchor': 'middle', 'font-size': 24, fill: muted, 'font-family': 'var(--mono)' });
  svg.append(caption);
  const label = (cx, text) => kit.svg('text', { x: cx, y: 460, 'text-anchor': 'middle', 'font-size': 16, fill: '#fff', 'font-family': 'var(--mono)' }, text);
  svg.append(label(280, 'dad'), label(720, 'mum'));

  const askDad = kit.el('button', { class: 'g-btn solid', text: 'ask dad', style: { position: 'absolute', left: '20%', bottom: '8%', transform: 'translateX(-50%)' } });
  const askMum = kit.el('button', { class: 'g-btn solid', text: 'ask mum', style: { position: 'absolute', left: '80%', bottom: '8%', transform: 'translateX(-50%)' } });
  kit.stage.append(askDad, askMum);

  let dadDown = false, mumDown = false, dadSince = 0, mumSince = 0, asks = 0;

  const press = (which) => (e) => {
    e.preventDefault();
    if (which === 'dad') { dadDown = true; dadSince = performance.now(); bubbleDad.textContent = 'ask your mother.'; bubbleDad.setAttribute('opacity', 1); }
    else { mumDown = true; mumSince = performance.now(); bubbleMum.textContent = 'ask your father.'; bubbleMum.setAttribute('opacity', 1); }
    if (!dadDown || !mumDown) { asks++; if (asks > 2) caption.textContent = 'try asking them both. at once.'; }
  };
  const release = (which) => () => {
    if (which === 'dad') { dadDown = false; bubbleDad.setAttribute('opacity', 0); }
    else { mumDown = false; bubbleMum.setAttribute('opacity', 0); }
  };

  kit.on(askDad, 'pointerdown', press('dad'));
  kit.on(askMum, 'pointerdown', press('mum'));
  kit.on(askDad, 'pointerup', release('dad'));
  kit.on(askMum, 'pointerup', release('mum'));
  kit.on(askDad, 'pointerleave', release('dad'));
  kit.on(askMum, 'pointerleave', release('mum'));

  const keyDown = new Set();
  kit.on(window, 'keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'd') { if (!keyDown.has('d')) press('dad')(e); keyDown.add('d'); }
    if (k === 'm') { if (!keyDown.has('m')) press('mum')(e); keyDown.add('m'); }
  });
  kit.on(window, 'keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'd') { keyDown.delete('d'); release('dad')(); }
    if (k === 'm') { keyDown.delete('m'); release('mum')(); }
  });

  caption.textContent = 'ask one. then the other. forever.';

  kit.loop(() => {
    if (kit.won) return;
    if (dadDown && mumDown && performance.now() - Math.max(dadSince, mumSince) >= HOLD_MS) {
      kit.win('asked both. at once. done.');
    }
  });
}
