<script setup lang="ts">
import { EnpiiFooter, EnpiiNavbar, EnpiiSidebar } from '@its-enpii/ui'
import type { FooterColumn, NavLink, SidebarItem } from '../types'

const props = withDefaults(defineProps<{
  brand?: string
  sidebarItems?: SidebarItem[]
  sidebarCollapsed?: boolean
  activeKey?: string | number
  navbarLinks?: NavLink[]
  navbarSticky?: boolean
  navbarVariant?: 'default' | 'transparent'
  sidebarSticky?: boolean
  fluid?: boolean
  padded?: boolean
  footerBrand?: string
  footerCopyright?: string
  footerColumns?: FooterColumn[]
}>(), {
  brand: '',
  sidebarItems: () => [],
  sidebarCollapsed: false,
  activeKey: undefined,
  navbarLinks: () => [],
  navbarSticky: true,
  navbarVariant: 'default',
  sidebarSticky: true,
  fluid: false,
  padded: true,
  footerBrand: '',
  footerCopyright: '',
  footerColumns: () => [],
})

const emit = defineEmits<{
  sidebarNavigate: [item: SidebarItem]
  navbarNavigate: [item: NavLink]
  navigate: [item: SidebarItem | NavLink]
  'update:sidebarCollapsed': [collapsed: boolean]
}>()

function onSidebarNavigate(item: SidebarItem) {
  emit('sidebarNavigate', item)
  emit('navigate', item)
}

function onNavbarNavigate(item: NavLink) {
  emit('navbarNavigate', item)
  emit('navigate', item)
}
</script>

<template>
  <div class="enpii-skeleton enpii-skeleton--admin-sidebar">
    <aside
      class="enpii-skeleton__sidebar"
      :class="{ 'enpii-skeleton__sidebar--collapsed': props.sidebarCollapsed }"
    >
      <slot name="sidebar">
        <div v-if="$slots['sidebar-header']" class="enpii-skeleton__sidebar-header">
          <slot name="sidebar-header" />
        </div>
        <EnpiiSidebar
          :items="props.sidebarItems"
          :collapsed="props.sidebarCollapsed"
          :sticky="props.sidebarSticky"
          :active-key="props.activeKey"
          @navigate="onSidebarNavigate"
        />
        <div v-if="$slots['sidebar-footer']" class="enpii-skeleton__sidebar-footer">
          <slot name="sidebar-footer" />
        </div>
      </slot>
    </aside>

    <div class="enpii-skeleton__main">
      <slot name="navbar">
        <EnpiiNavbar
          :brand="props.brand"
          :links="props.navbarLinks"
          :sticky="props.navbarSticky"
          :variant="props.navbarVariant"
          @navigate="onNavbarNavigate"
        >
          <template v-if="$slots.brand" #brand>
            <slot name="brand" />
          </template>
          <template #actions>
            <slot name="navbar-actions">
              <slot name="actions" />
            </slot>
          </template>
        </EnpiiNavbar>
      </slot>

      <div v-if="$slots.header" class="enpii-skeleton__header">
        <slot name="header" />
      </div>

      <main
        class="enpii-skeleton__content"
        :class="{
          'enpii-skeleton__content--fluid': props.fluid,
          'enpii-skeleton__content--unpadded': !props.padded,
        }"
      >
        <slot />
      </main>

      <slot name="footer">
        <EnpiiFooter
          v-if="props.footerBrand || props.footerCopyright || props.footerColumns.length"
          :brand="props.footerBrand"
          :copyright="props.footerCopyright"
          :columns="props.footerColumns"
          @navigate="emit('navigate', $event)"
        />
      </slot>
    </div>
  </div>
</template>
