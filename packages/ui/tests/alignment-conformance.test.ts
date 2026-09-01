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
        for (const cls of ['.enpii-button__icon', '.enpii-radio-group__icon', '.enpii-filter-pill__icon']) {
            const rule = css.match(new RegExp(`${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{[^}]*\\}`));
            expect(rule, `rule for ${cls}`).toBeTruthy();
            // font-size override without line-height:1 relies on the icon font default; contract:
            expect(rule![0]).toMatch(/line-height:1|font-size:1rem/);
        }
    });
});
