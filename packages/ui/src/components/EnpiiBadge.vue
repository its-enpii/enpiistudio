<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  pill?: boolean
}>(), {
  tone: 'neutral',
  pill: false,
})
</script>

<template>
  <span
    class="enpii-badge"
    :class="[`enpii-badge--${tone}`, { 'enpii-badge--pill': pill }]"
  >
    <slot />
  </span>
</template>

<style>
.enpii-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--enpii-badge-border);
  border-radius: var(--enpii-radius-control);
  padding: 0.375rem 0.75rem;
  color: var(--enpii-badge-text);
  background: var(--enpii-badge-surface);
  font: 600 0.875rem/1.25 var(--enpii-font-sans);
}

.enpii-badge--pill {
  border-radius: 9999px;
}

.enpii-badge--primary {
  --enpii-badge-surface: var(--enpii-color-primary-soft);
  --enpii-badge-border: var(--enpii-color-primary-border);
  --enpii-badge-text: var(--enpii-color-primary-text);
}

.enpii-badge--success {
  --enpii-badge-surface: var(--enpii-color-success-soft);
  --enpii-badge-border: var(--enpii-color-success-border);
  --enpii-badge-text: var(--enpii-color-success-text);
}

.enpii-badge--warning {
  --enpii-badge-surface: var(--enpii-color-warning-soft);
  --enpii-badge-border: var(--enpii-color-warning-border);
  --enpii-badge-text: var(--enpii-color-warning-text);
}

.enpii-badge--danger {
  --enpii-badge-surface: var(--enpii-color-danger-soft);
  --enpii-badge-border: var(--enpii-color-danger-border);
  --enpii-badge-text: var(--enpii-color-danger-text);
}

.enpii-badge--neutral {
  --enpii-badge-surface: var(--enpii-color-neutral-soft);
  --enpii-badge-border: var(--enpii-color-neutral-border);
  --enpii-badge-text: var(--enpii-color-neutral-text);
}

@media (forced-colors: active) {
  .enpii-badge {
    border-color: CanvasText;
    color: CanvasText;
    background: Canvas;
  }
}
</style>
