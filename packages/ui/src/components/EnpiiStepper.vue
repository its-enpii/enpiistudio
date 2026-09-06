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
    <ol class="enpii-stepper flex m-0 p-0 list-none" :class="[`enpii-stepper--${orientation}`, orientation === 'vertical' ? 'flex-col gap-3' : 'gap-2']">
        <li v-for="(step, index) in steps" :key="step.key" class="enpii-stepper__step flex items-center" :class="[`enpii-stepper__step--${state(index)}`, orientation !== 'vertical' && index < steps.length - 1 ? `after:content-[''] after:w-8 after:h-px after:bg-outline-variant` : '']">
            <component :is="interactive ? 'button' : 'span'" :type="interactive ? 'button' : undefined" class="enpii-stepper__trigger flex w-full items-center gap-2 border-0 bg-none text-on-surface-variant font-inherit text-base text-left cursor-default active:[transform:var(--press-transform)]" :class="interactive && 'cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus'" @click="interactive && $emit('update:activeKey', step.key)">
                <span class="enpii-stepper__marker inline-flex items-center justify-center w-8 h-8 border border-solid [border-width:var(--control-border-width)] rounded-full bg-neutral-soft text-current" :class="state(index) === 'active' ? 'bg-primary text-on-primary' : state(index) === 'completed' ? 'bg-success-text text-on-primary' : ''"><AppIcon v-if="state(index) === 'completed'" name="check" /></span>
                <span class="enpii-stepper__label overflow-hidden text-ellipsis" :class="[orientation === 'horizontal' ? 'whitespace-nowrap' : '', state(index) === 'active' ? 'text-primary-text font-semibold' : 'font-normal']">{{ step.label }}</span>
            </component>
        </li>
    </ol>
</template>
