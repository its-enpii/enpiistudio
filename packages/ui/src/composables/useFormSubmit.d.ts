import type { InjectionKey, Readonly } from 'vue';

export interface FormSubmitState {
    submitting: boolean;
    disabled: boolean;
}

export declare const FORM_SUBMIT_KEY: InjectionKey<Readonly<FormSubmitState>>;

export function useFormSubmitProvider(): {
    setSubmitting: (value: boolean) => void;
    setDisabled: (value: boolean) => void;
};
