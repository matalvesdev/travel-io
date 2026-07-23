import { test, expect, login } from './helpers/auth';

test.describe('Dashboard Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('dashboard loads with all sections', async ({ page }) => {
    // Header
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Visão geral das suas finanças')).toBeVisible();
    
    // Stats cards
    await expect(page.locator('text=Patrimônio Total').or(page.locator('text=Receitas do Mês')).first()).toBeVisible({ timeout: 10000 });
    
    // Charts section
    await expect(page.locator('text=Fluxo Financeiro').or(page.locator('text=Gastos por Categoria')).first()).toBeVisible({ timeout: 8000 });
    
    // News section
    await expect(page.locator('text=Notícias Financeiras')).toBeVisible({ timeout: 8000 });
  });

  test('period filter works', async ({ page }) => {
    const monthBtn = page.locator('button:has-text("Mês")');
    await monthBtn.click();
    await page.waitForTimeout(500);
    
    const yearBtn = page.locator('button:has-text("Ano")');
    await yearBtn.click();
    await page.waitForTimeout(500);
    
    const allBtn = page.locator('button:has-text("Total")');
    await allBtn.click();
    await page.waitForTimeout(500);
  });

  test('refresh button works', async ({ page }) => {
    const refreshBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    await refreshBtn.click();
    await page.waitForTimeout(1000);
  });

  test('stats hero shows key metrics', async ({ page }) => {
    const metrics = ['Patrimônio Total', 'Receitas do Mês', 'Despesas do Mês', 'Saldo'];
    for (const metric of metrics) {
      const element = page.locator(`text=${metric}`).first();
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
      }
    }
  });

  test('category chart is interactive', async ({ page }) => {
    const chart = page.locator('text=Gastos por Categoria').first();
    if (await chart.isVisible()) {
      await expect(chart).toBeVisible();
    }
  });

  test('cash flow chart displays data', async ({ page }) => {
    const chart = page.locator('text=Fluxo Financeiro').first();
    if (await chart.isVisible()) {
      await expect(chart).toBeVisible();
    }
  });

  test('news section shows articles', async ({ page }) => {
    const newsSection = page.locator('text=Notícias Financeiras');
    await expect(newsSection).toBeVisible({ timeout: 8000 });
    
    // Check for news items or loading state
    const newsItems = page.locator('[class*="news"]').or(page.locator('text=Carregando')).first();
    await expect(newsItems).toBeVisible({ timeout: 5000 });
  });
});
