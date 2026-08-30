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
    class="enpii-whatsapp-preview"
    :class="[
      `enpii-whatsapp-preview--${size}`,
      `enpii-whatsapp-preview--${tone}`,
      props.readOnly && 'enpii-whatsapp-preview--readonly',
    ]"
    :aria-label="t('whatsappPreview.ariaLabel')"
  >
    <header v-if="showHeader" class="enpii-whatsapp-preview__header">
      <span class="enpii-whatsapp-preview__avatar" aria-hidden="true">{{ initials }}</span>
      <span class="enpii-whatsapp-preview__contact">{{ displayName }}</span>
      <span v-if="readOnly" class="enpii-whatsapp-preview__readonly">{{ t('whatsappPreview.readOnly') }}</span>
    </header>

    <ol role="log" class="enpii-whatsapp-preview__log">
      <template v-for="(message, index) in messages" :key="message.id">
        <li
          v-if="dateLabel(message.timestamp) && (!index || dateLabel(messages[index - 1].timestamp) !== dateLabel(message.timestamp))"
          class="enpii-whatsapp-preview__divider"
        >
          <time :datetime="message.timestamp">{{ dateLabel(message.timestamp) }}</time>
        </li>
        <li class="enpii-whatsapp-preview__item" :class="`enpii-whatsapp-preview__item--${message.direction}`">
          <div class="enpii-whatsapp-preview__bubble" :class="message.status === 'failed' && 'enpii-whatsapp-preview__bubble--failed'">
            <img v-if="message.mediaUrl" class="enpii-whatsapp-preview__media" :src="message.mediaUrl" :alt="message.body">
            <p class="enpii-whatsapp-preview__body">{{ message.body }}</p>
            <span class="enpii-whatsapp-preview__meta">
              <time v-if="message.timestamp" class="enpii-whatsapp-preview__timestamp" :datetime="message.timestamp">{{ timestampLabel(message.timestamp) }}</time>
              <span v-if="message.direction === 'out' && message.status" class="enpii-whatsapp-preview__status" :class="`enpii-whatsapp-preview__status--${message.status}`">
                <AppIcon :name="statusIcon(message.status)" class="enpii-whatsapp-preview__status-icon" />
                <span class="enpii-sr-only">{{ t(`whatsappPreview.status.${message.status}`) }}</span>
              </span>
            </span>
          </div>
        </li>
      </template>
    </ol>
  </section>
</template>
