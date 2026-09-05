import { mkdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
import {
  areColorsEqual,
  areShadowsEqual,
  assertParity,
  captureGoldenStyles,
  goldenComponentTable,
  readBaseline,
} from "./golden-master.harness"

const goldenDirectory = resolve(__dirname, "__golden__")
const baselinePath = resolve(goldenDirectory, "bem-baseline.json")

describe("golden-master harness", () => {
  it("covers the 30-component BEM rewrite scope", () => {
    const table = goldenComponentTable()
    expect(table).toHaveLength(30)
    expect([...new Set(table.map(row => row.component))]).toHaveLength(30)
  })

  it("compares colors exactly after rgb/rgba normalization", () => {
    expect(areColorsEqual("rgb(1, 2, 3)", "rgba(1, 2, 3, 1)")).toBe(true)
    expect(areColorsEqual("rgb(1, 2, 3)", "rgba(1, 2, 3, .999)")).toBe(false)
  })

  it("parses box-shadow components instead of comparing raw strings", () => {
    expect(areShadowsEqual(
      "0px 1px 2px rgba(0, 0, 0, 0.5), inset 0px 0px 0px rgb(255, 255, 255)",
      "0px 1px 2px rgba(0, 0, 0, .5), inset 0px 0px 0px rgba(255, 255, 255, 1)",
    )).toBe(true)
    expect(areShadowsEqual("0px 1px 2px red", "0px 2px 2px red")).toBe(false)
  })
})

describe("golden-master baseline", () => {
  beforeAll(() => {
    document.documentElement.removeAttribute("data-theme")
  })

  const goldenMode = process.env.GOLDEN ?? "bem"
  if (goldenMode !== "bem") {
    it("rejects unsupported golden mode", () => {
      expect(`Unsupported GOLDEN mode: ${goldenMode}`).toBe("bem")
    })
  }

  if (goldenMode === "bem" && process.env.GOLDEN_RECORD === "1") {
    it("records the current BEM baseline", { timeout: 120000 }, () => {
      const snapshots = captureGoldenStyles()
      mkdirSync(goldenDirectory, { recursive: true })
      writeFileSync(baselinePath, `${JSON.stringify(snapshots, null, 2)}\n`)
      expect(Object.keys(snapshots).length).toBeGreaterThan(0)
    })
  } else if (goldenMode === "bem") {
    it("matches the committed BEM baseline", { timeout: 120000 }, () => {
      const baseline = readBaseline()
      const current = captureGoldenStyles()
      assertParity(baseline, current, 0.5)
    })
  }
})
