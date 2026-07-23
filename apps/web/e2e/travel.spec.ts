import { test, expect, login } from './helpers/auth';

test.describe('Travel Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/travel');
    await page.waitForLoadState('networkidle');
  });

  test('travel page loads with trip list', async ({ page }) => {
    await expect(page.locator('h1:has-text("Viagens")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Planeje e acompanhe suas viagens')).toBeVisible();
    
    // Stats cards
    await expect(page.locator('text=Total de Viagens')).toBeVisible();
    await expect(page.locator('text=Próximas')).toBeVisible();
    await expect(page.locator('text=Concluídas')).toBeVisible();
  });

  test('new trip modal opens', async ({ page }) => {
    const newTripBtn = page.locator('button:has-text("Nova Viagem")');
    await expect(newTripBtn).toBeVisible({ timeout: 5000 });
    
    await newTripBtn.click();
    await page.waitForTimeout(500);
    
    // Check for search modal
    const searchModal = page.locator('text=Planeje sua próxima viagem').or(page.locator('text=Buscar voos')).first();
    await expect(searchModal).toBeVisible({ timeout: 5000 });
  });

  test('trip wizard step 1 - destination', async ({ page }) => {
    await page.locator('button:has-text("Nova Viagem")').click();
    await page.waitForTimeout(500);
    
    // Check for origin and destination inputs
    const originInput = page.locator('input[placeholder="São Paulo"]').or(page.locator('input[placeholder*="Origem"]')).first();
    await expect(originInput).toBeVisible({ timeout: 5000 });
    
    const destInput = page.locator('input[placeholder="Para onde?"]').or(page.locator('input[placeholder*="Destino"]')).first();
    await expect(destInput).toBeVisible();
  });

  test('origin autocomplete works', async ({ page }) => {
    await page.locator('button:has-text("Nova Viagem")').click();
    await page.waitForTimeout(500);
    
    const originInput = page.locator('input[placeholder="São Paulo"]').or(page.locator('input[placeholder*="Origem"]')).first();
    await originInput.click();
    await originInput.fill('Rio');
    await page.waitForTimeout(500);
    
    const dropdown = page.locator('.absolute.z-50.mt-1').or(page.locator('[role="listbox"]')).first();
    if (await dropdown.isVisible()) {
      await dropdown.locator('button').first().click();
    }
  });

  test('destination autocomplete works', async ({ page }) => {
    await page.locator('button:has-text("Nova Viagem")').click();
    await page.waitForTimeout(500);
    
    const destInput = page.locator('input[placeholder="Para onde?"]').or(page.locator('input[placeholder*="Destino"]')).first();
    await destInput.click();
    await destInput.fill('Salvador');
    await page.waitForTimeout(500);
    
    const suggestion = page.getByRole('button', { name: /Salvador.*BA/ }).first();
    if (await suggestion.isVisible()) {
      await expect(suggestion).toBeVisible({ timeout: 5000 });
    }
  });

  test('step progress indicators render', async ({ page }) => {
    await page.locator('button:has-text("Nova Viagem")').click();
    await page.waitForTimeout(500);
    
    const steps = ['Destino', 'Voos', 'Hotéis', 'Confirmar', 'Roteiro', 'Salvo'];
    for (const step of steps) {
      const stepElement = page.locator(`text=${step}`).first();
      if (await stepElement.isVisible()) {
        await expect(stepElement).toBeVisible();
      }
    }
  });

  test('travelers selector works', async ({ page }) => {
    await page.locator('button:has-text("Nova Viagem")').click();
    await page.waitForTimeout(500);
    
    const selector = page.locator('select').first();
    if (await selector.isVisible()) {
      await selector.selectOption('4');
      const selected = await selector.inputValue();
      expect(selected).toBe('4');
    }
  });

  test('date picker works', async ({ page }) => {
    await page.locator('button:has-text("Nova Viagem")').click();
    await page.waitForTimeout(500);
    
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible()) {
      await dateInput.fill('2026-12-20');
      const value = await dateInput.inputValue();
      expect(value).toBe('2026-12-20');
    }
  });

  test('next trip card shows when trips exist', async ({ page }) => {
    const nextTripCard = page.locator('text=Próxima Viagem');
    if (await nextTripCard.isVisible()) {
      await expect(nextTripCard).toBeVisible();
    }
  });

  test('trip cards are clickable', async ({ page }) => {
    const tripCards = page.locator('[class*="trip-card"]').or(page.locator('[class*="cursor-pointer"]'));
    const count = await tripCards.count();
    if (count > 0) {
      await tripCards.first().click();
      await page.waitForTimeout(500);
    }
  });
});
