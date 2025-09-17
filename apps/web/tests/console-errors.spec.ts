import { test, expect } from '@playwright/test';

test.describe('Console Errors Check', () => {
  test('should check for console errors on localhost:8081', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error(`Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
      console.error(`Page Error: ${error.message}`);
    });

    // Navigate to localhost:8082 (Expo)
    await page.goto('http://localhost:8082');
    
    // Wait a bit for the page to load and any potential errors to appear
    await page.waitForTimeout(5000);
    
    // Check if there are any console errors
    if (consoleErrors.length > 0) {
      console.log(`\n=== CONSOLE ERRORS FOUND (${consoleErrors.length}) ===`);
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      
      // Fail the test if there are console errors
      expect(consoleErrors.length, `Found ${consoleErrors.length} console errors`).toBe(0);
    } else {
      console.log('✅ No console errors found');
    }
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'localhost-8081-status.png', fullPage: true });
  });

  test('should check Expo web interface', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error(`Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
      console.error(`Page Error: ${error.message}`);
    });

    // Try to access the Expo web interface
    await page.goto('http://localhost:8082');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we can see Expo-related content
    const expoContent = await page.locator('body').textContent();
    console.log('Page content preview:', expoContent?.substring(0, 200) + '...');
    
    // Wait a bit more for any dynamic content/errors
    await page.waitForTimeout(3000);
    
    if (consoleErrors.length > 0) {
      console.log(`\n=== EXPO INTERFACE CONSOLE ERRORS (${consoleErrors.length}) ===`);
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors found in Expo interface');
    }
  });
});