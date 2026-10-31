<script setup lang="ts">
/**
 * 智能化模块 ①：智能问答助手「锦官小助手」
 * - 本地知识库 + 关键词加权匹配（src/stores/chat.ts），无需后端
 * - 支持推荐问题、回车发送、打字中状态、清空对话
 * - inline=true 时嵌入页面（首页），否则为右下角悬浮入口
 */
import { nextTick, ref, useId, watch } from 'vue'
import { useChatStore } from '@/stores/chat'

const props = withDefaults(defineProps<{ inline?: boolean }>(), { inline: false })

const chat = useChatStore()
// 首页内嵌与全站悬浮会同时存在，用 useId 保证面板与输入框 id 唯一
const uid = useId()
const open = ref(props.inline)
const draft = ref('')
const listRef = ref<HTMLElement | null>(null)

async function scrollToEnd() {
  await nextTick()
  const el = listRef.value
  if (el) el.scrollTop = el.scrollHeight
}

watch(
  () => [chat.messages.length, chat.thinking],
  () => void scrollToEnd(),
)

function send(text?: string) {
  const value = (text ?? draft.value).trim()
  if (!value) return
  chat.ask(value)
  draft.value = ''
  void scrollToEnd()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}
</script>

<template>
  <div :class="['assistant', props.inline ? 'is-inline' : 'is-float']">
    <button
      v-if="!props.inline"
      type="button"
      class="launcher"
      :aria-expanded="open"
      :aria-controls="'assistant-panel-' + uid"
      aria-label="打开智能问答助手"
      @click="open = !open"
    >
      <span class="launcher-glyph" aria-hidden="true">{{ open ? '✕' : '✦' }}</span>
      <span class="launcher-text">{{ open ? '收起' : '问成都' }}</span>
    </button>

    <Transition name="pop">
      <section v-if="open" :id="'assistant-panel-' + uid" class="panel" :class="{ 'is-inline': props.inline }" aria-label="智能问答助手">
        <header class="panel-head">
          <div class="persona">
            <span class="avatar" aria-hidden="true">锦</span>
            <div>
              <strong>锦官小助手</strong>
              <small>基于本地文旅知识库 · 离线可用</small>
            </div>
          </div>
          <button v-if="!props.inline" type="button" class="close" aria-label="收起助手" @click="open = false">✕</button>
        </header>

        <div ref="listRef" class="messages" role="log" aria-live="polite">
          <div v-for="message in chat.messages" :key="message.id" class="msg" :class="'from-' + message.role">
            <span v-if="message.role === 'bot'" class="msg-avatar" aria-hidden="true">锦</span>
            <div class="bubble">
              <p class="text">{{ message.text }}</p>
              <RouterLink v-if="message.link" :to="message.link" class="msg-link">查看详情 →</RouterLink>
              <time v-if="message.time" class="time">{{ message.time }}</time>
            </div>
          </div>
          <div v-if="chat.thinking" class="msg from-bot">
            <span class="msg-avatar" aria-hidden="true">锦</span>
            <div class="bubble typing" aria-label="正在输入">
              <i></i><i></i><i></i>
            </div>
          </div>
        </div>

        <div class="suggestions" role="group" aria-label="推荐问题">
          <button
            v-for="question in chat.suggestions"
            :key="question"
            type="button"
            class="suggestion"
            @click="send(question)"
          >
            {{ question }}
          </button>
        </div>

        <form class="composer" @submit.prevent="send()">
          <label class="sr-only" :for="'assistant-input-' + uid">输入你的问题</label>
          <input
            :id="'assistant-input-' + uid"
            v-model="draft"
            type="text"
            placeholder="问点什么…例如「熊猫基地几点去最好」"
            autocomplete="off"
            @keydown="onKeydown"
          />
          <button type="submit" class="send" :disabled="!draft.trim() || chat.thinking">发送</button>
        </form>

        <footer class="panel-foot">
          <button type="button" class="reset" @click="chat.reset()">清空对话</button>
          <span>回答依据站内攻略整理，具体以官方公告为准</span>
        </footer>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.assistant.is-float {
  position: fixed;
  right: clamp(1rem, 2vw, 2rem);
  bottom: clamp(1rem, 2vw, 2rem);
  z-index: var(--z-float);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-3);
}
.launcher {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  padding: 0.7em 1.1em;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--color-brand-600), var(--color-brand-800));
  color: #fff;
  font-size: var(--fs-sm);
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 26px color-mix(in srgb, var(--color-brand-800) 40%, transparent);
  transition: transform var(--dur-sm) var(--ease-out);
}
.launcher:hover {
  transform: translateY(-2px);
}
.launcher-glyph {
  font-size: 1rem;
}
.panel {
  min-width: 0;
  width: min(380px, calc(100vw - 2rem));
  max-height: min(600px, calc(100dvh - 8rem));
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}
.panel.is-inline {
  width: 100%;
  max-height: 560px;
  box-shadow: var(--shadow-md);
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: linear-gradient(135deg, var(--color-brand-700), var(--color-brand-900));
  color: #f4f1e8;
}
.persona {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-gold-400) 90%, transparent);
  color: var(--color-ink-900);
  font-family: var(--font-serif);
  font-weight: 700;
}
.persona strong {
  display: block;
  font-size: var(--fs-md);
  letter-spacing: 0.04em;
}
.persona small {
  font-size: var(--fs-xs);
  opacity: 0.75;
}
.close {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.8;
}
.messages {
  min-width: 0;
  flex: 1;
  min-height: 200px;
  overflow-y: auto;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: var(--color-surface-alt);
  overscroll-behavior: contain;
}
.msg {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}
.msg.from-user {
  flex-direction: row-reverse;
}
.msg-avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-brand-600);
  color: #fff;
  font-size: var(--fs-xs);
  font-family: var(--font-serif);
}
.bubble {
  max-width: 84%;
  padding: 0.6em 0.85em;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
.from-user .bubble {
  background: var(--color-brand-600);
  border-color: var(--color-brand-600);
  color: #fff;
}
.text {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.75;
  white-space: pre-line;
  word-break: break-word;
}
.msg-link {
  display: inline-block;
  margin-top: 0.4em;
  font-size: var(--fs-xs);
  color: var(--color-brand-600);
  text-decoration: none;
}
.from-user .msg-link {
  color: var(--color-gold-200);
}
.time {
  display: block;
  margin-top: 0.25em;
  font-size: 0.65rem;
  color: var(--color-text-faint);
  text-align: right;
}
.from-user .time {
  color: rgba(255, 255, 255, 0.6);
}
.typing {
  display: inline-flex;
  gap: 4px;
  padding: 0.7em 0.9em;
}
.typing i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-brand-400);
  animation: bounce 1.1s infinite ease-in-out;
}
.typing i:nth-child(2) {
  animation-delay: 0.15s;
}
.typing i:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes bounce {
  0%,
  70%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  35% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
.suggestions {
  min-width: 0;
  max-width: 100%;
  display: flex;
  gap: 0.4rem;
  padding: var(--space-2) var(--space-3);
  overflow-x: auto;
  border-top: 1px solid var(--color-border);
  scrollbar-width: none;
}
.suggestions::-webkit-scrollbar {
  display: none;
}
.suggestion {
  flex: 0 0 auto;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.3em 0.8em;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--fs-xs);
  cursor: pointer;
  white-space: nowrap;
}
.suggestion:hover {
  border-color: var(--color-brand-300);
  color: var(--color-brand-700);
}
.composer {
  display: flex;
  gap: 0.5rem;
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}
.composer input {
  flex: 1;
  min-width: 0;
  padding: 0.55em 0.8em;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface-alt);
  font: inherit;
  font-size: var(--fs-sm);
  color: var(--color-text);
  outline: none;
}
.composer input:focus {
  border-color: var(--color-brand-400);
}
.send {
  padding: 0 1em;
  border: 0;
  border-radius: 999px;
  background: var(--color-brand-600);
  color: #fff;
  font-size: var(--fs-sm);
  cursor: pointer;
}
.send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.panel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: 0.4em var(--space-3) 0.6em;
  font-size: 0.68rem;
  color: var(--color-text-faint);
}
.reset {
  border: 0;
  background: none;
  color: var(--color-brand-600);
  cursor: pointer;
  font-size: inherit;
}
.pop-enter-active,
.pop-leave-active {
  transition:
    opacity var(--dur-sm) var(--ease-out),
    transform var(--dur-sm) var(--ease-out);
  transform-origin: bottom right;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>