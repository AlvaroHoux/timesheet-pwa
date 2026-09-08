/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_DIRECTUS_URL?: string
  readonly VITE_AUTH_URL?: string
  readonly VITE_LOGIN_URL?: string
  readonly VITE_DEFAULT_REDIRECT_URL?: string
  readonly VITE_APP_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}