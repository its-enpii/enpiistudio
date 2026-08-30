import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { createT, enpiiI18nKey, enpiiUi, useT, EnpiiModal } from '../src'

describe('i18n', () => {
  it('falls back to key when translation not found', () => {
    const t = createT('id')
    expect(t('nonexistent.key')).toBe('nonexistent.key')
  })

  it('returns ID dictionary by default', () => {
    const t = createT('id')
    expect(t('modal.close')).toBe('Tutup modal')
    expect(t('smartTable.searchPlaceholder')).toBe('Cari data...')
  })

  it('returns EN dictionary when locale is en', () => {
    const t = createT('en')
    expect(t('modal.close')).toBe('Close modal')
    expect(t('smartTable.searchPlaceholder')).toBe('Search data...')
  })

  it('replaces params in translation strings', () => {
    const t = createT('id')
    expect(t('smartTable.summary', { from: 1, to: 15, total: 100 })).toBe('Menampilkan 1–15 dari 100 data')
    expect(t('notification.newCount', { count: 3 })).toBe('3 baru')
  })

  it('merges user overrides over built-in dictionary', () => {
    const t = createT('id', {
      id: { 'modal.close': 'Tutup dialog custom' },
    })
    expect(t('modal.close')).toBe('Tutup dialog custom')
    expect(t('smartTable.searchPlaceholder')).toBe('Cari data...')
  })

  it('merges user overrides for EN locale', () => {
    const t = createT('en', {
      en: { 'modal.close': 'Close dialog custom' },
    })
    expect(t('modal.close')).toBe('Close dialog custom')
    expect(t('smartTable.searchPlaceholder')).toBe('Search data...')
  })

  it('supports custom locale dictionaries', () => {
    const t = createT('ja', {
      ja: { 'modal.close': '閉じる' },
    })
    expect(t('modal.close')).toBe('閉じる')
  })

  it('plugin provides t function via injection', () => {
    const app = { provide: vi.fn(), config: { globalProperties: {} } }
    enpiiUi.install(app as never, {
      locale: 'en',
      translations: { en: { 'modal.close': 'Custom close' } },
    })

    const i18nCall = app.provide.mock.calls.find((call) => call[0] === enpiiI18nKey)
    expect(i18nCall).toBeDefined()
    const tFn = i18nCall![1]
    expect(tFn('modal.close')).toBe('Custom close')
    expect(tFn('smartTable.searchPlaceholder')).toBe('Search data...')
  })

  it('component renders EN text when plugin locale is en', () => {
    const wrapper = mount(EnpiiModal, {
      props: { modelValue: true, title: 'Test' },
      global: {
        plugins: [[enpiiUi, { locale: 'en' }]],
        stubs: { teleport: true },
      },
    })

    const closeButton = wrapper.find('.enpii-modal__close')
    expect(closeButton.exists()).toBe(true)
    expect(closeButton.attributes('aria-label')).toBe('Close modal')
    wrapper.unmount()
  })
})

describe('useT composable', () => {
  it('returns default ID dictionary when no injection available', () => {
    const wrapper = mount({
      setup() {
        const t = useT()
        return () => h('span', t('modal.close'))
      },
    })
    expect(wrapper.text()).toBe('Tutup modal')
  })

  it('uses injected t function when available', () => {
    const customT = createT('en', { en: { 'modal.close': 'Injected close' } })
    const wrapper = mount(
      {
        setup() {
          const t = useT()
          return () => h('span', t('modal.close'))
        },
      },
      {
        global: {
          provide: { [enpiiI18nKey as symbol]: customT },
        },
      },
    )
    expect(wrapper.text()).toBe('Injected close')
  })
})
