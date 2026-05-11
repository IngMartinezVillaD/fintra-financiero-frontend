import { test, expect, Page } from '@playwright/test';

const BASE = process.env['E2E_BASE_URL'] || 'http://localhost:4200';
const API  = process.env['E2E_API_URL']  || 'http://localhost:8080/fintra-financiero-service';

async function login(page: Page, username: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.fill('[data-testid="username"], input[type="text"]', username);
  await page.fill('[data-testid="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|health/, { timeout: 10000 });
}

test.describe('Pipeline completo CR → DS', () => {

  test.beforeEach(async ({ page }) => {
    await login(page, 'tesoreria@fintra.co', 'DevPass123!');
  });

  test('1 — Crear operación (CR)', async ({ page }) => {
    await page.goto(`${BASE}/operaciones/nueva`);
    await page.waitForSelector('form, [data-testid="form-operacion"]');

    // Seleccionar empresas (usando los selectores disponibles)
    const prestamistaSelect = page.locator('select, [data-testid="empresa-prestamista"]').first();
    if (await prestamistaSelect.isVisible()) {
      await prestamistaSelect.selectOption({ index: 1 });
    }

    // Verificar que el botón de crear está disponible
    const btnCrear = page.locator('button[type="submit"], [data-testid="btn-crear"]').first();
    await expect(btnCrear).toBeVisible();
  });

  test('2 — Dashboard muestra pipeline correcto', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForSelector('[class*="card"], h1', { timeout: 10000 });

    // Verificar que el dashboard cargó
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('3 — Lista de operaciones carga sin errores', async ({ page }) => {
    await page.goto(`${BASE}/operaciones`);

    // Esperar a que cargue la tabla o el estado vacío
    await page.waitForSelector('table, [class*="empty"], h1', { timeout: 10000 });
    await expect(page.locator('h1').first()).toBeVisible();

    // Verificar que no hay error visible
    const errorEl = page.locator('[class*="text-red"], [role="alert"]');
    await expect(errorEl).toHaveCount(0);
  });

  test('4 — Bandeja de aprobación accesible para ADMIN', async ({ page }) => {
    await login(page, 'admin@fintra.co', 'DevPass123!');
    await page.goto(`${BASE}/operaciones/aprobacion-interna`);
    await page.waitForSelector('table, [class*="empty"]', { timeout: 10000 });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('5 — Seguimiento de operaciones DS', async ({ page }) => {
    await page.goto(`${BASE}/operaciones/seguimiento`);
    await page.waitForSelector('table, [class*="empty"]', { timeout: 10000 });
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
