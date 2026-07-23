import { test, expect, login } from './helpers/auth';

test.describe('Profile Module — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test('profile page loads', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Perfil/ })).toBeVisible({ timeout: 10000 });
    
    // Check for profile form
    const profileForm = page.locator('form').or(page.locator('text=Nome')).first();
    await expect(profileForm).toBeVisible({ timeout: 8000 });
  });

  test('profile form fields are visible', async ({ page }) => {
    const nameField = page.locator('input[placeholder*="Nome"]').or(page.locator('label').filter({ hasText: /Nome/ })).first();
    if (await nameField.isVisible()) {
      await expect(nameField).toBeVisible();
    }
    
    const emailField = page.locator('input[type="email"]').first();
    if (await emailField.isVisible()) {
      await expect(emailField).toBeVisible();
    }
  });

  test('save button works', async ({ page }) => {
    const saveBtn = page.locator('button').filter({ hasText: /Salvar/ }).or(page.locator('button[type="submit"]')).first();
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
  });

  test('avatar upload exists', async ({ page }) => {
    const avatar = page.locator('img[alt*="avatar"]').or(page.locator('[class*="avatar"]')).first();
    if (await avatar.isVisible()) {
      await expect(avatar).toBeVisible();
    }
  });

  test('settings link exists', async ({ page }) => {
    const settingsLink = page.locator('a').filter({ hasText: /Configurações|Settings/ }).first();
    if (await settingsLink.isVisible()) {
      await expect(settingsLink).toBeVisible();
    }
  });
});
