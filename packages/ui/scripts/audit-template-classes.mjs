import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from '@vue/compiler-sfc'
import { parseExpression } from '@babel/parser'
import { Scanner } from '@tailwindcss/oxide'

const require = createRequire(import.meta.url)
const { parseCss } = require('lightningcss')

function collectExpressionClasses(expression) {
  const source = expression.loc?.source ?? ''
  let ast
  try {
    ast = parseExpression(source, { sourceType: 'module' })
  } catch {
    return []
  }

  const classes = new Set()
  const addLiteral = value => {
    for (const token of value.split(/\s+/)) {
      if (token) classes.add(token)
    }
  }

  const visit = (node, parent, inCondition) => {
    if (!node || typeof node.type !== 'string') return

    if (node.type === 'StringLiteral') {
      const isObjectKey = parent?.type === 'ObjectProperty' && parent.key === node
      const isComparisonOperand = parent?.type === 'BinaryExpression' &&
        ['==', '===', '!=', '!=='].includes(parent.operator)
      if (!isObjectKey && !isComparisonOperand && !inCondition) addLiteral(node.value)
      return
    }

    if (node.type === 'ObjectExpression') {
      for (const property of node.properties) {
        if (property.type !== 'ObjectProperty') continue
        visit(property.key, property, false)
        visit(property.value, property, false)
      }
      return
    }

    if (node.type === 'TemplateLiteral') {
      if (node.expressions.length) {
        for (const match of (node.quasis[0]?.value.cooked ?? '').matchAll(/enpii-[a-zA-Z0-9_-]+--$/g)) {
          classes.add(match[0])
        }
      } else if (!inCondition) {
        addLiteral(node.quasis[0].value.cooked ?? node.quasis[0].value.raw)
      }
      return
    }

    if (node.type === 'ConditionalExpression') {
      visit(node.test, node, true)
      visit(node.consequent, node, inCondition)
      visit(node.alternate, node, inCondition)
      return
    }

    if (node.type === 'LogicalExpression') {
      visit(node.left, node, node.operator === '&&' ? true : inCondition)
      visit(node.right, node, inCondition)
      return
    }

    if (node.type === 'CallExpression' &&
      (node.callee.type === 'MemberExpression' && node.callee.property.name === 'includes' ||
        node.callee.type === 'Identifier' && node.callee.name === 'isItemOpen')) {
      return
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const child of value) visit(child, node, inCondition)
      } else if (value && typeof value.type === 'string') {
        visit(value, node, inCondition)
      }
    }
  }

  visit(ast, null, false)
  return [...classes]
}

function componentMarkerFor(filename) {
  const componentName = filename
    .replace(/\.vue$/, '')
    .replace(/^Enpii/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
  return new RegExp(`^enpii-${componentName}(?:$|[a-zA-Z0-9_-]*)`)
}

function componentSuffixMarkersFor(componentMarker, expression) {
  const source = expression.loc?.source ?? ''
  const prefixes = [...source.matchAll(/(['"`])(enpii-[a-zA-Z0-9_-]+--)\1/g)].map(match => match[2])
  return prefixes.map(prefix => new RegExp(`^${prefix}(?:[a-zA-Z0-9_-]+)$`))
}

function dynamicMarkerFromSource(source, marker) {
  if (!source.includes('${')) return null
  const tokens = [...source.matchAll(/enpii-[a-zA-Z0-9_-]+(?=\$\{)/g)]
    .map(match => (marker.test(`${match[0]}dynamic`) ? `${match[0]}*` : match[0]))
  return tokens.length ? tokens : null
}

function isComponentTemplateLiteralValues(expression, marker) {
  if (expression.type !== 4 && expression.type !== 20) return null
  return dynamicMarkerFromSource(expression.loc.source, marker)
}

function walkTemplate(node, filename, visit) {
  if (!node) return

  if (node.type === 1) {
    for (const attribute of node.props) {
      if (attribute.type !== 7) continue

      if (attribute.name === 'class' && attribute.value) {
        for (const token of attribute.value.content.split(/\s+/)) {
          if (token) visit(token, attribute.loc.start.line)
        }
      }

      if (attribute.name === 'bind' && attribute.arg?.content === 'class' && attribute.exp) {
        for (const token of collectExpressionClasses(attribute.exp)) {
          const isSuffixMarker = token.startsWith('enpii-') &&
            componentSuffixMarkersFor(componentMarkerFor(filename), attribute.exp)
              .some(marker => marker.test(token))
          if (isSuffixMarker) continue
          visit(token, attribute.exp.loc.start.line)
        }
      }
    }
  }

  for (const child of node.children ?? []) walkTemplate(child, filename, visit)
  for (const branch of node.branches ?? []) walkTemplate(branch, filename, visit)

  if (node.type === 11 && node.exp) {
    for (const token of collectExpressionClasses(node.exp)) visit(token, node.exp.loc.start.line)
  }
}

function selectorClassTokens(selector) {
  return [...selector.matchAll(/\.((?:\\.|[a-zA-Z0-9_-])+)/g)].map(match =>
    match[1].replace(/\\(.)/g, '$1'),
  )
}

async function loadTailwindDesignSystem() {
  const tailwindcss = await import('tailwindcss')
  return tailwindcss.__unstable__loadDesignSystem(
    readFileSync('entry.tailwind.css', 'utf8'),
    {
      base: process.cwd(),
      loadStylesheet: (id, base) => {
        const packageDirectory = resolve(base, '../../node_modules', id)
        const file = resolve(packageDirectory, 'index.css')
        return {
          path: file,
          base: dirname(file),
          content: readFileSync(file, 'utf8'),
        }
      },
    },
  )
}

function scannedCandidates() {
  const scanner = new Scanner({ sources: [{ base: 'src', pattern: '**/*', negated: false }] })
  return new Set(scanner.scanFiles(scanner.files.map(file => ({
    file,
    extension: file.split('.').pop() ?? '',
  }))))
}

function readStyleRules(style) {
  const { rules } = parseCss({ filename: 'component.css', code: Buffer.from(style.content) })
  const rulesToVisit = [...rules]
  const selectors = []

  while (rulesToVisit.length) {
    const rule = rulesToVisit.shift()
    if (rule.type === 'style') {
      selectors.push(rule.selector)
      rulesToVisit.push(...rule.rules)
    }
  }

  return selectors.flatMap(selectorClassTokens)
}

function legacyComponentCssTokens() {
  const filename = resolve('src/styles/components.css')
  try {
    const { rules } = parseCss({
      filename,
      code: Buffer.from(readFileSync(filename, 'utf8')),
    })
    return new Set(rules.flatMap(rule => rule.type === 'style' ? selectorClassTokens(rule.selector) : []))
  } catch (error) {
    if (error.code === 'ENOENT') return new Set()
    throw error
  }
}

export async function auditTemplateClasses() {
  const designSystem = await loadTailwindDesignSystem()
  const candidates = scannedCandidates()
  const componentsDirectory = resolve('src/components')
  const legacyComponentClasses = legacyComponentCssTokens()
  const violations = []

  for (const filename of readdirSync(componentsDirectory).filter(name => name.endsWith('.vue')).sort()) {
    const { descriptor, errors } = parse(readFileSync(resolve(componentsDirectory, filename), 'utf8'), { filename })
    if (errors.length) throw errors[0]

    const componentClasses = new Set([
      ...legacyComponentClasses,
      ...descriptor.styles.flatMap(readStyleRules),
    ])
    const templateClasses = new Map()
    const componentMarker = componentMarkerFor(filename)
    walkTemplate(descriptor.template.ast, filename, (token, line) => {
      if (!templateClasses.has(token)) templateClasses.set(token, line)
    })

    for (const [token, line] of [...templateClasses].sort(([, left], [, right]) => left - right)) {
      const isComponentToken = token.startsWith('enpii-')
  const isComponentMarker = isComponentToken && componentMarker.test(token)
      const isTailwindUtility = candidates.has(token) && designSystem.candidatesToCss([token])[0] !== null
      const isComponentClass = componentClasses.has(token)

      if (isComponentToken) {
        const isPureMarker = isComponentMarker && !isTailwindUtility && !isComponentClass
        if (token.endsWith('--') || token.endsWith('__') || isPureMarker) continue
        if (!isTailwindUtility && !isComponentClass) {
          violations.push({ filename, line, token, category: 'undefined' })
        }
      } else if (!isTailwindUtility) {
        violations.push({ filename, line, token, category: 'undefined' })
      }
    }
  }

  return violations
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  const violations = await auditTemplateClasses()
  for (const { filename, line, token } of violations) {
    console.error(`${filename}:${line}: unresolved template class "${token}"`)
  }
  process.exitCode = violations.length ? 1 : 0
}
