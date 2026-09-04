export interface ConfirmOptions {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    shape?: 'primary' | 'danger' | 'warning';
}

export interface ConfirmState {
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    shape: 'primary' | 'danger' | 'warning';
    resolve: ((value: boolean) => void) | null;
}

export declare function useConfirm(): {
    confirmState: ConfirmState;
    confirm: (options?: ConfirmOptions) => Promise<boolean>;
    showAlert: (options?: ConfirmOptions) => Promise<boolean>;
    handleConfirm: () => void;
    handleCancel: () => void;
};
