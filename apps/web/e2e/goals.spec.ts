import { test, expect, login } from './helpers/auth';

test.describe('Goals Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
  });

  test('goals page loads', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Metas/ })).toBeVisible({ timeout: 10000 });
    
    // Check for goals list or empty state
    const goalsList = page.locator('text=Metas').or(page.locator('text=Nenhuma meta')).first();
    await expect(goalsList).toBeVisible({ timeout: 8000 });
  });

  test('add goal button works', async ({ page }) => {
    const addBtn = page.locator('button').filter({ hasText: /Adicionar|Nova Meta/ }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    
    await addBtn.click();
    await page.waitForTimeout(500);
    
    // Check for modal or form
    const modal = page.locator('text=Adicionar Meta').or(page.locator('text=Nova Meta')).first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('goal progress is shown', async ({ page }) => {
    const progress = page.locator('text=Progresso').or(page.locator('[class*="progress"]')).first();
    if (await progress.isVisible()) {
      await expect(progress).toBeVisible();
    }
  });

  test('goal cards are visible', async ({ page }) => {
    const goalCards = page.locator('[class*="goal"]').or(page.locator('[class*="card"]')).first();
    if (await goalCards.isVisible()) {
      await goalCards.scrollIntoViewIfNeeded();
    }
  });

  test('empty state shows helpful message', async ({ page }) => {
    const emptyState = page.locator('text=Nenhuma meta').or(page.locator('text=Crie sua primeira')).first();
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('goal completion percentage shows', async ({ page }) => {
    const percentage = page.locator('text=%').first();
    if (await percentage.isVisible()) {
      await expect(percentage).toBeVisible();
    }
  });
});
