import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import 'material-icons/iconfont/material-icons.css'
import { registerSW } from 'virtual:pwa-register'

// Registra o Service Worker do PWA para funcionamento offline e instalação
registerSW({ immediate: true })

const app = createApp(App)
app.use(router)
app.mount('#app-root')