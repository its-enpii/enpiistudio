# Golden-Master Visual Parity Harness

This harness records the current BEM implementation so the Phase 2 Tailwind v4 rewrite can be compared deterministically against concrete computed-style values.

## Commands

```bash
npm run golden:record --workspace @its-enpii/ui
npm run golden:check --workspace @its-enpii/ui
```

`golden:record` regenerates `tests/__golden__/bem-baseline.json` with `GOLDEN_RECORD=1` and commits to the current BEM source. Run it only when the BEM source or an intentional visual contract changes. `golden:check` must remain green before every Phase 2 merge.

## Coverage

The baseline contains 30 components. Each applicable state is captured in three theme modes: light, dark through `@media (prefers-color-scheme: dark)`, and dark through `[data-theme='dark']`.

Recorded states:

- `default`
- `hover`
- `active`
- `disabled`
- `focus-visible`
- `error`

The current matrix yields **264 snapshots**. Each snapshot records:

- `background-color`
- `color`
- `border-color`
- `border-width`
- `border-style`
- `box-shadow`
- `border-radius`
- `font-weight`
- `font-size`
- `min-height`
- `height`
- `width`
- `padding`
- `gap`
- `transition-property`
- `outline`

## Parity rules

`assertParity(snapshotA, snapshotB, tolerance)` compares every snapshot and property.

- Dimensions use a numeric tolerance of `0.5px`.
- Colors are normalized from `rgb` to equivalent `rgba` form and then compared exactly.
- Box shadows and outlines are parsed into components; geometry is compared numerically and colors are compared exactly.
- Transition animation/delay is forced to zero for deterministic snapshots. `transition-property` remains part of parity.
- Missing or extra snapshot IDs are failures.

The CLI prints a Markdown table with snapshot ID, property, baseline, actual, and reason, then exits with code 1 when a difference exists.

## jsdom constraints and mitigation

jsdom does not perform browser layout. Therefore `width`, `height`, and `min-height` are captured from the final CSS rule cascade, not from `getBoundingClientRect()`. They are still marked conceptually as `approx` parity properties and compared numerically within the `0.5px` tolerance. Content-driven values (`max-content`, `fit-content`, `100%`, `auto`, and `inherit`) are compared as final cascade strings and may require a real-browser spot check for overlay and responsive components.

This harness also applies two compatibility transforms before rendering:

1. `background:` shorthand is rewritten to `background-color:` because jsdom does not expose shorthand values as longhand properties.
2. `color-mix()` and Enpii CSS custom properties are resolved in the harness so computed values represent the same final colors in both BEM and Tailwind.

## Deterministic state capture

jsdom does not calculate selectors such as `:hover`, `:active`, `:checked`, `:indeterminate`, `:disabled`, or `:focus-visible` reliably from synthetic events. The harness therefore applies the relevant DOM state directly and adds a `golden-*` alias selector. The alias is generated alongside the original state selector without changing existing component CSS.

- Hover and active geometry come from the original BEM state rules.
- Active/selected checkbox and switch states use both `checked` and `indeterminate`.
- Disabled states use the native `disabled` attribute.
- Error states use the component error class from the existing BEM implementation.
- Focus-visible uses the component focus rule; outline/shadow emphasis is compared as a computed style.

## Adding a component or state

Add a case to `GOLDEN_COMPONENT_CASES` in `tests/golden-master.harness.ts`:

```ts
{
  component: 'EnpiiExample',
  states: ['default', 'hover'],
  target: '.enpii-example__control',
  props: { label: 'Example' },
}
```

Import the component, add it to `componentMap`, and list only states that are meaningful to that component. Then run `golden:record` and commit the updated JSON. Update this document's snapshot count if the matrix changes.
