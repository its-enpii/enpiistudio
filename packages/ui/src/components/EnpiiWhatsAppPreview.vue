<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './EnpiiIcon.vue'
import { useT } from '../composables/useT'

export type EnpiiWhatsAppDirection = 'in' | 'out'
export type EnpiiWhatsAppStatus = 'sent' | 'delivered' | 'read' | 'failed'
export type EnpiiWhatsAppPreviewSize = 'sm' | 'default' | 'lg'

export interface EnpiiWhatsAppPreviewMessage {
  id: string | number
  direction: EnpiiWhatsAppDirection
  body: string
  timestamp?: string
  status?: EnpiiWhatsAppStatus
  mediaUrl?: string
}

const props = withDefaults(defineProps<{
  messages: EnpiiWhatsAppPreviewMessage[]
  showHeader?: boolean
  contactName?: string
  readOnly?: boolean
  size?: EnpiiWhatsAppPreviewSize
  tone?: 'default' | 'quiet'
}>(), {
  showHeader: true,
  contactName: '',
  readOnly: false,
  size: 'default',
  tone: 'default',
})

const t = useT()

const displayName = computed(() => props.contactName.trim() || t('whatsappPreview.contactFallback'))
const initials = computed(() => displayName.value
  .split(/\s+/)
  .slice(0, 2)
  .map((word) => word.charAt(0).toUpperCase())
  .join(''))

function statusIcon(status: EnpiiWhatsAppStatus) {
  if (status === 'sent') return 'check'
  if (status === 'failed') return 'error'
  return 'done_all'
}

function timestampLabel(timestamp?: string) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date)
}

function dateLabel(timestamp?: string) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function messageLabel(message: EnpiiWhatsAppPreviewMessage) {
  const sender = message.direction === 'in' ? t('whatsappPreview.incoming') : t('whatsappPreview.outgoing')
  const status = message.status ? ` ${t(`whatsappPreview.status.${message.status}`)}` : ''
  const timestamp = message.timestamp ? ` ${timestampLabel(message.timestamp)}` : ''
  return `${sender}: ${message.body}${timestamp}${status}`
}
</script>

<template>
  <section
    class="enpii-whatsapp-preview max-w-144 p-4 bg-surface border border-solid [border-width:var(--control-border-width)] border-outline-variant rounded-card text-on-surface text-base forced-colors:border-canvas-text max-sm:p-3"
    :class="[
      `enpii-whatsapp-preview--${size}`,
      `enpii-whatsapp-preview--${tone}`,
      props.readOnly && 'enpii-whatsapp-preview--readonly',
    ]"
    :aria-label="t('whatsappPreview.ariaLabel')"
  >
    <header v-if="showHeader" class="enpii-whatsapp-preview__header flex items-center gap-3 min-h-12 mb-4 py-1 px-2 pb-3 border-b border-solid border-outline-variant">
      <span class="enpii-whatsapp-preview__avatar grid place-items-center w-10 h-10 shrink-0 rounded-full bg-primary-container text-on-primary-container text-sm font-medium max-xs:w-9 max-xs:h-9" aria-hidden="true">{{ initials }}</span>
      <span class="enpii-whatsapp-preview__contact min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium">{{ displayName }}</span>
      <span v-if="readOnly" class="enpii-whatsapp-preview__readonly ml-auto text-on-surface-variant text-xs font-normal">{{ t('whatsappPreview.readOnly') }}</span>
    </header>

    <ol role="log" class="enpii-whatsapp-preview__log flex flex-col gap-1 m-0 p-0 list-none">
      <template v-for="(message, index) in messages" :key="message.id">
        <li
          v-if="dateLabel(message.timestamp) && (!index || dateLabel(messages[index - 1].timestamp) !== dateLabel(message.timestamp))"
          class="enpii-whatsapp-preview__divider self-center my-2 text-on-surface-variant text-xs font-normal"
        >
          <time :datetime="message.timestamp">{{ dateLabel(message.timestamp) }}</time>
        </li>
        <li class="enpii-whatsapp-preview__item flex" :class="[message.direction === 'out' ? 'justify-end' : 'justify-start', `enpii-whatsapp-preview__item--${message.direction}`]">
          <div class="enpii-whatsapp-preview__bubble relative flex flex-col max-w-4/5 max-w-96 p-3 bg-surface-container-low border border-solid border-outline-variant rounded-2xl text-on-surface max-sm:max-w-[88%] max-xs:py-2.5 max-xs:px-3" :class="[message.status === 'failed' ? 'enpii-whatsapp-preview__bubble--failed bg-danger-soft border-danger-border text-danger-text' : message.direction === 'out' ? 'bg-primary-container border-transparent text-on-primary-container' : '']">
            <img v-if="message.mediaUrl" class="enpii-whatsapp-preview__media block w-full max-h-72 mb-2 object-cover rounded-xl" :src="message.mediaUrl" :alt="message.body">
            <p class="enpii-whatsapp-preview__body m-0 font-normal leading-[1.45] [overflow-wrap:anywhere]">{{ message.body }}</p>
            <span class="enpii-whatsapp-preview__meta inline-flex items-center gap-1 self-end mt-1 text-[0.6875rem] font-normal tabular-nums text-current opacity-68">
              <time v-if="message.timestamp" class="enpii-whatsapp-preview__timestamp" :datetime="message.timestamp">{{ timestampLabel(message.timestamp) }}</time>
              <span v-if="message.direction === 'out' && message.status" class="enpii-whatsapp-preview__status inline-flex" :class="[`enpii-whatsapp-preview__status--${message.status}`, ['read', 'delivered'].includes(message.status) ? 'text-success-text' : message.status === 'failed' ? 'text-danger-text' : '']">
                <AppIcon :name="statusIcon(message.status)" class="enpii-whatsapp-preview__status-icon text-base leading-none" />
                <span class="enpii-sr-only">{{ t(`whatsappPreview.status.${message.status}`) }}</span>
              </span>
            </span>
          </div>
        </li>
      </template>
    </ol>
  </section>
</template>
