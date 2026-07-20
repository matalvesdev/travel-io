import { test, expect } from './helpers/auth';

test.describe('Travel Module — E2E', () => {

  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/travel');
    await page.waitForLoadState('networkidle');
  });

  test('travel page loads with plan step visible', async ({ authenticatedPage: page }) => {
    await expect(page.locator('text=Planeje sua próxima viagem')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('label:has-text("Origem")').first()).toBeVisible();
    await expect(page.locator('label:has-text("Destino")').first()).toBeVisible();
  });

  test('origin autocomplete works', async ({ authenticatedPage: page }) => {
    const originInput = page.locator('input[placeholder="São Paulo"]');
    await originInput.click();
    await originInput.fill('Rio');
    // Dropdown should appear with matching cities
    const dropdown = page.locator('.absolute.z-50.mt-1');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    // Click first suggestion
    await dropdown.locator('button').first().click();
    // Input should now have a value
    const val = await originInput.inputValue();
    expect(val.length).toBeGreaterThan(0);
  });

  test('destination autocomplete shows cities', async ({ authenticatedPage: page }) => {
    const destInput = page.locator('input[placeholder="Para onde?"]');
    await destInput.click();
    await destInput.fill('Salvador');
    await page.waitForTimeout(500);
    const suggestion = page.getByRole('button', { name: /Salvador.*BA/ }).first();
    await expect(suggestion).toBeVisible({ timeout: 5000 });
  });

  test('step progress indicators render correctly', async ({ authenticatedPage: page }) => {
    const steps = ['Destino', 'Voos', 'Hotéis', 'Confirmar', 'Roteiro', 'Salvo'];
    for (const step of steps) {
      await expect(page.locator(`text=${step}`).first()).toBeVisible();
    }
  });

  test('travelers selector works', async ({ authenticatedPage: page }) => {
    const selector = page.locator('select').first();
    await selector.selectOption('4');
    const selected = await selector.inputValue();
    expect(selected).toBe('4');
  });
});
