import { expect, type Request, test } from '@playwright/test'

const user = process.env.E2E_USER ?? ''
const password = process.env.E2E_PASSWORD ?? ''
const expectLog = process.env.E2E_EXPECT_LOG === 'true'

test.beforeAll(() => {
  if (!user || !password) throw new Error('faltan E2E_USER / E2E_PASSWORD (usa: make e2e)')
})

test('login → dashboard → agregar → aparece en el listado → logout, con el Bearer en CADA request a /api', async ({ page }) => {
  const apiRequests: Request[] = []
  page.on('request', (r) => {
    if (new URL(r.url()).pathname.startsWith('/api/')) apiRequests.push(r)
  })
  const logs: string[] = []
  page.on('console', (m) => logs.push(m.text()))

  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
  await page.getByLabel('Usuario').fill(user)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Tus elementos' })).toBeVisible()

  const title = `E2E ${Date.now()}`
  await page.getByRole('link', { name: 'Agregar' }).click()
  await page.getByLabel('Título').fill(title)
  await page.getByLabel('Descripción').fill('creado por Playwright')
  await page.getByRole('button', { name: 'Guardar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByText(title)).toBeVisible()

  const token = await page.evaluate(() => sessionStorage.getItem('auth.token'))
  expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/)
  expect(apiRequests.length).toBeGreaterThanOrEqual(3) // GET, POST, GET
  for (const r of apiRequests) expect(await r.headerValue('authorization')).toBe(`Bearer ${token}`)

  const jwtLogs = logs.filter((l) => l.startsWith('[api]'))
  if (expectLog) {
    expect(jwtLogs).toHaveLength(apiRequests.length)
    for (const l of jwtLogs) expect(l).toContain(`Bearer ${token}`)
  } else {
    expect(jwtLogs).toHaveLength(0)
  }

  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/login/)
  expect(await page.evaluate(() => sessionStorage.getItem('auth.token'))).toBeNull()
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})

test('la API rechaza una request sin Bearer (401)', async ({ request }) => {
  expect((await request.get('/api/items')).status()).toBe(401)
})
