import axe from 'axe-core'
import { expect, test } from '@playwright/test'

const NOT_FOUND = "That page doesn’t exist"

const ROUTES = [
  '/',
  '/features',
  '/how-it-works',
  '/download',
  '/roadmap',
  '/changelog',
  '/faq',
  '/signin',
  '/documentation',
  '/documentation/install',
  '/documentation/reference',
]

test.describe('routes render', () => {
  for (const route of ROUTES) {
    test(`${route} renders a full page`, async ({ page }) => {
      await page.goto(`/#${route}`)
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('main h1')).toBeVisible()

      const text = (await page.locator('body').innerText()).trim()
      expect(text.length, `expected content on ${route}`).toBeGreaterThan(100)
      expect(text).not.toContain(NOT_FOUND)
    })
  }

  test('an unknown route shows the 404 page', async ({ page }) => {
    await page.goto('/#/no-such-page')
    await expect(page.getByText(NOT_FOUND)).toBeVisible()
  })
})

test.describe('in-page documentation anchors', () => {
  // Regression: a bare `href="#id"` makes HashRouter read `id` as the pathname and fall through
  // to the 404 route, so every "On this page" link used to leave the article.
  test('an "On this page" link stays on the article and records the anchor', async ({ page }) => {
    await page.goto('/#/documentation/install')
    await expect(page.locator('h1')).toContainText('Install, Updates')

    await page.locator('aside a', { hasText: 'Supported platforms' }).click()

    await expect(page).toHaveURL(/#\/documentation\/install#platforms$/)
    await expect(page.locator('h1')).toContainText('Install, Updates')
    await expect(page.getByText(NOT_FOUND)).toHaveCount(0)
    await expect(page.locator('#platforms')).toBeFocused()
  })

  test('the deep-linked anchor URL loads the article', async ({ page }) => {
    await page.goto('/#/documentation/install#platforms')
    await expect(page.locator('h1')).toContainText('Install, Updates')
    await expect(page.getByText(NOT_FOUND)).toHaveCount(0)
  })
})

test.describe('navigation behaviour', () => {
  test('changing route starts at the top', async ({ page }) => {
    await page.goto('/#/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Features' }).click()

    await expect(page).toHaveURL(/#\/features$/)
    await expect(page.locator('main h1')).toContainText('Everything you need')
    // The URL updates synchronously; the scroll reset runs in an effect after the route renders.
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('a slow lazy page keeps the shell on screen instead of a blank page', async ({ page }) => {
    let releaseChunk: () => void = () => {}
    const chunkGate = new Promise<void>((resolve) => {
      releaseChunk = resolve
    })
    await page.route('**/Roadmap-*.js', async (route) => {
      await chunkGate
      await route.continue()
    })

    // Without a Suspense boundary React suspends the whole root, so nothing at all renders
    // while the chunk is held.
    await page.goto('/#/roadmap', { waitUntil: 'commit' })
    await expect(page.locator('header')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Loading…')).toBeVisible({ timeout: 15_000 })

    releaseChunk()
    await expect(page.getByRole('heading', { name: 'Where Mochi is going' })).toBeVisible({ timeout: 15_000 })
  })

  test('a failed lazy page shows the recovery UI instead of a blank page', async ({ page }) => {
    await page.goto('/#/')
    await page.route('**/Roadmap-*.js', (route) => route.abort())

    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Roadmap' }).click()

    await expect(page.getByRole('button', { name: 'Reload page' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible()
  })
})

test.describe('accessibility', () => {
  // One test per route so they run in parallel across workers instead of awaiting in a loop.
  const AXE_ROUTES = [
    '/',
    '/features',
    '/download',
    '/faq',
    '/roadmap',
    '/signin',
    '/documentation',
    '/documentation/install',
  ]

  for (const route of AXE_ROUTES) {
    test(`axe reports no serious or critical violations on ${route}`, async ({ page }) => {
      await page.goto(`/#${route}`)
      await page.addScriptTag({ content: axe.source })

      const violations = await page.evaluate(async () => {
        const axeInstance = (
          window as unknown as {
            axe: {
              run: (context: Document, options: unknown) => Promise<{
                violations: Array<{ id: string; impact?: string | null; nodes: Array<{ html: string }> }>
              }>
            }
          }
        ).axe
        const results = await axeInstance.run(document, { resultTypes: ['violations'] })
        return results.violations
          .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
          .map((violation) => `${violation.id}: ${violation.nodes[0]?.html ?? ''}`)
      })

      expect(violations, `axe violations on ${route}`).toEqual([])
    })
  }
})
