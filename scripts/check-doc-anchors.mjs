import { readFileSync } from 'node:fs'

const path = new URL('../src/Documentation.tsx', import.meta.url)
const source = readFileSync(path, 'utf8')

const fail = (messages) => {
  for (const message of messages) console.error(message)
  process.exit(1)
}

// 1. Every id in the `headings` registry must have a <Section id> and vice versa.
const start = source.indexOf('const headings:')
const end = source.indexOf('\nfunction Section', start)
if (start < 0 || end < 0) fail(['Could not locate the documentation heading registry.'])
const registry = source.slice(start, end)

const expected = [...registry.matchAll(/\[['"]([a-z0-9-]+)['"]\s*,/g)].map((match) => match[1])
const declared = new Set(expected)
const missing = [...declared].filter((id) => !source.includes(`<Section id="${id}"`))
const sections = [...source.matchAll(/<Section id="([a-z0-9-]+)"/g)].map((match) => match[1])
const unlisted = [...new Set(sections.filter((id) => !declared.has(id)))]

// 2. The three lists of article slugs must agree: the `sections` array (routes), the `headings`
//    registry (the "On this page" sidebar, which indexes it by slug) and renderArticle() (the body).
const sectionsStart = source.indexOf('const sections')
const sectionsEnd = source.indexOf('const headings')
const renderStart = source.indexOf('const articles: Record<string, () => ReactNode>')
const renderEnd = source.indexOf('return articles[slug]', renderStart)
if (sectionsStart < 0 || sectionsEnd < 0 || renderStart < 0 || renderEnd < 0) {
  fail(['Could not locate the article list or the renderArticle() registry in src/Documentation.tsx.'])
}

const slugs = [...source.slice(sectionsStart, sectionsEnd).matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((match) => match[1])
const registryKeys = new Set(
  [...registry.matchAll(/^\s{2}(?:'([a-z0-9-]+)'|"([a-z0-9-]+)"|([A-Za-z0-9_-]+)):/gm)].map((match) => match[1] ?? match[2] ?? match[3]),
)
const rendered = new Set(
  [...source.slice(renderStart, renderEnd).matchAll(/(?:\{|,)\s*(?:'([a-z0-9-]+)'|([A-Za-z0-9_]+))\s*:/g)].map((match) => match[1] ?? match[2]),
)

const slugSet = new Set(slugs)
const withoutRegistry = slugs.filter((slug) => !registryKeys.has(slug))
const orphanRegistry = [...registryKeys].filter((key) => !slugSet.has(key))
const withoutBody = slugs.filter((slug) => !rendered.has(slug))

const errors = []
if (missing.length) errors.push(`Heading registry IDs without a matching article section: ${missing.join(', ')}`)
if (unlisted.length) errors.push(`Article sections missing from the heading registry: ${unlisted.join(', ')}`)
if (withoutRegistry.length) errors.push(`Articles without a headings registry entry (the "On this page" sidebar would crash): ${withoutRegistry.join(', ')}`)
if (orphanRegistry.length) errors.push(`Heading registry entries without an article: ${orphanRegistry.join(', ')}`)
if (withoutBody.length) errors.push(`Articles without a body in renderArticle(): ${withoutBody.join(', ')}`)
if (errors.length) fail(errors)

if (slugs.length === 0 || registryKeys.size === 0) fail(['No articles found — the source layout changed; update scripts/check-doc-anchors.mjs.'])

console.log(`Documentation anchors validated (${declared.size} unique IDs, ${slugSet.size} articles).`)
