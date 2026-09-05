<script setup>
import { ref } from 'vue';
import { useShape } from '../composables/useShape';

const props = defineProps({
    padded: { type: Boolean, default: true },
    bordered: { type: Boolean, default: false },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const root = ref(null);
const shapeClass = useShape(props);
defineExpose({ root });
</script>

<template>
    <section
        ref="root"
        class="enpii-card rounded-control bg-surface-container-lowest shadow-card text-on-surface font-sans leading-normal transition-[box-shadow,transform,border-color] duration-fast ease-emphasized hover:shadow-control hover:-translate-y-px [&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:m-0 [&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:font-semibold [&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:leading-[1.25] [&_p]:m-0 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_h5]:text-sm [&_h6]:text-sm"
        :class="[
            padded ? 'p-6' : 'enpii-card--unpadded',
            { 'enpii-card--bordered border border-solid border-outline-variant': bordered },
            shapeClass,
        ]"
    >
        <header v-if="$slots.header" class="enpii-card__header flex items-center justify-between gap-4 mb-6">
            <slot name="header" />
        </header>
        <slot />
    </section>
</template>
