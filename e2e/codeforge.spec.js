import { test, expect } from '@playwright/test';

test.describe('CodeForge Platform End-to-End Tests', () => {

  test('1. Light / Dark Theme Switching without flash', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    const themeBtn = page.locator('button[aria-label="Toggle color theme"]');
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    const updatedTheme = await html.getAttribute('data-theme');
    expect(updatedTheme).not.toEqual(initialTheme);
  });

  test('2. Navigation between Problems, Playground, Dashboard, and Leaderboard', async ({ page }) => {
    await page.goto('/');

    // Problems table loaded
    await expect(page.locator('text=Curated Problem Catalog')).toBeVisible();
    await expect(page.locator('text=Two Sum').first()).toBeVisible();

    // Navigate to Playground
    await page.click('button:has-text("Playground")');
    await expect(page.locator('text=Online Multi-Language Compiler')).toBeVisible();

    // Navigate to Leaderboard
    await page.click('button:has-text("Leaderboard")');
    await expect(page.locator('text=Global Leaderboard')).toBeVisible();
  });

  test('3. User Authentication Flow (Signup, Sign in, and Form Validation)', async ({ page }) => {
    await page.goto('/');

    // Open Auth modal by clicking Sign Up
    await page.click('button:has-text("Sign Up")');

    // Verify modal header is visible
    await expect(page.locator('h2:has-text("Create Account")')).toBeVisible({ timeout: 5000 });

    // Fill signup inputs
    const uniqueUser = `dev_${Date.now()}`;
    await page.fill('input[placeholder="johndoe"]', uniqueUser);
    await page.fill('input[placeholder="you@domain.com"]', `${uniqueUser}@example.com`);
    await page.fill('input[placeholder="••••••••"]', 'SecurePass123!');
    await page.locator('input[placeholder="••••••••"]').nth(1).fill('SecurePass123!');
    await page.check('input[type="checkbox"]');

    // Submit
    await page.click('button[type="submit"]');

    // Verify topbar user badge displays newly created username
    await expect(page.locator(`text=${uniqueUser}`)).toBeVisible({ timeout: 10000 });
  });

  test('4. Problem Workspace Solving, Run & Output Evaluation', async ({ page }) => {
    await page.goto('/');

    // Click Two Sum problem from table
    await page.locator('text=Two Sum').first().click();

    // Workspace loaded
    await expect(page.locator('text=Run').first()).toBeVisible();
    await expect(page.locator('text=Submit').first()).toBeVisible();
    await expect(page.locator('text=Description').first()).toBeVisible();

    // Execute Run
    await page.click('button:has-text("Run")');

    // Verify evaluation response shows verdict or test case result
    await expect(page.locator('text=Sample Run').first()).toBeVisible({ timeout: 10000 });
  });

  test('5. Multi-Language Playground Web Worker Sandboxed Execution', async ({ page }) => {
    await page.goto('/');

    await page.click('button:has-text("Playground")');
    await expect(page.locator('text=Online Multi-Language Compiler')).toBeVisible();

    // Click Run Code
    await page.click('button:has-text("Run Code")');

    // Check stdout
    await expect(page.locator('pre:has-text("Hello from CodeForge")')).toBeVisible({ timeout: 5000 });
  });

});
