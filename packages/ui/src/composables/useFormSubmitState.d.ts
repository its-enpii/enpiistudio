import type { InjectionKey } from 'vue';

export interface FormSubmitState {
    submitting: boolean;
    disabled: boolean;
}

export declare const FORM_SUBMIT_KEY: InjectionKey<FormSubmitState>;

export function useFormSubmitState(): {
    isFormSubmitting: () => boolean;
    isFormDisabled: () => boolean;
};
