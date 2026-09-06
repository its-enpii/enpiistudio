import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const componentsDirectory = resolve(__dirname, '../src/components')

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

describe('structural layer wiring conformance', () => {
  it.each(borderedComponents)('%s consumes a structural border-width token', (filename) => {
    const source = readFileSync(resolve(componentsDirectory, filename), 'utf8')
    expect(source, `${filename} must consume --control-border-width or --overlay-border-width`).toMatch(
      structuralBorderPattern,
    )
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
