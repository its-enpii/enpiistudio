import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import preset from '../tailwind.preset.js';

const packageDir = resolve(dirname('./tests/tailwindCompat.test.js'), '..');
const tokensCss = readFileSync(resolve(packageDir, 'src/styles/tokens.css'), 'utf8');
const presetSource = readFileSync(resolve(packageDir, 'tailwind.preset.js'), 'utf8');
const actualTokens = new Set([...tokensCss.matchAll(/--enpii-[a-z0-9-]+/g)].map(match => match[0]));
const referencedTokens = [...presetSource.matchAll(/var\((--enpii-[a-z0-9-]+)\)/g)].map(match => match[1]);

describe('Tailwind preset', () => {
  it('maps values only to existing Enpii tokens', () => {
    expect(referencedTokens.length).toBeGreaterThan(0);
    for (const token of referencedTokens) expect(actualTokens).toContain(token);
  });

  it('contains no hex literals', () => {
    expect(presetSource).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(JSON.stringify(preset.theme)).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });

  it('uses string token values', () => {
    for (const color of Object.values(preset.theme.extend.colors)) expect(color).toMatch(/^var\(--enpii-/);
    for (const radius of Object.values(preset.theme.extend.borderRadius)) expect(radius).toMatch(/^var\(--enpii-/);
    for (const shadow of Object.values(preset.theme.extend.boxShadow)) expect(shadow).toMatch(/^var\(--enpii-/);
    expect(preset.theme.extend.fontFamily.sans).toBe('var(--enpii-font-sans)');
  });

  it('supports CommonJS and ESM consumers', () => {
    expect(preset.default).toBeUndefined();
    expect(preset.darkMode).toEqual(['selector', '[data-theme="dark"]']);
    expect(preset).not.toBe(preset.default);
    expect(preset.darkMode).toEqual(['selector', '[data-theme="dark"]']);
  });
});
