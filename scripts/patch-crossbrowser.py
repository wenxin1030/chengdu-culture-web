# -*- coding: utf-8 -*-
import io, os
os.chdir(r"C:\Users\Lenovo\Desktop\web第二次小组任务\city-web")
BT = chr(96)

EDITS = {
 "docs/10-测试报告.md": [
   ("| 端到端测试 | Playwright 1.64（Edge） | 桌面 1440×900 + 移动 390×844 关键路径 | 4 文件 / 16 用例 ×2 |",
    "| 端到端测试 | Playwright 1.64（Edge / Chromium / Firefox / WebKit） | 5 种形态：Edge 桌面、Edge 移动、Firefox 桌面、WebKit 桌面、WebKit 移动 | 4 文件 / 16 用例 × 5 = **80 次执行** |"),
   ("| Firefox | 最新 | 已核对用到的 color-mix / dvh / aspect-ratio / backdrop-filter 均在其支持范围；未做自动化（本机未安装） |",
    "| Firefox | 1555（Playwright 自带） | **桌面 16/16 通过**（1440×900） |"),
   ("| Safari | 最新 | 同上；" + BT + "-webkit-line-clamp" + BT + " 已加前缀，" + BT + "backdrop-filter" + BT + " 有降级底色 |",
    "| Safari | WebKit 27.2（Playwright，等价 Safari 内核） | **桌面 16/16、iPhone 13 移动 16/16 通过**；" + BT + "-webkit-line-clamp" + BT + " 已加前缀，" + BT + "backdrop-filter" + BT + " 有降级底色 |"),
   ("1. 自动化仅在本机 Edge 上执行；Firefox/Safari 未做自动化回归（本机无对应浏览器）。",
    "1. 自动化覆盖 4 个内核（Chromium/Edge、Firefox、WebKit）共 5 种形态、80 次执行；真实 iOS/桌面 Safari 设备未单独覆盖（WebKit 为其内核）。"),
 ],
 "docs/11-缺陷清单.md": [
   ("1. Firefox / Safari 未做自动化回归（环境限制），已人工核对这些浏览器对新 CSS 特性的支持范围。",
    "1. 真实 iOS/桌面 Safari 设备未覆盖（已用 Playwright WebKit 覆盖其内核，桌面 16/16、移动 16/16 通过）。"),
 ],
 "docs/12-部署与CI说明.md": [
   ("（可选 job）Playwright：安装 chromium 后跑 32 条 E2E",
    "（可选 job）Playwright：安装 chromium 后跑 16 条 E2E（桌面 Chromium）"),
 ],
 "docs/13-项目复盘报告.md": [
   ("| 高 | 补齐 Firefox/Safari 回归 | 引入 " + BT + "playwright install firefox webkit" + BT + " |",
    "| ~~高~~ | ~~补齐 Firefox/Safari 回归~~ | 已完成：Playwright Firefox 桌面 16/16、WebKit 桌面/移动 16/16 |"),
 ],
 "docs/01-需求规格说明书.md": [
   ("| 兼容性 | Chrome/Edge/Firefox/Safari 最新两版 | 已测 Edge 156 / Chromium 内核 |",
    "| 兼容性 | Chrome/Edge/Firefox/Safari 最新两版 | 已测 Edge 156、Playwright Chromium、Firefox 1555、WebKit 27.2（80 次 E2E 全通过） |"),
 ],
 "docs/分工与PR记录.md": [
   ("44 条单测、32 条 E2E、Lighthouse 优化", "44 条单测、80 次 E2E 执行、Lighthouse 优化"),
 ],
 "README.md": [
   ("| 端到端测试 | 4 个文件 / 16 条用例 × 2 形态，全部通过 |",
    "| 端到端测试 | 4 个文件 / 16 条用例 × 5 形态（Edge 桌面/移动、Firefox 桌面、WebKit 桌面/移动）= 80 次执行，全部通过 |"),
 ],
}

for path, pairs in EDITS.items():
    txt = io.open(path, encoding="utf-8").read()
    for a, b in pairs:
        if a not in txt:
            print("MISS", path, a[:40])
        txt = txt.replace(a, b)
    io.open(path, "w", encoding="utf-8").write(txt)
    print("patched", path)
