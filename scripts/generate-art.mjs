/**
 * 视觉资源生成器 —— 程序化绘制「天府墨韵」水墨山水 / 川西剪影插画（SVG）
 * 目的：站点零外部图片依赖，保证离线可用、体积小、加载快（利于 Lighthouse 性能分）
 * 运行：node scripts/generate-art.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/assets/img')
mkdirSync(OUT, { recursive: true })

/* ---------------- 工具 ---------------- */
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const n = (v) => Math.round(v * 10) / 10

/** Catmull-Rom 转贝塞尔，得到平滑山脊线 */
function smoothPath(pts) {
  if (pts.length < 3) return ''
  let d = 'M' + n(pts[0][0]) + ',' + n(pts[0][1])
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ' C' + n(c1x) + ',' + n(c1y) + ' ' + n(c2x) + ',' + n(c2y) + ' ' + n(p2[0]) + ',' + n(p2[1])
  }
  return d
}

/** 一层山脊（闭合到画布底部） */
function ridgeLayer(W, H, baseY, amp, seed, points, jitter) {
  const rand = mulberry32(seed)
  const pts = []
  for (let i = 0; i <= points; i++) {
    const x = (W / points) * i
    const t = i / points
    const wave =
      Math.sin(t * Math.PI * 2 * 1.35 + seed * 0.7) * 0.52 +
      Math.sin(t * Math.PI * 2 * 2.9 + seed * 1.3) * 0.3 +
      Math.sin(t * Math.PI * 2 * 5.7 + seed * 2.1) * 0.13
    pts.push([x, baseY - amp * wave - (rand() - 0.5) * amp * jitter])
  }
  pts.unshift([-80, baseY + amp * 0.55])
  pts.push([W + 80, baseY + amp * 0.55])
  return smoothPath(pts) + ' L' + (W + 80) + ',' + (H + 40) + ' L-80,' + (H + 40) + ' Z'
}

/* ---------------- 剪影构件 ---------------- */
function pineTree(x, y, s, fill, opacity) {
  let o = '<g fill="' + fill + '" opacity="' + (opacity ?? 1) + '">'
  o += '<rect x="' + n(x - 3 * s) + '" y="' + n(y - 30 * s) + '" width="' + n(6 * s) + '" height="' + n(32 * s) + '" />'
  for (let i = 0; i < 3; i++) {
    const ty = y - 26 * s - i * 24 * s
    const tw = (46 - i * 10) * s
    o += '<path d="M' + n(x) + ',' + n(ty - 40 * s) + ' L' + n(x + tw / 2) + ',' + n(ty) +
      ' Q' + n(x) + ',' + n(ty + 8 * s) + ' ' + n(x - tw / 2) + ',' + n(ty) + ' Z" />'
  }
  o += '</g>'
  return o
}

function bambooGrove(x, y, w, seed, fill, opacity) {
  const rand = mulberry32(seed)
  let o = '<g stroke="' + fill + '" fill="none" opacity="' + (opacity ?? 1) + '" stroke-linecap="round">'
  const count = Math.max(7, Math.round(w / 22))
  for (let i = 0; i < count; i++) {
    const bx = x + (w / count) * i + rand() * 14
    const h = 220 + rand() * 300
    const tilt = (rand() - 0.5) * 44
    const sw = 2.4 + rand() * 3
    o += '<path d="M' + n(bx) + ',' + n(y) + ' Q' + n(bx + tilt * 0.35) + ',' + n(y - h * 0.6) + ' ' +
      n(bx + tilt) + ',' + n(y - h) + '" stroke-width="' + n(sw) + '" />'
    for (let k = 0; k < 7; k++) {
      const f = 0.3 + k * 0.1
      const lx = bx + tilt * f
      const ly = y - h * f
      const dir = k % 2 === 0 ? 1 : -1
      o += '<path d="M' + n(lx) + ',' + n(ly) + ' q' + n(dir * (20 + rand() * 16)) + ',' + n(-14 - rand() * 10) +
        ' ' + n(dir * (40 + rand() * 22)) + ',' + n(-6 - rand() * 12) + '" stroke-width="' + n(1.4 + rand() * 1.4) + '" />'
      o += '<path d="M' + n(lx + dir * 14) + ',' + n(ly - 9) + ' l' + n(dir * 12) + ',' + n(-13) +
        '" stroke-width="' + n(1.1 + rand() * 1.2) + '" opacity="0.85" />'
    }
  }
  o += '</g>'
  return o
}

function pagoda(x, baseY, s, fill) {
  const tiers = 5
  let o = '<g fill="' + fill + '">'
  o += '<rect x="' + n(x - 11 * s) + '" y="' + n(baseY - 36 * s * tiers) + '" width="' + n(22 * s) +
    '" height="' + n(38 * s * tiers) + '" />'
  for (let i = 0; i < tiers; i++) {
    const ty = baseY - i * 36 * s
    const tw = (78 - i * 11) * s
    const roofH = 18 * s
    o += '<path d="M' + n(x - tw / 2) + ',' + n(ty) + ' Q' + n(x - tw * 0.24) + ',' + n(ty - roofH * 0.95) + ' ' +
      n(x) + ',' + n(ty - roofH) + ' Q' + n(x + tw * 0.24) + ',' + n(ty - roofH * 0.95) + ' ' +
      n(x + tw / 2) + ',' + n(ty) + ' Q' + n(x) + ',' + n(ty + 10 * s) + ' ' + n(x - tw / 2) + ',' + n(ty) + ' Z" />'
    o += '<path d="M' + n(x - tw / 2) + ',' + n(ty) + ' q' + n(-8 * s) + ',' + n(-9 * s) + ' ' + n(-4 * s) + ',' +
      n(-16 * s) + '" stroke="' + fill + '" stroke-width="' + n(3 * s) + '" fill="none" />'
    o += '<path d="M' + n(x + tw / 2) + ',' + n(ty) + ' q' + n(8 * s) + ',' + n(-9 * s) + ' ' + n(4 * s) + ',' +
      n(-16 * s) + '" stroke="' + fill + '" stroke-width="' + n(3 * s) + '" fill="none" />'
  }
  const top = baseY - 36 * s * tiers
  o += '<line x1="' + n(x) + '" y1="' + n(top) + '" x2="' + n(x) + '" y2="' + n(top - 34 * s) + '" stroke="' + fill +
    '" stroke-width="' + n(3.4 * s) + '" />'
  o += '<circle cx="' + n(x) + '" cy="' + n(top - 40 * s) + '" r="' + n(5.5 * s) + '" />'
  o += '</g>'
  return o
}

function hanRoof(x, y, w, fill, windows) {
  const h = w * 0.26
  const ew = w * 0.55
  const rw = ew * 0.6
  let o = '<g fill="' + fill + '" stroke="' + fill + '">'
  // 屋身
  o += '<rect x="' + n(x - w * 0.32) + '" y="' + n(y) + '" width="' + n(w * 0.64) + '" height="' + n(w * 0.4) +
    '" stroke="none" />'
  // 屋面（梯形坡顶 + 反宇檐口）
  o += '<path d="M' + n(x - ew) + ',' + n(y) + ' Q' + n(x - ew * 0.94) + ',' + n(y - h * 0.1) + ' ' +
    n(x - rw) + ',' + n(y - h) + ' L' + n(x + rw) + ',' + n(y - h) + ' Q' + n(x + ew * 0.94) + ',' +
    n(y - h * 0.1) + ' ' + n(x + ew) + ',' + n(y) + ' Z" stroke="none" />'
  // 正脊
  o += '<rect x="' + n(x - rw * 1.12) + '" y="' + n(y - h - w * 0.032) + '" width="' + n(rw * 2.24) + '" height="' +
    n(w * 0.036) + '" rx="' + n(w * 0.014) + '" stroke="none" />'
  // 飞檐翘角
  o += '<path d="M' + n(x - ew) + ',' + n(y) + ' q' + n(-w * 0.045) + ',' + n(-w * 0.02) + ' ' + n(-w * 0.06) +
    ',' + n(-w * 0.085) + '" stroke-width="' + n(w * 0.024) + '" fill="none" stroke-linecap="round" />'
  o += '<path d="M' + n(x + ew) + ',' + n(y) + ' q' + n(w * 0.045) + ',' + n(-w * 0.02) + ' ' + n(w * 0.06) + ',' +
    n(-w * 0.085) + '" stroke-width="' + n(w * 0.024) + '" fill="none" stroke-linecap="round" />'
  if (windows !== false) {
    o += '<rect x="' + n(x - w * 0.09) + '" y="' + n(y + w * 0.08) + '" width="' + n(w * 0.18) + '" height="' +
      n(w * 0.3) + '" fill="none" stroke-width="' + n(w * 0.013) + '"/>'
    o += '<line x1="' + n(x - w * 0.35) + '" y1="' + n(y + w * 0.12) + '" x2="' + n(x + w * 0.35) + '" y2="' +
      n(y + w * 0.12) + '" stroke-width="' + n(w * 0.01) + '" />'
  }
  o += '</g>'
  return o
}

function bridge(x, y, w, fill) {
  let o = '<g fill="none" stroke="' + fill + '" stroke-linecap="round">'
  o += '<path d="M' + n(x - w / 2) + ',' + n(y) + ' Q' + n(x) + ',' + n(y + 52) + ' ' + n(x + w / 2) + ',' + n(y) +
    '" stroke-width="5" />'
  o += '<path d="M' + n(x - w / 2) + ',' + n(y - 16) + ' L' + n(x - w / 2) + ',' + n(y + 62) + ' M' + n(x + w / 2) +
    ',' + n(y - 16) + ' L' + n(x + w / 2) + ',' + n(y + 62) + '" stroke-width="7" />'
  for (let i = 1; i < 8; i++) {
    const t = i / 8
    const bx = x - w / 2 + w * t
    const by = y + 52 * Math.sin(Math.PI * t)
    o += '<line x1="' + n(bx) + '" y1="' + n(by) + '" x2="' + n(bx) + '" y2="' + n(by - 30) + '" stroke-width="2.6" />'
  }
  o += '<path d="M' + n(x - w / 2) + ',' + n(y - 30) + ' Q' + n(x) + ',' + n(y + 18) + ' ' + n(x + w / 2) + ',' +
    n(y - 30) + '" stroke-width="2.6" />'
  o += '</g>'
  return o
}

function panda(x, y, s, dark, light) {
  const d = dark
  const l = light
  return '<g transform="translate(' + n(x) + ',' + n(y) + ') scale(' + s + ')">' +
    '<ellipse cx="0" cy="30" rx="48" ry="34" fill="' + l + '" />' +
    '<ellipse cx="-30" cy="34" rx="16" ry="12" fill="' + d + '" />' +
    '<ellipse cx="30" cy="34" rx="16" ry="12" fill="' + d + '" />' +
    '<ellipse cx="-40" cy="6" rx="13" ry="20" fill="' + d + '" transform="rotate(-22 -40 6)" />' +
    '<ellipse cx="40" cy="6" rx="13" ry="20" fill="' + d + '" transform="rotate(22 40 6)" />' +
    '<circle cx="-34" cy="-32" r="15" fill="' + d + '" /><circle cx="34" cy="-32" r="15" fill="' + d + '" />' +
    '<circle cx="0" cy="-26" r="31" fill="' + l + '" />' +
    '<ellipse cx="-12" cy="-28" rx="9" ry="11" fill="' + d + '" transform="rotate(-18 -12 -28)" />' +
    '<ellipse cx="12" cy="-28" rx="9" ry="11" fill="' + d + '" transform="rotate(18 12 -28)" />' +
    '<circle cx="-13" cy="-30" r="3.2" fill="' + l + '" /><circle cx="13" cy="-30" r="3.2" fill="' + l + '" />' +
    '<ellipse cx="0" cy="-12" rx="5" ry="3.6" fill="' + d + '" />' +
    '</g>'
}

function skyline(x, y, w, seed, fill, opacity) {
  const rand = mulberry32(seed)
  let o = '<g fill="' + fill + '" opacity="' + (opacity ?? 1) + '">'
  let cx = x
  while (cx < x + w) {
    const bw = 22 + rand() * 52
    const bh = 50 + rand() * 150
    o += '<rect x="' + n(cx) + '" y="' + n(y - bh) + '" width="' + n(bw) + '" height="' + n(bh) + '" />'
    if (rand() > 0.55) {
      o += '<rect x="' + n(cx + bw * 0.32) + '" y="' + n(y - bh - 22) + '" width="' + n(bw * 0.36) +
        '" height="24" />'
    }
    cx += bw + 8 + rand() * 18
  }
  o += '</g>'
  return o
}

function boat(x, y, s, fill) {
  return '<g fill="' + fill + '" transform="translate(' + n(x) + ',' + n(y) + ') scale(' + s + ')">' +
    '<path d="M-54,0 Q0,26 54,0 Q0,10 -54,0 Z" />' +
    '<path d="M-58,-2 Q0,-14 58,-2 Q0,4 -58,-2 Z" />' +
    '<path d="M-6,-6 L-6,-46 L34,-14 Z" opacity="0.92" />' +
    '<rect x="-2" y="-50" width="4" height="46" /></g>'
}

function lanterns(x, y, w, seed, fill) {
  const rand = mulberry32(seed)
  let o = '<g fill="' + fill + '">'
  o += '<path d="M' + n(x) + ',' + n(y - 210) + ' Q' + n(x + w / 2) + ',' + n(y - 170) + ' ' + n(x + w) + ',' +
    n(y - 220) + '" fill="none" stroke="' + fill + '" stroke-width="3" />'
  const count = 7
  for (let i = 0; i < count; i++) {
    const lx = x + (w / (count + 1)) * (i + 1)
    const ly = y - 205 + Math.sin((i / count) * Math.PI) * 26
    const r = 15 + rand() * 9
    o += '<line x1="' + n(lx) + '" y1="' + n(ly) + '" x2="' + n(lx) + '" y2="' + n(ly + 14) + '" stroke="' + fill +
      '" stroke-width="2" />'
    o += '<ellipse cx="' + n(lx) + '" cy="' + n(ly + 14 + r) + '" rx="' + n(r) + '" ry="' + n(r * 1.15) + '" />'
    o += '<rect x="' + n(lx - r * 0.5) + '" y="' + n(ly + 14 + r * 2.1) + '" width="' + n(r) + '" height="' +
      n(r * 0.5) + '" />'
  }
  o += '</g>'
  return o
}

function road(x, y, w, h, fill, line) {
  let o = '<g>'
  o += '<path d="M' + n(x - w * 0.06) + ',' + n(h) + ' Q' + n(x + w * 0.16) + ',' + n(y + (h - y) * 0.45) + ' ' +
    n(x + w * 0.5) + ',' + n(y) + ' Q' + n(x + w * 0.84) + ',' + n(y + (h - y) * 0.45) + ' ' + n(x + w * 1.06) +
    ',' + n(h) + ' L' + n(x + w * 0.86) + ',' + n(h) + ' Q' + n(x + w * 0.72) + ',' + n(y + (h - y) * 0.5) + ' ' +
    n(x + w * 0.5) + ',' + n(y + 18) + ' Q' + n(x + w * 0.28) + ',' + n(y + (h - y) * 0.5) + ' ' + n(x + w * 0.14) +
    ',' + n(h) + ' Z" fill="' + fill + '" />'
  o += '<path d="M' + n(x + w * 0.5) + ',' + n(y + 26) + ' L' + n(x + w * 0.5) + ',' + n(h) + '" stroke="' + line +
    '" stroke-width="4" stroke-dasharray="22 20" opacity="0.8" />'
  o += '</g>'
  return o
}

function bowl(cx, cy, s, colors) {
  const { body, food, accent, steam } = colors
  let o = '<g transform="translate(' + n(cx) + ',' + n(cy) + ') scale(' + s + ')">'
  o += '<ellipse cx="0" cy="58" rx="150" ry="26" fill="' + body + '" opacity="0.18" />'
  o += '<path d="M-120,-6 Q-118,74 0,86 Q118,74 120,-6 Z" fill="' + body + '" />'
  o += '<ellipse cx="0" cy="-6" rx="120" ry="34" fill="' + food + '" />'
  o += '<ellipse cx="0" cy="-6" rx="120" ry="34" fill="none" stroke="' + accent + '" stroke-width="4" opacity="0.5" />'
  for (let i = 0; i < 5; i++) {
    const px = -70 + i * 34
    o += '<path d="M' + n(px - 26) + ',' + n(-8 + (i % 2) * 8) + ' q26,-18 52,0 q-26,16 -52,0 Z" fill="' + accent +
      '" opacity="0.75" />'
  }
  o += '<g fill="none" stroke="' + steam + '" stroke-linecap="round" opacity="0.55">'
  for (let i = 0; i < 3; i++) {
    const sx = -54 + i * 54
    o += '<path d="M' + n(sx) + ',-52 q18,-30 0,-52 q-16,-24 4,-46" stroke-width="' + (5 - i * 0.4) + '" />'
  }
  o += '</g>'
  o += '<g stroke="' + body + '" stroke-width="7" stroke-linecap="round">'
  o += '<line x1="88" y1="-96" x2="196" y2="-40" /><line x1="104" y1="-118" x2="212" y2="-62" />'
  o += '</g></g>'
  return o
}

/* ---------------- 色板 ---------------- */
const PALETTES = {
  dawn: {
    sky: ['#f8ecda', '#f3d3b2', '#e2ab8a'],
    sun: '#fff4e0',
    ridges: ['#c3d2c9', '#9db8ae', '#74948b', '#4a6e66', '#24463f'],
    mist: '#fdf6ea',
    fg: '#16332d',
    water: ['#e3ddd0', '#a9bdb2'],
  },
  dusk: {
    sky: ['#fadcb6', '#eda878', '#c2674f'],
    sun: '#fff3d4',
    ridges: ['#d3b2a0', '#b08775', '#87594f', '#5d3a37', '#34211f'],
    mist: '#fce6cb',
    fg: '#281815',
    water: ['#e6b993', '#ab765c'],
  },
  jade: {
    sky: ['#eaf2e8', '#cbe0d0', '#a3c3af'],
    sun: '#fbf7e2',
    ridges: ['#d3e2d5', '#aecab6', '#7fa993', '#51836e', '#2b5346'],
    mist: '#f6faf2',
    fg: '#13352c',
    water: ['#dbe9de', '#94b8a5'],
  },
  night: {
    sky: ['#0f2630', '#153a44', '#1d5654'],
    sun: '#f4e6ba',
    ridges: ['#1f4d4f', '#183c3f', '#132f33', '#0d2226', '#061214'],
    mist: '#7fb0ad',
    fg: '#04100f',
    water: ['#123034', '#0a1c1f'],
  },
  autumn: {
    sky: ['#fcefdd', '#f5d3a2', '#e0a465'],
    sun: '#fff6d8',
    ridges: ['#e0cfae', '#c8a678', '#a0794c', '#73502f', '#452e1a'],
    mist: '#fdf3e1',
    fg: '#2a1b0f',
    water: ['#e8d2b0', '#b38d61'],
  },
  snow: {
    sky: ['#eff4f8', '#d9e4ee', '#b6c8d8'],
    sun: '#ffffff',
    ridges: ['#e2ebf2', '#c5d4e0', '#98adbf', '#69839a', '#3f5769'],
    mist: '#ffffff',
    fg: '#1d2e3c',
    water: ['#e0ebf2', '#abc2d2'],
  },
  mist: {
    sky: ['#f6f3ec', '#e6e5dc', '#cfd2c8'],
    sun: '#ffffff',
    ridges: ['#e0e2d9', '#c1c5bb', '#9aa096', '#6d736b', '#41463f'],
    mist: '#ffffff',
    fg: '#232821',
    water: ['#eaeae0', '#b9bbb0'],
  },
  warm: {
    sky: ['#fdf1e2', '#f6dcc0', '#e8b494'],
    sun: '#fff6e6',
    ridges: ['#e5ccb2', '#d0ab8c', '#ac8163', '#7e5642', '#4d3125'],
    mist: '#fff6ea',
    fg: '#2f1d15',
    water: ['#f0d7bd', '#c19a7c'],
  },
}

/* ---------------- 组合绘制 ---------------- */
function poster({ w = 1000, h = 750, palette, seed, scene = {}, title = '', seal = '' }) {
  const p = PALETTES[palette] || PALETTES.jade
  const rand = mulberry32(seed)
  const uid = 'a' + seed
  const horizon = h * (scene.horizon ?? 0.6)
  let s =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h +
    '" role="img" aria-label="' + title + '"><defs>'
  s += '<linearGradient id="sky' + uid + '" x1="0" y1="0" x2="0.25" y2="1"><stop offset="0" stop-color="' + p.sky[0] +
    '"/><stop offset="0.58" stop-color="' + p.sky[1] + '"/><stop offset="1" stop-color="' + p.sky[2] + '"/></linearGradient>'
  s += '<linearGradient id="wat' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.water[0] +
    '"/><stop offset="1" stop-color="' + p.water[1] + '"/></linearGradient>'
  s += '<radialGradient id="glow' + uid + '"><stop offset="0" stop-color="' + p.sun + '" stop-opacity="0.9"/>' +
    '<stop offset="0.55" stop-color="' + p.sun + '" stop-opacity="0.28"/><stop offset="1" stop-color="' + p.sun +
    '" stop-opacity="0"/></radialGradient>'
  s += '<linearGradient id="mist' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.mist +
    '" stop-opacity="0"/><stop offset="0.45" stop-color="' + p.mist + '" stop-opacity="0.85"/>' +
    '<stop offset="1" stop-color="' + p.mist + '" stop-opacity="0"/></linearGradient>'
  s += '<radialGradient id="vig' + uid + '" cx="0.5" cy="0.48" r="0.78"><stop offset="0.6" stop-color="#000" stop-opacity="0"/>' +
    '<stop offset="1" stop-color="#000" stop-opacity="0.20"/></radialGradient>'
  s += '<filter id="soft' + uid + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter>'
  s += '</defs>'
  s += '<rect width="' + w + '" height="' + h + '" fill="url(#sky' + uid + ')"/>'

  /* 日 / 月 */
  const sunX = w * (scene.sunX ?? 0.72)
  const sunY = h * (scene.sunY ?? 0.22)
  const sunR = w * (scene.sunR ?? 0.045)
  s += '<circle cx="' + n(sunX) + '" cy="' + n(sunY) + '" r="' + n(sunR * 5) + '" fill="url(#glow' + uid + ')"/>'
  s += '<circle cx="' + n(sunX) + '" cy="' + n(sunY) + '" r="' + n(sunR) + '" fill="' + p.sun + '" opacity="0.95"/>'

  /* 云带 */
  s += '<g filter="url(#soft' + uid + ')" opacity="0.5" fill="' + p.mist + '">'
  for (let i = 0; i < 3; i++) {
    const cy = h * (0.1 + i * 0.09) + rand() * 20
    const cw = w * (0.24 + rand() * 0.3)
    s += '<ellipse cx="' + n(w * rand()) + '" cy="' + n(cy) + '" rx="' + n(cw) + '" ry="' + n(9 + rand() * 8) + '" />'
  }
  s += '</g>'

  const ridgeColors = scene.ridgeColors || p.ridges
  const layers = scene.water ? 2 : 4

  /* 远山 */
  for (let i = 0; i < layers; i++) {
    const t = layers === 1 ? 0 : i / (layers - 1)
    const baseY = horizon * (0.62 + t * 0.5)
    const amp = h * (0.15 - t * 0.035)
    s += '<path d="' + ridgeLayer(w, h, baseY, amp, seed + i * 17 + 3, 8 + i * 2, 0.42) + '" fill="' +
      ridgeColors[Math.min(ridgeColors.length - 1, i)] + '" opacity="' + n(0.95 - t * 0.1) + '"/>'
    if (i < layers - 1) {
      s += '<rect x="0" y="' + n(baseY - amp * 0.35) + '" width="' + w + '" height="' + n(amp * 1.5) +
        '" fill="url(#mist' + uid + ')"/>'
    }
  }

  /* 水面 */
  if (scene.water) {
    const wy = horizon * 1.06
    s += '<rect x="0" y="' + n(wy) + '" width="' + w + '" height="' + n(h - wy + 10) + '" fill="url(#wat' + uid + ')"/>'
    s += '<g stroke="' + p.mist + '" stroke-linecap="round" opacity="0.4">'
    for (let i = 0; i < 18; i++) {
      const ly = wy + (h - wy) * (i / 18) + rand() * 8
      const lw = w * (0.06 + rand() * 0.26)
      const lx = w * rand() * 0.8
      s += '<path d="M' + n(lx) + ',' + n(ly) + ' h' + n(lw) + '" stroke-width="' + n(1.2 + rand() * 2.4) +
        '" opacity="' + n(0.2 + rand() * 0.45) + '"/>'
    }
    s += '</g>'
    s += '<rect x="0" y="' + n(wy) + '" width="' + w + '" height="' + n(h * 0.07) + '" fill="url(#mist' + uid + ')"/>'
  }

  /* 主体剪影 */
  const fgY = h * (scene.fgY ?? 0.9)
  if (scene.city) {
    s += skyline(w * 0.02, fgY, w * 0.96, seed + 9, p.fg, 0.8)
    s += '<rect x="0" y="' + n(fgY - 3) + '" width="' + w + '" height="' + n(h - fgY + 3) + '" fill="' + p.fg + '"/>'
  }
  if (scene.road) s += road(w * 0.05, fgY - h * 0.3, w * 0.9, h, p.fg, p.mist)
  if (scene.pagoda) s += pagoda(w * (scene.pagodaX ?? 0.2), fgY, scene.pagodaS ?? 1, p.fg)
  if (scene.roofs) {
    s += hanRoof(w * 0.2, fgY, w * 0.4, p.fg, true)
    s += hanRoof(w * 0.56, fgY + h * 0.028, w * 0.34, p.fg, true)
    if (scene.roofs > 1) s += hanRoof(w * 0.88, fgY - h * 0.012, w * 0.36, p.fg, true)
  }
  if (scene.bamboo) s += bambooGrove(w * (scene.bambooX ?? 0.02), fgY + 6, w * (scene.bambooW ?? 0.5), seed + 31, p.fg, 0.92)
  if (scene.pines) {
    const count = scene.pines
    for (let i = 0; i < count; i++) {
      s += pineTree(w * (0.05 + (i / count) * 0.3) + rand() * 24, fgY + rand() * 14, 0.7 + rand() * 0.8, p.fg, 0.95)
    }
  }
  if (scene.bridge) s += bridge(w * 0.52, fgY - h * 0.075, w * 0.44, p.fg)
  if (scene.panda) s += panda(w * (scene.pandaX ?? 0.74), fgY - h * 0.03, scene.pandaS ?? 1.5, p.fg, p.mist)
  if (scene.boat) s += boat(w * (scene.boatX ?? 0.66), fgY - h * 0.16, scene.boatS ?? 1, p.fg)
  if (scene.lanterns) s += lanterns(w * 0.08, fgY, w * 0.84, seed + 44, p.fg)

  /* 地面 / 岸边 */
  if (scene.ground !== false) {
    s += '<path d="M0,' + n(h * 0.955) + ' Q' + n(w * 0.28) + ',' + n(h * 0.92) + ' ' + n(w * 0.52) + ',' + n(h * 0.985) +
      ' T' + w + ',' + n(h * 0.945) + ' L' + w + ',' + h + ' L0,' + h + ' Z" fill="' + p.fg + '" opacity="0.96"/>'
  }

  /* 美食主题：静物构图 */
  if (scene.bowl) {
    s += '<rect width="' + w + '" height="' + h + '" fill="' + p.mist + '" opacity="0.34"/>'
    s += '<circle cx="' + n(w * 0.5) + '" cy="' + n(h * 0.53) + '" r="' + n(h * 0.36) + '" fill="' + p.mist +
      '" opacity="0.5"/>'
    s += '<circle cx="' + n(w * 0.5) + '" cy="' + n(h * 0.53) + '" r="' + n(h * 0.36) + '" fill="none" stroke="' +
      p.fg + '" stroke-opacity="0.18" stroke-width="2"/>'
    s += '<path d="M0,' + n(h * 0.76) + ' Q' + n(w * 0.5) + ',' + n(h * 0.73) + ' ' + w + ',' + n(h * 0.77) +
      ' L' + w + ',' + h + ' L0,' + h + ' Z" fill="' + p.fg + '" opacity="0.16"/>'
    const bs = (h / 750) * 1.05
    s += bowl(w * 0.5, h * 0.56, bs, { body: p.fg, food: p.mist, accent: '#b5372c', steam: p.mist })
    s += '<g fill="#b5372c" opacity="0.5">'
    for (let i = 0; i < 7; i++) {
      s += '<ellipse cx="' + n(w * (0.2 + rand() * 0.6)) + '" cy="' + n(h * (0.8 + rand() * 0.12)) + '" rx="' +
        n(4 + rand() * 6) + '" ry="' + n(3 + rand() * 4) + '" />'
    }
    s += '</g>'
  }

  s += '<rect width="' + w + '" height="' + h + '" fill="url(#vig' + uid + ')"/>'
  s += '<rect x="16" y="16" width="' + (w - 32) + '" height="' + (h - 32) + '" fill="none" stroke="#ffffff" ' +
    'stroke-opacity="0.3" stroke-width="1"/>'
  if (seal) {
    const bx = w - 108
    const by = h - 108
    s += '<g><rect x="' + bx + '" y="' + by + '" width="72" height="72" rx="8" fill="#b5372c" opacity="0.92"/>' +
      '<text x="' + (bx + 36) + '" y="' + (by + 47) + '" text-anchor="middle" ' +
      'font-family="Songti SC, STSong, SimSun, serif" font-size="' + (seal.length > 2 ? 26 : 32) + '" fill="#fff8ee">' +
      seal + '</text></g>'
  }
  s += '</svg>'
  return s
}


/* ---------------- 美食静物 ---------------- */
function stillLife({ w = 1000, h = 750, palette, seed, title = '', seal = '' }) {
  const p = PALETTES[palette] || PALETTES.warm
  const rand = mulberry32(seed)
  const uid = 'f' + seed
  const cx = w * 0.5
  const cy = h * 0.55
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h +
    '" role="img" aria-label="' + title + '"><defs>'
  s += '<linearGradient id="bg' + uid + '" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="' + p.sky[0] +
    '"/><stop offset="0.6" stop-color="' + p.sky[1] + '"/><stop offset="1" stop-color="' + p.sky[2] + '"/></linearGradient>'
  s += '<radialGradient id="lp' + uid + '" cx="0.5" cy="0.34" r="0.62"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/>' +
    '<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
  s += '</defs>'
  s += '<rect width="' + w + '" height="' + h + '" fill="url(#bg' + uid + ')"/>'
  s += '<rect width="' + w + '" height="' + h + '" fill="url(#lp' + uid + ')"/>'
  s += '<rect x="0" y="' + n(h * 0.74) + '" width="' + w + '" height="' + n(h * 0.26) + '" fill="' + p.fg +
    '" opacity="0.1"/>'
  // 圆形餐盘
  const plate = h * 0.36
  s += '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(plate) + '" fill="#fff" opacity="0.34"/>'
  s += '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(plate) + '" fill="none" stroke="' + p.fg +
    '" stroke-opacity="0.22" stroke-width="2"/>'
  s += '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(plate * 0.86) + '" fill="none" stroke="' + p.fg +
    '" stroke-opacity="0.12" stroke-width="1.5"/>'
  // 碗与食物
  s += bowl(cx, cy + h * 0.02, (h / 750) * 1.02, { body: p.fg, food: '#fff8ef', accent: '#b5372c', steam: '#fff8ef' })
  // 筷箸搁在碗沿
  s += '<g stroke="' + p.fg + '" stroke-width="' + n(h * 0.012) + '" stroke-linecap="round" opacity="0.9">'
  s += '<line x1="' + n(cx + plate * 0.32) + '" y1="' + n(cy - plate * 0.22) + '" x2="' + n(cx + plate * 0.92) +
    '" y2="' + n(cy - plate * 0.52) + '"/>'
  s += '<line x1="' + n(cx + plate * 0.28) + '" y1="' + n(cy - plate * 0.1) + '" x2="' + n(cx + plate * 0.88) +
    '" y2="' + n(cy - plate * 0.4) + '"/>'
  s += '</g>'
  // 桌面上散落的辣椒与花椒
  s += '<g fill="#b5372c" opacity="0.55">'
  for (let i = 0; i < 8; i++) {
    s += '<ellipse cx="' + n(w * (0.12 + rand() * 0.76)) + '" cy="' + n(h * (0.8 + rand() * 0.14)) + '" rx="' +
      n(5 + rand() * 7) + '" ry="' + n(3.5 + rand() * 4) + '" transform="rotate(' + n(rand() * 60) + ' ' +
      n(w * 0.2) + ' ' + n(h * 0.85) + ')"/>'
  }
  s += '</g>'
  s += '<g fill="' + p.fg + '" opacity="0.3">'
  for (let i = 0; i < 14; i++) {
    s += '<circle cx="' + n(w * (0.1 + rand() * 0.8)) + '" cy="' + n(h * (0.78 + rand() * 0.18)) + '" r="' +
      n(1.6 + rand() * 1.6) + '"/>'
  }
  s += '</g>'
  s += '<rect x="16" y="16" width="' + (w - 32) + '" height="' + (h - 32) + '" fill="none" stroke="#ffffff" ' +
    'stroke-opacity="0.35" stroke-width="1"/>'
  if (seal) {
    const bx = w - 108
    const by = h - 108
    s += '<g><rect x="' + bx + '" y="' + by + '" width="72" height="72" rx="8" fill="#b5372c" opacity="0.92"/>' +
      '<text x="' + (bx + 36) + '" y="' + (by + 47) + '" text-anchor="middle" ' +
      'font-family="Songti SC, STSong, SimSun, serif" font-size="' + (seal.length > 2 ? 26 : 32) + '" fill="#fff8ee">' +
      seal + '</text></g>'
  }
  s += '</svg>'
  return s
}

/* ---------------- 资源清单 ---------------- */
const HD = { w: 1600, h: 900 }
const CARD = { w: 1000, h: 750 }

const items = [
  // 主页轮播（16:9 大图）
  { file: 'hero-1', ...HD, palette: 'dawn', seed: 11, title: '锦江晨晓', seal: '天成', scene: { horizon: 0.6, water: true, pagoda: true, pagodaX: 0.17, pagodaS: 0.9, bamboo: true, bambooW: 0.26, pines: 2, sunX: 0.76, sunY: 0.2 } },
  { file: 'hero-2', ...HD, palette: 'jade', seed: 23, title: '竹里青城', seal: '青城', scene: { horizon: 0.56, bamboo: true, bambooW: 0.66, pines: 4, sunX: 0.28, sunY: 0.18, sunR: 0.032 } },
  { file: 'hero-3', ...HD, palette: 'mist', seed: 37, title: '都江古堰', seal: '泽被', scene: { horizon: 0.58, water: true, bridge: true, pines: 3, boat: true, sunX: 0.34, sunY: 0.16, sunR: 0.028 } },
  { file: 'hero-4', ...HD, palette: 'night', seed: 51, title: '夜泊锦官', seal: '夜游', scene: { horizon: 0.62, water: true, city: true, boat: true, boatX: 0.62, sunY: 0.18, sunR: 0.03, lanterns: true } },
  // 经典景区
  { file: 'scenic-dujiangyan', ...CARD, palette: 'mist', seed: 101, title: '都江堰', seal: '古堰', scene: { horizon: 0.58, water: true, bridge: true, pines: 3, sunY: 0.16, sunR: 0.03 } },
  { file: 'scenic-qingchengshan', ...CARD, palette: 'jade', seed: 102, title: '青城山', seal: '青城', scene: { horizon: 0.5, bamboo: true, bambooW: 0.42, pines: 4, pagoda: true, pagodaX: 0.78, pagodaS: 0.7, sunY: 0.14, sunR: 0.032 } },
  { file: 'scenic-wuhouci', ...CARD, palette: 'autumn', seed: 103, title: '武侯祠', seal: '武侯', scene: { horizon: 0.6, roofs: 2, pines: 3, sunX: 0.2, sunY: 0.18, sunR: 0.04 } },
  { file: 'scenic-kuanzhai', ...CARD, palette: 'dusk', seed: 104, title: '宽窄巷子', seal: '宽窄', scene: { horizon: 0.62, roofs: 2, pines: 1, sunX: 0.82, sunY: 0.2, sunR: 0.04 } },
  { file: 'scenic-panda', ...CARD, palette: 'jade', seed: 105, title: '熊猫基地', seal: '国宝', scene: { horizon: 0.52, bamboo: true, bambooW: 0.72, panda: true, pandaX: 0.72, pandaS: 1.7, sunY: 0.14, sunR: 0.03 } },
  { file: 'scenic-jinli', ...CARD, palette: 'night', seed: 106, title: '锦里古街', seal: '锦里', scene: { horizon: 0.6, roofs: 2, pagoda: true, pagodaX: 0.82, pagodaS: 0.55, lanterns: true, sunY: 0.16, sunR: 0.028 } },
  { file: 'scenic-dufu', ...CARD, palette: 'autumn', seed: 107, title: '杜甫草堂', seal: '草堂', scene: { horizon: 0.6, bamboo: true, bambooW: 0.34, roofs: 2, sunX: 0.78, sunY: 0.16, sunR: 0.038 } },
  { file: 'scenic-jinsha', ...CARD, palette: 'dusk', seed: 108, title: '金沙遗址', seal: '金沙', scene: { horizon: 0.56, sunR: 0.075, sunX: 0.5, sunY: 0.2, pines: 2 } },
  { file: 'scenic-xiling', ...CARD, palette: 'snow', seed: 109, title: '西岭雪山', seal: '西岭', scene: { horizon: 0.46, pines: 4, sunX: 0.3, sunY: 0.14, sunR: 0.03 } },
  { file: 'scenic-taikoo', ...CARD, palette: 'night', seed: 110, title: '太古里', seal: '太古', scene: { horizon: 0.62, city: true, sunY: 0.16, sunR: 0.03 } },
  // 文化活动
  { file: 'culture-deng', ...CARD, palette: 'night', seed: 201, title: '熊猫灯会', seal: '灯会', scene: { horizon: 0.6, city: true, lanterns: true, sunY: 0.15, sunR: 0.04 } },
  { file: 'culture-chuanju', ...CARD, palette: 'dusk', seed: 202, title: '川剧变脸', seal: '川剧', scene: { horizon: 0.64, roofs: 2, sunX: 0.5, sunY: 0.24, sunR: 0.085 } },
  { file: 'culture-miaohui', ...CARD, palette: 'dawn', seed: 203, title: '新春大庙会', seal: '庙会', scene: { horizon: 0.6, roofs: 2, pines: 2, lanterns: true, sunY: 0.16, sunR: 0.036 } },
  { file: 'culture-tangjiu', ...CARD, palette: 'autumn', seed: 204, title: '糖酒会', seal: '糖酒', scene: { horizon: 0.64, city: true, sunY: 0.18, sunR: 0.034 } },
  { file: 'culture-music', ...CARD, palette: 'night', seed: 205, title: '国际音乐节', seal: '音乐', scene: { horizon: 0.6, city: true, sunY: 0.16, sunR: 0.03 } },
  { file: 'culture-shuxiu', ...CARD, palette: 'jade', seed: 206, title: '蜀绣非遗', seal: '蜀绣', scene: { horizon: 0.62, bamboo: true, bambooW: 0.44, sunY: 0.16, sunR: 0.03 } },
  { file: 'culture-longzhou', ...CARD, palette: 'jade', seed: 207, title: '锦江龙舟', seal: '龙舟', scene: { horizon: 0.54, water: true, bridge: true, boat: true, boatX: 0.62, sunY: 0.14, sunR: 0.03 } },
  { file: 'culture-feiyi', ...CARD, palette: 'mist', seed: 208, title: '国际非遗节', seal: '非遗', scene: { horizon: 0.58, roofs: 2, pines: 2, lanterns: true, sunY: 0.16, sunR: 0.03 } },
  { file: 'culture-marathon', ...CARD, palette: 'dawn', seed: 209, title: '成都马拉松', seal: '奔跑', scene: { horizon: 0.6, city: true, road: true, sunY: 0.16, sunR: 0.036 } },
  // 特色美食
  { file: 'food-huoguo', ...CARD, palette: 'dusk', seed: 301, title: '成都火锅', seal: '火锅', scene: { horizon: 0.62, bowl: true, sunX: 0.5, sunY: 0.2, sunR: 0.09 } },
  { file: 'food-chuanchuan', ...CARD, palette: 'dusk', seed: 302, title: '串串香', seal: '串串', scene: { horizon: 0.64, bowl: true, sunX: 0.74, sunY: 0.18, sunR: 0.07 } },
  { file: 'food-dandanmian', ...CARD, palette: 'autumn', seed: 303, title: '担担面', seal: '担担面', scene: { horizon: 0.62, bowl: true, sunX: 0.3, sunY: 0.18, sunR: 0.07 } },
  { file: 'food-zhongshuijiao', ...CARD, palette: 'dawn', seed: 304, title: '钟水饺', seal: '水饺', scene: { horizon: 0.64, bowl: true, sunX: 0.68, sunY: 0.16, sunR: 0.07 } },
  { file: 'food-longchaoshou', ...CARD, palette: 'jade', seed: 305, title: '龙抄手', seal: '抄手', scene: { horizon: 0.64, bowl: true, sunX: 0.24, sunY: 0.16, sunR: 0.07 } },
  { file: 'food-mafu', ...CARD, palette: 'dusk', seed: 306, title: '麻婆豆腐', seal: '麻婆', scene: { horizon: 0.64, bowl: true, sunX: 0.34, sunY: 0.18, sunR: 0.07 } },
  { file: 'food-guokui', ...CARD, palette: 'autumn', seed: 307, title: '军屯锅盔', seal: '锅盔', scene: { horizon: 0.64, bowl: true, sunX: 0.72, sunY: 0.18, sunR: 0.06 } },
  { file: 'food-tangyou', ...CARD, palette: 'dawn', seed: 308, title: '糖油果子', seal: '糖油', scene: { horizon: 0.64, bowl: true, sunX: 0.62, sunY: 0.16, sunR: 0.08 } },
  { file: 'food-gaiwan', ...CARD, palette: 'jade', seed: 309, title: '盖碗茶', seal: '盖碗', scene: { horizon: 0.62, bamboo: true, bambooW: 0.5, bowl: true, sunX: 0.26, sunY: 0.16, sunR: 0.06 } },
  { file: 'food-feichangfen', ...CARD, palette: 'dusk', seed: 310, title: '肥肠粉', seal: '肥肠', scene: { horizon: 0.64, bowl: true, sunX: 0.4, sunY: 0.18, sunR: 0.07 } },
  { file: 'food-boboji', ...CARD, palette: 'autumn', seed: 311, title: '钵钵鸡', seal: '钵钵', scene: { horizon: 0.64, bowl: true, sunX: 0.28, sunY: 0.18, sunR: 0.06 } },
  // 游记攻略
  { file: 'guide-3days', ...CARD, palette: 'dawn', seed: 401, title: '三天两夜经典路线', seal: '三日', scene: { horizon: 0.56, water: true, pagoda: true, pagodaX: 0.24, pagodaS: 0.85, boat: true, sunX: 0.76, sunY: 0.15, sunR: 0.03 } },
  { file: 'guide-panda', ...CARD, palette: 'jade', seed: 402, title: '熊猫与美食一日', seal: '熊猫', scene: { horizon: 0.52, bamboo: true, bambooW: 0.62, panda: true, pandaX: 0.7, pandaS: 1.5, sunY: 0.14, sunR: 0.028 } },
  { file: 'guide-museum', ...CARD, palette: 'mist', seed: 403, title: '雨天博物馆之旅', seal: '文博', scene: { horizon: 0.58, roofs: 2, pines: 2, sunY: 0.16, sunR: 0.026 } },
  { file: 'guide-night', ...CARD, palette: 'night', seed: 404, title: '夜游锦江', seal: '夜游', scene: { horizon: 0.58, water: true, city: true, boat: true, lanterns: true, sunY: 0.15, sunR: 0.028 } },
  { file: 'guide-family', ...CARD, palette: 'autumn', seed: 405, title: '亲子研学两日', seal: '研学', scene: { horizon: 0.58, pines: 3, roofs: 2, sunY: 0.16, sunR: 0.032 } },
  { file: 'guide-dujiangyan', ...CARD, palette: 'mist', seed: 406, title: '都江堰青城山两日', seal: '两日', scene: { horizon: 0.56, water: true, bridge: true, pines: 3, sunY: 0.15, sunR: 0.028 } },
  // 城市介绍
  { file: 'city-history', ...CARD, palette: 'autumn', seed: 501, title: '三千年城址未改', seal: '三千年', scene: { horizon: 0.6, roofs: 2, pines: 2, pagoda: true, pagodaX: 0.82, pagodaS: 0.5, sunY: 0.16, sunR: 0.032 } },
  { file: 'city-geo', ...CARD, palette: 'mist', seed: 502, title: '两山夹一城', seal: '天府', scene: { horizon: 0.52, water: true, pines: 3, sunY: 0.14, sunR: 0.028 } },
  { file: 'city-culture', ...CARD, palette: 'jade', seed: 503, title: '天府文化', seal: '文脉', scene: { horizon: 0.58, bamboo: true, bambooW: 0.42, pagoda: true, pagodaX: 0.8, pagodaS: 0.62, sunY: 0.16, sunR: 0.03 } },
  { file: 'city-life', ...CARD, palette: 'dusk', seed: 504, title: '烟火成都', seal: '烟火', scene: { horizon: 0.6, city: true, water: true, sunY: 0.18, sunR: 0.034 } },
  // 服务 / 交通
  { file: 'service-hero', ...HD, palette: 'jade', seed: 601, title: '城市服务', seal: '服务', scene: { horizon: 0.6, city: true, sunY: 0.18, sunR: 0.03 } },
  { file: 'traffic-hero', ...HD, palette: 'night', seed: 701, title: '交通路线', seal: '通达', scene: { horizon: 0.6, city: true, road: true, sunY: 0.16, sunR: 0.03 } },
]

let count = 0
for (const it of items) {
  const svg = it.scene && it.scene.bowl ? stillLife(it) : poster(it)
  writeFileSync(resolve(OUT, it.file + '.svg'), svg, 'utf8')
  count++
}
console.log('generated ' + count + ' svg assets -> ' + OUT)