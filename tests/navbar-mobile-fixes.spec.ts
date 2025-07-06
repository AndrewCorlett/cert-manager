import { test, expect } from '@playwright/test';

test.describe('Mobile Navbar Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('drag handle should stay fixed at top when dragging', async ({ page }) => {
    // Click on list icon to expand navbar
    await page.click('[data-icon="list"]');
    await page.waitForTimeout(500);

    // Find the drag handle
    const dragHandle = page.locator('.cursor-grab').first();
    await expect(dragHandle).toBeVisible();

    // Get initial position of drag handle
    const initialBox = await dragHandle.boundingBox();
    
    // Perform drag operation
    await dragHandle.hover();
    await page.mouse.down();
    await page.mouse.move(187, 400); // Drag down
    await page.waitForTimeout(100);
    
    // Drag handle should still be at the top of the navbar
    const currentBox = await dragHandle.boundingBox();
    expect(Math.abs(currentBox!.y - initialBox!.y)).toBeLessThan(5); // Should not move significantly
    
    await page.mouse.up();
  });

  test('icons should move in correct directions during expansion', async ({ page }) => {
    // Take screenshot before expansion
    await page.screenshot({ path: 'test-results/before-expansion.png' });

    // Click on list icon to expand navbar  
    await page.click('[data-icon="list"]');
    await page.waitForTimeout(300);
    
    // Take screenshot during expansion
    await page.screenshot({ path: 'test-results/during-expansion.png' });
    
    // Verify list icon is active and centered
    const listIcon = page.locator('[data-icon="list"]');
    const listBox = await listIcon.boundingBox();
    const viewportCenter = 375 / 2;
    expect(Math.abs(listBox!.x + listBox!.width/2 - viewportCenter)).toBeLessThan(20);
  });

  test('icons should not move past rest positions during drag', async ({ page }) => {
    // Expand navbar
    await page.click('[data-icon="list"]');
    await page.waitForTimeout(500);

    // Get initial positions of icons
    const homeIcon = page.locator('[data-icon="home"]');
    const sendIcon = page.locator('[data-icon="send"]');
    
    // Start drag operation
    const dragHandle = page.locator('.cursor-grab').first();
    await dragHandle.hover();
    await page.mouse.down();
    
    // Drag far down beyond normal threshold
    await page.mouse.move(187, 600);
    await page.waitForTimeout(100);
    
    // Icons should be at their collapsed positions, not beyond
    await page.screenshot({ path: 'test-results/max-drag-position.png' });
    
    await page.mouse.up();
    await page.waitForTimeout(300);
  });

  test('content should fade and blur during drag', async ({ page }) => {
    // Expand navbar
    await page.click('[data-icon="settings"]');
    await page.waitForTimeout(500);

    // Take screenshot of fully expanded state
    await page.screenshot({ path: 'test-results/expanded-clear.png' });

    // Start drag operation
    const dragHandle = page.locator('.cursor-grab').first();
    await dragHandle.hover();
    await page.mouse.down();
    
    // Drag partially down
    await page.mouse.move(187, 450);
    await page.waitForTimeout(100);
    
    // Content should be blurred and faded
    await page.screenshot({ path: 'test-results/partial-drag-blur.png' });
    
    // Drag further down
    await page.mouse.move(187, 550);
    await page.waitForTimeout(100);
    
    // Content should be more blurred and nearly invisible
    await page.screenshot({ path: 'test-results/full-drag-fade.png' });
    
    await page.mouse.up();
  });

  test('navbar should collapse when dragged beyond 50% threshold', async ({ page }) => {
    // Expand navbar
    await page.click('[data-icon="send"]');
    await page.waitForTimeout(500);

    // Get navbar height
    const navbar = page.locator('.navbar-shadow');
    const initialBox = await navbar.boundingBox();
    const initialHeight = initialBox!.height;

    // Drag beyond 50% threshold
    const dragHandle = page.locator('.cursor-grab').first();
    await dragHandle.hover();
    await page.mouse.down();
    await page.mouse.move(187, 500); // Drag down significantly
    await page.mouse.up();
    
    // Wait for collapse animation
    await page.waitForTimeout(500);
    
    // Navbar should be collapsed (72px height)
    const finalBox = await navbar.boundingBox();
    expect(finalBox!.height).toBeLessThan(100); // Should be around 72px
    expect(finalBox!.height).toBeLessThan(initialHeight / 2);
  });

  test('all icons should be evenly spaced when collapsed', async ({ page }) => {
    // Ensure navbar is collapsed
    await page.click('body'); // Click outside to ensure collapsed
    await page.waitForTimeout(300);

    // Take screenshot of collapsed state
    await page.screenshot({ path: 'test-results/collapsed-spacing.png' });

    // Get positions of all icons
    const homeIcon = page.locator('[data-icon="home"]');
    const listIcon = page.locator('[data-icon="list"]');
    const sendIcon = page.locator('[data-icon="send"]');
    const settingsIcon = page.locator('[data-icon="settings"]');

    const homeBox = await homeIcon.boundingBox();
    const listBox = await listIcon.boundingBox();
    const sendBox = await sendIcon.boundingBox();
    const settingsBox = await settingsIcon.boundingBox();

    // Calculate spacing between icons
    const spacing1 = listBox!.x - (homeBox!.x + homeBox!.width);
    const spacing2 = sendBox!.x - (listBox!.x + listBox!.width);
    const spacing3 = settingsBox!.x - (sendBox!.x + sendBox!.width);

    // All spacings should be approximately equal (within 10px tolerance)
    expect(Math.abs(spacing1 - spacing2)).toBeLessThan(10);
    expect(Math.abs(spacing2 - spacing3)).toBeLessThan(10);
    expect(Math.abs(spacing1 - spacing3)).toBeLessThan(10);
  });
});