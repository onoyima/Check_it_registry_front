// Checking an item. Every check needs the checker's location and a photo of
// them (the browser is given a location in Lagos and a pretend camera).
// Your own item is free and gives a certificate for a buyer; other people's
// items are free up to the admin's number, then paid.
import { test, expect, type Page } from '@playwright/test'
import { API, apiAs, makeImei, signIn, watch } from '../support'

test.use({ geolocation: { latitude: 6.5244, longitude: 3.3792 }, permissions: ['geolocation', 'camera'] })
test.beforeEach(async ({ page }) => { await signIn(page, 'user') })

// Type the number, press Check, take the photo
async function checkItem(page: Page, id: string) {
  await page.goto('/device-check')
  await page.locator('#check-id').fill(id)
  await page.getByRole('button', { name: /^check$/i }).click()
  const cam = page.getByTestId('selfie-capture')
  await expect(cam).toBeVisible({ timeout: 20_000 })
  await expect(cam.getByRole('button', { name: /take photo/i })).toBeEnabled()
  await page.waitForTimeout(400) // let the camera start
  await cam.getByRole('button', { name: /take photo/i }).click()
  await cam.getByRole('button', { name: /use this photo/i }).click()
}

async function sellerPhone() {
  const seller = await apiAs('user2')
  const list = await (await seller.get('/api/user-portal/devices')).json()
  await seller.dispose()
  return list.data.devices.find((d: any) => d.imei)
}

test('a registered, verified item shows as safe', async ({ page }) => {
  const w = watch(page)
  const phone = await sellerPhone()
  await checkItem(page, phone.imei)
  await expect(page.getByRole('heading', { name: /no theft reports/i })).toBeVisible({ timeout: 20_000 })
  // it's someone else's item, so no certificate
  await expect(page.getByTestId('check-certificate')).toHaveCount(0)
  w.expectClean()
})

test('the camera step can be cancelled, and nothing is checked', async ({ page }) => {
  await page.goto('/device-check')
  await page.locator('#check-id').fill(makeImei())
  await page.getByRole('button', { name: /^check$/i }).click()
  await expect(page.getByTestId('selfie-capture')).toBeVisible({ timeout: 20_000 })
  await page.getByRole('button', { name: /cancel/i }).click()
  await expect(page.getByTestId('selfie-capture')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: /not registered/i })).toHaveCount(0)
})

test('an unknown number says it is not registered', async ({ page }) => {
  await checkItem(page, makeImei())
  await expect(page.getByRole('heading', { name: /not registered/i }).first()).toBeVisible({ timeout: 20_000 })
})

test('my checks appear in my check history, and open a full report', async ({ page }) => {
  await checkItem(page, makeImei())
  await expect(page.getByRole('heading', { name: /not registered/i }).first()).toBeVisible({ timeout: 20_000 })
  await page.goto('/device-check-report')
  await expect(page.getByRole('heading', { name: /check history/i })).toBeVisible()
  const rows = page.getByTestId('my-checks').locator('button')
  await expect(rows.first()).toBeVisible()
  await rows.first().click()
  await expect(page).toHaveURL(/checkId=/)
})

test('the owner sees who checked their item; admins see the photo, location, IP and browser ID', async ({ page, context }) => {
  const phone = await sellerPhone()
  await checkItem(page, phone.imei)
  await expect(page.getByRole('heading', { name: /no theft reports/i }).first()).toBeVisible({ timeout: 20_000 })

  await context.clearCookies()
  const owner = await context.newPage()
  await signIn(owner, 'user2')
  await owner.goto(`/device/${phone.id}`)
  await owner.getByRole('link', { name: /who checked this item/i }).click()
  await expect(owner.getByRole('heading', { name: /who checked this item/i })).toBeVisible()
  await expect(owner.getByTestId('item-checks')).toContainText(/ada/i)

  const admin = await context.newPage()
  await signIn(admin, 'admin')
  await admin.goto(`/admin/devices/${phone.id}`)
  const who = admin.getByTestId('checker-details').first()
  await expect(who).toContainText(/ada/i)
  await expect(who).toContainText(/IP address/)
  await expect(who).toContainText(/127\.0\.0\.1|::1/)
  await expect(who).toContainText(/6\.52440, 3\.37920/)
  await expect(who.locator('img')).toBeVisible({ timeout: 15_000 }) // the photo
})

test("checking your own item is free and gives a certificate the buyer can verify", async ({ page, context }) => {
  const w = watch(page)
  // Ada's own phone
  const me = await apiAs('user')
  const mine = (await (await me.get('/api/user-portal/devices')).json()).data.devices.find((d: any) => d.imei)
  await me.dispose()
  await checkItem(page, mine.imei)
  const cert = page.getByTestId('check-certificate')
  await expect(cert).toBeVisible({ timeout: 20_000 })
  const code = (await page.getByTestId('certificate-code').innerText()).trim()
  expect(code).toMatch(/^PO-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
  await expect(cert.getByRole('link', { name: /transfer to the buyer/i })).toHaveAttribute('href', `/transfer?device=${mine.id}`)
  w.expectClean()

  // The buyer (another account) enters the code
  await context.clearCookies()
  const buyer = await context.newPage()
  await signIn(buyer, 'user2')
  await buyer.goto('/check-certificate')
  await buyer.locator('#cert-code').fill(code)
  await buyer.getByRole('button', { name: /^verify$/i }).click()
  const res = buyer.getByTestId('certificate-result')
  await expect(res).toContainText(/certificate is genuine/i)
  await expect(res).toContainText(/ada tester/i)
  await expect(res).toContainText(mine.imei.slice(-4))
  await expect(res).not.toContainText(mine.imei)
})

test("after the free checks of other people's items, the check asks for payment", async ({ page }) => {
  const admin = await apiAs('admin')
  await admin.put('/api/revenue-admin/prices/device_check_free_others', { data: { value: 0 } })
  try {
    await checkItem(page, makeImei())
    await expect(page.getByRole('button', { name: /pay ngn/i })).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/used your free checks/i)).toBeVisible()
  } finally {
    await admin.put('/api/revenue-admin/prices/device_check_free_others', { data: { value: 100000 } })
    await admin.dispose()
  }
})

test('the check page says what checks cost', async ({ page }) => {
  await page.goto('/device-check')
  await expect(page.getByTestId('check-allowance')).toContainText(/checking your own items is free/i)
  await expect(page.getByTestId('check-allowance')).toContainText(/free checks left/i)
  void API
})
