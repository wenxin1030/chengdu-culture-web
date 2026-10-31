import { describe, expect, it } from 'vitest'
import { comfortTip, temperatureText, weatherIcon, weatherText } from '@/utils/weather'
import { glyphOf, WEATHER_GLYPHS } from '@/utils/weatherGlyph'

describe('utils/weather', () => {
  it('weatherText 将 WMO 代码转成中文', () => {
    expect(weatherText(0)).toBe('晴')
    expect(weatherText(2)).toBe('多云')
    expect(weatherText(95)).toBe('雷雨')
    expect(weatherText(999)).toBe('多云')
  })

  it('weatherIcon 返回图标键', () => {
    expect(weatherIcon(0)).toBe('sun')
    expect(weatherIcon(3)).toBe('cloud')
    expect(weatherIcon(61)).toBe('rain')
    expect(weatherIcon(999)).toBe('cloud')
  })

  it('temperatureText 四舍五入并加度数', () => {
    expect(temperatureText(20.4)).toBe('20°')
    expect(temperatureText(20.6)).toBe('21°')
  })

  it('comfortTip 依据气温与天气给出建议', () => {
    expect(comfortTip(22, 1)).toContain('舒适')
    expect(comfortTip(33, 1)).toContain('防晒')
    expect(comfortTip(3, 1)).toContain('保暖')
    expect(comfortTip(20, 61)).toContain('伞')
  })

  it('glyphOf 同时支持字符串图标键与数字代码', () => {
    expect(glyphOf('sun')).toBe(WEATHER_GLYPHS.sun)
    expect(glyphOf(0)).toBe('☀️')
    expect(glyphOf(61)).toBe('🌧️')
  })
})
