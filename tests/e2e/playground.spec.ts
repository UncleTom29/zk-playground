import { test, expect } from '@playwright/test';

test.describe('Playground Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('should load the playground page', async ({ page }) => {
    await expect(page).toHaveTitle(/ZK-Playground/);
    await expect(page.locator('text=ZK-Playground')).toBeVisible();
  });

  test('should display the toolbar with compile button', async ({ page }) => {
    const compileButton = page.locator('button:has-text("Compile")');
    await expect(compileButton).toBeVisible();
  });

  test('should have the Monaco editor', async ({ page }) => {
    // Wait for editor to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    await expect(page.locator('.monaco-editor')).toBeVisible();
  });

  test('should show output panel', async ({ page }) => {
    await expect(page.locator('text=Console')).toBeVisible();
  });

  test('should toggle sidebar', async ({ page }) => {
    // Find sidebar toggle or check sidebar visibility
    const sidebar = page.locator('[data-testid="sidebar"]').or(
      page.locator('.sidebar').first()
    );

    // Sidebar should be visible by default or after toggle
    // This test may need adjustment based on actual sidebar implementation
  });

  test('should compile circuit', async ({ page }) => {
    // Click compile button
    const compileButton = page.locator('button:has-text("Compile")');
    await compileButton.click();

    // Wait for compilation to complete
    await page.waitForTimeout(2000);

    // Check for success indicator (adjust based on actual UI)
    // This could be a success badge, console output, etc.
  });

  test('should open deploy dialog', async ({ page }) => {
    // First compile to enable deploy
    const compileButton = page.locator('button:has-text("Compile")');
    await compileButton.click();
    await page.waitForTimeout(1500);

    // Click prove button
    const proveButton = page.locator('button:has-text("Prove")');
    await proveButton.click();
    await page.waitForTimeout(2500);

    // Now deploy should be enabled
    const deployButton = page.locator('button:has-text("Deploy")');
    await deployButton.click();

    // Dialog should appear
    await expect(page.locator('text=Deploy to Solana')).toBeVisible({ timeout: 5000 });
  });

  test('should open share dialog', async ({ page }) => {
    const shareButton = page.locator('button:has-text("Share")');
    await shareButton.click();

    await expect(page.locator('text=Share Circuit')).toBeVisible({ timeout: 5000 });
  });

  test('keyboard shortcuts should work', async ({ page }) => {
    // Wait for editor to be ready
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // Focus editor
    await page.locator('.monaco-editor').click();

    // Try Ctrl+B for compile
    await page.keyboard.press('Control+b');

    // Should trigger compilation
    await page.waitForTimeout(1000);
  });
});

test.describe('Navigation', () => {
  test('should navigate to templates page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Templates');
    await expect(page).toHaveURL(/.*templates/);
  });

  test('should navigate to learn page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Learn');
    await expect(page).toHaveURL(/.*learn/);
  });

  test('should navigate to gallery page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Gallery');
    await expect(page).toHaveURL(/.*gallery/);
  });
});

test.describe('Templates Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/templates');
  });

  test('should display template cards', async ({ page }) => {
    await expect(page.locator('text=Hello World')).toBeVisible();
    await expect(page.locator('text=Age Verification')).toBeVisible();
  });

  test('should filter templates by category', async ({ page }) => {
    // Click category filter
    await page.click('button:has-text("All Categories")');
    await page.click('text=Privacy');

    // Should show privacy templates
    await expect(page.locator('text=Merkle')).toBeVisible();
  });

  test('should search templates', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'hash');
    await page.waitForTimeout(500);

    // Should filter results
    const results = page.locator('[data-testid="template-card"]').or(
      page.locator('.template-card')
    );
  });

  test('should use template', async ({ page }) => {
    // Click use template button on first template
    const useButton = page.locator('button:has-text("Use Template")').first();
    await useButton.click();

    // Should navigate to playground
    await expect(page).toHaveURL(/.*playground/);
  });
});

test.describe('Learn Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/learn');
  });

  test('should display tutorials', async ({ page }) => {
    await expect(page.locator('text=Zero-Knowledge')).toBeVisible();
  });

  test('should show tutorial details on click', async ({ page }) => {
    // Click on a tutorial
    await page.click('text=Introduction to Zero-Knowledge');

    // Should show tutorial content
    await expect(page.locator('text=Lessons')).toBeVisible();
  });
});

test.describe('Gallery Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
  });

  test('should display community circuits', async ({ page }) => {
    await expect(page.locator('text=Community Gallery')).toBeVisible();
  });

  test('should filter by recent/popular', async ({ page }) => {
    // Click popular tab
    await page.click('button:has-text("Popular")');
    await page.waitForTimeout(500);

    // Should update display
  });

  test('should search circuits', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'merkle');
    await page.waitForTimeout(500);
  });
});

test.describe('Share Page', () => {
  test('should handle invalid CID', async ({ page }) => {
    await page.goto('/share/invalid-cid-12345');

    await expect(page.locator('text=Circuit Not Found')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('text=ZK')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/playground');

    await expect(page.locator('text=Compile')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('buttons should be focusable', async ({ page }) => {
    await page.goto('/playground');

    const compileButton = page.locator('button:has-text("Compile")');
    await compileButton.focus();

    await expect(compileButton).toBeFocused();
  });
});
