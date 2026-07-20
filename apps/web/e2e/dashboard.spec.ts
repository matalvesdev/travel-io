import { test, expect } from './helpers/auth';

test.describe('Dashboard Module — E2E', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('dashboard shows summary cards', async ({ authenticatedPage: page }) => {
    await expect(page.locator('text=Patrimônio Total').or(page.locator('text=Receitas do Mês')).first()).toBeVisible({ timeout: 10000 });
  });

  test('dashboard has chart area', async ({ authenticatedPage: page }) => {
    const chart = page.locator('text=Fluxo Financeiro').or(page.locator('text=Gastos por Categoria')).first();
    await expect(chart).toBeVisible({ timeout: 8000 });
  });

  test('news section is visible', async ({ authenticatedPage: page }) => {
    await expect(page.locator('text=Notícias Financeiras')).toBeVisible({ timeout: 8000 });
  });
});
