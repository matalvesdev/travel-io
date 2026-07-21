import { test, expect, login } from './helpers/auth';

test.describe('Shopping Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');
  });

  test('shopping page loads with search bar and store filters', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar produto"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    const allStoresBtn = page.locator('button:has-text("Todas as Lojas")');
    await expect(allStoresBtn).toBeVisible({ timeout: 5000 });
  });

  test('wishlist and monitor buttons are visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Wishlist")').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('button:has-text("Monitorar")').first()).toBeVisible({ timeout: 8000 });
  });

  test('stats cards are visible', async ({ page }) => {
    await expect(page.locator('text=Lojas Buscadas').or(page.locator('text=Produtos Encontrados')).first()).toBeVisible({ timeout: 8000 });
  });

  test('coupon section is visible', async ({ page }) => {
    await expect(page.locator('text=Cupons Disponíveis')).toBeVisible({ timeout: 8000 });
  });
});
