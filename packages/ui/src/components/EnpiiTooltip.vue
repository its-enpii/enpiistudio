<script setup>
import { ref } from 'vue';
import { useShape } from '../composables/useShape';

const props = defineProps({
    id: { type: String, default: null },
    text: { type: String, default: '' },
    position: { type: String, default: 'top' }, // 'top' | 'bottom' | 'left' | 'right'
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const isVisible = ref(false);

const positionClasses = {
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
};
</script>

<template>
    <div
        class="enpii-tooltip"
        :class="shapeClass"
        @mouseenter="isVisible = true"
        @mouseleave="isVisible = false"
        @focusin="isVisible = true"
        @focusout="isVisible = false"
    >
        <slot>
            <button
                type="button"
                tabindex="-1"
                class="enpii-tooltip__trigger"
                aria-haspopup="true"
                :aria-label="text"
            >
                ?
            </button>
        </slot>

        <div
            :id="id"
            role="tooltip"
            :class="[
                'enpii-tooltip__bubble',
                `enpii-tooltip__bubble--${position}`,
                isVisible ? 'enpii-tooltip__bubble--visible' : ''
            ]"
        >
            <slot name="content">
                {{ text }}
            </slot>
        </div>
    </div>
</template>
