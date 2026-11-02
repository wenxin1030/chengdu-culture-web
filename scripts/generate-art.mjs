// 生成站点插画：每个条目一张主题明确的「水墨 + 剪纸」插画
// 用法: node scripts/generate-art.mjs [name...]
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'src', 'assets', 'img')
mkdirSync(OUT, { recursive: true })

const n = (v) => Math.round(v * 10) / 10
const f2 = (v) => Math.round(v * 100) / 100

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const R = (x, y, w, h, fill, extra) =>
  '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="' + fill + '"' + (extra || '') + '/>'
const Rr = (x, y, w, h, r, fill, extra) =>
  '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" rx="' + n(r) + '" fill="' + fill + '"' + (extra || '') + '/>'
const C = (cx, cy, r, fill, extra) =>
  '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '" fill="' + fill + '"' + (extra || '') + '/>'
const E = (cx, cy, rx, ry, fill, extra) =>
  '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + (extra || '') + '/>'
const P = (d, fill, extra) => {
  const e = extra || ''
  const hasFill = e.indexOf('fill=') >= 0
  return '<path d="' + d + '"' + (hasFill ? '' : ' fill="' + fill + '"') + e + '/>'
}
const S = (d, stroke, w, extra) =>
  '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + f2(w) + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>'
const L = (x1, y1, x2, y2, stroke, w, extra) =>
  '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '" stroke="' + stroke + '" stroke-width="' + f2(w) + '" stroke-linecap="round"' + (extra || '') + '/>'
const G = (transform, inner) => '<g transform="' + transform + '">' + inner + '</g>'
const TXT = (x, y, size, fill, text, extra) => {
  const e = extra || ''
  const anchor = e.indexOf('text-anchor') >= 0 ? '' : ' text-anchor="middle"'
  return '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + n(size) + '" fill="' + fill + '"' + anchor
    + ' font-family="Songti SC, Noto Serif SC, SimSun, serif"' + e + '>' + text + '</text>'
}

// ---------- 调色板 ----------
const PAL = {
  dawn: { sky: ['#f8e9d6', '#f0dcc2', '#e8cfb2'], sun: '#fff8ea', ink: '#223f3a', ink2: '#3c5a52', ink3: '#728f83', accent: '#a8342b', gold: '#b98a3c', paper: '#fdf8ee', water: '#dfe8e1' },
  jade: { sky: ['#f0f6ee', '#e4efe7', '#d6e6db'], sun: '#fbfef8', ink: '#1e3a32', ink2: '#345f51', ink3: '#6d9184', accent: '#a8342b', gold: '#b08a3e', paper: '#f9fcf6', water: '#cfe0d5' },
  dusk: { sky: ['#f9e5d0', '#efceb4', '#e2b394'], sun: '#fff4e2', ink: '#3a2a24', ink2: '#5a4136', ink3: '#8a6a56', accent: '#9e3026', gold: '#c08b3e', paper: '#fdf5e9', water: '#e6d2be' },
  night: { sky: ['#12262c', '#1b3b40', '#264a4c'], sun: '#f4eeda', ink: '#0a181c', ink2: '#16302f', ink3: '#2c4d4e', accent: '#bb4a32', gold: '#d3aa5f', paper: '#ece7d6', water: '#113035' },
  autumn: { sky: ['#f9e8cf', '#f1d7b6', '#e7c29a'], sun: '#fff7e7', ink: '#3d2b22', ink2: '#5c4234', ink3: '#8f6d52', accent: '#a8342b', gold: '#c1913f', paper: '#fdf4e5', water: '#e7d6bd' },
  snow: { sky: ['#f0f4f8', '#e3eaf1', '#d4dfe9'], sun: '#ffffff', ink: '#22333f', ink2: '#3b5060', ink3: '#74899c', accent: '#a8342b', gold: '#b08a3e', paper: '#fafcfe', water: '#dce6ee' },
  mist: { sky: ['#f0f3f0', '#e6ebe6', '#dbe3dc'], sun: '#fbfcf8', ink: '#2a3b36', ink2: '#455c53', ink3: '#7d918a', accent: '#a8342b', gold: '#b08a3e', paper: '#f8faf6', water: '#d8e2da' },
  warm: { sky: ['#fceada', '#f8dabf', '#f0c49f'], sun: '#fff7e9', ink: '#3a2721', ink2: '#5b3d31', ink3: '#8d6550', accent: '#a8342b', gold: '#c3923f', paper: '#fdf5ea', water: '#ecd8c0' },
  deep: { sky: ['#0f2024', '#16302f', '#1f3d3a'], sun: '#e9e2cd', ink: '#081518', ink2: '#122a2a', ink3: '#234242', accent: '#c0523a', gold: '#d8b06a', paper: '#e8e3d2', water: '#0d2429' },
}

// ---------- 山脊 ----------
function ridgePath(W, H, baseY, amp, rnd, pts) {
  const p = pts || 6
  const xs = []
  for (let i = 0; i <= p; i++) xs.push((W / p) * i)
  const ys = xs.map((x, i) => {
    const edge = i === 0 || i === p ? 0.45 : 1
    return baseY - amp * (0.35 + rnd() * 0.65) * edge
  })
  let d = 'M-20 ' + n(H + 10) + ' L-20 ' + n(ys[0])
  for (let i = 0; i < p; i++) {
    const x1 = xs[i], x2 = xs[i + 1], y1 = ys[i], y2 = ys[i + 1]
    const cx1 = x1 + (x2 - x1) / 2, cy1 = y1
    const cx2 = x1 + (x2 - x1) / 2, cy2 = y2
    d += ' C' + n(cx1) + ' ' + n(cy1) + ' ' + n(cx2) + ' ' + n(cy2) + ' ' + n(x2) + ' ' + n(y2)
  }
  d += ' L' + n(W + 20) + ' ' + n(ys[p]) + ' L' + n(W + 20) + ' ' + n(H + 10) + ' Z'
  return d
}

// 尖锐山峰
function peakPath(x, base, w, h) {
  return 'M' + n(x - w / 2) + ' ' + n(base)
    + ' Q' + n(x - w * 0.3) + ' ' + n(base - h * 0.55) + ' ' + n(x - w * 0.16) + ' ' + n(base - h * 0.88)
    + ' L' + n(x + w * 0.02) + ' ' + n(base - h)
    + ' L' + n(x + w * 0.17) + ' ' + n(base - h * 0.86)
    + ' Q' + n(x + w * 0.32) + ' ' + n(base - h * 0.5) + ' ' + n(x + w / 2) + ' ' + n(base) + ' Z'
}

// ---------- 背景 ----------
function background(o) {
  const { w, h, pal, rnd, horizon = 0.66, water = false, groundFill = null, groundY = 0.86, ridges = 3, glow = true, band = null } = o
  const HZ = h * horizon
  let s = '<defs>'
  s += '<linearGradient id="sky" x1="0.1" y1="0" x2="0.55" y2="1">'
    + '<stop offset="0" stop-color="' + pal.sky[0] + '"/>'
    + '<stop offset="0.55" stop-color="' + pal.sky[1] + '"/>'
    + '<stop offset="1" stop-color="' + pal.sky[2] + '"/></linearGradient>'
  s += '<radialGradient id="glow"><stop offset="0" stop-color="' + pal.sun + '" stop-opacity="0.95"/>'
    + '<stop offset="0.45" stop-color="' + pal.sun + '" stop-opacity="0.35"/>'
    + '<stop offset="1" stop-color="' + pal.sun + '" stop-opacity="0"/></radialGradient>'
  s += '<linearGradient id="wat" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0" stop-color="' + pal.water + '"/>'
    + '<stop offset="1" stop-color="' + pal.sky[1] + '"/></linearGradient>'
  s += '<radialGradient id="vig" cx="0.5" cy="0.45" r="0.76">'
    + '<stop offset="0.55" stop-color="#000" stop-opacity="0"/>'
    + '<stop offset="1" stop-color="#000" stop-opacity="0.2"/></radialGradient>'
  s += '</defs>'
  s += R(0, 0, w, h, 'url(#sky)')
  if (glow) {
    s += C(w * 0.74, h * 0.19, Math.min(w, h) * 0.34, 'url(#glow)')
    s += C(w * 0.74, h * 0.19, Math.min(w, h) * 0.075, pal.sun, ' opacity="0.9"')
  }
  for (let i = 0; i < ridges; i++) {
    const t = i / Math.max(ridges - 1, 1)
    const color = i === 0 ? pal.ink3 : i === 1 ? pal.ink2 : pal.ink
    s += P(ridgePath(w, h, HZ + i * h * 0.035, h * (0.2 - i * 0.035), mulberry32(7 + i * 31 + Math.floor(rnd() * 1000)), 5 + i), color, ' opacity="' + f2(0.55 + t * 0.45) + '"')
    s += R(0, HZ + i * h * 0.035 - h * 0.02, w, h * 0.05, pal.paper, ' opacity="0.16"')
  }
  if (water) {
    s += R(0, HZ, w, h - HZ, 'url(#wat)')
    for (let i = 0; i < 9; i++) {
      const y = HZ + (h - HZ) * (0.06 + i * 0.1)
      s += R(w * (0.06 + rnd() * 0.25), y, w * (0.12 + rnd() * 0.4), 1.6, pal.paper, ' opacity="' + f2(0.1 + rnd() * 0.16) + '"')
    }
  }
  if (band) {
    const by = h * band.y
    s += R(0, by, w, h - by, pal.ink2, ' opacity="0.92"')
    s += R(0, by, w, 3, pal.ink, ' opacity="0.55"')
    s += R(0, by + 3, w, 1.4, pal.paper, ' opacity="0.22"')
    for (let i = 0; i < 5; i++) {
      s += R(0, by + (h - by) * (0.18 + i * 0.18), w, 1.2, pal.ink, ' opacity="0.14"')
    }
  }
  const gy = h * groundY
  const gd = 'M-10 ' + n(h + 10) + ' L-10 ' + n(gy + h * 0.02)
    + ' Q' + n(w * 0.28) + ' ' + n(gy - h * 0.03) + ' ' + n(w * 0.52) + ' ' + n(gy + h * 0.01)
    + ' Q' + n(w * 0.78) + ' ' + n(gy + h * 0.05) + ' ' + n(w + 10) + ' ' + n(gy - h * 0.01)
    + ' L' + n(w + 10) + ' ' + n(h + 10) + ' Z'
  s += P(gd, groundFill || pal.ink, ' opacity="0.94"')
  return s
}

function frame(w, h, pal) {
  return R(10, 10, w - 20, h - 20, 'none', ' stroke="' + pal.paper + '" stroke-opacity="0.5" stroke-width="1.4"')
}

function seal(x, y, pal, text) {
  const s = 54
  let out = Rr(x - s / 2, y - s / 2, s, s, 6, pal.accent, ' opacity="0.94"')
  out += TXT(x, y + 12, 30, '#fff9f0', text, ' letter-spacing="1"')
  return out
}

// ================= 基础构件（单位坐标 0..100，地面 y≈88） =================
function steam(x, y, w, color, op) {
  const o = ' opacity="' + f2(op || 0.45) + '"'
  let s = ''
  for (let i = -1; i <= 1; i++) {
    const bx = x + i * w
    s += S('M' + n(bx) + ' ' + n(y) + ' c-6 -7 6 -12 0 -19 c-5 -6 5 -10 1 -17', color, 2.6, o)
  }
  return s
}

function lantern(x, y, r, pal, glow) {
  let s = ''
  if (glow) s += C(x, y, r * 1.9, pal.accent, ' opacity="0.12"')
  s += L(x, y - r * 2.1, x, y - r * 1.1, pal.ink, 1.8)
  s += E(x, y, r, r * 1.12, pal.accent)
  s += R(x - r * 0.28, y - r * 1.3, r * 0.56, r * 0.3, pal.gold)
  s += R(x - r * 0.28, y + r * 1.02, r * 0.56, r * 0.3, pal.gold)
  s += L(x - r * 0.72, y, x + r * 0.72, y, pal.gold, 1.2, ' opacity="0.5"')
  s += L(x, y + r * 1.35, x, y + r * 2.1, pal.gold, 1.6)
  return s
}

function person(x, y, s, color) {
  let out = C(x, y - s * 0.78, s * 0.19, color)
  out += P('M' + n(x - s * 0.24) + ' ' + n(y) + ' L' + n(x - s * 0.2) + ' ' + n(y - s * 0.56)
    + ' Q' + n(x) + ' ' + n(y - s * 0.68) + ' ' + n(x + s * 0.2) + ' ' + n(y - s * 0.56)
    + ' L' + n(x + s * 0.24) + ' ' + n(y) + ' Z', color)
  out += R(x - s * 0.18, y, s * 0.14, s * 0.3, color, ' rx="2"')
  out += R(x + s * 0.05, y, s * 0.14, s * 0.3, color, ' rx="2"')
  return out
}

function crowd(count, y, spread, color, rnd) {
  let s = ''
  for (let i = 0; i < count; i++) {
    const x = 50 - spread / 2 + (spread / (count - 1 || 1)) * i + (rnd() - 0.5) * 3
    const yy = y + (rnd() - 0.5) * 2.4
    s += C(x, yy, 3.2, color, ' opacity="0.92"')
    s += P('M' + n(x - 5.4) + ' ' + n(yy + 9) + ' Q' + n(x - 5) + ' ' + n(yy + 2.6) + ' ' + n(x) + ' ' + n(yy + 2.4)
      + ' Q' + n(x + 5) + ' ' + n(yy + 2.6) + ' ' + n(x + 5.4) + ' ' + n(yy + 9) + ' Z', color, ' opacity="0.92"')
  }
  return s
}

function tree(x, y, s, color) {
  let out = R(x - s * 0.05, y - s * 0.42, s * 0.1, s * 0.42, color)
  out += C(x, y - s * 0.62, s * 0.24, color)
  out += C(x - s * 0.2, y - s * 0.5, s * 0.17, color)
  out += C(x + s * 0.2, y - s * 0.52, s * 0.18, color)
  return out
}

function pine(x, y, s, color) {
  let out = R(x - s * 0.035, y - s * 0.3, s * 0.07, s * 0.3, color)
  for (let i = 0; i < 3; i++) {
    const t = i * 0.26
    out += P('M' + n(x) + ' ' + n(y - s * (0.55 + t * 1.1)) + ' L' + n(x - s * (0.3 - t * 0.06)) + ' ' + n(y - s * (0.3 + t * 0.9))
      + ' L' + n(x + s * (0.3 - t * 0.06)) + ' ' + n(y - s * (0.3 + t * 0.9)) + ' Z', color)
  }
  return out
}

function bamboo(x, y, s, color, segs) {
  let out = ''
  const k = segs || 4
  for (let i = 0; i < k; i++) {
    const bx = x + (i - (k - 1) / 2) * s * 0.22
    const hh = s * (0.7 + (i % 3) * 0.16)
    out += L(bx, y, bx + (i - 1) * 2, y - hh, color, 1.6)
    for (let j = 0; j < 3; j++) {
      const ly = y - hh * (0.45 + j * 0.2)
      const dir = (i + j) % 2 === 0 ? 1 : -1
      out += S('M' + n(bx) + ' ' + n(ly) + ' q' + n(dir * 6) + ' -3 ' + n(dir * 11) + ' -1', color, 1.1, ' opacity="0.8"')
      out += S('M' + n(bx) + ' ' + n(ly + 3) + ' q' + n(dir * 5) + ' 2 ' + n(dir * 9) + ' 4', color, 1, ' opacity="0.7"')
    }
  }
  return out
}

function houseRow(x, y, count, w, h, pal, opts) {
  const o = opts || {}
  let s = ''
  for (let i = 0; i < count; i++) {
    const hx = x + i * w
    s += R(hx + w * 0.06, y - h, w * 0.88, h, o.body || pal.paper, ' opacity="0.92"')
    s += P('M' + n(hx - w * 0.04) + ' ' + n(y - h) + ' L' + n(hx + w * 0.5) + ' ' + n(y - h - w * 0.34)
      + ' L' + n(hx + w * 1.04) + ' ' + n(y - h) + ' L' + n(hx + w * 0.96) + ' ' + n(y - h + w * 0.07)
      + ' L' + n(hx + w * 0.5) + ' ' + n(y - h - w * 0.24) + ' L' + n(hx + w * 0.04) + ' ' + n(y - h + w * 0.07) + ' Z',
      o.roof || pal.ink)
    s += R(hx + w * 0.34, y - h * 0.72, w * 0.3, h * 0.72, pal.ink, ' opacity="0.16"')
    if (o.lantern) s += lantern(hx + w * 0.2, y - h * 0.62, w * 0.1, pal, false)
  }
  return s
}

function pagoda(x, y, s, color) {
  let out = ''
  for (let i = 0; i < 5; i++) {
    const t = i / 4
    const w = s * (0.62 - t * 0.34)
    const yy = y - s * 0.16 * i
    out += P('M' + n(x - w / 2) + ' ' + n(yy) + ' Q' + n(x - w * 0.62) + ' ' + n(yy - s * 0.02) + ' ' + n(x - w * 0.72) + ' ' + n(yy - s * 0.06)
      + ' L' + n(x + w * 0.72) + ' ' + n(yy - s * 0.06) + ' Q' + n(x + w * 0.62) + ' ' + n(yy - s * 0.02) + ' ' + n(x + w / 2) + ' ' + n(yy)
      + ' Z', color)
    out += R(x - w * 0.26, yy - s * 0.14, w * 0.52, s * 0.14, color)
  }
  out += L(x, y - s * 0.86, x, y - s * 1.02, color, 3)
  return out
}

function gateArch(x, y, w, h, color) {
  let s = ''
  s += R(x - w * 0.5, y - h, w * 0.1, h, color)
  s += R(x + w * 0.4, y - h, w * 0.1, h, color)
  s += P('M' + n(x - w * 0.62) + ' ' + n(y - h) + ' L' + n(x) + ' ' + n(y - h - h * 0.32)
    + ' L' + n(x + w * 0.62) + ' ' + n(y - h) + ' L' + n(x + w * 0.52) + ' ' + n(y - h + h * 0.06)
    + ' L' + n(x) + ' ' + n(y - h - h * 0.2) + ' L' + n(x - w * 0.52) + ' ' + n(y - h + h * 0.06) + ' Z', color)
  s += R(x - w * 0.34, y - h * 0.96, w * 0.68, h * 0.1, color, ' opacity="0.85"')
  return s
}

function bridgeSusp(x1, x2, y, color, dip) {
  let s = ''
  const dd = dip || 14
  s += L(x1, y, x2, y, color, 3)
  s += S('M' + n(x1) + ' ' + n(y - 14) + ' C' + n((x1 + x2) / 2 - 10) + ' ' + n(y - 14 + dd * 0.6) + ' '
    + n((x1 + x2) / 2 + 10) + ' ' + n(y - 14 + dd * 0.6) + ' ' + n(x2) + ' ' + n(y - 14), color, 2.2)
  for (let i = 1; i < 6; i++) {
    const t = i / 6
    const bx = x1 + (x2 - x1) * t
    const by = y - 14 + Math.sin(Math.PI * t) * dd * 0.6
    s += L(bx, y, bx, by, color, 1.1, ' opacity="0.7"')
  }
  s += R(x1 - 3, y - 20, 6, 24, color)
  s += R(x2 - 3, y - 20, 6, 24, color)
  return s
}

function towerBlock(x, y, w, h, color, lit) {
  let s = R(x, y - h, w, h, color)
  const cols = Math.max(2, Math.min(5, Math.round(w / 22)))
  const rows = Math.max(3, Math.min(7, Math.round(h / 30)))
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (lit && (i + j) % 3 === 0) {
        s += R(x + w * (0.16 + (i / cols) * 0.68), y - h + h * (0.14 + (j / rows) * 0.72), (w / cols) * 0.42, (h / rows) * 0.34, '#f6e2b0', ' opacity="0.72"')
      }
    }
  }
  return s
}

function bambooChair(x, y, s, color) {
  let out = L(x - s * 0.3, y, x - s * 0.36, y - s * 0.5, color, 2)
  out += L(x + s * 0.3, y, x + s * 0.36, y - s * 0.5, color, 2)
  out += L(x - s * 0.3, y - s * 0.42, x + s * 0.32, y - s * 0.42, color, 2.4)
  out += L(x + s * 0.3, y - s * 0.42, x + s * 0.34, y - s * 1.05, color, 2)
  out += L(x + s * 0.06, y - s * 0.42, x + s * 0.1, y - s * 1.02, color, 2)
  out += L(x + s * 0.06, y - s * 0.98, x + s * 0.34, y - s * 1.02, color, 2.4)
  return out
}

// ================= 美食 =================
function bowlShape(cx, rimY, rx, depth, body, rim, broth) {
  let s = E(cx, rimY + depth * 1.02, rx * 1.05, rx * 0.3, '#000', ' opacity="0.14"')
  s += P('M' + n(cx - rx) + ' ' + n(rimY) + ' Q' + n(cx - rx * 0.8) + ' ' + n(rimY + depth * 1.2) + ' ' + n(cx) + ' ' + n(rimY + depth)
    + ' Q' + n(cx + rx * 0.8) + ' ' + n(rimY + depth * 1.2) + ' ' + n(cx + rx) + ' ' + n(rimY) + ' Z', body)
  s += E(cx, rimY, rx, rx * 0.3, rim)
  if (broth) s += E(cx, rimY + 1.4, rx * 0.86, rx * 0.23, broth)
  return s
}

function chili(x, y, r, rot, color) {
  const body = E(0, 0, r, r * 0.44, color) + S('M' + n(r * 0.85) + ' 0 q' + n(r * 0.5) + ' -1 ' + n(r * 0.8) + ' -4', color, 1.5)
  return G('translate(' + n(x) + ' ' + n(y) + ') rotate(' + rot + ')', body)
}

function scallion(x, y, len, rot, color) {
  let s = L(-len / 2, 0, len / 2, 0, color, 2.2)
  return G('translate(' + n(x) + ' ' + n(y) + ') rotate(' + rot + ')', s)
}

function skewer(x, baseY, len, beadColor, pal, beads) {
  let s = L(x, baseY, x, baseY - len, '#c9a06a', 1.8, ' opacity="0.9"')
  for (let i = 0; i < beads; i++) {
    const by = baseY - len * (0.3 + i * 0.2)
    s += C(x, by, 3.3, beadColor)
    s += C(x, by, 3.3, 'none', ' stroke="' + pal.paper + '" stroke-opacity="0.5" stroke-width="0.9"')
  }
  return s
}

function foodPlate(cx, cy, rx, pal) {
  let s = E(cx, cy + 3, rx * 1.02, rx * 0.34, '#000', ' opacity="0.13"')
  s += E(cx, cy, rx, rx * 0.36, pal.paper)
  s += E(cx, cy, rx, rx * 0.36, 'none', ' stroke="' + pal.ink3 + '" stroke-opacity="0.5" stroke-width="1.1"')
  s += E(cx, cy + 0.6, rx * 0.8, rx * 0.27, pal.paper, ' stroke="' + pal.ink3 + '" stroke-opacity="0.32" stroke-width="0.9"')
  return s
}

function mHuoguo(pal) {
  let s = C(50, 48, 36, pal.sun, ' opacity="0.18"')
  s += E(50, 80, 33, 8, '#000', ' opacity="0.16"')
  s += R(18.5, 50, 6.5, 11, '#2a1c18', ' rx="3"')
  s += R(75, 50, 6.5, 11, '#2a1c18', ' rx="3"')
  s += C(50, 55, 28, '#2a1c18')
  s += C(50, 55, 25.6, '#a8381f')
  s += C(50, 55, 23.6, '#8e2a17')
  s += L(42, 33, 42, 77, pal.paper, 2.1, ' opacity="0.45"')
  s += L(58, 33, 58, 77, pal.paper, 2.1, ' opacity="0.45"')
  s += L(27, 47, 73, 47, pal.paper, 2.1, ' opacity="0.45"')
  s += L(27, 63, 73, 63, pal.paper, 2.1, ' opacity="0.45"')
  s += C(50, 55, 24.2, 'none', ' stroke="#2a1c18" stroke-width="5"')
  s += C(50, 55, 27.2, 'none', ' stroke="#8c4a30" stroke-width="1.4" opacity="0.7"')
  s += chili(35, 41, 4.4, -22, pal.accent)
  s += chili(46, 39, 4.2, 12, pal.accent)
  s += chili(61, 42, 4.6, -8, pal.accent)
  s += chili(38, 69, 4.1, 26, pal.accent)
  s += chili(64, 68, 4.3, -18, pal.accent)
  s += C(33, 56, 1.5, '#3a2018')
  s += C(37, 60, 1.3, '#3a2018')
  s += C(67, 58, 1.4, '#3a2018')
  s += C(58, 72, 1.3, '#3a2018')
  s += scallion(52, 46, 7, -18, '#7f9b52')
  s += scallion(50, 70, 6, 24, '#7f9b52')
  s += scallion(63, 58, 5.4, 62, '#7f9b52')
  s += steam(50, 30, 8, pal.paper, 0.5)
  return s
}

function mChuanchuan(pal) {
  let s = C(50, 46, 35, pal.sun, ' opacity="0.16"')
  s += E(50, 88, 31, 7, '#000', ' opacity="0.14"')
  for (let i = -3; i <= 3; i++) {
    const bx = 50 + i * 3.6
    s += G('rotate(' + n(i * 9) + ' ' + n(bx) + ' 84)', skewer(bx, 84, 46 - Math.abs(i) * 3, '#b8452c', pal, 3))
  }
  s += bowlShape(50, 63, 23, 15, '#33231e', '#efe0c6', '#a93a24')
  s += chili(43, 60, 3.6, -16, pal.accent)
  s += chili(57, 61, 3.4, 14, pal.accent)
  s += C(50, 63, 1.2, '#3a2018')
  s += C(46, 65, 1, '#3a2018')
  s += scallion(53, 65, 5, 8, '#7f9b52')
  s += steam(50, 44, 7.5, pal.paper, 0.42)
  return s
}

function mDandanmian(pal) {
  let s = C(50, 48, 35, pal.sun, ' opacity="0.18"')
  s += bowlShape(50, 60, 26, 19, '#33231e', '#efe0c6', '#d9a441')
  const noo = '#f4e3bf'
  s += S('M30 62 C38 56 46 64 50 58 C54 52 62 60 70 56', noo, 2.6, ' opacity="0.95"')
  s += S('M32 66 C40 60 48 68 54 62 C58 58 64 64 68 61', noo, 2.4, ' opacity="0.9"')
  s += E(50, 60, 9, 3.2, '#6b3a2a', ' opacity="0.85"')
  for (let i = 0; i < 5; i++) s += C(44 + i * 3, 59.4 + (i % 2) * 1.6, 1.5, '#8c4a30')
  s += C(38, 63, 1.4, '#d9b06a')
  s += C(60, 64, 1.4, '#d9b06a')
  s += scallion(57, 57, 5.4, 20, '#7f9b52')
  s += L(62, 34, 76, 52, '#8a5a34', 2.4)
  s += L(67, 33, 80, 50, '#8a5a34', 2.4)
  s += steam(50, 34, 8, pal.paper, 0.5)
  return s
}

function dumpling(cx, cy, s, pal, rot) {
  const d = 'M' + n(cx - s) + ' ' + n(cy) + ' Q' + n(cx) + ' ' + n(cy - s * 1.05) + ' ' + n(cx + s) + ' ' + n(cy)
    + ' Q' + n(cx) + ' ' + n(cy + s * 0.62) + ' ' + n(cx - s) + ' ' + n(cy) + ' Z'
  let out = P(d, '#f8eed8')
  out += P(d, 'none', ' stroke="' + pal.ink3 + '" stroke-opacity="0.7" stroke-width="1.2"')
  for (let i = 0; i < 4; i++) {
    out += S('M' + n(cx - s * 0.5 + i * s * 0.34) + ' ' + n(cy - s * 0.42) + ' q1 ' + n(s * 0.3) + ' 0 ' + n(s * 0.62), pal.ink3, 0.9, ' opacity="0.45"')
  }
  return rot ? G('rotate(' + rot + ' ' + n(cx) + ' ' + n(cy) + ')', out) : out
}

function mZhongshuijiao(pal) {
  let s = C(50, 46, 34, pal.sun, ' opacity="0.18"')
  s += foodPlate(50, 68, 30, pal)
  s += dumpling(38, 63, 8.4, pal, -10)
  s += dumpling(58, 61, 8.4, pal, 8)
  s += dumpling(50, 70, 8.8, pal, 0)
  s += dumpling(33, 71, 7.4, pal, 16)
  s += dumpling(66, 71, 7.4, pal, -12)
  s += E(78, 76, 9, 4.4, pal.paper)
  s += E(78, 75.6, 7.2, 3.4, '#5b3a2a')
  s += C(79, 75, 1, '#8a5a34')
  s += steam(50, 40, 8, pal.paper, 0.46)
  return s
}

function mLongchaoshou(pal) {
  let s = C(50, 48, 34, pal.sun, ' opacity="0.16"')
  s += bowlShape(50, 60, 26, 19, '#33231e', '#efe0c6', '#d9a441')
  const wonton = function (cx, cy, r, rot) {
    return G('rotate(' + rot + ' ' + n(cx) + ' ' + n(cy) + ')',
      P('M' + n(cx - r) + ' ' + n(cy + r * 0.3) + ' Q' + n(cx) + ' ' + n(cy - r) + ' ' + n(cx + r) + ' ' + n(cy + r * 0.3)
        + ' Q' + n(cx) + ' ' + n(cy + r * 0.75) + ' ' + n(cx - r) + ' ' + n(cy + r * 0.3) + ' Z', '#f8eed8')
      + S('M' + n(cx) + ' ' + n(cy + r * 0.2) + ' q' + n(r * 0.3) + ' ' + n(-r * 0.4) + ' ' + n(r * 0.5) + ' 0', pal.ink3, 1, ' opacity="0.5"'))
  }
  s += wonton(41, 59, 8, -14)
  s += wonton(58, 57, 8, 12)
  s += wonton(49, 64, 8.4, 4)
  s += S('M30 66 C38 62 44 68 50 64 C56 60 62 66 70 62', '#5b6e3a', 2.4, ' opacity="0.8"')
  s += scallion(56, 61, 5, 16, '#7f9b52')
  s += scallion(44, 62, 4.6, -20, '#7f9b52')
  s += steam(50, 36, 8, pal.paper, 0.46)
  return s
}

function mMafu(pal) {
  let s = E(50, 60, 27, 7.6, '#e8e2d6')
  s += E(50, 58, 22, 6.4, '#d9cfbe', ' opacity="0.9"')
  s += E(50, 56, 24.5, 9.4, '#b2341f')
  s += E(50, 55, 24.5, 8.4, '#c8412a')
  s += S('M30 54 Q50 58 70 53', '#8f2116', 1.6, ' opacity="0.45"')
  const tofu = [[44, 50], [56, 50], [50, 54.6], [38, 55], [62, 55], [44, 59], [56, 59], [50, 63.4], [38, 62], [62, 62]]
  for (const t of tofu) {
    const x = t[0]
    const y = t[1]
    const k = f2(0.9 + ((x + y) % 7) * 0.02)
    s += Rr(x - 4.2, y - 2.6, 8.4, 5.2, 0.9, '#f6f2e6')
    s += Rr(x - 4.2, y - 2.6, 8.4, 5.2, 0.9, 'none', ' stroke="#c9bfa8" stroke-width="0.6" opacity="0.8" stroke-opacity="' + k + '"')
  }
  s += C(41, 47, 1.4, '#4a2a18') + C(60, 48, 1.2, '#4a2a18') + C(48, 65, 1.3, '#4a2a18')
  s += C(33, 51, 1.8, '#5c3a22') + C(67, 51, 1.8, '#5c3a22')
  s += scallion(46, 46.5, 2.6, '#7fa83f', -18) + scallion(57, 66.5, 2.4, '#7fa83f', 12)
  s += steam(50, 40, 20, pal.paper, 0.26)
  return s
}
function mGuokui(pal) {
  let s = C(50, 48, 33, pal.sun, ' opacity="0.16"')
  s += E(50, 78, 26, 7, '#000', ' opacity="0.13"')
  s += E(50, 58, 25, 22, pal.gold)
  s += E(50, 56, 23, 20, '#d9a95c')
  s += E(50, 56, 20, 17.4, '#e6bb72')
  for (let i = 0; i < 22; i++) {
    const a = i * 2.4,
      rr = 4 + (i % 5) * 3.4
    s += E(50 + Math.cos(a) * rr, 56 + Math.sin(a) * rr * 0.86, 1.1, 0.8, '#fff6e2', ' opacity="0.85"')
  }
  s += S('M38 54 Q50 49 62 54', '#a87838', 1.8, ' opacity="0.7"')
  s += S('M38 60 Q50 65 62 60', '#a87838', 1.6, ' opacity="0.55"')
  s += steam(50, 32, 8, pal.paper, 0.4)
  return s
}

function mTangyou(pal) {
  let s = E(50, 72, 30, 8, '#e8e2d6', ' opacity="0.85"')
  s += E(50, 70.6, 26, 6.4, '#f3eee2')
  s += E(50, 70.6, 26, 6.4, 'none', ' stroke="#cfc6b2" stroke-width="0.8" opacity="0.8"')
  const balls = [[42, 62, 6.2], [50, 56, 6.6], [57, 50, 6.2], [63, 44.6, 5.6]]
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i]
    s += C(b[0], b[1] + 2, b[2] * 0.9, pal.ink, ' opacity="0.16"')
    s += C(b[0], b[1], b[2], '#c98a2e')
    s += C(b[0] - b[2] * 0.22, b[1] - b[2] * 0.24, b[2] * 0.62, '#dda04a')
    s += C(b[0] - b[2] * 0.36, b[1] - b[2] * 0.4, b[2] * 0.26, '#f0c98c', ' opacity="0.85"')
    for (let k = 0; k < 5; k++) s += C(b[0] + Math.cos(k * 1.3) * b[2] * 0.6, b[1] + Math.sin(k * 1.3) * b[2] * 0.6, 0.7, '#f6e9cf', ' opacity="0.75"')
  }
  s += L(52, 70, 66, 48, '#b98a52', 1.8)
  s += steam(52, 42, 16, pal.paper, 0.24)
  return s
}
function mGaiwan(pal) {
  let s = C(50, 46, 34, pal.sun, ' opacity="0.16"')
  s += E(50, 82, 30, 8, '#000', ' opacity="0.14"')
  s += E(50, 76, 25, 7.4, '#f4ecd8')
  s += E(50, 74.6, 18, 5.2, '#fbf5e7')
  s += E(50, 74.6, 18, 5.2, 'none', ' stroke="' + pal.ink3 + '" stroke-opacity="0.4" stroke-width="1"')
  s += P('M32 60 Q33 71 50 75 Q67 71 68 60 Z', '#f7efdc')
  s += P('M32 60 Q33 71 50 75 Q67 71 68 60 Z', 'none', ' stroke="' + pal.ink3 + '" stroke-opacity="0.4" stroke-width="1"')
  s += E(50, 60, 18, 5.4, '#e3c283')
  s += E(50, 60, 15, 4.4, '#cfa14c')
  s += E(50, 60, 15, 4.4, 'none', ' stroke="#a87c33" stroke-width="1" opacity="0.6"')
  s += G('rotate(-9 50 54)', P('M37 54 Q50 45 63 54 Q50 58 37 54 Z', '#fbf3e2')
    + E(50, 54, 13, 4, 'none', ' stroke="' + pal.ink3 + '" stroke-opacity="0.35" stroke-width="1"')
    + C(50, 47.4, 2.8, '#fbf3e2')
    + E(50, 48.6, 2.4, 1.2, '#e8d3a6'))
  s += steam(50, 36, 7.5, pal.paper, 0.42)
  return s
}

function mFeichangfen(pal) {
  let s = C(50, 46, 34, pal.sun, ' opacity="0.16"')
  s += bowlShape(50, 58, 27, 21, '#33231e', '#efe0c6', '#b8452c')
  s += E(50, 58, 24, 6, '#c25038', ' opacity="0.8"')
  const noo = '#f4e3bf'
  s += S('M30 60 C38 55 44 63 50 57 C56 52 62 60 70 56', noo, 2.4)
  s += S('M32 64 C40 59 46 66 52 61 C58 57 64 63 70 60', noo, 2.2, ' opacity="0.9"')
  s += Rr(40, 58, 7, 4.4, 2.2, '#8a4a30')
  s += Rr(55, 60, 6.4, 4, 2, '#8a4a30')
  s += Rr(48, 55, 6.6, 4.2, 2.1, '#96543a')
  s += C(43, 56, 1.3, '#d9b06a')
  s += C(60, 57, 1.2, '#d9b06a')
  s += scallion(50, 62, 5, -8, '#7f9b52')
  s += steam(50, 32, 8, pal.paper, 0.46)
  return s
}

function mBoboji(pal) {
  let s = C(50, 46, 34, pal.sun, ' opacity="0.16"')
  s += E(50, 84, 30, 7, '#000', ' opacity="0.14"')
  for (const bx of [38, 50, 62]) s += G('rotate(' + n((bx - 50) * 0.8) + ' ' + n(bx) + ' 80)', skewer(bx, 80, 30, '#b8452c', pal, 2))
  s += bowlShape(50, 62, 26, 17, '#efe0c6', '#f7efdc', '#a93a24')
  s += chili(42, 60, 3.8, -18, pal.accent)
  s += chili(57, 61, 3.6, 16, pal.accent)
  for (let i = 0; i < 6; i++) s += C(40 + i * 3.6, 64 + (i % 2) * 1.6, 1.1, '#3a2018')
  s += scallion(53, 64, 4.6, 10, '#7f9b52')
  s += steam(50, 40, 7, pal.paper, 0.36)
  return s
}

// ================= 文化活动 =================
function mDeng(pal) {
  let s = R(0, 0, 100, 100, pal.ink3, ' opacity="0.12"')
  s += C(50, 24, 30, pal.sun, ' opacity="0.22"')
  s += R(0, 62, 100, 38, pal.ink2)
  for (let i = 0; i < 13; i++) s += R(i * 7.8, 57, 5, 5.4, pal.ink2)
  s += R(0, 62, 100, 1.6, pal.ink3, ' opacity="0.6"')
  s += P('M38 100 L38 80 Q50 68 62 80 L62 100 Z', '#08161a')
  s += R(39, 86, 22, 14, pal.accent)
  s += L(50, 86, 50, 100, '#3a1410', 1.4)
  for (const gx of [45, 55]) for (const gy of [90, 94, 98]) s += C(gx, gy, 0.9, pal.gold)
  s += S('M6 20 Q50 42 94 20', pal.ink, 1.4)
  s += S('M6 24 Q50 46 94 24', pal.ink, 1.1, ' opacity="0.5"')
  for (const x of [14, 27, 40, 50, 60, 73, 86]) s += lantern(x, 30 + Math.sin(x * 0.5) * 3, 4.6, pal, true)
  s += crowd(9, 97, 86, pal.ink, mulberry32(9))
  s += R(0, 97, 100, 3, pal.ink, ' opacity="0.6"')
  return s
}

function mChuanju(pal) {
  let s = C(50, 46, 44, pal.ink, ' opacity="0.14"')
  s += P('M24 0 L40 100 L60 100 L76 0 Z', pal.paper, ' opacity="0.07"')
  for (const rx of [26, 74]) s += P('M' + n(rx - 6) + ' 22 L' + n(rx + 2) + ' 26 L' + n(rx + 8) + ' 60 L' + n(rx - 3) + ' 58 Z', pal.accent, ' opacity="0.42"')
  const face = 'M50 16 C68 16 80 28 80 45 C80 62 70 76 50 84 C30 76 20 62 20 45 C20 28 32 16 50 16 Z'
  s += P(face, pal.paper)
  s += P(face, 'none', ' stroke="' + pal.ink + '" stroke-opacity="0.55" stroke-width="1.8"')
  // 额头纹
  s += P('M50 17 C60 22 64 30 57 37 C53 40 47 40 43 37 C36 30 40 22 50 17 Z', pal.accent)
  s += C(50, 27, 3.4, pal.gold)
  s += P('M50 36 L58 33 L52 41 Z', pal.ink, ' opacity="0.8"')
  // 粗眉
  s += P('M26 41 Q38 33 46 40 L44 45 Q37 40 28 46 Z', pal.ink)
  s += P('M74 41 Q62 33 54 40 L56 45 Q63 40 72 46 Z', pal.ink)
  // 眼（黑底白眼白）
  s += E(36, 51, 10.4, 6.6, pal.ink)
  s += E(64, 51, 10.4, 6.6, pal.ink)
  s += E(36, 51, 7.4, 4.4, pal.paper)
  s += E(64, 51, 7.4, 4.4, pal.paper)
  s += E(36, 51, 7.4, 4.4, 'none', ' stroke="' + pal.accent + '" stroke-width="1.2" opacity="0.9"')
  s += E(64, 51, 7.4, 4.4, 'none', ' stroke="' + pal.accent + '" stroke-width="1.2" opacity="0.9"')
  s += C(36, 51, 3.4, pal.ink) + C(64, 51, 3.4, pal.ink)
  s += C(34.4, 49.4, 1.1, pal.paper) + C(62.4, 49.4, 1.1, pal.paper)
  // 鼻与嘴
  s += S('M50 56 L50 62', pal.ink, 1.8)
  s += P('M50 62 Q44 61 41 65 Q47 67 50 64 Q53 67 59 65 Q56 61 50 62 Z', pal.ink)
  s += P('M42 71 Q50 80 58 71 Q50 67 42 71 Z', pal.accent)
  // 脸颊纹
  s += S('M24 58 Q28 64 24 70', pal.accent, 1.6, ' opacity="0.7"')
  s += S('M76 58 Q72 64 76 70', pal.accent, 1.6, ' opacity="0.7"')
  s += S('M34 74 Q40 78 44 76', pal.accent, 1.3, ' opacity="0.55"')
  s += S('M66 74 Q60 78 56 76', pal.accent, 1.3, ' opacity="0.55"')
  // 冠
  s += R(34, 5, 32, 11, pal.ink, ' rx="2"')
  s += R(34, 5, 32, 3, pal.gold, ' opacity="0.9"')
  s += C(30, 9, 4, pal.accent) + C(70, 9, 4, pal.accent)
  s += L(40, 5, 34, -3, pal.gold, 1.8) + L(60, 5, 66, -3, pal.gold, 1.8)
  s += C(50, 11.5, 2.6, pal.gold)
  return s
}

function mMiaohui(pal) {
  let s = C(50, 22, 28, pal.sun, ' opacity="0.22"')
  s += gateArch(50, 62, 54, 26, pal.ink)
  s += R(41, 40, 18, 7, '#8c2c22')
  s += TXT(50, 45.4, 3.2, pal.gold, '庙会')
  for (const x of [18, 82]) {
    s += R(x - 8, 60, 16, 22, pal.paper, ' opacity="0.9"')
    s += P('M' + n(x - 10) + ' 60 L' + n(x) + ' 50 L' + n(x + 10) + ' 60 Z', pal.accent)
    s += R(x - 6.4, 64, 12.8, 2.4, pal.ink, ' opacity="0.18"')
    s += R(x - 6.4, 69, 12.8, 2.4, pal.ink, ' opacity="0.14"')
    s += lantern(x, 56, 3, pal, false)
  }
  s += crowd(11, 96, 88, pal.ink, mulberry32(5))
  s += R(0, 96, 100, 4, pal.ink, ' opacity="0.45"')
  return s
}

function mTangjiu(pal) {
  let s = C(50, 44, 30, pal.sun, ' opacity="0.2"')
  s += S('M20 26 C34 16 66 16 80 26', pal.gold, 2.2, ' opacity="0.65"')
  s += S('M24 32 C36 24 64 24 76 32', pal.gold, 1.6, ' opacity="0.45"')
  s += E(50, 88, 26, 6, '#000', ' opacity="0.14"')
  s += P('M33 60 Q33 46 40 42 L60 42 Q67 46 67 60 Q67 84 50 86 Q33 84 33 60 Z', '#8a4a30')
  s += P('M33 60 Q33 46 40 42 L60 42 Q67 46 67 60 Q67 84 50 86 Q33 84 33 60 Z', 'none', ' stroke="#5c2f1e" stroke-width="1.4" opacity="0.6"')
  s += R(43, 34, 14, 9, '#7a4028')
  s += R(41, 29, 18, 6, pal.accent, ' rx="2"')
  s += S('M41 32 q-3 4 0 8', pal.accent, 1.6)
  s += Rr(38, 56, 24, 20, 2, '#f4e6cc')
  s += Rr(38, 56, 24, 20, 2, 'none', ' stroke="#c9a06a" stroke-width="1"')
  s += TXT(50, 71, 8, '#8a2c22', '酒')
  s += R(70, 52, 8, 32, '#5a6e3a')
  s += R(72.2, 44, 3.6, 9, '#4a5c30')
  s += R(80, 58, 6.4, 26, '#3c5236', ' rx="1.4"')
  s += R(81, 50, 2.6, 8, '#8a4a30')
  return s
}

function mMusic(pal) {
  let s = R(0, 0, 100, 100, pal.ink2, ' opacity="0.28"')
  s += C(50, 24, 26, pal.sun, ' opacity="0.16"')
  s += P('M42 0 L26 100 L40 100 L54 0 Z', pal.paper, ' opacity="0.12"')
  s += P('M58 0 L74 100 L60 100 L46 0 Z', pal.paper, ' opacity="0.12"')
  s += R(18, 62, 12, 26, pal.ink, ' rx="1.6"')
  s += R(70, 62, 12, 26, pal.ink, ' rx="1.6"')
  s += C(24, 70, 3.4, pal.paper, ' opacity="0.5"') + C(76, 70, 3.4, pal.paper, ' opacity="0.5"')
  s += C(24, 78, 5, pal.paper, ' opacity="0.28"') + C(76, 78, 5, pal.paper, ' opacity="0.28"')
  s += C(46, 26, 2.6, pal.gold) + L(46, 26, 46, 14, pal.gold, 2.4)
  s += C(60, 20, 2.2, pal.gold, ' opacity="0.8"') + L(60, 20, 60, 10, pal.gold, 2)
  s += C(54, 36, 1.8, pal.gold, ' opacity="0.6"')
  s += crowd(10, 94, 86, pal.paper, mulberry32(21))
  return s
}

function mShuxiu(pal) {
  let s = C(50, 46, 34, pal.sun, ' opacity="0.16"')
  s += C(50, 52, 30, '#8a5a34', ' opacity="0.16"')
  s += C(50, 52, 27, pal.paper)
  s += C(50, 52, 27, 'none', ' stroke="#8a5a34" stroke-width="3"')
  s += C(50, 52, 23.4, 'none', ' stroke="#c9a06a" stroke-width="1.2" opacity="0.7"')
  s += S('M28 46 C38 38 44 52 52 44 C60 37 68 46 74 40', '#4a6b4a', 1.8, ' opacity="0.8"')
  s += S('M40 60 C46 54 52 62 58 56', '#4a6b4a', 1.4, ' opacity="0.6"')
  for (const p of [[34, 42], [46, 38], [58, 34], [66, 46], [42, 58]]) {
    s += C(p[0], p[1], 3.6, pal.accent, ' opacity="0.9"')
    s += C(p[0] - 0.6, p[1] - 0.8, 1.6, '#f0c0a0', ' opacity="0.8"')
  }
  s += E(62, 62, 6, 3.4, '#5a6e8a')
  s += P('M56 62 Q50 58 46 63 Q52 66 56 62 Z', '#5a6e8a')
  s += C(65, 60.4, 1.1, pal.paper)
  s += P('M67 62 L76 58 L72 65 Z', '#5a6e8a')
  return s
}

function mLongzhou(pal) {
  let s = ''
  for (let i = 0; i < 7; i++) s += S('M' + n(2 + i * 3) + ' ' + n(72 + i * 4) + ' q9 -2 18 0', pal.paper, 1.4, ' opacity="0.28"')
  s += P('M16 74 Q52 88 90 74 L86 82 Q52 94 20 82 Z', pal.ink)
  for (let i = 0; i < 8; i++) s += S('M' + n(26 + i * 8) + ' 80 q3 3 0 6', pal.ink3, 1.1, ' opacity="0.4"')
  // 龙首
  s += P('M18 75 L10 62 Q9 54 16 52 Q24 52 26 60 L30 70 Z', pal.ink)
  s += P('M10 62 Q3 60 3 55 Q3 50 10 51 L16 52 Z', pal.ink)
  s += P('M8 60 Q3 62 3 66 Q6 68 11 64 Z', pal.ink)
  s += P('M13 50 Q17 43 22 47 Q18 50 16 52 Z', pal.accent)
  s += C(13, 55, 2, pal.paper) + C(13, 55, 1, pal.ink)
  s += S('M4 58 q-3 3 -4 7', pal.accent, 1.2)
  s += S('M16 52 q6 -3 10 1', pal.ink3, 1, ' opacity="0.5"')
  // 龙尾
  s += P('M88 74 Q98 68 100 56 Q96 66 92 70 Q90 72 88 74 Z', pal.ink)
  // 旗
  s += L(54, 74, 54, 34, pal.ink, 2)
  s += P('M54 34 q13 4 13 11 q-10 1 -13 -3 Z', pal.accent)
  // 鼓
  s += E(44, 72, 6.4, 2.6, '#c9a06a')
  s += E(44, 69.6, 5.2, 1.6, '#8a2c22')
  // 桨手
  s += person(32, 68, 9, pal.paper)
  s += person(66, 68, 9, pal.paper)
  s += L(32, 68, 24, 80, '#8a5a34', 1.6)
  s += L(66, 68, 74, 80, '#8a5a34', 1.6)
  return s
}

function mFeiyi(pal) {
  let s = C(50, 50, 34, pal.sun, ' opacity="0.1"')
  s += C(50, 52, 31, pal.accent)
  s += C(50, 52, 31, 'none', ' stroke="#8a2c22" stroke-width="1.4" opacity="0.5"')
  let cuts = ''
  for (let i = 0; i < 6; i++) {
    cuts += G('rotate(' + (i * 60) + ' 50 52)',
      P('M50 24 C59 29 61 40 50 47 C39 40 41 29 50 24 Z', pal.paper)
      + P('M50 27.4 C55.6 31 57 37.4 50 41.8 C43 37.4 44.4 31 50 27.4 Z', pal.accent)
      + C(50, 33, 1.5, pal.paper))
  }
  s += cuts
  s += C(50, 52, 9.6, pal.paper)
  s += C(50, 52, 9.6, 'none', ' stroke="' + pal.accent + '" stroke-width="1.2"')
  for (let i = 0; i < 6; i++) s += G('rotate(' + (i * 60) + ' 50 52)', E(50, 44.4, 2, 3.6, pal.accent))
  s += C(50, 52, 2.8, pal.gold)
  s += G('translate(72 74) rotate(20)',
    S('M0 0 L17 -12', '#6a6a6a', 3) + S('M0 0 L17 12', '#6a6a6a', 3)
    + C(-1.6, 0, 2, pal.gold) + C(-4, -3, 2.2, '#8a8a8a') + C(-4, 3, 2.2, '#8a8a8a'))
  return s
}

function mMarathon(pal) {
  let s = C(50, 24, 26, pal.sun, ' opacity="0.22"')
  s += R(25, 28, 3.4, 48, pal.ink)
  s += R(71.6, 28, 3.4, 48, pal.ink)
  s += Rr(20, 20, 60, 10, 2, pal.accent)
  s += TXT(50, 27.6, 5, '#fff6ea', 'FINISH')
  s += P('M0 100 L24 78 L76 78 L100 100 Z', pal.ink2, ' opacity="0.35"')
  s += L(50, 78, 50, 96, pal.paper, 1.8, ' opacity="0.4"')
  s += L(34, 96, 66, 96, pal.paper, 3, ' opacity="0.5"')
  s += C(56, 45, 4.6, pal.ink)
  s += S('M55 50 L51 64', pal.ink, 4.6)
  s += S('M55 53 L64 58 L62 50', pal.ink, 3.4)
  s += S('M55 53 L46 49 L44 57', pal.ink, 3.4)
  s += S('M51 64 L43 76', pal.ink, 3.8)
  s += S('M51 64 L59 72 L61 81', pal.ink, 3.8)
  s += P('M43 76 q-5 3 -6 5 q6 2 9 -1 Z', pal.ink)
  s += P('M60 81 q5 1 7 -1 q-4 -3 -7 -1 Z', pal.ink)
  s += Rr(50, 53, 7, 6.6, 1, pal.paper, ' opacity="0.6"')
  s += crowd(7, 74, 56, pal.ink, mulberry32(31))
  s += R(0, 97, 100, 3, pal.paper, ' opacity="0.3"')
  return s
}

// ================= 经典景区 =================
function mDujiangyan(pal) {
  let s = ''
  for (let i = 0; i < 7; i++) s += S('M' + n(6 + i * 2) + ' ' + n(76 + i * 3.4) + ' q10 -1.6 20 0', pal.paper, 1.4, ' opacity="0.3"')
  s += P('M24 74 Q34 60 52 60 Q72 60 76 70 Q60 81 38 80 Q28 79 24 74 Z', pal.ink2)
  s += P('M24 74 Q34 60 52 60 Q72 60 76 70 Q60 81 38 80 Q28 79 24 74 Z', 'none', ' stroke="' + pal.ink + '" stroke-width="1.2" opacity="0.55"')
  s += S('M28 73 Q38 65 54 65', pal.paper, 1.4, ' opacity="0.3"')
  s += pine(36, 70, 15, pal.ink)
  s += pine(50, 71, 13, pal.ink)
  s += pine(63, 72, 11, pal.ink)
  s += bridgeSusp(4, 96, 42, pal.ink, 16)
  s += P('M82 84 Q86 64 91 58 Q96 63 97 78 Q93 90 82 84 Z', pal.ink, ' opacity="0.92"')
  s += S('M92 62 q-4 14 -2 22', pal.paper, 1.4, ' opacity="0.4"')
  s += S('M74 86 q10 5 20 2', pal.paper, 1.6, ' opacity="0.45"')
  s += steam(48, 56, 20, pal.paper, 0.18)
  return s
}

function mQingchengshan(pal) {
  let s = ''
  s += P(peakPath(18, 78, 34, 46), pal.ink, ' opacity="0.42"')
  s += P(peakPath(50, 78, 44, 38), pal.ink, ' opacity="0.55"')
  s += P(peakPath(82, 78, 32, 50), pal.ink, ' opacity="0.4"')
  s += R(0, 34, 100, 5, pal.paper, ' opacity="0.3"')
  s += R(0, 48, 100, 4, pal.paper, ' opacity="0.22"')
  for (let i = 0; i < 5; i++) s += R(50 - 13 - i * 4, 80 + i * 3.6, 26 + i * 8, 3, pal.paper, ' opacity="' + f2(0.5 - i * 0.08) + '"')
  s += gateArch(50, 78, 56, 26, pal.ink)
  s += R(42, 50, 16, 7, '#8c2c22')
  s += TXT(50, 55.4, 3.2, pal.gold, '青城山')
  s += pine(14, 96, 28, pal.ink)
  s += pine(86, 96, 26, pal.ink)
  s += pine(4, 99, 18, pal.ink)
  s += pine(96, 99, 16, pal.ink)
  s += steam(50, 34, 22, pal.paper, 0.2)
  return s
}

function mWuhouci(pal) {
  let s = ''
  s += R(0, 60, 100, 40, pal.accent, ' opacity="0.92"')
  s += P('M0 60 Q50 52 100 60 L100 63 Q50 56 0 63 Z', pal.ink)
  s += R(0, 63, 100, 1.6, pal.ink, ' opacity="0.4"')
  s += P('M40 100 L40 80 Q50 71 60 80 L60 100 Z', pal.ink)
  s += R(43, 86, 14, 14, '#7a1f18', ' opacity="0.9"')
  for (const gx of [45.5, 50, 54.5]) for (const gy of [89, 93, 97]) s += C(gx, gy, 0.8, pal.gold)
  s += gateArch(50, 66, 48, 24, pal.ink)
  s += R(42, 44, 16, 7, '#7a1f18')
  s += TXT(50, 49.4, 3, pal.gold, '武侯祠')
  s += lantern(40, 52, 3, pal, false) + lantern(60, 52, 3, pal, false)
  s += bamboo(12, 96, 26, pal.ink2)
  s += bamboo(88, 96, 24, pal.ink2)
  s += R(0, 96, 100, 4, pal.ink, ' opacity="0.35"')
  return s
}

function mKuanzhai(pal) {
  let s = P('M0 100 L33 66 L67 66 L100 100 Z', pal.paper, ' opacity="0.3"')
  for (let i = 1; i < 5; i++) s += L(50 - i * 6.6, 66 + i * 6.8, 50 + i * 6.6, 66 + i * 6.8, pal.ink3, 0.9, ' opacity="0.25"')
  s += P('M0 100 L0 40 L33 54 L33 78 Z', pal.ink)
  s += P('M-3 40 L-3 22 L36 43 L33 54 Z', pal.ink3)
  for (let i = 0; i < 5; i++) s += S('M' + n(-3 + i * 8) + ' ' + n(22 + i * 4.6) + ' L' + n(-3 + i * 8) + ' ' + n(40 + i * 4.6), pal.ink, 1, ' opacity="0.25"')
  s += P('M9 57 L9 80 L21 82 L21 60 Z', '#f2e4c8', ' opacity="0.85"')
  s += P('M24 61 L24 83 L31 84 L31 63 Z', '#f2e4c8', ' opacity="0.45"')
  s += P('M100 100 L100 40 L67 54 L67 78 Z', pal.ink)
  s += P('M103 40 L103 22 L64 43 L67 54 Z', pal.ink3)
  s += P('M91 57 L91 80 L79 82 L79 60 Z', '#f2e4c8', ' opacity="0.85"')
  s += P('M76 61 L76 83 L69 84 L69 63 Z', '#f2e4c8', ' opacity="0.45"')
  s += S('M0 32 Q50 46 100 32', pal.ink, 1.6)
  for (const x of [13, 31, 50, 69, 87]) s += lantern(x, 40 + Math.cos(x * 0.09) * 2, 3.6, pal, true)
  s += R(41, 53, 18, 8, '#7a1f18')
  s += TXT(50, 59, 3.6, pal.gold, '宽窄')
  s += bambooChair(26, 95, 18, '#7a4f2e')
  s += person(58, 91, 14, pal.ink)
  s += person(68, 92, 12, pal.ink2)
  return s
}

function panda(x, y, s, dark, light) {
  const ow = ' stroke="' + dark + '" stroke-width="' + f2(s * 0.014) + '"'
  let out = E(x, y + s * 0.12, s * 0.34, s * 0.28, light)
  out += E(x, y + s * 0.12, s * 0.34, s * 0.28, 'none', ow)
  out += E(x - s * 0.15, y + s * 0.34, s * 0.13, s * 0.08, dark)
  out += E(x + s * 0.15, y + s * 0.34, s * 0.13, s * 0.08, dark)
  out += C(x, y - s * 0.26, s * 0.25, light)
  out += C(x, y - s * 0.26, s * 0.25, 'none', ow)
  out += C(x - s * 0.19, y - s * 0.45, s * 0.088, dark)
  out += C(x + s * 0.19, y - s * 0.45, s * 0.088, dark)
  out += G('rotate(-16 ' + n(x - s * 0.09) + ' ' + n(y - s * 0.31) + ')', E(x - s * 0.09, y - s * 0.31, s * 0.062, s * 0.078, dark))
  out += G('rotate(16 ' + n(x + s * 0.09) + ' ' + n(y - s * 0.31) + ')', E(x + s * 0.09, y - s * 0.31, s * 0.062, s * 0.078, dark))
  out += C(x - s * 0.09, y - s * 0.31, s * 0.022, light)
  out += C(x + s * 0.09, y - s * 0.31, s * 0.022, light)
  out += E(x, y - s * 0.185, s * 0.03, s * 0.022, dark)
  out += S('M' + n(x - s * 0.02) + ' ' + n(y - s * 0.15) + ' q' + n(s * 0.02) + ' ' + n(s * 0.03) + ' ' + n(s * 0.04) + ' 0', dark, s * 0.018)
  out += C(x - s * 0.15, y + s * 0.02, s * 0.06, '#e8837f', ' opacity="0.35"')
  out += C(x + s * 0.15, y + s * 0.02, s * 0.06, '#e8837f', ' opacity="0.35"')
  out += E(x - s * 0.28, y + s * 0.06, s * 0.085, s * 0.15, dark)
  out += E(x + s * 0.28, y + s * 0.06, s * 0.085, s * 0.15, dark)
  out += E(x - s * 0.28, y - s * 0.01, s * 0.05, s * 0.04, light, ' opacity="0.9"')
  out += E(x + s * 0.28, y - s * 0.01, s * 0.05, s * 0.04, light, ' opacity="0.9"')
  out += L(x - s * 0.34, y - s * 0.5, x - s * 0.3, y + s * 0.34, '#6f8f45', s * 0.055)
  out += L(x + s * 0.34, y - s * 0.54, x + s * 0.3, y + s * 0.34, '#6f8f45', s * 0.055)
  for (let i = 0; i < 3; i++) {
    out += S('M' + n(x - s * 0.32) + ' ' + n(y - s * 0.34 + i * s * 0.2) + ' q' + n(-s * 0.1) + ' ' + n(-s * 0.02) + ' ' + n(-s * 0.14) + ' ' + n(s * 0.03), '#6f8f45', s * 0.022)
    out += S('M' + n(x + s * 0.32) + ' ' + n(y - s * 0.38 + i * s * 0.2) + ' q' + n(s * 0.1) + ' ' + n(-s * 0.02) + ' ' + n(s * 0.14) + ' ' + n(s * 0.03), '#6f8f45', s * 0.022)
  }
  return out
}

function mPanda(pal) {
  let s = ''
  s += bamboo(6, 96, 40, pal.ink2)
  s += bamboo(92, 96, 38, pal.ink2)
  s += bamboo(16, 97, 26, pal.ink2, 3)
  s += bamboo(82, 97, 24, pal.ink2, 3)
  s += E(50, 94, 34, 7, pal.ink, ' opacity="0.16"')
  s += panda(50, 66, 62, pal.ink, '#fbf8ef')
  return s
}

function mJinli(pal) {
  let s = ''
  s += houseRow(4, 62, 3, 30, 16, pal, { body: pal.paper, roof: pal.ink, lantern: true })
  s += R(18, 44, 4, 52, pal.ink)
  s += R(40, 40, 4, 56, pal.ink)
  s += R(56, 40, 4, 56, pal.ink)
  s += R(78, 44, 4, 52, pal.ink)
  s += P('M33 40 L50 30 L67 40 L63 44 L50 35 L37 44 Z', pal.ink)
  s += P('M10 44 L22 37 L34 44 L31 47 L22 41 L13 47 Z', pal.ink)
  s += P('M66 44 L78 37 L90 44 L87 47 L78 41 L69 47 Z', pal.ink)
  s += R(42, 46, 16, 8, '#7a1f18')
  s += TXT(50, 52.4, 3.6, pal.gold, '锦里')
  s += S('M22 52 Q50 60 78 52', pal.ink, 1.2)
  for (const x of [30, 42, 58, 70]) s += lantern(x, 56, 3, pal, true)
  s += P('M36 96 L36 78 Q50 68 64 78 L64 96 Z', '#3a1512')
  s += crowd(9, 96, 80, pal.ink, mulberry32(13))
  s += R(0, 96, 100, 4, pal.ink, ' opacity="0.3"')
  return s
}

function mDufu(pal) {
  let s = R(0, 84, 100, 16, pal.ink2, ' opacity="0.22"')
  s += R(26, 56, 48, 28, '#efe1c4', ' opacity="0.5"')
  s += R(26, 56, 48, 20, '#f7ecd6', ' opacity="0.6"')
  s += R(42, 66, 16, 18, '#5a3f28', ' opacity="0.8"')
  s += L(25, 84, 25, 42, '#8a5a34', 3.2) + L(75, 84, 75, 42, '#8a5a34', 3.2)
  s += L(40, 84, 40, 48, '#8a5a34', 2.2) + L(60, 84, 60, 48, '#8a5a34', 2.2)
  for (let k = 0; k < 3; k++) {
    const y = 32 + k * 5
    let d = 'M' + n(15 + k * 3) + ' ' + n(y + 10) + ' L' + n(17 + k * 3) + ' ' + n(y)
    for (let i = 0; i <= 10; i++) {
      const x = 17 + k * 3 + (66 - k * 6) * (i / 10)
      d += ' L' + n(x) + ' ' + n(y + (i % 2 ? 4.2 : 0.8))
    }
    d += ' L' + n(84 - k * 3) + ' ' + n(y + 10) + ' Z'
    s += P(d, k === 0 ? '#a9803a' : '#c19a52', ' opacity="' + f2(0.95 - k * 0.1) + '"')
  }
  s += P('M20 28 Q50 20 80 28 L78 32 Q50 24 22 32 Z', '#7a5a28')
  s += E(50, 90, 13, 3.6, '#a9a294')
  s += R(46, 81, 8, 9, '#9a9488')
  s += E(32, 92, 6, 2.6, '#9a9488') + E(68, 92, 6, 2.6, '#9a9488')
  s += R(18, 74, 7, 12, '#8f8a7e') + TXT(21.5, 83, 3.4, '#f4efe2', '诗')
  for (let i = 0; i < 4; i++) s += R(80 + i * 5.4, 74 - (i % 2) * 2, 1.8, 18, '#8a5a34')
  s += L(79, 82, 100, 78, '#8a5a34', 1.6) + L(79, 88, 100, 85, '#8a5a34', 1.6)
  s += bamboo(10, 99, 34, pal.ink2)
  s += bamboo(95, 99, 28, pal.ink2, 3)
  return s
}

function mJinsha(pal) {
  let s = C(36, 40, 30, pal.sun, ' opacity="0.16"')
  s += P('M54 68 L54 56 Q76 44 100 56 L100 68 Z', pal.ink2)
  s += P('M50 70 L50 60 Q76 47 104 60 L104 70 Z', pal.ink)
  for (let i = 0; i < 6; i++) s += R(58 + i * 7.4, 60, 1.8, 10, pal.paper, ' opacity="0.26"')
  s += C(36, 42, 22, pal.gold)
  s += C(36, 42, 22, 'none', ' stroke="#8a6a2a" stroke-width="1.2" opacity="0.55"')
  s += C(36, 42, 15, 'none', ' stroke="' + pal.paper + '" stroke-width="1.8" opacity="0.85"')
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6
    s += L(36 + Math.cos(a) * 16, 42 + Math.sin(a) * 16, 36 + Math.cos(a) * 21, 42 + Math.sin(a) * 21, pal.paper, 1.3, ' opacity="0.5"')
  }
  const bird = (rot) => G('rotate(' + rot + ' 36 42)', S('M36 27 q7 3 2 8 q-4 2 -2 6', pal.paper, 2) + S('M36 27 q-7 2 -8 7', pal.paper, 1.6) + C(36, 29.4, 1, pal.paper))
  s += bird(0) + bird(90) + bird(180) + bird(270)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += R(12 + i * 7.6, 78 + j * 6, 5.6, 4.4, pal.paper, ' opacity="0.3"')
  s += R(0, 97, 100, 3, pal.ink, ' opacity="0.3"')
  return s
}

function mXiling(pal) {
  const pk = [[24, 80, 38, 54], [52, 80, 44, 64], [78, 80, 32, 46]]
  let s = ''
  for (let i = 0; i < pk.length; i++) {
    const p = pk[i]
    s += P(peakPath(p[0], p[1], p[2], p[3]), i === 1 ? pal.ink2 : pal.ink3, ' opacity="' + f2(0.72 + i * 0.05) + '"')
    s += P('M' + n(p[0]) + ' ' + n(p[1] - p[3]) + ' L' + n(p[0] + p[2] * 0.24) + ' ' + n(p[1] - p[3] * 0.52) + ' L' + n(p[0] + p[2] * 0.1) + ' ' + n(p[1] - p[3] * 0.46) + ' L' + n(p[0]) + ' ' + n(p[1] - p[3] * 0.38) + ' L' + n(p[0] - p[2] * 0.1) + ' ' + n(p[1] - p[3] * 0.46) + ' L' + n(p[0] - p[2] * 0.24) + ' ' + n(p[1] - p[3] * 0.52) + ' Z', '#fbfdff', ' opacity="0.9"')
  }
  s += R(0, 52, 100, 4, pal.paper, ' opacity="0.3"')
  s += S('M2 28 L98 20', pal.ink, 1.4)
  s += L(2, 28, 2, 40, pal.ink, 2) + L(98, 20, 98, 32, pal.ink, 2)
  s += Rr(28, 24, 9, 7, 1.4, pal.accent) + Rr(62, 20, 9, 7, 1.4, pal.accent)
  s += L(32, 24, 32, 18, pal.ink, 1.2) + L(66, 20, 66, 14, pal.ink, 1.2)
  s += Rr(28, 24, 9, 2, 1, pal.paper, ' opacity="0.6"')
  s += pine(10, 94, 26, pal.ink2) + pine(90, 94, 24, pal.ink2) + pine(20, 99, 16, pal.ink2)
  s += person(52, 94, 15, pal.ink)
  s += L(45, 94, 36, 100, pal.ink, 2.2) + L(59, 94, 68, 100, pal.ink, 2.2)
  s += R(0, 96, 100, 4, '#fdfdff', ' opacity="0.5"')
  return s
}

function mTaikoo(pal) {
  let s = ''
  const tw = [[15, 21, 52], [40, 27, 66], [71, 19, 44]]
  for (const t of tw) {
    s += R(t[0], 72 - t[2], t[1], t[2], pal.ink2)
    for (let i = 1; i < 4; i++) s += R(t[0] + t[1] * (i / 4), 72 - t[2], 1.2, t[2], pal.paper, ' opacity="0.2"')
    for (let j = 1; j < 7; j++) s += R(t[0], 72 - t[2] + t[2] * (j / 7), t[1], 1.1, pal.paper, ' opacity="0.15"')
    s += R(t[0] + t[1] * 0.3, 72 - t[2] + t[2] * 0.18, t[1] * 0.14, t[2] * 0.08, pal.gold, ' opacity="0.55"')
  }
  s += P('M2 78 Q6 75 11 70 L19 61 L50 57 L81 61 L89 70 Q94 75 98 78 L98 88 L2 88 Z', '#7a3126')
  s += R(18, 55, 64, 6, '#5e241c')
  s += R(13, 55, 5, 4, '#5e241c') + R(82, 55, 5, 4, '#5e241c')
  for (let i = 0; i < 12; i++) s += S('M' + n(9 + i * 7) + ' ' + n(63 + Math.abs(i - 5.5) * 1.4) + ' q1 6 0 15', '#c07a62', 1, ' opacity="0.4"')
  s += R(41, 73, 18, 13, '#25100c', ' opacity="0.92"')
  s += R(38, 70, 24, 3, pal.gold, ' opacity="0.55"')
  s += tree(6, 97, 18, pal.ink2) + tree(94, 97, 18, pal.ink2)
  return s
}

// ================= 城市介绍 =================
function mHistory(pal) {
  let s = R(0, 64, 100, 36, pal.ink)
  for (let i = 0; i < 13; i++) s += R(i * 7.8, 59, 5, 5.4, pal.ink)
  s += R(0, 64, 100, 1.8, pal.ink3, ' opacity="0.5"')
  s += P('M38 100 L38 80 Q50 70 62 80 L62 100 Z', '#08161a')
  s += R(39, 88, 22, 12, pal.accent, ' opacity="0.9"')
  s += pagoda(84, 64, 44, pal.ink)
  s += Rr(20, 14, 60, 28, 2, pal.paper)
  s += Rr(20, 14, 60, 28, 2, 'none', ' stroke="' + pal.ink3 + '" stroke-width="1" opacity="0.5"')
  s += R(13, 12, 7, 32, '#8a5a34', ' rx="3"')
  s += R(80, 12, 7, 32, '#8a5a34', ' rx="3"')
  s += TXT(50, 30, 11, pal.ink, '2300')
  s += TXT(50, 38, 3, pal.ink3, '年建城史 · 城址未移')
  s += R(0, 96, 100, 4, pal.ink, ' opacity="0.4"')
  return s
}

function mGeo(pal) {
  let s = P(peakPath(14, 64, 30, 44), pal.ink, ' opacity="0.55"')
  s += P(peakPath(38, 64, 26, 32), pal.ink, ' opacity="0.42"')
  s += P('M37 64 L43 51 L49 59 L53 64 Z', '#fbfdff', ' opacity="0.55"')
  s += P('M52 64 L100 64 L100 96 L44 96 Z', pal.ink3, ' opacity="0.2"')
  const fd = [[55, 66], [73, 69], [86, 66], [58, 82], [78, 84], [90, 79]]
  for (let i = 0; i < fd.length; i++) {
    const x = fd[i][0]
    const y = fd[i][1]
    s += P('M' + n(x) + ' ' + n(y) + ' L' + n(x + 12) + ' ' + n(y - 2) + ' L' + n(x + 14) + ' ' + n(y + 8) + ' L' + n(x + 2) + ' ' + n(y + 10) + ' Z', pal.paper, ' opacity="' + f2(0.12 + (i % 3) * 0.05) + '"')
  }
  s += S('M50 70 C64 74 72 84 92 88', pal.water, 5, ' opacity="0.9"')
  s += S('M52 62 C66 64 78 70 96 72', pal.water, 3.4, ' opacity="0.7"')
  s += L(90, 18, 90, 92, pal.ink, 1.6)
  for (let i = 0; i <= 6; i++) s += L(88 - (i % 2 ? 0 : 2.4), 18 + i * 12.3, 90, 18 + i * 12.3, pal.ink, 1.1)
  s += TXT(80, 16, 3, pal.ink2, '5000m')
  s += TXT(80, 95, 3, pal.ink2, '500m')
  s += R(0, 96, 100, 4, pal.ink, ' opacity="0.3"')
  return s
}

function mCultureCity(pal) {
  let s = C(50, 50, 36, pal.sun, ' opacity="0.12"')
  const cx = [22, 50, 78]
  for (const x of cx) {
    s += C(x, 50, 15, pal.paper)
    s += C(x, 50, 15, 'none', ' stroke="' + pal.gold + '" stroke-width="1.8"')
  }
  const f = cx[0]
  const face = 'M' + n(f) + ' 40 C' + n(f + 7) + ' 40 ' + n(f + 9) + ' 46 ' + n(f + 9) + ' 52 C' + n(f + 9) + ' 60 ' + n(f + 5) + ' 65 ' + n(f) + ' 67 C' + n(f - 5) + ' 65 ' + n(f - 9) + ' 60 ' + n(f - 9) + ' 52 C' + n(f - 9) + ' 46 ' + n(f - 7) + ' 40 ' + n(f) + ' 40 Z'
  s += P(face, pal.paper)
  s += P(face, 'none', ' stroke="' + pal.ink + '" stroke-width="1.2" opacity="0.5"')
  s += P('M' + n(f) + ' 41 q3 4 0 7 q-3 -3 0 -7 Z', pal.accent)
  s += E(f - 4, 51, 3.4, 2.2, pal.accent) + E(f + 4, 51, 3.4, 2.2, pal.accent)
  s += C(f - 4, 51, 1.3, pal.ink) + C(f + 4, 51, 1.3, pal.ink)
  s += P('M' + n(f - 2.4) + ' 60 q2.4 2 4.8 0 q-2.4 -1.4 -4.8 0 Z', pal.accent)
  const b = cx[1]
  s += P('M' + n(b - 14) + ' 60 Q' + n(b - 7) + ' 53 ' + n(b) + ' 56 L' + n(b) + ' 64 Q' + n(b - 7) + ' 61 ' + n(b - 14) + ' 65 Z', pal.paper)
  s += P('M' + n(b + 14) + ' 60 Q' + n(b + 7) + ' 53 ' + n(b) + ' 56 L' + n(b) + ' 64 Q' + n(b + 7) + ' 61 ' + n(b + 14) + ' 65 Z', '#efe3c6')
  s += P('M' + n(b - 14) + ' 60 Q' + n(b - 7) + ' 53 ' + n(b) + ' 56 M' + n(b + 14) + ' 60 Q' + n(b + 7) + ' 53 ' + n(b) + ' 56', 'none', ' stroke="' + pal.ink + '" stroke-width="1.2" opacity="0.65"')
  s += L(b, 56, b, 64.6, pal.ink, 1.4)
  for (let i = 0; i < 3; i++) {
    s += S('M' + n(b - 11.4) + ' ' + n(58.6 - i * 0.4) + ' q4.6 -2 8.6 -0.6', pal.ink3, 0.9, ' opacity="0.55"')
    s += S('M' + n(b + 2.8) + ' ' + n(58 + i * 0.4) + ' q4.6 1.4 8.6 0.6', pal.ink3, 0.9, ' opacity="0.45"')
  }
  const t = cx[2]
  s += E(t, 60, 11, 3.6, pal.paper)
  s += P('M' + n(t - 8) + ' 52 Q' + n(t - 7.4) + ' 59 ' + n(t) + ' 59.6 Q' + n(t + 7.4) + ' 59 ' + n(t + 8) + ' 52 Z', '#f0e2c2')
  s += E(t, 52, 8, 2.8, '#cfa14c')
  s += E(t, 50.6, 9.4, 3, pal.paper)
  s += C(t, 47.4, 2, pal.paper)
  s += E(t, 60, 11, 3.6, 'none', ' stroke="' + pal.ink3 + '" stroke-width="1" opacity="0.5"')
  return s
}

function mLife(pal) {
  let s = C(18, 32, 17, pal.ink2, ' opacity="0.5"')
  s += C(5, 42, 11, pal.ink2, ' opacity="0.4"')
  s += C(32, 41, 12, pal.ink2, ' opacity="0.36"')
  s += L(18, 46, 18, 68, '#6b4a2e', 3.4)
  s += Rr(24, 62, 52, 6, 1.6, '#8a5a34')
  s += L(27, 68, 27, 84, '#6b4a2e', 3) + L(73, 68, 73, 84, '#6b4a2e', 3)
  s += L(31, 84, 31, 96, '#6b4a2e', 2.6) + L(69, 84, 69, 96, '#6b4a2e', 2.6)
  const cup = (x) => E(x, 60, 6.4, 2.2, pal.paper) + P('M' + n(x - 4.6) + ' 55 Q' + n(x - 4.2) + ' 60 ' + n(x) + ' 60.4 Q' + n(x + 4.2) + ' 60 ' + n(x + 4.6) + ' 55 Z', pal.paper) + E(x, 55, 4.6, 1.6, '#cfa14c') + E(x, 54.2, 5.4, 1.8, pal.paper)
  s += cup(37) + cup(63)
  s += P('M45 58 Q45 52 50 52 Q55 52 55 58 Q50 60 45 58 Z', pal.paper)
  s += L(55, 55, 59, 53, pal.paper, 1.6) + L(45, 55, 41, 53, pal.paper, 1.6)
  s += Rr(47, 58.4, 5, 3.4, 0.6, '#efe3c6') + Rr(53, 58.8, 5, 3.4, 0.6, '#efe3c6')
  s += bambooChair(24, 89, 20, '#8a5a34')
  s += bambooChair(76, 89, 20, '#8a5a34')
  s += person(31, 82, 14, pal.ink)
  s += person(69, 82, 14, pal.ink)
  s += R(0, 96, 100, 4, pal.ink, ' opacity="0.28"')
  return s
}

// ================= 游记攻略 =================
function m3days(pal) {
  let s = E(50, 84, 34, 6, '#000', ' opacity="0.12"')
  s += P('M18 30 L46 22 L46 74 L18 82 Z', pal.paper)
  s += P('M46 22 L74 30 L74 82 L46 74 Z', '#f1e6cd')
  s += P('M18 30 L46 22 L46 74 L18 82 Z', 'none', ' stroke="' + pal.ink3 + '" stroke-width="1.2" opacity="0.6"')
  s += P('M46 22 L74 30 L74 82 L46 74 Z', 'none', ' stroke="' + pal.ink3 + '" stroke-width="1.2" opacity="0.6"')
  s += L(46, 22, 46, 74, pal.ink3, 1.2, ' opacity="0.5"')
  s += S('M26 62 C34 52 40 50 44 44 C50 36 56 38 62 44 C68 50 70 56 66 64', pal.accent, 1.6, ' stroke-dasharray="3 2.6"')
  for (const p of [[26, 62], [44, 44], [66, 64]]) {
    s += C(p[0], p[1], 3.4, pal.accent)
    s += C(p[0], p[1], 3.4, 'none', ' stroke="' + pal.paper + '" stroke-width="1"')
  }
  s += TXT(26, 63.4, 3.4, pal.paper, '1')
  s += TXT(44, 45.4, 3.4, pal.paper, '2')
  s += TXT(66, 65.4, 3.4, pal.paper, '3')
  s += Rr(46, 30, 22, 8, 1.6, '#7a1f18')
  s += TXT(57, 36, 4, pal.gold, '3 DAYS')
  s += S('M20 36 q4 5 0 10', pal.ink3, 0.9, ' opacity="0.4"')
  s += S('M22 36 q4 5 0 10', pal.ink3, 0.9, ' opacity="0.4"')
  return s
}

function mPandaGuide(pal) {
  let s = C(50, 30, 24, pal.sun, ' opacity="0.3"')
  s += bamboo(8, 94, 34, pal.ink2)
  s += bamboo(92, 94, 32, pal.ink2)
  s += E(50, 94, 30, 6, pal.ink, ' opacity="0.14"')
  s += panda(50, 68, 54, pal.ink, '#fbf8ef')
  s += C(40, 22, 2, pal.gold, ' opacity="0.6"')
  s += C(62, 18, 1.4, pal.gold, ' opacity="0.5"')
  return s
}

function mMuseum(pal) {
  let s = ''
  const xs = [26, 50, 74]
  for (let i = 0; i < 3; i++) {
    const x = xs[i]
    s += P('M' + n(x - 9) + ' 24 L' + n(x + 9) + ' 24 L' + n(x + 13) + ' 84 L' + n(x - 13) + ' 84 Z', pal.paper, ' opacity="0.12"')
    s += Rr(x - 14, 34, 28, 44, 1.6, pal.paper, ' opacity="0.16"')
    s += Rr(x - 14, 34, 28, 44, 1.6, 'none', ' stroke="' + pal.paper + '" stroke-width="1.4" opacity="0.55"')
    s += L(x - 14, 34, x + 14, 34, pal.paper, 2, ' opacity="0.5"')
    s += Rr(x - 12, 76, 24, 5, 1, pal.ink, ' opacity="0.8"')
  }
  s += C(26, 56, 6, '#d9a95c')
  s += P('M20 56 Q20 48 26 48 Q32 48 32 56 Z', '#c9a45c')
  s += C(26, 53, 1.2, pal.ink) + C(23, 53, 1.2, pal.ink)
  s += P('M22 50 q4 -3 8 0', '#8a4a30')
  s += E(50, 62, 7, 7, '#b5926a')
  s += E(50, 58, 4.4, 3, '#c9a45c')
  s += R(48, 68, 4, 8, '#b5926a')
  s += C(74, 58, 6.6, '#d9a95c')
  s += C(74, 58, 3.4, 'none', ' stroke="' + pal.paper + '" stroke-width="1.2" opacity="0.8"')
  s += R(72, 64, 4, 12, '#8a6a2a')
  s += person(50, 92, 14, pal.ink)
  s += R(0, 88, 100, 1.4, pal.paper, ' opacity="0.2"')
  return s
}

function mNight(pal) {
  let s = towerBlock(16, 68, 13, 30, pal.ink, true)
  s += towerBlock(33, 68, 11, 20, pal.ink, true)
  s += towerBlock(47, 68, 14, 34, pal.ink, true)
  s += towerBlock(65, 68, 12, 24, pal.ink, true)
  s += towerBlock(81, 68, 13, 28, pal.ink, true)
  s += S('M2 68 Q50 52 98 68', pal.paper, 2.4, ' opacity="0.6"')
  for (let i = 1; i < 6; i++) s += L(2 + i * 16, 68 - Math.sin((i / 6) * Math.PI) * 9, 2 + i * 16, 72, pal.paper, 1.1, ' opacity="0.35"')
  s += R(0, 72, 100, 28, pal.water, ' opacity="0.5"')
  for (let i = 0; i < 7; i++) s += R(12 + i * 11, 77 + i * 3, 7, 1.3, pal.gold, ' opacity="0.35"')
  s += C(50, 82, 8, pal.gold, ' opacity="0.16"')
  s += C(50, 82, 5, pal.gold, ' opacity="0.3"')
  s += E(50, 74, 9, 2.6, pal.ink, ' opacity="0.5"')
  return s
}

function mFamily(pal) {
  let s = C(46, 30, 26, pal.sun, ' opacity="0.22"')
  s += S('M78 16 L88 36 L72 32 Z', pal.accent)
  s += S('M78 16 L72 34', pal.ink, 0.9, ' opacity="0.5"')
  s += S('M78 16 Q60 44 46 62', pal.ink, 0.9, ' opacity="0.35"')
  s += P('M0 82 Q50 74 100 82 L100 100 L0 100 Z', pal.ink2, ' opacity="0.22"')
  s += R(0, 88, 100, 12, pal.ink2, ' opacity="0.4"')
  // 大人两人 + 中间孩子，牵手
  s += person(34, 88, 34, pal.ink)
  s += person(66, 88, 32, pal.ink)
  s += person(50, 90, 20, '#6b1a14')
  s += L(41, 74, 46, 80, pal.ink, 3)
  s += L(59, 74, 54, 80, pal.ink, 3)
  // 婴儿车
  s += P('M74 88 Q74 78 82 78 L92 78 Q94 84 94 88 Z', pal.ink2)
  s += C(78, 89, 2.6, pal.ink) + C(90, 89, 2.6, pal.ink)
  s += L(74, 78, 86, 68, pal.ink, 2)
  // 气球
  s += S('M28 66 Q24 56 27 50', pal.paper, 1.2, ' opacity="0.8"')
  s += E(26, 45, 5, 5.8, pal.accent)
  s += C(25, 44, 1.4, pal.paper, ' opacity="0.75"')
  s += E(38, 40, 4, 4.6, pal.gold, ' opacity="0.9"')
  s += S('M38 46 Q36 54 34 62', pal.paper, 1, ' opacity="0.55"')
  s += tree(12, 94, 22, pal.ink2)
  s += tree(92, 96, 18, pal.ink2)
  return s
}

function mDujiangyanGuide(pal) {
  let s = ''
  const wt = 'M2 52 Q26 47 50 52 Q74 56 98 49'
  s += P(wt + ' L98 84 Q74 88 50 84 Q26 80 2 84 Z', pal.water, ' opacity="0.85"')
  s += S(wt, pal.paper, 1.6, ' opacity="0.45"')
  s += S('M4 62 Q28 58 52 62 Q76 66 96 59', pal.paper, 1.2, ' opacity="0.28"')
  s += S('M4 72 Q28 68 52 72 Q76 76 96 69', pal.paper, 1.2, ' opacity="0.22"')
  const fish = 'M30 49 Q43 58 43 64 Q43 71 30 81 Q25 64 30 49 Z'
  s += P(fish, pal.ink2)
  s += P(fish, 'none', ' stroke="' + pal.ink + '" stroke-width="1.2" opacity="0.6"')
  s += S('M31 56 Q36 62 34 75', pal.paper, 1.2, ' opacity="0.3"')
  s += pine(33, 58, 12, pal.ink)
  s += R(52, 60, 4.4, 20, pal.ink, ' opacity="0.85"')
  for (let i = 0; i < 3; i++) s += R(53.2, 63 + i * 5, 2, 2, pal.paper, ' opacity="0.45"')
  s += R(83, 44, 5, 40, pal.ink, ' opacity="0.9"')
  s += R(92, 44, 5, 40, pal.ink, ' opacity="0.9"')
  s += P('M83 44 Q90 35 97 44 Z', pal.ink2)
  s += TXT(23, 43, 2.4, pal.ink2, '鱼嘴')
  s += TXT(54.2, 56, 2.2, pal.ink2, '飞沙堰')
  s += TXT(88, 41, 2.2, pal.ink2, '宝瓶口')
  s += R(0, 86, 100, 14, pal.ink3, ' opacity="0.18"')
  return s
}

// ================= 宽幅主视觉（画布坐标） =================
function pavilion(x, y, w, color, pal) {
  let s = R(x - w * 0.42, y - 4, w * 0.84, 5, pal.ink2)
  s += L(x - w * 0.3, y - 6, x - w * 0.3, y - w * 0.42, color, 3)
  s += L(x + w * 0.3, y - 6, x + w * 0.3, y - w * 0.42, color, 3)
  s += L(x - w * 0.12, y - 6, x - w * 0.12, y - w * 0.42, color, 2.2)
  s += L(x + w * 0.12, y - 6, x + w * 0.12, y - w * 0.42, color, 2.2)
  const ry = y - w * 0.44
  s += P('M' + n(x - w * 0.62) + ' ' + n(ry) + ' Q' + n(x - w * 0.5) + ' ' + n(ry - w * 0.1) + ' ' + n(x - w * 0.34) + ' ' + n(ry - w * 0.16)
    + ' L' + n(x) + ' ' + n(ry - w * 0.34) + ' L' + n(x + w * 0.34) + ' ' + n(ry - w * 0.16)
    + ' Q' + n(x + w * 0.5) + ' ' + n(ry - w * 0.1) + ' ' + n(x + w * 0.62) + ' ' + n(ry)
    + ' L' + n(x + w * 0.46) + ' ' + n(ry - w * 0.04) + ' L' + n(x) + ' ' + n(ry - w * 0.24)
    + ' L' + n(x - w * 0.46) + ' ' + n(ry - w * 0.04) + ' Z', color)
  s += L(x, ry - w * 0.34, x, ry - w * 0.46, color, 2.4)
  return s
}

function heroOne(w, h, pal, rnd) {
  let s = ''
  // 远处雪山
  s += P(peakPath(w * 0.62, h * 0.62, w * 0.34, h * 0.3), pal.ink3, ' opacity="0.45"')
  s += P(peakPath(w * 0.78, h * 0.62, w * 0.3, h * 0.24), pal.ink3, ' opacity="0.35"')
  s += P('M' + n(w * 0.7) + ' ' + n(h * 0.32) + ' L' + n(w * 0.76) + ' ' + n(h * 0.43) + ' L' + n(w * 0.66) + ' ' + n(h * 0.43) + ' Z', '#ffffff', ' opacity="0.5"')
  // 河岸
  s += P('M0 ' + n(h * 0.66) + ' Q' + n(w * 0.3) + ' ' + n(h * 0.62) + ' ' + n(w * 0.55) + ' ' + n(h * 0.67) + ' T' + n(w) + ' ' + n(h * 0.64) + ' L' + n(w) + ' ' + n(h) + ' L0 ' + n(h) + ' Z', pal.ink, ' opacity="0.5"')
  // 合江亭
  s += pavilion(w * 0.62, h * 0.74, w * 0.12, pal.ink, pal)
  s += R(w * 0.55, h * 0.72, w * 0.13, h * 0.03, pal.ink2)
  // 竹
  s += bamboo(w * 0.1, h * 0.92, h * 0.42, pal.ink, 5)
  s += bamboo(w * 0.17, h * 0.93, h * 0.34, pal.ink, 4)
  s += bamboo(w * 0.045, h * 0.94, h * 0.28, pal.ink, 3)
  // 小舟
  s += P('M' + n(w * 0.34) + ' ' + n(h * 0.79) + ' q' + n(w * 0.045) + ' ' + n(h * 0.02) + ' ' + n(w * 0.09) + ' 0 q' + n(-w * 0.045) + ' ' + n(h * 0.022) + ' ' + n(-w * 0.09) + ' 0 Z', pal.ink)
  s += L(w * 0.385, h * 0.7, w * 0.385, h * 0.79, pal.ink, 1.6)
  s += P('M' + n(w * 0.385) + ' ' + n(h * 0.72) + ' q' + n(w * 0.02) + ' ' + n(h * 0.03) + ' 0 ' + n(h * 0.05) + ' Z', pal.paper, ' opacity="0.7"')
  // 江面横纹
  for (let i = 0; i < 8; i++) {
    s += R(w * (0.05 + rnd() * 0.5), h * (0.8 + i * 0.022), w * (0.08 + rnd() * 0.22), 2, pal.paper, ' opacity="0.18"')
  }
  return s
}

function heroTwo(w, h, pal) {
  let s = ''
  s += P(peakPath(w * 0.24, h * 0.66, w * 0.36, h * 0.42), pal.ink3, ' opacity="0.55"')
  s += P(peakPath(w * 0.5, h * 0.66, w * 0.32, h * 0.34), pal.ink3, ' opacity="0.45"')
  s += P(peakPath(w * 0.84, h * 0.66, w * 0.3, h * 0.3), pal.ink3, ' opacity="0.4"')
  s += P('M' + n(w * 0.24) + ' ' + n(h * 0.24) + ' L' + n(w * 0.34) + ' ' + n(h * 0.43) + ' L' + n(w * 0.29) + ' ' + n(h * 0.38) + ' L' + n(w * 0.24) + ' ' + n(h * 0.34) + ' L' + n(w * 0.19) + ' ' + n(h * 0.39) + ' L' + n(w * 0.14) + ' ' + n(h * 0.43) + ' Z', '#fbfdff', ' opacity="0.8"')
  // 城市天际线
  const blocks = [[0.02, 0.1, 0.1], [0.13, 0.08, 0.16], [0.22, 0.11, 0.12], [0.34, 0.07, 0.2], [0.42, 0.1, 0.14], [0.53, 0.09, 0.22], [0.63, 0.12, 0.16], [0.76, 0.08, 0.24], [0.85, 0.1, 0.18], [0.95, 0.07, 0.14]]
  for (const b of blocks) s += towerBlock(w * b[0], h * 0.78, w * b[1], h * b[2], pal.ink, true)
  // 绿道与树
  s += P('M0 ' + n(h * 0.76) + ' Q' + n(w * 0.5) + ' ' + n(h * 0.72) + ' ' + n(w) + ' ' + n(h * 0.77) + ' L' + n(w) + ' ' + n(h) + ' L0 ' + n(h) + ' Z', pal.ink2, ' opacity="0.9"')
  for (let i = 0; i < 9; i++) s += tree(w * (0.05 + i * 0.115), h * 0.86, h * (0.1 + (i % 3) * 0.03), pal.ink)
  // 骑行者
  s += C(w * 0.46, h * 0.8, h * 0.012, pal.paper, ' opacity="0.8"')
  return s
}

function heroThree(w, h, pal) {
  let s = ''
  // 巷子两侧山墙
  s += P('M0 ' + n(h * 0.16) + ' L' + n(w * 0.2) + ' ' + n(h * 0.34) + ' L' + n(w * 0.2) + ' ' + n(h) + ' L0 ' + n(h) + ' Z', pal.ink, ' opacity="0.9"')
  s += P('M' + n(w) + ' ' + n(h * 0.12) + ' L' + n(w * 0.8) + ' ' + n(h * 0.32) + ' L' + n(w * 0.8) + ' ' + n(h) + ' L' + n(w) + ' ' + n(h) + ' Z', pal.ink, ' opacity="0.9"')
  // 屋檐
  s += P('M0 ' + n(h * 0.16) + ' L' + n(w * 0.22) + ' ' + n(h * 0.35) + ' L' + n(w * 0.22) + ' ' + n(h * 0.31) + ' L0 ' + n(h * 0.12) + ' Z', pal.ink2)
  s += P('M' + n(w) + ' ' + n(h * 0.12) + ' L' + n(w * 0.78) + ' ' + n(h * 0.33) + ' L' + n(w * 0.78) + ' ' + n(h * 0.29) + ' L' + n(w) + ' ' + n(h * 0.08) + ' Z', pal.ink2)
  // 远处屋脊与天
  s += R(w * 0.2, h * 0.46, w * 0.6, h * 0.54, pal.ink, ' opacity="0.75"')
  s += P('M' + n(w * 0.2) + ' ' + n(h * 0.46) + ' L' + n(w * 0.5) + ' ' + n(h * 0.4) + ' L' + n(w * 0.8) + ' ' + n(h * 0.46) + ' Z', pal.ink2)
  // 灯笼串
  s += S('M' + n(w * 0.06) + ' ' + n(h * 0.24) + ' Q' + n(w * 0.3) + ' ' + n(h * 0.36) + ' ' + n(w * 0.94) + ' ' + n(h * 0.2), pal.ink, 1.6)
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6
    const x = w * 0.06 + t * w * 0.88
    const y = h * 0.24 + Math.sin(Math.PI * t) * h * 0.12
    s += lantern(x, y + h * 0.06, h * 0.045, pal, true)
  }
  // 摊位与蒸汽
  s += R(w * 0.6, h * 0.7, w * 0.16, h * 0.3, pal.ink2)
  s += P('M' + n(w * 0.58) + ' ' + n(h * 0.7) + ' L' + n(w * 0.68) + ' ' + n(h * 0.62) + ' L' + n(w * 0.78) + ' ' + n(h * 0.7) + ' Z', pal.accent)
  s += steam(w * 0.68, h * 0.6, w * 0.02, pal.paper, 0.4)
  // 食客与行人
  s += person(w * 0.4, h * 0.92, h * 0.16, pal.ink)
  s += person(w * 0.5, h * 0.94, h * 0.14, pal.ink)
  s += person(w * 0.9, h * 0.9, h * 0.13, pal.ink)
  return s
}

function heroFour(w, h, pal, rnd) {
  let s = ''
  s += C(w * 0.78, h * 0.18, h * 0.055, '#f6efd8', ' opacity="0.95"')
  s += C(w * 0.78, h * 0.18, h * 0.13, '#f6efd8', ' opacity="0.1"')
  // 天际线
  const blocks = [[0.02, 0.07, 0.2], [0.1, 0.06, 0.28], [0.17, 0.08, 0.16], [0.26, 0.06, 0.34], [0.33, 0.09, 0.22], [0.44, 0.07, 0.3], [0.58, 0.08, 0.24], [0.66, 0.06, 0.36], [0.74, 0.09, 0.26], [0.86, 0.07, 0.32], [0.94, 0.06, 0.2]]
  for (const b of blocks) s += towerBlock(w * b[0], h * 0.68, w * b[1], h * b[2], pal.ink, true)
  // 桥
  s += P('M0 ' + n(h * 0.66) + ' Q' + n(w * 0.5) + ' ' + n(h * 0.5) + ' ' + n(w) + ' ' + n(h * 0.66) + ' L' + n(w) + ' ' + n(h * 0.71) + ' Q' + n(w * 0.5) + ' ' + n(h * 0.56) + ' 0 ' + n(h * 0.71) + ' Z', pal.ink)
  s += R(w * 0.2, h * 0.56, 3, h * 0.1, pal.ink) + R(w * 0.5, h * 0.52, 3, h * 0.14, pal.ink) + R(w * 0.8, h * 0.56, 3, h * 0.1, pal.ink)
  for (let i = 0; i < 7; i++) s += C(w * (0.14 + i * 0.12), h * (0.6 - Math.sin((i / 6) * Math.PI) * 0.06), h * 0.008, '#f6e2b0')
  // 水面倒影
  s += R(0, h * 0.71, w, h * 0.29, pal.water, ' opacity="0.9"')
  for (let i = 0; i < 14; i++) s += R(w * (0.04 + rnd() * 0.86), h * (0.75 + rnd() * 0.2), w * (0.02 + rnd() * 0.06), 2, '#f6e2b0', ' opacity="' + f2(0.1 + rnd() * 0.22) + '"')
  s += C(w * 0.78, h * 0.82, h * 0.03, '#f6efd8', ' opacity="0.25"')
  return s
}

function heroService(w, h, pal) {
  const base = h * 0.8
  let s = C(w * 0.76, h * 0.16, Math.min(w, h) * 0.3, pal.sun, ' opacity="0.18"')
  const bl = [
    [0.04, 0.3, 0.1], [0.14, 0.46, 0.09], [0.24, 0.26, 0.1], [0.34, 0.38, 0.08],
    [0.43, 0.22, 0.09], [0.53, 0.34, 0.08], [0.62, 0.28, 0.1], [0.73, 0.42, 0.08],
    [0.82, 0.3, 0.09], [0.92, 0.24, 0.08],
  ]
  for (let i = 0; i < bl.length; i++) {
    const x = w * bl[i][0]
    const hh = h * bl[i][1]
    const ww = w * bl[i][2]
    s += R(x, base - hh, ww, hh, pal.ink, ' opacity="0.9"')
    const cols = 3
    const rows = Math.max(3, Math.round(hh / (h * 0.05)))
    for (let a = 0; a < cols; a++) {
      for (let b = 0; b < rows; b++) {
        if ((a + b + i) % 3 === 0) {
          s += R(x + ww * (0.18 + a * 0.27), base - hh + hh * (0.1 + b * 0.15), ww * 0.13, h * 0.016, pal.gold, ' opacity="0.6"')
        }
      }
    }
  }
  const bx = [w * 0.24, w * 0.42, w * 0.6, w * 0.78]
  const by = [h * 0.44, h * 0.4, h * 0.44, h * 0.38]
  s += S('M' + n(bx[0]) + ' ' + n(by[0]) + ' L' + n(bx[1]) + ' ' + n(by[1]) + ' L' + n(bx[2]) + ' ' + n(by[2]) + ' L' + n(bx[3]) + ' ' + n(by[3]), pal.paper, 1.6, ' opacity="0.38" stroke-dasharray="6 7"')
  const r = h * 0.062
  for (let i = 0; i < 4; i++) {
    s += C(bx[i], by[i], r * 1.3, pal.paper, ' opacity="0.16"')
    s += C(bx[i], by[i], r, pal.paper, ' opacity="0.95"')
    s += C(bx[i], by[i], r, 'none', ' stroke="' + pal.gold + '" stroke-width="1.8"')
  }
  const k = r / 60
  s += G('translate(' + n(bx[0]) + ' ' + n(by[0]) + ') scale(' + f2(k * 1.7) + ')',
    Rr(-17, -11, 34, 21, 4, pal.ink) + R(6, -5, 12, 11, pal.ink) + C(-9, 6, 2.6, pal.ink) + C(2, 6, 2.6, pal.ink)
    + R(-11, -6, 8, 8, pal.gold, ' opacity="0.7"') + R(-1, -6, 8, 8, pal.gold, ' opacity="0.5"'))
  s += G('translate(' + n(bx[1]) + ' ' + n(by[1]) + ') scale(' + f2(k * 1.7) + ')',
    L(0, -12, 0, 12, pal.accent, 8) + L(-12, 0, 12, 0, pal.accent, 8))
  s += G('translate(' + n(bx[2]) + ' ' + n(by[2]) + ') scale(' + f2(k * 1.7) + ')',
    P('M-10 -13 q-5 0 -5 5 l2 16 q0 4 4 4 l4 0 l0 4 l3 0 l0 -4 l3 0 l0 4 l3 0 l0 -4 l4 0 q4 0 4 -4 l2 -16 q0 -5 -5 -5 Z', pal.ink))
  s += G('translate(' + n(bx[3]) + ' ' + n(by[3]) + ') scale(' + f2(k * 1.7) + ')',
    Rr(-16, -12, 32, 24, 3, pal.accent) + R(-16, -12, 9, 24, '#8a2c22') + C(-1, 0, 3.4, pal.paper, ' opacity="0.85"'))
  s += P('M0 ' + n(base + h * 0.02) + ' Q' + n(w * 0.3) + ' ' + n(base - h * 0.03) + ' ' + n(w * 0.6) + ' ' + n(base + h * 0.01)
    + ' T' + n(w) + ' ' + n(base - h * 0.01) + ' L' + n(w) + ' ' + n(h) + ' L0 ' + n(h) + ' Z', pal.ink, ' opacity="0.94"')
  return s
}

function heroTraffic(w, h, pal) {
  const deckY = h * 0.58
  let s = C(w * 0.8, h * 0.14, Math.min(w, h) * 0.26, pal.sun, ' opacity="0.2"')
  s += C(w * 0.8, h * 0.14, Math.min(w, h) * 0.048, pal.sun, ' opacity="0.85"')
  const bl = [[0.03, 0.22], [0.1, 0.34], [0.17, 0.2], [0.24, 0.28], [0.31, 0.18], [0.38, 0.26], [0.45, 0.2], [0.52, 0.3], [0.59, 0.22], [0.66, 0.27], [0.73, 0.18], [0.8, 0.24], [0.87, 0.2], [0.94, 0.28]]
  for (let i = 0; i < bl.length; i++) {
    s += R(w * bl[i][0], h * 0.74 - h * bl[i][1], w * 0.05, h * bl[i][1], pal.ink3, ' opacity="0.4"')
  }
  const d = 'M-60 ' + n(deckY + h * 0.05) + ' C' + n(w * 0.16) + ' ' + n(deckY - h * 0.05) + ' ' + n(w * 0.36) + ' ' + n(deckY + h * 0.06) + ' ' + n(w * 0.54) + ' ' + n(deckY)
    + ' C' + n(w * 0.7) + ' ' + n(deckY - h * 0.05) + ' ' + n(w * 0.86) + ' ' + n(deckY + h * 0.03) + ' ' + n(w + 60) + ' ' + n(deckY - h * 0.02)
  s += S(d, pal.paper, 54, ' opacity="0.7"')
  s += S(d, pal.ink2, 46)
  s += S(d, pal.ink3, 6, ' opacity="0.85"')
  for (let i = 0; i < 8; i++) {
    const px = w * (0.02 + i * 0.135)
    const py = deckY + h * 0.02 + Math.cos(i * 0.9) * h * 0.012
    s += R(px, py, w * 0.011, h - py, pal.ink, ' opacity="0.8"')
    s += R(px - w * 0.014, py, w * 0.039, h * 0.016, pal.ink, ' opacity="0.8"')
  }
  s += G('translate(' + n(w * 0.06) + ' ' + n(deckY - h * 0.085) + ')',
    Rr(0, 0, w * 0.3, h * 0.055, h * 0.026, '#f7f3e7')
    + P('M' + n(w * 0.3) + ' 0 L' + n(w * 0.345) + ' ' + n(h * 0.022) + ' L' + n(w * 0.3) + ' ' + n(h * 0.055) + ' Z', '#f7f3e7')
    + R(w * 0.03, h * 0.008, w * 0.02, h * 0.02, pal.ink3, ' opacity="0.65"')
    + R(0, h * 0.036, w * 0.31, h * 0.012, '#8a2c22', ' opacity="0.9"')
    + R(0, h * 0.05, w * 0.3, h * 0.005, pal.ink, ' opacity="0.4"'))
  for (let i = 0; i < 7; i++) s += R(w * 0.075 + i * w * 0.031, deckY - h * 0.077, w * 0.019, h * 0.016, pal.ink3, ' opacity="0.55"')
  s += E(w * 0.83, h * 0.2, w * 0.028, h * 0.012, pal.ink)
  s += P('M' + n(w * 0.83) + ' ' + n(h * 0.185) + ' L' + n(w * 0.865) + ' ' + n(h * 0.2) + ' L' + n(w * 0.83) + ' ' + n(h * 0.212) + ' Z', pal.ink)
  s += P('M' + n(w * 0.83) + ' ' + n(h * 0.2) + ' l' + n(-w * 0.04) + ' ' + n(-h * 0.03) + ' l' + n(w * 0.01) + ' 0 l' + n(w * 0.03) + ' ' + n(h * 0.028) + ' Z', pal.ink2)
  s += P('M' + n(w * 0.81) + ' ' + n(h * 0.2) + ' l' + n(-w * 0.012) + ' ' + n(-h * 0.026) + ' l' + n(w * 0.012) + ' ' + n(h * 0.004) + ' Z', pal.ink2)
  s += P('M0 ' + n(h * 0.86) + ' Q' + n(w * 0.3) + ' ' + n(h * 0.81) + ' ' + n(w * 0.58) + ' ' + n(h * 0.85)
    + ' T' + n(w) + ' ' + n(h * 0.83) + ' L' + n(w) + ' ' + n(h) + ' L0 ' + n(h) + ' Z', pal.ink, ' opacity="0.92"')
  s += S('M' + n(w * 0.06) + ' ' + n(h * 0.93) + ' L' + n(w * 0.94) + ' ' + n(h * 0.9) + ' Z', pal.gold, 3, ' opacity="0.6" stroke-dasharray="24 22"')
  s += Rr(w * 0.02, h * 0.79, w * 0.055, h * 0.09, 3, pal.paper, ' opacity="0.75"')
  s += Rr(w * 0.02, h * 0.79, w * 0.055, h * 0.018, 3, pal.accent, ' opacity="0.85"')
  s += C(w * 0.0475, h * 0.835, h * 0.022, pal.ink, ' opacity="0.8"')
  s += TXT(w * 0.0475, h * 0.845, h * 0.03, pal.paper, 'M')
  return s
}


function heroCity(w, h, pal, rnd) {
  const base = h * 0.9
  let s = ''
  s += P(peakPath(w * 0.74, h * 0.64, w * 0.34, h * 0.4), pal.ink2, ' opacity="0.5"')
  s += P(peakPath(w * 0.95, h * 0.64, w * 0.24, h * 0.24), pal.ink2, ' opacity="0.36"')
  s += P('M' + n(w * 0.74) + ' ' + n(h * 0.26) + ' L' + n(w * 0.82) + ' ' + n(h * 0.42) + ' L' + n(w * 0.77) + ' ' + n(h * 0.37) + ' L' + n(w * 0.74) + ' ' + n(h * 0.33) + ' L' + n(w * 0.71) + ' ' + n(h * 0.37) + ' L' + n(w * 0.66) + ' ' + n(h * 0.42) + ' Z', '#fbfdff', ' opacity="0.8"')
  s += R(0, h * 0.52, w, h * 0.03, pal.paper, ' opacity="0.26"')
  s += R(0, base, w, h - base, pal.water, ' opacity="0.92"')
  for (let i = 0; i < 16; i++) s += R(w * (0.44 + rnd() * 0.54), base + (h - base) * (0.1 + rnd() * 0.7), w * (0.02 + rnd() * 0.06), 2, '#f6e2b0', ' opacity="' + f2(0.1 + rnd() * 0.24) + '"')
  s += pagoda(w * 0.5, base, h * 0.34, pal.ink)
  const bl = [[0.565, 0.055, 0.3], [0.635, 0.05, 0.43], [0.705, 0.05, 0.27], [0.775, 0.045, 0.49], [0.845, 0.05, 0.35], [0.905, 0.045, 0.28], [0.96, 0.05, 0.38]]
  for (const b of bl) s += towerBlock(w * b[0], base, w * b[1], h * b[2], pal.ink, true)
  return s
}
function heroCulture(w, h, pal) {
  let s = ''
  s += P('M0 0 L0 ' + n(h * 0.3) + ' Q' + n(w * 0.3) + ' ' + n(h * 0.14) + ' ' + n(w * 0.6) + ' ' + n(h * 0.26) + ' Q' + n(w * 0.82) + ' ' + n(h * 0.36) + ' ' + n(w) + ' ' + n(h * 0.2) + ' L' + n(w) + ' 0 Z', pal.ink, ' opacity="0.92"')
  s += S('M' + n(w * 0.28) + ' ' + n(h * 0.12) + ' Q' + n(w * 0.66) + ' ' + n(h * 0.3) + ' ' + n(w * 0.99) + ' ' + n(h * 0.06), pal.ink, 2.4)
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.5) / 7
    const x = w * 0.28 + t * w * 0.71
    const y = h * 0.12 + Math.sin(Math.PI * t) * h * 0.18
    s += lantern(x, y + h * 0.08, h * 0.055, pal, true)
  }
  const k = h * 0.0092
  s += C(w * 0.74, h * 0.5, h * 0.52, pal.sun, ' opacity="0.16"')
  s += G('translate(' + n(w * 0.75) + ' ' + n(h * 0.56) + ') scale(' + f2(k) + ') translate(-50 -50)', mChuanju(pal))
  for (let i = 0; i < 8; i++) s += person(w * (0.02 + i * 0.07), h * 0.99, h * (0.2 + (i % 3) * 0.03), pal.ink)
  s += R(0, h * 0.97, w, h * 0.03, pal.ink)
  return s
}

function heroScenic(w, h, pal, rnd) {
  let s = R(0, h * 0.34, w, h * 0.045, pal.paper, ' opacity="0.3"')
  s += R(0, h * 0.52, w, h * 0.035, pal.paper, ' opacity="0.2"')
  s += R(0, h * 0.72, w, h * 0.28, pal.water, ' opacity="0.72"')
  for (let i = 0; i < 8; i++) s += R(w * (0.5 + rnd() * 0.48), h * (0.76 + rnd() * 0.16), w * (0.03 + rnd() * 0.07), 2, pal.paper, ' opacity="' + f2(0.12 + rnd() * 0.18) + '"')
  s += P('M' + n(w * 0.54) + ' ' + n(h * 0.82) + ' q' + n(w * 0.03) + ' ' + n(h * 0.06) + ' ' + n(w * 0.07) + ' 0 q' + n(-w * 0.035) + ' ' + n(-h * 0.02) + ' ' + n(-w * 0.07) + ' 0 Z', pal.ink, ' opacity="0.8"')
  s += S('M' + n(w * 0.56) + ' ' + n(h * 0.83) + ' l' + n(w * 0.06) + ' ' + n(-h * 0.005), pal.ink, 2, ' opacity="0.5"')
  s += pagoda(w * 0.8, h * 0.76, h * 0.32, pal.ink)
  s += P('M' + n(w * 0.88) + ' ' + n(h * 0.88) + ' l' + n(w * 0.03) + ' 0 l' + n(-w * 0.006) + ' ' + n(h * 0.03) + ' l' + n(-w * 0.018) + ' 0 Z', pal.ink, ' opacity="0.85"')
  s += pine(w * 0.66, h * 0.97, h * 0.3, pal.ink)
  s += pine(w * 0.72, h * 0.97, h * 0.22, pal.ink)
  return s
}
function heroGuides(w, h, pal) {
  let s = ''
  const cx = w * 0.7
  // 折页地图三块
  const panel = (dx, skew, fill, op) => P('M' + n(cx + dx) + ' ' + n(h * 0.28) + ' l' + n(w * 0.13) + ' ' + n(-skew) + ' l0 ' + n(h * 0.4) + ' l' + n(-w * 0.13) + ' ' + n(skew) + ' Z', fill, ' opacity="' + op + '"')
  s += panel(-w * 0.2, h * 0.02, pal.paper, '0.92')
  s += panel(-w * 0.07, h * 0.05, '#f4ecd8', '0.96')
  s += panel(w * 0.06, -h * 0.03, pal.paper, '0.9')
  for (let i = 0; i < 3; i++) s += L(cx - w * 0.07 + i * w * 0.065, h * 0.3, cx - w * 0.07 + i * w * 0.065, h * 0.66, pal.ink3, 1, ' opacity="0.35"')
  // 路线虚线 + 图钉
  s += S('M' + n(cx - w * 0.16) + ' ' + n(h * 0.42) + ' Q' + n(cx - w * 0.08) + ' ' + n(h * 0.34) + ' ' + n(cx) + ' ' + n(h * 0.4) + ' Q' + n(cx + w * 0.08) + ' ' + n(h * 0.46) + ' ' + n(cx + w * 0.15) + ' ' + n(h * 0.36), pal.accent, 2, ' opacity="0.85" stroke-dasharray="7 6"')
  const pins = [[-0.16, 0.42], [0, 0.4], [0.15, 0.36]]
  for (const p of pins) {
    const px = cx + w * p[0]
    const py = h * p[1]
    s += C(px, py, h * 0.026, pal.accent)
    s += C(px, py, h * 0.011, pal.paper)
  }
  // 相机
  const cw = w * 0.15
  const chh = h * 0.2
  s += Rr(w * 0.52, h * 0.62, cw, chh, 6, pal.ink)
  s += Rr(w * 0.52 + cw * 0.32, h * 0.62 - h * 0.03, cw * 0.36, h * 0.045, 3, pal.ink)
  s += C(w * 0.52 + cw * 0.5, h * 0.62 + chh * 0.5, chh * 0.3, pal.paper, ' opacity="0.8"')
  // 指南针
  s += C(w * 0.88, h * 0.62, h * 0.15, pal.paper, ' opacity="0.92"')
  s += C(w * 0.88, h * 0.62, h * 0.15, 'none', ' stroke="' + pal.ink + '" stroke-width="2.5" opacity="0.55"')
  s += P('M' + n(w * 0.88) + ' ' + n(h * 0.53) + ' l' + n(h * 0.05) + ' ' + n(h * 0.09) + ' l' + n(-h * 0.05) + ' ' + n(h * 0.09) + ' Z', pal.accent)
  s += R(0, h * 0.9, w, h * 0.1, pal.ink2, ' opacity="0.35"')
  return s
}

function heroFood(w, h, pal, rnd) {
  let s = C(w * 0.66, h * 0.16, h * 0.46, pal.sun, ' opacity="0.16"')
  s += R(0, h * 0.44, w, h * 0.56, '#5f3f28')
  s += R(0, h * 0.44, w, h * 0.018, '#8a6440')
  for (let i = 0; i < 4; i++) s += R(0, h * (0.56 + i * 0.09), w, 1.8, '#422a1b', ' opacity="0.5"')
  const gx = w * 0.58
  const gy = h * 0.5
  const gr = h * 0.19
  s += E(gx, gy + gr * 1.15, gr * 1.2, gr * 0.22, '#2a1c12', ' opacity="0.22"')
  s += E(gx, gy + gr * 0.55, gr * 1.12, gr * 0.52, '#1f1611')
  s += E(gx, gy + gr * 0.2, gr * 1.16, gr * 0.36, '#2a1e16')
  s += E(gx, gy + gr * 0.16, gr * 1.06, gr * 0.3, '#a8381f')
  s += E(gx, gy + gr * 0.12, gr * 0.97, gr * 0.26, '#c2472b')
  s += S('M' + n(gx) + ' ' + n(gy - gr * 0.16) + ' l0 ' + n(gr * 0.56), '#f7efdc', 4, ' opacity="0.85"')
  s += S('M' + n(gx - gr * 0.8) + ' ' + n(gy - gr * 0.02) + ' l' + n(gr * 1.6) + ' 0', '#f7efdc', 4, ' opacity="0.85"')
  s += L(gx - gr * 1.14, gy + gr * 0.02, gx - gr * 1.28, gy + gr * 0.22, '#1f1611', 8)
  s += L(gx + gr * 1.14, gy + gr * 0.02, gx + gr * 1.28, gy + gr * 0.22, '#1f1611', 8)
  for (let i = 0; i < 7; i++) s += C(gx - gr * 0.6 + i * gr * 0.2, gy + gr * 0.18, 4, '#8a2c22')
  for (let i = 0; i < 5; i++) s += C(gx - gr * 0.5 + i * gr * 0.24, gy + gr * 0.34, 2.4, '#f0d9a8', ' opacity="0.85"')
  const bowl = (bx, br) => E(bx, gy + gr * 1.28, br * 0.42, br * 0.12, '#2a1c12', ' opacity="0.22"')
    + E(bx, gy + gr * 1.06, br, br * 0.5, '#e8e0cc')
    + E(bx, gy + gr * 0.72, br, br * 0.36, '#2a1e16')
    + E(bx, gy + gr * 0.7, br * 0.9, br * 0.26, '#c8412a')
    + E(bx, gy + gr * 0.68, br * 0.62, br * 0.14, '#e8dcb4', ' opacity="0.9"')
  s += bowl(w * 0.38, h * 0.062)
  s += bowl(w * 0.78, h * 0.056)
  s += E(w * 0.86, gy + gr * 1.28, h * 0.06, h * 0.018, '#e8e0cc')
  s += E(w * 0.86, gy + gr * 1.26, h * 0.032, h * 0.01, '#8a2c22')
  for (let i = 0; i < 6; i++) s += steam(gx - gr * 1.1 + i * gr * 0.44, gy - gr * 0.5, gr * 0.5, pal.paper, 0.4)
  for (let i = 0; i < 8; i++) s += C(w * (0.2 + rnd() * 0.2), h * (0.9 + rnd() * 0.05), 3, '#c8412a', ' opacity="0.7"')
  return s
}
function renderCard(name, cfg) {
  const w = 1000
  const h = 750
  const pal = PAL[cfg.pal]
  const rnd = mulberry32(cfg.seed || 11)
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + (cfg.seal || name) + '">'
  s += background({
    w, h, pal, rnd,
    horizon: cfg.horizon || 0.62,
    water: !!cfg.water,
    ridges: cfg.ridges || 3,
    groundY: cfg.groundY || 0.9,
    groundFill: cfg.groundFill || null,
    band: cfg.band || null,
  })
  const k = ((cfg.size || 0.82) * Math.min(w, h)) / 100
  s += G('translate(' + n(w * (cfg.fx || 0.5)) + ' ' + n(h * (cfg.fy || 0.5)) + ') scale(' + f2(k) + ') translate(-50 -50)', cfg.draw(pal, rnd))
  s += frame(w, h, pal)
  s += seal(w - 58, h - 56, pal, cfg.seal || '')
  s += '</svg>'
  return s
}

function renderWide(name, cfg) {
  const w = 1600
  const h = cfg.h || 900
  const pal = PAL[cfg.pal]
  const rnd = mulberry32(cfg.seed || 3)
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + (cfg.seal || name) + '">'
  s += background({
    w, h, pal, rnd,
    horizon: cfg.horizon || 0.64,
    water: !!cfg.water,
    ridges: cfg.ridges || 3,
    groundY: cfg.groundY || 0.99,
    groundFill: cfg.groundFill || null,
    band: cfg.band || null,
  })
  s += cfg.wide(w, h, pal, rnd)
  s += frame(w, h, pal)
  const sy = cfg.sealY ? h * cfg.sealY : h - 60
  s += seal(w - 62, sy, pal, cfg.seal || '')
  s += '</svg>'
  return s
}

// ================= 场景清单 =================
const B = { y: 0.58 }
const CARD_FOOD = { horizon: 0.94, ridges: 0, groundY: 1.02, band: B }

const SCENES = {
  // 主视觉
  'hero-1': { pal: 'dawn', wide: heroOne, seal: '天成', horizon: 0.62 },
  'hero-2': { pal: 'snow', wide: heroTwo, seal: '雪城', horizon: 0.64 },
  'hero-3': { pal: 'warm', wide: heroThree, seal: '烟火', horizon: 0.7 },
  'hero-4': { pal: 'night', wide: heroFour, seal: '夜游', horizon: 0.66 },
  'service-hero': { pal: 'jade', wide: heroService, seal: '天府', horizon: 0.7 },
  'traffic-hero': { pal: 'mist', wide: heroTraffic, seal: '通达', horizon: 0.72 },

  // 内页横幅（21:7，h 535 ≈ 3:1）
  'city-hero': { pal: 'dawn', wide: heroCity, seal: '雪城', horizon: 0.62, ridges: 3, h: 535, sealY: 0.76 },
  'culture-hero': { pal: 'dusk', wide: heroCulture, seal: '川剧', horizon: 0.7, ridges: 2, h: 535, sealY: 0.76 },
  'scenic-hero': { pal: 'jade', wide: heroScenic, seal: '山水', horizon: 0.6, ridges: 3, water: true, h: 535, sealY: 0.76 },
  'guides-hero': { pal: 'snow', wide: heroGuides, seal: '游历', horizon: 0.66, ridges: 2, h: 535, sealY: 0.76 },
  'food-hero': { pal: 'warm', wide: heroFood, seal: '烟火', horizon: 0.62, ridges: 0, h: 535, sealY: 0.76 },

  // 经典景区
  'scenic-dujiangyan': { pal: 'mist', water: true, draw: mDujiangyan, seal: '都江', horizon: 0.58, ridges: 2, groundY: 0.94 },
  'scenic-qingchengshan': { pal: 'jade', draw: mQingchengshan, seal: '青城', horizon: 0.6, ridges: 3, groundY: 0.94 },
  'scenic-wuhouci': { pal: 'jade', draw: mWuhouci, seal: '武侯', horizon: 0.56, ridges: 2, groundY: 0.94 },
  'scenic-kuanzhai': { pal: 'warm', draw: mKuanzhai, seal: '宽窄', horizon: 0.56, ridges: 2, groundY: 0.94 },
  'scenic-panda': { pal: 'jade', draw: mPanda, seal: '国宝', horizon: 0.64, ridges: 2, groundY: 0.92 },
  'scenic-jinli': { pal: 'warm', draw: mJinli, seal: '锦里', horizon: 0.56, ridges: 2, groundY: 0.94 },
  'scenic-dufu': { pal: 'jade', draw: mDufu, seal: '草堂', horizon: 0.6, ridges: 2, groundY: 0.94 },
  'scenic-jinsha': { pal: 'autumn', draw: mJinsha, seal: '金沙', horizon: 0.6, ridges: 2, groundY: 0.94 },
  'scenic-xiling': { pal: 'snow', draw: mXiling, seal: '西岭', horizon: 0.66, ridges: 2, groundY: 0.94 },
  'scenic-taikoo': { pal: 'dusk', draw: mTaikoo, seal: '太古', horizon: 0.52, ridges: 2, groundY: 0.96 },

  // 文化活动
  'culture-deng': { pal: 'night', draw: mDeng, seal: '灯会', horizon: 0.66, ridges: 2, groundY: 0.96 },
  'culture-chuanju': { pal: 'dusk', draw: mChuanju, seal: '川剧', horizon: 0.72, ridges: 2, groundY: 0.98 },
  'culture-miaohui': { pal: 'warm', draw: mMiaohui, seal: '庙会', horizon: 0.62, ridges: 2, groundY: 0.96 },
  'culture-tangjiu': { pal: 'autumn', draw: mTangjiu, seal: '糖酒', horizon: 0.6, ridges: 2, groundY: 0.94 },
  'culture-music': { pal: 'deep', draw: mMusic, seal: '音乐', horizon: 0.7, ridges: 2, groundY: 0.96 },
  'culture-shuxiu': { pal: 'jade', draw: mShuxiu, seal: '蜀绣', horizon: 0.7, ridges: 2, groundY: 0.98 },
  'culture-longzhou': { pal: 'mist', draw: mLongzhou, seal: '龙舟', horizon: 0.58, water: true, ridges: 2, groundY: 0.96 },
  'culture-feiyi': { pal: 'mist', draw: mFeiyi, seal: '非遗', horizon: 0.7, ridges: 2, groundY: 0.98 },
  'culture-marathon': { pal: 'dawn', draw: mMarathon, seal: '跑步', horizon: 0.6, ridges: 2, groundY: 0.96 },

  // 特色美食
  'food-huoguo': { pal: 'warm', draw: mHuoguo, seal: '火锅', ...CARD_FOOD, size: 1.02 },
  'food-chuanchuan': { pal: 'warm', draw: mChuanchuan, seal: '串串', ...CARD_FOOD, size: 0.84 },
  'food-dandanmian': { pal: 'autumn', draw: mDandanmian, seal: '担担', ...CARD_FOOD, size: 0.84 },
  'food-zhongshuijiao': { pal: 'autumn', draw: mZhongshuijiao, seal: '水饺', ...CARD_FOOD, size: 0.84 },
  'food-longchaoshou': { pal: 'autumn', draw: mLongchaoshou, seal: '抄手', ...CARD_FOOD, size: 0.84 },
  'food-mafu': { pal: 'warm', draw: mMafu, seal: '麻婆', ...CARD_FOOD, size: 0.94 },
  'food-guokui': { pal: 'warm', draw: mGuokui, seal: '锅盔', ...CARD_FOOD, size: 0.84 },
  'food-tangyou': { pal: 'autumn', draw: mTangyou, seal: '糖油', ...CARD_FOOD, size: 0.84 },
  'food-gaiwan': { pal: 'warm', draw: mGaiwan, seal: '盖碗', ...CARD_FOOD, size: 0.84 },
  'food-feichangfen': { pal: 'warm', draw: mFeichangfen, seal: '肥肠', ...CARD_FOOD, size: 0.84 },
  'food-boboji': { pal: 'warm', draw: mBoboji, seal: '钵钵', ...CARD_FOOD, size: 0.84 },

  // 城市介绍
  'city-history': { pal: 'dawn', draw: mHistory, seal: '成都', horizon: 0.6, ridges: 2, groundY: 0.96 },
  'city-geo': { pal: 'mist', draw: mGeo, seal: '天府', horizon: 0.66, ridges: 2, groundY: 0.96 },
  'city-culture': { pal: 'dusk', draw: mCultureCity, seal: '文脉', horizon: 0.68, ridges: 2, groundY: 0.98 },
  'city-life': { pal: 'autumn', draw: mLife, seal: '市井', horizon: 0.62, ridges: 2, groundY: 0.96 },

  // 游记攻略
  'guide-3days': { pal: 'dawn', draw: m3days, seal: '三日', horizon: 0.8, ridges: 2, groundY: 1.02 },
  'guide-panda': { pal: 'jade', draw: mPandaGuide, seal: '熊猫', horizon: 0.66, ridges: 2, groundY: 0.94 },
  'guide-museum': { pal: 'dusk', draw: mMuseum, seal: '文博', horizon: 0.72, ridges: 2, groundY: 1.02 },
  'guide-night': { pal: 'night', draw: mNight, seal: '夜游', horizon: 0.62, ridges: 2, groundY: 0.96 },
  'guide-family': { pal: 'dawn', draw: mFamily, seal: '亲子', horizon: 0.6, ridges: 2, groundY: 0.98 },
  'guide-dujiangyan': { pal: 'mist', draw: mDujiangyanGuide, seal: '水利', horizon: 0.6, ridges: 2, groundY: 1.04 },
}

const only = process.argv.slice(2)
let built = 0
for (const name of Object.keys(SCENES)) {
  if (only.length && !only.includes(name)) continue
  const cfg = SCENES[name]
  const svg = cfg.wide ? renderWide(name, cfg) : renderCard(name, cfg)
  writeFileSync(join(OUT, name + '.svg'), svg, 'utf8')
  built++
}
console.log('generated ' + built + ' svg files -> ' + OUT)


