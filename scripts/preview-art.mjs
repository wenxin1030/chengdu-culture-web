
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
const names = process.argv.slice(2)
mkdirSync('.preview', { recursive: true })
for (const nm of names) {
  const svg = readFileSync(resolve('src/assets/img', nm + '.svg'), 'utf8')
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: 900 }, font: { loadSystemFonts: true } })
  const png = r.render().asPng()
  writeFileSync(resolve('.preview', nm + '.png'), png)
  console.log(nm, png.length)
}
