import { test, expect, login } from './helpers/auth';

test.describe('Investments Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/investments');
    await page.waitForLoadState('networkidle');
  });

  test('investments page loads with portfolio section', async ({ page }) => {
    await expect(page.locator('text=Investimentos').or(page.locator('text=Posições')).first()).toBeVisible({ timeout: 10000 });
  });

  test('page has positions table or empty state', async ({ page }) => {
    const hasContent = page.locator('text=Posições').or(page.locator('text=Nenhum investimento')).first();
    await expect(hasContent).toBeVisible({ timeout: 8000 });
  });

  test('new investment button is visible', async ({ page }) => {
    const btn = page.locator('button:has-text("Novo")').first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('summary cards are visible', async ({ page }) => {
    await expect(page.locator('text=Investido').or(page.locator('text=Valor Atual')).first()).toBeVisible({ timeout: 8000 });
  });
});
