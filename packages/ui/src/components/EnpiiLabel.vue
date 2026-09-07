<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    for: string
    size?: 'sm' | 'md'
    tone?: 'default' | 'muted'
    required?: boolean
    hidden?: boolean
  }>(),
  {
    size: 'md',
    tone: 'default',
    required: false,
    hidden: false,
  },
)

const labelClasses = computed(() => [
  'enpii-label',
  `enpii-label--${props.size}`,
  `enpii-label--${props.tone}`,
  { 'enpii-sr-only': props.hidden },
])
</script>

<template>
  <label :for="props.for" :class="[labelClasses, $attrs.class]" v-bind="$attrs">
    <slot />
    <span v-if="props.required" class="enpii-label__required" aria-hidden="true">*</span>
  </label>
</template>
