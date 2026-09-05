import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire('/usr/local/lib/hermes-agent/node_modules/')
const { chromium } = require('playwright')
const executablePath = '/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.join(packageRoot, '..', 'dist')
const mimeTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
}

const server = createServer(async (request, response) => {
  try {
    const file = path.join(distRoot, request.url ?? '/')
    response.setHeader('content-type', mimeTypes[path.extname(file)] ?? 'text/plain')
    response.end(await readFile(file))
  } catch {
    response.statusCode = 404
    response.end('Not found')
  }
})

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const address = server.address()
if (typeof address !== 'object' || address === null) throw new Error('Smoke server failed to start')
await mkdir(distRoot, { recursive: true })
await writeFile(path.join(distRoot, 'tailwind-smoke.html'), [
  '<!doctype html>',
  '<html lang="en"><head><meta charset="utf-8"><title>Tailwind smoke</title>',
  '<link rel="stylesheet" href="./tailwind.css"></head>',
  '<body><button id="target" class="bg-primary text-on-primary rounded-control px-control">Sky button</button></body></html>',
].join(''), 'utf8')

const browser = await chromium.launch({ executablePath })
const page = await browser.newPage()
await page.goto(`http://127.0.0.1:${address.port}/tailwind-smoke.html`)
const backgroundColor = await page.locator('#target').evaluate(element => getComputedStyle(element).backgroundColor)
const borderRadius = await page.locator('#target').evaluate(element => getComputedStyle(element).borderRadius)
const controlHeight = await page.locator('#target').evaluate(element => getComputedStyle(element).getPropertyValue('--enpii-control-height').trim())
await browser.close()
server.close()

if (backgroundColor !== 'rgb(135, 206, 235)') {
  throw new Error(`Expected sky primary background, received ${backgroundColor}`)
}
if (borderRadius !== '9px') {
  throw new Error(`Expected 9px control radius, received ${borderRadius}`)
}
if (controlHeight !== '3rem') {
  throw new Error(`Expected 3rem control height token, received ${controlHeight}`)
}

console.log(`smoke: bg-primary=${backgroundColor}; radius=${borderRadius}; height=${controlHeight}`)
