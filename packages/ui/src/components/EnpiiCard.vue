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
        class="enpii-card rounded-control [background-color:var(--card-bg)] shadow-card [color:var(--card-fg)] font-sans leading-normal transition-[box-shadow,transform,border-color] duration-fast ease-emphasized [border-width:var(--card-border-width)] [border-style:var(--card-border-style)] [border-color:var(--overlay-border-color)] hover:shadow-control active:[box-shadow:var(--shadow-control-pressed)] active:[transform:var(--press-transform)] [&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:m-0 [&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:font-semibold [&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:leading-[1.25] [&_p]:m-0 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_h5]:text-sm [&_h6]:text-sm"
        :class="[
            padded ? 'p-6' : 'enpii-card--unpadded',
            { 'enpii-card--bordered border border-solid [border-width:max(var(--card-border-width),1px)] [border-color:var(--overlay-border-color)]': bordered },
            shapeClass,
        ]"
    >
        <header v-if="$slots.header" class="enpii-card__header flex items-center justify-between gap-4 mb-6">
            <slot name="header" />
        </header>
        <slot />
    </section>
</template>
