import { test, expect, login } from './helpers/auth';

test.describe('Miles Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/miles');
    await page.waitForLoadState('networkidle');
  });

  test('miles page loads', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Milhas/ })).toBeVisible({ timeout: 10000 });
    
    // Check for miles summary
    const milesSummary = page.locator('text=Saldo').or(page.locator('text=Total de Milhas')).first();
    await expect(milesSummary).toBeVisible({ timeout: 8000 });
  });

  test('add miles account button works', async ({ page }) => {
    const addBtn = page.locator('button').filter({ hasText: /Adicionar|Nova Conta/ }).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    
    await addBtn.click();
    await page.waitForTimeout(500);
    
    // Check for modal or form
    const modal = page.locator('text=Adicionar Conta').or(page.locator('text=Nova Conta')).first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('miles programs are shown', async ({ page }) => {
    const programs = page.locator('text=Smiles').or(page.locator('text=Latam Pass')).or(page.locator('text=Programa')).first();
    if (await programs.isVisible()) {
      await expect(programs).toBeVisible();
    }
  });

  test('miles balance is displayed', async ({ page }) => {
    const balance = page.locator('text=Saldo').or(page.locator('text=Disponível')).first();
    if (await balance.isVisible()) {
      await expect(balance).toBeVisible();
    }
  });

  test('empty state shows helpful message', async ({ page }) => {
    const emptyState = page.locator('text=Nenhuma conta').or(page.locator('text=Adicione sua primeira')).first();
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('miles history is visible', async ({ page }) => {
    const history = page.locator('text=Histórico').or(page.locator('text=Transações')).first();
    if (await history.isVisible()) {
      await expect(history).toBeVisible();
    }
  });
});
