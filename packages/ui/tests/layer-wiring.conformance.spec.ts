import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const componentsDirectory = resolve(__dirname, '../src/components')
const componentFilenames = readdirSync(componentsDirectory).filter((filename) => filename.endsWith('.vue'))

const borderExceptions: Record<string, string> = {
  'EnpiiDesktopSplashScreen.vue': 'decorative splash halo/logo and progress track, not a bordered control/overlay',
  'EnpiiFooter.vue': 'hairline copyright divider, not a control/overlay/surface border',
  'EnpiiLoanHistoryTable.vue': 'semantic table with border-collapse, no structural border control',
  'EnpiiRating.vue': 'borderless rating control',
  'EnpiiSpinner.vue': 'spinner ring uses intentional size-specific border widths',
}

const borderedComponents = [
  'EnpiiAssistantArtifactCard.vue',
  'EnpiiAssistantPollCard.vue',
  'EnpiiAssistantWidget.vue',
  'EnpiiCheckbox.vue',
  'EnpiiColorPicker.vue',
  'EnpiiCsvImportExport.vue',
  'EnpiiDateRange.vue',
  'EnpiiDesktopTitleBar.vue',
  'EnpiiFileUpload.vue',
  'EnpiiImageUpload.vue',
  'EnpiiInlineEmptyState.vue',
  'EnpiiKeyboardShortcutsModal.vue',
  'EnpiiQrCode.vue',
  'EnpiiRadioGroup.vue',
  'EnpiiReportPeriodFilter.vue',
  'EnpiiRichEditor.vue',
  'EnpiiSignaturePad.vue',
  'EnpiiSwitch.vue',
  'EnpiiThemeMenu.vue',
  'EnpiiTimeline.vue',
  'EnpiiTransferList.vue',
  'EnpiiTreeView.vue',
  'EnpiiTrendBarChart.vue',
]

const structuralBorderPattern = /--(control|overlay)-border-width/
const cardBorderPattern = /--card-border-(?:width|style|color)/
const literalRadiusPattern = /rounded-\[(?:0\.25rem|0\.125rem|1rem)\]/

const primitiveShadowExceptions: Record<string, string> = {}

describe('structural layer wiring conformance', () => {
  it.each(borderedComponents)('%s consumes a structural border-width token', (filename) => {
    const source = readFileSync(resolve(componentsDirectory, filename), 'utf8')
    expect(source, `${filename} must consume --control-border-width or --overlay-border-width`).toMatch(
      structuralBorderPattern,
    )
  })

  it('always exposes the card border through structural tokens', () => {
    const source = readFileSync(resolve(componentsDirectory, 'EnpiiCard.vue'), 'utf8')

    expect(source).toContain('[border-width:var(--card-border-width)]')
    expect(source).toContain('[border-style:var(--card-border-style)]')
    expect(source).toContain('[border-color:var(--card-border-color)]')
    expect(source).toContain('[border-width:max(var(--card-border-width),1px)]')
  })

  it('defines brutal layer shape and focus values', () => {
    for (const filename of ['neobrutalism.css', 'neobrutalism-tamed.css']) {
      const source = readFileSync(resolve(__dirname, '../src/styles/layers', filename), 'utf8')

      expect(source).toContain('--card-border-width: 2px;')
      expect(source).toContain('--card-border-style: solid;')
      expect(source).toContain('--card-border-color: var(--color-ink);')
      expect(source).toContain('--focus-width: 3px;')
      expect(source).toContain('--focus-offset: 2px;')
      expect(source).toContain('--radius-sm:')
      expect(source).toContain('--radius-md:')
      expect(source).toContain('--radius-lg:')
      expect(source).toContain('--radius-xl:')
      expect(source).toContain('--radius-2xl:')
    }
  })

  it('has no literal structural radius values left in components', () => {
    for (const filename of componentFilenames) {
      const source = readFileSync(resolve(componentsDirectory, filename), 'utf8')
      expect(source, `${filename} must use a radius token`).not.toMatch(literalRadiusPattern)
    }
  })

  it('documents every intentionally unwired component', () => {
    for (const filename of Object.keys(borderExceptions)) {
      const source = readFileSync(resolve(componentsDirectory, filename), 'utf8')
      expect(
        source,
        `${filename} must not accidentally introduce a structural border-width token`,
      ).not.toMatch(structuralBorderPattern)
    }
  })

  it('uses semantic theme shadow utilities instead of primitive Tailwind sizes', () => {
    const primitiveShadowPattern = /(^|[^a-zA-Z0-9-])shadow-(?:lg|xl|md)([^a-zA-Z0-9-]|$)/

    for (const filename of Object.keys(primitiveShadowExceptions)) {
      const source = readFileSync(resolve(componentsDirectory, filename), 'utf8')
      expect(source, `${filename} must not accidentally use shadow-lg, shadow-xl, or shadow-md`).not.toMatch(
        primitiveShadowPattern,
      )
    }

    expect(componentFilenames.length).toBeGreaterThan(0)

    for (const filename of componentFilenames) {
      const source = readFileSync(resolve(componentsDirectory, filename), 'utf8')
      expect(
        source,
        `${filename} must use a semantic shadow token or a documented arbitrary shadow`,
      ).not.toMatch(primitiveShadowPattern)
    }
  })

  it('wires pressable transforms through active transform declarations', () => {
    const pressableComponents = [
      'EnpiiAssistantArtifactCard.vue',
      'EnpiiCheckbox.vue',
      'EnpiiDateRange.vue',
      'EnpiiImageUpload.vue',
      'EnpiiRichEditor.vue',
      'EnpiiSignaturePad.vue',
      'EnpiiTransferList.vue',
    ]

    for (const filename of pressableComponents) {
      const source = readFileSync(resolve(componentsDirectory, filename), 'utf8')
      expect(source, `${filename} must not use an active scale utility`).not.toMatch(/active:(?:\S+:)?scale-/)
      expect(source, `${filename} must use active:[transform:...]`).toMatch(/active:(?:\S+:)?\[transform:/)
    }

    const colorPicker = readFileSync(resolve(componentsDirectory, 'EnpiiColorPicker.vue'), 'utf8')
    expect(colorPicker).not.toMatch(/active:(?:\S+:)?scale-/)
    expect(colorPicker).toContain('active:enabled:[box-shadow:var(--shadow-control-pressed)]')
  })
})
