/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_LLM_ENDPOINT?: string
  readonly VITE_LLM_API_KEY?: string
  readonly VITE_LLM_MODEL?: string
  readonly VITE_WEATHER_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
