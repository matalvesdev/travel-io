import { test, expect, login } from './helpers/auth';

test.describe('Shopping Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');
  });

  test('shopping page loads with all tabs', async ({ page }) => {
    // Header
    await expect(page.locator('h1:has-text("Shopping")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Compare preços em 7 lojas simultaneamente')).toBeVisible();
    
    // Tabs
    await expect(page.locator('button:has-text("Buscar")')).toBeVisible();
    await expect(page.locator('button:has-text("Wishlist")')).toBeVisible();
    await expect(page.locator('button:has-text("Monitores")')).toBeVisible();
    await expect(page.locator('button:has-text("Ofertas")')).toBeVisible();
    await expect(page.locator('button:has-text("Cupons")')).toBeVisible();
  });

  test('search functionality works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar produto"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    
    await searchInput.fill('iPhone');
    await page.waitForTimeout(1000);
    
    // Check for search results or loading state
    const results = page.locator('[class*="product"]').or(page.locator('text=Buscando')).first();
    await expect(results).toBeVisible({ timeout: 10000 });
  });

  test('store filter chips work', async ({ page }) => {
    const allStoresBtn = page.locator('button:has-text("Todas as Lojas")');
    await expect(allStoresBtn).toBeVisible({ timeout: 5000 });
    
    const amazonBtn = page.locator('button:has-text("Amazon")');
    await expect(amazonBtn).toBeVisible();
    
    await amazonBtn.click();
    await page.waitForTimeout(500);
  });

  test('wishlist tab shows items', async ({ page }) => {
    await page.locator('button:has-text("Wishlist")').click();
    await page.waitForTimeout(1000);
    
    const addBtn = page.locator('button:has-text("Adicionar")');
    await expect(addBtn).toBeVisible({ timeout: 5000 });
  });

  test('monitors tab shows monitors', async ({ page }) => {
    await page.locator('button:has-text("Monitores")').click();
    await page.waitForTimeout(1000);
    
    const addBtn = page.locator('button:has-text("Adicionar")');
    await expect(addBtn).toBeVisible({ timeout: 5000 });
  });

  test('deals tab shows deals', async ({ page }) => {
    await page.locator('button:has-text("Ofertas")').click();
    await page.waitForTimeout(1000);
    
    // Check for deals or empty state
    const dealsSection = page.locator('text=Ofertas').or(page.locator('text=Nenhuma oferta')).first();
    await expect(dealsSection).toBeVisible({ timeout: 5000 });
  });

  test('coupons tab shows coupons', async ({ page }) => {
    await page.locator('button:has-text("Cupons")').click();
    await page.waitForTimeout(1000);
    
    const couponsSection = page.locator('text=Cupons').or(page.locator('text=Nenhum cupom')).first();
    await expect(couponsSection).toBeVisible({ timeout: 5000 });
  });

  test('stats cards show metrics', async ({ page }) => {
    const stats = page.locator('text=Itens na Wishlist').or(page.locator('text=Economia Potencial')).first();
    await expect(stats).toBeVisible({ timeout: 8000 });
  });

  test('add to wishlist modal works', async ({ page }) => {
    await page.locator('button:has-text("Wishlist")').click();
    await page.waitForTimeout(500);
    
    const addBtn = page.locator('button:has-text("Adicionar")');
    await addBtn.click();
    
    const modal = page.locator('text=Adicionar à Wishlist');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Close modal
    const closeBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await closeBtn.click();
  });
});
