// T12 — just one more. playing cards
// A felt card table, higher-or-lower against the deck. Correct guesses bank up; "one more"
// keeps going, "i'm done" walks away with it — but only while you're up. The dealer's hands
// deal every card; a chip stack grows with the streak.
import * as art from './_art.js';

export default function mount(kit) {
  const INK = art.INK;
  const SUITS = [
    { s: '♠', col: INK, red: false }, { s: '♥', col: '#C23B3B', red: true },
    { s: '♦', col: '#C23B3B', red: true }, { s: '♣', col: INK, red: false },
  ];
  const head = art.heading(kit, 'just one more.', 'higher or lower — walk away while you\'re ahead');

  const freshDeck = () => {
    const d = [];
    for (const su of SUITS) for (let r = 1; r <= 13; r++) d.push({ r, su });
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
    return d;
  };
  const rankText = (r) => ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[r] || String(r));

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: art.SPRUCE }));
  // felt texture: a quiet dot weave
  const felt = kit.svg('g', { opacity: 0.08 });
  for (let y = 40; y < 1000; y += 34) for (let x = (y / 34) % 2 ? 20 : 40; x < 1000; x += 40) felt.append(kit.svg('circle', { cx: x, cy: y, r: 2, fill: '#fff' }));
  svg.append(felt);
  svg.append(kit.svg('rect', { x: 36, y: 36, width: 928, height: 928, rx: 44, fill: 'none', stroke: 'rgba(247,245,241,0.1)', 'stroke-width': 10 }));

  // deck stack, green backs with a quiet diamond pattern
  const deck3d = kit.svg('g', { transform: 'translate(190 520)' });
  for (let i = 0; i < 4; i++) {
    deck3d.append(kit.svg('rect', { x: -85 - i * 3, y: -120 - i * 3, width: 170, height: 240, rx: 16, fill: art.ACCENT, stroke: '#07351f', 'stroke-width': 4 }));
  }
  deck3d.append(kit.svg('rect', { x: -67, y: -100, width: 134, height: 200, rx: 10, fill: 'none', stroke: '#0f5a38', 'stroke-width': 4 }));
  for (let i = -2; i <= 2; i++) deck3d.append(kit.svg('path', { d: `M -50 ${i * 32} L 0 ${i * 32 - 20} L 50 ${i * 32} L 0 ${i * 32 + 20} Z`, fill: 'none', stroke: '#0f5a38', 'stroke-width': 2, opacity: 0.6 }));
  svg.append(deck3d);

  // dealer's hands, resting at the table edge beside the deck
  function hand(x, flip) {
    const g = kit.svg('g', { transform: `translate(${x} 700) scale(${flip ? -1 : 1} 1)` });
    g.append(kit.svg('path', { d: 'M -40 0 Q -46 -36 -10 -40 L 50 -36 Q 60 -10 40 10 Q 0 24 -40 0 Z', fill: art.SKINS[2] }));
    for (let i = 0; i < 4; i++) g.append(kit.svg('rect', { x: -4 + i * 13, y: -50, width: 10, height: 26, rx: 5, fill: art.SKINS[2] }));
    g.append(kit.svg('rect', { x: -44, y: -6, width: 50, height: 40, rx: 14, fill: '#3B4A58' }));
    return g;
  }
  svg.append(hand(150, false), hand(560, true));

  // current card
  const card = kit.svg('g', { transform: 'translate(560 260)' });
  card.append(kit.svg('rect', { x: 0, y: 0, width: 280, height: 380, rx: 22, fill: '#F7F5F1', stroke: INK, 'stroke-width': 6 }));
  const rankTop = kit.svg('text', { x: 26, y: 62, 'font-family': 'var(--display)', 'font-size': 48, 'font-weight': 700 });
  const suitTop = kit.svg('text', { x: 26, y: 104, 'font-family': 'var(--display)', 'font-size': 34 });
  const pipArea = kit.svg('g');
  const faceArt = kit.svg('g');
  card.append(rankTop, suitTop, pipArea, faceArt);
  svg.append(card);

  kit.stage.append(svg);

  // the chip stack, grows with the streak
  const chipStack = kit.svg('g', { transform: 'translate(190 820)' });
  svg.append(chipStack);

  const overlay = kit.el('div', {
    style: { position: 'absolute', left: '0', right: '0', bottom: '6%', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', padding: '0 6%' },
  });
  kit.stage.append(overlay);

  let deck = freshDeck();
  let current = deck.pop();
  let up = 0;
  let mode = 'guess'; // 'guess' | 'choose'
  let started = false;

  const PIP_LAYOUTS = {
    2: [[0, -1], [0, 1]], 3: [[0, -1], [0, 0], [0, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
    7: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1], [0, -0.5]],
    8: [[-1, -1], [1, -1], [-1, -0.33], [1, -0.33], [-1, 0.33], [1, 0.33], [-1, 1], [1, 1]],
    9: [[-1, -1], [1, -1], [-1, -0.33], [1, -0.33], [0, 0], [-1, 0.33], [1, 0.33], [-1, 1], [1, 1]],
    10: [[-1, -1], [1, -1], [-1, -0.5], [1, -0.5], [-0.5, 0], [0.5, 0], [-1, 0.5], [1, 0.5], [-1, 1], [1, 1]],
  };

  const renderCard = () => {
    const su = current.su;
    rankTop.textContent = rankText(current.r); rankTop.setAttribute('fill', su.col);
    suitTop.textContent = su.s; suitTop.setAttribute('fill', su.col);
    pipArea.replaceChildren();
    faceArt.replaceChildren();
    if (current.r === 1) {
      pipArea.append(kit.svg('text', { x: 140, y: 230, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-size': 150, fill: su.col, opacity: 0.9 }, su.s));
    } else if (current.r <= 10) {
      const layout = PIP_LAYOUTS[current.r];
      for (const [px, py] of layout) {
        pipArea.append(kit.svg('text', { x: 140 + px * 70, y: 190 + py * 120, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-size': 34, fill: su.col }, su.s));
      }
    } else {
      // face card: a simple drawn portrait, suit-coloured accents
      const names = { 11: 'J', 12: 'Q', 13: 'K' };
      faceArt.append(kit.svg('rect', { x: 46, y: 90, width: 188, height: 260, rx: 10, fill: 'none', stroke: su.col, 'stroke-width': 3, opacity: 0.5 }));
      faceArt.append(kit.svg('circle', { cx: 140, cy: 180, r: 42, fill: art.SKINS[1] }));
      faceArt.append(kit.svg('rect', { x: 100, y: 212, width: 80, height: 90, rx: 18, fill: su.col }));
      if (current.r === 13) faceArt.append(kit.svg('path', { d: 'M 104 160 L 116 130 L 132 152 L 148 128 L 164 152 L 176 130 L 188 160 Z', fill: art.BUTTER }));
      else if (current.r === 12) faceArt.append(kit.svg('path', { d: 'M 100 150 Q 140 110 180 150', fill: 'none', stroke: art.BUTTER, 'stroke-width': 10, 'stroke-linecap': 'round' }));
      else faceArt.append(kit.svg('path', { d: 'M 108 150 L 172 150 L 158 118 Z', fill: art.DUSTY }));
      faceArt.append(kit.svg('text', { x: 140, y: 400, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-size': 26, fill: su.col, 'font-weight': 700 }, names[current.r] + ' ' + su.s));
    }
  };

  const drawChips = () => {
    chipStack.replaceChildren();
    const n = Math.min(up, 10);
    for (let i = 0; i < n; i++) {
      chipStack.append(kit.svg('ellipse', { cx: 0, cy: -i * 9, rx: 46, ry: 14, fill: i % 2 ? art.CLAY : art.BUTTER, stroke: INK, 'stroke-width': 3 }));
    }
    if (n > 0) chipStack.append(kit.svg('text', { x: 0, y: -n * 9 - 20, 'text-anchor': 'middle', 'font-size': 18, fill: '#fff', 'font-family': 'var(--mono)' }, `up ${up}`));
  };

  const btn = (text, onclick, solid) => kit.el('button', { class: solid ? 'g-btn solid' : 'g-btn', text, onclick });

  const renderControls = () => {
    overlay.replaceChildren();
    if (mode === 'guess') {
      overlay.append(
        btn('Higher', () => guess('higher')),
        btn('Lower', () => guess('lower')),
      );
    } else {
      overlay.append(
        btn('One more', () => { mode = 'guess'; renderControls(); }, true),
        btn("I'm done", () => {
          if (up > 0) {
            kit.after(300, () => {
              art.winBeat(kit, 'just one more.');
              kit.after(1100, () => kit.win("walked away. it's yours."));
            });
          }
        }),
      );
    }
  };

  const guess = (dir) => {
    if (!started) { started = true; head.hide(); }
    if (deck.length === 0) deck = freshDeck();
    const next = deck.pop();
    if (next.r === current.r) { current = next; renderCard(); kit.status('push. same card. go again.'); return; }
    const correct = dir === 'higher' ? next.r > current.r : next.r < current.r;
    current = next;
    renderCard();
    if (correct) {
      up++;
      drawChips();
      kit.status(`up ${up}`);
      mode = 'choose';
      renderControls();
    } else {
      up = 0;
      drawChips();
      kit.status("that's the one that got you. new deck.");
      deck = freshDeck();
      current = deck.pop();
      renderCard();
      mode = 'guess';
      renderControls();
    }
  };

  renderCard();
  drawChips();
  kit.status('higher or lower?');
  renderControls();

  window.__jom = { bank: () => { up = 3; drawChips(); mode = 'choose'; renderControls(); const b = [...overlay.querySelectorAll('button')].find((x) => x.textContent === "I'm done"); b?.click(); } };
}
