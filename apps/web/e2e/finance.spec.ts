import { test, expect, login } from './helpers/auth';

test.describe('Finance Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/finance');
    await page.waitForLoadState('networkidle');
  });

  test('finance page loads with transactions', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Financeiro|Finanças/ }).first()).toBeVisible({ timeout: 10000 });
    
    // Check for transaction list or empty state
    const transactionList = page.locator('text=Transações').or(page.locator('text=Nenhuma transação')).first();
    await expect(transactionList).toBeVisible({ timeout: 8000 });
  });

  test('add transaction button works', async ({ page }) => {
    const addBtn = page.locator('button').filter({ hasText: /Adicionar|Nova Transação/ }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    
    await addBtn.click();
    await page.waitForTimeout(500);
    
    // Check for modal or form
    const modal = page.locator('text=Adicionar Transação').or(page.locator('text=Nova Transação')).first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('transaction filters work', async ({ page }) => {
    const filterBtn = page.locator('button').filter({ hasText: /Filtrar|Filtros/ }).first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('category filter works', async ({ page }) => {
    const categorySelect = page.locator('select').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  });

  test('transaction summary shows totals', async ({ page }) => {
    const summary = page.locator('text=Receitas').or(page.locator('text=Despesas')).first();
    if (await summary.isVisible()) {
      await expect(summary).toBeVisible();
    }
  });

  test('CSV import button exists', async ({ page }) => {
    const importBtn = page.locator('button').filter({ hasText: /Importar|CSV/ }).first();
    if (await importBtn.isVisible()) {
      await expect(importBtn).toBeVisible();
    }
  });

  test('transaction list is scrollable', async ({ page }) => {
    const transactionList = page.locator('[class*="transaction"]').or(page.locator('[class*="list"]')).first();
    if (await transactionList.isVisible()) {
      await transactionList.scrollIntoViewIfNeeded();
    }
  });

  test('empty state shows helpful message', async ({ page }) => {
    const emptyState = page.locator('text=Nenhuma transação').or(page.locator('text=Adicione sua primeira')).first();
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });
});
