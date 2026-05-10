import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('muestra la página de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Fintra Financiero')).toBeVisible();
    await expect(page.getByRole('button', { name: /ingresar/i })).toBeVisible();
  });

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'usuario-invalido');
    await page.fill('#password', 'pass123');
    await page.click('button[type=submit]');
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
