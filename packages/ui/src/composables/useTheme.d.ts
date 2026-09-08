export interface EnpiiTheme {
    readonly id: string;
    readonly label: string;
}

export interface UseThemeReturn {
    readonly theme: Readonly<Ref<string>>;
    readonly themes: readonly EnpiiTheme[];
    readonly current: Readonly<ComputedRef<EnpiiTheme>>;
    setTheme(id: string): void;
}

import type { ComputedRef, Ref } from 'vue';

export declare const THEMES: readonly EnpiiTheme[];
export declare function useTheme(): UseThemeReturn;
