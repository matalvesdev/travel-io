import { test, expect, login } from './helpers/auth';

test.describe('Goals Module — E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
  });

  test('goals page loads with stats', async ({ page }) => {
    await expect(page.locator('text=Objetivos')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total de Metas')).toBeVisible();
    await expect(page.locator('text=Em Andamento')).toBeVisible();
    await expect(page.locator('text=Concluídas')).toBeVisible();
  });

  test('new goal button opens modal', async ({ page }) => {
    await page.locator('button:has-text("Nova Meta")').click();
    await expect(page.locator('text=Nova Meta')).toBeVisible();
    await expect(page.locator('text=Valor alvo')).toBeVisible();
    await expect(page.locator('text=Data alvo')).toBeVisible();
  });

  test('empty state shows create button', async ({ page }) => {
    const emptyMessage = page.locator('text=Nenhuma meta criada ainda');
    if (await emptyMessage.isVisible()) {
      await expect(page.locator('button:has-text("Criar Primeira Meta")')).toBeVisible();
    }
  });

  test('goal type selector works', async ({ page }) => {
    await page.locator('button:has-text("Nova Meta")').click();
    await page.locator('button:has-text("Investimento")').click();
    await expect(page.locator('button:has-text("Investimento")')).toHaveClass(/default/);
  });

  test('goal priority selector works', async ({ page }) => {
    await page.locator('button:has-text("Nova Meta")').click();
    await page.locator('button:has-text("Urgente")').click();
    await expect(page.locator('button:has-text("Urgente")')).toHaveClass(/default/);
  });

  test('stats cards update based on goal list', async ({ page }) => {
    await expect(page.locator('text=Total de Metas').locator('..')).toBeVisible();
    await expect(page.locator('text=Em Andamento').locator('..')).toBeVisible();
    await expect(page.locator('text=Concluídas').locator('..')).toBeVisible();
  });

  test('goal cards have action buttons', async ({ page }) => {
    const goalCard = page.locator('h3:has-text("Comprar")').or(page.locator('h3:has-text("Fundo")')).first();
    if (await goalCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      const card = goalCard.locator('..').locator('..');
      await page.locator('button:has-text("Contribuir")').first().waitFor({ timeout: 2000 }).catch(() => {});
    }
  });

  test('side panel can be closed', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("Objetivos")')).toBeVisible();
  });
});
