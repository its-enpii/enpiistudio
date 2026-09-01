<script setup lang="ts">
const props = withDefaults(defineProps<{
  centered?: boolean
  fluid?: boolean
  padded?: boolean
}>(), {
  centered: false,
  fluid: true,
  padded: false,
})
</script>

<template>
  <div
    class="enpii-skeleton enpii-skeleton--blank"
    :class="{ 'enpii-skeleton--centered': props.centered }"
  >
    <div v-if="$slots.background" class="enpii-skeleton__background">
      <slot name="background" />
    </div>

    <header v-if="$slots.header" class="enpii-skeleton__header">
      <slot name="header" />
    </header>

    <main
      class="enpii-skeleton__content"
      :class="{
        'enpii-skeleton__content--fluid': props.fluid,
        'enpii-skeleton__content--unpadded': !props.padded,
      }"
    >
      <slot />
    </main>

    <footer v-if="$slots.footer" class="enpii-skeleton__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
