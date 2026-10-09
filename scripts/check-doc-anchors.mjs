import { readFileSync } from 'node:fs'

const path = new URL('../src/Documentation.tsx', import.meta.url)
const source = readFileSync(path, 'utf8')
const start = source.indexOf('const headings:')
const end = source.indexOf('\nfunction Section', start)

if (start < 0 || end < 0) {
  console.error('Could not locate the documentation heading registry.')
  process.exit(1)
}

const registry = source.slice(start, end)
const expected = [...registry.matchAll(/\[['"]([a-z0-9-]+)['"]\s*,/g)].map((match) => match[1])
const declared = new Set(expected)
const missing = [...declared].filter((id) => !source.includes(`<Section id="${id}"`))
const sections = [...source.matchAll(/<Section id="([a-z0-9-]+)"/g)].map((match) => match[1])
const unlisted = [...new Set(sections.filter((id) => !declared.has(id)))]

if (missing.length || unlisted.length) {
  if (missing.length) console.error(`Heading registry IDs without a matching article section: ${missing.join(', ')}`)
  if (unlisted.length) console.error(`Article sections missing from the heading registry: ${unlisted.join(', ')}`)
  process.exit(1)
}

console.log(`Documentation anchors validated (${declared.size} unique IDs).`)
