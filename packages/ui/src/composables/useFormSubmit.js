import { provide, reactive, readonly } from 'vue';

export const FORM_SUBMIT_KEY = Symbol('enpii-form-submit');

/**
 * Called inside a form container (or any parent) to publish submit state.
 *
 *   const { setSubmitting } = useFormSubmitProvider();
 *   async function onSubmit() {
 *     setSubmitting(true);
 *     try { await save(); } finally { setSubmitting(false); }
 *   }
 *
 * Every EnpiiButton with type="submit" under this parent locks itself
 * while submitting — preventing double-click double-submit.
 */
export function useFormSubmitProvider() {
    const state = reactive({ submitting: false, disabled: false });

    provide(FORM_SUBMIT_KEY, readonly(state));

    function setSubmitting(value) {
        state.submitting = !!value;
    }

    function setDisabled(value) {
        state.disabled = !!value;
    }

    return { setSubmitting, setDisabled };
}
