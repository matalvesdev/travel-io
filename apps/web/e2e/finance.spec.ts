import { test, expect, login } from './helpers/auth';

test.describe('Finance Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/finance');
    await page.waitForLoadState('networkidle');
  });

  test('finance page loads with transaction list', async ({ page }) => {
    await expect(page.locator('text=Finanças').or(page.locator('text=Histórico de Transações')).first()).toBeVisible({ timeout: 10000 });
  });

  test('add transaction button is visible', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Nova Transação")');
    await expect(addBtn).toBeVisible({ timeout: 8000 });
  });

  test('search input is visible', async ({ page }) => {
    const search = page.locator('input[placeholder*="Buscar transações"]');
    await expect(search).toBeVisible({ timeout: 8000 });
  });

  test('month selector is visible', async ({ page }) => {
    const monthBtn = page.locator('button:has-text("Jan"), button:has-text("Fev"), button:has-text("Mar"), button:has-text("Jul")').first();
    await expect(monthBtn).toBeVisible({ timeout: 8000 });
  });
});
