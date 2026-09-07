import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Icon + text alignment conformance contract.
 *
 * Rule: any component row that renders an icon next to text MUST declare
 * vertical alignment with `items-center` on that row's own template.
 */
describe('icon+text alignment conformance', () => {
    const component = (name: string) => readFileSync(resolve(__dirname, `../src/components/${name}.vue`), 'utf8');
    const files: Record<string, string> = {
        '.enpii-alert': component('EnpiiAlert'),
        '.enpii-button': component('EnpiiButton'),
        '.enpii-breadcrumb__item': component('EnpiiBreadcrumb'),
        '.enpii-command-palette__command': component('EnpiiCommandPalette'),
        '.enpii-confirm-dialog': component('EnpiiConfirmDialog'),
        '.enpii-date-range__control': component('EnpiiDateRange'),
        '.enpii-dropdown-menu__item': component('EnpiiDropdownMenu'),
        '.enpii-filter-pill__button': component('EnpiiFilterPill'),
        '.enpii-md-link': readFileSync(resolve(__dirname, '../entry.tailwind.css'), 'utf8') +
            readFileSync(resolve(__dirname, '../src/composables/useMarkdown.js'), 'utf8'),
        '.enpii-navbar__link': component('EnpiiNavbar'),
        '.enpii-notification-dropdown__item': component('EnpiiNotificationDropdown'),
        '.enpii-offline-banner': component('EnpiiOfflineBanner'),
        '.enpii-radio-group__button': component('EnpiiRadioGroup'),
        '.enpii-segmented-control__option': component('EnpiiSegmentedControl'),
        '.enpii-switch--bare': component('EnpiiSwitch'),
        '.enpii-switch__content': component('EnpiiSwitch'),
        '.enpii-switch--inline': component('EnpiiSwitch'),
        '.enpii-tabs__tab': component('EnpiiTabs'),
        '.enpii-toast': component('EnpiiToast'),
        '.enpii-tree-view__node': component('EnpiiTreeView'),
        '.enpii-assistant-poll-card__option': component('EnpiiAssistantPollCard'),
    };

    it.each(Object.keys(files))('%s vertically centers its content', (selector) => {
        const marker = selector.slice(1);
        if (marker === 'enpii-md-link') {
            expect(files[selector]).toMatch(/@utility enpii-md-link \{[^}]*align-items: center/s);
            return;
        }
        expect(files[selector], `${selector} must carry items-center in its source`).toMatch(
            new RegExp(`${marker}[^>]*items-center|items-center[^>]*${marker}`, 's'),
        );
    });

    it('timeline item centers its marker with the first text line', () => {
        const source = component('EnpiiTimeline');
        expect(source).toMatch(/enpii-timeline__item[^>]*items-center|items-center[^>]*enpii-timeline__item/s);
    });

    it('icon glyphs use line-height:1 where font-size is overridden', () => {
        expect(component('EnpiiButton')).toMatch(/leading-none/);
        expect(component('EnpiiFilterPill')).toMatch(/leading-none/);
        expect(component('EnpiiRadioGroup')).toMatch(/leading-none/);
    });
});

describe('field width contract', () => {
    const component = (name: string) => readFileSync(resolve(__dirname, `../src/components/${name}.vue`), 'utf8');
    it.each([
        ['EnpiiInput', 'w-full'],
        ['EnpiiTextarea', 'w-full'],
        ['EnpiiCurrencyInput', 'w-full'],
        ['EnpiiSmartSelect', 'w-full'],
        ['EnpiiDatePicker', 'w-full'],
        ['EnpiiInputMask', 'w-full'],
        ['EnpiiSegmentedControl', 'w-full'],
    ])('%s declares width: 100%', (name, utility) => {
        expect(component(name)).toContain(utility);
    });

    it('.enpii-segmented-control--inline sets display:inline-flex and width:max-content', () => {
        const source = component('EnpiiSegmentedControl');
        expect(source).toMatch(/inline-flex/);
        expect(source).toMatch(/w-max/);
    });

    it('.enpii-segmented-control__option defaults to flex:1 1 0 and inline modifier resets to flex:0 0 auto', () => {
        const source = component('EnpiiSegmentedControl');
        expect(source).toMatch(/flex-1/);
        expect(source).toMatch(/flex-none/);
    });
});
