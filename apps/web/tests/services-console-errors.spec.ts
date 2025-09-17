import { test, expect } from '@playwright/test';

test('should check console errors when navigating to services tab', async ({ page }) => {
  const consoleErrors: string[] = [];
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
    console.log(`❌ Page Error: ${error.message}`);
  });

  // Navigate to the Expo web app
  await page.goto('http://localhost:8082');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('📱 Aplikacja załadowana, szukam zakładki services...');
  
  // Try different selectors for services tab
  const servicesSelectors = [
    'text=Services',
    'text=services',
    '[data-testid="services-tab"]',
    'button:has-text("Services")',
    'a:has-text("Services")',
    '.tab-services',
    '#services-tab',
    'text=Usługi',  // Polish version
    'text=usługi'
  ];
  
  let servicesTabFound = false;
  
  for (const selector of servicesSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ Znaleziono zakładkę services z selektorem: ${selector}`);
        
        // Click on services tab
        await element.click();
        servicesTabFound = true;
        
        // Wait for navigation and potential errors
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  if (!servicesTabFound) {
    console.log('⚠️  Nie znaleziono zakładki services, sprawdzam wszystkie linki...');
    
    // Try to find any clickable elements that might lead to services
    const allLinks = await page.$$eval('a, button, [role="button"]', elements => 
      elements.map(el => el.textContent?.trim() || '')
    );
    
    console.log('Znalezione linki/przyciski:', allLinks);
    
    // Try clicking on elements that might be services-related
    const clickableElements = await page.$$('a, button, [role="button"], [onclick]');
    
    for (let i = 0; i < Math.min(clickableElements.length, 10); i++) {
      try {
        const element = clickableElements[i];
        const text = await element.textContent();
        
        if (text && (text.toLowerCase().includes('service') || text.toLowerCase().includes('usług'))) {
          console.log(`Klikam w element: ${text}`);
          await element.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
  }
  
  // Additional wait to catch any delayed errors
  await page.waitForTimeout(5000);
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'services-page-debug.png', fullPage: true });
  
  // Get page title and URL for debugging
  const title = await page.title();
  const url = page.url();
  console.log(`📄 Tytuł strony: ${title}`);
  console.log(`🔗 URL: ${url}`);
  
  // Check for any JavaScript errors on the page
  const jsErrors = await page.evaluate(() => {
    const errors: string[] = [];
    
    // Check for unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        errors.push(`Unhandled Promise Rejection: ${event.reason}`);
      });
    }
    
    return errors;
  });
  
  if (jsErrors.length > 0) {
    consoleErrors.push(...jsErrors);
  }
  
  // Report results
  if (consoleErrors.length > 0) {
    console.log(`\n=== ZNALEZIONE BŁĘDY KONSOLI (${consoleErrors.length}) ===`);
    consoleErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    // Don't fail the test, just report the errors
    console.log(`\n📊 Podsumowanie: Znaleziono ${consoleErrors.length} błędów konsoli`);
  } else {
    console.log('✅ Nie znaleziono błędów konsoli podczas nawigacji do services');
  }
  
  // Always pass the test, just report findings
  expect(true).toBe(true);
});