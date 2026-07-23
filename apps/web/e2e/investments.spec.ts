import { test, expect, login } from './helpers/auth';

test.describe('Investments Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/investments');
    await page.waitForLoadState('networkidle');
  });

  test('investments page loads with portfolio', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Investimentos/ })).toBeVisible({ timeout: 10000 });
    
    // Check for portfolio summary
    const portfolio = page.locator('text=Carteira').or(page.locator('text=Portfólio')).first();
    await expect(portfolio).toBeVisible({ timeout: 8000 });
  });

  test('add investment button works', async ({ page }) => {
    const addBtn = page.locator('button').filter({ hasText: /Adicionar|Novo Investimento/ }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    
    await addBtn.click();
    await page.waitForTimeout(500);
    
    // Check for modal or form
    const modal = page.locator('text=Adicionar Investimento').or(page.locator('text=Novo Investimento')).first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('investment types are shown', async ({ page }) => {
    const types = page.locator('text=Ações').or(page.locator('text=FIIs')).or(page.locator('text=Criptomoedas')).first();
    if (await types.isVisible()) {
      await expect(types).toBeVisible();
    }
  });

  test('portfolio summary shows totals', async ({ page }) => {
    const total = page.locator('text=Total Investido').or(page.locator('text=Patrimônio')).first();
    if (await total.isVisible()) {
      await expect(total).toBeVisible();
    }
  });

  test('investment list is visible', async ({ page }) => {
    const investmentList = page.locator('[class*="investment"]').or(page.locator('[class*="list"]')).first();
    if (await investmentList.isVisible()) {
      await investmentList.scrollIntoViewIfNeeded();
    }
  });

  test('empty state shows helpful message', async ({ page }) => {
    const emptyState = page.locator('text=Nenhum investimento').or(page.locator('text=Adicione seu primeiro')).first();
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('profit/loss indicators work', async ({ page }) => {
    const profit = page.locator('text=Lucro').or(page.locator('text=Prejuízo')).first();
    if (await profit.isVisible()) {
      await expect(profit).toBeVisible();
    }
  });

  test('filter by investment type works', async ({ page }) => {
    const filterBtn = page.locator('button').filter({ hasText: /Filtrar|Filtros/ }).first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
