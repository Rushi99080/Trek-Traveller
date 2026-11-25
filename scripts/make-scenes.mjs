// Generates lightweight placeholder landscape illustrations (SVG)
// for the sample trips. Replace them with real photos from the Admin panel.
// Run: node scripts/make-scenes.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../public/images/trips/", import.meta.url);
mkdirSync(OUT, { recursive: true });

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n) => Math.round(n * 10) / 10;

/** Sahyadri-style ridge: flat plateau tops with steep scarps */
function plateauRidge(rand, W, H, base, amp) {
  const pts = [];
  const flats = [];
  let x = -40;
  let y = base - amp * (0.3 + rand() * 0.6);
  pts.push([x, y]);
  while (x < W + 40) {
    const flatLen = 90 + rand() * 230;
    const fx0 = x;
    for (let i = 0; i < 3; i++) {
      x += flatLen / 3;
      y += (rand() - 0.5) * 6;
      pts.push([x, y]);
    }
    flats.push({ x0: fx0, x1: x, y });
    const slope = 25 + rand() * 60;
    let dy = (rand() < 0.5 ? -1 : 1) * (amp * (0.25 + rand() * 0.5));
    if (y + dy > base) dy = -Math.abs(dy);
    if (y + dy < base - amp) dy = Math.abs(dy);
    x += slope;
    y += dy;
    pts.push([x + (rand() - 0.5) * 8, y]);
  }
  return { d: closePath(pts, W, H), flats, pts };
}

/** Smooth rolling hills */
function rollingRidge(rand, W, H, base, amp) {
  const pts = [];
  const p1 = rand() * 6, p2 = rand() * 6, f1 = 1.5 + rand() * 2, f2 = 4 + rand() * 4;
  for (let x = -40; x <= W + 40; x += 20) {
    const t = x / W;
    const y = base - amp * (0.5 + 0.3 * Math.sin(t * Math.PI * f1 + p1) + 0.15 * Math.sin(t * Math.PI * f2 + p2));
    pts.push([x, y]);
  }
  return { d: closePath(pts, W, H), pts, flats: [] };
}

/** Sharp Himalayan peaks */
function peakRidge(rand, W, H, base, amp, count = 4) {
  const pts = [[-40, base - amp * 0.2]];
  const peaks = [];
  const step = (W + 80) / count;
  for (let i = 0; i < count; i++) {
    const px = -40 + step * i + step * (0.35 + rand() * 0.3);
    const py = base - amp * (0.55 + rand() * 0.45);
    const vx = -40 + step * (i + 1);
    const vy = base - amp * (0.1 + rand() * 0.25);
    // jagged approach
    const prev = pts[pts.length - 1];
    for (let k = 1; k < 4; k++) {
      const t = k / 4;
      pts.push([prev[0] + (px - prev[0]) * t, prev[1] + (py - prev[1]) * t + (rand() - 0.5) * 18]);
    }
    pts.push([px, py]);
    peaks.push([px, py]);
    for (let k = 1; k < 4; k++) {
      const t = k / 4;
      pts.push([px + (vx - px) * t, py + (vy - py) * t + (rand() - 0.5) * 18]);
    }
    pts.push([vx, vy]);
  }
  return { d: closePath(pts, W, H), peaks, pts, flats: [] };
}

function closePath(pts, W, H) {
  return `M${pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join("L")}L${W + 40},${H}L-40,${H}Z`;
}

function yAt(pts, x) {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] >= x) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
  }
  return pts[pts.length - 1][1];
}

// ---------- features ----------
function fort(flat, color) {
  const { x0, x1, y } = flat;
  const w = Math.min(x1 - x0 - 20, 260);
  const sx = x0 + (x1 - x0 - w) / 2;
  let d = `M${r1(sx)},${r1(y + 2)}`;
  const n = Math.max(3, Math.floor(w / 55));
  for (let i = 0; i < n; i++) {
    const bx = sx + (w / n) * i;
    const bw = w / n;
    const h = i % 2 === 0 ? 22 : 13;
    // bastion with merlons
    d += `L${r1(bx)},${r1(y - h)}`;
    for (let m = 0; m < 3; m++) {
      const mx = bx + (bw / 3) * m;
      d += `L${r1(mx)},${r1(y - h - 4)}L${r1(mx + bw / 6)},${r1(y - h - 4)}L${r1(mx + bw / 6)},${r1(y - h)}`;
    }
    d += `L${r1(bx + bw)},${r1(y - h)}`;
  }
  d += `L${r1(sx + w)},${r1(y + 2)}Z`;
  // flag
  const fx = sx + w * 0.62;
  return `<path d="${d}" fill="${color}"/><path d="M${r1(fx)},${r1(y - 26)}V${r1(y - 58)}" stroke="${color}" stroke-width="2"/><path d="M${r1(fx)},${r1(y - 58)}L${r1(fx + 20)},${r1(y - 52)}L${r1(fx)},${r1(y - 46)}Z" fill="#EE6A1F"/>`;
}

function hikers(pts, startX, n, color, scale = 1) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = startX + i * 22 * scale;
    const y = yAt(pts, x);
    const h = (16 + (i % 3) * 2) * scale;
    s += `<g fill="${color}"><circle cx="${r1(x)}" cy="${r1(y - h - 4 * scale)}" r="${r1(3.6 * scale)}"/><rect x="${r1(x - 3 * scale)}" y="${r1(y - h)}" width="${r1(6 * scale)}" height="${r1(h)}" rx="${r1(2 * scale)}"/><rect x="${r1(x - 7 * scale)}" y="${r1(y - h + 1)}" width="${r1(5 * scale)}" height="${r1(8 * scale)}" rx="${r1(1.5 * scale)}"/><path d="M${r1(x + 4 * scale)},${r1(y - h + 2)}L${r1(x + 9 * scale)},${r1(y)}" stroke="${color}" stroke-width="${r1(1.4 * scale)}"/></g>`;
  }
  return s;
}

function canopy(rand, pts, W, color, size = 26, density = 1) {
  let s = "";
  for (let x = -20; x < W + 20; x += (size * 0.9) / density) {
    const y = yAt(pts, x);
    const rr = size * (0.6 + rand() * 0.6);
    s += `<circle cx="${r1(x + (rand() - 0.5) * 10)}" cy="${r1(y + rr * 0.3)}" r="${r1(rr)}" fill="${color}"/>`;
  }
  return s;
}

function pines(rand, pts, W, color, size = 40, every = 34) {
  let s = "";
  for (let x = -10; x < W + 10; x += every * (0.6 + rand() * 0.8)) {
    const y = yAt(pts, x) + 6;
    const h = size * (0.6 + rand() * 0.7);
    const w = h * 0.38;
    s += `<path d="M${r1(x)},${r1(y - h)}L${r1(x + w * 0.6)},${r1(y - h * 0.55)}L${r1(x + w * 0.35)},${r1(y - h * 0.55)}L${r1(x + w)},${r1(y)}L${r1(x - w)},${r1(y)}L${r1(x - w * 0.35)},${r1(y - h * 0.55)}L${r1(x - w * 0.6)},${r1(y - h * 0.55)}Z" fill="${color}"/>`;
  }
  return s;
}

function stars(rand, W, H, n) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const r = rand() < 0.1 ? 1.8 : 0.9 + rand() * 0.6;
    s += `<circle cx="${r1(rand() * W)}" cy="${r1(rand() * H * 0.55)}" r="${r1(r)}" fill="#fff" opacity="${r1(0.4 + rand() * 0.6)}"/>`;
  }
  return s;
}

function mist(rand, W, y, n, opacity = 0.35) {
  let s = "";
  for (let i = 0; i < n; i++) {
    s += `<ellipse cx="${r1(rand() * W)}" cy="${r1(y + (rand() - 0.5) * 40)}" rx="${r1(160 + rand() * 220)}" ry="${r1(14 + rand() * 16)}" fill="#fff" opacity="${opacity}" filter="url(#blur)"/>`;
  }
  return s;
}

function tents(list) {
  return list
    .map(([x, y, w, c]) => {
      const h = w * 0.72;
      return `<path d="M${r1(x - w / 2)},${r1(y)}L${r1(x)},${r1(y - h)}L${r1(x + w / 2)},${r1(y)}Z" fill="${c}"/><path d="M${r1(x - w * 0.12)},${r1(y)}L${r1(x)},${r1(y - h * 0.55)}L${r1(x + w * 0.12)},${r1(y)}Z" fill="#1d1a24" opacity=".75"/>`;
    })
    .join("");
}

function palm(x, y, h, color, lean = 1) {
  const tx = x + lean * h * 0.25;
  const ty = y - h;
  let s = `<path d="M${r1(x)},${r1(y)}Q${r1(x + lean * h * 0.05)},${r1(y - h * 0.6)} ${r1(tx)},${r1(ty)}" stroke="${color}" stroke-width="${r1(h * 0.05)}" fill="none" stroke-linecap="round"/>`;
  const fronds = [[-1, 0.2], [-0.7, -0.35], [0, -0.5], [0.7, -0.35], [1, 0.2], [0.45, 0.35], [-0.45, 0.35]];
  for (const [dx, dy] of fronds) {
    const ex = tx + dx * h * 0.42;
    const ey = ty + dy * h * 0.3 + h * 0.08;
    s += `<path d="M${r1(tx)},${r1(ty)}Q${r1(tx + dx * h * 0.25)},${r1(ty - h * 0.12)} ${r1(ex)},${r1(ey)}" stroke="${color}" stroke-width="${r1(h * 0.035)}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}

// ---------- scene builder ----------
function svg(W, H, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}<filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="10"/></filter></defs>${body}</svg>`;
}
function sky(stops) {
  return `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${stops
    .map((c, i) => `<stop offset="${r1((i / (stops.length - 1)) * 100)}%" stop-color="${c}"/>`)
    .join("")}</linearGradient>`;
}
function glow(id, color) {
  return `<radialGradient id="${id}"><stop offset="0%" stop-color="${color}" stop-opacity=".9"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
}

const PALETTES = {
  dawn: { sky: ["#7FA6C2", "#E9C2A6", "#F6A56C"], sun: "#FFE3B0", ridges: ["#B7A4B2", "#8E869C", "#57707A", "#2E5243", "#173426"], hiker: "#10241A" },
  monsoon: { sky: ["#8FA6A8", "#C9D5CF", "#E4E9E2"], sun: null, ridges: ["#A9BDB2", "#7E9F8A", "#4F7B5D", "#2D5B3F", "#173A27"], hiker: "#0F2619" },
  sunset: { sky: ["#3A4774", "#B9647A", "#F2934F", "#F9C26B"], sun: "#FFD58A", ridges: ["#8E6278", "#674A66", "#433A57", "#2A2A3C", "#17192A"], hiker: "#0E0F1A" },
  night: { sky: ["#0A1426", "#1A2F52", "#34507A"], sun: null, ridges: ["#2D4466", "#22385A", "#1A2C47", "#122036", "#0B1525"], hiker: "#060B14" },
  golden: { sky: ["#9EC3D3", "#F1D7A8", "#EBA45E"], sun: "#FFE8B8", ridges: ["#D6A77C", "#C08457", "#9C6440", "#764A2F", "#4E311F"], hiker: "#2C1C12" },
  beach: { sky: ["#6FA9C9", "#C6DEE3", "#F7D9A6"], sun: "#FFF1C9", ridges: ["#7E9C8C", "#4E7660", "#2C5541"], hiker: "#173126" },
  beachSunset: { sky: ["#41466F", "#C56B6E", "#F59B56", "#FBD07A"], sun: "#FFE1A0", ridges: ["#6B4B5E", "#45364B", "#2A2335"], hiker: "#120E18" },
  snow: { sky: ["#4E80B5", "#9CC0DE", "#DCEAF4"], sun: "#FFFFFF", ridges: ["#C8D6E4", "#AFC2D6", "#1F3D33", "#16302A"], hiker: "#0E1F1A" },
  snowDawn: { sky: ["#46557E", "#C9A2B4", "#F6C9A0"], sun: "#FFE9C8", ridges: ["#C9B9CB", "#A99EB6", "#23383A", "#152826"], hiker: "#0B1516" },
};

function sahyadri(seed, pal, opts = {}) {
  const W = opts.W || 1200, H = opts.H || 800;
  const rand = rng(seed);
  const P = PALETTES[pal];
  let defs = sky(P.sky) + glow("sunglow", P.sun || "#fff") + glow("fire", "#FF9A3C");
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  if (pal === "night") {
    b += stars(rand, W, H, 140);
    b += `<circle cx="${W * 0.78}" cy="${H * 0.18}" r="34" fill="#F4EFD8"/><circle cx="${W * 0.78 + 13}" cy="${H * 0.18 - 8}" r="30" fill="#1A2F52"/>`;
  } else if (P.sun) {
    const sx = W * (opts.sunX ?? 0.68), sy = H * (opts.sunY ?? 0.46);
    b += `<circle cx="${sx}" cy="${sy}" r="${H * 0.28}" fill="url(#sunglow)" opacity=".7"/><circle cx="${sx}" cy="${sy}" r="${H * 0.06}" fill="${P.sun}"/>`;
  }
  const n = P.ridges.length;
  const layers = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = H * (0.5 + t * 0.42);
    const amp = H * (0.16 + t * 0.12);
    const ridge = opts.rolling && i >= n - 2 ? rollingRidge(rand, W, H, base, amp * 0.6) : plateauRidge(rand, W, H, base, amp);
    layers.push(ridge);
    b += `<path d="${ridge.d}" fill="${P.ridges[i]}"/>`;
    if (opts.mist && i === 1) b += mist(rand, W, base - amp * 0.1, 6);
    if (opts.mist && i === 2) b += mist(rand, W, base, 4, 0.25);
    if (opts.fort && i === (opts.fortLayer ?? 2)) {
      const flats = ridge.flats.filter((f) => f.x0 > W * 0.15 && f.x1 < W * 0.95 && f.x1 - f.x0 > 140);
      const fl = flats.sort((a, c) => a.y - c.y)[0] || ridge.flats[2];
      b += fort(fl, P.ridges[i]);
    }
    if (opts.waterfall && i === 2) {
      const x = W * 0.42;
      const y = yAt(ridge.pts, x);
      b += `<path d="M${x},${r1(y + 4)}C${x + 6},${r1(y + 60)} ${x - 6},${r1(y + 120)} ${x + 4},${r1(y + 200)}" stroke="#fff" stroke-width="9" opacity=".75" fill="none" stroke-linecap="round"/><path d="M${x + 8},${r1(y + 10)}C${x + 12},${r1(y + 80)} ${x + 2},${r1(y + 130)} ${x + 10},${r1(y + 190)}" stroke="#fff" stroke-width="4" opacity=".5" fill="none" stroke-linecap="round"/>`;
    }
  }
  const near = layers[n - 1];
  if (opts.forest) b += canopy(rand, near.pts, W, P.ridges[n - 1], 30, 1.2) + canopy(rand, layers[n - 2].pts, W, P.ridges[n - 2], 18);
  if (opts.trail) {
    // headlamp trail zig-zag up the second-nearest layer
    const L = layers[n - 2];
    let s = "";
    for (let k = 0; k < 16; k++) {
      const t = k / 15;
      const x = W * 0.2 + (k % 2 ? 60 : -10) + t * W * 0.35;
      const y = yAt(L.pts, x) + (1 - t) * 160 + 20;
      s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="9" fill="url(#fire)"/><circle cx="${r1(x)}" cy="${r1(y)}" r="2.4" fill="#FFE2A8"/>`;
    }
    b += s;
  }
  if (opts.hikers) b += hikers(near.pts, W * (opts.hikerX ?? 0.12), opts.hikers, P.hiker, opts.hikerScale ?? 1.6);
  return svg(W, H, defs, b);
}

function lakeCamp(seed, pal) {
  const W = 1200, H = 800, rand = rng(seed);
  const P = PALETTES[pal];
  const night = pal === "night";
  let defs = sky(P.sky) + glow("sunglow", P.sun || "#fff") + glow("fire", "#FF8A2A") +
    `<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${P.sky[P.sky.length - 1]}" stop-opacity=".9"/><stop offset="100%" stop-color="${P.ridges[2]}"/></linearGradient>`;
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  if (night) b += stars(rand, W, H, 160);
  else if (P.sun) b += `<circle cx="${W * 0.3}" cy="${H * 0.42}" r="220" fill="url(#sunglow)" opacity=".6"/><circle cx="${W * 0.3}" cy="${H * 0.42}" r="44" fill="${P.sun}"/>`;
  const far = plateauRidge(rand, W, H, H * 0.55, H * 0.2);
  const mid = plateauRidge(rand, W, H, H * 0.58, H * 0.12);
  b += `<path d="${far.d}" fill="${P.ridges[0]}"/>`;
  const fl = far.flats.filter((f) => f.x1 - f.x0 > 140 && f.x0 > 600)[0];
  if (fl) b += fort(fl, P.ridges[0]);
  b += `<path d="${mid.d}" fill="${P.ridges[1]}"/>`;
  b += `<rect y="${H * 0.58}" width="${W}" height="${H * 0.42}" fill="url(#water)"/>`;
  for (let i = 0; i < 18; i++) {
    const y = H * 0.6 + rand() * H * 0.18;
    b += `<rect x="${r1(rand() * W)}" y="${r1(y)}" width="${r1(40 + rand() * 120)}" height="2" rx="1" fill="#fff" opacity="${r1(0.15 + rand() * 0.25)}"/>`;
  }
  // near shore
  const shore = rollingRidge(rand, W, H, H * 0.98, H * 0.2);
  b += `<path d="${shore.d}" fill="${P.ridges[P.ridges.length - 1]}"/>`;
  const tc = night ? ["#F28C3A", "#E6B347", "#F28C3A", "#D86A2C"] : ["#EE6A1F", "#F2B33D", "#2F6E4C", "#EE6A1F"];
  const list = [[W * 0.58, 0, 70, tc[0]], [W * 0.68, 0, 82, tc[1]], [W * 0.8, 0, 74, tc[2]], [W * 0.9, 0, 64, tc[3]]].map(([x, , w, c]) => [x, yAt(shore.pts, x) + 6, w, c]);
  b += tents(list);
  const fx = W * 0.47, fy = yAt(shore.pts, W * 0.47) + 8;
  b += `<circle cx="${fx}" cy="${fy - 10}" r="${night ? 90 : 50}" fill="url(#fire)"/><path d="M${fx - 10},${fy}L${fx},${fy - 26}L${fx + 10},${fy}Z" fill="#FFB347"/>`;
  b += hikers(shore.pts, W * 0.3, 4, P.hiker, 1.8);
  return svg(W, H, defs, b);
}

function hampi(seed, pal) {
  const W = 1200, H = 800, rand = rng(seed);
  const P = PALETTES[pal];
  let defs = sky(P.sky) + glow("sunglow", P.sun);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="${W * 0.72}" cy="${H * 0.4}" r="240" fill="url(#sunglow)" opacity=".7"/><circle cx="${W * 0.72}" cy="${H * 0.4}" r="46" fill="${P.sun}"/>`;
  const far = rollingRidge(rand, W, H, H * 0.62, H * 0.14);
  b += `<path d="${far.d}" fill="${P.ridges[0]}"/>`;
  // gopuram
  const gx = W * 0.3, gy = yAt(far.pts, W * 0.3) + 4;
  let gp = "";
  const tiers = 7;
  for (let i = 0; i < tiers; i++) {
    const w = 130 - i * 15, h = 22;
    gp += `<rect x="${r1(gx - w / 2)}" y="${r1(gy - (i + 1) * h)}" width="${r1(w)}" height="${h + 1}" fill="${P.ridges[2]}"/>`;
  }
  gp += `<path d="M${gx - 24},${gy - tiers * 22}Q${gx},${gy - tiers * 22 - 40} ${gx + 24},${gy - tiers * 22}Z" fill="${P.ridges[2]}"/><rect x="${gx - 2}" y="${gy - tiers * 22 - 58}" width="4" height="20" fill="${P.ridges[2]}"/>`;
  b += gp;
  // boulder piles
  for (let layer = 1; layer < P.ridges.length; layer++) {
    const baseY = H * (0.62 + layer * 0.08);
    const c = P.ridges[layer];
    for (let i = 0; i < 9; i++) {
      const cx = rand() * W, rx = 40 + rand() * 90 * (layer / 2 + 0.5), ry = rx * (0.6 + rand() * 0.3);
      b += `<ellipse cx="${r1(cx)}" cy="${r1(baseY - ry * 0.4)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${c}"/>`;
      if (rand() < 0.6) b += `<ellipse cx="${r1(cx + (rand() - 0.5) * rx)}" cy="${r1(baseY - ry * 1.2)}" rx="${r1(rx * 0.55)}" ry="${r1(ry * 0.5)}" fill="${c}"/>`;
    }
    b += `<rect y="${r1(baseY)}" width="${W}" height="${r1(H - baseY)}" fill="${c}"/>`;
  }
  const groundPts = [[-40, H * 0.95], [W + 40, H * 0.95]];
  b += hikers(groundPts, W * 0.56, 5, P.hiker, 2.2);
  return svg(W, H, defs, b);
}

function beach(seed, pal) {
  const W = 1200, H = 800, rand = rng(seed);
  const P = PALETTES[pal];
  let defs = sky(P.sky) + glow("sunglow", P.sun) +
    `<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${pal === "beach" ? "#3B8EA0" : "#7A4E6A"}"/><stop offset="100%" stop-color="${pal === "beach" ? "#1F6273" : "#3A2C46"}"/></linearGradient>`;
  const hz = H * 0.56;
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="${W * 0.5}" cy="${hz - 30}" r="260" fill="url(#sunglow)" opacity=".8"/><circle cx="${W * 0.5}" cy="${hz - 30}" r="48" fill="${P.sun}"/>`;
  b += `<rect y="${hz}" width="${W}" height="${H - hz}" fill="url(#sea)"/>`;
  for (let i = 0; i < 16; i++) {
    const w = 120 - i * 6;
    b += `<rect x="${r1(W * 0.5 - w / 2 + (rand() - 0.5) * 20)}" y="${r1(hz + 6 + i * 10)}" width="${r1(w)}" height="3" rx="1.5" fill="${P.sun}" opacity="${r1(0.7 - i * 0.04)}"/>`;
  }
  // headland cliffs
  b += `<path d="M${W * 0.62},${hz}L${W * 0.7},${hz - 70}L${W * 0.8},${hz - 110}L${W * 0.92},${hz - 140}L${W + 40},${hz - 150}L${W + 40},${H * 0.8}L${W * 0.75},${H * 0.75}Z" fill="${P.ridges[1]}"/>`;
  b += `<path d="M-40,${hz - 90}L${W * 0.08},${hz - 80}L${W * 0.2},${hz - 30}L${W * 0.26},${hz + 10}L${W * 0.1},${H * 0.7}L-40,${H * 0.72}Z" fill="${P.ridges[0]}"/>`;
  // beach crescent
  b += `<path d="M-40,${H}L-40,${H * 0.8}Q${W * 0.45},${H * 0.66} ${W + 40},${H * 0.78}L${W + 40},${H}Z" fill="${pal === "beach" ? "#E7CB9B" : "#B98A72"}"/>`;
  b += `<path d="M-40,${H * 0.8}Q${W * 0.45},${H * 0.66} ${W + 40},${H * 0.78}" stroke="#fff" stroke-width="4" opacity=".6" fill="none"/>`;
  b += palm(W * 0.88, H * 0.92, 300, P.ridges[2], -1) + palm(W * 0.96, H * 0.96, 240, P.ridges[2], -1) + palm(W * 0.06, H * 0.95, 260, P.ridges[2], 1);
  b += hikers([[-40, H * 0.86], [W + 40, H * 0.82]], W * 0.34, 5, P.hiker, 2);
  return svg(W, H, defs, b);
}

function snow(seed, pal, withHikers = 0) {
  const W = 1200, H = 800, rand = rng(seed);
  const P = PALETTES[pal];
  let defs = sky(P.sky) + glow("sunglow", P.sun);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  if (pal === "snowDawn") b += `<circle cx="${W * 0.2}" cy="${H * 0.36}" r="220" fill="url(#sunglow)" opacity=".7"/>`;
  const far = peakRidge(rand, W, H, H * 0.66, H * 0.46, 4);
  b += `<path d="${far.d}" fill="${P.ridges[1]}"/>`;
  // snow caps on far peaks
  for (const [px, py] of far.peaks) {
    const d = 70 + rand() * 50;
    b += `<path d="M${r1(px)},${r1(py)}L${r1(px + d)},${r1(py + d * 1.1)}L${r1(px + d * 0.55)},${r1(py + d * 0.85)}L${r1(px + d * 0.2)},${r1(py + d * 1.15)}L${r1(px - d * 0.15)},${r1(py + d * 0.8)}L${r1(px - d * 0.5)},${r1(py + d * 1.05)}L${r1(px - d * 0.9)},${r1(py + d * 1.0)}Z" fill="${P.ridges[0]}"/>`;
    b += `<path d="M${r1(px)},${r1(py)}L${r1(px + d)},${r1(py + d * 1.1)}L${r1(px + d * 0.55)},${r1(py + d * 0.85)}L${r1(px + d * 0.3)},${r1(py + d)}Z" fill="#fff" opacity=".55"/>`;
  }
  b += mist(rand, W, H * 0.66, 5, 0.3);
  // snowy slope foreground
  const slope = rollingRidge(rand, W, H, H * 0.98, H * 0.22);
  b += `<path d="${slope.d}" fill="#F4F8FB"/>`;
  const forestLine = rollingRidge(rand, W, H, H * 0.86, H * 0.12);
  b += pines(rand, forestLine.pts, W, P.ridges[2], 70, 30);
  b += `<path d="M-40,${H}L-40,${H * 0.9}Q${W * 0.5},${H * 0.8} ${W + 40},${H * 0.92}L${W + 40},${H}Z" fill="#FFFFFF"/>`;
  if (withHikers) b += hikers([[-40, H * 0.9], [W * 0.5, H * 0.845], [W + 40, H * 0.92]], W * 0.4, withHikers, P.hiker, 2);
  return svg(W, H, defs, b);
}

function konkanKada(seed, pal) {
  const W = 1200, H = 800, rand = rng(seed);
  const P = PALETTES[pal];
  let defs = sky(P.sky) + glow("sunglow", P.sun || "#fff");
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  if (P.sun) b += `<circle cx="${W * 0.7}" cy="${H * 0.5}" r="260" fill="url(#sunglow)" opacity=".8"/><circle cx="${W * 0.7}" cy="${H * 0.5}" r="40" fill="${P.sun}"/>`;
  for (let i = 0; i < 3; i++) {
    const r = plateauRidge(rand, W, H, H * (0.66 + i * 0.07), H * 0.12);
    b += `<path d="${r.d}" fill="${P.ridges[i]}"/>`;
    if (i === 0) b += mist(rand, W, H * 0.7, 6, 0.4);
  }
  // overhanging cliff on the left
  const c = P.ridges[P.ridges.length - 1];
  b += `<path d="M-40,${H}L-40,${H * 0.32}L${W * 0.2},${H * 0.3}L${W * 0.34},${H * 0.31}Q${W * 0.44},${H * 0.33} ${W * 0.43},${H * 0.4}Q${W * 0.36},${H * 0.42} ${W * 0.3},${H * 0.52}Q${W * 0.22},${H * 0.7} ${W * 0.26},${H}Z" fill="${c}"/>`;
  b += hikers([[W * 0.05, H * 0.31], [W * 0.34, H * 0.31]], W * 0.12, 6, P.hiker, 1.5);
  return svg(W, H, defs, b);
}

function international(seed) {
  const W = 1200, H = 800, rand = rng(seed);
  let defs = sky(["#5D9CC2", "#BFE0E6", "#FCE3B6"]) + glow("sunglow", "#FFF3D1") +
    `<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2E9AA8"/><stop offset="100%" stop-color="#1B6B78"/></linearGradient>`;
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="${W * 0.2}" cy="${H * 0.3}" r="200" fill="url(#sunglow)"/>`;
  b += `<path d="M${W * 0.3},${H * 0.62}L${W * 0.5},${H * 0.26}Q${W * 0.55},${H * 0.22} ${W * 0.6},${H * 0.26}L${W * 0.82},${H * 0.62}Z" fill="#6C7F8E"/>`;
  b += `<path d="M${W * 0.5},${H * 0.26}Q${W * 0.55},${H * 0.22} ${W * 0.6},${H * 0.26}L${W * 0.63},${H * 0.31}Q${W * 0.55},${H * 0.28} ${W * 0.47},${H * 0.31}Z" fill="#fff" opacity=".8"/>`;
  b += mist(rand, W, H * 0.28, 4, 0.5);
  b += `<rect y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="url(#sea)"/>`;
  const isl = rollingRidge(rand, W, H, H * 0.66, H * 0.06);
  b += `<path d="${isl.d}" fill="#3E6E58"/>`;
  b += `<path d="M-40,${H}L-40,${H * 0.84}Q${W * 0.5},${H * 0.76} ${W + 40},${H * 0.86}L${W + 40},${H}Z" fill="#F0D7A6"/>`;
  b += palm(W * 0.1, H * 0.95, 300, "#1E3B2E", 1) + palm(W * 0.9, H * 0.97, 280, "#1E3B2E", -1);
  b += `<path d="M${W * 0.62},${H * 0.14}l24,-6l6,-14l6,12l26,-2l-24,8l-4,10z" fill="#fff" opacity=".9"/>`;
  return svg(W, H, defs, b);
}

const scenes = {
  "rajgad-fort-trek-1": sahyadri(11, "dawn", { fort: true, hikers: 6, hikerX: 0.1 }),
  "rajgad-fort-trek-2": sahyadri(12, "monsoon", { fort: true, fortLayer: 1, mist: true }),
  "rajgad-fort-trek-3": sahyadri(13, "sunset", { fort: true, hikers: 5, hikerX: 0.55 }),
  "harishchandragad-trek-1": konkanKada(21, "sunset"),
  "harishchandragad-trek-2": konkanKada(22, "monsoon"),
  "harishchandragad-trek-3": lakeCamp(23, "night"),
  "kalsubai-night-trek-1": sahyadri(31, "night", { trail: true }),
  "kalsubai-night-trek-2": sahyadri(32, "dawn", { hikers: 7, hikerX: 0.3, mist: true }),
  "kalsubai-night-trek-3": sahyadri(33, "night", { trail: true, hikers: 4, hikerX: 0.7 }),
  "andharban-jungle-trek-1": sahyadri(41, "monsoon", { forest: true, mist: true, waterfall: true }),
  "andharban-jungle-trek-2": sahyadri(42, "monsoon", { forest: true, hikers: 6, hikerX: 0.25, mist: true }),
  "andharban-jungle-trek-3": sahyadri(43, "dawn", { forest: true, waterfall: true }),
  "pawna-lake-camping-1": lakeCamp(51, "sunset"),
  "pawna-lake-camping-2": lakeCamp(52, "dawn"),
  "pawna-lake-camping-3": lakeCamp(53, "night"),
  "hampi-backpacking-trip-1": hampi(61, "golden"),
  "hampi-backpacking-trip-2": hampi(62, "sunset"),
  "hampi-backpacking-trip-3": hampi(63, "golden"),
  "gokarna-beach-trek-1": beach(71, "beachSunset"),
  "gokarna-beach-trek-2": beach(72, "beach"),
  "gokarna-beach-trek-3": beach(73, "beachSunset"),
  "kedarkantha-himalayan-trek-1": snow(81, "snow", 6),
  "kedarkantha-himalayan-trek-2": snow(82, "snowDawn"),
  "kedarkantha-himalayan-trek-3": snow(83, "snow", 0),
  "international-1": international(91),
  hero: sahyadri(7, "dawn", { W: 1600, H: 1000, fort: true, fortLayer: 2, hikers: 7, hikerX: 0.62, hikerScale: 2, sunX: 0.3, sunY: 0.42, mist: true }),
};

let total = 0;
for (const [name, content] of Object.entries(scenes)) {
  writeFileSync(new URL(`${name}.svg`, OUT), content);
  total += content.length;
}
console.log(`Wrote ${Object.keys(scenes).length} scenes, avg ${Math.round(total / Object.keys(scenes).length / 1024)} KB`);
