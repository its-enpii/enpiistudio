<script setup>
import { computed } from 'vue';
import AppIcon from './EnpiiIcon.vue';

const props = defineProps({
    steps: { type: Array, required: true },
    activeKey: { type: [String, Number], required: true },
    orientation: {
        type: String,
        default: 'horizontal',
        validator: (value) => ['horizontal', 'vertical'].includes(value),
    },
    interactive: { type: Boolean, default: false },
});

defineEmits(['update:activeKey']);

const completedIndex = computed(() => props.steps.findIndex((step) => step.key === props.activeKey));

function state(index) {
    if (index < completedIndex.value) return 'completed';
    if (index === completedIndex.value) return 'active';
    return 'upcoming';
}
</script>

<template>
    <ol class="enpii-stepper" :class="`enpii-stepper--${orientation}`">
        <li v-for="(step, index) in steps" :key="step.key" class="enpii-stepper__step" :class="`enpii-stepper__step--${state(index)}`">
            <component :is="interactive ? 'button' : 'span'" :type="interactive ? 'button' : undefined" class="enpii-stepper__trigger" @click="interactive && $emit('update:activeKey', step.key)">
                <span class="enpii-stepper__marker"><AppIcon v-if="state(index) === 'completed'" name="check" /></span>
                <span class="enpii-stepper__label">{{ step.label }}</span>
            </component>
        </li>
    </ol>
</template>
