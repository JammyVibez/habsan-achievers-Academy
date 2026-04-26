import { test, expect } from '@playwright/test';

test.describe('public pages', () => {
  test('home page renders hero heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('gallery page shows title', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.getByRole('heading', { name: /school gallery/i })).toBeVisible();
  });

  test('login page shows welcome card', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome Back')).toBeVisible();
  });
});
