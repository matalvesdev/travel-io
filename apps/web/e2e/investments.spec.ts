import { test, expect } from './helpers/auth';

test.describe('Investments Module — E2E', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/investments');
    await page.waitForLoadState('networkidle');
  });

  test('investments page loads with portfolio section', async ({ authenticatedPage: page }) => {
    await expect(page.locator('text=Investimentos').or(page.locator('text=Posições')).first()).toBeVisible({ timeout: 10000 });
  });

  test('page has positions table or empty state', async ({ authenticatedPage: page }) => {
    const hasContent = page.locator('text=Posições').or(page.locator('text=Nenhum investimento')).first();
    await expect(hasContent).toBeVisible({ timeout: 8000 });
  });

  test('new investment button is visible', async ({ authenticatedPage: page }) => {
    const btn = page.locator('button:has-text("Novo")').first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('summary cards are visible', async ({ authenticatedPage: page }) => {
    await expect(page.locator('text=Investido').or(page.locator('text=Valor Atual')).first()).toBeVisible({ timeout: 8000 });
  });
});
