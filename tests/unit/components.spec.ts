import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import FilterBar from '@/components/common/FilterBar.vue'
import TagPill from '@/components/common/TagPill.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import StatCounter from '@/components/common/StatCounter.vue'

describe('公共组件', () => {
  it('FilterBar 渲染分组并派发筛选事件', async () => {
    const wrapper = mount(FilterBar, {
      props: {
        groups: [{ label: '区域', options: ['全部', '武侯区'] }],
        modelValue: { 区域: '全部' },
        total: 10,
      },
    })
    const options = wrapper.findAll('.option')
    expect(options).toHaveLength(2)
    expect(wrapper.text()).toContain('共 10 条')
    await options[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([{ 区域: '武侯区' }])
  })

  it('FilterBar 输入关键词派发 update:keyword', async () => {
    const wrapper = mount(FilterBar, {
      props: { groups: [], modelValue: {}, total: 0 },
    })
    await wrapper.find('input').setValue('火锅')
    expect(wrapper.emitted('update:keyword')?.[0]).toEqual(['火锅'])
  })

  it('TagPill 按 tone 渲染样式类', () => {
    const wrapper = mount(TagPill, { props: { tone: 'gold' }, slots: { default: '非遗' } })
    expect(wrapper.classes()).toContain('tone-gold')
    expect(wrapper.text()).toBe('非遗')
  })

  it('SectionHeading 渲染 kicker/title/desc', () => {
    const wrapper = mount(SectionHeading, {
      props: { kicker: 'SCENIC', title: '经典景区', desc: '描述文字' },
    })
    expect(wrapper.text()).toContain('SCENIC')
    expect(wrapper.find('h2').text()).toBe('经典景区')
    expect(wrapper.text()).toContain('描述文字')
  })

  it('StatCounter 挂载后展示数字', () => {
    const wrapper = mount(StatCounter, {
      props: { value: 2300, suffix: '+', unit: '年', label: '建城史' },
      global: { plugins: [createPinia()] },
    })
    expect(wrapper.text()).toContain('建城史')
    expect(wrapper.find('.num').exists()).toBe(true)
  })
})
