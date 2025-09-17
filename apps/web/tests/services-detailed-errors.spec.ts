import { test, expect } from '@playwright/test';

test('should capture detailed console errors from services tab', async ({ page }) => {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const consoleLogs: string[] = [];
  
  // Capture all console messages
  page.on('console', msg => {
    const text = msg.text();
    
    if (msg.type() === 'error') {
      consoleErrors.push(text);
      console.log(`❌ ERROR: ${text}`);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(text);
      console.log(`⚠️  WARNING: ${text}`);
    } else {
      consoleLogs.push(text);
      console.log(`ℹ️  LOG: ${text}`);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
    console.log(`❌ PAGE ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  });

  // Navigate to the Expo web app
  await page.goto('http://localhost:8082');
  
  // Wait for initial load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  console.log('📱 Aplikacja załadowana, sprawdzam stan...');
  
  // Take screenshot of initial state
  await page.screenshot({ path: 'initial-state.png', fullPage: true });
  
  // Try to find and click on services tab
  const servicesSelectors = [
    'text=Services',
    'text=services', 
    'text=Usługi',
    'text=usługi',
    'button:has-text("Services")',
    'a:has-text("Services")',
    '[data-testid*="service"]',
    '.tab:has-text("Services")'
  ];
  
  let servicesClicked = false;
  
  for (const selector of servicesSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ Znaleziono element z selektorem: ${selector}`);
        await element.click();
        servicesClicked = true;
        
        // Wait for navigation and potential errors
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Take screenshot after clicking services
        await page.screenshot({ path: 'after-services-click.png', fullPage: true });
        
        break;
      }
    } catch (e) {
      console.log(`Nie udało się kliknąć selektora: ${selector}`);
    }
  }
  
  if (!servicesClicked) {
    console.log('⚠️  Nie znaleziono zakładki services, sprawdzam wszystkie elementy klikalne...');
    
    // Get all clickable elements and try to find services-related ones
    const allClickables = await page.$$eval('a, button, [role="button"], [onclick]', elements => 
      elements.map(el => ({
        text: el.textContent?.trim() || '',
        tagName: el.tagName,
        className: el.className
      }))
    );
    
    console.log('Wszystkie elementy klikalne:', allClickables);
    
    // Try to click on elements that might be services
    for (const clickable of allClickables.slice(0, 10)) {
      if (clickable.text.toLowerCase().includes('service') || 
          clickable.text.toLowerCase().includes('usług')) {
        try {
          await page.click(`:text("${clickable.text}")`);
          console.log(`Kliknięto w: ${clickable.text}`);
          await page.waitForTimeout(3000);
          break;
        } catch (e) {
          console.log(`Nie udało się kliknąć w: ${clickable.text}`);
        }
      }
    }
  }
  
  // Additional wait to catch all errors
  await page.waitForTimeout(5000);
  
  // Get page info
  const title = await page.title();
  const url = page.url();
  console.log(`📄 Tytuł: ${title}`);
  console.log(`🔗 URL: ${url}`);
  
  // Generate detailed report
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPORT BŁĘDÓW KONSOLI');
  console.log('='.repeat(60));
  
  console.log(`\n❌ BŁĘDY (${consoleErrors.length}):`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  } else {
    console.log('Brak błędów');
  }
  
  console.log(`\n⚠️  OSTRZEŻENIA (${consoleWarnings.length}):`);
  if (consoleWarnings.length > 0) {
    consoleWarnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  } else {
    console.log('Brak ostrzeżeń');
  }
  
  console.log(`\nℹ️  LOGI (${consoleLogs.length}):`);
  if (consoleLogs.length > 0) {
    // Show only important logs
    const importantLogs = consoleLogs.filter(log => 
      log.includes('error') || 
      log.includes('Error') || 
      log.includes('failed') ||
      log.includes('Failed') ||
      log.includes('timeout') ||
      log.includes('Timeout') ||
      log.includes('CORS') ||
      log.includes('Network')
    );
    
    if (importantLogs.length > 0) {
      importantLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    } else {
      console.log('Brak ważnych logów');
    }
  } else {
    console.log('Brak logów');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 PODSUMOWANIE');
  console.log('='.repeat(60));
  console.log(`Błędy: ${consoleErrors.length}`);
  console.log(`Ostrzeżenia: ${consoleWarnings.length}`);
  console.log(`Logi: ${consoleLogs.length}`);
  
  // Check for specific known issues
  const hasHooksError = consoleErrors.some(error => 
    error.includes('Rendered more hooks') || 
    error.includes('Rules of Hooks')
  );
  
  const hasCORSError = consoleErrors.some(error => 
    error.includes('CORS') || 
    error.includes('Same Origin Policy')
  );
  
  const hasTimeoutError = consoleErrors.some(error => 
    error.includes('timeout') || 
    error.includes('Timeout')
  );
  
  if (hasHooksError) {
    console.log('\n🔴 WYKRYTO BŁĄD HOOKS - ServicesScreen ma problem z kolejnością hooków');
  }
  
  if (hasCORSError) {
    console.log('\n🔴 WYKRYTO BŁĄD CORS - Problem z dostępem do API');
  }
  
  if (hasTimeoutError) {
    console.log('\n🔴 WYKRYTO BŁĄD TIMEOUT - Problem z czasem oczekiwania na odpowiedź');
  }
  
  // Test always passes - we're just collecting information
  expect(true).toBe(true);
});