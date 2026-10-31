import { computed, ref, watch } from 'vue'
import { searchAll, type SearchHit } from '@/api/search'
import { useAppStore } from '@/stores/app'

/** 全站智能搜索：输入即搜（带 120ms 防抖）、支持历史与热词 */
export function useGlobalSearch(autoWatch = true) {
  const app = useAppStore()
  const keyword = ref(app.searchKeyword)
  const results = ref<SearchHit[]>([])
  const searching = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  function run(value: string) {
    if (timer) clearTimeout(timer)
    const q = value.trim()
    if (!q) {
      results.value = []
      searching.value = false
      return
    }
    searching.value = true
    timer = setTimeout(() => {
      results.value = searchAll(q)
      searching.value = false
    }, 120)
  }

  function commit() {
    const q = keyword.value.trim()
    if (!q) return
    app.pushSearchHistory(q)
    run(q)
  }

  function reset() {
    keyword.value = ''
    results.value = []
  }

  if (autoWatch) {
    watch(keyword, (value) => {
      app.setKeyword(value)
      run(value)
    })
  }

  const grouped = computed(() => {
    const map = new Map<string, SearchHit[]>()
    for (const hit of results.value) {
      const list = map.get(hit.type) ?? []
      list.push(hit)
      map.set(hit.type, list)
    }
    return Array.from(map.entries()).map(([type, items]) => ({ type, items }))
  })

  return { keyword, results, grouped, searching, run, commit, reset }
}
