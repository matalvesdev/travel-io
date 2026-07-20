import { test as base, expect, type Page } from '@playwright/test';

const MOCK_TOKEN = 'e2e-mock-token';
const MOCK_USER = JSON.stringify({
  id: 'e2e-test-user',
  email: 'test@travelio.dev',
  name: 'Test User',
});

/**
 * Bypass auth by injecting mock credentials.
 * Sets cookie (for middleware), localStorage (for hydrate fallback),
 * and intercepts Supabase to return a fake session.
 */
export async function login(page: Page): Promise<void> {
  // 1. Set cookie so middleware allows navigation
  await page.context().addCookies([{
    name: 'accessToken',
    value: MOCK_TOKEN,
    domain: 'localhost',
    path: '/',
  }]);

  // 2. Set localStorage so hydrate() finds the token
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', user);
  }, { token: MOCK_TOKEN, user: MOCK_USER });

  // 3. Intercept Supabase auth calls to return fake session
  await page.route('**/auth/v1/**', async (route) => {
    const url = route.request().url();

    // getSession / getUser → return fake session
    if (url.includes('/session') || url.includes('/user')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: MOCK_TOKEN,
          user: {
            id: 'e2e-test-user',
            email: 'test@travelio.dev',
            user_metadata: { name: 'Test User' },
          },
        }),
      });
      return;
    }

    // Let other auth calls pass through
    await route.continue();
  });
}

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
});

export { expect };
