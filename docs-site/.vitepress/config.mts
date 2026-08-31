import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'id-ID',
  title: 'Enpii Studio Platform',
  description: 'Fondasi aplikasi Laravel multi-tenant dan design system Vue yang konsisten.',
  srcDir: '.',
  cleanUrls: true,
  head: [['meta', { name: 'theme-color', content: '#0d0d0d' }]],
  themeConfig: {
    nav: [
      { text: 'Platform & Core', link: '/guide/platform-conventions' },
      { text: 'UI', link: '/ui/' },
      { text: 'Roadmap', link: '/guide/roadmap' }
    ],
    sidebar: [
      {
        text: 'Platform & Core',
        items: [
          { text: 'Ringkasan Platform', link: '/platform' },
          { text: 'Konvensi Platform', link: '/guide/platform-conventions' },
          { text: 'Tenancy', link: '/core/tenancy' },
          { text: 'Identity', link: '/core/identity' },
          { text: 'Authorization', link: '/core/authorization' },
          { text: 'Settings', link: '/core/settings' },
          { text: 'FeatureFlags', link: '/core/feature-flags' },
          { text: 'Audit', link: '/core/audit' },
          { text: 'Media', link: '/core/media' },
          { text: 'Notification', link: '/core/notification' }
        ]
      },
      {
        text: 'UI',
        items: [
          { text: 'Ringkasan UI', link: '/ui/' },
          { text: 'Komponen', link: '/ui/components' },
          { text: 'Token & Style Layer', link: '/ui/tokens-and-layers' }
        ]
      },
      {
        text: 'Referensi',
        items: [
          { text: 'Roadmap & Milestone', link: '/guide/roadmap' }
        ]
      }
    ],
    search: { provider: 'local', options: { translations: { button: { buttonText: 'Cari', buttonAriaLabel: 'Cari dokumen' }, modal: { noResultsText: 'Tidak ada hasil', resetButtonTitle: 'Hapus kueri', footer: { selectText: 'pilih', navigateText: 'navigasi', closeText: 'tutup' } } } } },
    darkModeSwitchLabel: 'Tema',
    lightModeSwitchTitle: 'Beralih ke terang',
    darkModeSwitchTitle: 'Beralih ke gelap'
  },
  vite: {
    css: { preprocessorOptions: { scss: { silenceDeprecations: ['legacy-js-api'] } } }
  }
})
