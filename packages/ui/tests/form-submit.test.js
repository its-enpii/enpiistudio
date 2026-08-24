import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import EnpiiButton from '../src/components/EnpiiButton.vue';
import { useFormSubmitProvider } from '../src/composables/useFormSubmit';

describe('double-submit guard', () => {
    it('locks submit buttons while form provider is submitting', async () => {
        const setSubmittingRef = { current: null };

        const Host = defineComponent({
            setup() {
                const { setSubmitting } = useFormSubmitProvider();
                setSubmittingRef.current = setSubmitting;
                return () => h('form', [h(EnpiiButton, { type: 'submit' }, { default: () => 'Save' })]);
            },
        });

        const w = mount(Host);
        const btn = () => w.find('button');
        expect(btn().attributes('disabled')).toBeUndefined();

        setSubmittingRef.current(true);
        await w.vm.$nextTick();
        expect(btn().attributes('disabled')).toBeDefined();
        expect(btn().attributes('aria-busy')).toBe('true');
        expect(btn().find('.enpii-button__spinner').exists()).toBe(true);

        setSubmittingRef.current(false);
        await w.vm.$nextTick();
        expect(btn().attributes('disabled')).toBeUndefined();
    });

    it('does NOT lock plain type=button while submitting', async () => {
        const setSubmittingRef = { current: null };
        const Host = defineComponent({
            setup() {
                const { setSubmitting } = useFormSubmitProvider();
                setSubmittingRef.current = setSubmitting;
                return () => h('div', [h(EnpiiButton, { type: 'button' }, { default: () => 'Cancel' })]);
            },
        });
        const w = mount(Host);
        setSubmittingRef.current(true);
        await w.vm.$nextTick();
        expect(w.find('button').attributes('disabled')).toBeUndefined();
    });
});
