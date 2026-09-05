import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Icon + text alignment conformance contract.
 *
 * Rule: any component row that renders an icon next to text MUST declare
 * vertical alignment (align-items:center) on the row container, OR center the
 * icon inside a fixed-size marker (display:grid + place-items:center).
 *
 * Enforced statically against styles/components.css so regressions cannot
 * sneak in when new components are added.
 */
describe('icon+text alignment conformance (styles/components.css)', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/components.css'), 'utf8');
    const buttonVue = readFileSync(resolve(__dirname, '../src/components/EnpiiButton.vue'), 'utf8');
    const switchVue = readFileSync(resolve(__dirname, '../src/components/EnpiiSwitch.vue'), 'utf8');
    const inputVue = readFileSync(resolve(__dirname, '../src/components/EnpiiInput.vue'), 'utf8');
    const textareaVue = readFileSync(resolve(__dirname, '../src/components/EnpiiTextarea.vue'), 'utf8');
    const currencyVue = readFileSync(resolve(__dirname, '../src/components/EnpiiCurrencyInput.vue'), 'utf8');
    const inputMaskVue = readFileSync(resolve(__dirname, '../src/components/EnpiiInputMask.vue'), 'utf8');

    // Rows that are known to host `__icon` next to a label/text.
    const iconRows = [
        '.enpii-alert',
        '.enpii-button',
        '.enpii-breadcrumb__item',
        '.enpii-command-palette__command',
        '.enpii-confirm-dialog',
        '.enpii-date-range__control',
        '.enpii-dropdown-menu__item',
        '.enpii-filter-pill__button',
        '.enpii-md-link',
        '.enpii-navbar__link',
        '.enpii-notification-dropdown__item',
        '.enpii-offline-banner',
        '.enpii-radio-group__button',
        '.enpii-segmented-control__option',
        '.enpii-switch--bare',
        '.enpii-switch__content',
        '.enpii-switch--inline',
        '.enpii-tabs__tab',
        '.enpii-toast',
        '.enpii-tree-view__node',
        '.enpii-assistant-poll-card__option',
    ];

    it.each(iconRows)('%s vertically centers its content', (selector) => {
        if (selector.startsWith('.enpii-switch')) {
            expect(switchVue).toMatch(/items-center/);
            return;
        }
        if (selector === '.enpii-button') {
            expect(buttonVue).toMatch(/items-center/);
            return;
        }
        const rule = css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{[^}]*\\}`));
        expect(rule, `rule for ${selector} must exist in components.css`).toBeTruthy();
        const body = rule![0];
        const centers = /align-items:center/.test(body) || /place-items:center/.test(body);
        expect(centers, `${selector} must set align-items:center (or place-items:center)`).toBe(true);
    });

    it('timeline item centers its marker with the first text line', () => {
        const rule = css.match(/\.enpii-timeline__item\{[^}]*\}/);
        expect(rule).toBeTruthy();
        expect(rule![0]).toMatch(/align-items:center/);
    });

    it('icon glyphs use line-height:1 where font-size is overridden', () => {
        expect(buttonVue).toMatch(/leading-none/);
        for (const cls of ['.enpii-radio-group__icon', '.enpii-filter-pill__icon']) {
            const rule = css.match(new RegExp(`${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{[^}]*\\}`));
            expect(rule, `rule for ${cls}`).toBeTruthy();
            // font-size override without line-height:1 relies on the icon font default; contract:
            expect(rule![0]).toMatch(/line-height:1|font-size:1rem/);
        }
    });
});

describe('field width contract (styles/components.css)', () => {
    const css = readFileSync(resolve(__dirname, "../src/styles/components.css"), "utf8");
    const inputVue = readFileSync(resolve(__dirname, "../src/components/EnpiiInput.vue"), "utf8");
    const textareaVue = readFileSync(resolve(__dirname, "../src/components/EnpiiTextarea.vue"), "utf8");
    const currencyVue = readFileSync(resolve(__dirname, "../src/components/EnpiiCurrencyInput.vue"), "utf8");
    const inputMaskVue = readFileSync(resolve(__dirname, "../src/components/EnpiiInputMask.vue"), "utf8");

    const fieldSelectors = [
        ".enpii-input",
        ".enpii-textarea",
        ".enpii-currency-input",
        ".enpii-smart-select",
        ".enpii-date-picker",
        ".enpii-input-mask",
        ".enpii-segmented-control",
    ];

    it.each(fieldSelectors)("%s declares width: 100%", (selector) => {
        const vueMap: Record<string, string> = { '.enpii-input': inputVue, '.enpii-textarea': textareaVue, '.enpii-currency-input': currencyVue, '.enpii-input-mask': inputMaskVue };
        if (vueMap[selector]) {
            expect(vueMap[selector], `${selector} must declare w-full in its template (Tailwind rewrite)`).toMatch(/w-full/);
            return;
        }
        const rule = css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\{[^}]*\\}`));
        expect(rule, `rule for ${selector} must exist in components.css`).toBeTruthy();
        expect(rule![0]).toMatch(/width:\s*100%/);
    });

    it(".enpii-fit-content helper sets width:fit-content and margin-inline:auto", () => {
        const rule = css.match(/\.enpii-fit-content\{[^}]*\}/);
        expect(rule, "rule for .enpii-fit-content must exist in components.css").toBeTruthy();
        expect(rule![0]).toMatch(/width:\s*fit-content/);
        expect(rule![0]).toMatch(/margin-inline:\s*auto/);
    });

    it(".enpii-segmented-control--inline sets display:inline-flex and width:max-content", () => {
        const rule = css.match(/\.enpii-segmented-control--inline\{[^}]*\}/);
        expect(rule, "rule for .enpii-segmented-control--inline must exist in components.css").toBeTruthy();
        expect(rule![0]).toMatch(/display:\s*inline-flex/);
        expect(rule![0]).toMatch(/width:\s*max-content/);
    });

    it(".enpii-segmented-control__option defaults to flex:1 1 0 and inline modifier resets to flex:0 0 auto", () => {
        const defaultOptionRule = css.match(/(?:^|\n)\.enpii-segmented-control__option\{[^}]*\}/);
        expect(defaultOptionRule).toBeTruthy();
        expect(defaultOptionRule![0]).toMatch(/flex:\s*1 1 0/);

        const inlineOptionRule = css.match(/\.enpii-segmented-control--inline\s+\.enpii-segmented-control__option\{[^}]*\}/);
        expect(inlineOptionRule).toBeTruthy();
        expect(inlineOptionRule![0]).toMatch(/flex:\s*0 0 auto/);
    });
});
