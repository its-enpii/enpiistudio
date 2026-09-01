import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  EnpiiAdminSidebarLayout,
  EnpiiBlankLayout,
  EnpiiMinimalLayout,
} from '../src'
import type { NavLink, SidebarItem } from '../src/types'

const sidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'users', label: 'Users', icon: 'people', children: [{ key: 'admins', label: 'Admins' }] },
]

const navbarLinks: NavLink[] = [
  { key: 'home', label: 'Home', href: '/', active: true },
  { key: 'about', label: 'About', href: '/about' },
]

const footerColumns = [
  { title: 'Product', links: [{ key: 'docs', label: 'Docs', href: '/docs' }] },
]

describe('EnpiiAdminSidebarLayout', () => {
  it('composes EnpiiSidebar and EnpiiNavbar with slotted content', async () => {
    const wrapper = mount(EnpiiAdminSidebarLayout, {
      props: {
        brand: 'Enpii Admin',
        sidebarItems,
        navbarLinks,
        activeKey: 'dashboard',
        footerBrand: 'Enpii Studio',
        footerCopyright: '© 2026',
        footerColumns,
      },
      slots: {
        default: '<p data-testid="content">Main Content</p>',
        'navbar-actions': '<button data-testid="action">Action</button>',
        'sidebar-header': '<div data-testid="sb-header">Workspace</div>',
        'sidebar-footer': '<div data-testid="sb-footer">v1.0.0</div>',
        header: '<h1 data-testid="page-header">Dashboard Page</h1>',
      },
    })

    expect(wrapper.find('.enpii-skeleton--admin-sidebar').exists()).toBe(true)
    expect(wrapper.find('.enpii-sidebar').exists()).toBe(true)
    expect(wrapper.find('.enpii-navbar').exists()).toBe(true)
    expect(wrapper.find('.enpii-footer').exists()).toBe(true)
    expect(wrapper.find('[data-testid="content"]').text()).toBe('Main Content')
    expect(wrapper.find('[data-testid="action"]').text()).toBe('Action')
    expect(wrapper.find('[data-testid="sb-header"]').text()).toBe('Workspace')
    expect(wrapper.find('[data-testid="sb-footer"]').text()).toBe('v1.0.0')
    expect(wrapper.find('[data-testid="page-header"]').text()).toBe('Dashboard Page')
    expect(wrapper.find('.enpii-sidebar__item--active').text()).toContain('Dashboard')
    expect(wrapper.find('.enpii-navbar__brand').text()).toContain('Enpii Admin')
    expect(wrapper.find('.enpii-footer__brand').text()).toContain('Enpii Studio')

    await wrapper.find('.enpii-navbar__link').trigger('click')
    expect(wrapper.emitted('navbarNavigate')?.[0]).toEqual([navbarLinks[0]])
    expect(wrapper.emitted('navigate')?.[0]).toEqual([navbarLinks[0]])
  })

  it('emits sidebar navigation and supports custom sidebar slot', async () => {
    const wrapper = mount(EnpiiAdminSidebarLayout, {
      props: { sidebarItems },
      slots: { default: '<p>Content</p>' },
    })

    await wrapper.findAll('.enpii-sidebar a')[0].trigger('click')
    expect(wrapper.emitted('sidebarNavigate')?.[0]).toEqual([sidebarItems[0]])
    expect(wrapper.emitted('navigate')?.[0]).toEqual([sidebarItems[0]])

    const custom = mount(EnpiiAdminSidebarLayout, {
      slots: {
        sidebar: '<nav data-testid="custom-sidebar">Custom Sidebar</nav>',
        navbar: '<header data-testid="custom-navbar">Custom Navbar</header>',
        footer: '<footer data-testid="custom-footer">Custom Footer</footer>',
        default: '<p>Content</p>',
      },
    })

    expect(custom.find('[data-testid="custom-sidebar"]').exists()).toBe(true)
    expect(custom.find('.enpii-sidebar').exists()).toBe(false)
    expect(custom.find('[data-testid="custom-navbar"]').exists()).toBe(true)
    expect(custom.find('.enpii-navbar').exists()).toBe(false)
    expect(custom.find('[data-testid="custom-footer"]').exists()).toBe(true)
    expect(custom.find('.enpii-footer').exists()).toBe(false)
  })

  it('applies fluid and unpadded modifier classes', () => {
    const wrapper = mount(EnpiiAdminSidebarLayout, {
      props: { fluid: true, padded: false },
      slots: { default: '<p>Content</p>' },
    })

    expect(wrapper.find('.enpii-skeleton__content--fluid').exists()).toBe(true)
    expect(wrapper.find('.enpii-skeleton__content--unpadded').exists()).toBe(true)
  })
})

describe('EnpiiMinimalLayout', () => {
  it('renders navbar only with content slot and forwards navigation', async () => {
    const wrapper = mount(EnpiiMinimalLayout, {
      props: {
        brand: 'Enpii Minimal',
        navbarLinks,
        footerBrand: 'Enpii',
        footerColumns,
      },
      slots: {
        default: '<p data-testid="content">Content</p>',
        header: '<div data-testid="header">Hero</div>',
        actions: '<button data-testid="action">Action</button>',
      },
    })

    expect(wrapper.find('.enpii-skeleton--minimal').exists()).toBe(true)
    expect(wrapper.find('.enpii-navbar').exists()).toBe(true)
    expect(wrapper.find('.enpii-footer').exists()).toBe(true)
    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="header"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="action"]').exists()).toBe(true)
    expect(wrapper.find('.enpii-sidebar').exists()).toBe(false)

    await wrapper.find('.enpii-navbar__link').trigger('click')
    expect(wrapper.emitted('navbarNavigate')?.[0]).toEqual([navbarLinks[0]])
    expect(wrapper.emitted('navigate')?.[0]).toEqual([navbarLinks[0]])
  })

  it('supports custom navbar and footer slots', () => {
    const wrapper = mount(EnpiiMinimalLayout, {
      slots: {
        navbar: '<header data-testid="custom-nav">Custom Nav</header>',
        footer: '<footer data-testid="custom-foot">Custom Foot</footer>',
        default: '<p>Content</p>',
      },
    })

    expect(wrapper.find('[data-testid="custom-nav"]').exists()).toBe(true)
    expect(wrapper.find('.enpii-navbar').exists()).toBe(false)
    expect(wrapper.find('[data-testid="custom-foot"]').exists()).toBe(true)
    expect(wrapper.find('.enpii-footer').exists()).toBe(false)
  })
})

describe('EnpiiBlankLayout', () => {
  it('renders full-bleed content only without navbar or sidebar', () => {
    const wrapper = mount(EnpiiBlankLayout, {
      slots: { default: '<div data-testid="content">Full Bleed</div>' },
    })

    expect(wrapper.find('.enpii-skeleton--blank').exists()).toBe(true)
    expect(wrapper.find('.enpii-navbar').exists()).toBe(false)
    expect(wrapper.find('.enpii-sidebar').exists()).toBe(false)
    expect(wrapper.find('[data-testid="content"]').text()).toBe('Full Bleed')
  })

  it('supports centered mode and auxiliary slots', () => {
    const wrapper = mount(EnpiiBlankLayout, {
      props: { centered: true },
      slots: {
        background: '<div data-testid="bg">Background</div>',
        header: '<header data-testid="top">Top</header>',
        footer: '<footer data-testid="bot">Bottom</footer>',
        default: '<form data-testid="form">Login</form>',
      },
    })

    expect(wrapper.find('.enpii-skeleton--centered').exists()).toBe(true)
    expect(wrapper.find('[data-testid="bg"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="top"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="bot"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="form"]').exists()).toBe(true)
  })
})

describe('Skeleton CSS token conformance', () => {
  it('does not introduce color literals in skeleton.css', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/skeleton.css'), 'utf8')
    const colorProperties = [...css.matchAll(/(?:background(?:-color)?|color|border(?:-color)?|box-shadow|fill|stroke)\s*:\s*([^;]+);/g)]
    expect(colorProperties.length).toBeGreaterThan(0)
    for (const [, value] of colorProperties) {
      expect(value.trim()).toMatch(/^(?:var\(--enpii-[^)]+\)|transparent|inherit|none)$/)
    }
  })

  it('contains no hex or rgb literals in skeleton.css', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/skeleton.css'), 'utf8')
    const literalMatches = css.match(/#(?:[0-9a-fA-F]{3,8})\b|rgba?\(/g)
    expect(literalMatches).toBeNull()
  })

  it('keeps font weights within the global limit (<= 600)', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/skeleton.css'), 'utf8')
    const weights = [...css.matchAll(/font-weight\s*:\s*([0-9]+)/g)].map(match => Number(match[1]))
    expect(weights.every(weight => weight <= 600)).toBe(true)
  })
})

describe('brand.css template conformance', () => {
  it('has zero active CSS rules and provides token override comments', () => {
    const brandCss = readFileSync(resolve(process.cwd(), 'brand.css'), 'utf8')
    // Remove all comments
    const stripped = brandCss.replace(/\/\*[\s\S]*?\*\//g, '').trim()
    expect(stripped).toBe('')

    // Contains guidance for primary, radius, font, and spacing
    expect(brandCss).toContain('--enpii-color-primary')
    expect(brandCss).toContain('--enpii-radius-')
    expect(brandCss).toContain('--enpii-font-sans')
    expect(brandCss).toContain('--enpii-space-')
  })
})
