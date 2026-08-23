<script setup>
import { ref } from 'vue';
import { useShape } from '../composables/useShape';

const rootRef = ref(null);
const bubbleRef = ref(null);

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
const activePosition = ref(props.position);

const positionClasses = {
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
};

function showTooltip() {
    const root = rootRef.value;
    const bubble = bubbleRef.value;
    if (!root || !bubble) {
        activePosition.value = props.position;
        isVisible.value = true;
        return;
    }

    const margin = 8;
    const rootRect = root.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const offsets = {
        top: {
            top: rootRect.top - bubbleRect.height,
            bottom: rootRect.top,
            left: rootRect.left + (rootRect.width - bubbleRect.width) / 2,
            right: rootRect.left + (rootRect.width + bubbleRect.width) / 2,
        },
        bottom: {
            top: rootRect.bottom,
            bottom: rootRect.bottom + bubbleRect.height,
            left: rootRect.left + (rootRect.width - bubbleRect.width) / 2,
            right: rootRect.left + (rootRect.width + bubbleRect.width) / 2,
        },
        left: {
            top: rootRect.top + (rootRect.height - bubbleRect.height) / 2,
            bottom: rootRect.top + (rootRect.height + bubbleRect.height) / 2,
            left: rootRect.left - bubbleRect.width,
            right: rootRect.left,
        },
        right: {
            top: rootRect.top + (rootRect.height - bubbleRect.height) / 2,
            bottom: rootRect.top + (rootRect.height + bubbleRect.height) / 2,
            left: rootRect.right,
            right: rootRect.right + bubbleRect.width,
        },
    };

    const overflows = ({ top, right, bottom, left }) => (
        top < margin || right > window.innerWidth - margin || bottom > window.innerHeight - margin || left < margin
    );
    let nextPosition = props.position;
    const opposites = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

    if (overflows(offsets[nextPosition])) {
        const opposite = opposites[nextPosition];
        if (!overflows(offsets[opposite])) {
            nextPosition = opposite;
        } else {
            const verticalCandidate = offsets.bottom.bottom <= window.innerHeight - margin ? 'bottom' : 'top';
            nextPosition = overflows(offsets[verticalCandidate]) ? 'top' : verticalCandidate;
        }
    }

    activePosition.value = positionClasses[nextPosition] ? nextPosition : props.position;
    isVisible.value = true;
}

function hideTooltip() {
    isVisible.value = false;
}
</script>

<template>
    <div
        ref="rootRef"
        class="enpii-tooltip"
        :class="shapeClass"
        @mouseenter="showTooltip"
        @mouseleave="hideTooltip"
        @focusin="showTooltip"
        @focusout="hideTooltip"
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
            ref="bubbleRef"
            :id="id"
            role="tooltip"
            :class="[
                'enpii-tooltip__bubble',
                `enpii-tooltip__bubble--${activePosition}`,
                isVisible ? 'enpii-tooltip__bubble--visible' : '',
            ]"
        >
            <slot name="content">
                {{ text }}
            </slot>
        </div>
    </div>
</template>
