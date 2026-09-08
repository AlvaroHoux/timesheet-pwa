import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'        
// import './styles/theme.css'
// import './styles/layout.css'
// import './styles/components.css'
// import './styles/screens.css'
import 'material-icons/iconfont/material-icons.css'

const app = createApp(App)
app.use(router)
app.mount('#app-root')