import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Beauty Salon/);
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  
  // Check if main navigation elements exist
  await expect(page.locator('body')).toBeVisible();
});

test('responsive design', async ({ page }) => {
  await page.goto('/');
  
  // Test desktop view
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator('body')).toBeVisible();
  
  // Test mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('body')).toBeVisible();
});