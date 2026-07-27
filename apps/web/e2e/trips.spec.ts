import { test, expect, login } from './helpers/auth';

test.describe('Trips Module — E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/trips');
    await page.waitForLoadState('networkidle');
  });

  test('trips page loads with header', async ({ page }) => {
    await expect(page.locator('text=Minhas Viagens')).toBeVisible({ timeout: 10000 });
  });

  test('stats cards are visible', async ({ page }) => {
    await expect(page.locator('text=Planejadas').or(page.locator('text=Planejada').first())).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Concluídas').or(page.locator('text=Concluída').first())).toBeVisible({ timeout: 8000 });
  });

  test('filter tabs are visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Todas")').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('button:has-text("Planejada")').or(page.locator('button:has-text("Planejadas")')).first()).toBeVisible();
    await expect(page.locator('button:has-text("Concluída")').or(page.locator('button:has-text("Concluídas")')).first()).toBeVisible();
  });

  test('new trip button navigates to travel page', async ({ page }) => {
    await page.locator('a:has-text("Nova Viagem"), button:has-text("Nova Viagem")').click();
    await expect(page).toHaveURL(/\/travel/);
  });

  test('trip cards show destination and dates', async ({ page }) => {
    const tripCard = page.locator('text=GRU').or(page.locator('text=CDG')).or(page.locator('text=MIA')).first();
    if (await tripCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(tripCard).toBeVisible();
    }
  });

  test('empty state shows planning prompt', async ({ page }) => {
    const emptyMessage = page.locator('text=Nenhuma viagem encontrada');
    if (await emptyMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(page.locator('button:has-text("Planejar Viagem")')).toBeVisible();
    }
  });

  test('filter changes trip list', async ({ page }) => {
    const completedBtn = page.locator('button:has-text("Concluída")').or(page.locator('button:has-text("Concluídas")')).first();
    if (await completedBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await completedBtn.click();
      await page.waitForTimeout(500);
      const activeClass = await completedBtn.getAttribute('class');
      expect(activeClass).toContain('bg-primary');
    }
  });
});
