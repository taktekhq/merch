// T02 — the spare key hoodie
// A front porch: doormat, plant pot, fake rock, above the frame, under the gnome. All empty.
// Then the neighbour's window opens: "it's with me."
import * as art from './_art.js';

export default function mount(kit) {
  const ink = art.INK, muted = art.MUTED, accent = art.ACCENT;
  const WALL = '#E4DCC8', FLOORY = 780;
  const head = art.heading(kit, 'the spare key was never spare.', 'check every hiding spot');

  const svg = kit.svg('svg', { viewBox: '0 0 1000 1000' });
  kit.stage.append(svg);
  const scenery = kit.svg('g');
  const caption = kit.svg('text', { x: 500, y: 232, 'text-anchor': 'middle', 'font-size': 19, fill: muted, 'font-family': 'var(--mono)' });
  svg.append(scenery, caption);

  const spots = [
    { id: 'mat', x: 435, y: 758, r: 80, line: 'just the mat.' },
    { id: 'pot', x: 190, y: 750, r: 85, line: 'just the plant.' },
    { id: 'rock', x: 760, y: 792, r: 65, line: 'a rock. a very fake rock.' },
    { id: 'frame', x: 435, y: 270, r: 60, line: 'nothing above the frame.' },
    { id: 'gnome', x: 300, y: 740, r: 75, line: 'the gnome has no pockets.' },
  ];
  const checked = new Set();

  let doorCtl, gnomeHat;
  function draw() {
    const g = [];
    const r = art.room(kit, { wall: WALL, floor: art.OAT, floorY: FLOORY });
    g.push(r.el);
    // porch steps
    g.push(mk('rect', { x: 320, y: FLOORY + 30, width: 260, height: 16, fill: art.shade(art.OAT, -0.12) }));
    g.push(mk('rect', { x: 300, y: FLOORY + 46, width: 300, height: 16, fill: art.shade(art.OAT, -0.2) }));
    // house shadow line + skirting already from room()
    // front door
    const door = art.door(kit, 350, 300, { w: 170, h: 410, color: art.SPRUCE, handleSide: 1 });
    g.push(door.el);
    doorCtl = door;
    // porch lamp beside the door: a small wall sconce with a warm glow
    g.push(mk('circle', { cx: 606, cy: 330, r: 46, fill: art.BUTTER, opacity: 0.18 }));
    g.push(mk('rect', { x: 598, y: 330, width: 16, height: 22, fill: art.shade(WALL, -0.25) }));
    g.push(mk('path', { d: 'M 590 300 Q 606 288 622 300 L 618 332 L 594 332 Z', fill: art.BUTTER, stroke: art.shade(art.BUTTER, -0.25), 'stroke-width': 3 }));
    g.push(mk('circle', { cx: 606, cy: 308, r: 7, fill: '#fff', opacity: 0.9 }));
    // doormat, textured
    g.push(mk('rect', { x: 365, y: FLOORY - 40, width: 140, height: 36, rx: 6, fill: art.shade(art.OAT, -0.14) }));
    for (let i = 0; i < 10; i++) g.push(mk('line', { x1: 372 + i * 13, y1: FLOORY - 36, x2: 372 + i * 13, y2: FLOORY - 8, stroke: art.shade(art.OAT, -0.3), 'stroke-width': 3, opacity: 0.45 }));
    // fake rock
    g.push(mk('ellipse', { cx: 760, cy: FLOORY + 10, rx: 54, ry: 30, fill: art.MUTED, opacity: 0.55 }));
    g.push(mk('ellipse', { cx: 744, cy: FLOORY - 2, rx: 20, ry: 10, fill: art.shade(art.MUTED, 0.2), opacity: 0.4 }));
    // plant pot
    const plantG = art.plant(kit, 190, FLOORY + 6, { scale: 1.15 });
    g.push(plantG);
    // gnome: small person-ish statue with a beard and pointy hat (kept well clear of the plant,
    // and in a colour that doesn't melt into the foliage)
    const gn = mk('g', { transform: `translate(300 ${FLOORY - 2})` });
    art.shadow(gn, 0, 6, 64);
    gn.append(mk('path', { d: 'M -26 0 L 26 0 L 20 -62 Q 0 -74 -20 -62 Z', fill: art.DUSTY })); // robe
    gn.append(mk('rect', { x: -10, y: -34, width: 20, height: 16, rx: 6, fill: art.CLAY })); // belt/hands area
    gn.append(mk('circle', { cx: 0, cy: -78, r: 20, fill: art.SKINS[0] })); // face
    gn.append(mk('path', { d: 'M -13 -68 Q 0 -50 13 -68 L 9 -48 Q 0 -42 -9 -48 Z', fill: '#F2EEE4' })); // beard
    gn.append(mk('path', { d: 'M -22 -88 L 22 -88 L 0 -132 Z', fill: '#C23B3B' })); // hat
    gn.append(mk('rect', { x: -25, y: -92, width: 50, height: 9, rx: 4, fill: '#A62F2F' })); // hat brim
    gn.append(mk('circle', { cx: -9, cy: -80, r: 3, fill: art.INK })); // eye
    gn.append(mk('circle', { cx: 9, cy: -80, r: 3, fill: art.INK })); // eye
    g.push(gn);
    gnomeHat = gn;

    // the neighbour's window, off to the right, closed
    const wx = 790, wy = 220, ww = 170, wh = 220;
    const winG = mk('g');
    winG.append(mk('rect', { x: wx, y: wy, width: ww, height: wh, rx: 8, fill: '#CFE6F2' }));
    winG.append(mk('rect', { x: wx, y: wy, width: ww, height: wh, rx: 8, fill: 'none', stroke: art.shade(WALL, -0.2), 'stroke-width': 8 }));
    winG.append(mk('line', { x1: wx + ww / 2, y1: wy, x2: wx + ww / 2, y2: wy + wh, stroke: art.shade(WALL, -0.2), 'stroke-width': 5 }));
    const curtain = mk('rect', { x: wx + 4, y: wy + 2, width: ww - 8, height: wh - 4, rx: 6, fill: art.SPRUCE });
    winG.append(curtain);
    const face = mk('circle', { cx: wx + ww / 2, cy: wy + wh * 0.42, r: 26, fill: art.SKINS[2], opacity: 0 });
    const hand = mk('g', { opacity: 0 });
    hand.append(mk('circle', { cx: wx + ww / 2 + 36, cy: wy + wh * 0.6, r: 14, fill: art.SKINS[2] }));
    hand.append(mk('line', { x1: wx + ww / 2 + 36, y1: wy + wh * 0.6 - 16, x2: wx + ww / 2 + 36, y2: wy + wh * 0.6 - 40, stroke: art.MUTED, 'stroke-width': 4, 'stroke-linecap': 'round' }));
    hand.append(mk('rect', { x: wx + ww / 2 + 30, y: wy + wh * 0.6 - 48, width: 12, height: 16, rx: 3, fill: art.BUTTER }));
    winG.append(face, hand);
    const bubble = mk('g', { opacity: 0 });
    bubble.append(mk('rect', { x: wx - 150, y: wy - 46, width: 150, height: 52, rx: 12, fill: '#fff', stroke: ink, 'stroke-width': 3 }));
    bubble.append(mk('text', { x: wx - 75, y: wy - 14, 'text-anchor': 'middle', 'font-size': 20, fill: ink, 'font-family': 'var(--display)' }));
    bubble.children[1].textContent = "it's with me.";
    winG.append(bubble);
    g.push(winG);
    neighbourWin = { winG, curtain, face, hand, bubble };
    return g;
  }
  let neighbourWin = null;

  scenery.replaceChildren(...draw());
  caption.textContent = 'find the spare key.';

  const layer = kit.svg('g');
  svg.append(layer);
  const nodes = {};
  for (const s of spots) {
    const g = kit.svg('g', { style: { cursor: 'pointer' } });
    g.append(kit.svg('circle', { cx: s.x, cy: s.y, r: s.r, fill: ink, opacity: 0.0001 }));
    layer.append(g);
    nodes[s.id] = g;
    kit.on(g, 'pointerdown', () => check(s));
  }

  function check(s) {
    if (!head._hidden) { head.hide(); head._hidden = true; }
    if (checked.has(s.id)) return;
    checked.add(s.id);
    nodes[s.id].style.opacity = 0.35;
    caption.textContent = s.line;
    kit.status(`${checked.size}/5 checked`);
    if (checked.size === spots.length) kit.after(500, reveal);
  }

  function reveal() {
    caption.textContent = 'huh.';
    const sk = neighbourWin;
    kit.after(500, () => {
      sk.curtain.setAttribute('width', (170 - 8) * 0.32);
      sk.face.setAttribute('opacity', 1);
      kit.after(300, () => { sk.hand.setAttribute('opacity', 1); });
      kit.after(900, () => { sk.bubble.setAttribute('opacity', 1); });
      kit.after(1800, () => {
        art.winBeat(kit, 'the spare key was never spare.');
        kit.after(1100, () => kit.win("it's with me."));
      });
    });
  }

  kit.status('0/5 checked');
  window.__sk = { checkAll: () => spots.forEach(check) }; // testing hook, harmless (see earned/README.md)
  function mk(tag, attrs) { return kit.svg(tag, attrs); }
}
