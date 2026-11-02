/**
 * postinstall：修正 pnpm 提升目录中的 estree-walker 版本。
 *
 * 背景：@vue/compiler-core 的 CJS 入口会 require('estree-walker')，
 * 而 pnpm 默认把 ESM-only 的 3.x 提升到 .pnpm/node_modules，
 * 导致 vite 加载配置时报 ERR_PACKAGE_PATH_NOT_EXPORTED。
 * 这里把提升目录指向同时提供 CJS/ESM 的 2.0.2，保证本地与 CI 一致。
 * 任何异常都只告警，不阻断安装。
 */
import { existsSync, lstatSync, readFileSync, rmSync, symlinkSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

function versionOf(pkgDir) {
  try {
    return JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version
  } catch {
    return null
  }
}

function linkDir(linkPath, target) {
  try {
    const stat = lstatSync(linkPath)
    if (stat.isSymbolicLink() || stat.isDirectory()) rmSync(linkPath, { recursive: true, force: true })
  } catch {
    /* 不存在则直接创建 */
  }
  mkdirSync(join(linkPath, '..'), { recursive: true })
  // Windows 上 type 必须是 junction 或 dir，POSIX 忽略该参数
  try {
    symlinkSync(target, linkPath, 'junction')
  } catch {
    symlinkSync(target, linkPath, 'dir')
  }
}

const root = resolve('.')
const hoisted = join(root, 'node_modules', '.pnpm', 'node_modules', 'estree-walker')
const v2 = join(root, 'node_modules', '.pnpm', 'estree-walker@2.0.2', 'node_modules', 'estree-walker')

if (!existsSync(join(root, 'node_modules', '.pnpm'))) {
  console.log('[fix-hoisting] 跳过：未找到 pnpm 虚拟目录')
} else if (!existsSync(v2)) {
  console.log('[fix-hoisting] 跳过：未找到 estree-walker@2.0.2')
} else {
  const current = existsSync(hoisted) ? versionOf(hoisted) : null
  if (current === '2.0.2') {
    console.log('[fix-hoisting] ok：提升目录已是 2.0.2')
  } else {
    try {
      linkDir(hoisted, v2)
      console.log('[fix-hoisting] 已把提升目录从 ' + (current ?? '缺失') + ' 指向 2.0.2')
    } catch (error) {
      console.warn('[fix-hoisting] 修正失败（不影响安装，构建若报错请手动处理）：', error.message)
    }
  }
}
