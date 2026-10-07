// just one more. — a card table, higher-or-lower against the deck.
// Correct guesses bank up; "one more" keeps going, "i'm done" walks away with it —
// but only while you're up. Lose a guess and the streak (and the deck) resets.
export default function mount(kit) {
  const SPRUCE = '#2F4F46', GREEN = kit.colors.accent || '#00A862', INK = '#0D0D0E';
  const SUITS = ['♠', '♥', '♦', '♣'];

  const freshDeck = () => {
    const d = [];
    for (const s of SUITS) for (let r = 1; r <= 13; r++) d.push({ r, s });
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
    return d;
  };
  const rankText = (r) => ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[r] || String(r));

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  svg.append(kit.svg('rect', { x: 0, y: 0, width: 1000, height: 1000, fill: SPRUCE }));
  svg.append(kit.svg('rect', { x: 40, y: 40, width: 920, height: 920, rx: 40, fill: 'none', stroke: 'rgba(247,245,241,0.08)', 'stroke-width': 10 }));

  // deck stack, green backs
  const deck3d = kit.svg('g');
  for (let i = 0; i < 3; i++) {
    deck3d.append(kit.svg('rect', { x: 130 - i * 4, y: 420 - i * 4, width: 170, height: 240, rx: 16, fill: GREEN, stroke: '#07351f', 'stroke-width': 4 }));
  }
  deck3d.append(kit.svg('rect', { x: 148, y: 440, width: 134, height: 200, rx: 10, fill: 'none', stroke: '#0f5a38', 'stroke-width': 4 }));
  svg.append(deck3d);

  // current card
  const card = kit.svg('g', { transform: 'translate(560 300)' });
  card.append(kit.svg('rect', { x: 0, y: 0, width: 260, height: 360, rx: 22, fill: '#F7F5F1', stroke: INK, 'stroke-width': 6 }));
  const rankTop = kit.svg('text', { x: 28, y: 64, 'font-family': 'var(--display)', 'font-size': 52, 'font-weight': 700, fill: INK });
  const suitTop = kit.svg('text', { x: 28, y: 108, 'font-family': 'var(--display)', 'font-size': 36, fill: INK });
  const suitBig = kit.svg('text', { x: 130, y: 240, 'text-anchor': 'middle', 'font-family': 'var(--display)', 'font-size': 150, fill: INK, opacity: 0.85 });
  card.append(rankTop, suitTop, suitBig);
  svg.append(card);

  kit.stage.append(svg);

  const overlay = kit.el('div', {
    style: { position: 'absolute', left: '0', right: '0', bottom: '6%', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', padding: '0 6%' },
  });
  kit.stage.append(overlay);

  let deck = freshDeck();
  let current = deck.pop();
  let up = 0;
  let mode = 'guess'; // 'guess' | 'choose'

  const renderCard = () => {
    rankTop.textContent = rankText(current.r);
    suitTop.textContent = current.s;
    suitBig.textContent = current.s;
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
        btn("I'm done", () => { if (up > 0) kit.win("walked away. it's yours."); }),
      );
    }
  };

  const guess = (dir) => {
    if (deck.length === 0) deck = freshDeck();
    const next = deck.pop();
    if (next.r === current.r) { current = next; renderCard(); kit.status('push. same card. go again.'); return; }
    const correct = dir === 'higher' ? next.r > current.r : next.r < current.r;
    current = next;
    renderCard();
    if (correct) {
      up++;
      kit.status(`up ${up}`);
      mode = 'choose';
      renderControls();
    } else {
      up = 0;
      kit.status("that's the one that got you. new deck.");
      deck = freshDeck();
      current = deck.pop();
      renderCard();
      mode = 'guess';
      renderControls();
    }
  };

  renderCard();
  kit.status('higher or lower?');
  renderControls();
}
