import { computed } from 'vue';

export function useShape(props: { shape?: string }) {
    return computed(() => `enpii-shape--${props.shape || 'rounded'}`);
}
