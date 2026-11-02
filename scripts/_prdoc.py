
import io
p = r'C:\Users\Lenovo\Desktop\web第二次小组任务\city-web\docs\分工与PR记录.md'
s = io.open(p, encoding='utf-8', newline='').read()
row7 = '| #7 | feature/docs | 全套交付文档与报告 | 全体 | merge: 合入项目文档与小组报告 | 已合并 |'
row8 = '\r\n| #8 | feature/art-refresh | 51 张对应条目的插画重绘、5 张 21:7 内页横幅与接线 | 张、李 | merge: 合入插画重绘与内页横幅 | 已合并 |'
if 'feature/art-refresh' not in s:
    s = s.replace(row7, row7 + row8)
    s = s.replace('*   release: v1.0.0 成都文化宣传网站首次完整交付',
        '*   release: v1.2.0 插画重绘与内页横幅\r\n*   merge: 合入插画重绘与内页横幅（PR #8）\r\n*   release: v1.0.0 成都文化宣传网站首次完整交付')
    s = s.replace('（27 个提交）', '（30 个提交）')
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
    print('updated')
else:
    print('already updated')
