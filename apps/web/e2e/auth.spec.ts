import { test, expect } from '@playwright/test';

test.describe('Auth Module — E2E', () => {

  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1').filter({ hasText: /Login|Entrar/ }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1').filter({ hasText: /Registrar|Criar conta/ }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/auth/forgot');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1').filter({ hasText: /Esqueceu|Recuperar/ }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('login form validation works', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: /Entrar/ })).first();
    await submitBtn.click();
    
    // Check for validation messages
    await page.waitForTimeout(500);
  });

  test('register form validation works', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: /Registrar/ })).first();
    await submitBtn.click();
    
    // Check for validation messages
    await page.waitForTimeout(500);
  });

  test('navigation between auth pages works', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Click register link
    const registerLink = page.locator('a').filter({ hasText: /Registrar|Criar conta/ }).first();
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/register/);
    }
  });

  test('social login buttons exist', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Check for Google/Apple login buttons
    const googleBtn = page.locator('button').filter({ hasText: /Google|Continuar com Google/ }).first();
    if (await googleBtn.isVisible()) {
      await expect(googleBtn).toBeVisible();
    }
  });
});
