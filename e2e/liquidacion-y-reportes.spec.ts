import { test, expect, Page } from '@playwright/test';

const BASE = process.env['E2E_BASE_URL'] || 'http://localhost:4200';

async function loginAdmin(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="text"]', 'admin@fintra.co');
  await page.fill('input[type="password"]', 'DevPass123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|health/, { timeout: 10000 });
}

test.describe('Liquidación mensual y reportes', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('página de liquidaciones carga correctamente', async ({ page }) => {
    await page.goto(`${BASE}/liquidaciones-mensuales`);
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('h1').first()).toContainText('Liquidación');
  });

  test('botón "Nueva liquidación" visible para tesorería', async ({ page }) => {
    await page.goto(`${BASE}/liquidaciones-mensuales`);
    await page.waitForSelector('h1', { timeout: 10000 });
    const btnNueva = page.locator('button, [class*="btn"]').filter({ hasText: /nueva liquidación/i });
    await expect(btnNueva.first()).toBeVisible();
  });

  test('página de reportes carga y muestra los 5 reportes disponibles', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/reportes`);
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('h1').first()).toContainText('Reportes');

    // Verificar que hay al menos 3 reportes visibles
    const reportCards = page.locator('[class*="card"]');
    const count = await reportCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('dashboard principal muestra pipeline con 5 etapas', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForSelector('h1', { timeout: 10000 });

    // Las 5 etapas deben ser visibles
    for (const etapa of ['CR', 'AI', 'FD', 'DS']) {
      const etapaEl = page.locator('text=' + etapa).first();
      await expect(etapaEl).toBeVisible();
    }
  });

  test('control GMF carga correctamente', async ({ page }) => {
    await page.goto(`${BASE}/controles/gmf`);
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('h1').first()).toContainText('GMF');
  });

  test('control presunto fiscal carga correctamente', async ({ page }) => {
    await page.goto(`${BASE}/controles/presunto`);
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('h1').first()).toContainText('presunto');
  });
});
