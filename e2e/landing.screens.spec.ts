// The landing page as designed: every section, the images, and the floating
// icon animations (also on computers that ask for reduced motion).
import { test, expect } from '@playwright/test'
import { settle, expectNoSideScroll } from './support'

for (const width of [390, 820, 1366]) {
  test(`landing page sections at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await settle(page)
    // the floating icons are there on every screen size
    await expect(page.locator('.floating-icons').first()).toBeAttached({ timeout: 10_000 })
    for (let y = 0; y < 12000; y += 500) { await page.mouse.wheel(0, 500); await page.waitForTimeout(120) }
    await page.waitForTimeout(800)
    for (const id of ['features-section', 'about', 'contact']) await expect(page.locator(`#${id}`)).toBeAttached()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // the images load
    for (const img of ['hero-bg.png', 'features-bg.png', 'avatar-placeholder.svg', 'team-ikechukwu-izegbu.jpg']) {
      const r = await page.request.get(`/images/${img}`)
      expect(r.status(), `/images/${img}`).toBe(200)
      expect(r.headers()['content-type']).toContain('image')
    }
    await expectNoSideScroll(page)
    await page.screenshot({ path: `e2e/.screens/landing_full_${width}.png`, fullPage: true })
  })
}

// Your landing CSS stops the floating icons from moving for people whose
// computer asks for reduced motion; everything else still animates.
test('the landing page animates, and still shows its icons with reduced motion', async ({ browser }) => {
  const measure = async (reducedMotion: 'reduce' | 'no-preference') => {
    const ctx = await browser.newContext({ reducedMotion, viewport: { width: 1366, height: 900 } })
    const page = await ctx.newPage()
    await page.goto('/')
    await settle(page)
    const out = await page.evaluate(() => ({
      animated: [...document.querySelectorAll('.landing-page *')].filter((el) => { const s = getComputedStyle(el); return s.animationName !== 'none' && parseFloat(s.animationDuration) > 0.1 }).length,
      icons: document.querySelectorAll('.floating-icon').length,
    }))
    await ctx.close()
    return out
  }
  const normal = await measure('no-preference')
  const reduced = await measure('reduce')
  expect(normal.icons).toBeGreaterThan(0)
  expect(normal.animated).toBeGreaterThan(0)
  expect(reduced.icons).toBe(normal.icons)
})
