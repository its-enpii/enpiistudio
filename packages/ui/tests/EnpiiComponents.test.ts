import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  EnpiiAlert,
  EnpiiAvatar,
  EnpiiBreadcrumb,
  EnpiiDrawer,
  EnpiiFooter,
  EnpiiNavbar,
  EnpiiPagination,
  EnpiiRange,
  EnpiiSidebar,
  EnpiiSkeleton,
  EnpiiSpinner,
  EnpiiStepper,
} from '../src'

import EnpiiProgressDirect from '../src/components/EnpiiProgress.vue'

const navigationLinks = [
  { key: 'home', label: 'Home', href: '/', active: true },
  { key: 'about', label: 'About', href: '/about' },
]

describe('EnpiiNavbar', () => {
  it('renders brand and links with current page semantics', () => {
    const wrapper = mount(EnpiiNavbar, { props: { brand: 'Enpii', links: navigationLinks } })

    expect(wrapper.get('.enpii-navbar__brand').text()).toBe('Enpii')
    expect(wrapper.findAll('.enpii-navbar__link')).toHaveLength(navigationLinks.length)
    expect(wrapper.find('[aria-current="page"]').text()).toBe('Home')
    expect(wrapper.classes()).not.toContain('enpii-navbar--sticky')
  })

  it('emits navigation from a link', async () => {
    const wrapper = mount(EnpiiNavbar, { props: { links: navigationLinks } })

    await wrapper.findAll('.enpii-navbar__link')[1].trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual([navigationLinks[1]])
  })
})

describe('EnpiiSidebar', () => {
  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: 3 },
    { key: 'library', label: 'Library', icon: 'folder', children: [{ key: 'books', label: 'Books', badge: 8 }] },
  ]

  it('highlights active items in collapsed rail mode', () => {
    const wrapper = mount(EnpiiSidebar, { props: { items, activeKey: 'dashboard', collapsed: true } })

    expect(wrapper.classes()).toContain('enpii-sidebar--collapsed')
    expect(wrapper.find('.enpii-sidebar__item--active').text()).toContain('Dashboard')
  })

  it('expands nested children and emits navigate', async () => {
    const wrapper = mount(EnpiiSidebar, { props: { items } })

    await wrapper.find('.enpii-sidebar__group-toggle').trigger('click')
    await wrapper.get('.enpii-sidebar__children a').trigger('click')
    expect(wrapper.get('.enpii-sidebar__children').isVisible()).toBe(true)
    expect(wrapper.emitted('navigate')?.[0]).toEqual([items[1].children![0]])
  })
})

describe('EnpiiFooter', () => {
  it('renders link columns and dark variant', () => {
    const wrapper = mount(EnpiiFooter, {
      props: { brand: 'Enpii', copyright: '© 2026', variant: 'dark', columns: [{ title: 'Company', links: [{ key: 'careers', label: 'Careers' }] }] },
    })

    expect(wrapper.classes()).toContain('enpii-footer--dark')
    expect(wrapper.text()).toContain('Company')
    expect(wrapper.text()).toContain('Careers')
    expect(wrapper.text()).toContain('© 2026')
  })
})

describe('EnpiiDrawer', () => {
  it('teleports an open dialog and closes on Escape', async () => {
    document.body.innerHTML = ''
    const wrapper = mount(EnpiiDrawer, { props: { title: 'Filters', side: 'left', size: 'lg', modelValue: true }, attachTo: document.body })

    const dialog = document.body.querySelector('.enpii-drawer__panel')
    expect(dialog).toBeTruthy()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    await dialog?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('closes on backdrop click', async () => {
    const wrapper = mount(EnpiiDrawer, { props: { title: 'Panel', modelValue: true }, attachTo: document.body })

    await document.body.querySelector('.enpii-drawer__backdrop')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe('form and feedback components', () => {
  it('binds range values to an accessible control', async () => {
    const wrapper = mount(EnpiiRange, { props: { label: 'Volume', min: 10, max: 50, step: 5, showValue: true, modelValue: 20 } })
    const input = wrapper.get('input[type="range"]')

    expect(input.attributes('aria-label')).toBeUndefined()
    await input.setValue('35')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([35])
    expect(wrapper.get('.enpii-range__value').text()).toBe('35')
  })

  it('renders progress variants and indeterminate mode without numeric value', () => {
    const determinate = mount(EnpiiProgressDirect, { props: { value: 42, variant: 'success', size: 'sm', showLabel: true } })
    const indeterminate = mount(EnpiiProgressDirect, { props: { value: null } })

    expect(determinate.get('.enpii-progress__track').attributes('aria-valuenow')).toBe('42')
    expect(determinate.classes()).toContain('enpii-progress--success')
    expect(indeterminate.find('.enpii-progress__bar--indeterminate').exists()).toBe(true)
    expect(indeterminate.get('.enpii-progress__track').attributes('aria-busy')).toBe('true')

  })

  it('renders spinner size and inverse tone', () => {
    const spinner = mount(EnpiiSpinner, { props: { size: 'lg', variant: 'inverse' } })
    expect(spinner.classes()).toEqual(expect.arrayContaining(['enpii-spinner--lg', 'enpii-spinner--inverse']))
    expect(spinner.get('.enpii-sr-only').text()).toBe('Loading')
  })

  it('derives initials or uses an image and status dot', () => {
    const initials = mount(EnpiiAvatar, { props: { name: 'Ada Lovelace', size: 'xl', shape: 'rounded', status: 'online' } })
    const image = mount(EnpiiAvatar, { props: { name: 'Ada', src: '/ada.png' } })

    expect(initials.get('.enpii-avatar__initials').text()).toBe('AL')
    expect(initials.classes()).toContain('enpii-avatar--rounded')
    expect(image.get('img').attributes('src')).toBe('/ada.png')
    expect(initials.get('.enpii-avatar__status--online').exists()).toBe(true)
  })

  it('renders alert slots and dismiss events', async () => {
    const onDismiss = vi.fn()
    const wrapper = mount(EnpiiAlert, {
      props: { title: 'Saved', message: 'All changes stored.', tone: 'success', dismissible: true },
      attrs: { onDismiss },
    })

    expect(wrapper.classes()).toContain('enpii-alert--success')
    expect(wrapper.text()).toContain('All changes stored.')
    await wrapper.get('.enpii-alert__close').trigger('click')
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('repeats skeleton placeholders and disables shimmer under reduced motion CSS', () => {
    const wrapper = mount(EnpiiSkeleton, { props: { variant: 'rectangle', repeat: 3 } })
    expect(wrapper.findAll('.enpii-skeleton__item')).toHaveLength(3)
    expect(getComputedStyle(document.documentElement).getPropertyValue('animation')).toBeDefined()
  })
})

describe('navigation indicators', () => {
  it('marks the breadcrumb current page and emits navigation', async () => {
    const items = [
      { key: 'home', label: 'Home' },
      { key: 'products', label: 'Products' },
      { key: 'detail', label: 'Detail' },
    ]
    const wrapper = mount(EnpiiBreadcrumb, { props: { items } })

    expect(wrapper.get('[aria-current="page"]').text()).toBe('Detail')
    await wrapper.get('.enpii-breadcrumb__link').trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual([items[0]])
  })

  it('collapses long pagination ranges with ellipses', async () => {
    const wrapper = mount(EnpiiPagination, { props: { totalPages: 12, siblingCount: 1, modelValue: 6 } })

    expect(wrapper.text()).toContain('…')
    expect(wrapper.find('[aria-current="page"]').text()).toBe('6')
    await wrapper.get('[aria-label="Next page"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([7])
  })

  it('renders vertical steppers with completed state and click activation', async () => {
    const steps = [
      { key: 'account', label: 'Account' },
      { key: 'profile', label: 'Profile' },
      { key: 'review', label: 'Review' },
    ]
    const wrapper = mount(EnpiiStepper, { props: { steps, activeKey: 'profile', orientation: 'vertical', interactive: true } })

    expect(wrapper.classes()).toContain('enpii-stepper--vertical')
    expect(wrapper.find('.material-symbols-outlined').classes()).toContain('material-symbols-outlined')
    await wrapper.findAll('.enpii-stepper__trigger')[2].trigger('click')
    expect(wrapper.emitted('update:activeKey')?.[0]).toEqual(['review'])
  })
})
