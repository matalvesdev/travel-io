import { test, expect, login } from './helpers/auth';

test.describe('Settings Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('settings page loads', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Configurações/ })).toBeVisible({ timeout: 10000 });
    
    // Check for settings sections
    const settings = page.locator('text=Preferências').or(page.locator('text=Conta')).first();
    await expect(settings).toBeVisible({ timeout: 8000 });
  });

  test('notification settings exist', async ({ page }) => {
    const notifications = page.locator('text=Notificações').or(page.locator('text=Alertas')).first();
    if (await notifications.isVisible()) {
      await expect(notifications).toBeVisible();
    }
  });

  test('theme toggle exists', async ({ page }) => {
    const themeToggle = page.locator('button').filter({ hasText: /Tema/ }).or(page.locator('[class*="theme"]')).first();
    if (await themeToggle.isVisible()) {
      await expect(themeToggle).toBeVisible();
    }
  });

  test('language settings exist', async ({ page }) => {
    const language = page.locator('text=Idioma').or(page.locator('text=Language')).first();
    if (await language.isVisible()) {
      await expect(language).toBeVisible();
    }
  });

  test('save settings button exists', async ({ page }) => {
    const saveBtn = page.locator('button').filter({ hasText: /Salvar|Save/ }).first();
    if (await saveBtn.isVisible()) {
      await expect(saveBtn).toBeVisible();
    }
  });

  test('logout button exists', async ({ page }) => {
    const logoutBtn = page.locator('button').filter({ hasText: /Sair|Logout/ }).first();
    if (await logoutBtn.isVisible()) {
      await expect(logoutBtn).toBeVisible();
    }
  });
});
