import { defineStore } from 'pinia'
import { faqItems, suggestedQuestions } from '@/data/faq'
import { scoreMatch, similarity } from '@/utils/search'

export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  faqId?: string
  link?: string
  time: string
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text:
    '你好，我是「锦官小助手」。\n可以问我熊猫基地怎么玩、火锅怎么点、三天怎么安排、机场怎么去……也可以直接输入上面的推荐问题。',
  time: '',
}

function nowLabel(): string {
  const d = new Date()
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

/**
 * 在知识库中检索最匹配的问题。
 * 两路打分：
 *  1) 关键词加权匹配（显式关键词，如“熊猫基地 门票”）；
 *  2) 二元组相似度（自然语言长问句，如“熊猫基地几点去最好”）。
 * 取两者较大值，低于阈值视为未命中，由 store 回复兜底文案。
 */
export function matchFaq(query: string) {
  const q = query.trim()
  if (!q) return null
  let best: { score: number; item: (typeof faqItems)[number] } | null = null
  for (const item of faqItems) {
    const { score } = scoreMatch(q, [
      { text: item.question, weight: 6 },
      { text: item.keys.join(' '), weight: 4 },
      { text: item.tags.join(' '), weight: 2 },
      { text: item.answer, weight: 1 },
    ])
    const simQuestion = similarity(q, item.question) * 15
    const simKeys = similarity(q, item.keys.join('')) * 10
    const total = score + Math.max(simQuestion, simKeys)
    if (!best || total > best.score) best = { score: total, item }
  }
  return best && best.score >= 5 ? best.item : null
}

/** 智能问答 store：本地知识库 + 关键词打分，无需后端 */
export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [{ ...WELCOME, time: nowLabel() }] as ChatMessage[],
    thinking: false,
    suggestions: [...suggestedQuestions] as string[],
    askedCount: 0,
  }),
  getters: {
    lastAnswer: (state) => [...state.messages].reverse().find((m) => m.role === 'bot'),
    userMessages: (state) => state.messages.filter((m) => m.role === 'user'),
  },
  actions: {
    ask(question: string) {
      const text = question.trim()
      if (!text || this.thinking) return
      this.messages.push({ id: 'u-' + Date.now(), role: 'user', text, time: nowLabel() })
      this.thinking = true
      this.askedCount += 1
      const delayMs = 480 + Math.random() * 320
      setTimeout(() => {
        const hit = matchFaq(text)
        this.messages.push({
          id: 'b-' + Date.now(),
          role: 'bot',
          text: hit
            ? hit.answer
            : '这个问题我还没学会。你可以换个说法，或者试试这些方向：\n· 景点：熊猫基地、都江堰、武侯祠、宽窄巷子\n· 美食：火锅、串串、小吃街\n· 交通：机场、地铁、景区换乘\n· 行程：三天路线、亲子研学\n也可以拨打 12345 咨询最新的旅游信息。',
          faqId: hit?.id,
          link: hit?.link,
          time: nowLabel(),
        })
        this.thinking = false
      }, delayMs)
    },
    reset() {
      this.messages = [{ ...WELCOME, time: nowLabel() }]
      this.thinking = false
    },
  },
})