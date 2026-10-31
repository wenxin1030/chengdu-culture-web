import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { matchFaq, useChatStore } from '@/stores/chat'
import { faqItems } from '@/data/faq'

describe('stores/chat 智能问答', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('matchFaq 命中知识库中的熊猫问题', () => {
    const hit = matchFaq('熊猫基地几点去最好')
    expect(hit).not.toBeNull()
    expect(hit?.id).toBe('panda-time')
    expect(faqItems.some((f) => f.id === hit?.id)).toBe(true)
  })

  it('matchFaq 对无关问题返回 null', () => {
    expect(matchFaq('今天股票涨了吗')).toBeNull()
  })

  it('ask 先追加用户消息，延迟后追加机器人回复', () => {
    const store = useChatStore()
    const initial = store.messages.length
    store.ask('熊猫基地门票多少钱')
    expect(store.thinking).toBe(true)
    expect(store.messages.length).toBe(initial + 1)
    expect(store.messages[initial].role).toBe('user')

    vi.advanceTimersByTime(1200)
    expect(store.thinking).toBe(false)
    expect(store.messages.length).toBe(initial + 2)
    const reply = store.messages[store.messages.length - 1]
    expect(reply.role).toBe('bot')
    expect(reply.text.length).toBeGreaterThan(10)
    expect(store.askedCount).toBe(1)
  })

  it('ask 忽略空白输入，reset 恢复欢迎语', () => {
    const store = useChatStore()
    const initial = store.messages.length
    store.ask('   ')
    expect(store.messages.length).toBe(initial)
    store.ask('火锅怎么点')
    vi.advanceTimersByTime(1200)
    store.reset()
    expect(store.messages).toHaveLength(1)
    expect(store.thinking).toBe(false)
  })
})
