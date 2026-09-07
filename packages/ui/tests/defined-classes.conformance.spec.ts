import { describe, expect, it } from 'vitest'
import { auditTemplateClasses } from '../scripts/audit-template-classes.mjs'

describe('consumer class definition conformance', () => {
  it('defines every class token used by component templates', async () => {
    expect(await auditTemplateClasses()).toEqual([])
  })
})
