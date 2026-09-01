import { createApp, h, ref } from 'vue'
import '@its-enpii/ui/dist/enpii-ui.css'
import '../src/styles/skeleton.css'
import { EnpiiAdminSidebarLayout } from '../src'

const sidebarItems = ref([
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'users', label: 'Users', icon: 'people' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
])

const navbarLinks = ref([
  { key: 'home', label: 'Home', href: '#', active: true },
  { key: 'reports', label: 'Reports', href: '#' },
])

const activeKey = ref('dashboard')

createApp({
  setup() {
    return () =>
      h(EnpiiAdminSidebarLayout, {
        brand: 'Enpii Playground',
        sidebarItems: sidebarItems.value,
        navbarLinks: navbarLinks.value,
        activeKey: activeKey.value,
        footerBrand: 'Enpii Studio',
        footerCopyright: '© 2026',
      }, {
        default: () => h('p', { 'data-testid': 'content' }, 'Admin sidebar layout playground'),
        'navbar-actions': () => h('button', { 'data-testid': 'action' }, 'Action'),
      })
  },
}).mount('#app')
