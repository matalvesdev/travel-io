import { test, expect, login } from './helpers/auth';

test.describe('Dashboard Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('dashboard shows summary cards', async ({ page }) => {
    await expect(page.locator('text=Patrimônio Total').or(page.locator('text=Receitas do Mês')).first()).toBeVisible({ timeout: 10000 });
  });

  test('dashboard has chart area', async ({ page }) => {
    const chart = page.locator('text=Fluxo Financeiro').or(page.locator('text=Gastos por Categoria')).first();
    await expect(chart).toBeVisible({ timeout: 8000 });
  });

  test('news section is visible', async ({ page }) => {
    await expect(page.locator('text=Notícias Financeiras')).toBeVisible({ timeout: 8000 });
  });

  test('goals card is visible on dashboard', async ({ page }) => {
    await expect(page.locator('text=Metas').first()).toBeVisible({ timeout: 8000 });
  });

  test('trips card is visible on dashboard', async ({ page }) => {
    await expect(page.locator('text=Viagens').or(page.locator('text=Próximas Viagens')).first()).toBeVisible({ timeout: 8000 });
  });

  test('miles summary is visible on dashboard', async ({ page }) => {
    await expect(page.locator('text=Milhas').first()).toBeVisible({ timeout: 8000 });
  });
});
