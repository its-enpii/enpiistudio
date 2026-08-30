<script setup>
import { computed, useId } from 'vue'
import AppIcon from './EnpiiIcon.vue'
import { useShape } from '../composables/useShape'
import { useT } from '../composables/useT'

const t = useT()

const model = defineModel({ type: String, default: '' })
const props = defineProps({
    id: { type: String, default: null },
    label: { type: String, required: true },
    icon: { type: String, default: 'schedule' },
    error: { type: String, default: null },
    hint: { type: String, default: null },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    step: { type: Number, default: 15 },
    format: {
        type: String,
        default: '24h',
        validator: (value) => ['12h', '24h'].includes(value),
    },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
})

const emit = defineEmits(['change'])
const shapeClass = useShape(props)
const inputId = props.id || useId()
const describedBy = computed(() => {
    if (props.error) return `${inputId}-error`
    return props.hint ? `${inputId}-hint` : undefined
})

function commit(value) {
    model.value = value
    emit('change', value)
}

const options = computed(() => {
    const result = []
    const totalMinutes = Math.max(5, Math.round(24 * 60 / props.step)) * props.step
    for (let minutes = 0; minutes <= totalMinutes; minutes += props.step) {
        const hour = Math.floor(minutes / 60)
        if (hour > 23) break
        const minute = minutes % 60
        const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        const formatter = new Intl.DateTimeFormat('id-ID', { hour: props.format === '12h' ? 'numeric' : '2-digit', minute: '2-digit', hour12: props.format === '12h' })
        result.push({ value, label: formatter.format(new Date(2000, 0, 1, hour, minute)) })
    }
    return result
})
</script>

<template>
    <div class="enpii-time-picker" :class="[shapeClass, { 'enpii-time-picker--error': Boolean(error) }]">
        <label :for="inputId" class="enpii-time-picker__label">{{ label }}</label>
        <div class="enpii-time-picker__control-wrap">
            <AppIcon v-if="icon" :name="icon" class="enpii-time-picker__icon" />
            <input
                :id="inputId"
                type="time"
                :value="model"
                :step="step * 60"
                :required="required"
                :disabled="disabled"
                :aria-invalid="Boolean(error)"
                :aria-describedby="describedBy"
                class="enpii-time-picker__control"
                @input="commit($event.target.value)"
            >
            <button v-if="clearable && model && !disabled" type="button" class="enpii-time-picker__clear" :aria-label="t('timePicker.clearTime')" @click="commit('')">
                <AppIcon name="close" />
            </button>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-time-picker__help enpii-time-picker__help--error">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="enpii-time-picker__help">{{ hint }} {{ format === '12h' ? '• format 12 jam' : '' }}</p>
    </div>
</template>
