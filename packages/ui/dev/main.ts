import { createApp } from 'vue'
import ShowcaseApp from './ShowcaseApp.vue'
import '../src/styles/icon-font.css'
import '../entry.tailwind.css'

// Import all canonical style layers so their [data-enpii-layer="..."] selectors are active
import '../src/styles/layers/neobrutalism.css'
import '../src/styles/layers/neobrutalism-tamed.css'
import '../src/styles/layers/material.css'
import '../src/styles/layers/glassmorphism.css'
import '../src/styles/layers/neumorphism.css'
import '../src/styles/layers/minimalism.css'

const app = createApp(ShowcaseApp)
app.mount('#app')
