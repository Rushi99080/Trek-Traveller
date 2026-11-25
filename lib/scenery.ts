/**
 * Deterministic landscape shapes for the animated hero and scenes.
 * Same seed → same mountains on the server and in the browser.
 */

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
export type Pt = [number, number];
export interface Ridge {
  d: string;
  pts: Pt[];
  flats: { x0: number; x1: number; y: number }[];
}

function close(pts: Pt[], W: number, H: number) {
  return `M${pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join("L")}L${W + 60},${H}L-60,${H}Z`;
}

/** Sahyadri-style ridge: flat plateau tops and steep scarps */
export function plateauRidge(rand: () => number, W: number, H: number, base: number, amp: number): Ridge {
  const pts: Pt[] = [];
  const flats: Ridge["flats"] = [];
  let x = -60;
  let y = base - amp * (0.3 + rand() * 0.6);
  pts.push([x, y]);
  while (x < W + 60) {
    const flatLen = 110 + rand() * 260;
    const fx0 = x;
    for (let i = 0; i < 3; i++) {
      x += flatLen / 3;
      y += (rand() - 0.5) * 7;
      pts.push([x, y]);
    }
    flats.push({ x0: fx0, x1: x, y });
    let dy = (rand() < 0.5 ? -1 : 1) * amp * (0.25 + rand() * 0.5);
    if (y + dy > base) dy = -Math.abs(dy);
    if (y + dy < base - amp) dy = Math.abs(dy);
    x += 28 + rand() * 60;
    y += dy;
    pts.push([x + (rand() - 0.5) * 8, y]);
  }
  return { d: close(pts, W, H), pts, flats };
}

export function rollingRidge(rand: () => number, W: number, H: number, base: number, amp: number): Ridge {
  const pts: Pt[] = [];
  const p1 = rand() * 6, p2 = rand() * 6, f1 = 1.5 + rand() * 2, f2 = 4 + rand() * 4;
  for (let x = -60; x <= W + 60; x += 24) {
    const t = x / W;
    pts.push([x, base - amp * (0.5 + 0.3 * Math.sin(t * Math.PI * f1 + p1) + 0.15 * Math.sin(t * Math.PI * f2 + p2))]);
  }
  return { d: close(pts, W, H), pts, flats: [] };
}

export function yAt(pts: Pt[], x: number) {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] >= x) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
  }
  return pts[pts.length - 1][1];
}

/** A fort silhouette (bastions with battlements) sitting on a flat ridge top */
export function fortPath(flat: { x0: number; x1: number; y: number }, maxW = 240) {
  const w = Math.min(flat.x1 - flat.x0 - 20, maxW);
  const sx = flat.x0 + (flat.x1 - flat.x0 - w) / 2;
  const y = flat.y;
  const n = Math.max(3, Math.floor(w / 52));
  let d = `M${r1(sx)},${r1(y + 3)}`;
  for (let i = 0; i < n; i++) {
    const bx = sx + (w / n) * i;
    const bw = w / n;
    const h = i % 2 === 0 ? 24 : 14;
    d += `L${r1(bx)},${r1(y - h)}`;
    for (let m = 0; m < 3; m++) {
      const mx = bx + (bw / 3) * m;
      d += `L${r1(mx)},${r1(y - h - 5)}L${r1(mx + bw / 6)},${r1(y - h - 5)}L${r1(mx + bw / 6)},${r1(y - h)}`;
    }
    d += `L${r1(bx + bw)},${r1(y - h)}`;
  }
  d += `L${r1(sx + w)},${r1(y + 3)}Z`;
  return { d, flagX: sx + w * 0.62, flagY: y - 26 };
}

/** Wobbly closed contour loops around a centre, like a topo map */
export function contourLoops(seed: number, cx: number, cy: number, count: number, step: number) {
  const rand = rng(seed);
  const phases = [rand() * 6, rand() * 6, rand() * 6];
  const out: string[] = [];
  for (let k = 1; k <= count; k++) {
    const r = k * step;
    let d = "";
    for (let a = 0; a <= 360; a += 10) {
      const t = (a * Math.PI) / 180;
      const rr = r * (1 + 0.12 * Math.sin(3 * t + phases[0]) + 0.07 * Math.sin(5 * t + phases[1] + k * 0.3) + 0.04 * Math.sin(7 * t + phases[2]));
      const x = cx + rr * Math.cos(t);
      const y = cy + rr * Math.sin(t) * 0.8;
      d += `${a === 0 ? "M" : "L"}${r1(x)},${r1(y)}`;
    }
    out.push(d + "Z");
  }
  return out;
}
