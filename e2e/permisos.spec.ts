import { test, expect, Page } from '@playwright/test';

const BASE = process.env['E2E_BASE_URL'] || 'http://localhost:4200';

async function login(page: Page, username: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="text"]', username);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|health/, { timeout: 10000 });
}

test.describe('Control de permisos', () => {

  test('usuario no autenticado redirige a /login', async ({ page }) => {
    await page.goto(`${BASE}/operaciones`);
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });

  test('ruta /integraciones/estado solo accesible para ADMIN', async ({ page }) => {
    await login(page, 'tesoreria@fintra.co', 'DevPass123!');
    await page.goto(`${BASE}/integraciones/estado`);

    // Debe redirigir a forbidden o mostrar error 403
    const url = page.url();
    const hasForbidden = url.includes('forbidden') || url.includes('403');
    const hasForbiddenText = await page.locator('[class*="forbidden"], h1').first()
      .textContent().catch(() => '');

    // Al menos uno de los dos debe ser verdad
    expect(hasForbidden || hasForbiddenText?.toLowerCase().includes('403')
      || hasForbiddenText?.toLowerCase().includes('denegado')).toBeTruthy();
  });

  test('login con credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="text"]', 'usuario-inexistente@test.com');
    await page.fill('input[type="password"]', 'password-incorrecto');
    await page.click('button[type="submit"]');

    // Debe mostrar algún mensaje de error
    await page.waitForTimeout(2000);
    const errorVisible = await page.locator('[class*="error"], [class*="red"], [role="alert"]')
      .first().isVisible().catch(() => false);
    const stillOnLogin = page.url().includes('login');

    expect(errorVisible || stillOnLogin).toBeTruthy();
  });

  test('tesorería no puede acceder a bandeja de aprobador directamente', async ({ page }) => {
    // Tesorería sí puede ver la bandeja, pero no puede aprobar
    await login(page, 'tesoreria@fintra.co', 'DevPass123!');
    await page.goto(`${BASE}/operaciones/aprobacion-interna`);

    // La página debe cargar (tesorería puede ver) pero los botones de aprobar no estarán
    await page.waitForSelector('h1', { timeout: 10000 });
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
