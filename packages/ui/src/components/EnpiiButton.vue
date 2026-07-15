<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button
    class="enpii-button"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style>
.enpii-button {
  border: 0;
  border-radius: var(--enpii-radius-control);
  padding: var(--enpii-space-control-block) var(--enpii-space-control-inline);
  color: var(--enpii-color-on-primary);
  background: var(--enpii-color-primary);
  font: 600 1rem/1.25 var(--enpii-font-sans);
  cursor: pointer;
}

.enpii-button:hover:not(:disabled) {
  background: var(--enpii-color-primary-hover);
}

.enpii-button:focus-visible {
  outline: 3px solid var(--enpii-color-focus);
  outline-offset: 2px;
}

.enpii-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
