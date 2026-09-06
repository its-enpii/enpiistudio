import { computed } from 'vue';

export function useShape(props: { shape?: string }) {
    const shape = props.shape || 'rounded';
    const utility = computed(() => {
        if (props.shape === 'pill') return 'rounded-full';
        if (props.shape === 'sharp') return 'rounded-none';
        return 'rounded-control';
    });
    return computed(() => `enpii-shape--${shape} ${utility.value}`);
}
