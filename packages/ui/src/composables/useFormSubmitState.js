import { inject } from 'vue';
import { FORM_SUBMIT_KEY } from './useFormSubmit';

/**
 * Consumer side (used by EnpiiButton). Returns plain getter functions
 * so the button can merge form state with its own props.
 */
export function useFormSubmitState() {
    const state = inject(FORM_SUBMIT_KEY, null);
    return {
        isFormSubmitting: () => !!state?.submitting,
        isFormDisabled: () => !!state?.disabled,
    };
}
