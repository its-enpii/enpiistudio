<script setup lang="ts">
import { EnpiiFooter, EnpiiNavbar } from '@its-enpii/ui'
import type { FooterColumn, NavLink } from '../types'

const props = withDefaults(defineProps<{
  brand?: string
  navbarLinks?: NavLink[]
  navbarSticky?: boolean
  navbarVariant?: 'default' | 'transparent'
  fluid?: boolean
  padded?: boolean
  footerBrand?: string
  footerCopyright?: string
  footerColumns?: FooterColumn[]
}>(), {
  brand: '',
  navbarLinks: () => [],
  navbarSticky: true,
  navbarVariant: 'default',
  fluid: false,
  padded: true,
  footerBrand: '',
  footerCopyright: '',
  footerColumns: () => [],
})

const emit = defineEmits<{
  navbarNavigate: [item: NavLink]
  navigate: [item: NavLink]
}>()

function onNavbarNavigate(item: NavLink) {
  emit('navbarNavigate', item)
  emit('navigate', item)
}
</script>

<template>
  <div class="enpii-skeleton enpii-skeleton--minimal">
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
</template>
