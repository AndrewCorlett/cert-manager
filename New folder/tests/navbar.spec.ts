import { test, expect } from '@playwright/test';

test.describe('FloatingNavBar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display collapsed navbar initially', async ({ page }) => {
    const navbar = page.locator('[class*="navbar-shadow"]');
    await expect(navbar).toBeVisible();
    
    // Check that navbar has 4 buttons
    const navbarButtons = navbar.locator('button');
    await expect(navbarButtons).toHaveCount(4);
  });

  test('should expand when list icon is clicked', async ({ page }) => {
    const navbar = page.locator('[class*="navbar-shadow"]');
    
    // Click the second navbar button (List icon)
    await navbar.locator('button').nth(1).click();
    
    // Wait for expansion animation
    await page.waitForTimeout(500);
    
    // Check if FileTree content is visible in the expanded panel
    await expect(page.getByText('STCW').first()).toBeVisible();
    await expect(page.getByText('OPITO').first()).toBeVisible();
  });

  test('should show send panel when send icon is clicked', async ({ page }) => {
    const navbar = page.locator('[class*="navbar-shadow"]');
    
    // Click the third navbar button (Send icon)
    await navbar.locator('button').nth(2).click();
    
    // Wait for expansion animation
    await page.waitForTimeout(500);
    
    // Check if send options are visible
    await expect(page.getByText('Send Options')).toBeVisible();
    await expect(page.getByText('This Document Only')).toBeVisible();
    await expect(page.getByText('Select Multiple').first()).toBeVisible();
  });

  test('should show settings panel when settings icon is clicked', async ({ page }) => {
    const navbar = page.locator('[class*="navbar-shadow"]');
    
    // Click the fourth navbar button (Settings icon)
    await navbar.locator('button').nth(3).click();
    
    // Wait for expansion animation
    await page.waitForTimeout(500);
    
    // Check if settings content is visible (home mode)
    await expect(page.getByText('My Account')).toBeVisible();
    await expect(page.getByText('Google Email')).toBeVisible();
    await expect(page.getByText('Notifications')).toBeVisible();
  });

  test('should have navbar height changes on expand/collapse', async ({ page }) => {
    const navbar = page.locator('[class*="navbar-shadow"]');
    
    // Record initial height
    const initialHeight = await navbar.evaluate(el => el.getBoundingClientRect().height);
    
    // Click to expand
    await navbar.locator('button').nth(1).click();
    
    // Wait for animation to complete
    await page.waitForTimeout(500);
    
    // Check expanded height is greater than initial
    const expandedHeight = await navbar.evaluate(el => el.getBoundingClientRect().height);
    expect(expandedHeight).toBeGreaterThan(initialHeight);
    
    // Click to collapse
    await navbar.locator('button').nth(1).click();
    await page.waitForTimeout(500);
    
    // Check height returns closer to initial
    const collapsedHeight = await navbar.evaluate(el => el.getBoundingClientRect().height);
    expect(collapsedHeight).toBeLessThan(expandedHeight);
  });
});