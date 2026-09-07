import { createApp } from 'vue'
import ShowcaseApp from './ShowcaseApp.vue'
import '../src/styles/icon-font.css'
import '../entry.tailwind.css'

const app = createApp(ShowcaseApp)
app.mount('#app')
