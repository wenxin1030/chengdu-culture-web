import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAppStore } from './stores/app'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 恢复主题、对比度、搜索历史与收藏（在挂载前完成，避免闪烁）
const store = useAppStore(pinia)
store.init()

app.mount('#app')
